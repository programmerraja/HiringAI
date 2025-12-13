import { useState, useEffect } from "react";
import { X, RefreshCw, Play, Pause, Volume2 } from "lucide-react";
import { interviewApi, CallDetailsResponse, DinodialDetails } from "@/services/interview.api";
import { Call } from "@/services/call.api";

interface InterviewDetailsModalProps {
  call: Call;
  isOpen: boolean;
  onClose: () => void;
}

const pillarLabels: Record<string, string> = {
  experience: "Experience",
  behavioral: "Behavioral",
  role_specific: "Role-Specific",
  cultural_fit: "Cultural Fit",
};

export function InterviewDetailsModal({ call, isOpen, onClose }: InterviewDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<CallDetailsResponse["data"] | null>(null);

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
                <DinodialDetailsSection dinodialDetails={details.dinodialDetails} />
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
      </div>
    </div>
  );
}

interface DinodialDetailsSectionProps {
  dinodialDetails: DinodialDetails;
}

function DinodialDetailsSection({ dinodialDetails }: DinodialDetailsSectionProps) {
  return (
    <>
      {/* Recording Player */}
      {dinodialDetails.recordingUrl && (
        <AudioPlayerSection recordingUrl={dinodialDetails.recordingUrl} />
      )}

      {/* Analysis/Scorecard */}
      {dinodialDetails.analysis && Object.keys(dinodialDetails.analysis).length > 0 && (
        <ScorecardSection analysis={dinodialDetails.analysis} />
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

interface ScorecardSectionProps {
  analysis: Record<string, unknown>;
}

function ScorecardSection({ analysis }: ScorecardSectionProps) {
  const renderAnalysisValue = (value: unknown): React.ReactNode => {
    if (typeof value === "string" || typeof value === "number") {
      return <span className="text-neutral-300">{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside text-neutral-300 text-sm space-y-1">
          {value.map((item, index) => (
            <li key={index}>{String(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === "object" && value !== null) {
      return (
        <pre className="text-neutral-300 text-xs bg-neutral-900 p-2 rounded overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return <span className="text-neutral-500">N/A</span>;
  };

  const getScoreColor = (score: unknown): string => {
    if (typeof score !== "number") return "text-neutral-300";
    if (score >= 8) return "text-green-400";
    if (score >= 6) return "text-yellow-400";
    if (score >= 4) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="bg-neutral-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-neutral-400 mb-3">Scorecard & Analysis</h3>
      <div className="space-y-4">
        {Object.entries(analysis).map(([key, value]) => {
          const label = pillarLabels[key] || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
          const isScore = key.toLowerCase().includes("score") || (typeof value === "number" && value <= 10);
          
          return (
            <div key={key} className="border-b border-neutral-700 pb-3 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-neutral-400 text-sm font-medium">{label}</p>
                {isScore && typeof value === "number" && (
                  <span className={`text-lg font-bold ${getScoreColor(value)}`}>
                    {value}/10
                  </span>
                )}
              </div>
              {!isScore && renderAnalysisValue(value)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
