package com.example.demo.institution.dto;

import java.util.List;

public record InstitutionResponse(
        Long id,
        String code,
        String name,
        String address,
        String website,
        List<String> campuses
) {}
