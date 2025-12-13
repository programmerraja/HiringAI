import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Plus, Building2, Users, MoreVertical, Pencil, Trash2, Play, Pause, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agentApi, Agent } from "@/services/agent.api";
import { companyApi, Company } from "@/services/company.api";

const statusColors: Record<string, string> = {
  draft: "bg-neutral-700 text-neutral-300",
  active: "bg-green-900/50 text-green-400",
  paused: "bg-yellow-900/50 text-yellow-400",
  archived: "bg-neutral-800 text-neutral-500",
};

const pillarLabels: Record<string, string> = {
  experience: "Experience",
  behavioral: "Behavioral",
  role_specific: "Role-Specific",
  cultural_fit: "Cultural Fit",
};

export function AgentsPage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agentsData, companiesData] = await Promise.all([
        agentApi.getAll(),
        companyApi.getAll(),
      ]);
      setAgents(agentsData);
      setCompanies(companiesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: Agent["status"]) => {
    try {
      const updated = await agentApi.updateStatus(id, status);
      setAgents(agents.map((a) => (a._id === id ? updated : a)));
      setMenuOpen(null);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;
    try {
      await agentApi.delete(id);
      setAgents(agents.filter((a) => a._id !== id));
      setMenuOpen(null);
    } catch (err) {
      console.error("Failed to delete agent:", err);
    }
  };

  const getCompanyName = (agent: Agent) => {
    if (typeof agent.companyId === "object" && agent.companyId?.name) {
      return agent.companyId.name;
    }
    const company = companies.find((c) => c._id === agent.companyId);
    return company?.name || "Unknown";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Agents</h1>
          <p className="text-neutral-400 mt-1">Manage your interview agents</p>
        </div>
        {companies.length > 0 ? (
          <Button
            className="gap-2 bg-white text-black hover:bg-neutral-200"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4" />
            Create Agent
          </Button>
        ) : (
          <Button
            className="gap-2 bg-white text-black hover:bg-neutral-200"
            onClick={() => navigate("/dashboard/settings")}
          >
            <Building2 className="h-4 w-4" />
            Add Company First
          </Button>
        )}
      </div>

      {showCreateForm && (
        <CreateAgentForm
          companies={companies}
          onClose={() => setShowCreateForm(false)}
          onCreated={(agent) => {
            setAgents([agent, ...agents]);
            setShowCreateForm(false);
          }}
        />
      )}

      {agents.length === 0 ? (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-8">
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No agents yet</h3>
            <p className="text-neutral-400 mb-4">
              {companies.length > 0
                ? "Create your first agent to start interviewing candidates"
                : "Add a company first, then create an agent"}
            </p>
            {companies.length > 0 ? (
              <Button
                className="gap-2 bg-white text-black hover:bg-neutral-200"
                onClick={() => setShowCreateForm(true)}
              >
                <Plus className="h-4 w-4" />
                Create Agent
              </Button>
            ) : (
              <Button
                className="gap-2 bg-white text-black hover:bg-neutral-200"
                onClick={() => navigate("/dashboard/settings")}
              >
                <Building2 className="h-4 w-4" />
                Add Company
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {agents.map((agent) => (
            <div
              key={agent._id}
              className="bg-neutral-900 rounded-lg border border-neutral-800 p-5 hover:border-neutral-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-neutral-800 rounded-lg flex items-center justify-center">
                    <Bot className="h-6 w-6 text-neutral-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3
                        className="text-white font-semibold cursor-pointer hover:text-neutral-300"
                        onClick={() => navigate(`/dashboard/agents/${agent._id}`)}
                      >
                        {agent.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${statusColors[agent.status]}`}>
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm mt-1">{agent.jobDetails.title}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {getCompanyName(agent)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />0 candidates
                      </span>
                    </div>
                    {agent.pillars.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {agent.pillars.map((pillar) => (
                          <span
                            key={pillar}
                            className="text-xs bg-neutral-800 text-neutral-400 px-2 py-1 rounded"
                          >
                            {pillarLabels[pillar] || pillar}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                    onClick={() => setMenuOpen(menuOpen === agent._id ? null : agent._id)}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>

                  {menuOpen === agent._id && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10">
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-neutral-700 flex items-center gap-2"
                        onClick={() => navigate(`/dashboard/agents/${agent._id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      {agent.status !== "active" && (
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-green-400 hover:bg-neutral-700 flex items-center gap-2"
                          onClick={() => handleStatusChange(agent._id, "active")}
                        >
                          <Play className="h-4 w-4" />
                          Activate
                        </button>
                      )}
                      {agent.status === "active" && (
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-yellow-400 hover:bg-neutral-700 flex items-center gap-2"
                          onClick={() => handleStatusChange(agent._id, "paused")}
                        >
                          <Pause className="h-4 w-4" />
                          Pause
                        </button>
                      )}
                      {agent.status !== "archived" && (
                        <button
                          className="w-full px-4 py-2 text-left text-sm text-neutral-400 hover:bg-neutral-700 flex items-center gap-2"
                          onClick={() => handleStatusChange(agent._id, "archived")}
                        >
                          <Archive className="h-4 w-4" />
                          Archive
                        </button>
                      )}
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-neutral-700 flex items-center gap-2"
                        onClick={() => handleDelete(agent._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Create Agent Form Component
function CreateAgentForm({
  companies,
  onClose,
  onCreated,
}: {
  companies: Company[];
  onClose: () => void;
  onCreated: (agent: Agent) => void;
}) {
  const [formData, setFormData] = useState({
    companyId: companies[0]?._id || "",
    name: "",
    jobTitle: "",
    jobDescription: "",
    pillars: [] as string[],
    persona: "formal" as "formal" | "casual",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allPillars = ["experience", "behavioral", "role_specific", "cultural_fit"];

  const togglePillar = (pillar: string) => {
    setFormData((prev) => ({
      ...prev,
      pillars: prev.pillars.includes(pillar)
        ? prev.pillars.filter((p) => p !== pillar)
        : [...prev.pillars, pillar],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.jobTitle || !formData.companyId) {
      setError("Name, job title, and company are required");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const agent = await agentApi.create({
        companyId: formData.companyId,
        name: formData.name,
        jobDetails: {
          title: formData.jobTitle,
          description: formData.jobDescription,
        },
        pillars: formData.pillars,
        persona: formData.persona,
      });
      onCreated(agent);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Create New Agent</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Agent Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Senior Developer Screener"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Company</label>
            <select
              value={formData.companyId}
              onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600"
            >
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-1">Job Title</label>
          <input
            type="text"
            value={formData.jobTitle}
            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
            placeholder="e.g., Senior Software Engineer"
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-1">Job Description</label>
          <textarea
            value={formData.jobDescription}
            onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
            placeholder="Describe the role requirements..."
            rows={3}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-2">Assessment Pillars</label>
          <div className="flex flex-wrap gap-2">
            {allPillars.map((pillar) => (
              <button
                key={pillar}
                type="button"
                onClick={() => togglePillar(pillar)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  formData.pillars.includes(pillar)
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                }`}
              >
                {pillarLabels[pillar]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-2">Agent Persona</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, persona: "formal" })}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                formData.persona === "formal"
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Formal & Professional
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, persona: "casual" })}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                formData.persona === "casual"
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
            >
              Casual & Friendly
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-white text-black hover:bg-neutral-200"
          >
            {submitting ? "Creating..." : "Create Agent"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-neutral-700 text-white hover:bg-neutral-800"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
