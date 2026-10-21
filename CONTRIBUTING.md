# Contributing

Thanks for helping make Workspace more useful.

## Local setup

Use Node.js 22.22+ and run `npm ci`, followed by `npm run dev`. Keep changes focused and describe the problem, the change and how you checked it.

Before opening a pull request:

```sh
npm run format
npm run check
npm run build
```

For UI changes, review both themes and a narrow viewport. Include screenshots of changed layouts when helpful. Preserve keyboard focus, accessible labels, reduced-motion behaviour and native form semantics.

## Keep the starter reusable

- Put shared visual decisions in the tokens and reusable components.
- Keep business-specific pages separate from `AppShell`.
- Use fictional data and `example.com` addresses.
- Do not add secrets, production records, private screenshots or customer branding.
- Discuss new runtime dependencies and large feature additions in an issue first.
- Keep third-party copyright and licence notices intact.

This repository intentionally provides a frontend starter. Backend features should be integrations or documented extension points.
