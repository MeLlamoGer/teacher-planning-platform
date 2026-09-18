# Authorization and security model

The most interesting engineering constraint in this project is not authentication itself; it is keeping class-level access consistent across several roles and nested resources.

## Roles

| Role | Typical scope |
| --- | --- |
| `DIRECTORA` | school-wide administration |
| `SECRETARIA` | school-wide operational/read access |
| `MAESTRA` | permanently assigned classes; writes limited to authored lesson plans |
| `SUPLENTE` | temporarily assigned classes within a date window |

## Authentication

The API uses two JWTs:

- short-lived access tokens are sent as Bearer tokens;
- refresh tokens are stored in an HTTP-only, SameSite cookie.

The browser does **not** persist the bearer access token in localStorage/sessionStorage. On reload, the React app attempts to restore the session through the HTTP-only refresh cookie and then fetches the authenticated user.

That design keeps the long-lived credential inaccessible to JavaScript and reduces the exposure of the short-lived access token to browser storage.

## Class-level authorization

Role checks alone are insufficient. A teacher with the `MAESTRA` role should not automatically read or modify every class.

The backend therefore scopes queries to:

- explicit `UsuarioClase` assignments for teachers;
- active `AccesoTemporalSuplencia` windows for substitutes;
- unrestricted class scope only for administrative roles that require it.

The same rule is applied to nested resources. For example, an attachment is authorized through the class of its parent lesson plan rather than only by checking whether the requester is "a teacher".

## Lesson-plan ownership

Class access answers *which classes a user can work with*. It does not automatically grant write ownership over every plan in the class.

Teachers may read plans within their assigned class, but write operations on a plan and its attachments/adaptations require the teacher to be the original author. Directors retain administrative write access.

This mirrors the separate comment rule: supervisory comments can be visible to the relevant author without turning every same-class teacher into an editor.

## Temporary substitute windows

Permanent teacher assignment and substitute access are different domain concepts.

Substitute windows:

- require a user whose role is actually `SUPLENTE`;
- reject end dates before start dates;
- reject overlapping active windows for the same substitute/class pair;
- are evaluated at request time when determining access.

## Curriculum integrity

Authorization is only one half of write safety.

Lesson-plan writes also validate that:

- selected units belong to the selected curriculum space;
- selected competencies belong to those units and the class tramo;
- selected content items belong to the selected units, class tramo and class level.

This prevents a client from constructing impossible curriculum combinations by submitting arbitrary UUIDs.

## Attachment handling

Uploads are restricted to configured image/PDF MIME types and a maximum size.

Files are stored under generated UUID filenames rather than user-provided filesystem paths. If a database insert fails after writing a file, the file is removed as compensation. On deletion, the database reference is removed before best-effort filesystem cleanup so the application does not retain a live record pointing to a missing file.

Attachment downloads inherit class authorization from their parent lesson plan.

## Hardening performed for the public portfolio version

While reviewing the early-stage code for publication, several access-control edge cases were tightened:

- class/year filters are combined instead of allowing one filter to overwrite another;
- lesson-plan creation and bulk creation verify class access, not only update/delete operations;
- teacher plan writes now enforce author ownership;
- attachment/student/adaptation routes resolve nested IDs back to their parent class/plan;
- direct class-detail endpoints respect caller scope;
- curriculum and reporting query parameters are validated;
- uploaded/downloaded filenames are normalized;
- access tokens were moved out of browser storage;
- synthetic demo credentials are supplied only through environment variables.

Those changes are intentionally documented because finding and fixing authorization gaps is part of the engineering work, not something to hide from a portfolio.

## Remaining production concerns

This remains a prototype. A production deployment should additionally consider:

- refresh-token revocation/session tracking;
- rate limiting and abuse protection;
- object storage plus malware/content inspection for uploads;
- structured audit logs for sensitive school operations;
- comprehensive authorization integration tests;
- security headers and deployment-specific CORS policy.
