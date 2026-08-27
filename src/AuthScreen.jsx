import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Mail, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { signIn, signUp, resetPasswordForEmail } from "./lib/auth";

export default function AuthScreen() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signupDone, setSignupDone] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  function translateAuthError(msg) {
    if (!msg) return "אירעה שגיאה, נסו שוב";
    if (msg.includes("Invalid login credentials")) return "אימייל או סיסמה שגויים";
    if (msg.includes("User already registered")) return "כבר קיים משתמש עם האימייל הזה";
    if (msg.includes("Password should be at least")) return "הסיסמה קצרה מדי (לפחות 6 תווים)";
    if (msg.includes("Unable to validate email")) return "כתובת האימייל אינה תקינה";
    return msg;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (mode === "forgot") {
      if (!email.trim()) {
        setError("יש למלא אימייל");
        return;
      }
      setLoading(true);
      try {
        await resetPasswordForEmail(email.trim());
        setResetSent(true);
      } catch (err) {
        // Don't reveal whether the email exists — show the same generic success either way
        setResetSent(true);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email.trim() || !password) {
      setError("יש למלא אימייל וסיסמה");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await signIn(email.trim(), password);
        // onAuthStateChange in App.jsx will pick up the new session automatically
      } else {
        await signUp(email.trim(), password);
        setSignupDone(true);
      }
    } catch (err) {
      setError(translateAuthError(err.message));
    } finally {
      setLoading(false);
    }
  }

  function goToMode(newMode) {
    setMode(newMode);
    setError(null);
    setResetSent(false);
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

        {signupDone ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <p className="text-sm font-semibold text-neutral-800">נרשמת בהצלחה!</p>
            <p className="text-xs leading-relaxed text-neutral-500">
              אם החשבון דורש אימות אימייל, יישלח אליכם מייל עם קישור לאישור. לאחר מכן ניתן להתחבר עם האימייל והסיסמה שבחרתם.
            </p>
            <button
              onClick={() => {
                setSignupDone(false);
                goToMode("login");
              }}
              className="mt-2 text-xs font-semibold text-pink-600 hover:underline"
            >
              חזרה למסך התחברות
            </button>
          </div>
        ) : mode === "forgot" ? (
          <>
            <button
              onClick={() => goToMode("login")}
              className="mb-4 flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
            >
              <ArrowRight size={13} />
              חזרה להתחברות
            </button>

            {resetSent ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 size={32} className="text-emerald-500" />
                <p className="text-sm font-semibold text-neutral-800">שלחנו לך מייל</p>
                <p className="text-xs leading-relaxed text-neutral-500">
                  אם קיים חשבון עם הכתובת <span dir="ltr">{email.trim()}</span>, נשלח אליו מייל עם קישור לאיפוס הסיסמה. פתחו את הקישור כדי לבחור סיסמה חדשה.
                </p>
                <button onClick={() => goToMode("login")} className="mt-2 text-xs font-semibold text-pink-600 hover:underline">
                  חזרה למסך התחברות
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div>
                  <p className="mb-3 text-xs leading-relaxed text-neutral-500">
                    הזינו את כתובת האימייל שאיתה נרשמתם, ונשלח אליכם קישור לאיפוס הסיסמה.
                  </p>
                  <label className="mb-1.5 block text-sm font-medium text-neutral-700">אימייל</label>
                  <div className="relative">
                    <Mail size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      autoComplete="username"
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
                  שליחת קישור לאיפוס
                </button>
              </form>
            )}
          </>
        ) : (
          <>
            <div className="mb-5 flex gap-1.5 rounded-lg bg-neutral-100 p-1">
              <button
                type="button"
                onClick={() => goToMode("login")}
                className={
                  "flex-1 rounded-md py-1.5 text-xs font-semibold transition " +
                  (mode === "login" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700")
                }
              >
                התחברות
              </button>
              <button
                type="button"
                onClick={() => goToMode("signup")}
                className={
                  "flex-1 rounded-md py-1.5 text-xs font-semibold transition " +
                  (mode === "signup" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700")
                }
              >
                הרשמה
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-neutral-700">אימייל</label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="username"
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-3 pr-9 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-neutral-700">סיסמה</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => goToMode("forgot")} className="text-xs font-semibold text-pink-600 hover:underline">
                      שכחתי סיסמה
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-3 pr-9 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
                {mode === "signup" && <p className="mt-1 text-xs text-neutral-400">לפחות 6 תווים</p>}
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
                {mode === "login" ? "התחברות" : "יצירת חשבון"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
