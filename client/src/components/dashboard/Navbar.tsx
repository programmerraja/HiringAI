import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bot } from "lucide-react";

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
          <Bot className="h-6 w-6 text-white" />
          <span className="text-white font-bold text-xl">HiringAI</span>
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
