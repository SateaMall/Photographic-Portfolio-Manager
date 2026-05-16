package com.letmelens.backend.controller;

import com.letmelens.backend.dto.AuthMeResponse;
import com.letmelens.backend.dto.LoginRequest;
import com.letmelens.backend.dto.SignupRequest;
import com.letmelens.backend.dto.VerifyEmailRequest;
import com.letmelens.backend.service.AuthService;
import com.letmelens.backend.service.EmailVerificationService;
import com.letmelens.backend.service.TestService;
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
    public ResponseEntity<?> verifyEmail(@Valid @RequestBody VerifyEmailRequest request,HttpServletRequest httpRequest) {
        emailVerificationService.verifyEmail(request);
        authService.loginVerifiedUser(request.email(), httpRequest);
        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }
    @PostMapping("/resend-code")
    public ResponseEntity<?> resendVerificationMail(@RequestParam String email) {
        emailVerificationService.resendVerificationCode(email);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteCurrentUser(Authentication authentication, HttpServletRequest request) throws ServletException {
        authService.deleteCurrentUser(authentication);
        request.logout();
        request.getSession().invalidate();
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }



}
