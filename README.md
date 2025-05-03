# TrackerApp

A React-based task tracking application that allows you to create custom columns and tasks, and manage them efficiently.

## Features

- Create multiple columns for different categories of tasks
- Add tasks to any column
- View and edit task details (title, description, due date, priority, status)
- Modern, responsive UI
- Optimized for GitHub Pages deployment

## Prerequisites

- Node.js (v14+)
- Yarn package manager

## Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/TrackerApp.git
   cd TrackerApp
   ```

2. Install dependencies
   ```
   yarn install
   ```

3. Start the development server
   ```
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To build the app for production:

```
yarn build
```

The built files will be in the `dist` directory.

## Deploying to GitHub Pages

1. Update the `base` property in `vite.config.ts` to match your GitHub repository name:
   ```js
   base: '/your-repo-name/'
   ```

2. Run the deploy command:
   ```
   yarn deploy
   ```

## Project Structure

- `src/`: Source code
  - `components/`: React components
  - `types.ts`: TypeScript type definitions
  - `App.tsx`: Main application component
  - `main.tsx`: Entry point
  - `index.css`: Global styles

## License

MIT # todo-track
