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
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Create Tour</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>}
        <input placeholder="Title" required value={form.title} onChange={update("title")} className="rounded border p-2" />
        <input placeholder="Destination" required value={form.destination} onChange={update("destination")} className="rounded border p-2" />
        <input type="datetime-local" required value={form.date} onChange={update("date")} className="rounded border p-2" />
        <input type="number" placeholder="Price (IQD)" required min={0} value={form.priceIQD} onChange={update("priceIQD")} className="rounded border p-2" />
        <input type="number" placeholder="Max seats" required min={1} value={form.maxSeats} onChange={update("maxSeats")} className="rounded border p-2" />
        <button type="submit" className="rounded bg-black p-2 text-white hover:bg-gray-800">Create Tour</button>
      </form>
    </div>
  );
}
