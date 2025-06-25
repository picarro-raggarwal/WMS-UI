import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

export default function AuthLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serviceCode, setServiceCode] = useState("service");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    if (serviceCode.toLowerCase() === "service") {
      // add 1 s leep to simulate loading
      setTimeout(() => {
        setLoading(false);
        login();
        navigate("/dashboard");
      }, 1000);
    } else {
      setTimeout(() => {
        setLoading(false);
      }, 5000);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <Input
        type="text"
        value={serviceCode}
        onChange={(e) => setServiceCode(e.target.value)}
        placeholder="Username"
        className="focus-visible:ring-offset-0 rounded-xl h-11 px-4 bg-white/10 border-white/10 text-white placeholder:text-sm placeholder:text-neutral-500"
      />

      <Button
        //  loading={loading}
        type="submit"
        variant="ghost"
        loading={loading}
        className="transition-none rounded-xl w-full border border-white/10 text-white bg-white/10 backdrop-blur-sm hover:bg-white/15 hover:text-white">
        Continue to Login
      </Button>
    </form>
  );
}
