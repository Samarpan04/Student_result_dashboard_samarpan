package com.dashboard.service;

import com.dashboard.model.Mark;
import com.dashboard.model.Student;
import com.dashboard.repository.MarkRepository;
import com.dashboard.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MarkRepository markRepository;

    // ==================== CRUD ====================

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Optional<Student> getStudentByRoll(String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber);
    }

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    @Transactional
    public void deleteStudent(Long id) {
        markRepository.deleteByStudentId(id);
        studentRepository.deleteById(id);
    }

    // ==================== SEARCH & FILTER ====================

    public List<Student> searchStudents(String query) {
        return studentRepository.searchStudents(query);
    }

    public List<Student> filterStudents(String course, Integer semester) {
        if (course != null && semester != null) {
            return studentRepository.findByCourseAndSemester(course, semester);
        } else if (course != null) {
            return studentRepository.findByCourse(course);
        } else if (semester != null) {
            return studentRepository.findBySemester(semester);
        }
        return studentRepository.findAll();
    }

    public List<String> getDistinctCourses() {
        return studentRepository.findDistinctCourses();
    }

    public List<Integer> getDistinctSemesters() {
        return studentRepository.findDistinctSemesters();
    }

    // ==================== DASHBOARD STATS ====================

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Student> allStudents = studentRepository.findAll();
        stats.put("totalStudents", allStudents.size());

        // Average percentage across all marks
        Double avgPercentage = markRepository.getOverallAveragePercentage();
        stats.put("averageMarks", avgPercentage != null ? Math.round(avgPercentage * 100.0) / 100.0 : 0);

        // Pass percentage (students with avg >= 40%)
        long passCount = 0;
        for (Student s : allStudents) {
            List<Mark> marks = markRepository.findByStudentIdAndSemester(s.getId(), s.getSemester());
            if (!marks.isEmpty()) {
                double avg = marks.stream()
                        .mapToDouble(m -> m.getMarks() * 100.0 / m.getMaxMarks())
                        .average().orElse(0);
                if (avg >= 40) passCount++;
            }
        }
        double passPercentage = allStudents.isEmpty() ? 0 : (passCount * 100.0 / allStudents.size());
        stats.put("passPercentage", Math.round(passPercentage * 100.0) / 100.0);

        // Topper
        Map<String, Object> topper = getTopper();
        stats.put("topper", topper);

        return stats;
    }

    public Map<String, Object> getTopper() {
        List<Student> allStudents = studentRepository.findAll();
        Student topperStudent = null;
        double topperPercentage = 0;

        for (Student s : allStudents) {
            List<Mark> marks = markRepository.findByStudentIdAndSemester(s.getId(), s.getSemester());
            if (!marks.isEmpty()) {
                double avg = marks.stream()
                        .mapToDouble(m -> m.getMarks() * 100.0 / m.getMaxMarks())
                        .average().orElse(0);
                if (avg > topperPercentage) {
                    topperPercentage = avg;
                    topperStudent = s;
                }
            }
        }

        Map<String, Object> topper = new HashMap<>();
        if (topperStudent != null) {
            topper.put("id", topperStudent.getId());
            topper.put("name", topperStudent.getName());
            topper.put("rollNumber", topperStudent.getRollNumber());
            topper.put("course", topperStudent.getCourse());
            topper.put("semester", topperStudent.getSemester());
            topper.put("profilePicture", topperStudent.getProfilePicture());
            topper.put("percentage", Math.round(topperPercentage * 100.0) / 100.0);
        }
        return topper;
    }

    // ==================== STUDENT PROFILE DATA ====================

    public Map<String, Object> getStudentProfile(Long id) {
        Optional<Student> optStudent = studentRepository.findById(id);
        if (optStudent.isEmpty()) return null;

        Student student = optStudent.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("student", student);

        // Current semester marks
        List<Mark> currentMarks = markRepository.findByStudentIdAndSemester(student.getId(), student.getSemester());
        profile.put("currentMarks", currentMarks);

        // All marks grouped by semester
        List<Mark> allMarks = markRepository.findByStudentId(student.getId());
        Map<Integer, List<Mark>> marksBySemester = allMarks.stream()
                .collect(Collectors.groupingBy(Mark::getSemester));
        profile.put("marksBySemester", marksBySemester);

        // Calculate current percentage
        double currentPercentage = currentMarks.stream()
                .mapToDouble(m -> m.getMarks() * 100.0 / m.getMaxMarks())
                .average().orElse(0);
        profile.put("currentPercentage", Math.round(currentPercentage * 100.0) / 100.0);

        // Pass/Fail status
        boolean passed = currentMarks.stream().allMatch(m -> m.getMarks() >= (m.getMaxMarks() * 0.4));
        profile.put("status", passed ? "PASS" : "FAIL");

        // Semester-wise percentage for growth chart
        Map<Integer, Double> semesterPercentages = new TreeMap<>();
        for (Map.Entry<Integer, List<Mark>> entry : marksBySemester.entrySet()) {
            double avg = entry.getValue().stream()
                    .mapToDouble(m -> m.getMarks() * 100.0 / m.getMaxMarks())
                    .average().orElse(0);
            semesterPercentages.put(entry.getKey(), Math.round(avg * 100.0) / 100.0);
        }
        profile.put("semesterPercentages", semesterPercentages);

        // Rank calculation
        List<Student> coursemates = studentRepository.findByCourseAndSemester(student.getCourse(), student.getSemester());
        List<Map.Entry<Long, Double>> rankings = new ArrayList<>();
        for (Student cm : coursemates) {
            List<Mark> cmMarks = markRepository.findByStudentIdAndSemester(cm.getId(), cm.getSemester());
            double avg = cmMarks.stream()
                    .mapToDouble(m -> m.getMarks() * 100.0 / m.getMaxMarks())
                    .average().orElse(0);
            rankings.add(Map.entry(cm.getId(), avg));
        }
        rankings.sort((a, b) -> Double.compare(b.getValue(), a.getValue()));
        int rank = 1;
        for (Map.Entry<Long, Double> entry : rankings) {
            if (entry.getKey().equals(student.getId())) break;
            rank++;
        }
        profile.put("rank", rank);
        profile.put("totalInCourse", coursemates.size());

        return profile;
    }
}
