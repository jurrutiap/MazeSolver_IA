export enum MazeItem {
  WALL,
  CELL,
  NODE, // Starting/ending node
  SOLUTION_PATH,
  EXPLORATION_PATH,
}

export type MazeCoordinate = [i: number, j: number];
export type Path = MazeCoordinate[];

const sleep = (millis: number) =>
  new Promise((resolve) => setTimeout(resolve, millis));

export class MazeDrawer {
  private rectHeight: number;
  private rectWidth: number;
  private top: number;
  private left: number;
  private canvasContext: CanvasRenderingContext2D | null;
  private canvasSize: DOMRect;

  nodes: MazeCoordinate[] = [];
  private solutionPath: Path | null;
  private explorationPaths: Path[] | null;

  get mazeSize () {
    return this.maze.length;
  }

  constructor(private maze: number[][]) {}

  initialize(
    canvasContext: CanvasRenderingContext2D | null,
    canvasSize: DOMRect
  ) {
    this.canvasContext = canvasContext;
    this.canvasSize = canvasSize;

    this.rectHeight = (canvasSize.height * 0.9) / this.maze.length;
    this.rectWidth = (canvasSize.width * 0.9) / this.maze[0].length;
    this.top = canvasSize.width * 0.05;
    this.left = canvasSize.height * 0.05;
  }

  toggleNode([x, y]: MazeCoordinate): Promise<void> {
    const node: MazeCoordinate = [
      Math.floor((y - this.top) / this.rectHeight),
      Math.floor((x - this.left) / this.rectWidth),
    ];

    return !this.nodes.find(([i, j]) => i === node[0] && j === node[1])
      ? this.addNode(node)
      : this.removeNode(node);
  }

  private async addNode(node: MazeCoordinate) {
    if (
      this.nodes.length < 2 &&
      this.maze[node[0]][node[1]] === MazeItem.CELL
    ) {
      if (!this.nodes.length) {
        this.solutionPath = [];
        this.explorationPaths = [];
      }
      
      this.nodes.push(node);
      await this.draw(0);
    }
  }

  private async removeNode(node: MazeCoordinate) {
    this.nodes = this.nodes.filter(
      ([i, j]) => !(i === node[0] && j === node[1])
    );
    await this.draw(0);
  }

  set paths({
    solutionPath = null,
    explorationPaths = null,
  }: {
    solutionPath: Path | null;
    explorationPaths?: Path[] | null;
  }) {
    this.explorationPaths = explorationPaths;
    this.solutionPath = solutionPath;

    this.draw(0);
  }

  async draw(sleepTime: number = 400 / this.maze.length) {
    if (this.canvasContext === null) return;

    this.drawRect(this.canvasContext, this.background);

    for (let x = 0; x < 2; x++) {
      for (const i in this.maze) {
        for (const j in this.maze) {
          if (this.maze[i][j] !== x) continue;
          const pixel = this.calculateMazePixel(this.maze[i][j], i, j);

          this.drawRect(this.canvasContext, pixel);
        }
        await sleep(sleepTime);
      }
    }

    for (const [i, j] of this.nodes) {
      this.drawRect(
        this.canvasContext,
        this.calculateMazePixel(MazeItem.NODE, i, j)
      );
    }

    for (const path of this.explorationPaths ?? []) {
      for (const [i, j] of path) {
        this.drawRect(
          this.canvasContext,
          this.calculateMazePixel(MazeItem.EXPLORATION_PATH, i, j)
        );
      }
      
      await sleep(100 / (this.maze.length * path.length * this.explorationPaths!.length));
    }

    for (const [i, j] of this.solutionPath ?? []) {
      this.drawRect(
        this.canvasContext,
        this.calculateMazePixel(MazeItem.SOLUTION_PATH, i, j)
      );

      await sleep(400 / (this.solutionPath?.length ?? 1));
    }
  }

  private get background() {
    return {
      style: "white",
      x: 0,
      y: 0,
      width: this.canvasSize.width,
      height: this.canvasSize.height,
    };
  }

  private calculateMazePixel(value: MazeItem, i: number, j: number) {
    const style = {
      [MazeItem.WALL]: "#447F61",
      [MazeItem.CELL]: "#11241A",
      [MazeItem.NODE]: "#3E92CC",
      [MazeItem.SOLUTION_PATH]: "#FFD700",
      [MazeItem.EXPLORATION_PATH]: "#ED2939",
    }[value] as string;

    return {
      style,
      x: this.left + this.rectWidth * j,
      y: this.top + this.rectWidth * i,
      width: this.rectWidth,
      height: this.rectHeight,
    };
  }

  private drawRect(
    context: CanvasRenderingContext2D,
    {
      style,
      x,
      y,
      width,
      height,
    }: {
      style: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }
  ) {
    context.strokeStyle = style;
    context.strokeRect(x, y, width, height);
    context.fillStyle = style;
    context.fillRect(x, y, width, height);
  }
}
