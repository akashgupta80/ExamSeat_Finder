package com.seatfinder.seat_finder.repository;


import com.seatfinder.seat_finder.entity.OnlineStudent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OnlineStudentRepository extends JpaRepository<OnlineStudent, Long> {

    Optional<OnlineStudent> findBySessionId(String sessionId);

    long countByLastSeenAfter(LocalDateTime time);
}
