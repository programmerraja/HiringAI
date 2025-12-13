# Requirements Document

## Introduction

This feature enables resume parsing and structured storage at the candidate level. Users can upload PDF resumes in the Add Candidate form, which are parsed client-side using pdfjs-dist to extract text. The extracted text is then sent to a backend endpoint that uses OpenAI (via existing Azure endpoint) to convert the raw text into structured JSON data. The candidate model schema is updated to store this structured resume data instead of plain text.

## Glossary

- **Resume Parser**: A client-side utility that extracts text content from PDF files using pdfjs-dist library
- **Structured Resume Data**: JSON object containing parsed resume information (skills, experience, education, etc.)
- **Candidate**: A job applicant record in the system containing personal info and resume data
- **PDF.js**: Mozilla's PDF parsing library (pdfjs-dist) used for client-side text extraction

## Requirements

### Requirement 1

**User Story:** As a recruiter, I want to upload a PDF resume when adding a candidate, so that I can quickly capture candidate information without manual data entry.

#### Acceptance Criteria

1. WHEN a user clicks the resume upload area in the Add Candidate form THEN the System SHALL open a file picker restricted to PDF files
2. WHEN a user selects a valid PDF file THEN the System SHALL extract text content from the PDF using pdfjs-dist on the client side
3. WHEN PDF text extraction completes successfully THEN the System SHALL display a loading indicator while processing
4. IF a user selects a non-PDF file THEN the System SHALL display an error message and reject the file
5. IF PDF text extraction fails THEN the System SHALL display an error message to the user

### Requirement 2

**User Story:** As a recruiter, I want the extracted resume text to be converted into structured JSON data, so that I can easily view and search candidate qualifications.

#### Acceptance Criteria

1. WHEN the client sends extracted resume text to the backend THEN the System SHALL call the OpenAI API to parse the text into structured JSON
2. WHEN OpenAI parsing completes THEN the System SHALL return a JSON object containing: name, email, phone, skills array, experience array, education array, and raw text
3. IF OpenAI parsing fails THEN the System SHALL return an error response with appropriate status code
4. WHEN parsing resume text THEN the System SHALL preserve all personal information (no PII redaction)

### Requirement 3

**User Story:** As a developer, I want the candidate model to store structured resume data as JSON, so that the data is queryable and well-organized.

#### Acceptance Criteria

1. WHEN updating the candidate schema THEN the System SHALL change the resume field from String type to a nested Object type
2. WHEN storing resume data THEN the System SHALL validate that the resume object conforms to the defined schema structure
3. WHEN retrieving candidate data THEN the System SHALL return the full structured resume object

### Requirement 4

**User Story:** As a recruiter, I want to see the parsed resume data displayed in a readable format, so that I can quickly review candidate qualifications.

#### Acceptance Criteria

1. WHEN viewing a candidate's details THEN the System SHALL display structured resume sections (skills, experience, education)
2. WHEN a candidate has no resume data THEN the System SHALL display an appropriate empty state message
3. WHEN displaying experience entries THEN the System SHALL show company, role, duration, and description for each entry
4. WHEN displaying education entries THEN the System SHALL show institution, degree, field, and graduation date for each entry
5. WHEN displaying skills THEN the System SHALL show skills as a list or tags
