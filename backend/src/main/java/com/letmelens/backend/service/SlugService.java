package com.letmelens.backend.service;


import com.letmelens.backend.repo.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class SlugService {

    private final ProfileRepository profileRepository;

    public String generateUniqueSlug(String firstName, String lastName) {
        String base = slugify(firstName + "-" + lastName);

        if (base.isBlank()) {
            base = "profile";
        }

        String candidate = base;
        int i = 1;

        while (profileRepository.existsBySlug(candidate)) {
            candidate = base + "-" + i;
            i++;
        }

        return candidate;
    }

    private String slugify(String input) {
        if (input == null) return "";

        String value = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        return value;
    }
}