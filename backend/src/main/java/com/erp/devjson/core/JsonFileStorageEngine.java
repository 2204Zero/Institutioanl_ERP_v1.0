package com.erp.devjson.core;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.nio.file.*;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.locks.ReentrantReadWriteLock;

public class JsonFileStorageEngine {

    private final ObjectMapper objectMapper;
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    public JsonFileStorageEngine() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.enable(SerializationFeature.INDENT_OUTPUT);
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    public <T> List<T> readList(Path filePath, Class<T> elementClass) {
        lock.readLock().lock();
        try {
            if (!Files.exists(filePath)) {
                return new ArrayList<>();
            }
            return objectMapper.readValue(
                    filePath.toFile(),
                    objectMapper.getTypeFactory().constructCollectionType(List.class, elementClass)
            );
        } catch (IOException e) {
            throw new RuntimeException("Failed to read JSON data from " + filePath, e);
        } finally {
            lock.readLock().unlock();
        }
    }

    public <T> void writeListAtomically(Path filePath, List<T> list) {
        lock.writeLock().lock();
        Path tempFile = null;
        try {
            Path parentDir = filePath.getParent();
            if (parentDir != null && !Files.exists(parentDir)) {
                Files.createDirectories(parentDir);
            }

            tempFile = Files.createTempFile(parentDir != null ? parentDir : Paths.get("."), "store-", ".tmp");
            objectMapper.writeValue(tempFile.toFile(), list);

            boolean moved = false;
            for (int attempt = 0; attempt < 5; attempt++) {
                try {
                    Files.move(tempFile, filePath, StandardCopyOption.REPLACE_EXISTING, StandardCopyOption.ATOMIC_MOVE);
                    moved = true;
                    break;
                } catch (AtomicMoveNotSupportedException e) {
                    try {
                        Files.move(tempFile, filePath, StandardCopyOption.REPLACE_EXISTING);
                        moved = true;
                        break;
                    } catch (IOException retryEx) {
                        if (attempt == 4) throw retryEx;
                        try { Thread.sleep(20L * (attempt + 1)); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    }
                } catch (IOException e) {
                    try {
                        Files.copy(tempFile, filePath, StandardCopyOption.REPLACE_EXISTING);
                        Files.deleteIfExists(tempFile);
                        moved = true;
                        break;
                    } catch (IOException retryEx) {
                        if (attempt == 4) throw retryEx;
                        try { Thread.sleep(20L * (attempt + 1)); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                    }
                }
            }
        } catch (IOException e) {
            if (tempFile != null) {
                try {
                    Files.deleteIfExists(tempFile);
                } catch (IOException ignored) {}
            }
            throw new RuntimeException("Failed to atomically write JSON data to " + filePath, e);
        } finally {
            lock.writeLock().unlock();
        }
    }
}
