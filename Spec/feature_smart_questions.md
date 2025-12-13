# Feature: Smart Question Suggestions

## 🎯 Objective
Enhance the AI question generator with quality indicators, individual regeneration, categorization, and better UX.

## ⏱️ Time: 10-15 minutes

---

## 📋 Current State

**Location:** `client/src/components/dashboard/QuestionGenerator.tsx`

Current features:
- ✅ AI generates 5 questions per pillar
- ✅ Questions editable
- ✅ Add/remove manually

**What's missing:**
- Question quality indicators
- Regenerate individual questions
- Question categories/tags
- Example questions for new agents

---

## 🏗️ Implementation

### 1. Add Question Metadata

Extend the question service to return metadata:

**Backend:** `server/src/services/question.service.ts`

Update response type:

```typescript
export interface QuestionWithMetadata {
  question: string;
  category: 'technical' | 'behavioral' | 'situational' | 'general';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in seconds
}

export interface GenerateQuestionsResult {
  questions: QuestionWithMetadata[];
}
```

Update prompt to include metadata:

```typescript
const fullPrompt = `${prompt}${contextInfo}

Generate 5 relevant interview questions. For each question, also specify:
- category: technical, behavioral, situational, or general
- difficulty: easy, medium, or hard
- estimatedTime: how long to answer (in seconds)

Format each question with its metadata.`;

const schema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    category: z.enum(['technical', 'behavioral', 'situational', 'general']),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    estimatedTime: z.number()
  }))
});
```

---

### 2. Update Frontend Question Display

**Component:** `QuestionGenerator.tsx`

Add visual indicators for each question:

```tsx
interface QuestionItemProps {
  question: string;
  index: number;
  metadata?: {
    category: string;
    difficulty: string;
    estimatedTime: number;
  };
  onEdit: (index: number, newText: string) => void;
  onDelete: (index: number) => void;
  onRegenerate: (index: number, pillar: string) => void;
}

function QuestionItem({ question, index, metadata, onEdit, onDelete, onRegenerate }: QuestionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(question);

  const categoryIcons = {
    technical: '💻',
    behavioral: '🧠',
    situational: '🎯',
    general: '💬'
  };

  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-neutral-800 rounded-lg group">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-sm font-bold">
        {index + 1}
      </div>
      
      <div className="flex-1">
        {isEditing ? (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-neutral-700 text-white p-2 rounded"
            rows={3}
          />
        ) : (
          <p className="text-white">{question}</p>
        )}
        
        {/* Metadata badges */}
        {metadata && (
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full">
              {categoryIcons[metadata.category]} {metadata.category}
            </span>
            <span className={`px-2 py-1 bg-neutral-700 text-xs rounded-full ${difficultyColors[metadata.difficulty]}`}>
              ⚡ {metadata.difficulty}
            </span>
            <span className="px-2 py-1 bg-neutral-700 text-neutral-300 text-xs rounded-full">
              ⏱️ ~{Math.round(metadata.estimatedTime / 60)}min
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isEditing ? (
          <>
            <button
              onClick={() => {
                onEdit(index, editText);
                setIsEditing(false);
              }}
              className="p-2 text-green-400 hover:bg-neutral-700 rounded"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setEditText(question);
                setIsEditing(false);
              }}
              className="p-2 text-red-400 hover:bg-neutral-700 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-400 hover:bg-neutral-700 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onRegenerate(index, 'current_pillar')}
              className="p-2 text-purple-400 hover:bg-neutral-700 rounded"
              title="Regenerate this question"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(index)}
              className="p-2 text-red-400 hover:bg-neutral-700 rounded"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

### 3. Regenerate Single Question

Add API call to regenerate one question:

```typescript
const regenerateQuestion = async (index: number, pillar: string) => {
  setRegeneratingIndex(index);
  try {
    const result = await questionApi.generate({
      pillar,
      jobTitle: formData.jobTitle,
      jobDescription: formData.jobDescription,
      count: 1 // Generate just 1 question
    });
    
    const newQuestions = [...questions];
    newQuestions[index] = result.questions[0];
    setQuestions(newQuestions);
  } catch (error) {
    console.error('Failed to regenerate question');
  } finally {
    setRegeneratingIndex(null);
  }
};
```

Update backend to accept `count` parameter:

```typescript
// In question.service.ts
export const generateQuestions = async (params: GenerateQuestionsParams & { count?: number }) => {
  const count = params.count || 5;
  
  const fullPrompt = `...generate ${count} relevant interview questions...`;
  // Rest of implementation
};
```

---

### 4. Example/Template Questions

Show example questions when agent has no questions:

```tsx
const EXAMPLE_QUESTIONS = {
  experience: [
    "Walk me through your most significant project in the last 2 years.",
    "Describe a technical challenge you overcame and your approach.",
    "What technologies are you most proficient in and why?"
  ],
  behavioral: [
    "Tell me about a time you had to work with a difficult team member.",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle constructive criticism?"
  ],
  role_specific: [
    "How would you approach [specific job task]?",
    "What's your experience with [key technology/skill]?",
    "Describe your typical workflow for [job function]."
  ],
  cultural_fit: [
    "What type of work environment helps you thrive?",
    "How do you prioritize when everything is urgent?",
    "What motivates you in your work?"
  ]
};

// Show when no questions
{questions.length === 0 && (
  <div className="bg-neutral-800/50 border-2 border-dashed border-neutral-700 rounded-lg p-6">
    <p className="text-neutral-400 mb-3">No questions yet. Try these examples:</p>
    <div className="space-y-2">
      {EXAMPLE_QUESTIONS[currentPillar]?.map((q, i) => (
        <button
          key={i}
          onClick={() => addQuestion(q)}
          className="w-full text-left p-3 bg-neutral-800 hover:bg-neutral-700 rounded text-sm text-neutral-300"
        >
          {q}
        </button>
      ))}
    </div>
  </div>
)}
```

---

### 5. Batch Quality Indicators

Add overall quality assessment:

```tsx
function QuestionsQualityBar({ questions }) {
  const avgDifficulty = questions.reduce((sum, q) => {
    const scores = { easy: 1, medium: 2, hard: 3 };
    return sum + (scores[q.metadata?.difficulty] || 1);
  }, 0) / questions.length;

  const totalTime = questions.reduce((sum, q) => 
    sum + (q.metadata?.estimatedTime || 0), 0
  );

  const categoryDistribution = questions.reduce((acc, q) => {
    const cat = q.metadata?.category || 'general';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4 mb-4">
      <h4 className="text-blue-300 text-sm mb-2">📊 Question Set Quality</h4>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-neutral-500">Difficulty</p>
          <p className="text-white">
            {avgDifficulty < 1.5 ? 'Easy' : avgDifficulty < 2.5 ? 'Moderate' : 'Challenging'}
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Est. Duration</p>
          <p className="text-white">{Math.round(totalTime / 60)} min</p>
        </div>
        <div>
          <p className="text-neutral-500">Diversity</p>
          <p className="text-white">{Object.keys(categoryDistribution).length} types</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 Visual Enhancements

### Question Category Filters

Add filter buttons:

```tsx
const [categoryFilter, setCategoryFilter] = useState('all');

const filteredQuestions = categoryFilter === 'all' 
  ? questions 
  : questions.filter(q => q.metadata?.category === categoryFilter);

// Filter buttons
<div className="flex gap-2 mb-4">
  {['all', 'technical', 'behavioral', 'situational', 'general'].map(cat => (
    <button
      key={cat}
      onClick={() => setCategoryFilter(cat)}
      className={`px-3 py-1 rounded-full text-sm ${
        categoryFilter === cat 
          ? 'bg-white text-black' 
          : 'bg-neutral-800 text-neutral-400'
      }`}
    >
      {cat}
    </button>
  ))}
</div>
```

---

## ✅ Checklist

- [ ] Questions show category, difficulty, and time badges
- [ ] Individual "regenerate" button per question
- [ ] Example questions shown when empty
- [ ] Quality summary bar shows overall metrics
- [ ] Edit mode with save/cancel
- [ ] Hover actions (edit, regenerate, delete)
- [ ] Smooth animations for regenerate

---

## 🚀 Quick Implementation

1. Update backend schema to include metadata
2. Add badges to question display
3. Implement regenerate single question
4. Add example questions for empty state
5. Test with different pillars

**Impact:** Shows AI sophistication and gives users more control!
