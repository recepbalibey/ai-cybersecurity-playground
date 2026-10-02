# AI Security

Practice AI cybersecurity through 12 guided labs. Investigate threats with AI, test how AI systems fail, and learn how to protect them. All targets, models, and findings are simulated.

[Open the playground](https://ai-cybersecurity-playground.projects.recepbalibey.com/)

<img src="docs/media/demo.gif" alt="Animated demo of the AI Security labs" width="100%">

## Features

- **12 guided labs:** log analysis, threat hunting, security testing, malware analysis, code review, prompt injection, jailbreaks, adversarial ML, agent security, data privacy, AI governance, and AI mistakes.
- **Learning Hub:** short lessons, two learning paths, and saved progress.
- **Hands-on practice:** choose a scenario, run a simulation, and review evidence, teaching notes, and reports.

## Install and run

You need **Node.js 20+**, **Python 3.9+**, and **Git**. No AI API key is needed.

Clone the project:

```bash
git clone https://github.com/recepbalibey/ai-cybersecurity-playground.git
cd ai-cybersecurity-playground
```

Start the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

On Windows, use `python` instead of `python3` and `.\venv\Scripts\Activate.ps1` to activate the environment.

In a second terminal, from the project folder, start the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000) and choose a lab in the Learning Hub.

[Development guide](docs/development.md) · [Lab guides](docs/labs/)
