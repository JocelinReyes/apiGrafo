import heapq

class Graph:
    def __init__(self):
        self.nodes = set()
        self.edges = {}  # {node: [(neighbor, weight)]}

    def add_node(self, value):
        self.nodes.add(value)
        if value not in self.edges:
            self.edges[value] = []

    def add_edge(self, from_node, to_node, weight):
        self.edges.setdefault(from_node, []).append((to_node, weight))  # Solo dirección A → B

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph.nodes}
    previous = {}
    distances[start] = 0
    queue = [(0, start)]

    while queue:
        current_distance, current_node = heapq.heappop(queue)

        for neighbor, weight in graph.edges.get(current_node, []):
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current_node
                heapq.heappush(queue, (distance, neighbor))

    return distances, previous
