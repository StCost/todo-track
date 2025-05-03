# TrackerApp

A modern task tracking application built with React, TypeScript, and Tailwind CSS that allows users to create, organize, and manage tasks in a Kanban-style board.

## Features

- **Kanban Board**: Organize tasks across customizable columns
- **Task Management**: Create, edit, and move tasks between columns
- **Task Details**: Add comments, due dates, and detailed information to tasks
- **Persistence**: All data is saved to localStorage for persistent state
- **Dark/Light Mode**: Toggle between dark and light themes
- **Responsive Design**: Works on desktop and mobile devices

## Technologies

- React 18
- TypeScript
- Tailwind CSS
- Vite
- React Router DOM

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- Yarn or npm

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

3. Start the development server
   ```
   yarn dev
   ```
   
4. Open your browser and navigate to `http://localhost:3000`

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
  - `types.ts`: TypeScript type definitions
  - `App.tsx`: Main application component
  - `main.tsx`: Application entry point
- `public/`: Static assets
- `docs/`: Build output directory

## License

[MIT License](LICENSE)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
