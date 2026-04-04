# ShadCN Form Designer

A dynamic form builder and renderer for React. Define forms as JSON, render them with Zod validation, and let users design forms visually — built on ShadCN UI, Tailwind CSS, and react-hook-form.

## Installation

```bash
npm install @julianabot/shadcn-form-designer
```

Peer dependencies:

```bash
npm install react react-dom react-hook-form @hookform/resolvers zod
```

## Quick Start

Initialize the built-in field types once at your app's entry point, then render forms from JSON config.

```tsx
import {
  registerBuiltInFields,
  DynamicForm,
} from "@julianabot/shadcn-form-designer";
import type { SerializableFieldConfig } from "@julianabot/shadcn-form-designer";

// Call once before rendering
registerBuiltInFields();

const fields: SerializableFieldConfig[] = [
  {
    type: "input",
    name: "fullName",
    label: "Full Name",
    required: true,
    minLength: 3,
    maxLength: 50,
    validation: { type: "string", min: 3, max: 50 },
  },
  {
    type: "select",
    name: "role",
    label: "Role",
    options: [
      { label: "Developer", value: "dev" },
      { label: "Designer", value: "design" },
    ],
    validation: { type: "enum", values: ["dev", "design"] },
  },
  {
    type: "switch",
    name: "newsletter",
    label: "Subscribe to newsletter",
    validation: { type: "boolean" },
  },
];

function App() {
  return <DynamicForm config={fields} onSubmit={(data) => console.log(data)} />;
}
```

## Built-in Field Types

| Type       | Description       | Config                                  |
| ---------- | ----------------- | --------------------------------------- |
| `input`    | Text input        | `minLength`, `maxLength`, `placeholder` |
| `textarea` | Multi-line text   | `minLength`, `maxLength`, `placeholder` |
| `select`   | Dropdown select   | `options: { label, value }[]`           |
| `combobox` | Searchable select | `options: { label, value }[]`           |
| `radio`    | Radio group       | `options: { label, value }[]`           |
| `date`     | Date picker       | `minDate`, `maxDate`                    |
| `file`     | File upload       | `accept`, `maxSizeMB`                   |
| `switch`   | Boolean toggle    | —                                       |
| `time`     | Time picker       | `placeholder`                           |

## Form Config Formats

`DynamicForm` accepts three config formats. It auto-detects which one you pass.

### Flat Array (simplest)

A `SerializableFieldConfig[]` with JSON-serializable validation descriptors. Good for storing in a database.

```ts
const fields: SerializableFieldConfig[] = [
  {
    type: "input",
    name: "email",
    label: "Email",
    required: true,
    validation: { type: "string", pattern: "email" },
  },
];
```

### FormLayout (sectioned)

Groups fields into ordered sections with titles and descriptions.

```ts
const layout: FormLayout = {
  fields: {
    fullName: {
      type: "input",
      name: "fullName",
      label: "Full Name",
      required: true,
      validation: { type: "string", min: 3, max: 50 },
    },
    country: {
      type: "select",
      name: "country",
      label: "Country",
      options: [
        { label: "Philippines", value: "PH" },
        { label: "United States", value: "US" },
      ],
      validation: { type: "enum", values: ["PH", "US"] },
    },
  },
  sections: [
    {
      order: 0,
      title: "Personal Info",
      fields: [
        { fieldName: "fullName", order: 0 },
        { fieldName: "country", order: 1 },
      ],
    },
  ],
};
```

### Hydrated Array (advanced)

A `FieldWithValidation<ZodTypeAny>[]` with live Zod schemas, for when you need full control over validation. Use `buildValidation()` to create these from `FieldConfig` objects.

## DynamicForm Props

| Prop                  | Type                                                               | Description                                                                                                              |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `config`              | `SerializableFieldConfig[] \| FormLayout \| FieldWithValidation[]` | Form definition (auto-detected)                                                                                          |
| `mode`                | `"view" \| "editor"`                                               | `"view"` renders a normal form (default). `"editor"` shows a sortable field list with edit, delete, and drag-to-reorder. |
| `onSubmit`            | `(data: Record<string, unknown>) => void`                          | Called with validated form data on submit                                                                                |
| `onSubmitFieldConfig` | `(fields: FieldWithValidation[]) => void`                          | Called with hydrated field configs on submit — useful for builder/designer mode                                          |
| `onChange`            | `(values: Record<string, unknown>) => void`                        | Called on every value change with current form state                                                                     |
| `onUnsupportedField`  | `(type: string, fieldName: string) => void`                        | Called when a field type has no registered definition. Defaults to `console.warn`                                        |
| `onFieldClick`        | `(fieldName: string) => void`                                      | Editor mode: called when the edit button is clicked                                                                      |
| `onFieldDelete`       | `(fieldName: string) => void`                                      | Editor mode: called when the delete button is clicked                                                                    |
| `onFieldsReorder`     | `(orderedNames: string[]) => void`                                 | Editor mode: called after drag-and-drop with the new ordered field names                                                 |

## Visual Form Designer

`AddFieldDialog` gives users a UI to add fields at runtime. It also supports an edit mode — pass `initialValues` with controlled `open`/`onOpenChange` to reopen the dialog prepopulated with an existing field's config.

### AddFieldDialog Props

| Prop             | Type                            | Description                                           |
| ---------------- | ------------------------------- | ----------------------------------------------------- |
| `handleAddField` | `(values: FieldConfig) => void` | Called with the new/updated field config on submit    |
| `initialValues`  | `AddFieldFormValues`            | Prepopulates the dialog for editing an existing field |
| `open`           | `boolean`                       | Controls open state externally (for edit mode)        |
| `onOpenChange`   | `(open: boolean) => void`       | Called when the dialog wants to close (for edit mode) |

When `initialValues` is provided, the dialog shows "Edit Field" / "Save Changes" instead of "Add New Field" / "Submit".

### Editor Mode

Set `mode="editor"` on `DynamicForm` to get a field management UI instead of a live form. Each field renders as a row with:

- A drag handle for reordering (powered by `@dnd-kit/sortable`)
- An edit button that opens `AddFieldDialog` prepopulated with the field's config
- A delete button to remove the field

```tsx
import {
  registerBuiltInFields,
  AddFieldDialog,
  DynamicForm,
  toSerializableField,
  toFormLayout,
  toAddFieldValues,
} from "@julianabot/shadcn-form-designer";
import type {
  FieldConfig,
  SerializableFieldConfig,
} from "@julianabot/shadcn-form-designer";
import { useState, useCallback } from "react";

registerBuiltInFields();

function FormDesigner() {
  const [fields, setFields] = useState<SerializableFieldConfig[]>([]);
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);

  const handleAddField = (config: FieldConfig) => {
    setFields((prev) => [...prev, toSerializableField(config)]);
  };

  const handleEditField = (config: FieldConfig) => {
    if (!editingFieldName) return;
    setFields((prev) =>
      prev.map((f) =>
        f.name === editingFieldName
          ? toSerializableField(config, editingFieldName)
          : f,
      ),
    );
    setEditingFieldName(null);
  };

  const editingField = editingFieldName
    ? fields.find((f) => f.name === editingFieldName)
    : null;

  return (
    <div>
      <AddFieldDialog handleAddField={handleAddField} />
      <DynamicForm
        config={toFormLayout(fields)}
        mode="editor"
        onFieldClick={(name) => setEditingFieldName(name)}
        onFieldDelete={(name) =>
          setFields((prev) => prev.filter((f) => f.name !== name))
        }
        onFieldsReorder={(ordered) =>
          setFields((prev) => {
            const map = new Map(prev.map((f) => [f.name, f]));
            return ordered.map((n) => map.get(n)!);
          })
        }
      />
      {/* Edit dialog — controlled externally */}
      <AddFieldDialog
        handleAddField={handleEditField}
        initialValues={
          editingField ? toAddFieldValues(editingField) : undefined
        }
        open={!!editingFieldName}
        onOpenChange={(open) => {
          if (!open) setEditingFieldName(null);
        }}
      />
    </div>
  );
}
```

## Saving and Loading Forms

The serializable config format is designed to be stored as JSON — no Zod instances, no component references. Here's the full round-trip:

```tsx
import { toFormLayout } from "@julianabot/shadcn-form-designer";
import type { SerializableFieldConfig } from "@julianabot/shadcn-form-designer";

// Save to your backend — it's plain JSON
const handleSave = async (fields: SerializableFieldConfig[]) => {
  const layout = toFormLayout(fields);
  await fetch("/api/forms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(layout),
  });
};
```

To load a saved form, just pass the JSON back to `DynamicForm`:

```tsx
import { DynamicForm } from "@julianabot/shadcn-form-designer";
import type { FormLayout } from "@julianabot/shadcn-form-designer";
import { useEffect, useState } from "react";

function FormRenderer({ formId }: { formId: string }) {
  const [layout, setLayout] = useState<FormLayout | null>(null);

  useEffect(() => {
    fetch(`/api/forms/${formId}`)
      .then((res) => res.json())
      .then(setLayout);
  }, [formId]);

  if (!layout) return <p>Loading...</p>;

  return (
    <DynamicForm
      config={layout}
      onSubmit={(data) => console.log("Submitted:", data)}
    />
  );
}
```

The `FormLayout` and `SerializableFieldConfig` types are pure JSON — save them in a database column, a file, or send them over an API. The library hydrates the Zod validation schemas at render time.

## Custom Field Types

Register your own field types with the field registry. Each registration provides a renderer component, validation builder, and optionally a config panel for the AddFieldDialog.

```tsx
import { registerField, InputField } from "@julianabot/shadcn-form-designer";
import { z } from "zod";

registerField({
  type: "email",
  label: "Email",
  category: "text",
  renderer: InputField, // reuse built-in or provide your own component
  buildValidation: (config) => ({
    ...config,
    name: crypto.randomUUID(),
    validation: config.required
      ? z.string().email("Invalid email").min(1, "Required")
      : z.string().email("Invalid email").optional(),
  }),
});
```

## Validation Descriptors

Validation is defined as plain JSON — no Zod in your config files. The library hydrates these into Zod schemas at runtime.

| Type      | Fields                                                             |
| --------- | ------------------------------------------------------------------ |
| `string`  | `min`, `max`, `pattern` (`email`, `url`, `uuid`, `regex`), `regex` |
| `boolean` | —                                                                  |
| `enum`    | `values: [string, ...string[]]`                                    |
| `date`    | `min` (ISO string), `max` (ISO string)                             |
| `file`    | `accept`, `maxSizeMB`                                              |

## Utilities

| Function                                   | Description                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| `toSerializableField(config, name?)`       | Converts a `FieldConfig` to a JSON-serializable `SerializableFieldConfig`             |
| `toFormLayout(configs)`                    | Converts a flat `SerializableFieldConfig[]` into a `FormLayout` with a single section |
| `toAddFieldValues(field)`                  | Converts a `SerializableFieldConfig` back to `AddFieldFormValues` for edit mode       |
| `buildValidation(config)`                  | Creates a `FieldWithValidation` with a live Zod schema from a `FieldConfig`           |
| `buildZodSchema(configs)`                  | Hydrates a `SerializableFieldConfig[]` into `FieldWithValidation[]` with Zod schemas  |
| `hydrateValidation(descriptor, required?)` | Converts a JSON `ValidationDescriptor` into a Zod schema                              |

## Tech Stack

- React + TypeScript
- Tailwind CSS + ShadCN UI (Radix primitives)
- Zod for runtime validation
- react-hook-form for form state
- @dnd-kit for drag-and-drop reordering
- Vite for bundling

## License

MIT
