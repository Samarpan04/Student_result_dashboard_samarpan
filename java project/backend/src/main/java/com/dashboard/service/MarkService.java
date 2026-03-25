package com.dashboard.service;

import com.dashboard.model.Mark;
import com.dashboard.repository.MarkRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarkService {

    @Autowired
    private MarkRepository markRepository;

    public List<Mark> getAllMarks() {
        return markRepository.findAll();
    }

    public Optional<Mark> getMarkById(Long id) {
        return markRepository.findById(id);
    }

    public List<Mark> getMarksByStudentId(Long studentId) {
        return markRepository.findByStudentId(studentId);
    }

    public List<Mark> getMarksByStudentAndSemester(Long studentId, Integer semester) {
        return markRepository.findByStudentIdAndSemester(studentId, semester);
    }

    public Mark saveMark(Mark mark) {
        return markRepository.save(mark);
    }

    public void deleteMark(Long id) {
        markRepository.deleteById(id);
    }
}
