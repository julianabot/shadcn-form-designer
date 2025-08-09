import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import type { FieldType } from "../types";
import { InputField, SelectField, SwitchField } from "./fields";
import { buttonVariants } from "./ui/button";
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
  required: z.boolean(),
});

function AddFieldDialog() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    formState: { errors },
  } = form;
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
              error={errors.type?.message}
              options={fieldTypeOptions}
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
            <SwitchField control={control} name="required" label="Required" />
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

export { AddFieldDialog };
