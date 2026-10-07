package com.example.demo.institution.service;

import com.example.demo.institution.dto.InstitutionResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InstitutionService {

    public InstitutionResponse getInstitutionDetails() {
        return new InstitutionResponse(
                1L,
                "INST-ERP-01",
                "Apex Institute of Technology and Management",
                "Knowledge Park, Phase II, Sector 62",
                "https://www.apexinstitute.edu",
                List.of("Main Campus (North)", "City Center Campus (South)", "Innovation Tech Park")
        );
    }

    public InstitutionResponse updateInstitution(String name, String address, String website) {
        return new InstitutionResponse(
                1L,
                "INST-ERP-01",
                name,
                address,
                website,
                List.of("Main Campus (North)", "City Center Campus (South)", "Innovation Tech Park")
        );
    }
}
