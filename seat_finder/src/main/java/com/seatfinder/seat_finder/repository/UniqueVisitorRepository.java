package com.seatfinder.seat_finder.repository;



import com.seatfinder.seat_finder.entity.UniqueVisitor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UniqueVisitorRepository extends JpaRepository<UniqueVisitor, Long> {

    boolean existsByVisitorId(String visitorId);
}
