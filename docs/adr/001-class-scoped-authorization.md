# ADR 001 — Class-scoped authorization

**Status:** accepted for the public prototype snapshot.

## Context

A simple role check is not enough for this domain.

Two users may both have the `MAESTRA` role while being assigned to different classes. A substitute teacher may have access to one class only for a date window. Nested resources such as students, attachments and adaptations do not carry a user ID directly, so authorization has to follow their relationships back to a class.

## Decision

Authorization is evaluated in two layers:

1. **role capability** — whether a role may perform the type of operation;
2. **resource scope** — whether the caller has access to the relevant class.

Class scope is resolved centrally by `src/lib/access.ts`.

- directors/secretaries receive the school-wide scope appropriate to their role;
- teachers must have a `UsuarioClase` assignment;
- substitutes must have an active `AccesoTemporalSuplencia` whose date window includes today.

Nested resource services resolve their parent planning/student/class before write or sensitive read operations.

## Consequences

This adds more database lookups than a role-only model, but prevents object-ID manipulation from becoming an authorization bypass.

For a larger production system, this could be optimized with policy-aware queries or database-level authorization while retaining the same domain rule.
