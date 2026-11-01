package com.examportal.question.util;

import com.examportal.question.exception.UnauthorizedQuestionAccessException;
import com.examportal.question.security.AuthenticatedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtil {

    private SecurityUtil() {
        // Utility class
    }

    public static AuthenticatedUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthenticatedUser user) {
            return user;
        }
        throw new UnauthorizedQuestionAccessException("User is not authenticated");
    }

    public static UUID getCurrentCreatorId() {
        return getCurrentUser().getUserId();
    }
}

