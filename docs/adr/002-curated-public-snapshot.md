# ADR 002 — Curated public snapshot instead of raw prototype dump

**Status:** accepted.

## Context

The development folder includes historical UI iterations, generated build output, curriculum import work and early experiments. Publishing everything would make the repository larger without making the engineering easier to review.

The project also models student support information, so the public version must make the privacy boundary explicit even though the published demo data is synthetic.

## Decision

Publish a curated snapshot:

- keep the domain model and backend modules that show the architecture;
- keep a smaller representative React UI;
- replace any demo people with unmistakably synthetic records;
- configure secrets only through environment variables;
- document security decisions and known next steps;
- omit historical generated output and nonessential prototype assets.

## Consequences

The repository is easier to review, but it is intentionally not a byte-for-byte archive of the original prototype. The README states that distinction explicitly.
