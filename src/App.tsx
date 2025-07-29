import { InputField } from "@/components/fields/input-field";
import { TextareaField } from "@/components/fields/textarea-field";
import { Button } from "@/components/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1).max(10),
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
    <div className="flex flex-col h-screen items-center justify-center gap-1.5">
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
          <Button>Submit</Button>
        </form>
      </FormProvider>
    </div>
  );
}

export default App;
