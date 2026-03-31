import type { FieldConfig, FieldWithValidation } from "@/types";
import type { ComponentType } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z, ZodTypeAny } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldRenderer = ComponentType<any>;

/**
 * Union of the base dialog fields and every possible type-specific extension.
 * Keeps `any` out of the registry and dialog while remaining open to new fields.
 */
export interface AddFieldFormValues {
  type: string;
  label: string;
  description?: string;
  required: boolean;
  /** text fields */
  minLength?: string;
  maxLength?: string;
  /** multi-option fields */
  options?: string[];
  /** date fields */
  minDate?: string;
  maxDate?: string;
}

/**
 * Props passed to a field-type's config panel component inside AddFieldDialog.
 * The panel renders its own extra fields (e.g. min/max for text, options for multi-option).
 */
export interface ConfigPanelProps {
  form: UseFormReturn<AddFieldFormValues>;
}

export type ConfigPanelComponent = ComponentType<ConfigPanelProps>;

export interface FieldDefinition {
  type: string;
  label: string;
  renderer: FieldRenderer;
  buildValidation: (config: FieldConfig) => FieldWithValidation<ZodTypeAny>;
  category?: string;
  /** Extra zod schema fields merged into the dialog form schema. */
  configSchema?: z.ZodRawShape;
  /** Extra zod refinement applied to the full dialog schema. */
  configSuperRefine?: (data: AddFieldFormValues, ctx: z.RefinementCtx) => void;
  /** Default values for the extra config fields. */
  configDefaults?: Partial<AddFieldFormValues>;
  /** Component rendered inside AddFieldDialog for type-specific config. */
  configPanel?: ConfigPanelComponent;
  /** Transforms dialog form values into a FieldConfig for this type. */
  buildFieldConfig?: (formValues: AddFieldFormValues) => FieldConfig;
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
