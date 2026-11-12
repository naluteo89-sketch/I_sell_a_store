package com.isellastore.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 결제 요청 (결제 수단: CARD, KAKAOPAY ...) */
public record PayForm(@NotBlank @Size(max = 30) String method) {
}
