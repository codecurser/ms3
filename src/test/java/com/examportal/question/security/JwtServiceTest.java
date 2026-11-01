package com.examportal.question.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;
    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(secret);
    }

    @Test
    @DisplayName("Should generate valid token and extract creatorId as UUID")
    void testTokenGenerationAndExtraction() {
        UUID creatorId = UUID.randomUUID();
        String token = jwtService.generateTestToken(creatorId, "creator@test.com", "ROLE_CREATOR");

        assertNotNull(token);
        assertTrue(jwtService.isTokenValid(token));
        assertEquals(creatorId, jwtService.extractCreatorId(token));
        assertEquals("creator@test.com", jwtService.extractEmail(token));
        assertEquals("ROLE_CREATOR", jwtService.extractRole(token));
    }

    @Test
    @DisplayName("Should gracefully handle string or email subject by converting to deterministic UUID")
    void testDeterministicUuidForStringSubject() {
        // Build token with string subject
        UUID dummyId = UUID.nameUUIDFromBytes("teacher@domain.com".getBytes());
        String token = jwtService.generateTestToken(dummyId, "teacher@domain.com", "ROLE_CREATOR");

        UUID extracted = jwtService.extractCreatorId(token);
        assertEquals(dummyId, extracted);
    }

    @Test
    @DisplayName("Should reject invalid token")
    void testInvalidToken() {
        assertFalse(jwtService.isTokenValid("invalid.token.here"));
    }
}

