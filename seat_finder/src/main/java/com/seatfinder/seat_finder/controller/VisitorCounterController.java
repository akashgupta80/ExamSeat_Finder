
package com.seatfinder.seat_finder.controller;

import com.seatfinder.seat_finder.entity.VisitorCounter;
import com.seatfinder.seat_finder.entity.OnlineStudent;
import com.seatfinder.seat_finder.repository.VisitorCounterRepository;
import com.seatfinder.seat_finder.repository.OnlineStudentRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/visitors")
@CrossOrigin(origins = "*")
public class VisitorCounterController {

    private static final Integer COUNTER_ID = 1;
    private static final long ONLINE_TIMEOUT_SECONDS = 60;

    private final VisitorCounterRepository visitorCounterRepository;
    private final OnlineStudentRepository onlineStudentRepository;

    public VisitorCounterController(
            VisitorCounterRepository visitorCounterRepository,
            OnlineStudentRepository onlineStudentRepository) {
        this.visitorCounterRepository = visitorCounterRepository;
        this.onlineStudentRepository = onlineStudentRepository;
    }

    // TOTAL VISITORS
    @PostMapping("/visit")
    @Transactional
    public Map<String, Long> recordVisit() {

        VisitorCounter counter = visitorCounterRepository
                .findById(COUNTER_ID)
                .orElseGet(() -> visitorCounterRepository.save(
                        new VisitorCounter(COUNTER_ID, 0L)
                ));

        counter.setTotalVisitors(counter.getTotalVisitors() + 1);
        visitorCounterRepository.save(counter);

        return Map.of("totalVisitors", counter.getTotalVisitors());
    }

    @GetMapping
    public Map<String, Long> getVisitors() {

        VisitorCounter counter = visitorCounterRepository
                .findById(COUNTER_ID)
                .orElseGet(() -> visitorCounterRepository.save(
                        new VisitorCounter(COUNTER_ID, 0L)
                ));

        return Map.of("totalVisitors", counter.getTotalVisitors());
    }

    // UPDATE OR REGISTER AN ACTIVE BROWSER SESSION
    @PostMapping("/online")
    @Transactional
    public Map<String, Long> updateOnlineStatus(
            @RequestBody Map<String, String> request) {

        String sessionId = request.get("sessionId");

        if (sessionId == null || sessionId.isBlank()
                || sessionId.length() > 100) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST,
                    "A valid sessionId is required."
            );
        }

        OnlineStudent student = onlineStudentRepository
                .findBySessionId(sessionId)
                .orElseGet(() -> new OnlineStudent(
                        sessionId, LocalDateTime.now()
                ));

        student.setLastSeen(LocalDateTime.now());
        onlineStudentRepository.save(student);

        return getOnlineCount();
    }

    // GET CURRENT ONLINE COUNT
    @GetMapping("/online")
    public Map<String, Long> getOnlineCount() {

        LocalDateTime cutoff = LocalDateTime.now()
                .minusSeconds(ONLINE_TIMEOUT_SECONDS);

        long count = onlineStudentRepository
                .countByLastSeenAfter(cutoff);

        return Map.of("studentsOnline", count);
    }
}
