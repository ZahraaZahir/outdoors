import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-md p-8">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>}
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded border p-2" />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="rounded border p-2" />
        <button type="submit" className="rounded bg-black p-2 text-white hover:bg-gray-800">Login</button>
      </form>
      <p className="mt-4 text-sm text-gray-500">
        Don't have an account? <Link to="/register" className="underline">Register</Link>
      </p>
    </div>
  );
}
