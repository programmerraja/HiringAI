import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Settings, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agentApi, Agent } from "@/services/agent.api";
import { candidateApi, Candidate } from "@/services/candidate.api";
import { QuestionGenerator } from "@/components/dashboard/QuestionGenerator";
import { UserPlus, UserMinus,Calendar, Clock, ExternalLink } from "lucide-react";

type TabType = "config" | "candidates" | "calls";

interface Call {
  _id: string;
  candidateId: { _id: string; name: string; email: string; phone: string } | string;
  agentId: string;
  status: "scheduled" | "in_progress" | "completed";
  scheduledTime: string;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const pillarLabels: Record<string, string> = {
  experience: "Experience",
  behavioral: "Behavioral",
  role_specific: "Role-Specific",
  cultural_fit: "Cultural Fit",
};

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("config");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Config tab state
  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    jobDescription: "",
    pillars: [] as string[],
    questions: [] as string[],
    prompt: "",
    persona: "formal" as "formal" | "casual",
  });

  // Candidates tab state
  const [assignedCandidates, setAssignedCandidates] = useState<Candidate[]>([]);
  const [unassignedCandidates, setUnassignedCandidates] = useState<Candidate[]>([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [assigning, setAssigning] = useState(false);

  // Calls tab state
  const [calls, setCalls] = useState<Call[]>([]);
  const [callsLoading, setCallsLoading] = useState(false);

  useEffect(() => {
    if (id) fetchAgent();
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "candidates") {
      fetchCandidates();
    }
    if (id && activeTab === "calls") {
      fetchCalls();
    }
  }, [id, activeTab]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const data = await agentApi.getById(id!);
      setAgent(data);
      setFormData({
        name: data.name,
        jobTitle: data.jobDetails.title,
        jobDescription: data.jobDetails.description,
        pillars: data.pillars,
        questions: data.questions,
        prompt: data.prompt,
        persona: data.persona,
      });
    } catch (err) {
      console.error("Failed to fetch agent:", err);
      setError("Failed to load agent");
    } finally {
      setLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      setCandidatesLoading(true);
      const [assigned, unassigned] = await Promise.all([
        candidateApi.getAll(id),
        candidateApi.getUnassigned(),
      ]);
      setAssignedCandidates(assigned);
      setUnassignedCandidates(unassigned);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const fetchCalls = async () => {
    try {
      setCallsLoading(true);
      const response = await fetch(`/api/calls/agent/${id}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        setCalls(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch calls:", err);
    } finally {
      setCallsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      const updated = await agentApi.update(id!, {
        name: formData.name,
        jobDetails: {
          title: formData.jobTitle,
          description: formData.jobDescription,
        },
        pillars: formData.pillars,
        questions: formData.questions,
        prompt: formData.prompt,
        persona: formData.persona,
      });
      setAgent(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const togglePillar = (pillar: string) => {
    setFormData((prev) => ({
      ...prev,
      pillars: prev.pillars.includes(pillar)
        ? prev.pillars.filter((p) => p !== pillar)
        : [...prev.pillars, pillar],
    }));
  };

  const handleAssignCandidate = async () => {
    if (!selectedCandidateId || !scheduledTime) return;
    try {
      setAssigning(true);
      await candidateApi.assignToAgent(selectedCandidateId, id!, scheduledTime);
      setSelectedCandidateId("");
      setScheduledTime("");
      fetchCandidates();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign candidate");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveCandidate = async (candidateId: string) => {
    try {
      await candidateApi.removeFromAgent(candidateId);
      fetchCandidates();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove candidate");
    }
  };

  const allPillars = ["experience", "behavioral", "role_specific", "cultural_fit"];

  const tabs = [
    { id: "config" as TabType, label: "Config", icon: Settings },
    { id: "candidates" as TabType, label: "Candidates", icon: Users },
    { id: "calls" as TabType, label: "Calls", icon: Phone },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-900/50 text-blue-300 border-blue-800";
      case "in_progress":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-800";
      case "completed":
        return "bg-green-900/50 text-green-300 border-green-800";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-400">Agent not found</p>
        <Button
          variant="outline"
          className="mt-4 border-neutral-700 text-white hover:bg-neutral-800"
          onClick={() => navigate("/dashboard/agents")}
        >
          Back to Agents
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate("/dashboard/agents")}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agents
      </button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
        {activeTab === "config" && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 bg-white text-black hover:bg-neutral-200"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? "bg-white text-black"
                : "text-neutral-400 hover:text-white hover:bg-neutral-800"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "config" && (
        <ConfigTab
          agentId={id!}
          formData={formData}
          setFormData={setFormData}
          togglePillar={togglePillar}
          allPillars={allPillars}
          pillarLabels={pillarLabels}
        />
      )}

      {activeTab === "candidates" && (
        <CandidatesTab
          assignedCandidates={assignedCandidates}
          unassignedCandidates={unassignedCandidates}
          candidatesLoading={candidatesLoading}
          selectedCandidateId={selectedCandidateId}
          setSelectedCandidateId={setSelectedCandidateId}
          scheduledTime={scheduledTime}
          setScheduledTime={setScheduledTime}
          assigning={assigning}
          handleAssignCandidate={handleAssignCandidate}
          handleRemoveCandidate={handleRemoveCandidate}
        />
      )}

      {activeTab === "calls" && (
        <CallsTab
          calls={calls}
          callsLoading={callsLoading}
          formatDate={formatDate}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      )}
    </div>
  );
}


// Config Tab Component
interface ConfigTabProps {
  agentId: string;
  formData: {
    name: string;
    jobTitle: string;
    jobDescription: string;
    pillars: string[];
    questions: string[];
    prompt: string;
    persona: "formal" | "casual";
  };
  setFormData: React.Dispatch<React.SetStateAction<ConfigTabProps["formData"]>>;
  togglePillar: (pillar: string) => void;
  allPillars: string[];
  pillarLabels: Record<string, string>;
}

function ConfigTab({
  agentId,
  formData,
  setFormData,
  togglePillar,
  allPillars,
  pillarLabels,
}: ConfigTabProps) {
  const handleQuestionsChange = (questions: string[]) => {
    setFormData((prev) => ({ ...prev, questions }));
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Agent Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Job Title</label>
            <input
              type="text"
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Job Description</label>
            <textarea
              value={formData.jobDescription}
              onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Assessment Pillars */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Assessment Pillars</h2>
        <div className="flex flex-wrap gap-2">
          {allPillars.map((pillar) => (
            <button
              key={pillar}
              type="button"
              onClick={() => togglePillar(pillar)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
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

      {/* Persona */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agent Persona</h2>
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

      {/* AI Question Generator */}
      <QuestionGenerator
        agentId={agentId}
        jobTitle={formData.jobTitle}
        questions={formData.questions}
        onQuestionsChange={handleQuestionsChange}
      />

      {/* System Prompt */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">System Prompt</h2>
        <p className="text-neutral-400 text-sm mb-3">
          Custom instructions for the AI interviewer (optional)
        </p>
        <textarea
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          rows={6}
          placeholder="Enter custom instructions for the AI interviewer..."
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none font-mono text-sm"
        />
      </div>
    </div>
  );
}


// Candidates Tab Component
interface CandidatesTabProps {
  assignedCandidates: Candidate[];
  unassignedCandidates: Candidate[];
  candidatesLoading: boolean;
  selectedCandidateId: string;
  setSelectedCandidateId: (value: string) => void;
  scheduledTime: string;
  setScheduledTime: (value: string) => void;
  assigning: boolean;
  handleAssignCandidate: () => void;
  handleRemoveCandidate: (candidateId: string) => void;
}

function CandidatesTab({
  assignedCandidates,
  unassignedCandidates,
  candidatesLoading,
  selectedCandidateId,
  setSelectedCandidateId,
  scheduledTime,
  setScheduledTime,
  assigning,
  handleAssignCandidate,
  handleRemoveCandidate,
}: CandidatesTabProps) {

  if (candidatesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Assign Candidate Section */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Assign Candidate
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Select Candidate</label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600"
            >
              <option value="">Choose a candidate...</option>
              {unassignedCandidates.map((candidate) => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.name} ({candidate.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Scheduled Time</label>
            <input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-neutral-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAssignCandidate}
              disabled={!selectedCandidateId || !scheduledTime || assigning}
              className="w-full px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assigning ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
        {unassignedCandidates.length === 0 && (
          <p className="text-neutral-500 text-sm mt-3">No unassigned candidates available</p>
        )}
      </div>

      {/* Assigned Candidates List */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Assigned Candidates</h2>
        {assignedCandidates.length === 0 ? (
          <p className="text-neutral-500 text-sm">No candidates assigned to this agent yet</p>
        ) : (
          <div className="space-y-3">
            {assignedCandidates.map((candidate) => (
              <div
                key={candidate._id}
                className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{candidate.name}</p>
                  <p className="text-neutral-400 text-sm">{candidate.email}</p>
                  {candidate.phone && (
                    <p className="text-neutral-500 text-sm">{candidate.phone}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveCandidate(candidate._id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <UserMinus className="h-4 w-4" />
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// Calls Tab Component
interface CallsTabProps {
  calls: Call[];
  callsLoading: boolean;
  formatDate: (dateString: string) => string;
  getStatusBadgeClass: (status: string) => string;
}

function CallsTab({ calls, callsLoading, formatDate, getStatusBadgeClass }: CallsTabProps) {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  if (callsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const getCandidateName = (call: Call) => {
    if (typeof call.candidateId === "object" && call.candidateId !== null) {
      return call.candidateId.name;
    }
    return "Unknown Candidate";
  };

  const getCandidateEmail = (call: Call) => {
    if (typeof call.candidateId === "object" && call.candidateId !== null) {
      return call.candidateId.email;
    }
    return "";
  };

  return (
    <div className="space-y-6">
      {/* Calls List */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Scheduled Calls
        </h2>
        {calls.length === 0 ? (
          <p className="text-neutral-500 text-sm">No calls scheduled for this agent yet</p>
        ) : (
          <div className="space-y-3">
            {calls.map((call) => (
              <div
                key={call._id}
                onClick={() => setSelectedCall(selectedCall?._id === call._id ? null : call)}
                className="p-4 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-750 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white font-medium">{getCandidateName(call)}</p>
                      <p className="text-neutral-400 text-sm">{getCandidateEmail(call)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-neutral-300 text-sm">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(call.scheduledTime)}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(
                        call.status
                      )}`}
                    >
                      {call.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Expanded Call Details */}
                {selectedCall?._id === call._id && (
                  <div className="mt-4 pt-4 border-t border-neutral-700">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-500">Call ID</p>
                        <p className="text-neutral-300 font-mono text-xs">{call._id}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Created</p>
                        <p className="text-neutral-300">{formatDate(call.createdAt)}</p>
                      </div>
                      {call.recordingUrl && (
                        <div className="col-span-2">
                          <p className="text-neutral-500 mb-1">Recording</p>
                          <a
                            href={call.recordingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            View Recording
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
