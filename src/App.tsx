import { FieldsExample } from "@/components/tabs/fields-example-tab";
import { FormDesigner } from "@/components/tabs/form-designer-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  return (
    <div className="flex flex-col py-20 items-center justify-center gap-1.5">
      <h1 className="text-2xl font-bold text-center">Shadcn Form Designer</h1>
      <p className="text-gray-600 text-center">
        A simple and customizable form builder for React.
      </p>
      <Tabs
        defaultValue="designer"
        className="w-full max-w-2xl justify-center items-center px-5"
      >
        <TabsList>
          <TabsTrigger value="fields">Available Fields</TabsTrigger>
          <TabsTrigger value="designer">Form Designer</TabsTrigger>
        </TabsList>
        <TabsContent value="fields" className="w-full">
          <FieldsExample />
        </TabsContent>
        <TabsContent value="designer" className="w-full">
          <FormDesigner />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;
