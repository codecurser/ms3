# Question Service (MS3) - Online Examination Portal

Question Management Microservice (`question-service` / MS3) for the Online Examination Portal ecosystem.

---

## 🌐 Ecosystem Architecture

| Service | Port | Description | Live Deployment |
|---|---|---|---|
| **MS1 (auth-service)** | `8081` | Authentication, User Management & JWT Issuance | https://microservice-based-examination-1.onrender.com |
| **MS2 (exam-service)** | `8082` | Exam Management, Titles, Durations, Share Codes | https://ms2-w51n.onrender.com |
| **MS3 (question-service)** | `8083` | Question & Choice Management, Public & Answer-Key APIs | https://ms3-1.onrender.com |
| **MS4 (evaluation-service)** | `8084` | Submission Grading & Result Computation | In Progress |

---

## 🚀 Tech Stack

- **Java**: 21 (Eclipse Temurin)
- **Framework**: Spring Boot 3.3.2
- **Data Persistence**: Spring Data JPA / Hibernate
- **Database**: PostgreSQL (Neon Cloud / Local PostgreSQL)
- **Database Migrations**: Flyway
- **Security**: Spring Security 6 (Stateless JWT Authentication)
- **JWT**: `io.jsonwebtoken` (JJWT 0.12.5) with shared symmetric secret
- **Documentation**: Springdoc OpenAPI / Swagger UI 2.6.0
- **Boilerplate**: Project Lombok
- **Containerization**: Docker (multi-stage) & Docker Compose

---

## ⚙️ Configuration & Environment Variables

| Variable | Default Value | Description |
|---|---|---|
| `PORT` | `8083` | HTTP Port for the service |
| `DATABASE_URL` | Neon JDBC / URI | PostgreSQL connection URL (e.g. `postgresql://neondb_owner:***@ep-wild-cherry-b5ctexgm-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require`) |
| `DB_USERNAME` | `neondb_owner` | Database user |
| `DB_PASSWORD` | - | Database password |
| `JWT_SECRET` | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` | Shared secret key for JWT verification |

---

## 🔒 Security & Authorization

- **Stateless Bearer JWT Authentication**: The service validates Bearer tokens signed with the ecosystem's shared `JWT_SECRET`.
- **Flexible Subject Handling**: Seamlessly extracts `creatorId` from UUID claims, string/email subjects, or standard JWT claims.
- **Ownership Enforcement**: Creators can only update and delete questions that belong to their own `creatorId`.
- **CORS Support**: Whitelisted origin patterns include `https://*.vercel.app`, `https://*.onrender.com`, and `http://localhost:*`.

---

## 📡 API Endpoints

### 1. Health & Root

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Public | Returns service status and documentation links |
| `GET` | `/health` | Public | Standard health check |
| `GET` | `/swagger-ui.html` | Public | Interactive Swagger API documentation |

### 2. Creator Protected Endpoints (`Authorization: Bearer <TOKEN>`)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/exams/{examId}/questions` | Create a new question with options |
| `POST` | `/api/v1/exams/{examId}/questions/bulk` | Bulk create multiple questions |
| `GET` | `/api/v1/exams/{examId}/questions` | List all questions for an exam (with `isCorrect`) |
| `GET` | `/api/v1/questions/{questionId}` | Get single question details by ID |
| `PUT` | `/api/v1/questions/{questionId}` | Update question and options (ownership verified) |
| `DELETE` | `/api/v1/questions/{questionId}` | Delete question and options (ownership verified) |

### 3. Public Student Endpoint (No Auth)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/public/exams/{examId}/questions` | Public | **CRITICAL: Strictly strips `isCorrect` and explanations to prevent cheating** |

### 4. Internal Evaluation Endpoint (MS4)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/internal/exams/{examId}/answer-key` | Internal/Public | Returns correct answer option IDs for grading service MS4 |

---

## 📋 Sample Payloads & cURL Examples

### Create Question (`POST /api/v1/exams/{examId}/questions`)

```bash
curl -X POST "http://localhost:8083/api/v1/exams/11111111-1111-1111-1111-111111111111/questions" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "questionText": "Which protocol operates at the Transport Layer of the OSI Model?",
    "questionType": "SINGLE_CHOICE",
    "points": 2,
    "orderIndex": 0,
    "explanation": "TCP and UDP operate at the Transport Layer.",
    "options": [
      { "optionText": "HTTP", "isCorrect": false, "orderIndex": 0 },
      { "optionText": "TCP", "isCorrect": true, "orderIndex": 1 },
      { "optionText": "IP", "isCorrect": false, "orderIndex": 2 },
      { "optionText": "Ethernet", "isCorrect": false, "orderIndex": 3 }
    ]
  }'
```

### Public Student Questions (`GET /api/v1/public/exams/{examId}/questions`)

Returns sanitized payload:
```json
[
  {
    "id": "c1f109be-a006-4fc6-b6d6-695aa326e5a6",
    "examId": "11111111-1111-1111-1111-111111111111",
    "questionText": "Which protocol operates at the Transport Layer of the OSI Model?",
    "questionType": "SINGLE_CHOICE",
    "points": 2,
    "orderIndex": 0,
    "options": [
      { "id": "93699c3a-96da-47bb-a982-f54f7a77e812", "optionText": "HTTP", "orderIndex": 0 },
      { "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479", "optionText": "TCP", "orderIndex": 1 },
      { "id": "35851493-2415-46f9-b883-94c65e8d89a7", "optionText": "IP", "orderIndex": 2 },
      { "id": "27b2a60a-0f4b-4b21-8bc6-9eb511ff3b59", "optionText": "Ethernet", "orderIndex": 3 }
    ]
  }
]
```

### Internal Answer Key (`GET /api/v1/internal/exams/{examId}/answer-key`)

```json
{
  "examId": "11111111-1111-1111-1111-111111111111",
  "totalQuestions": 1,
  "totalPoints": 2,
  "questions": [
    {
      "questionId": "c1f109be-a006-4fc6-b6d6-695aa326e5a6",
      "questionType": "SINGLE_CHOICE",
      "points": 2,
      "orderIndex": 0,
      "explanation": "TCP and UDP operate at the Transport Layer.",
      "correctOptionIds": [
        "f47ac10b-58cc-4372-a567-0e02b2c3d479"
      ],
      "correctOptions": [
        {
          "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
          "optionText": "TCP",
          "isCorrect": true,
          "orderIndex": 1
        }
      ]
    }
  ]
}
```

---

## 🐳 Docker Deployment

### Run via Docker Compose
```bash
docker-compose up --build
```
This starts PostgreSQL and the question-service on port `8083`.

### Build and Run Docker Container Manually
```bash
docker build -t question-service .
docker run -p 8083:8083 --env-file .env question-service
```

