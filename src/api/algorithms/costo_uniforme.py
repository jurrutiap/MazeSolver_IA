# UCS Algorithm
from domain.node import Node

class Graph:
    # Constructor
    def __init__(self):
        self.nodes = []
        self.opened = []
        self.closed = []

    def add_node(self, coords):
        self.nodes.append(Node(coords))

    def find_node(self, coord):
        for node in self.nodes:
            if (node.x == coord[0]) and (node.y == coord[1]):
                return node
        return None

    def add_edge(self, coord1, coord2, weight=1):
        node1 = self.find_node(coord1)
        node2 = self.find_node(coord2)
        if (node1 is not None) and (node2 is not None):
            node1.add_neighboor(node2)
            node2.add_neighboor(node1)
        else:
            print(f'No hay nodos con coordenadas {coord1} o {coord2}')

    def distance(self, node1, node2):
        return abs(node1.x - node2.x) + abs(node1.y - node2.y)

    def unwrap_path(self, node):
        path = [(node.x, node.y)]
        node = node.parent
        while True:
            if node is None:
                break
            path.append((node.x, node.y))
            if node.parent is None:
                break
            node = node.parent
        path.reverse()

        return path

    def UCS(self, start_coord, target_coord):

        # Ingreso de nodos
        start = self.find_node(start_coord)
        target = self.find_node(target_coord)

        # Verificacion
        if (start is None) or (target is None):
            print(f'No hay nodos con coordenadas {start_coord} o {target_coord}')
            return

        # Init
        start.distance = self.distance(start, start)
        self.opened.append(start)

        while True:
            if len(self.opened) == 0:
                return { 'solutionPath': [] }

            # Add to closed, remove from opened, organize opened by heuristic
            self.opened.sort()
            selected_node = self.opened.pop(0)
            self.closed.append(selected_node)

            if (selected_node.x == target_coord[0]) and (selected_node.y == target_coord[1]):
                solution_path = self.unwrap_path(target)
                exploration_paths = list(map(self.unwrap_path, self.closed))

                return {
                    'solutionPath': solution_path,
                    'explorationPaths': exploration_paths,
                }
            
            # Examinar paths por minima euristica
            if len(selected_node.neighbors) > 0:
                for node in selected_node.neighbors:
                    new_distance = selected_node.distance + self.distance(selected_node, node)
                    if node not in self.opened and node not in self.closed:
                        node.parent = selected_node
                        node.distance = new_distance
                        self.opened.append(node)
                    elif node in self.opened and node.parent != selected_node:
                        if new_distance < node.distance:
                            node.parent = selected_node
                            node.distance = new_distance

# Test drive
if __name__ == "__main__":
    g = Graph ()

    g.add_node((0, 0))
    g.add_node((0, 1))
    g.add_node((0, 3))
    g.add_node((1, 0))
    g.add_node((1, 1))
    g.add_node((1, 2))
    g.add_node((1 ,3))
    g.add_node((2, 0))
    g.add_node((2, 3))
    g.add_node((3, 0))
    g.add_node((3, 1))
    g.add_node((3, 2))
    g.add_node((3, 3))

    g.add_edge((0, 0), (0, 1))
    g.add_edge((0, 0), (1, 0))
    g.add_edge((0, 1), (1, 1))
    g.add_edge((0, 3), (1, 3))
    g.add_edge((1, 0), (1, 1))
    g.add_edge((1, 0), (2, 0))
    g.add_edge((1, 1), (1, 2))
    g.add_edge((1, 2), (1, 3))
    g.add_edge((1, 3), (2, 3))
    g.add_edge((2, 0), (3, 0))
    g.add_edge((2, 3), (3, 3))
    g.add_edge((3, 0), (3, 1))
    g.add_edge((3, 1), (3, 2))
    g.add_edge((3, 2), (3, 3))

    print(g.UCS((0,0), (3,2)))