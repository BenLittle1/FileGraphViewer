# File System Node Graph Visualizer

An interactive web application that visualizes your file system as a force-directed graph using D3.js. Navigate through your directories and files with an intuitive node-based interface.

## Features

### Core Visualization
- **Force-Directed Graph**: Files and folders are displayed as interactive nodes connected by links
- **Visual Distinction**: Folders appear as larger white/grey nodes, files as smaller grey nodes
- **Black Background**: Clean, modern dark interface for better contrast
- **Smooth Animations**: Physics-based node positioning with drag capabilities

### Navigation
- **Double-Click Navigation**: Double-click any folder node to navigate into it
- **Parent Directory**: Navigate up to the parent directory with the Parent button
- **Home Directory**: Quick return to your home directory
- **Path Display**: Always see your current location in the file system

### Interactive Features
- **Drag & Drop**: Reorganize nodes by dragging them around
- **Node Selection**: Click any node to view detailed information
- **Info Panel**: See file/folder details including name, type, path, and size
- **Zoom Controls**: Zoom in/out with buttons or mouse wheel
- **Pan View**: Click and drag the background to pan around
- **Reset View**: Instantly reset zoom and centering

### Search Functionality
- **Quick Search**: Press `Ctrl/Cmd + F` to open search overlay
- **Real-time Results**: Search results update as you type
- **Navigate to Results**: Click any search result to pan to and highlight that node

### Performance & Limits
- **Smart Loading**: Only loads 2 levels deep by default to prevent overwhelming the visualization
- **File Limits**: Shows up to 100 items per directory for performance
- **Hidden Files**: Automatically skips hidden files (starting with .)

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. The visualization will start at your home directory

## Keyboard Shortcuts

- `Ctrl/Cmd + F`: Open search
- `Escape`: Close search or info panel
- Mouse wheel: Zoom in/out
- Click + drag on background: Pan view
- Click + drag on nodes: Rearrange nodes

## Technical Details

### Backend
- **Node.js + Express**: Serves the web app and provides API endpoints
- **File System API**: Safely reads directory structures with error handling
- **Security**: Path validation and access control for file system operations

### Frontend
- **D3.js v7**: Powers the force-directed graph visualization
- **Vanilla JavaScript**: No framework dependencies for maximum performance
- **Responsive Design**: Adapts to different screen sizes

### API Endpoints
- `POST /api/filesystem`: Load file system data at a specific path
- `POST /api/expand`: Expand a specific directory node
- `POST /api/parent`: Navigate to parent directory

## Customization

### Adjust Node Colors
Edit the CSS in `public/style.css`:
```css
.node.folder {
    fill: #e0e0e0;  /* Folder color */
}
.node.file {
    fill: #808080;  /* File color */
}
```

### Change Force Simulation Parameters
Edit `public/app.js` in the `renderGraph()` method:
```javascript
.force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(50))
.force('charge', d3.forceManyBody().strength(-300))
.force('collision', d3.forceCollide().radius(30))
```

## Requirements

- Node.js 14.x or higher
- Modern web browser with JavaScript enabled
- File system read permissions

## Security Notes

- The application only has read access to your file system
- Cannot modify, delete, or create files
- Respects operating system file permissions
- Skips directories it cannot access

## Future Enhancements

- File type icons
- Color coding by file type
- File preview on hover
- Breadcrumb navigation
- Export graph as image
- Filter by file type
- Show/hide hidden files toggle
- Performance mode for large directories

## License

ISC License 