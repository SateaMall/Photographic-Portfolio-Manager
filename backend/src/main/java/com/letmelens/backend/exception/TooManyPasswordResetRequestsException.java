package com.letmelens.backend.exception;

public class TooManyPasswordResetRequestsException extends RuntimeException {
    public TooManyPasswordResetRequestsException(String message) {
        super(message);
    }
}
