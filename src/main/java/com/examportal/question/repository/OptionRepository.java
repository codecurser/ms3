package com.examportal.question.repository;

import com.examportal.question.entity.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OptionRepository extends JpaRepository<Option, UUID> {

    List<Option> findByQuestionIdOrderByOrderIndexAsc(UUID questionId);

    void deleteByQuestionId(UUID questionId);
}

