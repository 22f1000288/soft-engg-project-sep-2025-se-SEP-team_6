# TalentFlow: AI-Integrated HRMS Solution

TalentFlow is a comprehensive recruitment platform designed to modernize the hiring process. By integrating GenAI capabilities with traditional HR Management systems, it automates resume screening, interview preparation, and job description generation to reduce manual overhead for recruiters and candidates alike.

## 🚀 Key Features

### For Recruiters
* **Intelligent JD Creation**: Generate structured job descriptions using AI based on role requirements.
* **Resume Screening & Ranking**: Automated candidate ranking using NLP pipelines to match resumes against job descriptions.
* **Hiring Dashboard**: End-to-end tracking of candidate progress from application to offer.
* **Integrated Scheduling**: Tools to coordinate interview slots and manage communication.

### For Candidates
* **AI Interview Bot**: Practice mock interviews with real-time feedback using Speech-to-Text (STT) and Text-to-Speech (TTS) technology.
* **Application Tracking**: Real-time status updates and a user-friendly interface for managing applications.
* **Resume Enhancement**: AI-driven insights to help candidates improve their profiles.

## 🛠️ Tech Stack

* **Frontend**: React.js, Bootstrap
* **Backend**: FastAPI (Python)
* **Database**: PostgreSQL / SQLite (SQLAlchemy ORM)
* **AI/LLM**: LLaMA-3.3-70B (via Groq API), Whisper (Transcription)
* **DevOps**: Docker, GitHub Actions, Mailhog (Email Testing)

## 💻 Getting Started

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* A bash terminal (Linux/Mac) or PowerShell (Windows).

### Installation & Setup

1.  **Clone the Repository**:
    ```bash
    git clone <your-repo-url>
    cd talentflow
    ```

2.  **Start the Application**:
    Run the provided startup script to pull images and start containers:
    ```bash
    sh startup.sh
    ```

3.  **Access the Services**:
    | Service | URL |
    | :--- | :--- |
    | **Frontend** | `http://localhost:5173` |
    | **Backend API** | `http://localhost:8080` |
    | **Mailhog (Email)** | `http://localhost:8025` |

## 🧪 Testing
The project includes a comprehensive suite of backend tests. To run them:
```bash
pytest
