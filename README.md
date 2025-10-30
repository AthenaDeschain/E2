# Eureka² | The Collaborative Ecosystem for Science

<div align="center">
  <img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E🔬%3C/text%3E%3C/svg%3E" alt="Eureka² Logo" width="120" />
</div>

<p align="center">
  <strong>Eureka² (E²) is the collaborative ecosystem for science. We empower career and civilian scientists to share knowledge, collaborate on research, and accelerate discovery. Join us to turn inquiry into action.</strong>
</p>

---

## Table of Contents

- [⭐ About The Project](#-about-the-project)
- [🚀 Key Features](#-key-features)
- [🛠️ Built With](#️-built-with)
- [⚙️ Getting Started](#️-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Running Locally](#running-locally)
- [🏗️ Project Structure](#️-project-structure)
- [🏛️ Architectural Decisions](#️-architectural-decisions)
- [🧪 Testing Strategy](#-testing-strategy)
- [🔧 Environment Variables](#-environment-variables)

---

## ⭐ About The Project

Eureka² is a social collaboration platform designed to dismantle the barriers between professional scientific communities and the public. It provides a structured, accessible environment for scientific discourse, project collaboration, and knowledge sharing. The platform is organized around the core principles of the scientific method, with dedicated community spaces for **Inquiry, Discovery, Experiment, Validation, and Implementation.**

At its heart, Eureka² leverages powerful AI tools, powered by the **Google Gemini API**, to assist scientists in their writing and research process, making scientific communication more accessible, rigorous, and efficient for everyone.

---

## 🚀 Key Features

-   **Persistent Backend**: All user data, posts, projects, and interactions are stored in a persistent SQLite database.
-   **Real-time Interaction**: Live updates for new posts, comments, and notifications are pushed to clients via WebSockets.
-   **AI-Powered Writing Tools**: A full suite of tools including the Writing Workbench, Guided Writing, and Jargon Buster, all powered by the Google Gemini API.
-   **Secure Authentication**: Robust user authentication using JWTs and hashed passwords.
-   **Full API**: Complete set of backend endpoints for all platform features.

---

## 🛠️ Built With

-   **Frontend**: [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
-   **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [SQLite](https://www.sqlite.org/index.html)
-   **Real-time**: [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
-   **AI**: [Google Gemini API](https://ai.google.dev/)
-   **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)

---

## ⚙️ Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (version 18 or later recommended)
-   `npm` or another package manager like `yarn`

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/eureka-squared.git
    cd eureka-squared
    ```
2.  **Install NPM packages:**
    This will install both frontend and backend dependencies.
    ```sh
    npm install
    ```
3.  **Set up environment variables:**
    Create a file named `.env` in the root of the project by copying the example file.
    ```sh
    cp .env.example .env
    ```
    Now, open the `.env` file and fill in your secrets, especially your `JWT_SECRET` and `GEMINI_API_KEY`.

### Running Locally

You need to run two processes in separate terminals: the backend server and the frontend dev server.

1.  **Terminal 1: Start the Backend Server**
    This command compiles the TypeScript server and starts it. It will also create and initialize the `database.db` file if it doesn't exist.
    ```sh
    npm run build:backend && npm start
    ```
    The server will run on `http://localhost:8080`.

2.  **Terminal 2: Start the Frontend Dev Server**
    The Vite dev server will host the frontend and automatically proxy any API requests (`/api`) to your backend server.
    ```sh
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

---

## 🏗️ Project Structure

The project is a monorepo-style full-stack application with a clear separation between client and server code.

```
/
├── dist/                   # Compiled output (from TypeScript & Vite)
├── server/                 # Backend source code (Node.js, Express)
│   ├── api/                # API route definitions
│   ├── index.ts            # Server entry point
│   ├── db.ts               # Database initialization and schema
│   └── ...
├── src/                    # Frontend source code (React)
│   ├── components/         # Reusable React components
│   ├── contexts/           # Global state providers (Auth, Socket)
│   ├── services/           # Frontend API service layer
│   └── ...
├── .env.example            # Example environment variables
├── package.json
└── README.md
```

---

## 🏛️ Architectural Decisions

-   **Self-Contained Full-Stack**: The backend and frontend are in the same project. The Express server is responsible for serving both the API and the static frontend files, simplifying deployment.
-   **Persistent Storage**: SQLite was chosen for its simplicity and file-based nature, making the project truly self-contained without requiring a separate database server.
-   **Secure by Default**: All sensitive routes are protected by JWT authentication middleware. Passwords are never stored in plain text, using `bcrypt` for hashing. Environment variables are used for all secrets.
-   **Type-Safe API**: `zod` is used for backend input validation, ensuring data integrity and providing clear error messages before data hits the database.
-   **Real-time Functionality**: WebSockets provide a live, interactive user experience. The `websocket.ts` service on the backend offers a simple `broadcast` function that can be called from any API route to push updates to clients.

---

## 🧪 Testing Strategy

The project uses Jest and React Testing Library for frontend testing.

-   **Unit & Integration Tests**: Components are tested to ensure they render correctly and handle user interactions as expected.
-   **Mocking**: API services (`authService`, `postService`) and contexts are mocked to isolate components and provide a stable test environment. The `test-utils.tsx` file provides a custom `render` function that wraps components in necessary providers.
-   **To run tests:**
    ```sh
    npm test
    ```

---

## 🔧 Environment Variables

The following environment variables are required to run the backend. They should be placed in a `.env` file in the project root for local development.

-   `PORT`: The port for the backend server to listen on. Defaults to `8080`.
-   `JWT_SECRET`: A long, random, secret string used for signing authentication tokens.
-   `GEMINI_API_KEY`: Your API key for the Google Gemini service. AI features will be disabled if this is not provided.