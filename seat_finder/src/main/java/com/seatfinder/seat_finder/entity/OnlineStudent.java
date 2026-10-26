package com.seatfinder.seat_finder.entity;


import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "online_students")
public class OnlineStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sessionId;

    @Column(nullable = false)
    private LocalDateTime lastSeen;

    public OnlineStudent() {
    }

    public OnlineStudent(String sessionId, LocalDateTime lastSeen) {
        this.sessionId = sessionId;
        this.lastSeen = lastSeen;
    }

    public Long getId() {
        return id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }
}
