import { DatePicker } from "./components/ui/date-picker";

function App() {
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-1.5">
      <h1 className="text-2xl font-bold">Shadcn Form Designer</h1>
      <p className="text-gray-600">
        A simple and customizable form builder for React.
      </p>
      <DatePicker
        mode="single"
        value={new Date()}
        onChange={(date) => console.log(date)}
        placeholder="Select a date"
        className="mt-4"
      />
    </div>
  );
}

export default App;
