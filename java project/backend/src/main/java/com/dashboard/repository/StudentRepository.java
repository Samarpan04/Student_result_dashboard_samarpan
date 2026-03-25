package com.dashboard.repository;

import com.dashboard.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    List<Student> findByCourseAndSemester(String course, Integer semester);

    List<Student> findByCourse(String course);

    List<Student> findBySemester(Integer semester);

    @Query("SELECT s FROM Student s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Student> searchStudents(@Param("query") String query);

    @Query("SELECT DISTINCT s.course FROM Student s")
    List<String> findDistinctCourses();

    @Query("SELECT DISTINCT s.semester FROM Student s ORDER BY s.semester")
    List<Integer> findDistinctSemesters();
}
