import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import feedbackLogo from '../assets/images/logo4.png';

const SURVEY_SLUG = 'mashhad-citizen-satisfaction';

function hasValue(value) {
  return (
    value !== undefined &&
    value !== null &&
    !(typeof value === 'string' && value.trim() === '')
  );
}

function MainSurveyPanel({ onBackToHome }) {
  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadSurvey() {
      try {
        const response = await fetch(
          `/api/surveys/${SURVEY_SLUG}`,
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              'دریافت اطلاعات نظرسنجی با خطا مواجه شد.',
          );
        }

        if (mounted) {
          setSurvey(result.survey);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSurvey();

    return () => {
      mounted = false;
    };
  }, []);

  const requiredQuestions = useMemo(
    () =>
      survey?.questions.filter(
        (question) => question.required,
      ) ?? [],
    [survey],
  );

  const answeredCount = requiredQuestions.filter(
    (question) => hasValue(answers[question.id]),
  ).length;

  const progress =
    requiredQuestions.length > 0
      ? Math.round(
          (answeredCount / requiredQuestions.length) * 100,
        )
      : 0;

  const setAnswer = (questionId, value) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    const missingQuestion = requiredQuestions.find(
      (question) => !hasValue(answers[question.id]),
    );

    if (missingQuestion) {
      toast.error(
        'لطفاً به تمام سؤال‌های الزامی پاسخ دهید.',
      );

      document
        .getElementById(
          `survey-question-${missingQuestion.id}`,
        )
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });

      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        answers: survey.questions
          .filter((question) =>
            hasValue(answers[question.id]),
          )
          .map((question) => ({
            questionId: question.id,
            value:
              typeof answers[question.id] === 'string'
                ? answers[question.id].trim()
                : answers[question.id],
          })),
        metadata: {
          source: 'diar-baghi-main-page',
          locale: 'fa-IR',
          anonymous: true,
        },
      };

      const response = await fetch(
        `/api/surveys/${SURVEY_SLUG}/responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            'ثبت پاسخ نظرسنجی با خطا مواجه شد.',
        );
      }

      setSubmitted(true);
      toast.success('پاسخ شما با موفقیت ثبت شد.');

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (submitError) {
      toast.error(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="Mainpage-feedbackContainer">
        <div className="Mainpage-feedbackFormWrapper">
          <div className="Mainpage-feedbackForm">
            <p>در حال دریافت پرسش‌های نظرسنجی...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="Mainpage-feedbackContainer">
        <div className="Mainpage-feedbackFormWrapper">
          <div className="Mainpage-feedbackForm">
            <h2>دریافت نظرسنجی ممکن نشد</h2>
            <p>{error}</p>

            <button
              type="button"
              className="Mainpage-feedbackSubmitBtn"
              onClick={() => window.location.reload()}
            >
              تلاش دوباره
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="Mainpage-feedbackContainer">
      <div className="Mainpage-feedbackHero">
        <div className="Mainpage-feedbackHeroPattern" />

        <img
          src={feedbackLogo}
          alt="دیارباقی"
          className="Mainpage-feedbackLogo4"
        />
      </div>

      <div className="Mainpage-feedbackFormWrapper">
        <div className="Mainpage-feedbackForm">
          <div className="Mainpage-formTitle">
            <h2>{survey.title}</h2>
            <p>
              نظرات ارزشمند شما به بهبود خدمات ما کمک
              می‌کند
            </p>
          </div>

          {submitted ? (
            <div className="Mainpage-feedbackSuccess">
              <div className="Mainpage-surveySuccessIcon">
                ✓
              </div>

              <h2>از همراهی شما سپاسگزاریم</h2>

              <p>
                پاسخ شما با موفقیت و به‌صورت محرمانه ثبت
                شد.
              </p>

              {survey.closingText && (
                <div className="Mainpage-surveyClosingText">
                  {survey.closingText}
                </div>
              )}

              <button
                type="button"
                className="Mainpage-feedbackSubmitBtn"
                onClick={onBackToHome}
              >
                بازگشت به صفحه اصلی دیارباقی
              </button>
            </div>
          ) : (
            <>
              <div className="Mainpage-surveyProgress">
                <div>
                  پاسخ داده‌شده: {answeredCount} از{' '}
                  {requiredQuestions.length}
                </div>

                <div className="Mainpage-surveyProgressTrack">
                  <span
                    style={{
                      display: 'block',
                      width: `${progress}%`,
                      height: '100%',
                    }}
                  />
                </div>
              </div>

              {survey.questions.map((question, index) => (
                <div
                  key={question.id}
                  id={`survey-question-${question.id}`}
                  className="Mainpage-feedbackQuestion"
                >
                  <div className="Mainpage-questionNumber">
                    {index + 1}
                  </div>

                  <p className="Mainpage-questionText">
                    {question.prompt}
                    {question.required ? ' *' : ''}
                  </p>

                  {question.type === 'single_choice' && (
                    <div className="Mainpage-ratingOptions">
                      {question.options.map((option) => (
                        <label
                          key={option.id}
                          className={`Mainpage-ratingLabel ${
                            answers[question.id] ===
                            option.value
                              ? 'selected'
                              : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option.value}
                            checked={
                              answers[question.id] ===
                              option.value
                            }
                            onChange={() =>
                              setAnswer(
                                question.id,
                                option.value,
                              )
                            }
                            className="Mainpage-ratingRadio"
                          />

                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'long_text' && (
                    <textarea
                      className="Mainpage-feedbackTextarea"
                      placeholder="انتقاد، پیشنهاد یا مورد خاص خود را بنویسید..."
                      value={answers[question.id] || ''}
                      maxLength={5000}
                      rows={4}
                      onChange={(event) =>
                        setAnswer(
                          question.id,
                          event.target.value,
                        )
                      }
                    />
                  )}
                </div>
              ))}

              <button
                type="button"
                className="Mainpage-feedbackSubmitBtn"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? 'در حال ثبت پاسخ...'
                  : 'ثبت نهایی پاسخ‌ها'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MainSurveyPanel;
