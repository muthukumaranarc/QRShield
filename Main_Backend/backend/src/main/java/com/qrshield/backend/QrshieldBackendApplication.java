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
            Dotenv dotenv;
            File localEnv = new File(".env");
            File backendEnv = new File("backend/.env");

            if (localEnv.exists()) {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            } else if (backendEnv.exists()) {
                dotenv = Dotenv.configure().directory("backend").ignoreIfMissing().load();
            } else {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }

            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });

            if (System.getProperty("MONGODB_URI") != null) {
                log.info("Successfully loaded environment variables from backend/.env");
            }
        } catch (Exception e) {
            log.warn("Notice: .env file loading skipped ({}) - relying on standard environment", e.getMessage());
        }
    }
}
