package com.seatfinder.seat_finder.scheduler;

import com.seatfinder.seat_finder.repository.OnlineStudentRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class OnlineStudentCleanupTask {

    private final OnlineStudentRepository onlineStudentRepository;

    public OnlineStudentCleanupTask(OnlineStudentRepository onlineStudentRepository) {
        this.onlineStudentRepository = onlineStudentRepository;
    }

    // Every minute: delete sessions not seen for 5 minutes (keeps the table small).
    @Scheduled(fixedRate = 60_000, initialDelay = 60_000)
    public void removeStaleSessions() {
        onlineStudentRepository.deleteStale(LocalDateTime.now().minusMinutes(5));
    }
}
