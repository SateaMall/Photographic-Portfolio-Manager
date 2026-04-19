package com.letmelens.backend.exception;

public class TooManyVerificationCodeRequestsException extends RuntimeException {
    public TooManyVerificationCodeRequestsException(String message) {
        super(message);
    }
}
