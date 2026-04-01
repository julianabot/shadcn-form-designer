"use client";

import { InputField, SelectField, SwitchField } from "@/components/fields";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { AddFieldFormValues } from "@/registry";
import { getFieldDefinition, getFieldDefinitions } from "@/registry";
import type { FieldConfig } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import type { Resolver } from "react-hook-form";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

export interface AddFieldDialogProps {
  handleAddField: (values: FieldConfig) => void;
  /** When provided, the dialog opens in edit mode prepopulated with these values. */
  initialValues?: AddFieldFormValues;
  /** Controls open state externally (for edit mode). */
  open?: boolean;
  /** Called when the dialog wants to close (for edit mode). */
  onOpenChange?: (open: boolean) => void;
}

function AddFieldDialog({
  handleAddField,
  initialValues,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddFieldDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (v: boolean) => controlledOnOpenChange?.(v)
    : setInternalOpen;

  const isEditMode = !!initialValues;

  const fieldDefinitions = useMemo(() => getFieldDefinitions(), []);
  const fieldTypes = useMemo(
    () => fieldDefinitions.map((def) => def.type),
    [fieldDefinitions],
  );

  const [selectedType, setSelectedType] = useState(
    initialValues?.type ?? "input",
  );
  const activeDefinition = useMemo(
    () => getFieldDefinition(selectedType),
    [selectedType],
  );

  const FormSchema = useMemo(() => {
    const baseShape: z.ZodRawShape = {
      type: z
        .string({ required_error: "This is a required field" })
        .refine((val) => fieldTypes.includes(val), {
          message: "Please select a valid field type",
        }),
      label: z.string().min(1, "Name is required"),
      description: z.string().optional(),
      required: z.boolean(),
    };

    const extraSchema = activeDefinition?.configSchema ?? {};
    const merged = z.object({ ...baseShape, ...extraSchema });

    const superRefine = activeDefinition?.configSuperRefine;
    const refined = superRefine
      ? merged.superRefine(
          superRefine as Parameters<typeof merged.superRefine>[0],
        )
      : merged;

    return refined;
  }, [fieldTypes, activeDefinition]);

  const defaultValues = useMemo((): AddFieldFormValues => {
    if (initialValues) return initialValues;
    const base: AddFieldFormValues = {
      label: "",
      description: "",
      type: "input",
      required: false,
    };
    return { ...base, ...(activeDefinition?.configDefaults ?? {}) };
  }, [activeDefinition, initialValues]);

  const form = useForm<AddFieldFormValues>({
    resolver: zodResolver(
      FormSchema,
    ) as unknown as Resolver<AddFieldFormValues>,
    defaultValues,
  });

  const {
    control,
    formState: { errors },
    watch,
    handleSubmit,
    reset,
  } = form;

  const type = watch("type");

  useEffect(() => {
    if (type !== selectedType) {
      setSelectedType(type);
    }
  }, [type, selectedType]);

  // Reset extra fields when type changes (only in add mode)
  useEffect(() => {
    if (isEditMode) return;
    const def = getFieldDefinition(type);
    if (def?.configDefaults) {
      const entries = Object.entries(def.configDefaults) as [
        keyof AddFieldFormValues,
        AddFieldFormValues[keyof AddFieldFormValues],
      ][];
      for (const [key, value] of entries) {
        form.setValue(key, value);
      }
    }
  }, [type, form, isEditMode]);

  // Reset form when dialog closes (add mode) or when initialValues change (edit mode)
  useEffect(() => {
    if (!open) {
      reset(
        initialValues ?? {
          label: "",
          description: "",
          type: "input",
          required: false,
        },
      );
      setSelectedType(initialValues?.type ?? "input");
    }
  }, [open, reset, initialValues]);

  // Sync form when initialValues change while open (edit mode)
  useEffect(() => {
    if (isEditMode && initialValues && open) {
      reset(initialValues);
      setSelectedType(initialValues.type);
    }
  }, [initialValues, isEditMode, open, reset]);

  const processFormSubmit = (data: AddFieldFormValues) => {
    setOpen(false);

    const def = getFieldDefinition(data.type);
    if (def?.buildFieldConfig) {
      handleAddField(def.buildFieldConfig(data));
    } else {
      handleAddField({
        type: "switch",
        label: data.label,
        description: data.description,
        required: data.required,
      });
    }
  };

  const ConfigPanel = activeDefinition?.configPanel;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger
          className={cn(
            buttonVariants({ variant: "outline", className: "rounded-4xl" }),
            "mb-5",
          )}
        >
          + Add New Field
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Field" : "Add New Field"}
          </DialogTitle>
          <DialogDescription className="hidden"></DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form
            className="flex flex-col gap-3"
            onSubmit={handleSubmit(processFormSubmit)}
          >
            <SelectField
              control={control}
              name="type"
              label="Type"
              options={fieldDefinitions.map((def) => ({
                value: def.type,
                label: def.label,
              }))}
              error={errors.type?.message as string | undefined}
            />
            <InputField
              control={control}
              name="label"
              label="Label"
              error={errors.label?.message as string | undefined}
            />
            <InputField
              control={control}
              name="description"
              label="Description"
              error={errors.description?.message as string | undefined}
            />
            {ConfigPanel && <ConfigPanel form={form} />}
            <SwitchField control={control} name="required" label="Required" />
            <Button type="submit" className="mt-5">
              {isEditMode ? "Save Changes" : "Submit"}
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { AddFieldDialog };
