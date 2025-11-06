EVALX: An AI-Powered Project Evaluation Tool

A mini-project for GLA University, Mathura, designed to automate and enhance project evaluations using AI.

Core Features:

🤖 Automated Content Analysis (NLP)

💻 Static Code Assessment (SonarQube API)

🎙️ Interactive AI Q&A (LLM-based)

Team T93: Khushi Gangwar, Arju Srivastav, Deepa Chaudhary

1. Problem & Solution

Problem: Traditional project evaluation is manual, slow, subjective, and provides inconsistent feedback.

Solution: EVALX provides an objective, efficient, and scalable AI tool to assist professors. It analyzes submissions, assesses code quality, and generates automated feedback.

2. Technology Stack

Category

Technology

Frontend

React.js, Next.js, TailwindCSS

Backend

FastAPI, Node.js

AI / NLP

OpenAI GPT, Hugging Face, LangChain

Code Analysis

SonarQube, DeepSource APIs

Databases

PostgreSQL, MongoDB

Cloud & DevOps

AWS, GCP, Azure

3. Getting Started

Prerequisites

Node.js (v18+), Python (v3.9+), pip

Database (PostgreSQL or MongoDB)

.env file with API keys (OpenAI, SonarQube, etc.)

Installation

Clone Repo:

git clone [https://github.com/your-username/evalx.git](https://github.com/your-username/evalx.git)
cd evalx


Configure Environment:

Create .env files in client, server/fastapi_app, and server/node_app from the .env.example files and add your API keys.

Run Backend (FastAPI):

cd server/fastapi_app
pip install -r requirements.txt
uvicorn main:app --reload


Run Backend (Node.js):

# New terminal
cd server/node_app
npm install && npm run dev


Run Frontend (Next.js):

# New terminal
cd client
npm install && npm run dev


Access at http://localhost:3000.

4. Future Work

Improve scoring engine accuracy with fine-tuning.

Train Q&A model on more technical domains.

Conduct formal user testing (UI/UX) with professors.

5. License

MIT License
