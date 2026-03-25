package com.dashboard.controller;

import com.dashboard.model.Mark;
import com.dashboard.service.MarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")
@CrossOrigin(origins = "*")
public class MarkController {

    @Autowired
    private MarkService markService;

    /** GET /api/marks - Get all marks */
    @GetMapping
    public ResponseEntity<List<Mark>> getAllMarks() {
        return ResponseEntity.ok(markService.getAllMarks());
    }

    /** GET /api/marks/student/{studentId} - Get marks by student */
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Mark>> getMarksByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(markService.getMarksByStudentId(studentId));
    }

    /** GET /api/marks/student/{studentId}/semester/{semester} - Get marks by student and semester */
    @GetMapping("/student/{studentId}/semester/{semester}")
    public ResponseEntity<List<Mark>> getMarksByStudentAndSemester(
            @PathVariable Long studentId, @PathVariable Integer semester) {
        return ResponseEntity.ok(markService.getMarksByStudentAndSemester(studentId, semester));
    }

    /** POST /api/marks - Create mark */
    @PostMapping
    public ResponseEntity<Mark> createMark(@RequestBody Mark mark) {
        return ResponseEntity.ok(markService.saveMark(mark));
    }

    /** PUT /api/marks/{id} - Update mark */
    @PutMapping("/{id}")
    public ResponseEntity<Mark> updateMark(@PathVariable Long id, @RequestBody Mark mark) {
        return markService.getMarkById(id).map(existing -> {
            mark.setId(id);
            return ResponseEntity.ok(markService.saveMark(mark));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** DELETE /api/marks/{id} - Delete mark */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMark(@PathVariable Long id) {
        if (markService.getMarkById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        markService.deleteMark(id);
        return ResponseEntity.ok().build();
    }
}
