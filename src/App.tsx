import { Input } from "./components/ui";
import { DatePicker } from "./components/ui/date-picker";

function App() {
  return (
    <div className="flex flex-col h-screen items-center justify-center gap-1.5">
      <h1 className="text-2xl font-bold">Shadcn Form Designer</h1>
      <p className="text-gray-600">
        A simple and customizable form builder for React.
      </p>
      <DatePicker
        value={new Date()}
        onChange={(date) => console.log(date)}
        placeholder="Select a date"
        className="mt-4"
        maxDate={new Date(2026, 11, 31)}
        minDate={new Date(2020, 0, 1)}
      />
      <Input
        type="time"
        step="1"
        defaultValue="10:30"
        className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-sm"
      />
    </div>
  );
}

export default App;
