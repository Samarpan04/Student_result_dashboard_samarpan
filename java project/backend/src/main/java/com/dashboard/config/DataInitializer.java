package com.dashboard.config;

import com.dashboard.model.Mark;
import com.dashboard.model.Notice;
import com.dashboard.model.Student;
import com.dashboard.repository.MarkRepository;
import com.dashboard.repository.NoticeRepository;
import com.dashboard.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Populates the database with sample data on first run.
 * Only inserts data if the students table is empty.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Override
    public void run(String... args) {
        if (studentRepository.count() > 0) {
            System.out.println("⚡ Database already has data. Skipping initialization.");
            return;
        }

        System.out.println("🚀 Initializing sample data...");

        // ============================================================
        // CREATE STUDENTS
        // ============================================================
        List<Student> students = List.of(
            Student.builder().name("Nilay Bhattacharya").rollNumber("BCA2024001").course("BCA").semester(4)
                    .email("nilay@example.com").phone("9876543210")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Nilay").build(),

            Student.builder().name("Samarpan Das").rollNumber("BCA2024002").course("BCA").semester(4)
                    .email("samarpan@example.com").phone("9876543211")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Samarpan").build(),

            Student.builder().name("Ananya Sharma").rollNumber("BCA2024003").course("BCA").semester(4)
                    .email("ananya@example.com").phone("9876543212")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya").build(),

            Student.builder().name("Rahul Verma").rollNumber("BCA2024004").course("BCA").semester(4)
                    .email("rahul@example.com").phone("9876543213")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul").build(),

            Student.builder().name("Priya Patel").rollNumber("MCA2024001").course("MCA").semester(2)
                    .email("priya@example.com").phone("9876543214")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Priya").build(),

            Student.builder().name("Arjun Singh").rollNumber("MCA2024002").course("MCA").semester(2)
                    .email("arjun@example.com").phone("9876543215")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun").build(),

            Student.builder().name("Sneha Gupta").rollNumber("BCA2024005").course("BCA").semester(2)
                    .email("sneha@example.com").phone("9876543216")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha").build(),

            Student.builder().name("Vikram Joshi").rollNumber("BSC2024001").course("B.Sc IT").semester(4)
                    .email("vikram@example.com").phone("9876543217")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram").build(),

            Student.builder().name("Kavita Roy").rollNumber("BSC2024002").course("B.Sc IT").semester(4)
                    .email("kavita@example.com").phone("9876543218")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita").build(),

            Student.builder().name("Deepak Kumar").rollNumber("MCA2024003").course("MCA").semester(2)
                    .email("deepak@example.com").phone("9876543219")
                    .profilePicture("https://api.dicebear.com/7.x/avataaars/svg?seed=Deepak").build()
        );

        studentRepository.saveAll(students);

        // ============================================================
        // CREATE MARKS (Multiple Semesters for growth charts)
        // ============================================================

        // --- Nilay Bhattacharya (BCA, Topper) ---
        Long nilayId = students.get(0).getId();
        // Semester 1
        saveMarks(nilayId, 1, new String[]{"Mathematics", "English", "Computer Fundamentals", "Digital Electronics", "C Programming"},
                  new int[]{88, 82, 91, 85, 94}, 100);
        // Semester 2
        saveMarks(nilayId, 2, new String[]{"Data Structures", "DBMS", "Mathematics-II", "OOP with Java", "Web Technology"},
                  new int[]{90, 87, 85, 92, 88}, 100);
        // Semester 3
        saveMarks(nilayId, 3, new String[]{"Operating Systems", "Software Engineering", "Computer Networks", "Python", "Statistics"},
                  new int[]{92, 89, 91, 95, 87}, 100);
        // Semester 4 (Current)
        saveMarks(nilayId, 4, new String[]{"AI & ML", "Cloud Computing", "Cyber Security", "Android Dev", "Project Work"},
                  new int[]{95, 91, 93, 96, 98}, 100);

        // --- Samarpan Das ---
        Long samarpanId = students.get(1).getId();
        saveMarks(samarpanId, 1, new String[]{"Mathematics", "English", "Computer Fundamentals", "Digital Electronics", "C Programming"},
                  new int[]{78, 72, 81, 75, 84}, 100);
        saveMarks(samarpanId, 2, new String[]{"Data Structures", "DBMS", "Mathematics-II", "OOP with Java", "Web Technology"},
                  new int[]{80, 77, 75, 82, 85}, 100);
        saveMarks(samarpanId, 3, new String[]{"Operating Systems", "Software Engineering", "Computer Networks", "Python", "Statistics"},
                  new int[]{82, 79, 84, 88, 80}, 100);
        saveMarks(samarpanId, 4, new String[]{"AI & ML", "Cloud Computing", "Cyber Security", "Android Dev", "Project Work"},
                  new int[]{85, 82, 88, 90, 92}, 100);

        // --- Ananya Sharma ---
        Long ananyaId = students.get(2).getId();
        saveMarks(ananyaId, 1, new String[]{"Mathematics", "English", "Computer Fundamentals", "Digital Electronics", "C Programming"},
                  new int[]{85, 90, 78, 80, 82}, 100);
        saveMarks(ananyaId, 2, new String[]{"Data Structures", "DBMS", "Mathematics-II", "OOP with Java", "Web Technology"},
                  new int[]{82, 88, 80, 85, 90}, 100);
        saveMarks(ananyaId, 3, new String[]{"Operating Systems", "Software Engineering", "Computer Networks", "Python", "Statistics"},
                  new int[]{88, 85, 82, 90, 86}, 100);
        saveMarks(ananyaId, 4, new String[]{"AI & ML", "Cloud Computing", "Cyber Security", "Android Dev", "Project Work"},
                  new int[]{90, 88, 85, 92, 94}, 100);

        // --- Rahul Verma ---
        Long rahulId = students.get(3).getId();
        saveMarks(rahulId, 1, new String[]{"Mathematics", "English", "Computer Fundamentals", "Digital Electronics", "C Programming"},
                  new int[]{55, 60, 50, 58, 62}, 100);
        saveMarks(rahulId, 2, new String[]{"Data Structures", "DBMS", "Mathematics-II", "OOP with Java", "Web Technology"},
                  new int[]{58, 65, 52, 60, 68}, 100);
        saveMarks(rahulId, 3, new String[]{"Operating Systems", "Software Engineering", "Computer Networks", "Python", "Statistics"},
                  new int[]{62, 68, 55, 70, 60}, 100);
        saveMarks(rahulId, 4, new String[]{"AI & ML", "Cloud Computing", "Cyber Security", "Android Dev", "Project Work"},
                  new int[]{65, 70, 60, 72, 75}, 100);

        // --- Priya Patel (MCA) ---
        Long priyaId = students.get(4).getId();
        saveMarks(priyaId, 1, new String[]{"Discrete Mathematics", "DBMS", "Computer Architecture", "Data Structures", "C++ Programming"},
                  new int[]{88, 85, 80, 90, 86}, 100);
        saveMarks(priyaId, 2, new String[]{"Algorithms", "Operating Systems", "Software Engineering", "Java", "Web Development"},
                  new int[]{92, 88, 85, 91, 89}, 100);

        // --- Arjun Singh (MCA) ---
        Long arjunId = students.get(5).getId();
        saveMarks(arjunId, 1, new String[]{"Discrete Mathematics", "DBMS", "Computer Architecture", "Data Structures", "C++ Programming"},
                  new int[]{70, 72, 68, 75, 71}, 100);
        saveMarks(arjunId, 2, new String[]{"Algorithms", "Operating Systems", "Software Engineering", "Java", "Web Development"},
                  new int[]{74, 78, 72, 80, 76}, 100);

        // --- Sneha Gupta (BCA Sem 2) ---
        Long snehaId = students.get(6).getId();
        saveMarks(snehaId, 1, new String[]{"Mathematics", "English", "Computer Fundamentals", "Digital Electronics", "C Programming"},
                  new int[]{72, 68, 75, 70, 78}, 100);
        saveMarks(snehaId, 2, new String[]{"Data Structures", "DBMS", "Mathematics-II", "OOP with Java", "Web Technology"},
                  new int[]{76, 80, 72, 82, 84}, 100);

        // --- Vikram Joshi (B.Sc IT) ---
        Long vikramId = students.get(7).getId();
        saveMarks(vikramId, 1, new String[]{"Mathematics", "English", "Computer Basics", "Electronics", "Programming in C"},
                  new int[]{65, 70, 72, 60, 68}, 100);
        saveMarks(vikramId, 2, new String[]{"OOP", "DBMS", "Mathematics-II", "Web Design", "Data Structures"},
                  new int[]{70, 75, 68, 72, 74}, 100);
        saveMarks(vikramId, 3, new String[]{"OS", "Networking", "Software Engineering", "Python", "Statistics"},
                  new int[]{75, 70, 72, 80, 68}, 100);
        saveMarks(vikramId, 4, new String[]{"Cloud Computing", "AI Basics", "Cyber Security", "Mobile App Dev", "Mini Project"},
                  new int[]{78, 75, 72, 80, 82}, 100);

        // --- Kavita Roy (B.Sc IT) ---
        Long kavitaId = students.get(8).getId();
        saveMarks(kavitaId, 1, new String[]{"Mathematics", "English", "Computer Basics", "Electronics", "Programming in C"},
                  new int[]{80, 85, 82, 78, 88}, 100);
        saveMarks(kavitaId, 2, new String[]{"OOP", "DBMS", "Mathematics-II", "Web Design", "Data Structures"},
                  new int[]{84, 88, 80, 85, 82}, 100);
        saveMarks(kavitaId, 3, new String[]{"OS", "Networking", "Software Engineering", "Python", "Statistics"},
                  new int[]{86, 82, 85, 90, 84}, 100);
        saveMarks(kavitaId, 4, new String[]{"Cloud Computing", "AI Basics", "Cyber Security", "Mobile App Dev", "Mini Project"},
                  new int[]{88, 85, 82, 92, 90}, 100);

        // --- Deepak Kumar (MCA) ---
        Long deepakId = students.get(9).getId();
        saveMarks(deepakId, 1, new String[]{"Discrete Mathematics", "DBMS", "Computer Architecture", "Data Structures", "C++ Programming"},
                  new int[]{35, 42, 38, 40, 45}, 100);
        saveMarks(deepakId, 2, new String[]{"Algorithms", "Operating Systems", "Software Engineering", "Java", "Web Development"},
                  new int[]{38, 45, 40, 42, 48}, 100);

        // ============================================================
        // CREATE NOTICES
        // ============================================================
        noticeRepository.saveAll(List.of(
            Notice.builder().title("🏆 Topper of BCA 4th Sem: Nilay Bhattacharya")
                    .content("Congratulations to Nilay Bhattacharya for scoring the highest percentage in BCA 4th Semester!").build(),
            Notice.builder().title("📢 Semester Exams Start from April 15th")
                    .content("All students are requested to prepare for the upcoming semester examinations starting April 15th, 2026.").build(),
            Notice.builder().title("📋 Result Declaration: BCA & MCA Sem 2")
                    .content("Results for BCA Semester 2 and MCA Semester 2 have been declared. Check your results on the dashboard.").build(),
            Notice.builder().title("🎓 Annual Day Celebration on March 30th")
                    .content("All students are invited to the Annual Day celebration. Top performers will be felicitated with awards.").build(),
            Notice.builder().title("💻 New Lab Equipment Installed")
                    .content("State-of-the-art computers have been installed in Lab 3. Students can use them for project work.").build()
        ));

        System.out.println("✅ Sample data initialized successfully!");
        System.out.println("   → 10 Students created");
        System.out.println("   → Marks for multiple semesters added");
        System.out.println("   → 5 Notices added");
    }

    /**
     * Helper method to save marks for a student in a given semester
     */
    private void saveMarks(Long studentId, int semester, String[] subjects, int[] marks, int maxMarks) {
        for (int i = 0; i < subjects.length; i++) {
            markRepository.save(Mark.builder()
                    .studentId(studentId)
                    .subject(subjects[i])
                    .marks(marks[i])
                    .maxMarks(maxMarks)
                    .semester(semester)
                    .build());
        }
    }
}
