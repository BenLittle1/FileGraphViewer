// File System Node Graph Visualizer
class FileSystemVisualizer {
    constructor() {
        this.svg = d3.select('#graph');
        this.width = window.innerWidth;
        this.height = window.innerHeight - 80; // Account for header
        this.currentPath = null;
        this.graphData = { nodes: [], links: [] };
        this.selectedNode = null;
        this.simulation = null;
        this.zoom = null;
        // Default force parameters
        this.chargeStrength = -300;
        this.linkDistance = 50;
        this.collisionRadius = 30;
        this.init();
    }

    init() {
        // Set up SVG dimensions
        this.svg.attr('width', this.width).attr('height', this.height);
        
        // Create zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
        
        this.svg.call(this.zoom);
        
        // Create main group for zooming/panning
        this.g = this.svg.append('g');
        
        // Define arrow markers for links
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#444')
            .style('stroke', 'none');
        
        // Initialize event listeners
        this.initEventListeners();
        this.initSettingsMenu();
        
        // Load initial file system data
        this.loadFileSystem();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.width = window.innerWidth;
            this.height = window.innerHeight - 80;
            this.svg.attr('width', this.width).attr('height', this.height);
            if (this.simulation) {
                this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
            }
        });
    }

    initEventListeners() {
        // Control buttons
        document.getElementById('parent-btn').addEventListener('click', () => this.navigateToParent());
        document.getElementById('home-btn').addEventListener('click', () => this.navigateHome());
        document.getElementById('reset-view-btn').addEventListener('click', () => this.resetView());
        
        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoom-out').addEventListener('click', () => this.zoomOut());
        
        // Info panel
        document.getElementById('close-info').addEventListener('click', () => this.hideInfoPanel());
        document.getElementById('navigate-to').addEventListener('click', () => this.navigateToSelected());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideInfoPanel();
                this.hideSearch();
            } else if (e.key === 'f' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.showSearch();
            }
        });
        
        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => this.performSearch(e.target.value));
        document.getElementById('search-overlay').addEventListener('click', (e) => {
            if (e.target.id === 'search-overlay') {
                this.hideSearch();
            }
        });
    }

    initSettingsMenu() {
        // Open/close menu
        document.getElementById('settings-btn').addEventListener('click', () => {
            // Always update slider values to current settings when opening
            const chargeSlider = document.getElementById('charge-strength');
            const linkSlider = document.getElementById('link-distance');
            const collisionSlider = document.getElementById('collision-radius');
            const chargeValue = document.getElementById('charge-strength-value');
            const linkValue = document.getElementById('link-distance-value');
            const collisionValue = document.getElementById('collision-radius-value');
            chargeSlider.value = this.chargeStrength;
            linkSlider.value = this.linkDistance;
            collisionSlider.value = this.collisionRadius;
            chargeValue.textContent = this.chargeStrength;
            linkValue.textContent = this.linkDistance;
            collisionValue.textContent = this.collisionRadius;
            document.getElementById('settings-panel').classList.remove('hidden');
        });
        document.getElementById('close-settings').addEventListener('click', () => {
            document.getElementById('settings-panel').classList.add('hidden');
        });
        // Sliders
        const chargeSlider = document.getElementById('charge-strength');
        const linkSlider = document.getElementById('link-distance');
        const collisionSlider = document.getElementById('collision-radius');
        const chargeValue = document.getElementById('charge-strength-value');
        const linkValue = document.getElementById('link-distance-value');
        const collisionValue = document.getElementById('collision-radius-value');
        // Handlers
        chargeSlider.addEventListener('input', (e) => {
            this.chargeStrength = +e.target.value;
            chargeValue.textContent = this.chargeStrength;
            this.updateForces();
        });
        linkSlider.addEventListener('input', (e) => {
            this.linkDistance = +e.target.value;
            linkValue.textContent = this.linkDistance;
            this.updateForces();
        });
        collisionSlider.addEventListener('input', (e) => {
            this.collisionRadius = +e.target.value;
            collisionValue.textContent = this.collisionRadius;
            this.updateForces();
        });
    }

    updateForces() {
        if (!this.simulation) return;
        this.simulation.force('charge').strength(this.chargeStrength);
        this.simulation.force('link').distance(this.linkDistance);
        this.simulation.force('collision').radius(this.collisionRadius);
        this.simulation.alpha(0.7).restart();
    }

    async loadFileSystem(path = null, depth = 2) {
        this.showLoading();
        
        try {
            const response = await fetch('/api/filesystem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path, depth })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.currentPath = result.rootPath;
                this.graphData = result.data;
                this.updatePathDisplay();
                this.renderGraph();
            } else {
                console.error('Failed to load file system:', result.error);
                alert('Failed to load file system: ' + result.error);
            }
        } catch (error) {
            console.error('Error loading file system:', error);
            alert('Error loading file system: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    renderGraph() {
        // Clear existing elements
        this.g.selectAll('*').remove();
        
        // Create force simulation
        this.simulation = d3.forceSimulation(this.graphData.nodes)
            .force('link', d3.forceLink(this.graphData.links).id(d => d.id).distance(this.linkDistance))
            .force('charge', d3.forceManyBody().strength(this.chargeStrength))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(this.collisionRadius));
        
        // Create links
        const link = this.g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(this.graphData.links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('marker-end', 'url(#arrowhead)');
        
        // Create nodes
        const node = this.g.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(this.graphData.nodes)
            .enter().append('g')
            .call(d3.drag()
                .on('start', (event, d) => this.dragStarted(event, d))
                .on('drag', (event, d) => this.dragged(event, d))
                .on('end', (event, d) => this.dragEnded(event, d)));
        
        // Add circles to nodes
        node.append('circle')
            .attr('class', d => `node ${d.type}`)
            .attr('r', d => d.type === 'folder' ? 12 : 8)
            .style('fill', (d, i) => {
                // Root node: black fill, white outline
                if (i === 0) return '#000';
                return d.type === 'folder' ? '#e0e0e0' : '#808080';
            })
            .style('stroke', (d, i) => {
                if (i === 0) return '#fff';
                return d.type === 'folder' ? '#fff' : '#ccc';
            })
            .style('stroke-width', (d, i) => (i === 0 ? 3 : (d.type === 'folder' ? 2 : 1.5)))
            .on('click', (event, d) => this.nodeClicked(event, d))
            .on('dblclick', (event, d) => this.nodeDoubleClicked(event, d));
        
        // Add labels to nodes
        node.append('text')
            .attr('class', 'node-label')
            .attr('dy', 20)
            .text(d => d.name)
            .style('font-size', '10px');
        
        // Update positions on each tick
        this.simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });
        
        // Initial zoom to fit
        setTimeout(() => this.zoomToFit(), 500);
    }

    // Drag functions
    dragStarted(event, d) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    dragEnded(event, d) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    // Node interaction
    nodeClicked(event, d) {
        event.stopPropagation();
        this.selectedNode = d;
        
        // Update selection visual
        this.g.selectAll('.node').classed('selected', false);
        d3.select(event.target).classed('selected', true);
        
        // Show info panel
        this.showInfoPanel(d);
    }

    nodeDoubleClicked(event, d) {
        event.stopPropagation();
        if (d.type === 'folder') {
            this.loadFileSystem(d.path);
        }
    }

    // Info panel
    showInfoPanel(node) {
        const panel = document.getElementById('info-panel');
        panel.classList.remove('hidden');
        
        document.getElementById('info-name').textContent = node.name;
        document.getElementById('info-type').textContent = node.type;
        document.getElementById('info-path').textContent = node.path;
        document.getElementById('info-size').textContent = this.formatFileSize(node.size);
        
        const navigateBtn = document.getElementById('navigate-to');
        if (node.type === 'folder') {
            navigateBtn.classList.remove('hidden');
        } else {
            navigateBtn.classList.add('hidden');
        }
    }

    hideInfoPanel() {
        document.getElementById('info-panel').classList.add('hidden');
        this.g.selectAll('.node').classed('selected', false);
        this.selectedNode = null;
    }

    // Navigation
    async navigateToParent() {
        const response = await fetch('/api/parent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: this.currentPath })
        });
        
        const result = await response.json();
        if (result.success) {
            this.currentPath = result.parentPath;
            this.graphData = result.data;
            this.updatePathDisplay();
            this.renderGraph();
        }
    }

    navigateHome() {
        this.loadFileSystem();
    }

    navigateToSelected() {
        if (this.selectedNode && this.selectedNode.type === 'folder') {
            this.loadFileSystem(this.selectedNode.path);
            this.hideInfoPanel();
        }
    }

    // View controls
    resetView() {
        this.svg.transition().duration(750).call(
            this.zoom.transform,
            d3.zoomIdentity
        );
        this.zoomToFit();
    }

    zoomIn() {
        this.svg.transition().duration(300).call(this.zoom.scaleBy, 1.3);
    }

    zoomOut() {
        this.svg.transition().duration(300).call(this.zoom.scaleBy, 0.7);
    }

    zoomToFit() {
        const bounds = this.g.node().getBBox();
        const fullWidth = this.width;
        const fullHeight = this.height;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;
        
        if (width === 0 || height === 0) return;
        
        const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
        const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY];
        
        this.svg.transition().duration(750).call(
            this.zoom.transform,
            d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale)
        );
    }

    // Search functionality
    showSearch() {
        document.getElementById('search-overlay').classList.remove('hidden');
        document.getElementById('search-input').focus();
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
    }

    hideSearch() {
        document.getElementById('search-overlay').classList.add('hidden');
    }

    performSearch(query) {
        if (!query || query.length < 2) {
            document.getElementById('search-results').innerHTML = '';
            return;
        }
        
        const results = this.graphData.nodes.filter(node => 
            node.name.toLowerCase().includes(query.toLowerCase())
        );
        
        const resultsContainer = document.getElementById('search-results');
        resultsContainer.innerHTML = '';
        
        results.slice(0, 20).forEach(result => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            item.innerHTML = `
                <div class="search-result-name">${result.name}</div>
                <div class="search-result-path">${result.path}</div>
            `;
            item.addEventListener('click', () => {
                this.hideSearch();
                this.highlightNode(result);
            });
            resultsContainer.appendChild(item);
        });
    }

    highlightNode(node) {
        // Find and select the node
        const nodeElement = this.g.selectAll('.node')
            .filter(d => d.id === node.id)
            .classed('selected', true);
        
        // Pan to the node
        const transform = d3.zoomTransform(this.svg.node());
        const x = -node.x * transform.k + this.width / 2;
        const y = -node.y * transform.k + this.height / 2;
        
        this.svg.transition().duration(750).call(
            this.zoom.transform,
            d3.zoomIdentity.translate(x, y).scale(transform.k)
        );
        
        this.showInfoPanel(node);
    }

    // Utility functions
    updatePathDisplay() {
        document.getElementById('current-path').textContent = this.currentPath || '/';
    }

    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileSystemVisualizer();
}); 