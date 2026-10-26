# Customisation guide

## 1. Brand and navigation

`src/config.ts` is the main entry point for your product’s name, navigation groups, page descriptions and feature search entries. The logo is a small original CSS mark in `BrandMark` inside `AppShell.tsx`; replace it with your own component or asset. Update `public/favicon.svg`, the page description/title in `index.html`, and the GitHub links when creating your own product.

Add pages as child routes of `AppShell` in `App.tsx`. The shell remains mounted, preserving the sidebar DOM and scroll position while React Router updates the content outlet. Use `Link` for internal navigation. Reserve ordinary external links or full document navigation for cases that need them.

Navigation entries are searchable automatically. Add deeper features to `dashboardConfig.features`:

```ts
{
  label: 'Customer imports',
  to: '/customers?section=imports',
  icon: IconUpload,
  description: 'Upload and review customer records',
}
```

On the destination page, give the target `Card` an `id="imports"` and include an `h2`. The shell scrolls to that section, focuses its heading and briefly highlights the card. Reduced-motion preferences are respected. Query parameters are inside the hash route, for example `/#/customers?section=imports`.

## 2. Theme foundations

The core CSS tokens are in `src/styles/tokens.css`:

| Token                                               | Purpose                              |
| --------------------------------------------------- | ------------------------------------ |
| `--page`, `--surface`, `--surface-soft`, `--inset`  | Background layers                    |
| `--ink`, `--muted`, `--faint`                       | Text hierarchy                       |
| `--edge`, `--edge-strong`                           | Borders and controls                 |
| `--accent`, `--accent-hover`, `--accent-rgb`        | Brand actions and interaction states |
| `--link`                                            | Theme-aware link contrast            |
| `--teal`, `--violet`, `--blue`, `--rose`, `--amber` | Semantic/card accent colours         |
| `--radius`, `--radius-control`                      | Surface and control corners          |
| `--header-height`, `--sidebar-width`                | Shared shell geometry                |
| `--font-body`, `--font-heading`                     | Typography                           |

Themes are represented by `data-theme="light|dark"` on the root element; accent choices use `data-accent`. The preference may be `system`, but the root attribute always holds the resolved light/dark value. System changes are observed while the app is open. The small pre-paint script in `index.html` prevents a theme flash.

The Tabler stylesheet is imported once in `main.tsx`, followed by the tokens and application overrides. Primitives retain Tabler classes such as `btn`, `form-control`, `form-select`, `card` and `progress`. Avoid importing Tabler’s imperative JavaScript bundle alongside React-owned controls.

Inter and Sora are bundled through Fontsource. No third-party font request is needed at runtime. If replacing a font, keep its licence with the distribution.

## 3. Responsive behaviour

- Desktop: fixed header, 242px rail, scrollable navigation and anchored account footer.
- At 860px and below: the rail is replaced with a rounded search trigger. Account settings remain accessible from the header avatar.
- Dashboard grids collapse progressively. Quick actions use two columns on narrow screens.
- At 600px and below: table rows become labelled cards, page action buttons share the full row, form grids stack and dialog actions fill the available width.
- Search and record dialogs use the native dialog top layer, with Escape dismissal and browser focus containment.
- The floating guide clamps to the viewport, supports desktop resizing and can expand. The fullscreen view makes the underlying shell inert until closed.

The shell uses normal document scrolling for content. The sidebar’s navigation region scrolls independently. Avoid remounting `AppShell` with a pathname key, or replacing `Link` with `window.location`, which would discard this behaviour.

## 4. Replace demo state

`WorkspaceProvider` intentionally keeps its data adapter small. It contains projects, people, activity, preferences and transient notifications. Project and team mutations update the local activity feed.

For production, replace the data and mutation functions with your API client or query library. Keep loading, error, empty and success states visible at the page level. Use stable IDs and validate all inputs server-side. Demo role labels are display values; implement real permission checks on your server and filter navigation based on the current authenticated user.

Browser keys:

```text
  workspace.demo.v1          Projects, people, teams and activity
workspace.preferences.v1  Theme, accent, demo profile and workspace label
  workspace.overview.hidden.v1 Overview display preferences only
```

The parser falls back to seed data when stored JSON is unavailable or malformed. Older saved records receive default teams. Storage failures keep the session usable. Reset affects these keys only. Increment the version when making incompatible changes to the persisted shape.

### Current overview patterns

`Overview.tsx` mirrors the current workspace organization: quick actions, work-area desks, current-record glance indicators, actionable queues and scoped summary cards. Fixed billing and room examples are labelled as fictional and retain their basis in CSV exports. Replace those examples with aggregate endpoints scoped by the authenticated account’s server-side permissions. Display preferences are not permission controls.

`GroupedNavigation.tsx` keeps desktop sections in compact flyouts with normal links and Escape support. Smaller screens retain search navigation. Keep navigation groups and search entries in `config.ts` aligned with your backend permissions.

`src/styles/workspace-current.css` layers these patterns over the original shared elements. The spring controller is documented in [MOTION.md](MOTION.md).

The CSV exporter quotes values and neutralises spreadsheet formula prefixes. Keep that behaviour when adapting exports to user-supplied data.

## 5. Replace the guide

`GuidePanel.tsx` is a UI example with a deterministic local matcher. Its `reply()` function turns a message into relevant navigation links. It does not stream responses, call an LLM, render generated HTML or read account permissions.

To connect an assistant:

1. Send messages to an authenticated endpoint on your own server.
2. Derive the current user’s permissions on the server; treat the current page label as context only.
3. Keep model credentials out of browser code and Vite environment variables.
4. Add cancellation, streaming, rate limits and clear failure states for the chosen API.
5. Render Markdown through a safe renderer; validate destinations against your route registry.
6. Persist conversations on your backend by authenticated account if needed.

You can also remove `GuidePanel` from `AppShell` entirely. Search navigation works independently.

## 6. Deployment

Build with `npm ci && npm run build`. Publish `dist/`.

### GitHub Pages

The repository includes `.github/workflows/deploy-pages.yml`, run manually through Actions. Choose GitHub Actions as the Pages source first. Relative assets and hash routing support a repository URL such as `https://your-name.github.io/your-repo/`.

### Railway or another static host

Use `npm ci && npm run build` as the build command and `dist` as the publish directory where supported. For a Railway service without static-host detection, use an approved static file server package and bind to `0.0.0.0` on the platform’s `$PORT`. Vite’s development server is for local development.

### Clean routes

To switch from `HashRouter` to `BrowserRouter`, configure a server fallback to `index.html` for unknown application paths. Set Vite’s `base` to your hosting root or subdirectory as required. Keep API paths outside the SPA fallback.

## 7. Verify your adaptation

Build and type-check after your changes. Manually review light/dark modes, narrow/wide viewports, long labels, keyboard navigation, empty data and service failures. Search should open the correct page and scroll to a visible section heading. Verify focus returns to the opener after closing a dialog.
