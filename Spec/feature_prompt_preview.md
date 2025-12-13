# Feature: Prompt Preview & Editor

## 🎯 Objective
Add a "Preview Interview Prompt" feature that shows users the exact XML prompt that will be sent to the AI interviewer. Allow users to review and optionally edit the prompt before starting calls.

## ⏱️ Estimated Time: 15-20 minutes

---

## 📋 Requirements

### Functional Requirements
1. Display a "Preview Prompt" button in the Agent Detail page → Config tab
2. Show a modal with the generated XML prompt formatted and syntax-highlighted
3. Allow users to view the evaluation tool schema
4. Enable inline editing of the prompt (advanced users)
5. Validate edited prompt before saving
6. Show a diff/comparison when prompt is edited

### UI/UX Requirements
- Modal should be large (80vw width) to accommodate XML content
- Syntax highlighting for XML
- Copy to clipboard functionality
- Toggle between "formatted view" and "raw XML"
- Clear visual indication of custom vs. auto-generated prompts

---

## 🏗️ Implementation Plan

### 1. Backend - Add Preview Endpoint (Optional - Can Do Client-Side)

**Location:** `server/src/routes/agent.routes.ts`

Add endpoint:
```
GET /api/agents/:id/preview-prompt
```

**Controller:** `server/src/controllers/agent.controller.ts`

Create function:
```typescript
export const previewPrompt = async (req, res, next) => {
  // 1. Fetch agent by ID
  // 2. Create a mock candidate object (or use query param for candidateId)
  // 3. Call buildXMLPrompt(agent, mockCandidate)
  // 4. Call buildEvaluationTool(agent.pillars)
  // 5. Return both as response
}
```

**Alternative (Faster):** Do this client-side only - import promptBuilder utility to frontend.

---

### 2. Frontend - Create PromptPreviewModal Component

**Location:** `client/src/components/dashboard/PromptPreviewModal.tsx`

**Props:**
```typescript
interface PromptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent;
  onSave?: (editedPrompt: string) => void;
}
```

**State:**
```typescript
const [prompt, setPrompt] = useState<string>('');
const [evaluationTool, setEvaluationTool] = useState<any>(null);
const [isEditing, setIsEditing] = useState(false);
const [editedPrompt, setEditedPrompt] = useState<string>('');
const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
```

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│  [X] Interview Prompt Preview           │
├─────────────────────────────────────────┤
│  Tabs: [XML Prompt] [Evaluation Tool]   │
│  Actions: [Copy] [Edit] [Formatted/Raw] │
├─────────────────────────────────────────┤
│                                         │
│   <XML Content Display>                 │
│   - Syntax highlighted                  │
│   - Line numbers                        │
│   - Editable if in edit mode           │
│                                         │
├─────────────────────────────────────────┤
│  [Cancel] [Save Changes] (if editing)   │
└─────────────────────────────────────────┘
```

---

### 3. Component Implementation Details

#### A. Generate Prompt Function
```typescript
const generatePrompt = () => {
  // Create mock candidate for preview
  const mockCandidate = {
    name: '[Candidate Name]',
    email: '[email@example.com]',
    phone: '[phone]',
    _id: 'preview'
  };
  
//   Option 1: Call backend API
  const response = await agentApi.previewPrompt(agent._id);
 
  
  setPrompt(xmlPrompt);
  setEvaluationTool(evalTool);
};
```

#### B. XML Syntax Highlighting
Use a library like `react-syntax-highlighter`:

```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

<SyntaxHighlighter 
  language="xml" 
  style={vscDarkPlus}
  showLineNumbers
  customStyle={{
    borderRadius: '8px',
    maxHeight: '60vh',
    fontSize: '13px'
  }}
>
  {prompt}
</SyntaxHighlighter>
```

**Alternative (No Library):** Simple pre tag with monospace font:
```tsx
<pre className="bg-neutral-900 p-4 rounded-lg overflow-auto max-h-[60vh] text-sm font-mono">
  <code className="text-green-400">{prompt}</code>
</pre>
```

#### C. Edit Mode Implementation
```typescript
const handleEdit = () => {
  setIsEditing(true);
  setEditedPrompt(prompt);
};

const handleSave = () => {
  // Validate XML (optional)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(editedPrompt, 'text/xml');
    const parserError = doc.querySelector('parsererror');
    
    if (parserError) {
      alert('Invalid XML format');
      return;
    }
    
    // Save to agent.prompt field
    onSave?.(editedPrompt);
    setPrompt(editedPrompt);
    setIsEditing(false);
  } catch (error) {
    alert('Failed to parse XML');
  }
};
```

When editing, show textarea:
```tsx
{isEditing ? (
  <textarea
    value={editedPrompt}
    onChange={(e) => setEditedPrompt(e.target.value)}
    className="w-full h-[60vh] bg-neutral-900 text-green-400 p-4 rounded-lg font-mono text-sm"
    spellCheck={false}
  />
) : (
  <SyntaxHighlighter ...>
)}
```

#### D. Copy to Clipboard
```typescript
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(prompt);
    // Show toast or temporary "Copied!" message
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  } catch (err) {
    console.error('Failed to copy');
  }
};
```

Button:
```tsx
<button
  onClick={handleCopy}
  className="flex items-center gap-2 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg"
>
  <Copy className="h-4 w-4" />
  {showCopied ? 'Copied!' : 'Copy'}
</button>
```

---

### 4. Integration with Agent Detail Page

**Location:** `client/src/components/dashboard/pages/AgentDetailPage.tsx`

In ConfigTab component, add button after "Save Changes":

```tsx
const [showPromptPreview, setShowPromptPreview] = useState(false);

// In the Config Tab render
<div className="flex items-center gap-2">
  <Button onClick={handleSave}>
    Save Changes
  </Button>
  <Button 
    variant="outline"
    onClick={() => setShowPromptPreview(true)}
  >
    <Eye className="h-4 w-4 mr-2" />
    Preview Prompt
  </Button>
</div>

{/* Modal */}
<PromptPreviewModal
  isOpen={showPromptPreview}
  onClose={() => setShowPromptPreview(false)}
  agent={agent}
  onSave={(editedPrompt) => {
    setFormData({...formData, prompt: editedPrompt});
  }}
/>
```

---

### 5. Evaluation Tool Display

In the modal, add a second tab to show evaluation tool schema:

```tsx
const [activeTab, setActiveTab] = useState<'prompt' | 'evaluation'>('prompt');

// Tabs
<div className="flex gap-2 border-b border-neutral-700 mb-4">
  <button
    onClick={() => setActiveTab('prompt')}
    className={activeTab === 'prompt' ? 'active-tab' : 'inactive-tab'}
  >
    XML Prompt
  </button>
  <button
    onClick={() => setActiveTab('evaluation')}
    className={activeTab === 'evaluation' ? 'active-tab' : 'inactive-tab'}
  >
    Evaluation Schema
  </button>
</div>

// Content
{activeTab === 'prompt' ? (
  <XMLPromptView />
) : (
  <SyntaxHighlighter language="json" style={vscDarkPlus}>
    {JSON.stringify(evaluationTool, null, 2)}
  </SyntaxHighlighter>
)}
```

---

### 6. Visual Enhancements

#### Custom Prompt Indicator
If user has edited the prompt, show a badge:

```tsx
{agent.prompt && agent.prompt.length > 0 && (
  <span className="px-2 py-1 bg-purple-900/30 border border-purple-700 text-purple-300 text-xs rounded-full">
    ✨ Custom Prompt
  </span>
)}
```

#### Prompt Info Panel
Show key prompt details at the top:

```tsx
<div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-neutral-800 rounded-lg">
  <div>
    <p className="text-neutral-500 text-xs">Persona</p>
    <p className="text-white">{agent.persona === 'formal' ? '👔 Formal' : '😊 Casual'}</p>
  </div>
  <div>
    <p className="text-neutral-500 text-xs">Questions</p>
    <p className="text-white">{agent.questions.length} questions</p>
  </div>
  <div>
    <p className="text-neutral-500 text-xs">Pillars</p>
    <p className="text-white">{agent.pillars.length} assessed</p>
  </div>
</div>
```

---

## 🎨 UI Design Specifications

### Colors
- Background: `bg-neutral-900`
- Border: `border-neutral-800`
- Code background: `bg-neutral-950`
- Syntax colors: Use `vscDarkPlus` theme or custom:
  - Tags: `text-blue-400`
  - Attributes: `text-green-400`
  - Values: `text-orange-300`
  - Text content: `text-neutral-300`

### Spacing
- Modal width: `max-w-4xl` (or `80vw`)
- Modal height: `max-h-[90vh]`
- Padding: `p-6` for modal body
- Code viewer height: `max-h-[60vh]` with `overflow-auto`

### Icons (lucide-react)
- Preview: `Eye`
- Copy: `Copy`
- Edit: `Edit`
- Save: `Save`
- Close: `X`

---

## ✅ Acceptance Criteria

- [ ] Preview button visible in Config tab
- [ ] Modal opens and displays formatted XML prompt
- [ ] Prompt includes all agent configuration (persona, questions, job details)
- [ ] Evaluation tool schema viewable in separate tab
- [ ] Copy to clipboard works
- [ ] Edit mode allows modifying prompt
- [ ] Edited prompts save to agent.prompt field
- [ ] Visual indicator shows when custom prompt is used
- [ ] Modal is responsive and readable
- [ ] Syntax highlighting makes XML easy to read

---

## 🚀 Quick Start Steps

1. **Install dependencies** (if using syntax highlighter):
   ```bash
   npm install react-syntax-highlighter @types/react-syntax-highlighter
   ```

2. **Create modal component**:
   - Create `PromptPreviewModal.tsx`
   - Set up basic modal structure
   - Add syntax highlighter

3. **Add button to AgentDetailPage**:
   - Import modal
   - Add state for modal visibility
   - Add "Preview Prompt" button

4. **Test**:
   - Create/edit an agent
   - Click preview button
   - Verify XML renders correctly
   - Test copy and edit functions

---

## 💡 Advanced Features (If Time Permits)

1. **Prompt Templates**: Dropdown to select from pre-built prompt templates
2. **AI Prompt Optimizer**: Button to "Enhance with AI" that uses Gemini to improve prompt
3. **Version History**: Show previous versions of edited prompts
4. **Prompt Diff Viewer**: Show changes between auto-generated and custom prompt
5. **Export Prompt**: Download as .xml file
6. **Validation Warnings**: Check for common issues (missing questions, unclear instructions)

---

## 🐛 Potential Issues & Solutions

**Issue:** XML special characters not escaped
**Solution:** Use the existing `escapeXml()` utility from `promptBuilder.ts`

**Issue:** Large prompts cause performance issues
**Solution:** Lazy load syntax highlighter, use virtual scrolling

**Issue:** Edit mode breaks XML structure
**Solution:** Add "Reset to Auto-Generated" button, validate before save

**Issue:** Modal too small on mobile
**Solution:** Make modal full-screen on mobile (`lg:max-w-4xl`)

---

## 📊 Success Metrics

**For Demo:**
- "Look how transparent our system is - you can see exactly what the AI will say"
- "Advanced users can customize prompts for specific scenarios"
- "Every interview is consistent and follows your exact requirements"

**Judge Impact:**
- Shows technical sophistication
- Demonstrates transparency and control
- Differentiates from "black box" AI solutions
- Appeals to enterprise customers who need auditability
