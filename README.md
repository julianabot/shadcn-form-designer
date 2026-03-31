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

| Prop                  | Type                                                               | Description                                                                       |
| --------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `config`              | `SerializableFieldConfig[] \| FormLayout \| FieldWithValidation[]` | Form definition (auto-detected)                                                   |
| `onSubmit`            | `(data: Record<string, unknown>) => void`                          | Called with validated form data on submit                                         |
| `onSubmitFieldConfig` | `(fields: FieldWithValidation[]) => void`                          | Called with hydrated field configs on submit — useful for builder/designer mode   |
| `onChange`            | `(values: Record<string, unknown>) => void`                        | Called on every value change with current form state                              |
| `onUnsupportedField`  | `(type: string, fieldName: string) => void`                        | Called when a field type has no registered definition. Defaults to `console.warn` |

## Visual Form Designer

`AddFieldDialog` gives users a UI to add fields at runtime. Pair it with `DynamicForm` for a full designer experience — see [Saving and Loading Forms](#saving-and-loading-forms) for a complete example.

## Saving and Loading Forms

The serializable config format is designed to be stored as JSON — no Zod instances, no component references. Here's the full round-trip:

```tsx
import {
  registerBuiltInFields,
  AddFieldDialog,
  DynamicForm,
  toSerializableField,
  toFormLayout,
} from "@julianabot/shadcn-form-designer";
import type {
  FieldConfig,
  SerializableFieldConfig,
  FormLayout,
} from "@julianabot/shadcn-form-designer";
import { useState } from "react";

registerBuiltInFields();

function FormDesigner() {
  const [fields, setFields] = useState<SerializableFieldConfig[]>([]);

  const handleAddField = (config: FieldConfig) => {
    setFields((prev) => [...prev, toSerializableField(config)]);
  };

  // Save to your backend — it's plain JSON
  const handleSave = async () => {
    const layout = toFormLayout(fields);
    await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layout),
    });
  };

  return (
    <div>
      <AddFieldDialog handleAddField={handleAddField} />
      <DynamicForm
        config={toFormLayout(fields)}
        onSubmit={(data) => console.log(data)}
      />
      <button onClick={handleSave}>Save Form</button>
    </div>
  );
}
```

To load a saved form, just pass the JSON back to `DynamicForm`:

```tsx
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
| `buildValidation(config)`                  | Creates a `FieldWithValidation` with a live Zod schema from a `FieldConfig`           |
| `buildZodSchema(configs)`                  | Hydrates a `SerializableFieldConfig[]` into `FieldWithValidation[]` with Zod schemas  |
| `hydrateValidation(descriptor, required?)` | Converts a JSON `ValidationDescriptor` into a Zod schema                              |

## Tech Stack

- React + TypeScript
- Tailwind CSS + ShadCN UI (Radix primitives)
- Zod for runtime validation
- react-hook-form for form state
- Vite for bundling

## License

MIT
