import type { SerializableFieldConfig } from "@/types";

export const FormConfig: SerializableFieldConfig[] = [
  {
    type: "input",
    name: "fullName",
    label: "Full Name",
    placeholder: "Enter your name",
    minLength: 3,
    maxLength: 50,
    validation: { type: "string", min: 3, max: 50 },
  },
  {
    type: "textarea",
    name: "bio",
    label: "Short Bio",
    placeholder: "Tell us about yourself",
    maxLength: 200,
    validation: { type: "string", max: 200 },
  },
  {
    type: "file",
    name: "avatar",
    label: "Profile Picture",
    accept: "image/*",
    maxSizeMB: 5,
    validation: { type: "file", accept: "image/*", maxSizeMB: 5 },
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
    validation: { type: "enum", values: ["PH", "US", "AU"] },
  },
  {
    type: "radio",
    name: "gender",
    label: "Gender",
    options: [
      { label: "Male", value: "male" },
      { label: "Female", value: "female" },
    ],
    validation: { type: "enum", values: ["male", "female"] },
  },
  {
    type: "date",
    name: "birthDate",
    label: "Birth Date",
    minDate: new Date("1900-01-01"),
    maxDate: new Date(),
    validation: {
      type: "date",
      min: "1900-01-01T00:00:00.000Z",
      max: new Date().toISOString(),
    },
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
    validation: { type: "enum", values: ["highschool", "bachelor", "master"] },
  },
  {
    type: "switch",
    name: "newsletter",
    label: "Subscribe to newsletter",
    validation: { type: "boolean" },
  },
];
