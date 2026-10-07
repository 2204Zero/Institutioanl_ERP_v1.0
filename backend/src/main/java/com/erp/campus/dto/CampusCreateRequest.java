package com.erp.campus.dto;

public record CampusCreateRequest(
    String name,
    String address,
    Long institutionId

) {}
