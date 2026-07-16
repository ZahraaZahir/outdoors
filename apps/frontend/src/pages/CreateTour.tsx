import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useIraqCities } from "../hooks/useIraqCities";

export default function CreateTour() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { cities, loading: citiesLoading } = useIraqCities();
  const [form, setForm] = useState({ title: "", description: "", destination: "", date: "", priceIQD: 0, maxSeats: 30 });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError("Image must be under 4MB."); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const city = cities.find((c) => c.name === name);
    setForm((prev) => ({ ...prev, destination: name }));
    setCoords(city ? { lat: city.latitude, lng: city.longitude } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUploading(true);
    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const data = await api.uploadImage(imageFile);
        imageUrl = data.url;
      }
      await api.createTour({
        ...form,
        imageUrl,
        latitude: coords?.lat,
        longitude: coords?.lng,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
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
              {citiesLoading ? (
                <div className="h-10 w-full animate-pulse rounded-xl bg-gray-100" />
              ) : (
                <select
                  required
                  value={form.destination}
                  onChange={handleCityChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Select a city in Iraq</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Description</label>
              <textarea
                placeholder="Describe the tour experience..."
                rows={4}
                value={form.description}
                onChange={update("description")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Cover image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="h-40 w-full rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-gray-200 px-4 py-8 text-sm text-muted transition-colors hover:border-primary-400 hover:text-primary-600"
                >
                  Click to upload an image
                </button>
              )}
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
                min={1}
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
            <button type="submit" disabled={uploading} className="mt-2 w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
              {uploading ? "Uploading..." : "Create Tour"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
