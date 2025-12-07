# Free Hand

A simple, elegant drawing app built with React. Create, save, and revisit your sketches anytime.

## Features

- **Freehand Drawing** - Natural brush strokes with pressure sensitivity support
- **Color Palette** - 8 preset colors plus a full color picker
- **Recent Colors** - Quick access to your recently used colors
- **Adjustable Brush Sizes** - 5 brush sizes from fine to bold
- **Eraser Tool** - Switch between pencil and eraser with a toggle
- **Auto-Save** - Drawings are automatically saved to your browser's local storage
- **Multiple Drawings** - Create and manage unlimited drawings
- **Responsive Design** - Works on desktop, tablet, and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/aarlint/freehand.git
cd freehand

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **perfect-freehand** - Smooth brush stroke rendering
- **react-icons** - Icon library

## Usage

1. Click **New Drawing** to start a fresh canvas
2. Use the **color palette** (bottom right) to pick colors and brush sizes
3. Toggle between **pencil** and **eraser** modes
4. Click **Menu** to save and return to your drawings gallery
5. All drawings are saved automatically to your browser's cache

## License

MIT
