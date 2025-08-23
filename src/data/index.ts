import type { FieldWithValidation } from "@/types";
import { z, type ZodTypeAny } from "zod";

export const FormConfig: FieldWithValidation<ZodTypeAny>[] = [
  {
    type: "input",
    name: "fullName",
    label: "Full Name",
    placeholder: "Enter your name",
    minLength: 3,
    maxLength: 50,
    validation: z
      .string()
      .min(3, "Name must be at least 3 characters")
      .max(50, "Name must be at most 50 characters"),
  },
  {
    type: "textarea",
    name: "bio",
    label: "Short Bio",
    placeholder: "Tell us about yourself",
    maxLength: 200,
    validation: z.string().max(200, "Max 200 characters"),
  },
  {
    type: "file",
    name: "avatar",
    label: "Profile Picture",
    accept: "image/*",
    maxSizeMB: 5,
    validation: z
      .instanceof(File, { message: "Must be a file" })
      .refine((file) => file.type.startsWith("image/"), {
        message: "File must be an image",
      })
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: "Image must be less than 5MB",
      }),
  },
  {
    type: "combobox",
    name: "country",
    label: "Country",
    options: [
      { label: "Philippines", value: "PH" },
      { label: "United States", value: "US" },
      { label: "Australia", value: "AU" },
    ],
    validation: z.enum(["PH", "US", "AU"], {
      required_error: "Please select a country",
    }),
  },
  {
    type: "radio",
    name: "gender",
    label: "Gender",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
    validation: z.enum(["male", "female"], {
      required_error: "Please select gender",
    }),
  },
  {
    type: "date",
    name: "birthDate",
    label: "Birth Date",
    minDate: new Date("1900-01-01"),
    maxDate: new Date(),
    validation: z.date({
      required_error: "Please select your birth date",
    }),
  },
  {
    type: "select",
    name: "education",
    label: "Education Level",
    options: [
      { label: "High School", value: "highschool" },
      { label: "Bachelor's", value: "bachelor" },
      { label: "Master's", value: "master" },
    ],
    validation: z.enum(["highschool", "bachelor", "master"], {
      required_error: "Please select education level",
    }),
  },
  {
    type: "switch",
    name: "newsletter",
    label: "Subscribe to newsletter",
    validation: z.boolean(),
  },
];
