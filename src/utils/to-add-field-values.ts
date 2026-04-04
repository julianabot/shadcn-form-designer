import type { AddFieldFormValues } from "@/registry";
import type { SerializableFieldConfig } from "@/types";

/**
 * Converts a SerializableFieldConfig back into AddFieldFormValues
 * so the AddFieldDialog can be prepopulated for editing.
 */
export function toAddFieldValues(
  field: SerializableFieldConfig,
): AddFieldFormValues {
  const base: AddFieldFormValues = {
    type: field.type,
    label: field.label,
    description: field.description ?? "",
    required: field.required ?? false,
  };

  switch (field.type) {
    case "input":
    case "textarea":
      return {
        ...base,
        minLength:
          field.minLength != null ? String(field.minLength) : undefined,
        maxLength:
          field.maxLength != null ? String(field.maxLength) : undefined,
      };
    case "combobox":
    case "radio":
    case "select":
      return {
        ...base,
        options: field.options.map((o) => o.label),
      };
    case "date":
      return {
        ...base,
        minDate: field.minDate
          ? new Date(field.minDate).toISOString().split("T")[0]
          : undefined,
        maxDate: field.maxDate
          ? new Date(field.maxDate).toISOString().split("T")[0]
          : undefined,
      };
    default:
      return base;
  }
}
