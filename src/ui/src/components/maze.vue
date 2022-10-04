<template>
  <div class="maze">
    <div class="maze-menu">
      <Button data-algorithm="dfs" @click="runSolver">SOLVE (DFS)</Button>
      <Button data-algorithm="bfs" @click="runSolver">SOLVE (BFS)</Button>
      <Button data-algorithm="depth_iterative" @click="runSolver"
        >SOLVE (DEPTH, ITERATIVE)</Button
      >
      <Button data-algorithm="uniform_cost" @click="runSolver"
        >SOLVE (UNIFORM COST)</Button
      >
      <Button data-algorithm="greedy" @click="runSolver">SOLVE (GREEDY)</Button>
      <Button data-algorithm="astar" @click="runSolver">SOLVE (A*)</Button>
    </div>

    <canvas @click="onCanvasClick" class="maze-canvas" ref="canvas"> </canvas>
    <h2 class="maze-title">{{ file.name }}</h2>

    <div v-show="grapher" class="tree-graph" ref="treeGraph"></div>
  </div>
</template>

<script lang="ts">
import { MazeDrawer, MazeItem, Path } from "@/api/maze-drawer";
import { useDebounce } from "@/composables/use-debounce";
import { GraphDrawer } from "../api/graph-drawer";
import cytoscape from "cytoscape";

export default {
  data() {
    return {
      maze: [] as number[][],
      mazeDrawer: null as MazeDrawer | null,
      grapher: null as GraphDrawer | null,
    };
  },
  props: {
    file: {
      type: File,
      required: true,
    },
  },
  async setup(props: { file: File }) {
    return {
      file: props.file,
    };
  },
  async mounted() {
    await this.buildMaze();
    await this.renderCanvas();
    this.renderDebounce = useDebounce(this.renderCanvas);

    window.addEventListener("resize", this.renderDebounce);
  },
  unmounted() {
    window.addEventListener("resize", this.renderDebounce);
  },
  methods: {
    async buildMaze() {
      const mazeData = await (this.file as File).text();

      for (const line of mazeData.split("\n")) {
        if (line.trim() === "") {
          continue;
        }

        const row: number[] = [];
        for (const cell of line.split(",")) {
          row.push(
            {
              w: MazeItem.WALL,
              c: MazeItem.CELL,
            }[cell.trim()] ?? 0
          );
        }

        this.maze.push(row);
      }

      this.mazeDrawer = new MazeDrawer(this.maze);
    },
    async renderCanvas() {
      const canvas: HTMLCanvasElement = this.$refs.canvas;
      if (canvas === null) {
        return;
      }
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;
      const context = canvas.getContext("2d");

      this.mazeDrawer.initialize(context, rect);

      await this.mazeDrawer.draw();
    },
    async onCanvasClick(e: MouseEvent) {
      await (this.mazeDrawer as MazeDrawer).toggleNode([e.offsetX, e.offsetY]);
    },
    async runSolver(event: MouseEvent) {
      const mazeDrawer: MazeDrawer = this.mazeDrawer;

      const algorithm = (event.target as HTMLElement).dataset["algorithm"];
      const [start, end] = mazeDrawer.nodes;

      const formData = new FormData();
      formData.append(
        "parameters",
        JSON.stringify({
          algorithm,
          start,
          end,
        })
      );
      formData.append("file", this.file as File);

      const url = new URL(
        "/solver",
        useRuntimeConfig().public.apiUrl
      ).toString();
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      const {
        nodes = [],
        edges = [],
        solutionPath = [],
        explorationPaths = [],
      } = await response.json();
      mazeDrawer.paths = {
        solutionPath,
        explorationPaths,
      };
      mazeDrawer.nodes = [];

      if ((this.mazeDrawer as MazeDrawer).mazeSize <= 50) {
        this.grapher = new GraphDrawer(this.$refs.treeGraph);
  
        (this.grapher as GraphDrawer)
          .initialize(nodes, edges, [start, end])
          .drawPath(explorationPaths, solutionPath);
      }
    },
  },
};
</script>

<style scoped>
.maze {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.maze-canvas {
  width: 50%;
  aspect-ratio: 1;
}

@media (min-width: 1440px) {
  .maze-canvas {
    width: 40%;
  }
}

@media (min-width: 1920px) {
  .maze-canvas {
    width: 35%;
  }
}

.maze-title {
  font-size: 1.8em;
}

.maze-menu {
  display: flex;
  justify-content: center;
  margin-block-end: 1.5em;

  width: 100%;
}

.maze-menu > * + * {
  margin-inline-start: 0.5em;
}

.tree-graph {
  width: 60%;
  aspect-ratio: 16 / 9;
  background: white;
}
</style>
