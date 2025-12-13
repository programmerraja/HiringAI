import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Spinner } from "@/components/ui/spinner";

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
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="monogram_grad" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
              <stop stop-color="#A855F7" /> <stop offset="1" stop-color="#3B82F6" /> </linearGradient>
          </defs>
          <path d="M14 10C14 8.89543 14.8954 8 16 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H16C14.8954 40 14 39.1046 14 38V10Z" fill="url(#monogram_grad)" />
          <path d="M26 18C26 16.8954 26.8954 16 28 16H32C33.1046 16 34 16.8954 34 18V38C34 39.1046 33.1046 40 32 40H28C26.8954 40 26 39.1046 26 38V18Z" fill="url(#monogram_grad)" fill-opacity="0.8" />
          <path d="M22 22H26" stroke="url(#monogram_grad)" stroke-width="4" stroke-linecap="round" />
          <circle cx="38" cy="12" r="4" fill="#EC4899" /> </svg>
        <span className="text-blue-600 font-bold text-xl">HiringAI</span>
      </div>
      <Spinner size="lg" className="text-blue-600" />
      <div className="mt-4 text-gray-500">Loading...</div>
    </div>
  );
}
