package com.erp.academic.room.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomUpdateRequest {

    @NotBlank(message = "Room name is required")
    private String name;

    @NotNull(message = "Room capacity is required")
    @Min(value = 1, message = "Room capacity must be at least 1")
    private Integer capacity;

    private Boolean isActive;
}
