package com.isellastore.member.dto;

import jakarta.validation.constraints.*;

/** 회원가입 요청. 비밀번호 규칙은 NIST SP 800-63B: 8자 이상, 문자 조합 강제 없음, 긴 문장 허용 */
public record SignupForm(
        @NotBlank(message = "이메일을 입력해 주세요") @Email(message = "이메일 형식이 아닙니다") @Size(max = 254) String email,
        @NotNull @Size(min = 8, max = 128, message = "비밀번호는 8~128자로 입력해 주세요") String password,
        @AssertTrue(message = "개인정보 수집·이용에 동의해야 가입할 수 있습니다") boolean agreePrivacy,
        /** 비우면 서버가 자동 생성. 가입 화면은 추천 닉네임을 미리 채워 보낸다 */
        @Size(max = 20) String nickname,
        String lang
) {}
