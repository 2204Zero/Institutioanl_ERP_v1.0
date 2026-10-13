package com.erp.devjson.sync;

import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityManagerFactory;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.hibernate.event.service.spi.EventListenerRegistry;
import org.hibernate.event.spi.EventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("dev-json")
public class DevJsonHibernateListenerConfig {

    private final EntityManagerFactory entityManagerFactory;
    private final DevJsonSyncEngine syncEngine;

    @Autowired
    public DevJsonHibernateListenerConfig(EntityManagerFactory entityManagerFactory, DevJsonSyncEngine syncEngine) {
        this.entityManagerFactory = entityManagerFactory;
        this.syncEngine = syncEngine;
    }

    @PostConstruct
    public void registerListeners() {
        try {
            SessionFactoryImplementor sessionFactory = entityManagerFactory.unwrap(SessionFactoryImplementor.class);
            EventListenerRegistry registry = sessionFactory.getServiceRegistry().getService(EventListenerRegistry.class);
            if (registry != null) {
                registry.appendListeners(EventType.POST_COMMIT_INSERT, syncEngine);
                registry.appendListeners(EventType.POST_COMMIT_UPDATE, syncEngine);
                registry.appendListeners(EventType.POST_COMMIT_DELETE, syncEngine);
            }
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(DevJsonHibernateListenerConfig.class)
                    .warn("Could not register DevJson Hibernate listeners: {}", e.getMessage());
        }
    }
}
