package com.examportal.question.repository;

import com.examportal.question.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuestionRepository extends JpaRepository<Question, UUID> {

    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.options WHERE q.examId = :examId ORDER BY q.orderIndex ASC, q.createdAt ASC")
    List<Question> findByExamIdWithOptions(@Param("examId") UUID examId);

    List<Question> findByExamIdOrderByOrderIndexAscCreatedAtAsc(UUID examId);

    @Query("SELECT q FROM Question q LEFT JOIN FETCH q.options WHERE q.id = :id")
    Optional<Question> findByIdWithOptions(@Param("id") UUID id);

    Optional<Question> findByIdAndCreatorId(UUID id, UUID creatorId);

    long countByExamId(UUID examId);

    void deleteByExamIdAndCreatorId(UUID examId, UUID creatorId);

    boolean existsByIdAndCreatorId(UUID id, UUID creatorId);
}

