package com.monsite.backend.service;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;


@Service
public class SchemaService {
  private final JdbcTemplate jdbc;
  private final ObjectMapper mapper;

  private static final String SQL = """
    WITH params AS ( SELECT ?::text AS schema_name ),
    tables AS (
      SELECT c.oid AS relid, n.nspname AS schema_name, c.relname AS table_name
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN params p ON p.schema_name = n.nspname
      WHERE c.relkind IN ('r','p')
    ),
    cols AS (
      SELECT t.relid,
             jsonb_agg(jsonb_build_object(
               'name', a.attname,
               'type', pg_catalog.format_type(a.atttypid, a.atttypmod),
               'nullable', NOT a.attnotnull
             ) ORDER BY a.attnum) AS columns
      FROM tables t
      JOIN pg_attribute a ON a.attrelid = t.relid AND a.attnum > 0 AND NOT a.attisdropped
      GROUP BY t.relid
    ),
    pks AS (
      SELECT t.relid, jsonb_agg(a.attname ORDER BY k.seq) AS primary_key
      FROM tables t
      JOIN pg_constraint con ON con.conrelid = t.relid AND con.contype = 'p'
      JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS k(attnum, seq) ON TRUE
      JOIN pg_attribute a ON a.attrelid = t.relid AND a.attnum = k.attnum
      GROUP BY t.relid
    ),
    fks AS (
      SELECT t.relid,
             jsonb_agg(jsonb_build_object(
               'name', con.conname,
               'columns', (SELECT jsonb_agg(a.attname ORDER BY ord)
                           FROM unnest(con.conkey) WITH ORDINALITY AS s(attnum, ord)
                           JOIN pg_attribute a ON a.attrelid = t.relid AND a.attnum = s.attnum),
               'references', jsonb_build_object(
                 'schema', tgt_ns.nspname,
                 'table',  tgt.relname,
                 'columns', (SELECT jsonb_agg(a.attname ORDER BY ord)
                             FROM unnest(con.confkey) WITH ORDINALITY AS s(attnum, ord)
                             JOIN pg_attribute a ON a.attrelid = tgt.oid AND a.attnum = s.attnum)
               )
             ) ORDER BY con.conname) AS foreign_keys
      FROM tables t
      JOIN pg_constraint con ON con.conrelid = t.relid AND con.contype = 'f'
      JOIN pg_class tgt ON tgt.oid = con.confrelid
      JOIN pg_namespace tgt_ns ON tgt_ns.oid = tgt.relnamespace
      GROUP BY t.relid
    )
    SELECT jsonb_agg(
             jsonb_build_object(
               'schema',       t.schema_name,
               'table',        t.table_name,
               'columns',      c.columns,
               'primary_key',  COALESCE(pk.primary_key, '[]'::jsonb),
               'foreign_keys', COALESCE(fk.foreign_keys, '[]'::jsonb)
             )
             ORDER BY t.table_name
           ) AS tables_json
    FROM tables t
    JOIN cols c ON c.relid = t.relid
    LEFT JOIN pks pk ON pk.relid = t.relid
    LEFT JOIN fks fk ON fk.relid = t.relid;
  """;

  public SchemaService(JdbcTemplate jdbc, ObjectMapper mapper) {
    this.jdbc = jdbc;
    this.mapper = mapper;
  }

  public JsonNode getTables(String schema) {
    String json = jdbc.queryForObject(SQL, String.class, schema);
    if (json == null) json = "[]";
    try {
      return mapper.readTree(json);
    } catch (Exception e) {
      throw new RuntimeException("Failed parsing schema JSON", e);
    }
  }
}
