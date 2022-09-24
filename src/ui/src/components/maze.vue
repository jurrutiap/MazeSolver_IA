<template>
  <div class="maze">
    <canvas @click="onCanvasClick" class="maze-canvas" ref="canvas"> </canvas>
    <h2 class="maze-title">{{ file.name }}</h2>
    <div class="maze-menu">
      <!-- <Button data-algorithm="dummy" @click="runSolver">SOLVE (DUMMY)</Button> -->
      <Button data-algorithm="dfs" @click="runSolver">SOLVE (DFS)</Button>
      <Button data-algorithm="bfs" @click="runSolver">SOLVE (BFS)</Button>
      <Button data-algorithm="depth_iterative" @click="runSolver">SOLVE (DEPTH, ITERATIVE)</Button>
      <Button data-algorithm="uniform_cost" @click="runSolver">SOLVE (UNIFORM COST)</Button>
      <Button data-algorithm="greedy" @click="runSolver">SOLVE (GREEDY)</Button>
      <Button data-algorithm="astar" @click="runSolver">SOLVE (A*)</Button>
    </div>
  </div>
</template>

<script lang="ts">
import { MazeDrawer, MazeItem, Path } from "@/api/maze-drawer";
import { useDebounce } from "@/composables/use-debounce";

export default {
  data() {
    return {
      maze: [] as number[][],
      mazeDrawer: null as MazeDrawer | null,
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

      const algorithm = (event.target as HTMLElement).dataset['algorithm'];

      if (algorithm === 'dummy' && this.maze.length === 5) {
        const solutionPath: Path = [[1,1], [2,1], [2, 2], [2, 3], [3, 3]];
        const explorationPaths: Path[] = [
          [[1,1], [2,1], [3, 1]],
          [[1,1], [2,1], [2, 2], [2, 3], [1, 3]],
        ];

        (this.mazeDrawer as MazeDrawer).paths = {
          solutionPath,
          explorationPaths,
        };
      }
      
    }
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

  width: 100%;
}

.maze-menu > * + * {
  margin-inline-start: 0.5em;
}
</style>