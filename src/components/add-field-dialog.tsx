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
import { FieldTypeEnum, type FieldType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";

const WithMultipleChoices = new Set<FieldType | undefined>([
  FieldTypeEnum.Combobox,
  FieldTypeEnum.Radio,
  FieldTypeEnum.Select,
]);

const WithMinMax = new Set<FieldType | undefined>([
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
    min: z.string().optional(),
    max: z.string().optional(),
    options: z.array(z.string()),
  })
  .superRefine(({ type, options, min, max }, ctx) => {
    if (WithMultipleChoices.has(type as FieldType)) {
      // TODO: Fix validation and clean up
      // - Should have no repeting options
      // - Should have > 2 options
      const cleaned = options.map((opt) => opt?.trim());

      if (cleaned.length < 2) {
        ctx.addIssue({
          path: ["options"],
          code: z.ZodIssueCode.custom,
          message: "At least 2 options are required",
        });
      }
    }

    if (WithMinMax.has(type as FieldType)) {
      if (!min || !max) {
        ctx.addIssue({
          path: ["min"],
          code: z.ZodIssueCode.custom,
          message: "Min and Max are required",
        });
      } else if (Number(min) >= Number(max)) {
        ctx.addIssue({
          path: ["max"],
          code: z.ZodIssueCode.custom,
          message: "Max must be greater than Min",
        });
      }
    }
  });

type FormValues = z.infer<typeof FormSchema>;

function AddFieldDialog() {
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: "",
      description: "",
      min: "",
      max: "",
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
  const type: FieldType | undefined = Object.values(FieldTypeEnum).includes(
    rawType as FieldType
  )
    ? (rawType as FieldType)
    : undefined;

  const handleFormSubmit = (data: FormValues) => {
    console.log(data);
  };

  useEffect(() => {
    if (WithMinMax.has(type)) {
      setValue("options", [""]);
      return;
    }
    if (WithMultipleChoices.has(type)) {
      setValue("min", "");
      setValue("max", "");
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
            onSubmit={handleSubmit(handleFormSubmit)}
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
            {WithMinMax.has(type) && (
              <div className="flex flex-row gap-2 items-st">
                <InputField
                  control={control}
                  name="min"
                  label="Min"
                  type="number"
                  error={errors.min?.message}
                />
                <InputField
                  control={control}
                  name="max"
                  label="Max"
                  type="number"
                  error={errors.max?.message}
                />
              </div>
            )}
            {WithMultipleChoices.has(type) && (
              <FormField
                control={control}
                name="options"
                render={() => (
                  <FormItem className="flex flex-col justify-center">
                    <FormLabel>Options</FormLabel>
                    {watch("options")?.map((opt, index) => (
                      <div key={index} className="flex flex-col gap-1">
                        <div className="flex flex-row gap-1">
                          <FormControl>
                            <Input
                              {...register(`options.${index}` as const)}
                              placeholder="Enter option"
                            />
                          </FormControl>
                          {watch("options")?.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() =>
                                setValue(
                                  "options",
                                  watch("options").filter((_, i) => i !== index)
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
                        setValue("options", [...(watch("options") ?? []), ""])
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
