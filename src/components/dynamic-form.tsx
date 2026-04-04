"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z, type ZodTypeAny } from "zod";

import { getFieldDefinition } from "@/registry";
import type {
  FieldWithValidation,
  FormLayout,
  SerializableFieldConfig,
} from "@/types";
import { buildSchema, buildZodSchema } from "@/utils";

import { Button } from "./ui";

type DynamicFormConfig =
  | FieldWithValidation<ZodTypeAny>[]
  | SerializableFieldConfig[]
  | FormLayout;

function isFormLayout(config: DynamicFormConfig): config is FormLayout {
  return (
    !Array.isArray(config) &&
    typeof config === "object" &&
    "fields" in config &&
    "sections" in config
  );
}

function isSerializableConfig(
  config: DynamicFormConfig,
): config is SerializableFieldConfig[] {
  if (!Array.isArray(config) || config.length === 0) return false;
  const first = config[0];
  return (
    "validation" in first &&
    typeof first.validation === "object" &&
    first.validation !== null &&
    "type" in (first.validation as object) &&
    typeof (first.validation as { type: unknown }).type === "string"
  );
}

/** Resolve any config variant into a hydrated field array + optional layout. */
function resolveConfig(config: DynamicFormConfig) {
  if (isFormLayout(config)) {
    const flatConfigs = Object.values(config.fields);
    const hydrated = buildZodSchema(flatConfigs);
    const fieldMap = new Map(hydrated.map((f) => [f.name, f]));

    const sorted: FormLayout = {
      ...config,
      sections: [...config.sections]
        .sort((a, b) => a.order - b.order)
        .map((section) => ({
          ...section,
          fields: [...section.fields].sort((a, b) => a.order - b.order),
        })),
    };

    return { hydrated, layout: sorted, fieldMap };
  }

  if (isSerializableConfig(config)) {
    const hydrated = buildZodSchema(config);
    return { hydrated, layout: null, fieldMap: null };
  }

  return {
    hydrated: config as FieldWithValidation<ZodTypeAny>[],
    layout: null,
    fieldMap: null,
  };
}

// --- Sortable editor row ---

function SortableFieldRow({
  field,
  onFieldClick,
  onFieldDelete,
}: {
  field: FieldWithValidation<ZodTypeAny>;
  onFieldClick?: (name: string) => void;
  onFieldDelete?: (name: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.name });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 justify-between py-1.5 pl-2 pr-4 rounded-md border border-neutral-200"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          aria-label={`Drag to reorder: ${field.label}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <p>{field.label}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        {onFieldClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onFieldClick(field.name)}
            aria-label={`Edit field: ${field.label}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        {onFieldDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onFieldDelete(field.name)}
            aria-label={`Delete field: ${field.label}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

// --- Main component ---

export interface DynamicFormProps {
  config: DynamicFormConfig;
  /** "view" renders a normal form. "editor" shows a sortable field list with edit/delete. */
  mode?: "view" | "editor";
  /** Called with validated form data on submit. */
  onSubmit?: (data: Record<string, unknown>) => void;
  /** Called with the hydrated field configs on submit (for builder/designer use). */
  onSubmitFieldConfig?: (fields: FieldWithValidation<ZodTypeAny>[]) => void;
  /** Called on every form value change with the current form state. */
  onChange?: (values: Record<string, unknown>) => void;
  /** Called when a field type has no registered definition. Defaults to console.warn. */
  onUnsupportedField?: (type: string, fieldName: string) => void;
  /** Editor mode: called when the edit button is clicked. */
  onFieldClick?: (fieldName: string) => void;
  /** Editor mode: called when the delete button is clicked. */
  onFieldDelete?: (fieldName: string) => void;
  /** Editor mode: called after drag-and-drop with the new ordered field names. */
  onFieldsReorder?: (orderedNames: string[]) => void;
}

export function DynamicForm({
  config,
  mode = "view",
  onSubmit,
  onSubmitFieldConfig,
  onChange,
  onUnsupportedField,
  onFieldClick,
  onFieldDelete,
  onFieldsReorder,
}: DynamicFormProps) {
  const { hydrated, layout, fieldMap } = useMemo(
    () => resolveConfig(config),
    [config],
  );

  const schema = useMemo(() => buildSchema(hydrated), [hydrated]);
  type FormValues = z.infer<typeof schema>;

  const defaultValues = useMemo(() => {
    return Object.fromEntries(
      Object.entries(schema.shape).map(([key, value]) => {
        const typeName = value._def?.typeName;
        if (typeName === "ZodBoolean") return [key, false];
        if (typeName === "ZodArray") return [key, []];
        if (typeName === "ZodString") return [key, ""];
        if (typeName === "ZodDate") return [key, undefined];
        if (typeName === "ZodOptional") {
          const innerTypeName = value._def?.innerType?._def?.typeName;
          if (innerTypeName === "ZodBoolean") return [key, false];
          if (innerTypeName === "ZodArray") return [key, []];
          if (innerTypeName === "ZodString") return [key, ""];
          if (innerTypeName === "ZodDate") return [key, undefined];
        }
        return [key, undefined];
      }),
    ) as FormValues;
  }, [schema]);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = form;

  useEffect(() => {
    if (!onChange) return;
    const subscription = watch((values) => {
      onChange(values as Record<string, unknown>);
    });
    return () => subscription.unsubscribe();
  }, [watch, onChange]);

  const handleFormSubmit = useCallback(
    (data: FormValues) => {
      if (onSubmitFieldConfig) {
        onSubmitFieldConfig(hydrated);
      }
      if (onSubmit) {
        onSubmit(data as Record<string, unknown>);
      }
    },
    [hydrated, onSubmit, onSubmitFieldConfig],
  );

  // --- DnD sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Build the ordered field list for editor mode
  const orderedFields = useMemo(() => {
    if (layout && fieldMap) {
      const result: FieldWithValidation<ZodTypeAny>[] = [];
      for (const section of layout.sections) {
        for (const lf of section.fields) {
          const f = fieldMap.get(lf.fieldName);
          if (f) result.push(f);
        }
      }
      return result;
    }
    return hydrated;
  }, [layout, fieldMap, hydrated]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !onFieldsReorder) return;

      const oldIndex = orderedFields.findIndex((f) => f.name === active.id);
      const newIndex = orderedFields.findIndex((f) => f.name === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(orderedFields, oldIndex, newIndex);
      onFieldsReorder(reordered.map((f) => f.name));
    },
    [orderedFields, onFieldsReorder],
  );

  const renderField = useCallback(
    (field: FieldWithValidation<ZodTypeAny>) => {
      const { type, name, description } = field;
      const error = errors?.[name]?.message as string | undefined;
      const definition = getFieldDefinition(type);

      if (!definition) {
        if (onUnsupportedField) {
          onUnsupportedField(type, name);
        } else {
          console.warn(`Unsupported field type: "${type}" (field: "${name}")`);
        }
        return null;
      }

      const Renderer = definition.renderer;
      return (
        <Renderer
          key={name}
          control={control}
          error={error}
          description={description}
          {...field}
        />
      );
    },
    [control, errors, onUnsupportedField],
  );

  const renderWithLayout = () => {
    if (!layout || !fieldMap) return null;
    return layout.sections.map((section, si) => (
      <div key={si} className="flex flex-col gap-5">
        {section.title && (
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            )}
          </div>
        )}
        {section.fields.map((layoutField) => {
          const field = fieldMap.get(layoutField.fieldName);
          if (!field) return null;
          return renderField(field);
        })}
      </div>
    ));
  };

  const renderFlat = () => hydrated.map(renderField);

  // --- Editor mode: sortable list ---
  if (mode === "editor") {
    const fieldIds = orderedFields.map((f) => f.name);

    return (
      <div className="w-full max-w-2xl flex flex-col gap-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fieldIds}
            strategy={verticalListSortingStrategy}
          >
            {orderedFields.map((field) => (
              <SortableFieldRow
                key={field.name}
                field={field}
                onFieldClick={onFieldClick}
                onFieldDelete={onFieldDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    );
  }

  // --- View mode: normal form ---
  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        {layout ? renderWithLayout() : renderFlat()}
        <Button type="submit">Submit</Button>
      </form>
    </FormProvider>
  );
}
