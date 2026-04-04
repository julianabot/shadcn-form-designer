import { AddFieldDialog } from "@/components";
import { DynamicForm } from "@/components/dynamic-form";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { FormConfig } from "@/data";
import type {
  FieldConfig,
  FieldWithValidation,
  FormLayout,
  SerializableFieldConfig,
} from "@/types";
import { toAddFieldValues, toFormLayout, toSerializableField } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import type { ZodTypeAny } from "zod";

/** Extract a flat array of SerializableFieldConfig from a FormLayout. */
function flattenFormLayout(layout: FormLayout): SerializableFieldConfig[] {
  const ordered: SerializableFieldConfig[] = [];
  const sections = [...layout.sections].sort((a, b) => a.order - b.order);
  for (const section of sections) {
    const sortedFields = [...section.fields].sort((a, b) => a.order - b.order);
    for (const ref of sortedFields) {
      const field = layout.fields[ref.fieldName];
      if (field) ordered.push(field);
    }
  }
  return ordered;
}

export function FormDesigner() {
  const [fields, setFields] = useState<SerializableFieldConfig[]>(() =>
    flattenFormLayout(FormConfig),
  );
  const [editingFieldName, setEditingFieldName] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTab, setPreviewTab] = useState<"layout" | "fields">("layout");

  const handleAddField = (values: FieldConfig) => {
    const serializable = toSerializableField(values);
    setFields((prev) => [...prev, serializable]);
  };

  const handleEditField = (values: FieldConfig) => {
    if (!editingFieldName) return;
    const serializable = toSerializableField(values, editingFieldName);
    setFields((prev) =>
      prev.map((f) => (f.name === editingFieldName ? serializable : f)),
    );
    setEditingFieldName(null);
  };

  const handleFieldClick = useCallback((fieldName: string) => {
    setEditingFieldName(fieldName);
  }, []);

  const handleFieldDelete = useCallback((fieldName: string) => {
    setFields((prev) => prev.filter((f) => f.name !== fieldName));
  }, []);

  const handleFieldsReorder = useCallback((orderedNames: string[]) => {
    setFields((prev) => {
      const map = new Map(prev.map((f) => [f.name, f]));
      return orderedNames
        .map((name) => map.get(name))
        .filter(Boolean) as SerializableFieldConfig[];
    });
  }, []);

  const editingField = editingFieldName
    ? fields.find((f) => f.name === editingFieldName)
    : null;

  const editInitialValues = editingField
    ? toAddFieldValues(editingField)
    : undefined;

  const formConfig: FormLayout = useMemo(() => toFormLayout(fields), [fields]);

  const previewJson = useMemo(() => {
    if (previewTab === "layout") {
      return JSON.stringify(formConfig, null, 2);
    }
    return JSON.stringify(fields, null, 2);
  }, [previewTab, formConfig, fields]);

  return (
    <div className="w-full flex flex-col justify-center items-center gap-4">
      <AddFieldDialog handleAddField={handleAddField} />
      <DynamicForm
        config={formConfig}
        mode="editor"
        onFieldClick={handleFieldClick}
        onFieldDelete={handleFieldDelete}
        onFieldsReorder={handleFieldsReorder}
        onSubmit={(data) => console.log("Form Submitted:", data)}
        onSubmitFieldConfig={(fields: FieldWithValidation<ZodTypeAny>[]) =>
          console.log("Field configs:", fields)
        }
      />
      <Button onClick={() => setPreviewOpen(true)}>Preview Output</Button>

      {/* Edit dialog */}
      <AddFieldDialog
        handleAddField={handleEditField}
        initialValues={editInitialValues}
        open={!!editingFieldName}
        onOpenChange={(open) => {
          if (!open) setEditingFieldName(null);
        }}
      />

      {/* Preview output dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Form Output</DialogTitle>
            <DialogDescription>
              Serialized form configuration ready for storage.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button
              variant={previewTab === "layout" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewTab("layout")}
            >
              FormLayout
            </Button>
            <Button
              variant={previewTab === "fields" ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewTab("fields")}
            >
              Fields Array
            </Button>
          </div>
          <pre className="flex-1 overflow-auto rounded-md bg-muted p-4 text-xs">
            {previewJson}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
