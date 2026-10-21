# Security

Workspace is a frontend demonstration. There is no authentication, authorisation or server persistence. Sample roles and local profile values are not security controls. Do not put confidential records or credentials in demo storage.

For a security-related issue, use the repository’s **Security → Report a vulnerability** option if available. Please avoid publishing exploitable details or secrets in a public issue. If private reporting is unavailable, open an issue with a short request for a private reporting channel and no sensitive details.

When connecting a backend, enforce identity, permissions, validation and rate limits on the server. Keep API credentials out of browser bundles, including `VITE_` environment variables. Review all new dependencies and generated content rendering before production use.
