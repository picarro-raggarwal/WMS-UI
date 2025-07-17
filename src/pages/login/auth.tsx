import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function AuthLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      if (username.toLowerCase() === "service" && password === "service") {
        login();
        navigate("/dashboard");
      } else {
        setError("Invalid username or password");
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
      {/* Welcome */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <h2 className="mt-2 font-semibold text-neutral-800 text-xl">
          Welcome to WMS
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="font-medium text-neutral-800 text-sm"
          >
            Username or Email
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username or email"
            autoComplete="username"
            className="bg-white px-4 border border-neutral-200 rounded-xl h-11 text-neutral-900 placeholder:text-neutral-500 placeholder:text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="font-medium text-neutral-800 text-sm"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="bg-white px-4 pr-10 border border-neutral-200 rounded-xl h-11 text-neutral-900 placeholder:text-neutral-500 placeholder:text-sm"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="top-1/2 right-3 absolute focus:outline-none text-neutral-500 hover:text-neutral-700 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="min-h-[1.25rem] text-red-500 text-sm">{error}</span>
          <button
            type="button"
            className="text-neutral-600 text-sm hover:underline cursor-not-allowed"
            tabIndex={-1}
            disabled
          >
            Forgot password?
          </button>
        </div>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="bg-primary-600 hover:bg-primary-700 shadow mt-2 rounded-full focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 w-full h-11 font-semibold text-white text-base"
        >
          Login
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 bg-neutral-200 h-px" />
        <span className="text-neutral-600 text-xs">or</span>
        <div className="flex-1 bg-neutral-200 h-px" />
      </div>

      {/* Create Account Link (placeholder) */}
      <div className="text-center">
        <span className="text-neutral-600 text-sm">New to Picarro? </span>
        <a
          href="#"
          className="text-primary-600 text-sm hover:underline cursor-not-allowed"
          tabIndex={-1}
          aria-disabled="true"
        >
          Create Account
        </a>
      </div>
    </div>
  );
}
