package com.example.demo.security.breaking;

import com.example.demo.security.ratelimit.InMemoryRateLimiter;
import com.example.demo.security.ratelimit.RateLimitingFilter;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.*;

public class RateLimitingBreakingTest {

    private InMemoryRateLimiter rateLimiter;
    private RateLimitingFilter rateLimitingFilter;
    private FilterChain filterChain;

    @BeforeEach
    public void setup() {
        rateLimiter = new InMemoryRateLimiter();
        rateLimitingFilter = new RateLimitingFilter(rateLimiter);
        filterChain = mock(FilterChain.class);
    }

    @Test
    public void testBurstAttack() throws Exception {
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr("192.168.1.50");
            MockHttpServletResponse res = new MockHttpServletResponse();
            
            rateLimitingFilter.doFilter(req, res, filterChain);
            assertEquals(200, res.getStatus());
        }
        
        MockHttpServletRequest req11 = new MockHttpServletRequest("POST", "/api/auth/login");
        req11.setRemoteAddr("192.168.1.50");
        MockHttpServletResponse res11 = new MockHttpServletResponse();
        
        rateLimitingFilter.doFilter(req11, res11, filterChain);
        assertEquals(429, res11.getStatus());
    }

    @Test
    public void testIpSegregation() throws Exception {
        for (int i = 0; i < 15; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/login");
            req.setRemoteAddr("192.168.1.50");
            MockHttpServletResponse res = new MockHttpServletResponse();
            rateLimitingFilter.doFilter(req, res, filterChain);
        }
        
        MockHttpServletRequest legReq = new MockHttpServletRequest("POST", "/api/auth/login");
        legReq.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse legRes = new MockHttpServletResponse();
        rateLimitingFilter.doFilter(legReq, legRes, filterChain);
        
        assertEquals(200, legRes.getStatus());
    }

    @Test
    public void testStandardErrorEnvelopeAssertion() throws Exception {
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/auth/recover-password");
            req.setRemoteAddr("192.168.1.50");
            MockHttpServletResponse res = new MockHttpServletResponse();
            rateLimitingFilter.doFilter(req, res, filterChain);
        }
        
        MockHttpServletRequest reqBlocked = new MockHttpServletRequest("POST", "/api/auth/recover-password");
        reqBlocked.setRemoteAddr("192.168.1.50");
        MockHttpServletResponse resBlocked = new MockHttpServletResponse();
        
        rateLimitingFilter.doFilter(reqBlocked, resBlocked, filterChain);
        
        assertEquals(429, resBlocked.getStatus());
        assertTrue(resBlocked.getHeader("Retry-After") != null);
        assertTrue(Integer.parseInt(resBlocked.getHeader("Retry-After")) >= 0);
        
        String content = resBlocked.getContentAsString();
        assertTrue(content.contains("\"status\": 429"));
        assertTrue(content.contains("\"code\": \"RATE_LIMIT_EXCEEDED\""));
        assertTrue(content.contains("\"path\": \"/api/auth/recover-password\""));
        assertTrue(content.contains("\"message\": \"Too many requests. Please try again later.\""));
    }
}
