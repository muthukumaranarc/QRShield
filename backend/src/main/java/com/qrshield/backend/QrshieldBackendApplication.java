package com.qrshield.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;

@SpringBootApplication
public class QrshieldBackendApplication {

    private static final Logger log = LoggerFactory.getLogger(QrshieldBackendApplication.class);

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(QrshieldBackendApplication.class, args);
    }

    private static void loadDotEnv() {
        try {
            // Load from current working directory
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();

            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });

            // Also check parent directory if started from backend subdirectory
            File parentEnv = new File("../.env");
            if (parentEnv.exists()) {
                Dotenv parentDotenv = Dotenv.configure()
                        .directory("../")
                        .ignoreIfMissing()
                        .load();
                parentDotenv.entries().forEach(entry -> {
                    if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
            }

            if (System.getProperty("MONGODB_URI") != null) {
                log.info("Successfully loaded environment variables from .env file.");
            }
        } catch (Exception e) {
            log.warn("Notice: .env file loading skipped ({}) - relying on standard environment", e.getMessage());
        }
    }
}
