package com.AlexiSatea.backend.controller;

import com.AlexiSatea.backend.dto.CountryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/")
public class AdminController {
    @GetMapping("/countries")
    public List<CountryDto> countries() {
        return Arrays.stream(Locale.getISOCountries())
                .map(code -> new CountryDto(
                        code,
                        new Locale("", code).getDisplayCountry(Locale.ENGLISH)
                ))
                .sorted(Comparator.comparing(CountryDto::label, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }
}



