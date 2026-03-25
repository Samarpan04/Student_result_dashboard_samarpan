package com.dashboard.controller;

import com.dashboard.model.Student;
import com.dashboard.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    /** GET /api/students - Get all students */
    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    /** GET /api/students/{id} - Get student by ID */
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/students/roll/{rollNumber} - Get student by roll number */
    @GetMapping("/roll/{rollNumber}")
    public ResponseEntity<Student> getStudentByRoll(@PathVariable String rollNumber) {
        return studentService.getStudentByRoll(rollNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** GET /api/students/profile/{id} - Get full student profile with marks */
    @GetMapping("/profile/{id}")
    public ResponseEntity<Map<String, Object>> getStudentProfile(@PathVariable Long id) {
        Map<String, Object> profile = studentService.getStudentProfile(id);
        if (profile == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(profile);
    }

    /** GET /api/students/search?q=query - Search students */
    @GetMapping("/search")
    public ResponseEntity<List<Student>> searchStudents(@RequestParam("q") String query) {
        return ResponseEntity.ok(studentService.searchStudents(query));
    }

    /** GET /api/students/filter?course=X&semester=Y - Filter students */
    @GetMapping("/filter")
    public ResponseEntity<List<Student>> filterStudents(
            @RequestParam(required = false) String course,
            @RequestParam(required = false) Integer semester) {
        return ResponseEntity.ok(studentService.filterStudents(course, semester));
    }

    /** GET /api/students/courses - Get distinct courses */
    @GetMapping("/courses")
    public ResponseEntity<List<String>> getCourses() {
        return ResponseEntity.ok(studentService.getDistinctCourses());
    }

    /** GET /api/students/semesters - Get distinct semesters */
    @GetMapping("/semesters")
    public ResponseEntity<List<Integer>> getSemesters() {
        return ResponseEntity.ok(studentService.getDistinctSemesters());
    }

    /** POST /api/students - Create student */
    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        return ResponseEntity.ok(studentService.saveStudent(student));
    }

    /** PUT /api/students/{id} - Update student */
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        return studentService.getStudentById(id).map(existing -> {
            student.setId(id);
            return ResponseEntity.ok(studentService.saveStudent(student));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/students/{id} - Delete student */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (studentService.getStudentById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        studentService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }
}
