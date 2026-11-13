package com.isellastore.member.controller;

import com.isellastore.global.error.ApiException;
import com.isellastore.member.domain.Member;
import com.isellastore.member.dto.LoginForm;
import com.isellastore.member.dto.MemberView;
import com.isellastore.member.dto.SignupForm;
import com.isellastore.member.service.MemberAuthService;
import com.isellastore.member.web.AuthSession;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 로그인 API (규격: frontend/docs/auth-api.md)
 * 프론트는 같은 출처(localhost:3000/api/auth/…)로 부르고 Next.js rewrites 가 여기로 넘긴다.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final MemberAuthService auth;

    public AuthController(MemberAuthService auth) {
        this.auth = auth;
    }

    /** XSRF-TOKEN 쿠키만 내려준다 (AuthCsrfInterceptor 가 GET 요청에 발급) */
    @GetMapping("/csrf")
    public ResponseEntity<Void> csrf() {
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public MemberView me(HttpServletRequest request) {
        Member member = auth.find(AuthSession.memberId(request));
        if (member == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다");
        return MemberView.of(member);
    }

    public record NicknameForm(String nickname) {}

    @GetMapping("/nickname/suggest")
    public Map<String, String> suggestNickname(@RequestParam(defaultValue = "ko") String lang) {
        return Map.of("nickname", auth.suggestNickname(lang));
    }

    /** {"status": "AVAILABLE" | "INVALID" | "TAKEN"} */
    @GetMapping("/nickname/check")
    public Map<String, String> checkNickname(@RequestParam(defaultValue = "") String nickname) {
        return Map.of("status", auth.checkNickname(nickname).name());
    }

    @PutMapping("/me/nickname")
    public MemberView changeNickname(@RequestBody NicknameForm form, HttpServletRequest request) {
        return MemberView.of(auth.changeNickname(AuthSession.memberId(request), form.nickname()));
    }

    @PostMapping("/signup")
    public ResponseEntity<MemberView> signup(@Valid @RequestBody SignupForm form,
                                             HttpServletRequest request, HttpServletResponse response) {
        Member member = auth.signup(form);
        AuthSession.signIn(request, response, member.getId(), false);
        return ResponseEntity.status(HttpStatus.CREATED).body(MemberView.of(member));
    }

    @PostMapping("/login")
    public MemberView login(@Valid @RequestBody LoginForm form,
                            HttpServletRequest request, HttpServletResponse response) {
        Member member = auth.login(form);
        AuthSession.signIn(request, response, member.getId(), form.remember());
        return MemberView.of(member);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request, HttpServletResponse response) {
        AuthSession.signOut(request, response);
        return ResponseEntity.noContent().build();
    }

    /** 켜 둔 소셜 로그인. 각사 키를 설정하는 SSO 단계 전까지는 빈 목록 → 프론트는 이메일 로그인만 보여준다 */
    @GetMapping("/providers")
    public Map<String, List<String>> providers(@RequestParam(defaultValue = "ko") String lang) {
        return Map.of("providers", List.of());
    }
}
