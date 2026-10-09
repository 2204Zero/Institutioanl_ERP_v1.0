package com.erp;

import org.flywaydb.core.Flyway;

public class Repair {
    public static void main(String[] args) {
        Flyway flyway = Flyway.configure()
            .dataSource("jdbc:postgresql://localhost:5432/edupulse_erp", "edupulse_admin", "edupulse_secure_password_2026")
            .locations("classpath:db/migration")
            .load();
        
        System.out.println("Starting repair...");
        flyway.repair();
        System.out.println("Repair complete.");
    }
}
