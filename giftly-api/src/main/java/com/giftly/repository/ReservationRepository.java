package com.giftly.repository;

import com.giftly.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByItemId(Long itemId);

    boolean existsByItemId(Long itemId);

    /** Vérifie si un utilisateur a déjà réservé un souhait donné */
    boolean existsByItemIdAndReservedById(Long itemId, Long userId);
}
