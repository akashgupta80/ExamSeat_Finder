
package com.seatfinder.seat_finder.repository;

import com.seatfinder.seat_finder.entity.VisitorCounter;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitorCounterRepository
        extends JpaRepository<VisitorCounter, Integer> {
}
