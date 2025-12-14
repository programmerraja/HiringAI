import { useState, useEffect } from "react";
import { X, RefreshCw, Play, Pause, Volume2 } from "lucide-react";
import { interviewApi, CallDetailsResponse, DinodialDetails } from "@/services/interview.api";
import { Call } from "@/services/call.api";

interface InterviewDetailsModalProps {
  call: Call;
  isOpen: boolean;
  onClose: () => void;
}



export function InterviewDetailsModal({ call, isOpen, onClose }: InterviewDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<CallDetailsResponse["data"] | null>(null);
  console.log("call", call);
  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await interviewApi.getCallDetails(call._id);
      setDetails(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch interview details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && call.dinodialCallId) {
      fetchDetails();
    }
  }, [isOpen, call._id, call.dinodialCallId]);

  if (!isOpen) return null;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-900/50 text-blue-300 border-blue-800";
      case "in_progress":
        return "bg-yellow-900/50 text-yellow-300 border-yellow-800";
      case "completed":
        return "bg-green-900/50 text-green-300 border-green-800";
      case "failed":
        return "bg-red-900/50 text-red-300 border-red-800";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-neutral-900 rounded-lg border border-neutral-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Interview Details</h2>
          <div className="flex items-center gap-2">
            {call.dinodialCallId && (
              <button
                onClick={fetchDetails}
                disabled={loading}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Error */}
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full"></div>
            </div>
          )}

          {/* Call Info */}
          {!loading && (
            <>
              <CallInfoSection call={call} details={details} formatDate={formatDate} getStatusBadgeClass={getStatusBadgeClass} />

              {/* Dinodial Details */}
              {details?.dinodialDetails && (
                <DinodialDetailsSection
                  dinodialDetails={details.dinodialDetails}
                  analysis={details.dinodialDetails.analysis || details.call.analysis || call.analysis}
                />
              )}

              {/* No Dinodial Data */}
              {!call.dinodialCallId && (
                <div className="text-center py-8 text-neutral-500">
                  <p>Interview has not been initiated yet.</p>
                  <p className="text-sm mt-1">Click "Start Interview" to begin the AI screening call.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface CallInfoSectionProps {
  call: Call;
  details: CallDetailsResponse["data"] | null;
  formatDate: (dateString: string) => string;
  getStatusBadgeClass: (status: string) => string;
}

function CallInfoSection({ call, details, formatDate, getStatusBadgeClass }: CallInfoSectionProps) {
  const candidateName = details?.candidate?.name ||
    (typeof call.candidateId === "object" ? call.candidateId.name : "Unknown");
  const candidateEmail = details?.candidate?.email ||
    (typeof call.candidateId === "object" ? call.candidateId.email : "");
  const candidatePhone = details?.candidate?.phone ||
    (typeof call.candidateId === "object" ? call.candidateId.phone : "");
  const agentName = details?.agent?.name ||
    (typeof call.agentId === "object" ? call.agentId.name : "Unknown");
  const jobTitle = details?.agent?.jobDetails?.title ||
    (typeof call.agentId === "object" ? call.agentId.jobDetails?.title : "");

  const status = details?.dinodialDetails?.status || call.status;

  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-neutral-400 mb-3">Call Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-neutral-500 text-xs">Candidate</p>
          <p className="text-white">{candidateName}</p>
          <p className="text-neutral-400 text-sm">{candidateEmail}</p>
          {candidatePhone && <p className="text-neutral-500 text-sm">{candidatePhone}</p>}
        </div>
        <div>
          <p className="text-neutral-500 text-xs">Agent</p>
          <p className="text-white">{agentName}</p>
          {jobTitle && <p className="text-neutral-400 text-sm">{jobTitle}</p>}
        </div>
        <div>
          <p className="text-neutral-500 text-xs">Scheduled Time</p>
          <p className="text-neutral-300">{formatDate(call.scheduledTime)}</p>
        </div>
        <div>
          <p className="text-neutral-500 text-xs">Status</p>
          <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(status)}`}>
            {status.replace("_", " ")}
          </span>
        </div>
        {call.dinodialCallId && (
          <div>
            <p className="text-neutral-500 text-xs">Dinodial Call ID</p>
            <p className="text-neutral-300">{call.dinodialCallId}</p>
          </div>
        )}
        {details?.dinodialDetails?.duration && (
          <div>
            <p className="text-neutral-500 text-xs">Duration</p>
            <p className="text-neutral-300">{Math.round(details.dinodialDetails.duration / 60)} min</p>
          </div>
        )}

        {/* System Prompt Section */}
        {call.prompt && (
          <div className="col-span-2 mt-2 pt-3 border-t border-neutral-700">
            <SystemPromptSection prompt={call.prompt} />
          </div>
        )}
      </div>
    </div>
  );
}

function SystemPromptSection({ prompt }: { prompt: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors w-full text-left"
      >
        <span>{isOpen ? '▼' : '▶'}</span>
        View System Prompt sent to AI
      </button>

      {isOpen && (
        <div className="mt-2 bg-neutral-900 rounded p-3 text-xs font-mono text-neutral-300 max-h-60 overflow-y-auto whitespace-pre-wrap border border-neutral-700">
          {prompt}
        </div>
      )}
    </div>
  );
}

interface DinodialDetailsSectionProps {
  dinodialDetails: DinodialDetails;
  analysis?: Record<string, unknown>;
}

function DinodialDetailsSection({ dinodialDetails, analysis }: DinodialDetailsSectionProps) {
  const finalAnalysis = analysis || dinodialDetails.analysis;

  return (
    <>
      {/* Recording Player */}
      {dinodialDetails.recordingUrl && (
        <AudioPlayerSection recordingUrl={dinodialDetails.recordingUrl} />
      )}

      {/* Analysis/Scorecard */}
      {finalAnalysis && Object.keys(finalAnalysis).length > 0 && (
        <ScorecardSection analysis={finalAnalysis} />
      )}
    </>
  );
}

interface AudioPlayerSectionProps {
  recordingUrl: string;
}

function AudioPlayerSection({ recordingUrl }: AudioPlayerSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(recordingUrl);
    audio.addEventListener("ended", () => setIsPlaying(false));
    setAudioElement(audio);

    return () => {
      audio.pause();
      audio.removeEventListener("ended", () => setIsPlaying(false));
    };
  }, [recordingUrl]);

  const togglePlay = () => {
    if (!audioElement) return;

    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
        <Volume2 className="h-4 w-4" />
        Recording
      </h3>
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-500 rounded-full transition-colors"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-white" />
          ) : (
            <Play className="h-5 w-5 text-white ml-0.5" />
          )}
        </button>
        <div className="flex-1">
          <audio controls className="w-full h-8" src={recordingUrl}>
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    </div>
  );
}

interface OverallRecommendationCardProps {
  recommendation: string;
  summary?: string;
}

function OverallRecommendationCard({ recommendation, summary }: OverallRecommendationCardProps) {
  const recommendationConfig: Record<string, { color: string; textColor: string; icon: string; label: string; description: string }> = {
    strongly_recommend: {
      color: 'bg-gradient-to-br from-green-600 to-green-700',
      textColor: 'text-white',
      icon: '',
      label: 'STRONG HIRE',
      description: 'Excellent candidate - proceed immediately'
    },
    recommend: {
      color: 'bg-gradient-to-br from-green-700 to-green-800',
      textColor: 'text-white',
      icon: '',
      label: 'HIRE',
      description: 'Good candidate - recommend for next round'
    },
    neutral: {
      color: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
      textColor: 'text-white',
      icon: '',
      label: 'MAYBE',
      description: 'Mixed results - review carefully'
    },
    not_recommend: {
      color: 'bg-gradient-to-br from-orange-600 to-orange-700',
      textColor: 'text-white',
      icon: '',
      label: 'PASS',
      description: 'Does not meet requirements'
    },
    strongly_not_recommend: {
      color: 'bg-gradient-to-br from-red-600 to-red-700',
      textColor: 'text-white',
      icon: '',
      label: 'STRONG PASS',
      description: 'Not a fit - do not proceed'
    }
  };

  const config = recommendationConfig[recommendation] || recommendationConfig.neutral;

  return (
    <div className={`${config.color} ${config.textColor} rounded-xl p-4 text-center shadow-lg animate-fadeIn`}>

      <div className="flex items-center mb-2">
        <div className="text-left">
          <h3 className="text-2xl font-bold leading-none">{config.label}</h3>
          <p className="text-sm opacity-90 leading-tight mt-1">{config.description}</p>
        </div>
      </div>

      {summary && (
        <p className="text-sm italic border-t border-white/20 pt-2 mt-2">
          "{summary}"
        </p>
      )}
    </div>
  );
}

function PillarScoresGrid({ analysis }: { analysis: Record<string, unknown> }) {
  const pillarEmojis: Record<string, string> = {
    experience: '💼',
    behavioral: '🧠',
    role_specific: '🎯',
    cultural_fit: '🤝'
  };

  const pillarLabels: Record<string, string> = {
    experience: 'Experience',
    behavioral: 'Behavioral Skills',
    role_specific: 'Role-Specific Score',
    cultural_fit: 'Cultural Fit'
  };

  // Extract scores from analysis
  const scores = Object.entries(analysis)
    .filter(([key]) => key.includes('_score'))
    .map(([key, value]) => ({
      pillar: key.replace('_score', ''),
      score: value as number,
      notes: analysis[`${key.replace('_score', '')}_notes`] as string || ''
    }));

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    if (score >= 4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    if (score >= 4) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
      <h3 className="text-sm font-medium text-neutral-400 mb-4 flex items-center gap-2">
        📊 ASSESSMENT BREAKDOWN
      </h3>
      <div className="space-y-5">
        {scores.map(({ pillar, score, notes }) => (
          <div key={pillar} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{pillarEmojis[pillar] || '📋'}</span>
                <span className="text-white font-medium">
                  {pillarLabels[pillar] || pillar.replace(/_/g, ' ')}
                </span>
              </div>
              <span className={`text-xl font-bold ${getScoreTextColor(score)}`}>
                {score}/10
              </span>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-neutral-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${getScoreColor(score)} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${score * 10}%` }}
              />
            </div>

            {/* Short notes preview (if available) */}
            {notes && (
              <p className="text-neutral-400 text-sm leading-relaxed">
                {notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function KeyInsightsPanel({ analysis }: { analysis: Record<string, unknown> }) {
  // Extract key points from notes fields
  const extractKeyPoints = (text: string, isPositive: boolean): string[] => {
    if (!text) return [];

    // Simple keyword-based extraction
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);

    const keywords = isPositive
      ? ['strong', 'excellent', 'good', 'proficient', 'experienced', 'demonstrated', 'effective', 'clear']
      : ['limited', 'weak', 'lack', 'concern', 'unfamiliar', 'inexperienced', 'failed', 'could not', 'struggled'];

    return sentences
      .filter(sentence =>
        keywords.some(keyword =>
          sentence.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 3)
      .map(s => s.trim());
  };

  // Combine all notes
  const allNotes = Object.entries(analysis)
    .filter(([key]) => key.includes('_notes'))
    .map(([_, value]) => value as string)
    .join('. ');

  const strengths = extractKeyPoints(allNotes, true);
  const concerns = extractKeyPoints(allNotes, false);

  if (strengths.length === 0 && concerns.length === 0) {
    return null;
  }

  return (
    <div className="bg-neutral-800 rounded-lg p-6 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
      <h3 className="text-sm font-medium text-neutral-400 mb-4 flex items-center gap-2">
        💡 KEY INSIGHTS
      </h3>

      <div className="space-y-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-400 text-lg">✅</span>
              <h4 className="text-green-400 font-medium">Strengths</h4>
            </div>
            <ul className="space-y-2 ml-2 pl-4 border-l border-green-900/50">
              {strengths.map((strength, idx) => (
                <li key={idx} className="text-neutral-300 text-sm leading-relaxed">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Concerns */}
        {concerns.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-orange-400 text-lg">⚠️</span>
              <h4 className="text-orange-400 font-medium">Areas of Concern</h4>
            </div>
            <ul className="space-y-2 ml-2 pl-4 border-l border-orange-900/50">
              {concerns.map((concern, idx) => (
                <li key={idx} className="text-neutral-300 text-sm leading-relaxed">
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function InterviewStats({ analysis, duration }: { analysis: Record<string, unknown>; duration?: number }) {
  const scores = Object.entries(analysis)
    .filter(([key]) => key.includes('_score'))
    .map(([_, value]) => value as number);

  const averageScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const passRate = scores.length > 0 ? ((scores.filter(s => s >= 6).length / scores.length) * 100) : 0;

  if (scores.length === 0) return null;

  return (
    <div className="grid grid-cols-3 gap-4 mb-2 animate-fadeIn">
      <div className="bg-neutral-800 rounded-lg p-4 text-center">
        <p className="text-neutral-500 text-xs mb-1 uppercase tracking-in-wider">Average Score</p>
        <p className="text-2xl font-bold text-white">
          {averageScore.toFixed(1)}
          <span className="text-sm text-neutral-500 font-normal ml-1">/10</span>
        </p>
      </div>
      <div className="bg-neutral-800 rounded-lg p-4 text-center">
        <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Pass Rate</p>
        <p className={`${passRate >= 70 ? 'text-green-400' : 'text-yellow-400'} text-2xl font-bold`}>
          {passRate.toFixed(0)}
          <span className="text-sm text-neutral-500 font-normal ml-1">%</span>
        </p>
      </div>
      <div className="bg-neutral-800 rounded-lg p-4 text-center">
        <p className="text-neutral-500 text-xs mb-1 uppercase tracking-wider">Duration</p>
        <p className="text-2xl font-bold text-white">
          {duration ? Math.round(duration / 60) : '--'}
          <span className="text-sm text-neutral-500 font-normal ml-1">min</span>
        </p>
      </div>
    </div>
  );
}

interface ScorecardSectionProps {
  analysis: Record<string, unknown>;
  duration?: number;
}

function ScorecardSection({ analysis }: ScorecardSectionProps) {
  // Check if we have valid analysis data
  const hasScores = Object.keys(analysis).some(k => k.includes('_score'));

  if (!hasScores) {
    return (
      <div className="bg-neutral-800 rounded-lg p-6 text-center">
        <p className="text-neutral-400">Analysis pending or unavailable.</p>
      </div>
    );
  }

  const recommendation = analysis.overall_recommendation as string;
  const summary = analysis.summary as string;
  const duration = (analysis as any).duration;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <InterviewStats analysis={analysis} duration={duration} />

      {/* Overall Recommendation - Most Prominent */}
      <OverallRecommendationCard
        recommendation={recommendation}
        summary={summary}
      />

      {/* Two-column layout for Scores and Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PillarScoresGrid analysis={analysis} />
        <KeyInsightsPanel analysis={analysis} />
      </div>
    </div>
  );
}
