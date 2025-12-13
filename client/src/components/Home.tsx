import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";
import { Bot } from "lucide-react";

export function Home() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect when loading is complete
    if (!loading) {
      // If user is authenticated, go to dashboard
      if (user) {
        navigate("/dashboard", { replace: true });
      } else {
        // If not authenticated, go to landing page
        navigate("/landing", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mb-4 flex items-center gap-2">
        <Bot className="h-6 w-6 text-blue-600" />
        <span className="text-blue-600 font-bold text-xl">HiringAI</span>
      </div>
      <Spinner size="lg" className="text-blue-600" />
      <div className="mt-4 text-gray-500">Loading...</div>
    </div>
  );
}
