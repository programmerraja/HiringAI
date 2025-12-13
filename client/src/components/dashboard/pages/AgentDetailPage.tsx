import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Settings, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agentApi, Agent } from "@/services/agent.api";
import { candidateApi, Candidate } from "@/services/candidate.api";
import { callApi, Call } from "@/services/call.api";
import { interviewApi } from "@/services/interview.api";
import { QuestionGenerator } from "@/components/dashboard/QuestionGenerator";
import { InterviewDetailsModal } from "@/components/dashboard/InterviewDetailsModal";
import { PromptPreviewModal } from "@/components/dashboard/PromptPreviewModal";
import { UserPlus, UserMinus, Calendar, Clock, Play, Eye, RefreshCw, Volume2, TrendingUp, Target, Copy, Download, Check, Pause } from "lucide-react";

type TabType = "config" | "candidates" | "calls";

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
      const data = await callApi.getByAgent(id!);
      setCalls(data);
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
    <div className="max-w-full">
      <button
        onClick={() => navigate("/dashboard/agents")}
        className="flex items-center gap-2 text-neutral-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Agents
      </button>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${agent.status === 'active'
            ? 'bg-green-900/30 text-green-300 border-green-800'
            : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}>
            {agent.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <QuickActions agent={agent} onUpdate={fetchAgent} />
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
      </div>

      <AgentStatistics agentId={id!} />

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
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors flex-1 justify-center ${activeTab === tab.id
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
          companyContext={(typeof agent?.companyId === 'object' && agent.companyId !== null && 'context' in agent.companyId) ? (agent.companyId as any).context : undefined}
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
          onCallUpdated={fetchCalls}
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
  companyContext?: string;
}

function ConfigTab({
  agentId,
  formData,
  setFormData,
  togglePillar,
  companyContext,
}: ConfigTabProps) {
  const [showPreview, setShowPreview] = useState(false);

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
        <PillarSelector
          selectedPillars={formData.pillars}
          onToggle={togglePillar}
        />
      </div>

      {/* Persona */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Agent Persona</h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, persona: "formal" })}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${formData.persona === "formal"
              ? "bg-white text-black"
              : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
              }`}
          >
            Formal & Professional
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, persona: "casual" })}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${formData.persona === "casual"
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">System Prompt</h2>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors border border-neutral-700"
          >
            <Eye className="h-4 w-4" />
            Preview & Edit
          </button>
        </div>
        <p className="text-neutral-400 text-sm mb-3">
          Custom instructions for the AI interviewer. Click Preview to see the full generated XML.
        </p>
        <textarea
          value={formData.prompt}
          onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
          rows={6}
          placeholder="Enter custom instructions for the AI interviewer..."
          className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none font-mono text-sm"
        />
        {formData.prompt.trim().startsWith('<?xml') && (
          <p className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
            ⚠️ Custom XML override active. The standard prompt generation will be bypassed.
          </p>
        )}
      </div>

      <PromptPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        companyContext={companyContext}
        agentData={{
          ...formData,
          jobDetails: {
            title: formData.jobTitle,
            description: formData.jobDescription,
          },
        }}
        onSave={(newPrompt) => setFormData({ ...formData, prompt: newPrompt })}
      />
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
  onCallUpdated: () => void;
}

function CallsTab({ calls, callsLoading, formatDate, getStatusBadgeClass, onCallUpdated }: CallsTabProps) {
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);
  const [initiatingCallId, setInitiatingCallId] = useState<string | null>(null);
  const [initiateError, setInitiateError] = useState<string | null>(null);
  const [detailsModalCall, setDetailsModalCall] = useState<Call | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Polling for in_progress calls (30 second interval)
  useEffect(() => {
    const hasInProgressCalls = calls.some(call => call.status === "in_progress");

    if (!hasInProgressCalls) return;

    const pollInterval = setInterval(() => {
      onCallUpdated();
    }, 30000); // 30 seconds

    return () => clearInterval(pollInterval);
  }, [calls, onCallUpdated]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await onCallUpdated();
    // Small delay to show the refresh animation
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleStartInterview = async (e: React.MouseEvent, callId: string) => {
    e.stopPropagation(); // Prevent card expansion
    setInitiatingCallId(callId);
    setInitiateError(null);

    try {
      await interviewApi.initiateCall(callId);
      onCallUpdated(); // Refresh calls list to show updated status
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setInitiateError(error.response?.data?.message || "Failed to start interview");
    } finally {
      setInitiatingCallId(null);
    }
  };

  const handleRetake = async (e: React.MouseEvent, call: Call) => {
    e.stopPropagation();
    if (!call.candidateId) return;

    // Extract ID safely handling populate
    const candidateId = typeof call.candidateId === 'object' && call.candidateId !== null ? (call.candidateId as any)._id : call.candidateId;
    const agentId = typeof call.agentId === 'object' && call.agentId !== null ? (call.agentId as any)._id : call.agentId;

    if (!candidateId || !agentId) return;

    try {
      await callApi.create({
        candidateId,
        agentId,
        scheduledTime: new Date().toISOString()
      });
      onCallUpdated();
    } catch (err) {
      console.error("Failed to retake call", err);
    }
  };

  const handleViewDetails = (e: React.MouseEvent, call: Call) => {
    e.stopPropagation(); // Prevent card expansion
    setDetailsModalCall(call);
  };

  const canStartInterview = (call: Call): boolean => {
    return call.status === "scheduled" && !call.dinodialCallId;
  };

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
      {/* Error Message */}
      {initiateError && (
        <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
          {initiateError}
        </div>
      )}

      {/* Calls List */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Calls
          </h2>
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh calls"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
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
                    {/* Start Interview Button */}
                    {canStartInterview(call) && (
                      <button
                        onClick={(e) => handleStartInterview(e, call._id)}
                        disabled={initiatingCallId === call._id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {initiatingCallId === call._id ? (
                          <>
                            <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5" />
                            Start Interview
                          </>
                        )}
                      </button>
                    )}
                    {/* View Details Button */}
                    {call.dinodialCallId && (
                      <button
                        onClick={(e) => handleViewDetails(e, call)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Details
                      </button>
                    )}
                    {/* Retake Interview Button */}
                    {(call.status === "completed" || call.status === "failed") && (
                      <button
                        onClick={(e) => handleRetake(e, call)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Retake
                      </button>
                    )}
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
                      {call.dinodialCallId && (
                        <div>
                          <p className="text-neutral-500">Dinodial Call ID</p>
                          <p className="text-neutral-300">{call.dinodialCallId}</p>
                        </div>
                      )}
                      {call.recordingUrl && (
                        <div className="col-span-2">
                          <p className="text-neutral-500 mb-2 flex items-center gap-1">
                            <Volume2 className="h-3.5 w-3.5" />
                            Recording
                          </p>
                          <audio
                            controls
                            className="w-full h-10"
                            src={call.recordingUrl}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Your browser does not support the audio element.
                          </audio>
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

      {/* Interview Details Modal */}
      {detailsModalCall && (
        <InterviewDetailsModal
          call={detailsModalCall}
          isOpen={!!detailsModalCall}
          onClose={() => setDetailsModalCall(null)}
        />
      )}
    </div>
  );
}

// --- New Dashboard Components ---

function AgentStatistics({ agentId }: { agentId: string }) {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    completedInterviews: 0,
    averageScore: 0,
    hireRate: 0
  });

  useEffect(() => {
    fetchStats();
  }, [agentId]);

  const fetchStats = async () => {
    try {
      // Fetch calls for this agent using the existing API
      const calls = await callApi.getByAgent(agentId);
      const completedAll = calls.filter(c => c.status === 'completed');
      const analyzedSubset = completedAll.filter(c => c.analysis);

      let totalScoreSum = 0;
      let hiredCount = 0;

      analyzedSubset.forEach(call => {
        const analysis = call.analysis;

        // Calculate hire rate based on recommendation
        if (analysis.overall_recommendation === 'recommend' || analysis.overall_recommendation === 'strongly_recommend') {
          hiredCount++;
        }

        // Calculate average score for this call
        let callScoreSum = 0;
        let scoreCount = 0;

        Object.keys(analysis).forEach(key => {
          if (key.endsWith('_score') && typeof analysis[key] === 'number') {
            callScoreSum += analysis[key];
            scoreCount++;
          }
        });

        if (scoreCount > 0) {
          totalScoreSum += (callScoreSum / scoreCount);
        }
      });

      const avgScore = analyzedSubset.length > 0 ? (totalScoreSum / analyzedSubset.length) : 0;
      const hRate = analyzedSubset.length > 0 ? Math.round((hiredCount / analyzedSubset.length) * 100) : 0;

      setStats({
        totalCandidates: calls.length,
        completedInterviews: completedAll.length,
        averageScore: avgScore,
        hireRate: hRate
      });
    } catch (err) {
      console.error("Failed to fetch stats", err);
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 animate-fadeIn">
      <StatCard
        icon={<Users className="h-5 w-5" />}
        label="Total Candidates"
        value={stats.totalCandidates}
        color="blue"
      />
      <StatCard
        icon={<Phone className="h-5 w-5" />}
        label="Interviews Done"
        value={stats.completedInterviews}
        color="green"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Avg Score"
        value={`${stats.averageScore.toFixed(1)}/10`}
        color="purple"
      />
      <StatCard
        icon={<Target className="h-5 w-5" />}
        label="Hire Rate"
        value={`${stats.hireRate}%`}
        color="orange"
      />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-900/30 border-blue-800 text-blue-300',
    green: 'bg-green-900/30 border-green-800 text-green-300',
    purple: 'bg-purple-900/30 border-purple-800 text-purple-300',
    orange: 'bg-orange-900/30 border-orange-800 text-orange-300'
  };

  return (
    <div className={`${colors[color]} border rounded-lg p-4`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs opacity-80">{label}</p>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function QuickActions({ agent, onUpdate }: { agent: Agent; onUpdate: () => void }) {
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleStatus = async () => {
    setIsUpdating(true);
    try {
      const newStatus = agent.status === 'active' ? 'paused' : 'active';
      await agentApi.updateStatus(agent._id, newStatus);
      onUpdate();
    } catch (error) {
      console.error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={toggleStatus}
        disabled={isUpdating}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${agent.status === 'active'
          ? 'bg-green-900/30 text-green-300 border border-green-800 hover:bg-green-900/50'
          : 'bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700'
          }`}
      >
        {agent.status === 'active' ? (
          <><Check className="h-4 w-4" /> Active</>
        ) : (
          <><Pause className="h-4 w-4" /> Paused</>
        )}
      </button>

      <button
        className="px-3 py-1.5 bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-lg text-sm hover:bg-neutral-700"
        title="Duplicate this agent"
      >
        <Copy className="h-4 w-4" />
      </button>

      <button
        className="px-3 py-1.5 bg-neutral-800 text-neutral-300 border border-neutral-700 rounded-lg text-sm hover:bg-neutral-700"
        title="Export interview results"
      >
        <Download className="h-4 w-4" />
      </button>
    </div>
  );
}

function PillarSelector({ selectedPillars, onToggle }: {
  selectedPillars: string[];
  onToggle: (pillar: string) => void;
}) {
  const pillars = [
    {
      id: 'experience',
      icon: '💼',
      label: 'Experience',
      description: 'Work history & expertise'
    },
    {
      id: 'behavioral',
      icon: '🧠',
      label: 'Behavioral',
      description: 'Soft skills & teamwork'
    },
    {
      id: 'role_specific',
      icon: '🎯',
      label: 'Role-Specific',
      description: 'Technical & job skills'
    },
    {
      id: 'cultural_fit',
      icon: '🤝',
      label: 'Cultural Fit',
      description: 'Values & work style'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {pillars.map(pillar => {
        const isSelected = selectedPillars.includes(pillar.id);

        return (
          <button
            key={pillar.id}
            type="button"
            onClick={() => onToggle(pillar.id)}
            className={`p-4 rounded-lg border-2 transition-all text-left ${isSelected
              ? 'border-white bg-white text-black'
              : 'border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-600'
              }`}
          >
            <div className="text-3xl mb-2">{pillar.icon}</div>
            <h4 className="font-semibold mb-1">{pillar.label}</h4>
            <p className={`text-xs ${isSelected ? 'text-black/70' : 'text-neutral-500'}`}>
              {pillar.description}
            </p>

            {isSelected && (
              <div className="mt-2 text-right">
                <span className="inline-block px-2 py-0.5 bg-black/10 rounded-full text-xs font-medium">
                  ✓ Selected
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
