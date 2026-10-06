package com.example.demo.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationDispatcher {

    private static final Logger log = LoggerFactory.getLogger(NotificationDispatcher.class);

    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Singhal
    // MODULE: #6 Notification Service
    // PENDING: RabbitMQ Container & RabbitTemplate Configuration
    // ACTION REQUIRED ONCE READY: Inject RabbitTemplate to publish these notification 
    // events to the appropriate RabbitMQ exchange for asynchronous processing.
    // ============================================================================
    // ============================================================================
    // TODO: [INTEGRATION DEPENDENCY]
    // OWNER: Palak
    // MODULE: #41 Attendance Alerts
    // PENDING: Low Attendance Trigger Logic
    // ACTION REQUIRED ONCE READY: Wire this dispatcher into the attendance service to 
    // trigger low-attendance or absence alerts.
    // ============================================================================

    public void dispatchAlert(String alertType, String recipientEmail, String message) {
        log.info("DISPATCHING NOTIFICATION -> Type: {} | Recipient: {} | Message: {}", alertType, recipientEmail, message);
    }
}
