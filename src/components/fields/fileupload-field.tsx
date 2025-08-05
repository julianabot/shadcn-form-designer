"use client";

import { FileUpload } from "@/components/ui/file-upload";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from "react";
import type { FieldValues } from "react-hook-form";
import type { FieldProps } from "../../types";

function FileUploadField<TFieldValues extends FieldValues>({
  control,
  name,
  error,
}: FieldProps<TFieldValues>) {
  const [file, setFile] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <div className="space-y-2">
              <FileUpload
                error={error}
                previewUrl={previewUrl}
                alt={previewUrl}
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0] ?? null;
                  if (selectedFile) {
                    setFile(selectedFile);
                    field.onChange(selectedFile);
                  }
                }}
              />
            </div>
          </FormControl>
          {error && <FormMessage>{error}</FormMessage>}
        </FormItem>
      )}
    />
  );
}

export { FileUploadField };
