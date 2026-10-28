
package com.seatfinder.seat_finder.controller;

import com.seatfinder.seat_finder.entity.OnlineStudent;
import com.seatfinder.seat_finder.entity.VisitorCounter;
import com.seatfinder.seat_finder.repository.OnlineStudentRepository;
import com.seatfinder.seat_finder.repository.VisitorCounterRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/visitors")
public class VisitorCounterController {

    // Must match the Integer ID in VisitorCounter.
    private static final Integer COUNTER_ID = 1;

    private static final int ONLINE_TIMEOUT_SECONDS = 60;

    private static final Pattern SAFE_ID =
            Pattern.compile("[A-Za-z0-9\\-]{8,64}");

    private final VisitorCounterRepository visitorCounterRepository;
    private final OnlineStudentRepository onlineStudentRepository;

    public VisitorCounterController(
            VisitorCounterRepository visitorCounterRepository,
            OnlineStudentRepository onlineStudentRepository) {

        this.visitorCounterRepository = visitorCounterRepository;
        this.onlineStudentRepository = onlineStudentRepository;
    }

    @PostConstruct
    @Transactional
    public void initCounterRow() {
        if (visitorCounterRepository.findById(COUNTER_ID).isEmpty()) {
            VisitorCounter counter = new VisitorCounter();
            counter.setId(COUNTER_ID);
            counter.setTotalVisitors(0L);
            visitorCounterRepository.save(counter);
        }
    }

    // Increase the counter once when the frontend records a page visit.
    @PostMapping("/visit")
    @Transactional
    public Map<String, Long> recordVisit() {
        int updated = visitorCounterRepository.increment(COUNTER_ID);

        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Visitor counter row was not found"
            );
        }

        return Map.of("totalVisitors", readTotal());
    }

    // Read the total without increasing it.
    @GetMapping
    public Map<String, Long> getVisitorCount() {
        return Map.of("totalVisitors", readTotal());
    }

    // Mark a browser session as online.
    @PostMapping("/online")
    public Map<String, Long> markOnline(
            @RequestBody Map<String, String> request) {

        String sessionId = validateId(request.get("sessionId"));
        LocalDateTime now = LocalDateTime.now();

        int updated = onlineStudentRepository.touch(sessionId, now);

        if (updated == 0) {
            try {
                onlineStudentRepository.save(
                        new OnlineStudent(sessionId, now)
                );
            } catch (DataIntegrityViolationException exception) {
                // The session may have been inserted by another request.
                onlineStudentRepository.touch(sessionId, now);
            }
        }

        return Map.of("studentsOnline", currentOnline());
    }

    // Mark a browser session as offline.
    @PostMapping("/offline")
    public Map<String, Long> markOffline(
            @RequestBody Map<String, String> request) {

        String sessionId = validateId(request.get("sessionId"));
        onlineStudentRepository.forget(sessionId);

        return Map.of("studentsOnline", currentOnline());
    }

    // Read the current online-session count.
    @GetMapping("/online")
    public Map<String, Long> getOnlineCount() {
        return Map.of("studentsOnline", currentOnline());
    }

    private long readTotal() {
        return visitorCounterRepository.findById(COUNTER_ID)
                .map(VisitorCounter::getTotalVisitors)
                .orElse(0L);
    }

    private long currentOnline() {
        LocalDateTime cutoff = LocalDateTime.now()
                .minusSeconds(ONLINE_TIMEOUT_SECONDS);

        return onlineStudentRepository.countByLastSeenAfter(cutoff);
    }

    private String validateId(String id) {
        if (id == null || !SAFE_ID.matcher(id).matches()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid visitor or session ID"
            );
        }

        return id;
    }
}
