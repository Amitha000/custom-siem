# Custom SIEM

A lightweight Security Information and Event Management (SIEM) prototype built from scratch to demonstrate log ingestion, event normalization, detection engineering, alert generation, API development, and security monitoring through a web dashboard.

The project currently monitors Linux authentication telemetry and converts raw system logs into structured security events that can be searched, analyzed, and evaluated against configurable detection rules.

## Features

### Log Collection & Parsing
- Ingests Linux authentication logs from `/var/log/auth.log`
- Parses raw logs into normalized security events
- Extracts timestamps, hosts, usernames, processes, event types, and severity
- Prevents duplicate log ingestion

Currently recognized events include:

- Authentication failures
- Sudo command execution
- Session opened
- Session closed
- Successful SSH authentication

### Detection Engine

Detection rules are stored in the database rather than hardcoded into the frontend.

Current rules include:

| Detection | Event | Threshold | Window | Severity |
|---|---|---:|---:|---|
| Multiple Failed Authentication Attempts | `authentication_failure` | 3 | 15 min | Medium |
| High Sudo Activity | `sudo_command` | 5 | 10 min | High |
| Excessive Session Creation | `session_opened` | 10 | 5 min | Medium |

Rules can be enabled or disabled and their threshold, time window, and severity can be edited from the dashboard.

### Alerting

When activity satisfies an enabled detection rule, the detection engine generates an alert containing information such as:

- Detection rule
- Severity
- Host
- Username
- Number of related events
- Alert status
- Description
- Creation time

Duplicate open alerts for the same rule, host, and user are prevented.

### REST API

FastAPI provides the interface between the SIEM backend and web dashboard.

Current endpoints include:

```text
GET   /events
GET   /alerts
GET   /detections

PATCH /detections/{rule_id}
PATCH /detections/{rule_id}/toggle
```

Interactive API documentation is available through FastAPI Swagger UI at `/docs`.

### Analyst Dashboard

The frontend is built using React, TypeScript, and Vite.

The dashboard contains:

- Security overview
- Event and alert metrics
- Monitored host count
- Recent alerts
- Recent security events
- Searchable and filterable Events page
- Alerts page with severity and status filtering
- Detection Rules page
- Detection enable/disable controls
- Detection rule editing

## Architecture

```text
Linux /var/log/auth.log
          |
          v
     Log Parser
     parser.py
          |
          v
    Log Ingestion
     ingest.py
          |
          v
   Security Events
      SQLite
          |
          v
  Detection Engine
     detect.py
          |
          v
       Alerts
          |
          v
      FastAPI
          |
          v
 React + TypeScript
   SIEM Dashboard
```

## Technology Stack

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Uvicorn

### Frontend

- React
- TypeScript
- Vite
- React Router
- Lucide React

### Development Environment

- Ubuntu Linux
- VirtualBox
- Git
- GitHub

## Project Structure

```text
custom-siem/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── EventsPage.tsx
│   │   │   ├── AlertsPage.tsx
│   │   │   └── DetectionsPage.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
├── database.py
├── models.py
├── parser.py
├── ingest.py
├── detect.py
├── main.py
├── requirements.txt
└── README.md
```

## Running the Project

### Backend

Create and activate a Python virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

The API is then available at:

```text
http://localhost:8080
```

### Log Ingestion

Ingest supported Linux authentication events:

```bash
python ingest.py
```

Run the detection engine:

```bash
python detect.py
```

### Frontend

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Detection Pipeline

The project separates event collection from alert generation.

```text
Raw log
   ↓
Parse
   ↓
Normalize
   ↓
Deduplicate
   ↓
Store event
   ↓
Evaluate enabled rules
   ↓
Threshold reached?
   ├── No  → No alert
   └── Yes → Generate alert
```

This means ordinary activity can remain available as security telemetry without automatically becoming an alert.

## Example Detection

The **Multiple Failed Authentication Attempts** rule monitors normalized `authentication_failure` events.

If at least three matching events occur for the same user and host within 15 minutes, the detection engine creates a Medium severity alert.

The threshold, time window, severity, and enabled state are configurable through the web dashboard.

## Project Scope

This project is an educational lightweight SIEM prototype and is not intended to replace production SIEM platforms.

The current implementation focuses on Linux authentication telemetry from a single system. A production implementation would require additional capabilities such as distributed log collection, authentication and authorization, scalable storage, continuous processing, stronger rule correlation, retention policies, encrypted transport, and additional security controls.

## Future Improvements

Potential extensions include:

- Continuous/background log ingestion
- Real-time detection processing
- Multiple monitored hosts
- Firewall and network telemetry
- Windows Event Logs
- SSH-specific detections
- Detection correlation
- Alert investigation workflows
- Alert status management
- Data visualization and timelines
- User authentication and role-based access control
- PostgreSQL or another scalable datastore

## What I Learned

This project provided hands-on experience with:

- Linux security logging
- Log parsing and normalization
- Security event analysis
- Detection engineering
- Threshold-based detection logic
- SIEM architecture
- SQLAlchemy database modelling
- REST API development with FastAPI
- React and TypeScript
- Full-stack integration
- CORS configuration
- Git and GitHub
