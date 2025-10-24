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
  @GetMapping("/{schema}/tables")
  public JsonNode getTables(@PathVariable String schema) {
    return service.getTables(schema);
  }
}