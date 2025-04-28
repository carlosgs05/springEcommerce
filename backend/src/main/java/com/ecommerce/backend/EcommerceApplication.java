package com.ecommerce.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication	// This annotation is a convenience annotation that adds @Configuration, @EnableAutoConfiguration, and @ComponentScan to the class.																																					
public class EcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EcommerceApplication.class, args);
	}

}																			