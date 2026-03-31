import { describe, it, expect, beforeEach } from "vitest";
import {
  registerField,
  getFieldDefinition,
  getFieldDefinitions,
  getRegisteredFieldTypes,
  hasFieldType,
  unregisterField,
} from "@/registry";
import { registerBuiltInFields } from "@/registry/built-in-fields";

describe("Field Registry", () => {
  beforeEach(() => {
    for (const type of getRegisteredFieldTypes()) {
      unregisterField(type);
    }
  });

  it("registers and retrieves a field definition", () => {
    registerField({
      type: "custom",
      label: "Custom",
      renderer: () => null,
      buildValidation: (config) => ({
        ...config,
        name: "test",
        validation: {} as any,
      }),
    });
    const def = getFieldDefinition("custom");
    expect(def).toBeDefined();
    expect(def?.type).toBe("custom");
    expect(def?.label).toBe("Custom");
  });

  it("returns undefined for unregistered types", () => {
    expect(getFieldDefinition("nonexistent")).toBeUndefined();
  });

  it("hasFieldType returns correct boolean", () => {
    expect(hasFieldType("input")).toBe(false);
    registerBuiltInFields();
    expect(hasFieldType("input")).toBe(true);
    expect(hasFieldType("nonexistent")).toBe(false);
  });

  it("unregisterField removes a field type", () => {
    registerBuiltInFields();
    expect(hasFieldType("input")).toBe(true);
    const result = unregisterField("input");
    expect(result).toBe(true);
    expect(hasFieldType("input")).toBe(false);
  });

  it("unregisterField returns false for non-existent type", () => {
    expect(unregisterField("nonexistent")).toBe(false);
  });

  it("getFieldDefinitions returns all registered definitions", () => {
    registerBuiltInFields();
    const defs = getFieldDefinitions();
    expect(defs.length).toBeGreaterThan(0);
    const types = defs.map((d) => d.type);
    expect(types).toContain("input");
    expect(types).toContain("textarea");
    expect(types).toContain("select");
    expect(types).toContain("combobox");
    expect(types).toContain("radio");
    expect(types).toContain("date");
    expect(types).toContain("file");
    expect(types).toContain("switch");
    expect(types).toContain("time");
  });

  it("getRegisteredFieldTypes returns type strings", () => {
    registerBuiltInFields();
    const types = getRegisteredFieldTypes();
    expect(types).toContain("input");
    expect(types).toContain("time");
  });
});
