import { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Pencil, Check, X, Loader2, Clock } from "lucide-react";
import { PILLAR_PROMPTS, PILLAR_TYPES, PillarType, getPillarPrompt } from "@/constants/pillarPrompts";
import api from "@/services/api";

interface QuestionGeneratorProps {
  agentId: string;
  jobTitle: string;
  questions: string[];
  onQuestionsChange: (questions: string[]) => void;
}

interface QuestionWithMetadata {
  text: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  time: string;
  category: string;
}

export function QuestionGenerator({
  agentId,
  jobTitle,
  questions,
  onQuestionsChange,
}: QuestionGeneratorProps) {
  const [selectedPillar, setSelectedPillar] = useState<PillarType>("experience");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");

  // New state for suggestions
  const [suggestions, setSuggestions] = useState<QuestionWithMetadata[]>([]);

  // Update prompt when pillar changes
  useEffect(() => {
    setPrompt(getPillarPrompt(selectedPillar, jobTitle));
  }, [selectedPillar, jobTitle]);

  const handlePillarChange = (pillar: PillarType) => {
    setSelectedPillar(pillar);
  };

  const handleGenerateQuestions = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setSuggestions([]); // Clear previous suggestions

    try {
      const response = await api.post(`/agents/${agentId}/generate-questions`, {
        pillar: selectedPillar,
        prompt: prompt.trim(),
      });

      const data = response.data;

      if (!response.status) {
        throw new Error(data.message || "Failed to generate questions");
      }

      if (data.success && data.data.questions) {
        // Store as suggestions first
        setSuggestions(data.data.questions);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const addSuggestion = (suggestion: QuestionWithMetadata) => {
    onQuestionsChange([...questions, suggestion.text]);
    setSuggestions(suggestions.filter(s => s !== suggestion));
  };

  const addAllSuggestions = () => {
    onQuestionsChange([...questions, ...suggestions.map(s => s.text)]);
    setSuggestions([]);
  };

  const handleAddQuestion = () => {
    if (!newQuestion.trim()) return;
    onQuestionsChange([...questions, newQuestion.trim()]);
    setNewQuestion("");
  };

  const handleDeleteQuestion = (index: number) => {
    onQuestionsChange(questions.filter((_, i) => i !== index));
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setEditingText(questions[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null || !editingText.trim()) return;
    const updatedQuestions = [...questions];
    updatedQuestions[editingIndex] = editingText.trim();
    onQuestionsChange(updatedQuestions);
    setEditingIndex(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Easy': return 'bg-green-900/30 text-green-300 border-green-800';
      case 'Medium': return 'bg-yellow-900/30 text-yellow-300 border-yellow-800';
      case 'Hard': return 'bg-red-900/30 text-red-300 border-red-800';
      default: return 'bg-neutral-800 text-neutral-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Question Generator Section */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          AI Question Generator
        </h2>

        {/* Pillar Selector */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-300 mb-2">Select Interview Pillar</label>
          <div className="flex flex-wrap gap-2">
            {PILLAR_TYPES.map((pillar) => (
              <button
                key={pillar}
                type="button"
                onClick={() => handlePillarChange(pillar)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${selectedPillar === pillar
                  ? "bg-white text-black"
                  : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700"
                  }`}
              >
                {PILLAR_PROMPTS[pillar].label}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Textarea */}
        <div className="mb-4">
          <label className="block text-sm text-neutral-300 mb-2">
            Prompt Template
            <span className="text-neutral-500 ml-2">(editable)</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Enter your prompt for AI question generation..."
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateQuestions}
          disabled={isGenerating || !prompt.trim()}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate with AI
            </>
          )}
        </button>

        {error && (
          <div className="mt-3 p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              AI Suggestions
            </h2>
            <button
              onClick={addAllSuggestions}
              className="text-sm text-purple-400 hover:text-purple-300 font-medium"
            >
              Add All
            </button>
          </div>
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 hover:border-neutral-600 transition-colors">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <p className="text-white text-sm mb-2">{suggestion.text}</p>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getDifficultyColor(suggestion.difficulty)}`}>
                        {suggestion.difficulty}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-800 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {suggestion.time}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-neutral-700 text-neutral-300 border border-neutral-600">
                        {suggestion.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => addSuggestion(suggestion)}
                    className="p-1.5 bg-white text-black rounded hover:bg-neutral-200 transition-colors"
                    title="Add to questions"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions List Section */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Interview Questions</h2>

        {/* Manual Question Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddQuestion()}
            placeholder="Add a question manually..."
            className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
          />
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={!newQuestion.trim()}
            className="px-3 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Questions List */}
        {questions.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            No questions added yet. Use AI generation or add questions manually.
          </p>
        ) : (
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-neutral-800 rounded-lg group"
              >
                <span className="text-neutral-500 text-sm mt-0.5 min-w-[24px]">
                  {index + 1}.
                </span>

                {editingIndex === index ? (
                  // Edit Mode
                  <div className="flex-1 flex items-start gap-2">
                    <textarea
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      rows={4}
                      className="flex-1 px-3 py-2 bg-neutral-700 border border-neutral-600 rounded text-white text-sm focus:outline-none focus:border-neutral-500 min-h-[100px]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 text-green-400 hover:text-green-300"
                      title="Save"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-neutral-400 hover:text-neutral-300"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <p className="flex-1 text-white text-sm">{question}</p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleStartEdit(index)}
                        className="p-1 text-neutral-400 hover:text-blue-400"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(index)}
                        className="p-1 text-neutral-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {questions.length > 0 && (
          <p className="text-neutral-500 text-xs mt-3">
            {questions.length} question{questions.length !== 1 ? "s" : ""} total
          </p>
        )}
      </div>
    </div>
  );
}
