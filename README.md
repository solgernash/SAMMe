# SAMMe
SAMMe (pronounced Sammy) is a Three.js web application where end users upload full-body photos that are made into 3D models using SAM3D Body. Then users can use their own models to explore the environment. This is a projected created for Dr. Yiheng Liang's Software Engineering 4050/6050. The student collaborators are Nash Carroll, Eric Liu, Chris Ambrose, Daniel Shaji, Shiv Pandey, and Asher Oortman.

## Project Plan
- **Project:** Local SAM 3D Avatar System (CSCI 4050/6050, Spring 2026)
- **Goal:** Deliver an end-to-end local demo where a user uploads a photo, the system generates a `.glb` avatar, and the avatar is viewed/animated in the browser.
- **Major Milestones:**
  - Milestone 1: SAM3D environment setup and estimator validation
  - Milestone 2: FastAPI backend + MongoDB integration
  - Milestone 3: React/Three.js frontend skeleton
  - Iteration 1: Upload -> generation -> viewer integration
  - Iteration 2: Animation improvements and error handling refinement
  - Final: Documentation, polish, and presentation
- **Process:** Iterative development with GitHub Issues/Milestones and team coordination on Discord.
- **Constraints:** Local-only deployment, NVIDIA GPU dependency (12GB+ VRAM), no cloud runtime required.

## Requirements Specification
- **Core Functional Requirements:**
  - User authentication (register/login) with protected routes
  - Photo upload (`JPEG/PNG`, max `10MB`) for avatar generation
  - Avatar generation via SAM 3D Body and export to `.glb`
  - Avatar storage/management (list, retrieve, delete user-owned avatars)
  - Browser 3D viewer with idle/walk animation support
  - Admin API access for user/system management
- **Nonfunctional Requirements:**
  - Inference time target: <= 60s per image after warm start
  - API latency target (non-inference): <= 500ms
  - MongoDB query target: <= 1s for expected load
  - Reliable structured error responses on failures
  - Maintainable modular design and reproducible local setup
- **Security and Data Requirements:**
  - Password hashing required (no plaintext passwords)
  - Auth token required for protected endpoints
  - Users can only access/delete their own avatar assets
  - All storage and inference remain local (no cloud storage in initial scope)

## Software Design
- **Architecture:** Full-stack local system with React/Three.js frontend, FastAPI backend, SAM3D estimator integration, and MongoDB persistence.
- **Primary Flow:**
  - User uploads photo from frontend
  - Backend validates file and stores upload
  - Backend acquires inference lock and runs `SAM3DBodyEstimator`
  - Trimesh packages model output to `.glb`
  - Backend stores metadata and serves static `.glb` URL
  - Frontend loads avatar using Three.js `GLTFLoader`
- **Key Components:**
  - **Frontend:** Dashboard, uploader, avatar gallery, Three.js viewer, animation controls
  - **Backend:** Auth endpoints, generation endpoint, avatar APIs, static file serving
  - **Data Layer:** `users` and `avatars` collections in MongoDB
  - **AI Layer:** Warm-loaded SAM 3D Body model on CUDA GPU
- **Design Constraints:**
  - Sequential GPU inference (single request at a time)
  - FastAPI + Python backend mandate
  - MongoDB as the required database
  - Local runtime and storage as baseline design

## Test Plan
- **Testing Strategy:** Manual iterative system testing by subsystem, then full end-to-end regression each milestone.
- **Subsystem Test Coverage:**
  - Authentication (valid registration, invalid login)
  - Upload validation (accepted image types, rejected invalid files)
  - Backend ingestion and estimator invocation correctness
  - SAM3D output validity and Trimesh `.glb` export checks
  - MongoDB metadata persistence correctness
  - Static file serving of generated `.glb`
  - Frontend dashboard rendering and viewer animation behavior
- **End-to-End Test:**
  - Login -> upload -> estimate -> export -> persist -> static serve -> render with animation
  - Pass criterion includes complete flow under target performance thresholds
- **Pass/Fail Criteria:**
  - **Pass:** expected behavior, no unhandled crashes, acceptable response/generation time
  - **Fail:** incorrect output, errors/crashes, or unusable performance
- **Out of Current Test Scope:**
  - Cloud hosting and distributed inference
  - Advanced interactions beyond idle/walk animation
  - Mobile responsiveness testing and load/stress automation



