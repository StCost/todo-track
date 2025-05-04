# TrackerApp

A modern task tracking application built with React, TypeScript, and Tailwind CSS that allows users to create, organize, and manage tasks in a Kanban-style board.

## Features

- **Kanban Board**: Organize tasks across customizable columns
- **Task Management**: Create, edit, and move tasks between columns
- **Task Details**: Add comments, due dates, and detailed information to tasks
- **User Authentication**: Login/Register with email/password or Google
- **Cloud Storage**: All data is saved to Firebase Firestore
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM
- Firebase (Authentication & Firestore)

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Yarn or npm
- Firebase project (see Firebase Setup below)

### Installation

1. Clone the repository
   ```
   git clone [repository-url]
   cd tracker-app
   ```

2. Install dependencies
   ```
   yarn install
   ```

3. Create a `.env` file in the root directory with your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

4. Start the development server
   ```
   yarn dev
   ```
   
5. Open your browser and navigate to `http://localhost:5173`

## Firebase Setup

This application uses Firebase for authentication and data storage. For detailed setup instructions, please refer to the [Firebase Setup Guide](./docs/FIREBASE_SETUP.md).

## Available Scripts

- `yarn dev` or `yarn start`: Start the development server
- `yarn build`: Build the application for production
- `yarn lint`: Run ESLint to check for code issues
- `yarn preview`: Preview the production build locally
- `yarn deploy`: Deploy the application to GitHub Pages

## Deployment

The application is configured for easy deployment to GitHub Pages:

1. Build the application
   ```
   yarn build
   ```

2. Deploy to GitHub Pages
   ```
   yarn deploy
   ```

## Project Structure

- `src/`: Source code
  - `components/`: React components
    - `auth/`: Authentication components (login, signup, etc.)
  - `contexts/`: React contexts (authentication)
  - `firebase/`: Firebase configuration and services
  - `types.ts`: TypeScript type definitions
  - `App.tsx`: Main application component
  - `main.tsx`: Application entry point
- `public/`: Static assets
- `docs/`: Documentation and build output directory

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
