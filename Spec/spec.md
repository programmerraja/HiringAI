# HiringAI Product Specification

## 1. Product Overview
A real-time conversational voice agent that conducts initial phone screening interviews with candidates, evaluates responses against job requirements, and generates structured assessment reports for human review. The agent replaces manual phone screening while maintaining fairness, consistency, and candidate experience quality.

## 2. Recruiter Workflow (Job Setup)
The process begins with the recruiter defining the role and context.
*   **Inputs**: Recruiter provides the **Company Website** URL and **Job Description/Title**.
*   **Context Extraction**: The system automatically scrapes the website to understand:
    *   Company values and culture.
    *   Products and services.
    *   *System Goal*: Store this as "Company Context" to enable the AI to answer candidate questions later.

## 3. Interview Configuration
The recruiter configures how the specific role should be vetted.
*   **Assessment Pillars** (User selects one or more):
    *   **Experience Verification**: Technical depth and work histo;ry checks.
    *   **Behavioral/Situational**: STAR method questions (e.g., "Tell me about a time...").
    *   **Role-Specific Knowledge**: Tools, frameworks, and domain expertise.
    *   **Cultural Fit**: Alignment with company values and work style.
*   **Question Generation**:
    *   AI proposes a script of questions based on the JD and selected pillars.
    *   Recruiter can Edit, Add, or Remove questions.
*   **Agent Persona**: Recruiter selects the agent's tone (e.g., "Formal & Professional" or "Casual & Friendly").

## 4. Candidate Journey (The Interview)
Focus is on a professional, fair, and two-way interaction.
*   **Initiation**:
    *   *Option A*: Immediate outbound call (if agreed).
*   **The Call**:
    1.  **Introduction**: Agent identifies itself as an AI assistant for [Company Name] and requests consent to continue.
    2.  **Screening**: Agent asks the defined questions but allows for natural conversation (follow-ups if answers are vague).
    3.  **Q&A Phase**: Candidate can ask questions (e.g., "Is this a remote role?", "What is the culture?"). Agent answers using the *Company Context*.
*   **Edge Cases**: Handling for voicemails (leave a message), dropped calls (attempt callback), and unresponsive candidates.

## 5. Post-Interview Deliverables (The Output)
The system generates a decision-support package for the recruiter.
*   **Candidate Scorecard**:
    *   1-10 rating on each Assessment Pillar.
    *   **Overall Recommendation**: "Advance to Next Round", "Consider", or "Reject".
*   **Executive Summary**:
    *   **Green Flags**: Key strengths highlighted (e.g., "Strong experience with React").
    *   **Red Flags**: Potential concerns (e.g., "Salary expectations exceed budget").
*   **Verification Data**:
    *   Full audio recording.
    *   Searchable text transcript.

## 6. Campaign Management
*   **Dashboard View**: Recruiters see a list of all candidates for a specific Job Title.
*   **Ranking**: Candidates are sorted by their AI Assessment Score for quick prioritization.




TODO
- Handle resume parsing
- allow them to customize there brandkit 


What is the company about?
what is ther culuter and vaulues?
Job description?




Agent 

Name
Prompt
company context
job description
title 
Questions 
Select caditiates 



Need to add extract candiate info from resume 