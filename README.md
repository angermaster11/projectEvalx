<!--
Note: The font family is controlled by the Markdown viewer (like GitHub).
This file uses formatting (bolding, icons, spacing) to make the content more attractive.
-->

<div align="center">

🚀 EVALX: An AI-Powered Project Evaluation Tool 🚀

A mini-project for GLA University, Mathura, designed to automate and enhance project evaluations using AI.

</div>

✨ Core Features

🤖 Automated Content Analysis: In-depth NLP analysis of project reports and documentation.

💻 Static Code Assessment: Integrates with SonarQube & DeepSource APIs for code quality metrics.

🎙️ Interactive AI Q&A: An LLM-based assistant to answer questions about the project's content.

🎯 Problem & Solution

The Problem

Traditional project evaluation is manual, time-consuming, subjective, and often provides inconsistent feedback to students.

Our Solution

EVALX provides an objective, efficient, and scalable AI-powered tool to assist professors. It intelligently analyzes submissions, assesses code quality, and generates comprehensive, automated feedback.

💻 Technology Stack

Our project is built with a modern, robust, and scalable tech stack.

Frontend

Backend

AI / NLP

Code Analysis

Databases

Cloud & DevOps

🛠️ Getting Started

Prerequisites

Node.js (v18+)

Python (v3.9+) & pip

A running instance of PostgreSQL or MongoDB

.env file with your API keys (OpenAI, SonarQube, etc.)

1. Configure Environment

Create .env files in client, server/fastapi_app, and server/node_app from the .env.example files. Add all your required API keys and database connection strings.

2. Run Backend (FastAPI)

cd server/fastapi_app
pip install -r requirements.txt
uvicorn main:app --reload


3. Run Backend (Node.js)

(In a new terminal)

cd server/node_app
npm install
npm run dev


4. Run Frontend (Next.js)

(In a new terminal)

cd client
npm install
npm run dev


🎉 Your application should now be accessible at http://localhost:3000.

🔮 Future Work

Improve the scoring engine's accuracy with fine-tuned models.

Train the Q&A model on more diverse and technical domains.

Conduct formal UI/UX testing with professors to refine the interface.

👥 Team T93

Khushi Gangwar

Arju Srivastav

Deepa Chaudhary

📄 License

This project is licensed under the MIT License.
