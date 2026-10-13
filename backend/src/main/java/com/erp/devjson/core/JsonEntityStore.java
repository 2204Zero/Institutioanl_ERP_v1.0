package com.erp.devjson.core;

import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.BiConsumer;
import java.util.function.Function;

public class JsonEntityStore<T> {

    private final Path filePath;
    private final Class<T> entityClass;
    private final JsonFileStorageEngine storageEngine;
    private final Function<T, Long> getIdFn;
    private final BiConsumer<T, Long> setIdFn;

    private final Map<Long, T> memoryStore = new ConcurrentHashMap<>();
    private final AtomicLong sequenceGenerator = new AtomicLong(1);

    public JsonEntityStore(
            Path filePath,
            Class<T> entityClass,
            JsonFileStorageEngine storageEngine,
            Function<T, Long> getIdFn,
            BiConsumer<T, Long> setIdFn) {
        this.filePath = filePath;
        this.entityClass = entityClass;
        this.storageEngine = storageEngine;
        this.getIdFn = getIdFn;
        this.setIdFn = setIdFn;
        loadFromDisk();
    }

    public synchronized void loadFromDisk() {
        memoryStore.clear();
        List<T> items = storageEngine.readList(filePath, entityClass);
        long maxId = 0;
        for (T item : items) {
            Long id = getIdFn.apply(item);
            if (id != null) {
                memoryStore.put(id, item);
                if (id > maxId) {
                    maxId = id;
                }
            }
        }
        sequenceGenerator.set(maxId + 1);
    }

    public synchronized T save(T entity) {
        Long id = getIdFn.apply(entity);
        if (id == null) {
            id = sequenceGenerator.getAndIncrement();
            setIdFn.accept(entity, id);
        } else {
            if (id >= sequenceGenerator.get()) {
                sequenceGenerator.set(id + 1);
            }
        }
        memoryStore.put(id, entity);
        persistToDisk();
        return entity;
    }

    public Optional<T> findById(Long id) {
        if (id == null) return Optional.empty();
        return Optional.ofNullable(memoryStore.get(id));
    }

    public List<T> findAll() {
        return new ArrayList<>(memoryStore.values());
    }

    public boolean existsById(Long id) {
        if (id == null) return false;
        return memoryStore.containsKey(id);
    }

    public synchronized boolean deleteById(Long id) {
        if (id == null) return false;
        T removed = memoryStore.remove(id);
        if (removed != null) {
            persistToDisk();
            return true;
        }
        return false;
    }

    public long count() {
        return memoryStore.size();
    }

    public synchronized void clear() {
        memoryStore.clear();
        sequenceGenerator.set(1);
        persistToDisk();
    }

    private synchronized void persistToDisk() {
        List<T> list = new ArrayList<>(memoryStore.values());
        // Sort by ID for deterministic, readable file diffs
        list.sort(Comparator.comparing(getIdFn));
        storageEngine.writeListAtomically(filePath, list);
    }

    public Path getFilePath() {
        return filePath;
    }
}
