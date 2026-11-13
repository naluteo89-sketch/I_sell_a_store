package com.isellastore.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginForm(
        @NotBlank(message = "이메일을 입력해 주세요") @Size(max = 254) String email,
        @NotBlank(message = "비밀번호를 입력해 주세요") @Size(max = 128) String password,
        boolean remember
) {}
