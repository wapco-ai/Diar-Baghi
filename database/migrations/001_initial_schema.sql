CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS survey;

CREATE TABLE survey.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(120) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE survey.survey_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL
        REFERENCES survey.surveys(id)
        ON DELETE CASCADE,
    version_number INTEGER NOT NULL
        CHECK (version_number > 0),
    title VARCHAR(250) NOT NULL,
    intro_text TEXT,
    closing_text TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published', 'retired')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (survey_id, version_number)
);

CREATE TABLE survey.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_version_id UUID NOT NULL
        REFERENCES survey.survey_versions(id)
        ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    prompt TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL
        CHECK (
            question_type IN (
                'single_choice',
                'multiple_choice',
                'short_text',
                'long_text',
                'number',
                'boolean',
                'date'
            )
        ),
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (survey_version_id, code)
);

CREATE TABLE survey.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL
        REFERENCES survey.questions(id)
        ON DELETE CASCADE,
    value VARCHAR(120) NOT NULL,
    label VARCHAR(250) NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (question_id, value)
);

CREATE TABLE survey.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_version_id UUID NOT NULL
        REFERENCES survey.survey_versions(id),
    status VARCHAR(20) NOT NULL DEFAULT 'submitted'
        CHECK (status IN ('draft', 'submitted', 'invalid')),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE survey.answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL
        REFERENCES survey.responses(id)
        ON DELETE CASCADE,
    question_id UUID NOT NULL
        REFERENCES survey.questions(id),
    answer_value JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (response_id, question_id)
);

CREATE INDEX idx_survey_versions_survey_id
    ON survey.survey_versions (survey_id);

CREATE INDEX idx_questions_version_sort
    ON survey.questions (survey_version_id, sort_order);

CREATE INDEX idx_question_options_question_sort
    ON survey.question_options (question_id, sort_order);

CREATE INDEX idx_responses_version_submitted
    ON survey.responses (survey_version_id, submitted_at DESC);

CREATE INDEX idx_answers_response_id
    ON survey.answers (response_id);
