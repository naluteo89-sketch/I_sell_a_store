package com.isellastore.global.error;

import java.time.Instant;

/** 모든 오류 응답의 공통 모양. 프론트는 message 를 그대로 보여준다. */
public record ErrorResponse(int status, String message, Instant timestamp) {
    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(status, message, Instant.now());
    }
}
