import {
  InputField,
  MultiOptionInputField,
  SelectField,
  SwitchField,
} from "@/components/fields";
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
import { getFieldDefinitions } from "@/registry";
import type { FieldConfig } from "@/types";
import {
  isDateFieldType,
  isFileFieldType,
  isInputFieldType,
  isMultipleOptionFieldType,
} from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

// TODO:
// - Fix date field type
// - When unselecting a multi option field, returns an error

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

  const FormSchema = useMemo(
    () =>
      z
        .object({
          type: z
            .string({ required_error: "This is a required field" })
            .refine((val) => fieldTypes.includes(val), {
              message: "Please select a valid field type",
            }),
          label: z.string().min(1, "Name is required"),
          description: z.string().optional(),
          required: z.boolean(),
          minLength: z.string().optional(),
          maxLength: z.string().optional(),
          options: z.array(z.string()).optional(),
        })
        .superRefine(({ type, options, minLength, maxLength }, ctx) => {
          if (isMultipleOptionFieldType(type)) {
            const cleaned = options?.map((opt) => opt?.trim());

            if (cleaned && cleaned.length < 2) {
              ctx.addIssue({
                path: ["options"],
                code: z.ZodIssueCode.custom,
                message: "At least 2 options are required",
              });
            }

            const isNoDuplicates = cleaned?.length === new Set(cleaned).size;

            if (!isNoDuplicates) {
              ctx.addIssue({
                path: ["options"],
                code: z.ZodIssueCode.custom,
                message: "Options must be unique",
              });
            }
          }

          if (isInputFieldType(type)) {
            if (!minLength || !maxLength) {
              ctx.addIssue({
                path: ["minLength"],
                code: z.ZodIssueCode.custom,
                message: "Min and Max are required",
              });
            } else if (Number(minLength) >= Number(maxLength)) {
              ctx.addIssue({
                path: ["maxLength"],
                code: z.ZodIssueCode.custom,
                message: "Max must be greater than Min",
              });
            }
          }
        })
        .transform((values) => ({
          ...values,
          options: values.options?.filter(Boolean),
        })),
    [fieldTypes],
  );

  type AddFieldDialogFormValues = z.infer<typeof FormSchema>;

  const form = useForm<AddFieldDialogFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: "",
      description: "",
      minLength: "0",
      maxLength: "100",
      type: "input",
      required: false,
      options: [""],
    },
  });

  const {
    control,
    formState: { errors },
    watch,
    register,
    handleSubmit,
    setValue,
    reset,
  } = form;

  const type = watch("type");
  const options = watch("options");

  const processFormSubmit = (data: AddFieldDialogFormValues) => {
    setOpen(false);
    reset();
    const {
      label,
      minLength,
      maxLength,
      required,
      description,
      options: tempOptions,
    } = data;

    const basePayload = {
      label,
      required,
      description,
    };

    if (isInputFieldType(type)) {
      handleAddField({
        ...basePayload,
        type: type as "input" | "textarea",
        minLength: minLength ? Number(minLength) : undefined,
        maxLength: maxLength ? Number(maxLength) : undefined,
      });
    }

    if (isMultipleOptionFieldType(type)) {
      handleAddField({
        ...basePayload,
        type: type as "combobox" | "radio" | "select",
        options: tempOptions
          ? tempOptions.map((label) => ({
              label,
              value: label
                .toLowerCase()
                .replace(/[^a-zA-Z0-9]/g, "")
                .slice(0, 10),
            }))
          : [],
      });
    }

    if (isDateFieldType(type)) {
      handleAddField({
        type: "date",
        label,
        required,
      });
    }

    if (isFileFieldType(type)) {
      handleAddField({
        type: "file",
        label,
        required,
      });
    }
  };

  useEffect(() => {
    if (isInputFieldType(type)) {
      setValue("options", undefined);
      return;
    }
    if (isMultipleOptionFieldType(type)) {
      setValue("minLength", undefined);
      setValue("maxLength", undefined);
      return;
    }
  }, [type, setValue]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

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
              error={errors.type?.message}
            />
            <InputField
              control={control}
              name="label"
              label="Label"
              error={errors.label?.message}
            />
            <InputField
              control={control}
              name="description"
              label="Description"
              error={errors.description?.message}
            />
            {isInputFieldType(type) && (
              <div className="flex flex-row gap-2 items-start">
                <InputField
                  control={control}
                  name="minLength"
                  label="Min"
                  error={errors.minLength?.message}
                />
                <InputField
                  control={control}
                  name="maxLength"
                  label="Max"
                  error={errors.maxLength?.message}
                />
              </div>
            )}
            {isMultipleOptionFieldType(type) && (
              <MultiOptionInputField
                control={control}
                name="options"
                label="Options"
                options={
                  options ? options.map((s) => ({ label: s, value: s })) : []
                }
                error={errors.options?.root?.message}
                register={register}
                setValue={setValue}
              />
            )}
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
