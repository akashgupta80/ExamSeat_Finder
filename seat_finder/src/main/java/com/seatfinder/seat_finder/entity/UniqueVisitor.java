package com.seatfinder.seat_finder.entity;



import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "unique_visitors")
public class UniqueVisitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "visitor_id", nullable = false, unique = true, length = 64)
    private String visitorId;

    @Column(name = "first_visit", nullable = false)
    private LocalDateTime firstVisit;

    public UniqueVisitor() {
    }

    public UniqueVisitor(String visitorId, LocalDateTime firstVisit) {
        this.visitorId = visitorId;
        this.firstVisit = firstVisit;
    }

    public Long getId() {
        return id;
    }

    public String getVisitorId() {
        return visitorId;
    }

    public void setVisitorId(String visitorId) {
        this.visitorId = visitorId;
    }

    public LocalDateTime getFirstVisit() {
        return firstVisit;
    }

    public void setFirstVisit(LocalDateTime firstVisit) {
        this.firstVisit = firstVisit;
    }
}
