import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useIraqCities } from "../hooks/useIraqCities";

export default function EditTour() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tourId = Number(id);
  const { cities, loading: citiesLoading } = useIraqCities();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [date, setDate] = useState("");
  const [priceIQD, setPriceIQD] = useState(0);
  const [maxSeats, setMaxSeats] = useState(30);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    api.getTour(tourId).then((tour) => {
      setTitle(tour.title);
      setDescription(tour.description || "");
      setDestination(tour.destination);
      if (tour.latitude != null && tour.longitude != null) {
        setCoords({ lat: tour.latitude, lng: tour.longitude });
      }
      setDate(new Date(tour.date).toISOString().slice(0, 16));
      setPriceIQD(tour.priceIQD);
      setMaxSeats(tour.maxSeats);
      setImageUrl(tour.imageUrl || "");
    }).catch(() => setError("Tour not found."))
      .finally(() => setLoading(false));
  }, [tourId]);

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.value;
    const city = cities.find((c) => c.name === name);
    setDestination(name);
    setCoords(city ? { lat: city.latitude, lng: city.longitude } : null);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) { setError("Image must be under 4MB."); return; }
    setUploadingImage(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const token = localStorage.getItem("token");
      const res = await fetch("/api/uploads/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.message || "Upload failed"); }
      const { url } = await res.json();
      setImageUrl(url);
    } catch (err: any) { setError(err.message); }
    finally { setUploadingImage(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.updateTour(tourId, {
        title,
        description: description || undefined,
        destination,
        latitude: coords?.lat,
        longitude: coords?.lng,
        date: new Date(date).toISOString(),
        priceIQD,
        maxSeats,
        imageUrl: imageUrl || undefined,
      });
      navigate("/admin");
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20">
        <div className="mx-auto max-w-2xl px-4 animate-pulse">
          <div className="mb-6 h-8 w-48 rounded bg-gray-200" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-2xl bg-gray-100" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-dark">Edit Tour</h1>
          <p className="mt-2 text-muted">Update the details of this tour.</p>
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-primary-100 bg-white p-8 shadow-sm">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Title</label>
            <input type="text" required minLength={3} maxLength={100} value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-primary-200 bg-primary-50/30 px-4 py-3 text-dark placeholder:text-muted/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Description</label>
            <textarea rows={4} maxLength={2000} value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl border border-primary-200 bg-primary-50/30 px-4 py-3 text-dark placeholder:text-muted/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none resize-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Destination</label>
            {citiesLoading ? (
              <div className="h-12 w-full animate-pulse rounded-2xl bg-gray-100" />
            ) : (
              <select
                required
                value={destination}
                onChange={handleCityChange}
                className="w-full rounded-2xl border border-primary-200 bg-primary-50/30 px-4 py-3 text-dark placeholder:text-muted/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none"
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
            <label className="mb-2 block text-sm font-medium text-dark">Date & time</label>
            <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-2xl border border-primary-200 bg-primary-50/30 px-4 py-3 text-dark placeholder:text-muted/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Price (IQD)</label>
              <input type="number" required min={1} max={10000000} value={priceIQD} onChange={(e) => setPriceIQD(Number(e.target.value))}
                className="w-full rounded-2xl border border-primary-200 bg-primary-50/30 px-4 py-3 text-dark placeholder:text-muted/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-dark">Max seats</label>
              <input type="number" min={1} max={1000} value={maxSeats} onChange={(e) => setMaxSeats(Number(e.target.value))}
                className="w-full rounded-2xl border border-primary-200 bg-primary-50/30 px-4 py-3 text-dark placeholder:text-muted/50 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">Tour image</label>
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange}
              className="w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-700 hover:file:bg-primary-100" />
            {uploadingImage && <p className="mt-2 text-sm text-muted">Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="Preview" className="mt-3 h-40 rounded-2xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
          </div>

          <button type="submit" disabled={submitting || uploadingImage}
            className="w-full rounded-full bg-primary-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
            {submitting ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
