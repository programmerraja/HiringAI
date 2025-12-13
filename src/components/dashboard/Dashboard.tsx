import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";

export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-svh flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto p-6 flex-grow">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Welcome to your Dashboard
          </h1>

          {user && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-700">
                Your Profile
              </h2>
              <div className="bg-gray-50 p-5 rounded-md border border-gray-200">
                <div className="grid gap-3">
                  <p className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">
                      Name:
                    </span>
                    <span className="text-gray-800">{user.name}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">
                      Email:
                    </span>
                    <span className="text-gray-800">{user.email}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">
                      Role:
                    </span>
                    <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {user.role}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-700">
              What's Next?
            </h2>
            <div className="bg-blue-50 p-5 rounded-md border border-blue-100">
              <p className="text-gray-700 leading-relaxed">
                This is your dashboard where you can manage your account and
                access various features. The authentication system is already
                set up with secure cookie-based JWT authentication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
