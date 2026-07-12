import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function CreateTour() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", destination: "", date: "", priceIQD: 0, maxSeats: 30 });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.createTour(form);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.type === "number" ? Number(e.target.value) : e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-light px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold text-dark">Create a tour</h1>
            <p className="mt-1 text-sm text-muted">List a new adventure for travelers</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Title</label>
              <input
                placeholder="e.g. Dukan Lake Escape"
                required
                value={form.title}
                onChange={update("title")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Destination</label>
              <input
                placeholder="e.g. Dukan, Sulaymaniyah"
                required
                value={form.destination}
                onChange={update("destination")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Date & time</label>
              <input
                type="datetime-local"
                required
                value={form.date}
                onChange={update("date")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Price (IQD)</label>
              <input
                type="number"
                placeholder="0"
                required
                min={0}
                value={form.priceIQD}
                onChange={update("priceIQD")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Max seats</label>
              <input
                type="number"
                placeholder="30"
                required
                min={1}
                value={form.maxSeats}
                onChange={update("maxSeats")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button type="submit" className="mt-2 w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
              Create Tour
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
