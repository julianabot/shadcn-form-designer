/** Core components */
export { AddFieldDialog } from "./components/add-field-dialog";
export { DynamicForm } from "./components/dynamic-form";

export type { DynamicFormProps } from "./components/dynamic-form";
/** Field registry */
export {
  getFieldDefinition,
  getFieldDefinitions,
  getRegisteredFieldTypes,
  hasFieldType,
  registerField,
  unregisterField,
} from "./registry";
export type {
  AddFieldFormValues,
  ConfigPanelComponent,
  ConfigPanelProps,
  FieldDefinition,
  FieldRenderer,
} from "./registry";
export { registerBuiltInFields } from "./registry/built-in-fields";

/** Field components (for standalone use or custom registrations) */
export {
  ComboboxField,
  DatePickerField,
  FileUploadField,
  InputField,
  MultiOptionInputField,
  RadioGroupField,
  SelectField,
  SwitchField,
  TextareaField,
} from "./components/fields";

/** Types */
export type {
  FieldConfig,
  FieldProps,
  FieldType,
  FieldWithValidation,
  FormLayout,
  FormSection,
  LayoutField,
  MultipleOptionFieldProps,
  Option,
  SerializableFieldConfig,
  ValidationDescriptor,
} from "./types";

/** Utilities */
export {
  buildValidation,
  buildZodSchema,
  hydrateValidation,
  isFieldType,
  toFormLayout,
  toSerializableField,
} from "./utils";
