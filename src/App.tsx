import { CheckboxField } from "@/components/fields/checkbox-field";
import { FileUploadField } from "@/components/fields/fileupload-field";
import { InputField } from "@/components/fields/input-field";
import { RadioGroupField } from "@/components/fields/radiogroup-field";
import { TextareaField } from "@/components/fields/textarea-field";
import { Button } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { ComboboxField } from "./components/fields/combobox-field";

const educationOptions = [
  { label: "High School", value: "high_school" },
  { label: "Associate Degree", value: "associate" },
  { label: "Bachelor's Degree", value: "bachelor" },
  { label: "Master's Degree", value: "master" },
  { label: "Doctorate", value: "doctorate" },
];

const notificationOptions = [
  { label: "All new messages", value: "all" },
  { label: "Direct messages and mentions", value: "mentions" },
  { label: "Nothing", value: "none" },
];

const validEducationValues = educationOptions.map((opt) => opt.value);
const validNotificationValues = notificationOptions.map((opt) => opt.value);

const formSchema = z.object({
  name: z
    .string({
      error: "This is a required field.",
    })
    .min(1),
  description: z
    .string({
      error: "This is a required field.",
    })
    .min(1)
    .max(10),
  image: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), {
      error: "File must be an image",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      error: "Image must be less than 5MB",
    })
    .optional(),
  checkbox: z.boolean().optional(),
  education: z
    .string({
      error: "This is a required field.",
    })
    .min(1, { error: "Education is required" })
    .refine((val) => validEducationValues.includes(val), {
      message: "Please select a valid education level",
    }),
  notification: z
    .string()
    .min(1, { error: "Notfication is required" })
    .refine((val) => validNotificationValues.includes(val), {
      error: "Please select a valid notification",
    }),
});

function App() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    control,
    formState: { errors },
  } = form;

  return (
    <div className="flex flex-col py-20 items-center justify-center gap-1.5">
      <h1 className="text-2xl font-bold">Shadcn Form Designer</h1>
      <p className="text-gray-600">
        A simple and customizable form builder for React.
      </p>
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
          {/* TODO: Fix input for this */}
          <FileUploadField
            control={control}
            name="image"
            error={errors.image?.message}
          />
          <CheckboxField
            control={control}
            name="checkbox"
            label="Checkbox"
            description="This is an example of a checkbox field"
            error={errors.checkbox?.message}
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
          <Button>Submit</Button>
        </form>
      </FormProvider>
    </div>
  );
}

export default App;
