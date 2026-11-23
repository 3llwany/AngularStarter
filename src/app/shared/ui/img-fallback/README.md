# Image Fallback Directive (`appImgFallback`)

Declarative image fallback directive for `<img>` elements. Automatically catches load errors and applies a fallback URL without direct DOM manipulation in business code.

## Usage

```html
<img
  [src]="profile.avatarUrl"
  appImgFallback="assets/images/default-avatar.svg"
  alt="Profile avatar"
/>
```

