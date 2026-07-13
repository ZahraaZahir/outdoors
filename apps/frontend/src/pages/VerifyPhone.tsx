import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function VerifyPhone() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const phoneNumber = searchParams.get("phone") || "";

  const [otpCode, setOtpCode] = useState<string>(
    (location.state as { otpCode?: string; password?: string } | null)?.otpCode ?? ""
  );
  const password = (location.state as { password?: string } | null)?.password ?? "";
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d.length === 1)) {
      submitCode(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newCode = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);
    const nextEmpty = newCode.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    if (pasted.length === 6) submitCode(pasted);
  };

  const submitCode = async (fullCode: string) => {
    setError("");
    try {
      await api.verifyPhone({ phoneNumber, code: fullCode });
      setSuccess(true);
      if (password) {
        await login(phoneNumber, password);
        setTimeout(() => navigate("/"), 1500);
      } else {
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err: any) {
      setError(err.message);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      const res = await api.resendOtp(phoneNumber);
      setOtpCode(res.otpCode);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  if (!phoneNumber) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-light px-4 pt-16">
        <div className="rounded-2xl border border-primary-100 bg-white p-8 shadow-sm text-center">
          <p className="text-muted">No phone number provided. Please register first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-light px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
              <svg className="h-7 w-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h1 className="font-heading text-2xl font-bold text-dark">Verify your phone</h1>
            <p className="mt-1 text-sm text-muted">
              Enter the 6-digit code sent to<br />
              <span className="font-medium text-dark">{phoneNumber}</span>
            </p>
          </div>

          {otpCode && (
            <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-medium">Demo mode</p>
              <p className="mt-1">
                Your verification code is{" "}
                <span className="font-mono text-base font-bold text-amber-900">{otpCode}</span>
              </p>
              <p className="mt-1 text-xs text-amber-600">
                In production, this would be sent via SMS.
              </p>
            </div>
          )}

          {success ? (
            <div className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm text-green-700">
              {password ? "Phone verified! Redirecting to homepage..." : "Phone verified! Redirecting to login..."}
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              <div className="flex justify-center gap-1.5 sm:gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="h-11 w-11 rounded-xl border border-gray-200 text-center text-base font-semibold text-dark transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:h-12 sm:w-12 sm:text-lg"
                  />
                ))}
              </div>

              <p className="mt-6 text-center text-sm text-muted">
                {cooldown > 0 ? (
                  <span>Resend code in {cooldown}s</span>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="font-medium text-primary-600 transition-colors hover:text-primary-700 disabled:opacity-50"
                  >
                    {resending ? "Sending..." : "Resend code"}
                  </button>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
