package com.seatfinder.seat_finder.controller;

import com.seatfinder.seat_finder.dto.ExamSeatResponse;
import com.seatfinder.seat_finder.entity.ExamSeat;
import com.seatfinder.seat_finder.repository.ExamSeatRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/exam-seats")
@CrossOrigin(origins = "*")
public class ExamSeatController {

    private static final int MAX_ADMISSION_LENGTH = 50;
    private static final Pattern DIGITS = Pattern.compile("\\d+");

    private final ExamSeatRepository examSeatRepository;

    public ExamSeatController(ExamSeatRepository examSeatRepository) {
        this.examSeatRepository = examSeatRepository;
    }

    // New (recommended): /api/exam-seats?admissionNo=ABC/123  -> safe for "/" and "."
    @GetMapping
    public List<ExamSeatResponse> searchByQuery(@RequestParam String admissionNo) {
        return search(admissionNo);
    }

    // Old URL still works: /api/exam-seats/12345
    @GetMapping("/{admissionNo}")
    public List<ExamSeatResponse> searchByPath(@PathVariable String admissionNo) {
        return search(admissionNo);
    }

    private List<ExamSeatResponse> search(String admissionNo) {

        if (admissionNo == null || admissionNo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Admission number is required."
            );
        }

        String cleaned = admissionNo.trim();

        if (cleaned.length() > MAX_ADMISSION_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Admission number is too long."
            );
        }

        List<ExamSeat> seats = examSeatRepository.findByAdmissionNo(cleaned);

        if (seats.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No examination records found for this admission number."
            );
        }

        return seats.stream()
                .map(seat -> new ExamSeatResponse(
                        seat.getStudentName(),
                        seat.getAdmissionNo(),
                        seat.getRoomNo(),
                        seat.getSeatNo(),
                        seat.getCourseCode(),
                        seat.getExamDate(),
                        seat.getShift(),
                        getExamTime(seat.getShift()),
                        seat.getProgram(),
                        seat.getSemester(),
                        seat.getSection()
                ))
                .toList();
    }

    // Accepts "Shift 1", "shift-1", "1", 1 ... (previously only "shift 1" worked)
    private String getExamTime(String shift) {
        if (shift == null) {
            return "Not available";
        }

        Matcher matcher = DIGITS.matcher(shift);

        if (!matcher.find()) {
            return "Not available";
        }

        return switch (matcher.group()) {
            case "1" -> "09:30 AM - 11:00 AM";
            case "2" -> "11:40 AM - 01:10 PM";
            case "3" -> "01:50 PM - 03:20 PM";
            case "4" -> "04:00 PM - 05:30 PM";
            default -> "Not available";
        };
    }
}