import type { FieldConfig, FieldWithValidation } from "@/types";
import type { ComponentType } from "react";
import type { ZodTypeAny } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldRenderer = ComponentType<any>;

export interface FieldDefinition {
  type: string;
  label: string;
  renderer: FieldRenderer;
  buildValidation: (config: FieldConfig) => FieldWithValidation<ZodTypeAny>;
  category?: string;
}

const fieldRegistry = new Map<string, FieldDefinition>();

export function registerField(definition: FieldDefinition): void {
  fieldRegistry.set(definition.type, definition);
}

export function getFieldDefinition(type: string): FieldDefinition | undefined {
  return fieldRegistry.get(type);
}

export function getFieldDefinitions(): FieldDefinition[] {
  return Array.from(fieldRegistry.values());
}

export function getRegisteredFieldTypes(): string[] {
  return Array.from(fieldRegistry.keys());
}

export function hasFieldType(type: string): boolean {
  return fieldRegistry.has(type);
}

export function unregisterField(type: string): boolean {
  return fieldRegistry.delete(type);
}
