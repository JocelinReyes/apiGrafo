let network;
let nodes = new vis.DataSet([]);
let edges = new vis.DataSet([]);
let highlightedNodes = [];

async function loadGraph() {
    const res = await fetch('/get_graph');
    const data = await res.json();
    nodes.clear();
    edges.clear();

    data.nodes.forEach(n => nodes.add({ id: n, label: n, color: '#c8a2c8' }));
    for (const [src, conns] of Object.entries(data.edges)) {
        conns.forEach(([dst, weight]) => {
            edges.add({ id: `${src}-${dst}`, from: src, to: dst, label: String(weight), arrows: 'to', color: { color: '#7d3c98' } });
        });
    }

    const container = document.getElementById('graph');
    const graphData = { nodes, edges };
    const options = {
        physics: {
            enabled: true
        },
        edges: {
            smooth: {
                type: 'dynamic'
            }
        }
    };
    network = new vis.Network(container, graphData, options);
}

async function addNode() {
    const node = document.getElementById('node-name').value;
    if (!node) return;
    await fetch('/add_node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node })
    });
    document.getElementById('node-name').value = '';
    loadGraph();
}

async function addEdge() {
    const src = document.getElementById('edge-src').value;
    const dst = document.getElementById('edge-dst').value;
    const weight = document.getElementById('edge-weight').value;
    if (!src || !dst || !weight) return;
    await fetch('/add_edge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: src, destination: dst, weight })
    });
    document.getElementById('edge-src').value = '';
    document.getElementById('edge-dst').value = '';
    document.getElementById('edge-weight').value = '';
    loadGraph();
}

async function runDijkstra() {
    const start = document.getElementById('start-node').value;
    const end = document.getElementById('end-node').value;
    const res = await fetch('/dijkstra', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end })
    });
    const data = await res.json();
    if (!data.success) {
        document.getElementById('result').innerText = 'No hay camino entre los nodos.';
        return;
    }

    document.getElementById('result').innerText = `Camino más corto: ${data.path.join(' → ')} (Distancia: ${data.distance})`;

    // Restaurar estilos previos
    edges.get().forEach(edge => {
        edges.update({ id: edge.id, color: { color: '#7d3c98' } });
    });

    nodes.get().forEach(node => {
        nodes.update({ id: node.id, color: '#c8a2c8' });
    });

    // Resaltar aristas y nodos del camino
    for (let i = 0; i < data.path.length - 1; i++) {
        const from = data.path[i];
        const to = data.path[i + 1];
        const edgeId = `${from}-${to}`;
        edges.update({ id: edgeId, color: { color: '#4b0082' } });
    }

    data.path.forEach((nodeId, index) => {
        setTimeout(() => {
            nodes.update({ id: nodeId, color: '#8e44ad' });
        }, index * 300);
    });
}

window.onload = loadGraph;
