# Shared UI Architecture

## Token Bridge: Structural Precision → Material Theme

### Ownership

| Layer | File | Role |
|-------|------|------|
| **Source of truth** | `app.css` | Structural Precision tokens — all `--color-*` custom properties live here |
| **Consumer** | `material-theme.scss` | Material 3 theme — references `var(--color-*)` from app.css |
| **Import chain** | `styles.css` | Imports `tailwindcss` and `app.css`; loaded by Angular via `angular.json` |

### Style-Load Order

```
angular.json styles array:
  1. src/styles.css        ← imports tailwindcss + app.css (defines --color-* properties)
  2. src/material-theme.scss ← consumes var(--color-*) at runtime
```

`app.css` defines CSS custom properties in a `:root` block **outside** the Tailwind `@theme {}` directive. The `@theme {}` block configures Tailwind utility generation; the `:root` block emits actual CSS custom properties to the browser.

`material-theme.scss` maps every `--mat-sys-*` Material token to its `--color-*` counterpart:

```scss
--mat-sys-primary: var(--color-primary);
--mat-sys-on-primary: var(--color-on-primary);
// ... etc
```

### Why This Matters

- **Single source of truth**: Changing a color in `app.css` automatically propagates to both Tailwind utilities and Material components.
- **No duplication**: Hex literals appear once (in `app.css`), not twice (once in `app.css`, once in `material-theme.scss`).
- **Vendor replacement**: If Material is replaced, only `material-theme.scss` changes. `app.css` and all feature templates are untouched.

### Adding a New Token

1. Add the `--color-*` property to `app.css` inside the `:root` block.
2. If Material needs it, add a corresponding `--mat-sys-*` reference in `material-theme.scss`.
3. The token is immediately available to Tailwind utilities (`bg-*`, `text-*`, etc.).

---

## NotificationService: Material Snackbar Adapter

### Location

`frontend/src/app/services/notification.service.ts`

### Purpose

`NotificationService` is the **sole adapter** between application code and Material's `MatSnackBar`. Feature templates and services never import `MatSnackBar` directly — they call `NotificationService.success()` or `NotificationService.error()`.

### Interface

```typescript
@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string): void;  // polite announcement, 'notification-success' panel
  error(message: string): void;    // assertive announcement, 'notification-error' panel
}
```

### Why an Adapter?

- **Vendor boundary**: Feature code depends on `NotificationService`, not on `MatSnackBar`. If the snackbar vendor changes, only this adapter is rewritten.
- **Consistent UX**: All notifications use the same duration (5s), politeness level, and panel styling.
- **Testability**: Features can mock `NotificationService` without importing Material test utilities.

### Adding a Notification Type

1. Add a new public method to `NotificationService` (e.g., `warning(message: string)`).
2. Choose the appropriate ARIA politeness level (`polite` or `assertive`).
3. Add a corresponding `panel-class` and style it in `material-theme.scss` or component styles.
