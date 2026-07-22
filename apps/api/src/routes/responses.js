import { z } from 'zod';

const responseSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      value: z.unknown(),
    }),
  ).min(1),
  metadata: z.object({}).passthrough().optional(),
});

function hasAnswerValue(value) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

export async function responseRoutes(app, options) {
  const { pool } = options;

  app.post('/api/surveys/:slug/responses', async (request, reply) => {
    const validation = responseSchema.safeParse(request.body);

    if (!validation.success) {
      return reply.status(400).send({
        status: 'error',
        code: 'INVALID_REQUEST',
        message: 'ساختار پاسخ ارسالی معتبر نیست.',
        details: validation.error.flatten(),
      });
    }

    const { slug } = request.params;
    const { answers, metadata = {} } = validation.data;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const surveyResult = await client.query(
        `
        SELECT
            sv.id AS version_id
        FROM survey.surveys AS s
        JOIN survey.survey_versions AS sv
            ON sv.survey_id = s.id
        WHERE s.slug = $1
          AND s.status = 'published'
          AND sv.status = 'published'
        ORDER BY sv.version_number DESC
        LIMIT 1
        `,
        [slug],
      );

      if (surveyResult.rowCount === 0) {
        await client.query('ROLLBACK');

        return reply.status(404).send({
          status: 'error',
          code: 'SURVEY_NOT_FOUND',
          message: 'نظرسنجی منتشرشده پیدا نشد.',
        });
      }

      const versionId = surveyResult.rows[0].version_id;

      const questionsResult = await client.query(
        `
        SELECT
            q.id,
            q.question_type,
            q.is_required,
            COALESCE(
                ARRAY_AGG(qo.value ORDER BY qo.sort_order)
                    FILTER (WHERE qo.id IS NOT NULL),
                ARRAY[]::VARCHAR[]
            ) AS allowed_values
        FROM survey.questions AS q
        LEFT JOIN survey.question_options AS qo
            ON qo.question_id = q.id
        WHERE q.survey_version_id = $1
        GROUP BY q.id
        `,
        [versionId],
      );

      const questions = new Map(
        questionsResult.rows.map((question) => [
          question.id,
          question,
        ]),
      );

      const submittedAnswers = new Map();

      for (const answer of answers) {
        if (submittedAnswers.has(answer.questionId)) {
          await client.query('ROLLBACK');

          return reply.status(400).send({
            status: 'error',
            code: 'DUPLICATE_ANSWER',
            message: 'برای یک سؤال بیش از یک پاسخ ارسال شده است.',
          });
        }

        submittedAnswers.set(answer.questionId, answer.value);
      }

      for (const [questionId, value] of submittedAnswers) {
        const question = questions.get(questionId);

        if (!question) {
          await client.query('ROLLBACK');

          return reply.status(400).send({
            status: 'error',
            code: 'INVALID_QUESTION',
            message: 'یکی از سؤال‌های ارسال‌شده متعلق به این نظرسنجی نیست.',
          });
        }

        if (
          question.question_type === 'single_choice' &&
          (
            typeof value !== 'string' ||
            !question.allowed_values.includes(value)
          )
        ) {
          await client.query('ROLLBACK');

          return reply.status(400).send({
            status: 'error',
            code: 'INVALID_OPTION',
            message: 'گزینه انتخاب‌شده برای یکی از سؤال‌ها معتبر نیست.',
          });
        }

        if (
          question.question_type === 'long_text' &&
          (
            typeof value !== 'string' ||
            value.length > 5000
          )
        ) {
          await client.query('ROLLBACK');

          return reply.status(400).send({
            status: 'error',
            code: 'INVALID_TEXT_ANSWER',
            message: 'متن پاسخ معتبر نیست یا بیش از حد مجاز طول دارد.',
          });
        }
      }

      const missingRequiredQuestion = questionsResult.rows.find(
        (question) =>
          question.is_required &&
          !hasAnswerValue(submittedAnswers.get(question.id)),
      );

      if (missingRequiredQuestion) {
        await client.query('ROLLBACK');

        return reply.status(400).send({
          status: 'error',
          code: 'REQUIRED_ANSWER_MISSING',
          message: 'پاسخ‌دادن به تمام سؤال‌های الزامی ضروری است.',
          questionId: missingRequiredQuestion.id,
        });
      }

      const responseResult = await client.query(
        `
        INSERT INTO survey.responses (
            survey_version_id,
            status,
            metadata
        )
        VALUES ($1, 'submitted', $2::JSONB)
        RETURNING id, submitted_at
        `,
        [versionId, JSON.stringify(metadata)],
      );

      const responseRecord = responseResult.rows[0];

      for (const [questionId, value] of submittedAnswers) {
        if (!hasAnswerValue(value)) {
          continue;
        }

        await client.query(
          `
          INSERT INTO survey.answers (
              response_id,
              question_id,
              answer_value
          )
          VALUES ($1, $2, $3::JSONB)
          `,
          [
            responseRecord.id,
            questionId,
            JSON.stringify(value),
          ],
        );
      }

      await client.query('COMMIT');

      return reply.status(201).send({
        status: 'ok',
        message: 'پاسخ شما با موفقیت ثبت شد.',
        response: {
          id: responseRecord.id,
          submittedAt: responseRecord.submitted_at,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      request.log.error(error);

      return reply.status(500).send({
        status: 'error',
        code: 'RESPONSE_SUBMISSION_FAILED',
        message: 'ثبت پاسخ نظرسنجی با خطا مواجه شد.',
      });
    } finally {
      client.release();
    }
  });
}
