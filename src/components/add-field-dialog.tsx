import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import z from "zod";
import { FieldTypeEnum, type FieldType } from "../types";
import { InputField, SelectField, SwitchField } from "./fields";
import { Input, Label } from "./ui";
import { Button, buttonVariants } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const fieldTypes: FieldType[] = [
  "input",
  "textarea",
  "file",
  "combobox",
  "radio",
  "date",
  "select",
  "switch",
];

const fieldTypeOptions: { value: FieldType; label: string }[] = fieldTypes.map(
  (type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
  })
);

const formSchema = z.object({
  type: z
    .string({ required_error: "This is a required field" })
    .refine((val) => fieldTypes.includes(val as FieldType), {
      message: "Please select a valid field type",
    }),
  // Name and label should be the same and handled on submit
  name: z.string({ required_error: "This is a required field" }),
  description: z.string({ required_error: "This is a required field" }),
  // TODO: min and max refine when type is WithMinMax it should be required,
  required: z.boolean(),
  options: z.array(
    z.object({ value: z.string().min(1, "Option is required") })
  ),
});

// TODO: remove other values when changing types
function AddFieldDialog() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: FieldTypeEnum.Combobox,
      required: false,
      options: [{ value: "" }],
    },
  });

  const {
    control,
    formState: { errors },
    watch,
    register,
  } = form;

  const rawType = watch("type");
  const type: FieldType | undefined = Object.values(FieldTypeEnum).includes(
    rawType as FieldType
  )
    ? (rawType as FieldType)
    : undefined;
  const WithMinMax = new Set<FieldType | undefined>([
    FieldTypeEnum.Input,
    FieldTypeEnum.Textarea,
  ]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });
  const WithMultipleChoices = new Set<FieldType | undefined>([
    FieldTypeEnum.Combobox,
    FieldTypeEnum.Radio,
    FieldTypeEnum.Select,
  ]);

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
          <form className="flex flex-col gap-3">
            <SelectField
              control={control}
              name="type"
              label="Type"
              options={fieldTypeOptions}
              error={errors.type?.message}
            />
            <InputField
              control={control}
              name="name"
              label="Name"
              error={errors.name?.message}
            />
            <InputField
              control={control}
              name="description"
              label="Description"
              error={errors.description?.message}
            />
            {WithMinMax.has(type) && (
              <div className="flex flex-row gap-2">
                <InputField
                  control={control}
                  name="name"
                  label="Min"
                  type="number"
                  error={errors.name?.message}
                />
                <InputField
                  control={control}
                  name="description"
                  label="Max"
                  type="number"
                  error={errors.description?.message}
                />
              </div>
            )}
            {WithMultipleChoices.has(type!) && (
              <div className="flex flex-col gap-2 justify-center">
                <Label>Options</Label>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex flex-row gap-1">
                    <Input
                      {...register(`options.${index}.value`)}
                      placeholder="Enter option"
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => remove(index)}
                      >
                        <Trash2 />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  className="w-fit rounded-2xl bg-gray-100 border-0 self-center"
                  variant="outline"
                  onClick={() => append({ value: "" })}
                >
                  <Plus className="mr-1 h-4 w-4" /> Add another option
                </Button>
              </div>
            )}
            <SwitchField control={control} name="required" label="Required" />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { AddFieldDialog };
