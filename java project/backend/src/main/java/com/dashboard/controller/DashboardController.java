package com.dashboard.controller;

import com.dashboard.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private StudentService studentService;

    /**
     * GET /api/dashboard/stats
     * Returns: totalStudents, averageMarks, passPercentage, topper
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(studentService.getDashboardStats());
    }

    /**
     * GET /api/dashboard/topper
     * Returns the topper student with percentage
     */
    @GetMapping("/topper")
    public ResponseEntity<Map<String, Object>> getTopper() {
        return ResponseEntity.ok(studentService.getTopper());
    }
}
