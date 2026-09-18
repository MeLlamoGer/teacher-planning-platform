# Authorization and security model

The most interesting engineering constraint in this project is not authentication itself; it is keeping class-level access consistent across several roles.

## Roles

| Role | Typical scope |
| --- | --- |
| `DIRECTORA` | school-wide administration |
| `SECRETARIA` | school-wide operational/read access |
| `MAESTRA` | permanently assigned classes |
| `SUPLENTE` | temporarily assigned classes within a date window |

## Authentication

The API uses two JWTs:

- short-lived access tokens are sent as Bearer tokens;
- refresh tokens are stored in an HTTP-only cookie.

The frontend retries a request once after a 401 by refreshing the access token. Refresh-token rotation is used when a new access token is issued.

## Class-level authorization

Role checks alone are insufficient. A teacher with the `MAESTRA` role should not automatically read or modify every class.

The backend therefore scopes queries to:

- explicit `UsuarioClase` assignments for teachers;
- active `AccesoTemporalSuplencia` windows for substitutes;
- unrestricted class scope only for the administrative roles that require it.

The same rule is applied to nested resources. For example, an attachment is authorized through the class of its parent lesson plan rather than only by checking whether the requester is "a teacher".

## Hardening performed for the public portfolio version

While reviewing the early-stage code for publication, several access-control edge cases were tightened:

- class/year filters are now combined instead of allowing one filter to overwrite another;
- lesson-plan creation and bulk creation verify class access, not only update/delete operations;
- attachment download/delete checks the parent class scope;
- uploaded filenames are normalized and stored under generated UUID filenames;
- synthetic demo credentials are supplied only through environment variables.

Those changes are intentionally documented because finding and fixing authorization gaps is part of the engineering work, not something to hide from a portfolio.
