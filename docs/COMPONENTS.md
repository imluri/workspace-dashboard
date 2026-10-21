# Component guide

Primitives are exported from `src/components/ui.tsx`. They use standard HTML and React props, with Tabler CSS classes and the shared theme tokens.

| Component     | Use                                     | Key props                                                         |
| ------------- | --------------------------------------- | ----------------------------------------------------------------- |
| `Button`      | Consistent actions                      | `variant`: primary, secondary, ghost, danger; native button props |
| `IconButton`  | Centred icon-only action                | Required accessible `label`; native button props                  |
| `PageHeading` | Page identity and actions               | `eyebrow`, `title`, `description`, `actions`                      |
| `Card`        | Rounded themed surface/section          | `id`, `className`, children                                       |
| `Field`       | Label, hint and validation message      | `label`, `htmlFor`, `hint`, `error`, `optional`                   |
| `Dialog`      | Controlled native modal                 | `open`, `onClose`, `title`, `description`, children               |
| `Badge`       | Quiet category or semantic label        | `tone`, `dot`, children                                           |
| `StatusBadge` | Common demo status mapping              | `status`                                                          |
| `Avatar`      | Initials-based identity                 | `name`, `tone`, `size`                                            |
| `AvatarStack` | Compact team list                       | `names`                                                           |
| `Progress`    | Labelled progress indicator             | `value`, `label`                                                  |
| `EmptyState`  | Explain missing results and next action | `title`, `description`, `action`                                  |
| `ToastRegion` | Provider-driven transient feedback      | Rendered once in the shell                                        |

## Button defaults

`Button` defaults to `type="button"`. Pass `type="submit"` explicitly inside forms. Native disabled behaviour is preserved. Use `Link` with `className="btn btn-primary"` when the action navigates, rather than nesting a link inside a button.

```tsx
<Button onClick={save}>Save changes</Button>
<Button variant="secondary" onClick={cancel}>Cancel</Button>
<IconButton label="Open settings" onClick={openSettings}>
  <IconSettings size={19} />
</IconButton>
```

## Fields and errors

The `htmlFor` prop must match the nested control’s `id`. Pass `aria-describedby` to connect help or errors to that control; the generated IDs are `${htmlFor}-hint` and `${htmlFor}-error`. Set `aria-invalid` when appropriate. Each error message is announced with `role="alert"`.

```tsx
<Field label="Email address" htmlFor="contact-email" error={error}>
  <input
    id="contact-email"
    className="form-control"
    type="email"
    required
    aria-invalid={!!error}
    aria-describedby={error ? 'contact-email-error' : undefined}
  />
</Field>
```

## Dialogs

Use state to control `open`. The browser handles focus containment and restoration. Escape, backdrop clicks and the close button call `onClose`. Add `data-autofocus` to the first field when it should receive initial focus instead of the close button. Pair a `.dialog-body` wrapper with `.dialog-actions` for consistent spacing.

Keep destructive actions behind a concrete explanation and a clear confirmation label. See `Settings.tsx` for the reset example.

## Responsive tables

Use semantic `<table>`, `<thead>`, `<tbody>` and header cells. Apply `.data-table` inside `.table-wrap`, then add a matching `data-label` on each body cell. The first column becomes the mobile card title. The remaining cells show their labels on the left and values on the right below 600px.

```tsx
<div className="table-wrap">
  <table className="data-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td data-label="Name">Example record</td>
        <td data-label="Status">Active</td>
      </tr>
    </tbody>
  </table>
</div>
```

For complex spreadsheet-style interfaces, choose a table library with the necessary sorting, virtualisation and accessibility support. This starter demonstrates a simple responsive list.

## Layout utilities

- `.form-grid`: two columns, stacked below 600px.
- `.filter-toolbar`: aligned search, dropdowns, result count and view controls.
- `.element-demo`: wrapping action row with consistent gaps.
- `.panel-heading`: title/description and trailing action.
- `.details-list`: stacked label/value rows.
- `.tone-teal`, `.tone-violet`, `.tone-blue`, `.tone-rose`, `.tone-amber`: semantic colour variables.

## Notifications

```tsx
const { toast } = useWorkspace();
toast('Changes saved.');
toast('Nothing was sent from this local demo.', 'info');
toast('The request could not be completed.', 'danger');
```

Up to three messages are shown, dismissible and automatically removed after six seconds. Persistent field or service failures should also appear near the relevant form or content, so the user can act on them after a toast disappears.
