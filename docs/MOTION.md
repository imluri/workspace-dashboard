# Motion and layered dialogs

The template uses a small, framework-neutral controller in `src/lib/motion.ts`. It applies physical springs to selected cards, buttons, flyouts and native dialogs. Content keeps normal browser scrolling. The header and navigation rail do not move with page entry effects.

## Spring behavior

The default spring uses unit mass, a 0.5 second response and damping ratio 0.85. Stiffness is derived as `(2π / response)²`, approximately 157.91 at the default response. Friction is approximately 21.36. Retargeting preserves both position and velocity; it does not restart an easing curve from zero. Animation finishes when the displacement and speed settle, without an artificial loading delay.

`animatePortalElement(element, target, options)` controls `x`, `y`, `scale` and `opacity`. The CSS custom properties compose with the element’s existing transform. Reduced motion applies the target immediately, including when the system preference changes during an animation.

`installPortalMotion()` runs once in `AppShell`. Its returned cleanup supports React Strict Mode and unmounting. Page changes call `revealPortalElements()` for the new content. Do not install a second independent controller on the same document.

## Layered creation example

Choose **New project**, enter a name and description, then choose **New team** beside the team field. A second native dialog opens above the project. The browser’s modal top layer keeps the covered form and page inert. Closing the child restores focus to its opener. Creating a team selects it in the original project draft without navigating away or clearing other fields.

The two forms are siblings in React, so there are no nested HTML forms. A success checkmark appears only after the demo mutation is applied. Teams, projects and activity are fictional local records. No accounts, permissions or email are created.

## Reuse `Dialog`

```tsx
<Dialog open={childOpen} onClose={() => setChildOpen(false)} title="New client">
  <form className="dialog-body" onSubmit={createClient}>
    {/* Real labels, hints, validation and fields */}
  </form>
</Dialog>
```

Keep the parent mounted while the child is open. Use `openPortalLayer(dialog)` and `closePortalLayer(dialog)` only through the shared wrapper or the framework-neutral adapter when integrating elsewhere. The close spring retains native inertness until the dialog actually closes. Escape targets the highest open layer. Pressing Escape repeatedly must not submit either form.

The dedicated header handle has bounded drag resistance using a rubber-band constant of 0.55 on touch. A drag may dismiss a dialog only beyond its dismissal threshold. Body scrolling remains native and is not converted into a gesture. Pass `busy` to `Dialog` while a real network mutation is in flight to prevent cancellation, and show actual server completion before displaying success. The framework-neutral adapter recognizes `aria-busy="true"` and `data-layer-busy="true"` too.

For production, preserve drafts until a write is acknowledged, validate on the server, enforce permissions on the creation endpoint and refresh the parent’s option list using the returned record ID. UI visibility and local demo role labels are not authorization.

## Inspiration

The physical interaction approach follows concepts described in [Justin’s iOS interaction article](https://blog.justinbuilds.mov/ios/). The module is an independent TypeScript implementation shared with the current workspace UI.
