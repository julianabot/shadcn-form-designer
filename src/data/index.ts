import type { FormLayout, SerializableFieldConfig } from "@/types";

/** Flat config — still works with DynamicForm for backward compat. */
export const FormConfigFlat: SerializableFieldConfig[] = [
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

/** Layout-based config — same fields, but with sections, rows, and columns. */
export const FormConfig: FormLayout = {
  fields: {
    fullName: {
      type: "input",
      name: "fullName",
      label: "Full Name",
      placeholder: "Enter your name",
      minLength: 3,
      maxLength: 50,
      required: true,
      validation: { type: "string", min: 3, max: 50 },
    },
    bio: {
      type: "textarea",
      name: "bio",
      label: "Short Bio",
      placeholder: "Tell us about yourself",
      maxLength: 200,
      validation: { type: "string", max: 200 },
    },
    avatar: {
      type: "file",
      name: "avatar",
      label: "Profile Picture",
      accept: "image/*",
      maxSizeMB: 5,
      validation: { type: "file", accept: "image/*", maxSizeMB: 5 },
    },
    country: {
      type: "combobox",
      name: "country",
      label: "Country",
      required: true,
      options: [
        { label: "Philippines", value: "PH" },
        { label: "United States", value: "US" },
        { label: "Australia", value: "AU" },
      ],
      validation: { type: "enum", values: ["PH", "US", "AU"] },
    },
    gender: {
      type: "radio",
      name: "gender",
      label: "Gender",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
      validation: { type: "enum", values: ["male", "female"] },
    },
    birthDate: {
      type: "date",
      name: "birthDate",
      label: "Birth Date",
      required: true,
      minDate: new Date("1900-01-01"),
      maxDate: new Date(),
      validation: {
        type: "date",
        min: "1900-01-01T00:00:00.000Z",
        max: new Date().toISOString(),
      },
    },
    education: {
      type: "select",
      name: "education",
      label: "Education Level",
      options: [
        { label: "High School", value: "highschool" },
        { label: "Bachelor's", value: "bachelor" },
        { label: "Master's", value: "master" },
      ],
      validation: {
        type: "enum",
        values: ["highschool", "bachelor", "master"],
      },
    },
    newsletter: {
      type: "switch",
      name: "newsletter",
      label: "Subscribe to newsletter",
      validation: { type: "boolean" },
    },
  },
  sections: [
    {
      order: 0,
      title: "Personal Information",
      fields: [
        { fieldName: "fullName", order: 0 },
        { fieldName: "birthDate", order: 1 },
        { fieldName: "bio", order: 2 },
        { fieldName: "avatar", order: 3 },
      ],
    },
    {
      order: 1,
      title: "Demographics",
      fields: [
        { fieldName: "country", order: 0 },
        { fieldName: "gender", order: 1 },
        { fieldName: "education", order: 2 },
      ],
    },
    {
      order: 2,
      title: "Preferences",
      fields: [{ fieldName: "newsletter", order: 0 }],
    },
  ],
};
