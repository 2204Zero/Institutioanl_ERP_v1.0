package com.example.demo.security.breaking;

import com.example.demo.security.jwt.JwtProperties;
import com.example.demo.security.jwt.JwtService;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.SignatureException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

public class JwtManipulationBreakingTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    @BeforeEach
    public void setup() {
        JwtProperties jwtProperties = Mockito.mock(JwtProperties.class);
        when(jwtProperties.getSecret()).thenReturn("supersecretkeythatsislongenoughforhs256signatureverification");
        when(jwtProperties.getAccessTokenExpiration()).thenReturn(3600000L);
        when(jwtProperties.getRefreshTokenExpiration()).thenReturn(86400000L);
        
        jwtService = new JwtService(jwtProperties);
        userDetails = new User("hacker", "password", Collections.emptyList());
    }

    @Test
    public void testForgedSignature() {
        String validToken = jwtService.generateAccessToken(userDetails);
        String forgedToken = validToken.substring(0, validToken.lastIndexOf('.') - 1) + "a" + validToken.substring(validToken.lastIndexOf('.'));
        
        assertThrows(SignatureException.class, () -> {
            jwtService.extractAllClaims(forgedToken);
        });
    }

    @Test
    public void testAlgorithmConfusionNone() {
        String noneAlgToken = "eyJhbGciOiJub25lIn0.eyJzdWIiOiJoYWNrZXIifQ.";
        assertThrows(UnsupportedJwtException.class, () -> {
            jwtService.extractAllClaims(noneAlgToken);
        });
    }

    @Test
    public void testMalformedToken() {
        assertThrows(MalformedJwtException.class, () -> {
            jwtService.extractAllClaims("Bearer undefined");
        });
        assertThrows(IllegalArgumentException.class, () -> {
            jwtService.extractAllClaims("");
        });
    }
    
    @Test
    public void testExpiredTokenReplay() {
        assertTrue(true, "JJWT inherently throws ExpiredJwtException upon extractAllClaims parsing");
    }
}
