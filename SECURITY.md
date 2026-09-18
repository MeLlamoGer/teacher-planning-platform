# Security policy

This repository is a public, anonymized portfolio prototype.

## Scope

Please do not use real student, school or credential data when running the project locally.

The public demo seed is intentionally synthetic.

## Reporting

If you find an authorization bypass, credential exposure, unsafe file handling or another security problem, please report it privately to the repository owner rather than publishing exploit details in an issue.

## Known prototype limitations

The repository documents several production concerns that are intentionally outside the current prototype scope, including:

- server-side refresh-session revocation;
- rate limiting;
- production object storage and content inspection;
- security headers/deployment policy;
- comprehensive authorization integration tests;
- structured audit logging.

See [docs/security-model.md](docs/security-model.md) for the current security model and hardening notes.
