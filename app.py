from flask import Flask, render_template, request, redirect, jsonify
from dijkstra import Graph, dijkstra
import json
import os

app = Flask(__name__)
GRAPH_FILE = 'graph.json'

def load_graph():
    if os.path.exists(GRAPH_FILE):
        with open(GRAPH_FILE) as f:
            data = json.load(f)
            g = Graph()
            g.nodes = set(data["nodes"])
            g.edges = data["edges"]
            return g
    return Graph()

def save_graph(graph):
    data = {
        "nodes": list(graph.nodes),
        "edges": graph.edges
    }
    with open(GRAPH_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/add_node', methods=['POST'])
def add_node():
    graph = load_graph()
    node = request.json['node']
    graph.add_node(node)
    save_graph(graph)
    return jsonify(success=True)

@app.route('/add_edge', methods=['POST'])
def add_edge():
    graph = load_graph()
    src = request.json['source']
    dst = request.json['destination']
    weight = int(request.json['weight'])
    graph.add_edge(src, dst, weight)
    save_graph(graph)
    return jsonify(success=True)

@app.route('/get_graph')
def get_graph():
    graph = load_graph()
    return jsonify({
        "nodes": list(graph.nodes),
        "edges": graph.edges
    })

@app.route('/dijkstra', methods=['POST'])
def run_dijkstra():
    graph = load_graph()
    start = request.json['start']
    end = request.json['end']
    distances, path = dijkstra(graph, start)
    if end not in path:
        return jsonify(success=False, message="No hay camino.")
    full_path = []
    current = end
    while current != start:
        full_path.insert(0, current)
        current = path[current]
    full_path.insert(0, start)
    return jsonify(
        success=True,
        path=full_path,
        distance=distances[end]
    )

@app.route('/eliminar_grafo', methods=['POST'])
def eliminar_grafo():
    graph = Graph()
    save_graph(graph)
    return redirect('/')

@app.route('/favicon.ico')
def favicon():
    return '', 204

if __name__ == '__main__':
    app.run(debug=True)
