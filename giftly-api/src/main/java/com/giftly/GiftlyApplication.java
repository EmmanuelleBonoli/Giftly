package com.giftly;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GiftlyApplication {

    public static void main(String[] args) {
        SpringApplication.run(GiftlyApplication.class, args);
    }
}
