const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const cors = require('cors');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get user's home directory as default starting point
const homeDir = os.homedir();

// Helper function to get file/folder information
async function getNodeInfo(filePath, maxDepth = 2, currentDepth = 0) {
  try {
    const stats = await fs.stat(filePath);
    const name = path.basename(filePath);
    const isDirectory = stats.isDirectory();
    
    const node = {
      id: filePath,
      name: name || path.sep,
      path: filePath,
      type: isDirectory ? 'folder' : 'file',
      size: stats.size,
      modified: stats.mtime,
      children: []
    };

    // Only get children for directories and if we haven't reached max depth
    if (isDirectory && currentDepth < maxDepth) {
      try {
        const items = await fs.readdir(filePath);
        
        // Limit number of items to prevent overwhelming the visualization
        const limitedItems = items.slice(0, 100);
        
        for (const item of limitedItems) {
          // Skip hidden files and system directories
          if (item.startsWith('.')) continue;
          
          const itemPath = path.join(filePath, item);
          try {
            const childNode = await getNodeInfo(itemPath, maxDepth, currentDepth + 1);
            node.children.push(childNode);
          } catch (err) {
            // Skip items we can't access
            console.error(`Cannot access ${itemPath}:`, err.message);
          }
        }
      } catch (err) {
        console.error(`Cannot read directory ${filePath}:`, err.message);
      }
    }

    return node;
  } catch (err) {
    throw new Error(`Cannot access ${filePath}: ${err.message}`);
  }
}

// Convert hierarchical data to nodes and links for force-directed graph
function convertToGraphData(root) {
  const nodes = [];
  const links = [];
  
  function traverse(node, parent = null) {
    nodes.push({
      id: node.id,
      name: node.name,
      type: node.type,
      path: node.path,
      size: node.size,
      group: node.type === 'folder' ? 1 : 2
    });
    
    if (parent) {
      links.push({
        source: parent.id,
        target: node.id
      });
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child, node));
    }
  }
  
  traverse(root);
  return { nodes, links };
}

// API endpoint to get file system data
app.post('/api/filesystem', async (req, res) => {
  try {
    let { path: requestedPath, depth = 2 } = req.body;
    if (!requestedPath) requestedPath = homeDir; // Fallback to home directory
    
    // Validate and sanitize the path
    const resolvedPath = path.resolve(requestedPath);
    
    // Get file system data
    const fileTree = await getNodeInfo(resolvedPath, depth);
    const graphData = convertToGraphData(fileTree);
    
    res.json({
      success: true,
      data: graphData,
      rootPath: resolvedPath
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// API endpoint to expand a specific node
app.post('/api/expand', async (req, res) => {
  try {
    const { path: nodePath } = req.body;
    
    if (!nodePath) {
      return res.status(400).json({
        success: false,
        error: 'Path is required'
      });
    }
    
    const resolvedPath = path.resolve(nodePath);
    const fileTree = await getNodeInfo(resolvedPath, 1);
    const graphData = convertToGraphData(fileTree);
    
    res.json({
      success: true,
      data: graphData,
      expandedPath: resolvedPath
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// API endpoint to navigate to parent directory
app.post('/api/parent', async (req, res) => {
  try {
    const { path: currentPath } = req.body;
    const parentPath = path.dirname(currentPath);
    
    const fileTree = await getNodeInfo(parentPath, 2);
    const graphData = convertToGraphData(fileTree);
    
    res.json({
      success: true,
      data: graphData,
      parentPath: parentPath
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`File System Visualizer running at http://localhost:${PORT}`);
}); 