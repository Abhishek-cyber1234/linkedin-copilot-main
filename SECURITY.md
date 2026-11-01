# Security Policy

## Supported versions

Only the latest version on the `main` branch receives security fixes.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

Report them privately through GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability): open the repository's **Security** tab and choose **Report a vulnerability**.

Include a description, steps to reproduce, and the impact you expect. You should get a reply within 7 days.

## Known design limitation

LinkedIn Copilot has **no built-in authentication**. Anyone who can reach a deployment can read and edit its data. This is by design for a single-user tool. Keep your deployment URL private or put it behind your host's access controls (for example Netlify password protection, Vercel Deployment Protection, Cloudflare Access, or a reverse proxy with basic auth). Reports that only describe this lack of authentication are out of scope.
