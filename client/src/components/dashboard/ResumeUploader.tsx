import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractTextFromPDF } from "@/services/pdf.service";
import { candidateApi, ParsedResume } from "@/services/candidate.api";

interface ResumeUploaderProps {
  onParsed: (resume: ParsedResume) => void;
  onError: (error: string) => void;
}

type UploadState = "idle" | "extracting" | "parsing" | "success" | "error";

export function ResumeUploader({ onParsed, onError }: ResumeUploaderProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      const error = "Invalid file type. Please select a PDF file.";
      setErrorMessage(error);
      setState("error");
      onError(error);
      return;
    }

    setFileName(file.name);
    setErrorMessage(null);

    try {
      // Step 1: Extract text from PDF
      setState("extracting");
      const extractedText = await extractTextFromPDF(file);

      if (!extractedText.trim()) {
        throw new Error("No text content found in the PDF.");
      }

      // Step 2: Parse the extracted text via API
      setState("parsing");
      const parsedResume = await candidateApi.parseResume(extractedText);

      setState("success");
      onParsed(parsedResume);
    } catch (err) {
      const error = err instanceof Error ? err.message : "Failed to process resume";
      setErrorMessage(error);
      setState("error");
      onError(error);
    }

    // Reset file input to allow re-selecting the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setState("idle");
    setFileName(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getStatusMessage = () => {
    switch (state) {
      case "extracting":
        return "Extracting text from PDF...";
      case "parsing":
        return "Parsing resume with AI...";
      case "success":
        return "Resume parsed successfully!";
      case "error":
        return errorMessage || "An error occurred";
      default:
        return null;
    }
  };

  const isLoading = state === "extracting" || state === "parsing";

  return (
    <div className="space-y-2">
      <label className="block text-sm text-neutral-300 mb-1">
        <FileText className="h-4 w-4 inline mr-1" />
        Resume (PDF)
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isLoading}
      />

      <div
        onClick={!isLoading ? handleClick : undefined}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isLoading ? "cursor-wait" : "cursor-pointer"}
          ${state === "error" 
            ? "border-red-600 bg-red-900/20" 
            : state === "success"
            ? "border-green-600 bg-green-900/20"
            : "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50"
          }
        `}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
            <span className="text-sm text-neutral-400">{getStatusMessage()}</span>
            {fileName && (
              <span className="text-xs text-neutral-500">{fileName}</span>
            )}
          </div>
        ) : state === "success" ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <span className="text-sm text-green-400">{getStatusMessage()}</span>
            {fileName && (
              <span className="text-xs text-neutral-400">{fileName}</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="mt-2 text-neutral-400 hover:text-white"
            >
              <X className="h-4 w-4 mr-1" />
              Upload different file
            </Button>
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <span className="text-sm text-red-400">{getStatusMessage()}</span>
            {fileName && (
              <span className="text-xs text-neutral-500">{fileName}</span>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="mt-2 text-neutral-400 hover:text-white"
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-neutral-500" />
            <span className="text-sm text-neutral-400">
              Click to upload a PDF resume
            </span>
            <span className="text-xs text-neutral-500">
              The resume will be automatically parsed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
