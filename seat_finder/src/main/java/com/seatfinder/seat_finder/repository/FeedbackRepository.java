package com.seatfinder.seat_finder.repository;

import com.seatfinder.seat_finder.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository
        extends JpaRepository<Feedback, Long> {
}
