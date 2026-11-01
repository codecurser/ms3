-- V1: Create questions and options tables with proper indexing

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY,
    exam_id UUID NOT NULL,
    creator_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(32) NOT NULL,
    points INT NOT NULL DEFAULT 1,
    order_index INT NOT NULL DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS options (
    id UUID PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    order_index INT NOT NULL DEFAULT 0
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions (exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_creator_id ON questions (creator_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_order ON questions (exam_id, order_index);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options (question_id);
CREATE INDEX IF NOT EXISTS idx_options_question_order ON options (question_id, order_index);

