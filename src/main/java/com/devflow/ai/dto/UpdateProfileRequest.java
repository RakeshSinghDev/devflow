package com.devflow.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @NotBlank(message = "Name cannot be blank")
    private String name;

    private String jobTitle;

    private String bio;

    private String timezone;
}
