package com.giftly.repository;

import com.giftly.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    /**
     * Compte les événements actifs créés par un utilisateur.
     * Utilisé pour appliquer la limite freemium (max 2 en FREE).
     */
    long countByCreatedByIdAndActiveTrue(Long userId);

    /**
     * Retourne tous les événements auxquels un utilisateur participe (actifs ou non).
     */
    @Query("""
        SELECT e FROM Event e
        JOIN e.participants p
        WHERE p.user.id = :userId
        ORDER BY e.createdAt DESC
        """)
    List<Event> findAllByParticipantUserId(@Param("userId") Long userId);
}
