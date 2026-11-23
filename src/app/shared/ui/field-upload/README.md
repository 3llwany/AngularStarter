# Field Upload (`app-field-upload`)

## Description

A generic, RTL/LTR-ready file upload dropzone component aligned with the `Field / Upload` design specification. Supports all four visual states (`default`, `uploading`, `uploaded`, `error`), click/keyboard/drag-and-drop file picking, built-in `accept` and `maxSizeBytes` validation, and optional Angular 22 Signal Forms `Field<File | null>` binding.

## Usage

```html
<app-field-upload
  label="FORM.CV"
  title="FORM.CV_TITLE"
  hint="FORM.CV_HINT"
  accept=".pdf,.docx"
  [maxSizeBytes]="5 * 1024 * 1024"
  [progress]="uploadProgress()"
  [error]="uploadError()"
  (fileSelected)="onUpload($event)"
  (fileInvalid)="onInvalid($event)"
  (removed)="onRemove()"
/>
```

## Inputs

| Name | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `field` | `Field<File \| null> \| undefined` | `undefined` | Optional Angular Signal Forms field bound to the selected file. |
| `label` | `string` | `''` | Translation key for the field label rendered above the drop zone. |
| `title` | `string` | `'common.upload.title'` | Translation key for the call-to-action title in `default` / `error` states. |
| `hint` | `string` | `''` | Translation key for the allowed file types / max size hint. |
| `accept` | `string` | `'*'` | Accepted extensions or MIME types (native picker + built-in validation). |
| `maxSizeBytes` | `number \| null` | `null` | Maximum allowed file size in bytes (`null` disables size validation). |
| `disabled` | `boolean` | `false` | Disables picking, dropping, and removing files. |
| `progress` | `number \| null` | `null` | Upload progress percentage `0..100` (`0..99` displays `uploading` state). |
| `fileName` | `string \| null` | `null` | Controlled file name (e.g., an already uploaded file). |
| `fileSize` | `number \| null` | `null` | Controlled file size in bytes. |
| `error` | `string \| null` | `null` | External error translation key (overrides built-in validation errors). |
| `removable` | `boolean` | `true` | Displays the remove (`×`) button in the `uploaded` state. |
| `sizeErrorKey` | `string` | `'common.upload.errors.size'` | Translation key for oversized file errors (receives `{ max }`). |
| `typeErrorKey` | `string` | `'common.upload.errors.type'` | Translation key for unsupported file type errors. |
| `removeLabelKey` | `string` | `'common.upload.remove'` | Translation key for the remove button `aria-label`. |

## Outputs

| Name | Payload | Description |
| :--- | :--- | :--- |
| `fileSelected` | `File` | Emitted when a valid file is chosen via click, keyboard, or drag-and-drop. |
| `fileInvalid` | `FieldUploadInvalidEvent` | Emitted with `{ file, reason: 'size' \| 'type' }` when validation fails. |
| `removed` | `void` | Emitted when the user clicks the remove (`×`) button. |
