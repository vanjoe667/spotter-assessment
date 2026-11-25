import { useState, type FormEvent } from "react";
import type { RouteFormValues } from "../types";

interface Props {
  onSubmit: (values: RouteFormValues) => void;
  loading: boolean;
}

export function RouteForm({ onSubmit, loading }: Props) {
  const [values, setValues] = useState<RouteFormValues>({
    origin: "",
    destination: "",
    departure_datetime: "",
    load_weight: 40000,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === "load_weight" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
          <input
            name="origin"
            type="text"
            required
            placeholder="e.g. Chicago, IL"
            value={values.origin}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
          <input
            name="destination"
            type="text"
            required
            placeholder="e.g. St. Louis, MO"
            value={values.destination}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Departure</label>
          <input
            name="departure_datetime"
            type="datetime-local"
            required
            value={values.departure_datetime}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Load Weight (lbs)</label>
          <input
            name="load_weight"
            type="number"
            required
            min={0}
            max={80000}
            step={500}
            value={values.load_weight}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Calculating routes…
          </span>
        ) : (
          "Find Safe Routes"
        )}
      </button>
    </form>
  );
}
