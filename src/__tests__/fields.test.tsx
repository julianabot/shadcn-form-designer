import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { registerBuiltInFields } from "@/registry/built-in-fields";
import { getRegisteredFieldTypes, unregisterField } from "@/registry";
import { DynamicForm } from "@/components/dynamic-form";
import type { SerializableFieldConfig } from "@/types";

beforeEach(() => {
  for (const type of getRegisteredFieldTypes()) {
    unregisterField(type);
  }
  registerBuiltInFields();
});

describe("InputField", () => {
  it("renders with label and placeholder", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "input",
        name: "name",
        label: "Full Name",
        placeholder: "Enter your name",
        validation: { type: "string" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });
  it("renders description", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "input",
        name: "email",
        label: "Email",
        description: "We will never share your email",
        validation: { type: "string" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(
      screen.getByText("We will never share your email"),
    ).toBeInTheDocument();
  });
});

describe("TextareaField", () => {
  it("renders with label and placeholder", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "textarea",
        name: "bio",
        label: "Bio",
        placeholder: "Tell us",
        validation: { type: "string" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Bio")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tell us")).toBeInTheDocument();
  });
});

describe("SelectField", () => {
  it("renders with label and description", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "select",
        name: "color",
        label: "Favorite Color",
        description: "Choose a color",
        options: [
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ],
        validation: { type: "enum", values: ["red", "blue"] },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Favorite Color")).toBeInTheDocument();
    expect(screen.getByText("Choose a color")).toBeInTheDocument();
  });
});

describe("SwitchField", () => {
  it("renders with label and description", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "switch",
        name: "newsletter",
        label: "Subscribe",
        description: "Get updates",
        validation: { type: "boolean" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Subscribe")).toBeInTheDocument();
    expect(screen.getByText("Get updates")).toBeInTheDocument();
  });
});

describe("RadioGroupField", () => {
  it("renders with label, options, and description", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "radio",
        name: "answer",
        label: "Do you agree?",
        description: "Select one",
        options: [
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ],
        validation: { type: "enum", values: ["yes", "no"] },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Do you agree?")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("Select one")).toBeInTheDocument();
  });
});

describe("DatePickerField", () => {
  it("renders with label and description", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "date",
        name: "birthday",
        label: "Birthday",
        description: "When were you born?",
        validation: { type: "date" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Birthday")).toBeInTheDocument();
    expect(screen.getByText("When were you born?")).toBeInTheDocument();
  });
});

describe("ComboboxField", () => {
  it("renders with label and description", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "combobox",
        name: "fw",
        label: "Framework",
        description: "Pick your favorite",
        options: [
          { label: "React", value: "react" },
          { label: "Vue", value: "vue" },
        ],
        validation: { type: "enum", values: ["react", "vue"] },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Framework")).toBeInTheDocument();
    expect(screen.getByText("Pick your favorite")).toBeInTheDocument();
  });
});

describe("TimeField", () => {
  it("renders with label", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "time",
        name: "startTime",
        label: "Start Time",
        validation: { type: "string" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Start Time")).toBeInTheDocument();
  });
});
