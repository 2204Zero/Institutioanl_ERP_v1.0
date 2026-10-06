package com.example.demo.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration("legacyPasswordConfig")
public class PasswordConfig {
    @Bean("legacyPasswordEncoder")
    public PasswordEncoder legacyPasswordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
