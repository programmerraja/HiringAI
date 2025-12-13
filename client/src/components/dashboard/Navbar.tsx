import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/signin");
  };

  return (
    <nav className="bg-black border-b border-neutral-800">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="monogram_grad" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
                <stop stop-color="#A855F7" /> <stop offset="1" stop-color="#3B82F6" /> </linearGradient>
            </defs>
            <path d="M14 10C14 8.89543 14.8954 8 16 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H16C14.8954 40 14 39.1046 14 38V10Z" fill="url(#monogram_grad)" />
            <path d="M26 18C26 16.8954 26.8954 16 28 16H32C33.1046 16 34 16.8954 34 18V38C34 39.1046 33.1046 40 32 40H28C26.8954 40 26 39.1046 26 38V18Z" fill="url(#monogram_grad)" fill-opacity="0.8" />
            <path d="M22 22H26" stroke="url(#monogram_grad)" stroke-width="4" stroke-linecap="round" />
            <circle cx="38" cy="12" r="4" fill="#EC4899" /> </svg>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <div className="text-sm text-neutral-400">
              Welcome,{" "}
              <span className="font-medium text-white">{user.name}</span>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-neutral-700 bg-transparent text-white hover:bg-neutral-800 hover:text-white transition-colors"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
