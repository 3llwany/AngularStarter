# Contract: Shared UI Components API (Phase 1.5)

**Scope**: `src/app/shared/ui/`  
**Standard**: Standalone, OnPush default, Signal `input()` / `output()` / `model()`, Logical CSS utilities only, Generic 100%.

---

## 1. Button (`src/app/shared/ui/button/`)

```typescript
export type ButtonVariant = 'primary' | 'glass' | 'tinted';
export type ButtonSize = 'large' | 'medium' | 'small';

@Component({
  selector: 'app-button',
  templateUrl: './button.html',
})
export class AppButton {
  /** Visual style variant matching Figma spec */
  readonly variant = input<ButtonVariant>('primary');

  /** Control size constraint (Large 56px, Medium 44px, Small 36px) */
  readonly size = input<ButtonSize>('large');

  /** Whether the button stretches to 100% of container width */
  readonly fullWidth = input<boolean>(false);

  /** Primary label text or i18n translation key */
  readonly label = input<string>('');

  /** Optional PrimeIcons class string (legacy/backward compatible) */
  readonly icon = input<string | undefined>(undefined);

  /** Position of legacy icon */
  readonly iconPos = input<'left' | 'right'>('left');

  /** Whether the button shows a loading spinner */
  readonly loading = input<boolean>(false);

  /** Whether the button is disabled */
  readonly disabled = input<boolean>(false);

  /** Legacy PrimeNG severity (retained for backward compatibility) */
  readonly severity = input<'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'danger'>('primary');

  /** Legacy outlined flag (retained for backward compatibility) */
  readonly outlined = input<boolean>(false);

  /** Emitted on user click */
  readonly onClick = output<MouseEvent>();
}
```
**Projected Slots**:
- `<ng-content select="[leadingIcon]" />`: Slot ahead of the label.
- `<ng-content select="[trailingIcon]" />`: Slot after the label.
- Default projection: Used if custom content replaces `label()`.

---

## 2. Form Field Text (`src/app/shared/ui/input/`)

```typescript
@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
})
export class AppInput<T = string | number | null> {
  /** Bound Signal Forms Field or raw model */
  readonly field = input<Field<T> | undefined>(undefined);

  /** Translation key or plain text label */
  readonly label = input<string>('');

  /** Placeholder translation key */
  readonly placeholder = input<string>('');

  /** Input type (text, email, password, number) */
  readonly type = input<string>('text');

  /** Whether input is disabled */
  readonly disabled = input<boolean>(false);

  /** Accessible helper text or error override */
  readonly helperText = input<string>('');

  /** Clear button visibility */
  readonly clearable = input<boolean>(false);
}
```

---

## 3. Tag (`src/app/shared/ui/tag/`)

```typescript
export type TagTone = 'neutral' | 'primary' | 'success' | 'warning' | 'orange' | 'error';
export type TagSize = 'regular' | 'small';

@Component({
  selector: 'app-tag',
  templateUrl: './tag.html',
})
export class AppTag {
  readonly label = input<string>('');
  readonly tone = input<TagTone>('neutral');
  readonly size = input<TagSize>('regular');
  readonly showDot = input<boolean>(false);
}
```

---

## 4. Banner (`src/app/shared/ui/banner/`)

```typescript
export type BannerTone = 'info' | 'warning' | 'error';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.html',
})
export class AppBanner {
  readonly tone = input<BannerTone>('info');
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly dismissible = input<boolean>(false);
  readonly onDismiss = output<void>();
}
```

---

## 5. Choice Card (`src/app/shared/ui/choice-card/`)

```typescript
@Component({
  selector: 'app-choice-card',
  templateUrl: './choice-card.html',
})
export class AppChoiceCard {
  readonly selected = model<boolean>(false);
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly badge = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly onSelect = output<boolean>();
}
```

---

## 6. Checkbox Card (`src/app/shared/ui/checkbox-card/`)

```typescript
@Component({
  selector: 'app-checkbox-card',
  templateUrl: './checkbox-card.html',
})
export class AppCheckboxCard {
  readonly checked = model<boolean>(false);
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly disabled = input<boolean>(false);
  readonly onToggle = output<boolean>();
}
```

---

## 7. Chip Select (`src/app/shared/ui/chip-select/`)

```typescript
@Component({
  selector: 'app-chip-select',
  templateUrl: './chip-select.html',
})
export class AppChipSelect {
  readonly active = model<boolean>(false);
  readonly label = input.required<string>();
  readonly icon = input<string | undefined>(undefined);
  readonly count = input<number | undefined>(undefined);
}
```

---

## 8. Progress Steps (`src/app/shared/ui/progress-steps/`)

```typescript
export interface StepItem {
  readonly id: string;
  readonly label: string;
  readonly status: 'completed' | 'active' | 'upcoming';
}

@Component({
  selector: 'app-progress-steps',
  templateUrl: './progress-steps.html',
})
export class AppProgressSteps {
  readonly steps = input.required<readonly StepItem[]>();
  readonly currentStepIndex = input<number>(0);
}
```

---

## 9. Skeleton (`src/app/shared/ui/skeleton/`)

```typescript
export type SkeletonShape = 'line' | 'row' | 'card' | 'circle';

@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.html',
})
export class AppSkeleton {
  readonly shape = input<SkeletonShape>('line');
  readonly width = input<string>('100%');
  readonly height = input<string | undefined>(undefined);
  readonly count = input<number>(1);
}
```

---

## 10. Divider "Or" (`src/app/shared/ui/divider-or/`)

```typescript
@Component({
  selector: 'app-divider-or',
  templateUrl: './divider-or.html',
})
export class AppDividerOr {
  readonly textKey = input<string>('common.labels.or');
}
```

---

## 11. Social Button (`src/app/shared/ui/social-button/`)

```typescript
export type SocialProvider = 'google' | 'facebook';

@Component({
  selector: 'app-social-button',
  templateUrl: './social-button.html',
})
export class AppSocialButton {
  readonly provider = input.required<SocialProvider>();
  readonly fullWidth = input<boolean>(true);
  readonly disabled = input<boolean>(false);
  readonly onClick = output<MouseEvent>();
}
```

---

## 12. Bottom Nav Tab (`src/app/shared/ui/bottom-nav-tab/`)

```typescript
@Component({
  selector: 'app-bottom-nav-tab',
  templateUrl: './bottom-nav-tab.html',
})
export class AppBottomNavTab {
  readonly active = input<boolean>(false);
  readonly label = input.required<string>();
  readonly icon = input<string | undefined>(undefined);
  readonly badge = input<string | number | undefined>(undefined);
  readonly onClick = output<void>();
}
```
