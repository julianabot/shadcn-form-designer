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
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { FieldTypeEnum, type FieldConfig, type FieldType } from "../types";

const MultipleOptionField = new Set<FieldType | undefined>([
  FieldTypeEnum.Combobox,
  FieldTypeEnum.Radio,
  FieldTypeEnum.Select,
]);

const TextFieldType = new Set<FieldType | undefined>([
  FieldTypeEnum.Input,
  FieldTypeEnum.Textarea,
]);

const FieldTypes: FieldType[] = [
  "input",
  "textarea",
  "file",
  "combobox",
  "radio",
  "date",
  "select",
  "switch",
];

const FieldTypeOptions: { value: FieldType; label: string }[] = FieldTypes.map(
  (type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })
);

const FormSchema = z
  .object({
    type: z
      .string({ required_error: "This is a required field" })
      .refine((val) => FieldTypes.includes(val as FieldType), {
        message: "Please select a valid field type",
      }),
    label: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    required: z.boolean(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    options: z.array(z.string()).optional(),
  })
  .superRefine(({ type, options, minLength, maxLength }, ctx) => {
    if (MultipleOptionField.has(type as FieldType)) {
      // TODO: Fix validation and clean up
      // - Should have no repeting options
      // - Should have > 2 options
      const cleaned = options?.map((opt) => opt?.trim());

      if (cleaned && cleaned.length < 2) {
        ctx.addIssue({
          path: ["options"],
          code: z.ZodIssueCode.custom,
          message: "At least 2 options are required",
        });
      }
    }

    if (TextFieldType.has(type as FieldType)) {
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
  });

type AddFieldDialogFormValues = z.infer<typeof FormSchema>;

interface AddFieldDialogProps {
  handleFormSubmit: (values: FieldConfig) => void;
}

function AddFieldDialog(props: AddFieldDialogProps) {
  const { handleFormSubmit } = props;

  const form = useForm<AddFieldDialogFormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: "",
      description: "",
      minLength: 5,
      maxLength: 10,
      type: FieldTypeEnum.Combobox,
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
  } = form;

  const rawType = watch("type");
  const type: FieldType = Object.values(FieldTypeEnum).includes(
    rawType as FieldType
  )
    ? (rawType as FieldType)
    : "input";

  const options = watch("options");

  const processFormSubmit = (data: AddFieldDialogFormValues) => {
    // TODO: Add required in FieldConfig
    const { label, minLength, maxLength, required } = data;
    const name = label
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);

    if (type === FieldTypeEnum.Input || type === FieldTypeEnum.Textarea) {
      handleFormSubmit({
        type,
        label,
        name,
        minLength,
        maxLength,
      });
    }
    if (MultipleOptionField.has(type as FieldType)) {
      // handleFormSubmit({
      //   ...data,
      //   min: undefined,
      //   max: undefined,
      // });
    }
  };
  useEffect(() => {
    if (TextFieldType.has(type)) {
      setValue("options", undefined);
      return;
    }
    if (MultipleOptionField.has(type)) {
      setValue("minLength", undefined);
      setValue("maxLength", undefined);
      return;
    }
  }, [type, setValue]);

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "outline", className: "rounded-4xl" })
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
              options={FieldTypeOptions}
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
            {TextFieldType.has(type) && (
              <div className="flex flex-row gap-2 items-start">
                <InputField
                  control={control}
                  name="minLength"
                  label="Min"
                  type="number"
                  error={errors.minLength?.message}
                />
                <InputField
                  control={control}
                  name="maxLength"
                  label="Max"
                  type="number"
                  error={errors.maxLength?.message}
                />
              </div>
            )}
            {MultipleOptionField.has(type) && (
              <FormField
                control={control}
                name="options"
                render={() => (
                  <FormItem className="flex flex-col justify-center">
                    <FormLabel>Options</FormLabel>
                    {options &&
                      options.map((opt, index) => (
                        <div key={index} className="flex flex-col gap-1">
                          <div className="flex flex-row gap-1">
                            <FormControl>
                              <Input
                                {...register(`options.${index}` as const)}
                                placeholder="Enter option"
                              />
                            </FormControl>
                            {options && options.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() =>
                                  setValue(
                                    "options",
                                    options.filter((_, i) => i !== index)
                                  )
                                }
                              >
                                <Trash2 />
                              </Button>
                            )}
                          </div>
                          <FormMessage>
                            {errors.options?.[index]?.message}
                          </FormMessage>
                        </div>
                      ))}
                    <Button
                      type="button"
                      className="w-fit rounded-2xl bg-gray-100 border-0 self-center"
                      variant="outline"
                      onClick={() =>
                        setValue("options", [...(options ?? []), ""])
                      }
                    >
                      + Add another option
                    </Button>
                  </FormItem>
                )}
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
