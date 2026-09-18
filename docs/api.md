# API surface

The public snapshot exposes a JSON REST API under `/api/v1`.

This is a compact map of the main routes rather than generated OpenAPI documentation.

## Authentication

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Validate credentials, return access token and set HTTP-only refresh cookie |
| POST | `/auth/refresh` | Rotate refresh token and return a new short-lived access token |
| POST | `/auth/logout` | Clear the refresh cookie |
| GET | `/auth/me` | Return the authenticated user |

## Classes and academic years

| Method | Route | Access |
| --- | --- | --- |
| GET | `/anos-lectivos` | authenticated |
| POST/PUT | `/anos-lectivos` | director |
| GET | `/clases` | class-scoped |
| GET | `/clases/:id` | class-scoped |
| POST/PUT | `/clases` | director |
| POST/DELETE | `/clases/:id/usuarios` | director |

## Temporary substitute access

| Method | Route | Access |
| --- | --- | --- |
| GET | `/suplencias` | director |
| POST | `/suplencias` | director |
| PUT | `/suplencias/:id` | director |

Substitute access is time-bounded and overlapping active assignments for the same substitute/class pair are rejected.

## Curriculum

| Method | Route |
| --- | --- |
| GET | `/curriculum/espacios` |
| GET | `/curriculum/unidades?espacioId=...` |
| GET | `/curriculum/competencias` |
| GET | `/curriculum/competencias-especificas?unidadCurricularId=...&tramo=...` |
| GET | `/curriculum/bloques-contenido?unidadCurricularId=...&tramo=...&nivel=...` |

Curriculum query parameters are validated before reaching the data layer.

## Lesson planning

| Method | Route | Notes |
| --- | --- | --- |
| GET | `/planificaciones` | filtered by caller's allowed classes |
| POST | `/planificaciones` | teacher/director; validates class and curriculum integrity |
| POST | `/planificaciones/bulk` | creates the same planning template across multiple dates |
| GET | `/planificaciones/:id` | class-scoped |
| PUT | `/planificaciones/:id` | class-scoped |
| DELETE | `/planificaciones/:id` | class-scoped |
| POST | `/planificaciones/:id/archivos` | controlled image/PDF upload |

A write cannot combine arbitrary curriculum IDs: selected units must belong to the chosen curriculum space, competencies must match the class tramo, and content items must match the class level/tramo.

## Students and support

| Method | Route |
| --- | --- |
| GET/POST | `/clases/:claseId/estudiantes` |
| PUT | `/clases/:claseId/estudiantes/:estudianteId` |
| GET/POST | `/estudiantes/:estudianteId/dificultades` |
| GET | `/clases/:claseId/dificultades` |
| PUT/DELETE | `/dificultades/:id` |
| GET/POST | `/planificaciones/:planificacionId/adaptaciones` |
| PUT/DELETE | `/adaptaciones/:id` |

Nested resource IDs are resolved back to their parent class before authorization.

## Attachments and comments

| Method | Route |
| --- | --- |
| GET | `/archivos/:id/download` |
| DELETE | `/archivos/:id` |
| GET/POST | `/planificaciones/:planificacionId/comentarios` |
| PUT/DELETE | `/comentarios/:id` |

Attachments inherit authorization from the parent lesson plan/class.

## Reporting

| Method | Route |
| --- | --- |
| GET | `/reportes/cobertura` |
| GET | `/reportes/alertas` |

Requested filters are intersected with the caller's authorized class set rather than replacing it.
