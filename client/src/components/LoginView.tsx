import { useState, useEffect } from "react";
import { Activity, Shield, CheckCircle, Lock, Mail, Eye, EyeOff, Sparkles, User } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
}

interface LoginViewProps {
  onLoginSuccess: (profile: UserProfile) => void;
}

export function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [particles, setParticles] = useState<Array<{ id: number; style: React.CSSProperties }>>([]);

  // Generate floating background particles
  useEffect(() => {
    const list = Array.from({ length: 8 }).map((_, i) => {
      const size = Math.random() * 80 + 40;
      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 80 + 10}%`,
          top: `${Math.random() * 80 + 10}%`,
          animationDuration: `${Math.random() * 15 + 15}s`,
          animationDelay: `${Math.random() * -20}s`,
        }
      };
    });
    setParticles(list);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      const usersStr = localStorage.getItem("curalink_users") || "[]";
      const users = JSON.parse(usersStr);

      if (mode === "login") {
        const found = users.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (found) {
          setIsSubmitting(false);
          onLoginSuccess({ name: found.name, email: found.email });
        } else {
          setIsSubmitting(false);
          setErrorMsg("Invalid clinical email or security password.");
        }
      } else {
        // Register mode
        if (!name.trim()) {
          setIsSubmitting(false);
          setErrorMsg("Full name is required.");
          return;
        }
        if (password.length < 6) {
          setIsSubmitting(false);
          setErrorMsg("Password must be at least 6 characters.");
          return;
        }
        if (password !== confirmPassword) {
          setIsSubmitting(false);
          setErrorMsg("Passwords do not match.");
          return;
        }

        const exists = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          setIsSubmitting(false);
          setErrorMsg("An account with this email already exists.");
          return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem("curalink_users", JSON.stringify(users));

        setIsSubmitting(false);
        onLoginSuccess({ name: newUser.name, email: newUser.email });
      }
    }, 1000);
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrorMsg(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#020617] text-slate-100 font-sans overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="relative w-full md:w-1/2 flex flex-col justify-between p-8 lg:p-16 mesh-gradient overflow-hidden border-b md:border-b-0 md:border-r border-slate-800/40">
        {particles.map((p) => (
          <div key={p.id} className="floating-particle" style={p.style} />
        ))}

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-[0_0_20px_rgba(37,99,235,0.4)] pulse-cyan-glow">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white font-display">Curalink</span>
            <span className="ml-1.5 text-[10px] font-semibold tracking-wider text-cyan-400 uppercase bg-cyan-950/50 border border-cyan-800/30 px-1.5 py-0.5 rounded">Enterprise</span>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <h1 className="text-3xl lg:text-4xl xl:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.15]">
            AI Medical Research Assistant
          </h1>
          <p className="mt-4 text-base lg:text-lg text-slate-300 leading-relaxed font-light">
            Transforming Medical Knowledge Into Actionable Intelligence.
          </p>

          <div className="mt-8 glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-cyan-500" />
            <p className="text-sm italic text-slate-200 leading-relaxed font-light">
              "Every breakthrough in medicine begins with a question. Our AI helps researchers find answers faster, more accurately, and with greater confidence."
            </p>
            <div className="mt-4 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                AI Medical Research Platform
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3.5">
            {[
              "AI-Powered Research Analysis",
              "Medical Document Intelligence",
              "Evidence-Based Insights",
              "Secure Healthcare Data Processing",
              "Enterprise Grade Security"
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300 font-light">
                <CheckCircle className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-6 pt-6 border-t border-slate-800/50">
          <div>
            <div className="text-2xl font-bold text-white font-display">95%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-light">Faster Research</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-display">50K+</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-light">Papers Parsed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-display">99.9%</div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-light">Secure Infrastructure</div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 lg:p-12 bg-gradient-to-b from-[#090d16] to-[#020617] relative">
        <div className="absolute w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md glass-card p-8 lg:p-10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative z-10 transition-all duration-500 hover:border-white/10">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              {mode === "login" ? "Clinical Sign In" : "Register Clinical Account"}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 font-light">
              {mode === "login" ? "Enter your clinical credentials to access your workspace" : "Register your details to establish a secure workspace"}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 text-xs text-red-400 bg-red-950/30 border border-red-900/30 rounded-xl px-3.5 py-2.5">
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Field (Only in Register) */}
            {mode === "register" && (
              <div className="space-y-1.5 animate-slide-up">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                  Full Name & Title
                </label>
                <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/50 transition-all">
                  <User className="h-4 w-4 text-slate-500 shrink-0" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-655 focus:outline-none min-w-0 font-light"
                    placeholder="e.g. Dr. Sarah Jenkins"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                Clinical Email
              </label>
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/50 transition-all">
                <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-655 focus:outline-none min-w-0 font-light"
                  placeholder="researcher@hospital.org"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/50 transition-all">
                <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-655 focus:outline-none min-w-0 font-light"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only in Register) */}
            {mode === "register" && (
              <div className="space-y-1.5 animate-slide-up">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider ml-1">
                  Confirm Password
                </label>
                <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2.5 focus-within:border-blue-500/50 transition-all">
                  <Lock className="h-4 w-4 text-slate-500 shrink-0" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-655 focus:outline-none min-w-0 font-light"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(37,99,235,0.3)] hover:shadow-[0_4px_25px_rgba(37,99,235,0.45)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Initializing Workspace...
                </div>
              ) : (
                <>
                  {mode === "login" ? "Access Research Workspace" : "Register and Open Workspace"}
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                </>
              )}
            </button>
          </form>

          {/* Toggle login/register */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-400 font-light">
              {mode === "login" ? "Don't have a workspace account? " : "Already registered for a workspace? "}
            </span>
            <button 
              onClick={toggleMode}
              className="text-cyan-400 font-semibold hover:underline"
            >
              {mode === "login" ? "Register Workspace" : "Sign In"}
            </button>
          </div>

        </div>

        {/* HIPAA Security Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-500 flex items-center gap-2 justify-center">
          <Shield className="h-3.5 w-3.5 text-slate-500" />
          HIPAA & GDPR Compliant Security · SOC 2 Type II Certified
        </div>
      </div>

    </div>
  );
}
