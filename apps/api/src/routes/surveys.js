export async function surveyRoutes(app, options) {
  const { pool } = options;

  app.get(
    '/api/surveys/:slug',
    {
      schema: {
        params: {
          type: 'object',
          required: ['slug'],
          properties: {
            slug: {
              type: 'string',
              minLength: 1,
              maxLength: 120,
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      try {
        const surveyResult = await pool.query(
          `
          SELECT
              s.id AS survey_id,
              s.slug,
              s.name,
              s.description,
              sv.id AS version_id,
              sv.version_number,
              sv.title,
              sv.intro_text,
              sv.closing_text,
              sv.settings,
              sv.published_at
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
          return reply.status(404).send({
            status: 'error',
            code: 'SURVEY_NOT_FOUND',
            message: 'نظرسنجی منتشرشده‌ای با این شناسه پیدا نشد.',
          });
        }

        const survey = surveyResult.rows[0];

        const questionsResult = await pool.query(
          `
          SELECT
              q.id,
              q.code,
              q.prompt,
              q.question_type,
              q.is_required,
              q.sort_order,
              q.settings,
              COALESCE(
                  JSONB_AGG(
                      JSONB_BUILD_OBJECT(
                          'id', qo.id,
                          'value', qo.value,
                          'label', qo.label,
                          'sortOrder', qo.sort_order
                      )
                      ORDER BY qo.sort_order
                  ) FILTER (WHERE qo.id IS NOT NULL),
                  '[]'::JSONB
              ) AS options
          FROM survey.questions AS q
          LEFT JOIN survey.question_options AS qo
              ON qo.question_id = q.id
          WHERE q.survey_version_id = $1
          GROUP BY q.id
          ORDER BY q.sort_order
          `,
          [survey.version_id],
        );

        return {
          status: 'ok',
          survey: {
            id: survey.survey_id,
            versionId: survey.version_id,
            slug: survey.slug,
            name: survey.name,
            description: survey.description,
            versionNumber: survey.version_number,
            title: survey.title,
            introText: survey.intro_text,
            closingText: survey.closing_text,
            settings: survey.settings,
            publishedAt: survey.published_at,
            questions: questionsResult.rows.map((question) => ({
              id: question.id,
              code: question.code,
              prompt: question.prompt,
              type: question.question_type,
              required: question.is_required,
              sortOrder: question.sort_order,
              settings: question.settings,
              options: question.options,
            })),
          },
        };
      } catch (error) {
        request.log.error(error);

        return reply.status(500).send({
          status: 'error',
          code: 'SURVEY_READ_FAILED',
          message: 'دریافت اطلاعات نظرسنجی با خطا مواجه شد.',
        });
      }
    },
  );
}
