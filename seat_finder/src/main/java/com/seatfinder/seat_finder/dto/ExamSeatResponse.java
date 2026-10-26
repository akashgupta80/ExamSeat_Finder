
package com.seatfinder.seat_finder.dto;

import java.time.LocalDate;

public class ExamSeatResponse {

    private String studentName;
    private String admissionNo;
    private String roomNo;
    private String seatNo;
    private String courseCode;
    private LocalDate examDate;
    private String shift;
    private String examTime;
    private String program;
    private String semester;
    private String section;

    public ExamSeatResponse(
            String studentName,
            String admissionNo,
            String roomNo,
            String seatNo,
            String courseCode,
            LocalDate examDate,
            String shift,
            String examTime,
            String program,
            String semester,
            String section) {

        this.studentName = studentName;
        this.admissionNo = admissionNo;
        this.roomNo = roomNo;
        this.seatNo = seatNo;
        this.courseCode = courseCode;
        this.examDate = examDate;
        this.shift = shift;
        this.examTime = examTime;
        this.program = program;
        this.semester = semester;
        this.section = section;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getAdmissionNo() {
        return admissionNo;
    }

    public String getRoomNo() {
        return roomNo;
    }

    public String getSeatNo() {
        return seatNo;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public String getShift() {
        return shift;
    }

    public String getExamTime() {
        return examTime;
    }

    public String getProgram() {
        return program;
    }

    public String getSemester() {
        return semester;
    }

    public String getSection() {
        return section;
    }
}
