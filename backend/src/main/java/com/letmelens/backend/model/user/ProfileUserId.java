package com.letmelens.backend.model.user;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode
@Embeddable
public class ProfileUserId implements Serializable {

    @Column(name = "profile_id", nullable = false)
    private UUID profileId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

}