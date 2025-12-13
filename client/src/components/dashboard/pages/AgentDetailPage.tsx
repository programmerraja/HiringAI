import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agentApi, Agent } from "@/services/agent.api";

const pillarLabels: Record<string, string> = {
  experience: "Experience",
  behavioral: "Behavioral",
  role_specific: "Role-Specific",
  cultural_fit: "Cultural Fit",
};

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    jobDescription: "",
    pillars: [] as string[],
    questions: [] as string[],
    prompt: "",
    persona: "formal" as "formal" | "casual",
  });

  useEffect(() => {
    if (id) fetchAgent();
  }, [id]);

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

  const addQuestion = () => {
    if (!newQuestion.trim()) return;
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion.trim()],
    }));
    setNewQuestion("");
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const allPillars = ["experience", "behavioral", "role_specific", "cultural_fit"];

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
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-white text-black hover:bg-neutral-200"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

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

        {/* Interview Questions */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Interview Questions</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addQuestion()}
              placeholder="Add a question..."
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
            />
            <Button
              type="button"
              onClick={addQuestion}
              className="bg-white text-black hover:bg-neutral-200"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.questions.length === 0 ? (
            <p className="text-neutral-500 text-sm">No questions added yet</p>
          ) : (
            <div className="space-y-2">
              {formData.questions.map((question, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-neutral-800 rounded-lg group"
                >
                  <span className="text-neutral-500 text-sm mt-0.5">{index + 1}.</span>
                  <p className="flex-1 text-white text-sm">{question}</p>
                  <button
                    onClick={() => removeQuestion(index)}
                    className="text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
    </div>
  );
}
