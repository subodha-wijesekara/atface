# Recog - AI-Powered Attendance & Room Management System

**Recog** is a modern, full-stack web application designed to streamline attendance tracking and room management for educational institutions. It leverages facial recognition technology for secure and efficient attendance taking and provides a comprehensive dashboard for administrators to manage rooms, students, and maintenance requests.

## Features

### Core Functionality
- **Face Recognition Attendance:** Automated student attendance marking using `face-api.js`.
- **Real-time Dashboard:** visual insights into attendance rates, room usage, and system status.
- **Role-Based Access Control:** Secure authentication and authorization for Admins, Teachers, and Students using NextAuth.js.

### Management Modules
- **Room Management:**
  - View room availability and schedules.
  - Request room bookings with an approval workflow.
  - Report and track maintenance issues.
- **Student Management:**
  - Enroll and manage student profiles.
  - View individual attendance records.
- **Analytics:** Detailed reports on class attendance and resource utilization.
- **Admin Panel:** Centralized control for managing users, system settings, and approving requests.

## 🛠 Tech Stack

Built with cutting-edge web technologies for performance and scalability:

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Frontend Library:** [React 19](https://react.dev/)
- **Database:** [MongoDB](https://www.mongodb.com/) using [Mongoose](https://mongoosejs.com/) ODM
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **AI/ML:** [face-api.js](https://github.com/justadudewhohacks/face-api.js) for browser-based face recognition

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or Atlas connection string)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd recog
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Environment Setup:**
    Create a `.env.local` file in the root directory and add your environment variables:
    ```env
    MONGODB_URI=mongodb://localhost:27017/recog
    NEXTAUTH_SECRET=your_super_secret_key
    NEXTAUTH_URL=http://localhost:3000
    ```

4.  **Download Face Recognition Models:**
    This project requires pre-trained models for `face-api.js`. Run the setup script to ensure models are in place (if checking physically, they should be in `public/models`).
    ```bash
    node download_models.js
    ```
    *(Note: Ensure you have the model files available in the public directory if the script is not configured to fetch them remotely).*

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## Project Structure

```bash
src/
├── app/                  # Next.js App Router pages and layouts
│   ├── (dashboard)/      # Protected dashboard routes (admin, rooms, etc.)
│   ├── api/              # Backend API routes
│   └── auth/             # Authentication pages (signin/signup)
├── components/           # Reusable UI components
├── lib/                  # Utility libraries and DB connection helpers
├── models/               # Mongoose database models (User, Student, Room, etc.)
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
public/
└── models/               # Face-api.js model files
```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality.
- `node test_mongo.js`: Simple script to test MongoDB connection connectivity.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

*This README was generated to provide a comprehensive overview of the Recog project.*
