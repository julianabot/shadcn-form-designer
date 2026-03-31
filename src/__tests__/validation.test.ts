import { describe, it, expect, beforeEach } from "vitest";
import { registerBuiltInFields } from "@/registry/built-in-fields";
import { getRegisteredFieldTypes, unregisterField } from "@/registry";
import {
  buildSchema,
  buildValidation,
  buildZodSchema,
  hydrateValidation,
  toSerializableField,
  toFormLayout,
} from "@/utils";
import type { FieldConfig, SerializableFieldConfig } from "@/types";

beforeEach(() => {
  for (const type of getRegisteredFieldTypes()) {
    unregisterField(type);
  }
  registerBuiltInFields();
});

describe("buildValidation", () => {
  it("builds validation for input field", () => {
    const config: FieldConfig = {
      type: "input",
      label: "Name",
      required: true,
      minLength: 2,
      maxLength: 50,
    };
    const result = buildValidation(config);
    expect(result.name).toBeDefined();
    expect(result.validation.safeParse("John").success).toBe(true);
    expect(result.validation.safeParse("J").success).toBe(false);
  });

  it("builds validation for select field", () => {
    const config: FieldConfig = {
      type: "select",
      label: "Color",
      required: true,
      options: [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
    };
    const result = buildValidation(config);
    expect(result.validation.safeParse("red").success).toBe(true);
    expect(result.validation.safeParse("green").success).toBe(false);
  });

  it("builds validation for switch field", () => {
    const config: FieldConfig = { type: "switch", label: "Active" };
    const result = buildValidation(config);
    expect(result.validation.safeParse(true).success).toBe(true);
    expect(result.validation.safeParse("yes").success).toBe(false);
  });

  it("builds validation for date field with min/max", () => {
    const minDate = new Date(2000, 0, 1);
    const maxDate = new Date(2025, 11, 31);
    const config: FieldConfig = {
      type: "date",
      label: "Birthday",
      required: true,
      minDate,
      maxDate,
    };
    const result = buildValidation(config);
    expect(result.validation.safeParse(new Date(2020, 5, 15)).success).toBe(
      true,
    );
    expect(result.validation.safeParse(new Date(1990, 0, 1)).success).toBe(
      false,
    );
    expect(result.validation.safeParse(new Date(2030, 0, 1)).success).toBe(
      false,
    );
  });

  it("builds validation for file field with custom accept/maxSize", () => {
    const config: FieldConfig = {
      type: "file",
      label: "Document",
      accept: "application/*",
      maxSizeMB: 10,
    };
    const result = buildValidation(config);
    const pdfFile = new File(["content"], "doc.pdf", {
      type: "application/pdf",
    });
    expect(result.validation.safeParse(pdfFile).success).toBe(true);
    const imageFile = new File(["content"], "pic.png", { type: "image/png" });
    expect(result.validation.safeParse(imageFile).success).toBe(false);
  });

  it("builds validation for time field", () => {
    const config: FieldConfig = {
      type: "time",
      label: "Start Time",
      required: true,
    };
    const result = buildValidation(config);
    expect(result.validation.safeParse("14:30").success).toBe(true);
    expect(result.validation.safeParse("").success).toBe(false);
  });
});

describe("hydrateValidation", () => {
  it("hydrates string validation with min/max", () => {
    const schema = hydrateValidation({ type: "string", min: 3, max: 10 }, true);
    expect(schema.safeParse("hello").success).toBe(true);
    expect(schema.safeParse("hi").success).toBe(false);
  });

  it("hydrates enum validation", () => {
    const schema = hydrateValidation(
      { type: "enum", values: ["a", "b", "c"] },
      true,
    );
    expect(schema.safeParse("a").success).toBe(true);
    expect(schema.safeParse("d").success).toBe(false);
  });

  it("hydrates boolean validation", () => {
    const schema = hydrateValidation({ type: "boolean" });
    expect(schema.safeParse(true).success).toBe(true);
    expect(schema.safeParse("true").success).toBe(false);
  });

  it("hydrates date validation with min/max", () => {
    const schema = hydrateValidation(
      {
        type: "date",
        min: "2020-01-01T00:00:00.000Z",
        max: "2025-12-31T00:00:00.000Z",
      },
      true,
    );
    expect(schema.safeParse(new Date(2023, 5, 1)).success).toBe(true);
    expect(schema.safeParse(new Date(2019, 0, 1)).success).toBe(false);
  });

  it("hydrates string with email pattern", () => {
    const schema = hydrateValidation(
      { type: "string", pattern: "email" },
      true,
    );
    expect(schema.safeParse("test@example.com").success).toBe(true);
    expect(schema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("toSerializableField", () => {
  it("serializes input field", () => {
    const config: FieldConfig = {
      type: "input",
      label: "Name",
      minLength: 2,
      maxLength: 50,
    };
    const result = toSerializableField(config, "name-field");
    expect(result.name).toBe("name-field");
    expect(result.validation).toEqual({ type: "string", min: 2, max: 50 });
  });

  it("serializes select field", () => {
    const config: FieldConfig = {
      type: "select",
      label: "Color",
      options: [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
    };
    const result = toSerializableField(config);
    expect(result.validation.type).toBe("enum");
  });

  it("serializes switch field", () => {
    const result = toSerializableField({ type: "switch", label: "Active" });
    expect(result.validation).toEqual({ type: "boolean" });
  });

  it("serializes time field", () => {
    const result = toSerializableField({ type: "time", label: "Time" });
    expect(result.validation).toEqual({ type: "string" });
  });

  it("serializes file field", () => {
    const config: FieldConfig = {
      type: "file",
      label: "Upload",
      accept: "image/*",
      maxSizeMB: 5,
    };
    const result = toSerializableField(config);
    expect(result.validation).toEqual({
      type: "file",
      accept: "image/*",
      maxSizeMB: 5,
    });
  });
});

describe("buildZodSchema", () => {
  it("hydrates serializable configs into validated fields", () => {
    const configs: SerializableFieldConfig[] = [
      {
        type: "input",
        name: "name",
        label: "Name",
        required: true,
        validation: { type: "string", min: 1, max: 100 },
      },
      {
        type: "switch",
        name: "active",
        label: "Active",
        validation: { type: "boolean" },
      },
    ];
    const result = buildZodSchema(configs);
    expect(result).toHaveLength(2);
    expect(result[0].validation.safeParse("hello").success).toBe(true);
    expect(result[1].validation.safeParse(true).success).toBe(true);
  });
});

describe("buildSchema", () => {
  it("creates a zod object schema from field array", () => {
    const configs: SerializableFieldConfig[] = [
      {
        type: "input",
        name: "email",
        label: "Email",
        required: true,
        validation: { type: "string", pattern: "email" },
      },
    ];
    const hydrated = buildZodSchema(configs);
    const schema = buildSchema(hydrated);
    expect(schema.safeParse({ email: "test@example.com" }).success).toBe(true);
    expect(schema.safeParse({ email: "not-email" }).success).toBe(false);
  });
});

describe("toFormLayout", () => {
  it("converts flat configs to a layout with one section", () => {
    const configs: SerializableFieldConfig[] = [
      {
        type: "input",
        name: "field1",
        label: "Field 1",
        validation: { type: "string" },
      },
      {
        type: "switch",
        name: "field2",
        label: "Field 2",
        validation: { type: "boolean" },
      },
    ];
    const layout = toFormLayout(configs);
    expect(layout.sections).toHaveLength(1);
    expect(layout.sections[0].fields).toHaveLength(2);
    expect(layout.sections[0].fields[0].fieldName).toBe("field1");
    expect(layout.fields["field1"]).toBeDefined();
  });
});
