
package com.seatfinder.seat_finder.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "visitor_counter")
public class VisitorCounter {

    @Id
    private Integer id;

    @Column(name = "total_visitors", nullable = false)
    private Long totalVisitors;

    public VisitorCounter() {
    }

    public VisitorCounter(Integer id, Long totalVisitors) {
        this.id = id;
        this.totalVisitors = totalVisitors;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Long getTotalVisitors() {
        return totalVisitors;
    }

    public void setTotalVisitors(Long totalVisitors) {
        this.totalVisitors = totalVisitors;
    }
}
