import { ComboboxField } from "@/components/fields/combobox-field";
import { DatePickerField } from "@/components/fields/datepicker-field";
import { FileUploadField } from "@/components/fields/fileupload-field";
import { InputField } from "@/components/fields/input-field";
import { RadioGroupField } from "@/components/fields/radiogroup-field";
import { SelectField } from "@/components/fields/select-field";
import { SwitchField } from "@/components/fields/switch-field";
import { TextareaField } from "@/components/fields/textarea-field";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { enUS } from "date-fns/locale";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import type { Option } from "../types";

const educationOptions: Option[] = [
  { label: "High School", value: "high_school" },
  { label: "Associate Degree", value: "associate" },
  { label: "Bachelor's Degree", value: "bachelor" },
  { label: "Master's Degree", value: "master" },
  { label: "Doctorate", value: "doctorate" },
];

const notificationOptions: Option[] = [
  { label: "All new messages", value: "all" },
  { label: "Direct messages and mentions", value: "mentions" },
  { label: "Nothing", value: "none" },
];

const mediumOptions: Option[] = [
  { label: "Books", value: "books" },
  { label: "Music", value: "music" },
  { label: "Movies", value: "movies" },
];

const validEducationValues = educationOptions.map((opt) => opt.value);
const validNotificationValues = notificationOptions.map((opt) => opt.value);
const validMediumValues = mediumOptions.map((opt) => opt.value);

const minDate = new Date(1900, 0, 1);
const today = new Date();
const maxDate = new Date(today.setFullYear(today.getFullYear() - 18));

const formSchema = z.object({
  name: z
    .string({
      required_error: "This is a required field.",
    })
    .min(1),
  description: z
    .string({
      required_error: "This is a required field.",
    })
    .min(1)
    .max(10),
  image: z
    .instanceof(File, { message: "Must be a file" })
    .refine((file) => Boolean(file), {
      message: "Image is required",
    })
    .refine((file) => file.type.startsWith("image/"), {
      message: "File must be an image",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image must be less than 5MB",
    }),
  checkbox: z.boolean().optional(),
  education: z
    .string({
      required_error: "This is a required field.",
    })
    .min(1)
    .refine((val) => validEducationValues.includes(val), {
      message: "Please select a valid education level",
    }),
  notification: z
    .string({ required_error: "Notfication is required" })
    .min(1)
    .refine((val) => validNotificationValues.includes(val)),
  birthday: z
    .date({
      required_error: "Birthday is required.",
    })
    .refine((d) => d >= minDate, {
      message: `Date must be after ${minDate.toLocaleDateString()}`,
    })
    .refine((d) => d <= maxDate, {
      message: `Date must be before ${maxDate.toLocaleDateString()}`,
    }),
  time: z
    .string({
      required_error: "This is a required field.",
    })
    .min(1),
  medium: z
    .string({
      required_error: "This is a required field.",
    })
    .min(1)
    .refine((val) => validMediumValues.includes(val), {
      message: "Please select a valid medium level",
    }),
  switch: z.boolean().optional(),
});

export function FieldsExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((data) => console.log(data))}
        className="w-full max-w-2xl flex flex-col gap-5"
      >
        <InputField
          control={control}
          name="name"
          label="Name"
          placeholder="Type something..."
          description="This is an example input field."
          error={errors.name?.message}
        />
        <TextareaField
          control={control}
          name="description"
          label="Description"
          placeholder="Type something"
          description="This is an example of a description field"
          error={errors.description?.message}
        />
        <FileUploadField
          control={control}
          name="image"
          error={errors.image?.message}
        />
        <ComboboxField
          control={control}
          name="education"
          label="Education"
          description="What's your education level"
          options={educationOptions}
          error={errors.education?.message}
        />
        <RadioGroupField
          control={form.control}
          name="notification"
          label="Notify me about..."
          options={notificationOptions}
        />
        <DatePickerField
          control={form.control}
          name="birthday"
          label="Birthday"
          placeholder="Select a birthday"
          minDate={minDate}
          maxDate={maxDate}
          locale={enUS}
        />
        <InputField
          control={control}
          name="time"
          label="Time"
          type="time"
          placeholder="Type something..."
          description="This is an example time picker field."
          error={errors.time?.message}
        />
        <SelectField
          control={control}
          name="medium"
          label="Medium"
          description="Select a medium"
          options={mediumOptions}
          error={errors.medium?.message}
        />
        <SwitchField
          control={control}
          name="switch"
          label="Switch"
          description="This is an example of a switch."
        />
        <Button>Submit</Button>
      </form>
    </FormProvider>
  );
}
