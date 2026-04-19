package com.letmelens.backend.model.photo;


import lombok.Getter;

@Getter
public enum Theme {
    STREET_SOCIETY("Street & Society"),
    PEOPLE_EMOTION("People & Emotion"),
    NATURE_ENVIRONMENT("Nature & Environment"),
    ARCHITECTURE_SPACES("Architecture & Spaces"),
    CONCEPTUAL_ARTISTIC("Conceptual & Artistic"),
    DOCUMENTARY_SOCIAL("Documentary & Social");

    private final String label;

    Theme(String label) { this.label = label; }

}
