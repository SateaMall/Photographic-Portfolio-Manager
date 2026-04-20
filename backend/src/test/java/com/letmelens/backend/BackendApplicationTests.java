package com.letmelens.backend;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("dev")
class BackendApplicationTests {

	@TestConfiguration
	static class TestConfig {
		@Bean
		JavaMailSender javaMailSender() {
			return Mockito.mock(JavaMailSender.class);
		}
	}

	@Test
	void contextLoads() {
	}

}
