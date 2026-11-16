
package com.seatfinder.seat_finder.repository;

import com.seatfinder.seat_finder.entity.VisitorCounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface VisitorCounterRepository
        extends JpaRepository<VisitorCounter, Integer> {

    @Modifying
    @Transactional
    @Query(value = """
            INSERT IGNORE INTO visitor_counter (id, total_visitors)
            VALUES (:id, :total)
            """, nativeQuery = true)
    int initializeIfMissing(
            @Param("id") Integer id,
            @Param("total") Long total
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    @Query("""
           UPDATE VisitorCounter c
           SET c.totalVisitors = c.totalVisitors + 1
           WHERE c.id = :id
           """)
    int increment(@Param("id") Integer id);
}
