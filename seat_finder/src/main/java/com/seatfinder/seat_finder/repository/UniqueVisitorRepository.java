
package com.seatfinder.seat_finder.repository;

import com.seatfinder.seat_finder.entity.UniqueVisitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

public interface UniqueVisitorRepository extends JpaRepository<UniqueVisitor, Long> {

    @Modifying
    @Transactional
    @Query(value = """
            INSERT IGNORE INTO unique_visitors (visitor_id, first_visit)
            VALUES (:visitorId, :firstVisit)
            """, nativeQuery = true)
    int insertIfNew(
            @Param("visitorId") String visitorId,
            @Param("firstVisit") LocalDateTime firstVisit
    );
}
