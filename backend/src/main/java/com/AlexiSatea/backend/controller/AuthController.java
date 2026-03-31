package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.AuthMeResponse;
import com.AlexiSatea.backend.dto.LoginRequest;
import com.AlexiSatea.backend.dto.SignupRequest;
import com.AlexiSatea.backend.dto.VerifyEmailRequest;
import com.AlexiSatea.backend.service.AuthService;
import com.AlexiSatea.backend.service.EmailVerificationService;
import com.AlexiSatea.backend.service.ProfileUserService;
import com.AlexiSatea.backend.service.TestService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final TestService testService;
    private final AuthService authService;
    private final ProfileUserService  profileUserService;
    private final EmailVerificationService  emailVerificationService;

    @PostMapping("/signupTest")
    public String signup() throws ServletException {
        return testService.signUpTest();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {

        authService.login(request, httpRequest);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) throws ServletException {
        request.logout();
        request.getSession().invalidate();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public AuthMeResponse me(Authentication authentication) {

        return authService.me(authentication);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request);
        return ResponseEntity.ok(Map.of("message", "User created successfully"));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        emailVerificationService.verifyEmail(request);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }
    @PostMapping("/resend-code")
    public ResponseEntity<?> resendVerificationMail(@RequestParam String email) {
        emailVerificationService.resendVerificationCode(email);
        return ResponseEntity.ok().build();
    }
/*
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(Authentication authentication) {
        profileUserService.deleteCurrentUser(authentication);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
 */



}
