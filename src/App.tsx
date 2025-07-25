import { ExampleCombobox } from "@/components/ui/combobox";

function App() {
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-1.5">
      <h1 className="text-2xl font-bold">Shadcn Form Designer</h1>
      <p className="text-gray-600">
        A simple and customizable form builder for React.
      </p>
      <ExampleCombobox />
    </div>
  );
}

export default App;
