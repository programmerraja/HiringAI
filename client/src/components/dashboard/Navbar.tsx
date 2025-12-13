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
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">BlazeStack</h1>
        </div>

        <div className="flex items-center gap-6">
          {user && (
            <div className="text-sm text-gray-600">
              Welcome,{" "}
              <span className="font-medium text-gray-800">{user.name}</span>
            </div>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
