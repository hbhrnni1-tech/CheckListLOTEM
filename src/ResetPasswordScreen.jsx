import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Lock, CheckCircle2 } from "lucide-react";
import { updatePassword } from "./lib/auth";

export default function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים");
      return;
    }
    if (password !== confirm) {
      setError("הסיסמאות אינן תואמות");
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err.message || "שגיאה בעדכון הסיסמה, נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-neutral-50 px-4" style={{ fontFamily: "'Heebo', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&family=Rubik:wght@700;800;900&display=swap');`}</style>

      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <h1 className="flex items-center gap-1.5 text-xl font-black text-neutral-900" style={{ fontFamily: "'Rubik', sans-serif" }}>
            ניהול צ'ק-ליסטים
            <Sparkles size={18} className="text-pink-500" strokeWidth={2.5} />
          </h1>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <p className="text-sm font-semibold text-neutral-800">הסיסמה עודכנה בהצלחה!</p>
            <button
              onClick={onDone}
              className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              המשך לאפליקציה
            </button>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm font-bold text-neutral-800">בחירת סיסמה חדשה</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">סיסמה חדשה</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-3 pr-9 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-400">לפחות 6 תווים</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">אימות סיסמה</label>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-3 pr-9 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
                  <AlertCircle size={14} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:opacity-60"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                עדכון סיסמה
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
