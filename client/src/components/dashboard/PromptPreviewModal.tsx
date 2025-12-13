import { useState, useEffect } from "react";
import { X, Copy, Save, FileCode } from "lucide-react";
import { generatePreviewPrompt } from "@/utils/promptGenerator";

interface PromptPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    agentData: {
        name: string;
        jobDetails: {
            title: string;
            description: string;
        };
        questions: string[];
        persona: "formal" | "casual";
        prompt?: string;
    };
    onSave: (newPrompt: string) => void;
}

export function PromptPreviewModal({
    isOpen,
    onClose,
    agentData,
    onSave,
}: PromptPreviewModalProps) {
    const [xmlContent, setXmlContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const generated = generatePreviewPrompt({
                ...agentData,
                // If the current prompt is NOT XML, treat it as custom instructions for generation
                // If it IS XML, generatePreviewPrompt will return it as-is
                prompt: agentData.prompt
            });
            setXmlContent(generated);
        }
    }, [isOpen, agentData]);

    const handleCopy = () => {
        navigator.clipboard.writeText(xmlContent);
    };

    const handleSave = () => {
        // If user edited the XML, we save the full XML content
        // The server/client logic should detect this is an override
        onSave(xmlContent);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={onClose} />
            <div className="relative bg-neutral-900 rounded-lg border border-neutral-800 w-full max-w-4xl h-[85vh] flex flex-col m-4 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900 rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-blue-400" />
                        <h2 className="text-lg font-semibold text-white">Prompt Preview & Editor</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${isEditing
                                ? "bg-blue-600 text-white"
                                : "bg-neutral-800 text-neutral-400 hover:text-white"
                                }`}
                        >
                            {isEditing ? "Editing Mode" : "View Mode"}
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                            title="Copy to clipboard"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col relative bg-[#0d1117]">
                    {isEditing && (
                        <div className="bg-yellow-900/20 border-b border-yellow-900/50 p-2 text-center text-xs text-yellow-200 shrink-0">
                            ⚠️ Editing the raw XML will override automatic prompt generation. Parameters like Candidate Name will need manual placeholders.
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto custom-scrollbar h-full">
                        {isEditing ? (
                            <textarea
                                value={xmlContent}
                                onChange={(e) => setXmlContent(e.target.value)}
                                className="w-full min-h-full bg-transparent text-neutral-300 font-mono text-sm p-4 focus:outline-none resize-none leading-relaxed"
                                spellCheck={false}
                            />
                        ) : (
                            <pre className="text-neutral-300 font-mono text-sm p-4 whitespace-pre-wrap leading-relaxed">
                                {xmlContent}
                            </pre>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-neutral-800 flex justify-end gap-3 bg-neutral-900 rounded-b-lg shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-neutral-400 hover:text-white transition-colors text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 text-sm font-medium"
                    >
                        <Save className="h-4 w-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
