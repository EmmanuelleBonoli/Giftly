package com.giftly.repository;

import com.giftly.model.WishItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishItemRepository extends JpaRepository<WishItem, Long> {

    List<WishItem> findAllByListId(Long listId);
}
