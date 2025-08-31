/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { MultipleOptionFieldProps } from "@/types";
import { Trash2 } from "lucide-react";
import type {
  Control,
  FieldValues,
  Path,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

interface MultipleOptionFieldPropsFixed<TFieldValues extends FieldValues>
  extends MultipleOptionFieldProps<TFieldValues> {
  register: UseFormRegister<TFieldValues>;
  setValue: UseFormSetValue<TFieldValues>;
  control: Control<TFieldValues>;
}

function MultipleOptionField<TFieldValues extends FieldValues>(
  props: MultipleOptionFieldPropsFixed<TFieldValues>
) {
  const { control, name, label, options, error, register, setValue } = props;
  return (
    <FormField
      control={control}
      name={name as Path<TFieldValues>}
      render={() => (
        <FormItem className="flex flex-col justify-center">
          <FormLabel>{label}</FormLabel>
          {options?.map((_, index) => (
            <div key={index} className="flex flex-col gap-1">
              <div className="flex flex-row gap-1">
                <FormControl>
                  <Input
                    {...register(`${name}.${index}` as Path<TFieldValues>)}
                    id={`options-${index}`}
                    placeholder="Enter option"
                  />
                </FormControl>
                {options.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() =>
                      setValue(
                        name as Path<TFieldValues>,
                        options.filter((_, i) => i !== index) as any,
                        { shouldValidate: true }
                      )
                    }
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          ))}
          <Button
            type="button"
            className="w-fit rounded-2xl bg-gray-100 border-0 self-center"
            variant="outline"
            onClick={() =>
              setValue(
                name as Path<TFieldValues>,
                [
                  ...(options ? options.map((opt) => opt.value) : []),
                  "",
                ] as any,
                { shouldValidate: true }
              )
            }
          >
            + Add another option
          </Button>
        </FormItem>
      )}
    />
  );
}

export { MultipleOptionField };
