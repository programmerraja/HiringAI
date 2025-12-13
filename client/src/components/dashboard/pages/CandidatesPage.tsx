import { useState, useEffect } from "react";
import { Users, Plus, Mail, Phone, FileText, Trash2, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { candidateApi, Candidate } from "@/services/candidate.api";
import { agentApi, Agent } from "@/services/agent.api";

export function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterAgent, setFilterAgent] = useState<string>("");
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchCandidates();
  }, [filterAgent]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [candidatesData, agentsData] = await Promise.all([
        candidateApi.getAll(),
        agentApi.getAll(),
      ]);
      setCandidates(candidatesData);
      setAgents(agentsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await candidateApi.getAll(filterAgent || undefined);
      setCandidates(data);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this candidate?")) return;
    try {
      await candidateApi.delete(id);
      setCandidates(candidates.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Failed to delete candidate:", err);
    }
  };

  const getAgentName = (candidate: Candidate) => {
    if (!candidate.agentId) {
      return "Unassigned";
    }
    if (typeof candidate.agentId === "object" && candidate.agentId?.name) {
      return candidate.agentId.name;
    }
    const agent = agents.find((a) => a._id === candidate.agentId);
    return agent?.name || "Unknown";
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
          <h1 className="text-2xl font-bold text-white">Candidates</h1>
          <p className="text-neutral-400 mt-1">View and manage all candidates</p>
        </div>
        <Button
          className="gap-2 bg-white text-black hover:bg-neutral-200"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </Button>
      </div>

      {/* Filters */}
      {candidates.length > 0 && (
        <div className="flex gap-4 mb-6">
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-white text-sm focus:outline-none focus:border-neutral-700"
          >
            <option value="">All Agents</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {showAddForm && (
        <AddCandidateForm
          agents={agents}
          onClose={() => setShowAddForm(false)}
          onCreated={(candidate) => {
            setCandidates([candidate, ...candidates]);
            setShowAddForm(false);
          }}
        />
      )}

      {viewCandidate && (
        <CandidateDetailModal
          candidate={viewCandidate}
          agentName={getAgentName(viewCandidate)}
          onClose={() => setViewCandidate(null)}
        />
      )}

      {candidates.length === 0 ? (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-8">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No candidates yet</h3>
            <p className="text-neutral-400 mb-4">
              Add candidates to start the interview process. You can assign them to agents later.
            </p>
            <Button
              className="gap-2 bg-white text-black hover:bg-neutral-200"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4" />
              Add Candidate
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">Contact</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">Agent</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-neutral-400">Added</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate) => (
                <tr
                  key={candidate._id}
                  className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50"
                >
                  <td className="px-4 py-3">
                    <span className="text-white font-medium">{candidate.name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-neutral-400 text-sm flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {candidate.email}
                      </span>
                      {candidate.phone && (
                        <span className="text-neutral-500 text-sm flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {candidate.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-neutral-400 text-sm">{getAgentName(candidate)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-neutral-500 text-sm">
                      {new Date(candidate.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-neutral-400 hover:text-white hover:bg-neutral-800"
                        onClick={() => setViewCandidate(candidate)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-neutral-800"
                        onClick={() => handleDelete(candidate._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Add Candidate Form
function AddCandidateForm({
  agents,
  onClose,
  onCreated,
}: {
  agents: Agent[];
  onClose: () => void;
  onCreated: (candidate: Candidate) => void;
}) {
  const [formData, setFormData] = useState({
    agentId: "",
    name: "",
    email: "",
    phone: "",
    resume: "",
    scheduledTime: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setError("Name and email are required");
      return;
    }

    if (formData.agentId && !formData.scheduledTime) {
      setError("Scheduled time is required when assigning to an agent");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const createData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resume: formData.resume,
        ...(formData.agentId && { agentId: formData.agentId, scheduledTime: formData.scheduledTime }),
      };
      const candidate = await candidateApi.create(createData);
      onCreated(candidate);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create candidate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Add New Candidate</h2>
        <button onClick={onClose} className="text-neutral-400 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Agent (optional)</label>
            <select
              value={formData.agentId}
              onChange={(e) => setFormData({ ...formData, agentId: e.target.value, scheduledTime: e.target.value ? formData.scheduledTime : "" })}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="">Unassigned</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name} - {agent.jobDetails.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formData.agentId && (
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Scheduled Interview Time</label>
            <input
              type="datetime-local"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-neutral-300 mb-1">
            <FileText className="h-4 w-4 inline mr-1" />
            Resume (paste text)
          </label>
          <textarea
            value={formData.resume}
            onChange={(e) => setFormData({ ...formData, resume: e.target.value })}
            placeholder="Paste resume content here..."
            rows={4}
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-white text-black hover:bg-neutral-200"
          >
            {submitting ? "Adding..." : "Add Candidate"}
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

// Candidate Detail Modal
function CandidateDetailModal({
  candidate,
  agentName,
  onClose,
}: {
  candidate: Candidate;
  agentName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">{candidate.name}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-neutral-400">Email</label>
              <p className="text-white">{candidate.email}</p>
            </div>
            <div>
              <label className="text-sm text-neutral-400">Phone</label>
              <p className="text-white">{candidate.phone || "—"}</p>
            </div>
            <div>
              <label className="text-sm text-neutral-400">Agent</label>
              <p className="text-white">{agentName}</p>
            </div>
            <div>
              <label className="text-sm text-neutral-400">Added</label>
              <p className="text-white">{new Date(candidate.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Resume */}
          {candidate.resume && (
            <div>
              <label className="text-sm text-neutral-400 mb-2 block">Resume</label>
              <div className="bg-neutral-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                <pre className="text-sm text-neutral-300 whitespace-pre-wrap font-sans">
                  {candidate.resume}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
