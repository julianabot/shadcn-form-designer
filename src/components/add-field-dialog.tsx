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

function AddFieldDialog(props: {
  handleAddField: (values: FieldConfig) => void;
}) {
  const [open, setOpen] = useState(false);
  const { handleAddField } = props;

  const fieldDefinitions = useMemo(() => getFieldDefinitions(), []);
  const fieldTypes = useMemo(
    () => fieldDefinitions.map((def) => def.type),
    [fieldDefinitions],
  );

  const [selectedType, setSelectedType] = useState("input");
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

    // Merge type-specific config schema from the registry
    const extraSchema = activeDefinition?.configSchema ?? {};
    const merged = z.object({ ...baseShape, ...extraSchema });

    // Apply type-specific refinement if present
    const superRefine = activeDefinition?.configSuperRefine;
    // Cast needed: dynamic ZodRawShape produces { [x: string]: any } which
    // can't structurally match AddFieldFormValues at compile time.
    const refined = superRefine
      ? merged.superRefine(
          superRefine as Parameters<typeof merged.superRefine>[0],
        )
      : merged;

    return refined;
  }, [fieldTypes, activeDefinition]);

  const defaultValues = useMemo((): AddFieldFormValues => {
    const base: AddFieldFormValues = {
      label: "",
      description: "",
      type: "input",
      required: false,
    };
    return { ...base, ...(activeDefinition?.configDefaults ?? {}) };
  }, [activeDefinition]);

  // zodResolver infers { [x: string]: any } from the dynamic schema.
  // We know at runtime the shape always satisfies AddFieldFormValues,
  // so a single cast at this boundary keeps the rest fully typed.
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

  // Keep selectedType in sync with the form's type field
  useEffect(() => {
    if (type !== selectedType) {
      setSelectedType(type);
    }
  }, [type, selectedType]);

  // Reset extra fields when type changes
  useEffect(() => {
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
  }, [type, form]);

  useEffect(() => {
    if (!open) {
      reset();
      setSelectedType("input");
    }
  }, [open, reset]);

  const processFormSubmit = (data: AddFieldFormValues) => {
    setOpen(false);
    reset();

    const def = getFieldDefinition(data.type);
    if (def?.buildFieldConfig) {
      handleAddField(def.buildFieldConfig(data));
    } else {
      // Every registered type should provide buildFieldConfig.
      // This fallback treats unknown types as switch (boolean) fields.
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
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "outline", className: "rounded-4xl" }),
        )}
      >
        + Add New Field
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Field</DialogTitle>
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
              Submit
            </Button>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { AddFieldDialog };
