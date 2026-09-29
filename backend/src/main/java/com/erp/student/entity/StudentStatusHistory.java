package com.erp.student.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_status_history")
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudentStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private StudentStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StudentStatus newStatus;

    @Column(length = 500)
    private String reason;

    @Column(length = 100)
    private String changedBy;

    @Column(nullable = false)
    private java.time.LocalDate effectiveDate;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime changedAt;

    public StudentStatusHistory() {
    }

    public StudentStatusHistory(Student student, StudentStatus previousStatus, StudentStatus newStatus, String reason, String changedBy, java.time.LocalDate effectiveDate) {
        this.student = student;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.reason = reason;
        this.changedBy = changedBy;
        this.effectiveDate = effectiveDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public StudentStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(StudentStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public StudentStatus getNewStatus() {
        return newStatus;
    }

    public void setNewStatus(StudentStatus newStatus) {
        this.newStatus = newStatus;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getChangedBy() {
        return changedBy;
    }

    public void setChangedBy(String changedBy) {
        this.changedBy = changedBy;
    }

    public LocalDateTime getChangedAt() {
        return changedAt;
    }

    public void setChangedAt(LocalDateTime changedAt) {
        this.changedAt = changedAt;
    }

    public java.time.LocalDate getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(java.time.LocalDate effectiveDate) {
        this.effectiveDate = effectiveDate;
    }
}
