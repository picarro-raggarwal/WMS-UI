import { useLoginMutation } from "@/common/authAPI";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function AuthLogin() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginMutation] = useLoginMutation();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await loginMutation({
        username,
        password
      }).unwrap();

      if (response && response.access_token) {
        login(response);
      } else {
        setError("Invalid username or password");
      }
    } catch (err: any) {
      setError(
        err?.data?.error_description ||
          err?.data?.message ||
          "Invalid username or password"
      );
      console.error("Login failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 bg-white shadow-lg p-8 rounded-2xl w-full max-w-md">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 mb-2">
        <h2 className="mt-2 font-semibold text-neutral-800 text-xl">
          Welcome to WMS
        </h2>
        <p className="text-neutral-600 text-sm text-center">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-2">
          <label
            htmlFor="username"
            className="text-sm font-medium text-neutral-700"
          >
            Username
          </label>
          <Input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
            className="border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-neutral-700"
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
              required
              className="border-neutral-200 focus:border-primary-500 focus:ring-primary-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="min-h-[1.25rem] text-red-500 text-sm">{error}</span>
          <button
            type="button"
            className="text-neutral-600 text-sm hover:underline cursor-not-allowed"
            disabled
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="bg-primary-600 hover:bg-primary-700 shadow focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 font-semibold text-white"
        >
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
}
