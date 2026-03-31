import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { registerBuiltInFields } from "@/registry/built-in-fields";
import { getRegisteredFieldTypes, unregisterField } from "@/registry";
import { DynamicForm } from "@/components/dynamic-form";
import type { SerializableFieldConfig, FormLayout } from "@/types";

beforeEach(() => {
  for (const type of getRegisteredFieldTypes()) {
    unregisterField(type);
  }
  registerBuiltInFields();
});

describe("DynamicForm", () => {
  it("renders fields from serializable config", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "input",
        name: "username",
        label: "Username",
        placeholder: "Enter username",
        validation: { type: "string", min: 1 },
      },
      {
        type: "switch",
        name: "newsletter",
        label: "Subscribe to newsletter",
        validation: { type: "boolean" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByText("Subscribe to newsletter")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("renders fields from FormLayout config", () => {
    const config: FormLayout = {
      fields: {
        name: {
          type: "input",
          name: "name",
          label: "Full Name",
          validation: { type: "string" },
        },
        agree: {
          type: "switch",
          name: "agree",
          label: "I agree",
          validation: { type: "boolean" },
        },
      },
      sections: [
        {
          order: 0,
          title: "Personal Info",
          fields: [
            { fieldName: "name", order: 0 },
            { fieldName: "agree", order: 1 },
          ],
        },
      ],
    };
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Personal Info")).toBeInTheDocument();
    expect(screen.getByText("Full Name")).toBeInTheDocument();
    expect(screen.getByText("I agree")).toBeInTheDocument();
  });

  it("calls onUnsupportedField for unknown field types", () => {
    const onUnsupported = vi.fn();
    const config: SerializableFieldConfig[] = [
      {
        type: "unknown-type" as any,
        name: "mystery",
        label: "Mystery",
        validation: { type: "string" },
      },
    ];
    render(<DynamicForm config={config} onUnsupportedField={onUnsupported} />);
    expect(onUnsupported).toHaveBeenCalledWith("unknown-type", "mystery");
  });

  it("renders select field with options", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "select",
        name: "color",
        label: "Favorite Color",
        options: [
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ],
        validation: { type: "enum", values: ["red", "blue"] },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Favorite Color")).toBeInTheDocument();
  });

  it("renders radio field with options", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "radio",
        name: "size",
        label: "Size",
        options: [
          { label: "Small", value: "sm" },
          { label: "Large", value: "lg" },
        ],
        validation: { type: "enum", values: ["sm", "lg"] },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Size")).toBeInTheDocument();
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
  });

  it("renders textarea field", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "textarea",
        name: "bio",
        label: "Biography",
        placeholder: "Write about yourself",
        validation: { type: "string", max: 500 },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Biography")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write about yourself"),
    ).toBeInTheDocument();
  });

  it("renders date field", () => {
    const config: SerializableFieldConfig[] = [
      {
        type: "date",
        name: "startDate",
        label: "Start Date",
        validation: { type: "date" },
      },
    ];
    render(<DynamicForm config={config} />);
    expect(screen.getByText("Start Date")).toBeInTheDocument();
  });

  it("calls onChange when form values change", async () => {
    const onChange = vi.fn();
    const config: SerializableFieldConfig[] = [
      {
        type: "input",
        name: "test",
        label: "Test",
        validation: { type: "string" },
      },
    ];
    render(<DynamicForm config={config} onChange={onChange} />);
    const input = screen.getByPlaceholderText("Enter test");
    await userEvent.type(input, "hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("sorts sections by order in layout mode", () => {
    const config: FormLayout = {
      fields: {
        a: {
          type: "input",
          name: "a",
          label: "Field A",
          validation: { type: "string" },
        },
        b: {
          type: "input",
          name: "b",
          label: "Field B",
          validation: { type: "string" },
        },
      },
      sections: [
        {
          order: 1,
          title: "Second Section",
          fields: [{ fieldName: "b", order: 0 }],
        },
        {
          order: 0,
          title: "First Section",
          fields: [{ fieldName: "a", order: 0 }],
        },
      ],
    };
    render(<DynamicForm config={config} />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings[0]).toHaveTextContent("First Section");
    expect(headings[1]).toHaveTextContent("Second Section");
  });
});
