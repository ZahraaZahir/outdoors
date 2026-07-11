import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phoneNumber: "" });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>}
        <input placeholder="Name" required value={form.name} onChange={update("name")} className="rounded border p-2" />
        <input type="email" placeholder="Email" required value={form.email} onChange={update("email")} className="rounded border p-2" />
        <input type="password" placeholder="Password (min 6 chars)" required minLength={6} value={form.password} onChange={update("password")} className="rounded border p-2" />
        <input placeholder="Phone (e.g. 07701234567)" required value={form.phoneNumber} onChange={update("phoneNumber")} className="rounded border p-2" />
        <button type="submit" className="rounded bg-black p-2 text-white hover:bg-gray-800">Register</button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Already have an account? <Link to="/login" className="underline">Login</Link>
      </p>
    </div>
  );
}
