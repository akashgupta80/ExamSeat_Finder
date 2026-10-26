
package com.seatfinder.seat_finder.controller;

import com.seatfinder.seat_finder.dto.ExamSeatResponse;
import com.seatfinder.seat_finder.entity.ExamSeat;
import com.seatfinder.seat_finder.repository.ExamSeatRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/exam-seats")
@CrossOrigin(origins = "*")
public class ExamSeatController {

    private final ExamSeatRepository examSeatRepository;

    public ExamSeatController(ExamSeatRepository examSeatRepository) {
        this.examSeatRepository = examSeatRepository;
    }

    @GetMapping("/{admissionNo}")
    public List<ExamSeatResponse> searchByAdmissionNo(
            @PathVariable String admissionNo) {

        if (admissionNo == null || admissionNo.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Admission number is required."
            );
        }

        List<ExamSeat> seats =
                examSeatRepository.findByAdmissionNo(admissionNo.trim());

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

    private String getExamTime(String shift) {
        if (shift == null) {
            return "Not available";
        }

        return switch (shift.trim().toLowerCase()) {
            case "shift 1" -> "09:30 AM - 11:00 AM";
            case "shift 2" -> "11:40 AM - 01:10 PM";
            case "shift 3" -> "01:50 PM - 03:20 PM";
            case "shift 4" -> "04:00 PM - 05:30 PM";
            default -> "Not available";
        };
    }
}
