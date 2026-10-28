package com.seatfinder.seat_finder.repository;

import com.seatfinder.seat_finder.entity.OnlineStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface OnlineStudentRepository extends JpaRepository<OnlineStudent, Long> {

    Optional<OnlineStudent> findBySessionId(String sessionId);

    long countByLastSeenAfter(LocalDateTime time);

    // Refresh "last seen". Returns 0 when the session does not exist yet.
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("UPDATE OnlineStudent o SET o.lastSeen = :now WHERE o.sessionId = :sessionId")
    int touch(@Param("sessionId") String sessionId, @Param("now") LocalDateTime now);

    // Tab closed: remove this session immediately.
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM OnlineStudent o WHERE o.sessionId = :sessionId")
    int forget(@Param("sessionId") String sessionId);

    // Scheduled cleanup of old rows.
    @Modifying(clearAutomatically = true)
    @Transactional
    @Query("DELETE FROM OnlineStudent o WHERE o.lastSeen < :cutoff")
    int deleteStale(@Param("cutoff") LocalDateTime cutoff);
}