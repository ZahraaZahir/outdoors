import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { setPendingPassword } from "../lib/pendingAuth";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", password: "", phoneNumber: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { otpCode } = await register(form);
      setPendingPassword(form.password);
      navigate(`/verify-phone?phone=${encodeURIComponent(form.phoneNumber)}`, {
        state: { otpCode },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-light px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="font-heading text-2xl font-bold text-dark">Create an account</h1>
            <p className="mt-1 text-sm text-muted">Join us for your next adventure</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Full name</label>
              <input
                placeholder="John Doe"
                required
                value={form.name}
                onChange={update("name")}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Phone number</label>
              <input
                type="tel"
                placeholder="07701234567"
                required
                value={form.phoneNumber}
                onChange={update("phoneNumber")}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark">Password</label>
              <input
                type="password"
                placeholder="Min 6 characters"
                required
                minLength={6}
                value={form.password}
                onChange={update("password")}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <button type="submit" disabled={submitting} className="mt-2 w-full rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
              {submitting ? "Creating account..." : "Register"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary-600 transition-colors hover:text-primary-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
