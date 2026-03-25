package com.dashboard.repository;

import com.dashboard.model.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByStudentId(Long studentId);

    List<Mark> findByStudentIdAndSemester(Long studentId, Integer semester);

    @Query("SELECT AVG(m.marks * 100.0 / m.maxMarks) FROM Mark m")
    Double getOverallAveragePercentage();

    @Query("SELECT AVG(m.marks * 100.0 / m.maxMarks) FROM Mark m WHERE m.studentId = :studentId AND m.semester = :semester")
    Double getAveragePercentageByStudentAndSemester(@Param("studentId") Long studentId, @Param("semester") Integer semester);

    void deleteByStudentId(Long studentId);
}
