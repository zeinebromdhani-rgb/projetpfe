package com.monsite.backend.controller;


import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.monsite.backend.service.SchemaService;


@RestController
@RequestMapping("/api/schema")
@CrossOrigin(origins = {"http://localhost:4200"}) // allow Angular dev
public class SchemaController {
  
  @Autowired
  private  SchemaService service;

  // GET /api/schema/public/tables
  @GetMapping("/tables")
  public JsonNode getTables() {
    return service.getTables("public");
  }
}