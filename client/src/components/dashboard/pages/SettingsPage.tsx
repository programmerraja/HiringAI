import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Plus, Trash2, RefreshCw, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companyApi, Company } from "@/services/company.api";

export function SettingsPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scrapingId, setScrapingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await companyApi.getAll();
      setCompanies(data);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.website) {
      setError("Name and website are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const newCompany = await companyApi.create(formData);
      setCompanies([newCompany, ...companies]);
      setFormData({ name: "", website: "" });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create company");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      await companyApi.delete(id);
      setCompanies(companies.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to delete company:", err);
    }
  };

  const handleRescrape = async (id: string) => {
    try {
      setScrapingId(id);
      const updated = await companyApi.rescrape(id);
      setCompanies(companies.map((c) => (c._id === id ? updated : c)));
    } catch (err) {
      console.error("Failed to rescrape:", err);
    } finally {
      setScrapingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-neutral-400 mt-1">Manage your profile and companies</p>
      </div>

      {/* Profile Section */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
        {user && (
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-neutral-400 w-24">Name:</span>
              <span className="text-white">{user.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-neutral-400 w-24">Email:</span>
              <span className="text-white">{user.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-neutral-400 w-24">Role:</span>
              <span className="capitalize bg-neutral-800 text-white px-2 py-1 rounded text-xs font-medium">
                {user.role}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Companies Section */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Companies</h2>
          {!showAddForm && (
            <Button
              size="sm"
              className="gap-2 bg-white text-black hover:bg-neutral-200"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Company
            </Button>
          )}
        </div>

        {/* Add Company Form */}
        {showAddForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-neutral-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-white">Add New Company</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
                className="text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-neutral-300">
                  Company Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Acme Inc"
                  className="mt-1 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                />
              </div>
              <div>
                <Label htmlFor="website" className="text-neutral-300">
                  Website URL
                </Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-1 bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  We'll scrape this website to extract company context for interviews
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-white text-black hover:bg-neutral-200"
                >
                  {submitting ? "Creating..." : "Create Company"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setError(null);
                  }}
                  className="border-neutral-700 text-white hover:bg-neutral-800"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Companies List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full mx-auto"></div>
            <p className="text-neutral-400 mt-2">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="h-10 w-10 text-neutral-600 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-white mb-1">No companies yet</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Add a company to use as context for your interview agents
            </p>
            {!showAddForm && (
              <Button
                size="sm"
                variant="outline"
                className="gap-2 border-neutral-700 text-white hover:bg-neutral-800"
                onClick={() => setShowAddForm(true)}
              >
                <Plus className="h-4 w-4" />
                Add Company
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company._id}
                className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-neutral-700 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{company.name}</h3>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      <Globe className="h-3 w-3" />
                      {company.website}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700"
                    onClick={() => handleRescrape(company._id)}
                    disabled={scrapingId === company._id}
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${scrapingId === company._id ? "animate-spin" : ""}`}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-neutral-700 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    onClick={() => handleDelete(company._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
