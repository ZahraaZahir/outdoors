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
    <div className="flex min-h-screen items-center justify-center bg-light px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold text-dark">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in to your account</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button type="submit" className="mt-2 w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
              Login
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary-600 transition-colors hover:text-primary-700">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
