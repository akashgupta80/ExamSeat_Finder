package com.seatfinder.seat_finder.repository;

import com.seatfinder.seat_finder.entity.ExamSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ExamSeatRepository extends JpaRepository<ExamSeat, Long> {

    List<ExamSeat> findByAdmissionNoIgnoreCaseOrderByExamDateAscShiftAsc(
            String admissionNo
    );
}
