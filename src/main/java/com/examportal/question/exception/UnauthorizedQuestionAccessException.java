package com.examportal.question.exception;

public class UnauthorizedQuestionAccessException extends RuntimeException {
    public UnauthorizedQuestionAccessException(String message) {
        super(message);
    }
}

