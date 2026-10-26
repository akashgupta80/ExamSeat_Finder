
package com.seatfinder.seat_finder.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "exam_seats")
public class ExamSeat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admission_no", nullable = false)
    private String admissionNo;

    @Column(name = "enrollment_no")
    private String enrollmentNo;

    @Column(name = "student_name", nullable = false)
    private String studentName;

    @Column(name = "program")
    private String program;

    @Column(name = "semester")
    private String semester;

    @Column(name = "section")
    private String section;

    @Column(name = "course_code", nullable = false)
    private String courseCode;

    @Column(name = "room_no", nullable = false)
    private String roomNo;

    @Column(name = "seat_no", nullable = false)
    private String seatNo;

    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(nullable = false)
    private String shift;

    public ExamSeat() {
    }

    public Long getId() {
        return id;
    }

    public String getAdmissionNo() {
        return admissionNo;
    }

    public void setAdmissionNo(String admissionNo) {
        this.admissionNo = admissionNo;
    }

    public String getEnrollmentNo() {
        return enrollmentNo;
    }

    public void setEnrollmentNo(String enrollmentNo) {
        this.enrollmentNo = enrollmentNo;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getProgram() {
        return program;
    }

    public void setProgram(String program) {
        this.program = program;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getRoomNo() {
        return roomNo;
    }

    public void setRoomNo(String roomNo) {
        this.roomNo = roomNo;
    }

    public String getSeatNo() {
        return seatNo;
    }

    public void setSeatNo(String seatNo) {
        this.seatNo = seatNo;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public String getShift() {
        return shift;
    }

    public void setShift(String shift) {
        this.shift = shift;
    }
}

