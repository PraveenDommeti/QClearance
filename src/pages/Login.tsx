import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, LogIn, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await login(username, password);
    
    if (success) {
      navigate("/dashboard");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">QClearance</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Quantum-Enhanced Aviation Safety Monitoring
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">Sign In</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enter your credentials to access the system
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-foreground mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-secondary/50 border border-white/10 rounded-lg 
                           text-foreground placeholder:text-muted-foreground
                           focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
                           transition-all"
                placeholder="Enter your username"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-secondary/50 border border-white/10 rounded-lg 
                             text-foreground placeholder:text-muted-foreground
                             focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30
                             transition-all"
                  placeholder="Enter your password"
                  required
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full py-3 bg-gradient-to-r from-primary to-emerald-500 text-primary-foreground 
                         font-medium rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-muted-foreground text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-secondary/30 rounded-lg text-center">
                <p className="font-medium text-foreground">Controller</p>
                <p className="text-muted-foreground">controller / atc123</p>
              </div>
              <div className="p-2 bg-secondary/30 rounded-lg text-center">
                <p className="font-medium text-foreground">Supervisor</p>
                <p className="text-muted-foreground">supervisor / sup123</p>
              </div>
              <div className="p-2 bg-secondary/30 rounded-lg text-center">
                <p className="font-medium text-foreground">Admin</p>
                <p className="text-muted-foreground">admin / admin123</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          DXB International Airport • Human-in-Loop Control System
        </p>
      </div>
    </div>
  );
}
