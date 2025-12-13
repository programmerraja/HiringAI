# Implementation Plan

- [x] 1. Update candidate data model and types
  - [x] 1.1 Update server candidate model schema
    - Change `resume` field from String to nested Object type with IResume interface
    - Add schema definition for experience and education sub-documents
    - _Requirements: 3.1, 3.2_
  - [x] 1.2 Update client candidate types
    - Update `Candidate` interface with new `ParsedResume` type
    - Update `CreateCandidateData` and `UpdateCandidateData` interfaces
    - _Requirements: 3.1_
  - [ ]* 1.3 Write property test for resume schema validation
    - **Property 3: Resume schema validation**
    - **Validates: Requirements 3.2**

- [x] 2. Implement server-side resume parsing service
  - [x] 2.1 Create resume parser service
    - Create `server/src/services/resume.service.ts`
    - Implement `parseResumeText` function using existing OpenAI setup with generateObject
    - Define Zod schema for structured resume output
    - _Requirements: 2.1, 2.2, 2.4_
  - [ ]* 2.2 Write property test for parse response structure
    - **Property 1: Parse response contains required fields**
    - **Validates: Requirements 2.2**
  - [ ]* 2.3 Write property test for PII preservation
    - **Property 2: Personal information preservation**
    - **Validates: Requirements 2.4**

- [x] 3. Implement parse-resume API endpoint
  - [x] 3.1 Add parse-resume controller method
    - Add `parseResume` function to `candidate.controller.ts`
    - Handle request validation and error responses
    - _Requirements: 2.1, 2.3_
  - [x] 3.2 Add route for parse-resume endpoint
    - Add `POST /api/candidates/parse-resume` route
    - Apply authentication middleware
    - _Requirements: 2.1_
  - [ ]* 3.3 Write unit tests for parse-resume endpoint
    - Test successful parsing
    - Test validation errors
    - Test OpenAI failure handling
    - _Requirements: 2.1, 2.3_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement client-side PDF extraction
  - [x] 5.1 Install pdfjs-dist package
    - Add pdfjs-dist to client dependencies
    - Configure PDF.js worker
    - _Requirements: 1.2_
  - [x] 5.2 Create PDF service
    - Create `client/src/services/pdf.service.ts`
    - Implement `extractTextFromPDF` function based on reference code
    - Handle worker blob URL cleanup
    - _Requirements: 1.2, 1.5_
  - [x] 5.3 Add parseResume method to candidate API
    - Add `parseResume` method to `candidate.api.ts`
    - _Requirements: 2.1_

- [x] 6. Update Add Candidate form UI
  - [x] 6.1 Create ResumeUploader component
    - Create file input restricted to PDF files
    - Add loading state during extraction and parsing
    - Display error messages for invalid files or failures
    - _Requirements: 1.1, 1.3, 1.4, 1.5_
  - [x] 6.2 Integrate ResumeUploader into AddCandidateForm
    - Replace textarea with ResumeUploader component
    - Auto-populate name, email, phone from parsed resume
    - Store full parsed resume object
    - _Requirements: 1.1, 1.2_

- [x] 7. Update candidate detail display
  - [x] 7.1 Update CandidateDetailModal to show structured resume
    - Display skills as tags/list
    - Display experience entries with company, role, duration, description
    - Display education entries with institution, degree, field, date
    - Handle empty resume state
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 8. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
