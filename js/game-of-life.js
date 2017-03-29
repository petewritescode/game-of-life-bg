class GameOfLife {
    constructor(options) {
        this.options = Object.assign({}, GameOfLife.defaultOptions, options);
        this.canvas = null;
        this.context = null;
        this.canvasSettings = {};
        this.gridSettings = {};
        this.grid = [];
        this.lastTimestamp = null;
        this.neighbourOffsets = [
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: -1, y: 1 },
            { x: 0, y: 1 },
            { x: 1, y: 1 }
        ];

        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupUniverse();
    }

    setupCanvas() {
        const canvas = document.createElement('canvas');
        this.options.element.appendChild(canvas);
        const context = canvas.getContext('2d');

        this.canvas = canvas;
        this.context = context;
    }

    setupUniverse() {
        this.calculateSettings();
        this.resizeCanvas();
        this.clearCanvas();
        this.randomiseGrid();
        this.tick();
    }

    calculateSettings() {
        const canvasWidth = this.options.element.clientWidth;
        const canvasHeight = this.options.element.clientHeight;
        const gridCols = Math.floor(canvasWidth / this.options.cellSize);
        const gridRows = Math.floor(canvasHeight / this.options.cellSize);
        const gridOffsetX = Math.floor((canvasWidth - (gridCols * this.options.cellSize)) / 2);
        const gridOffsetY = Math.floor((canvasHeight - (gridRows * this.options.cellSize)) / 2);

        this.canvasSettings = {
            width: canvasWidth,
            height: canvasHeight
        };

        this.gridSettings = {
            cols: gridCols,
            rows: gridRows,
            offsetX: gridOffsetX,
            offsetY: gridOffsetY
        };
    }

    resizeCanvas() {
        this.canvas.width = this.canvasSettings.width;
        this.canvas.height = this.canvasSettings.height;
    }

    clearCanvas() {
        this.context.fillStyle = this.options.deadColor;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    randomiseGrid() {
        let grid = [];

        for (let row = 0; row < this.gridSettings.rows; row++) {
            let rowCells = [];

            for (let col = 0; col < this.gridSettings.cols; col++) {
                const cell = Math.round(Math.random());
                rowCells.push(cell);
            }

            grid.push(rowCells);
        }

        this.grid = grid;
    }

    iterateGrid() {
        const newGrid = this.grid.map((row, y) => {
            return row.map((cell, x) => {
                const isAlive = cell === 1;
                const numAliveNeighbours = this.getNumAliveNeighbours(x, y);

                if (isAlive) {
                    return (numAliveNeighbours === 2 || numAliveNeighbours === 3) ? 1 : 0;
                } else {
                    return numAliveNeighbours === 3 ? 1 : 0;
                }
            });
        });

        this.grid = newGrid;
    }

    getNumAliveNeighbours(x, y) {
        return this.neighbourOffsets.reduce((prevNum, neighbourOffset) => {
            return prevNum + this.getCellState(x + neighbourOffset.x, y + neighbourOffset.y);
        }, 0);
    }

    getCellState(x, y) {
        const wrappedCoordinates = this.getWrappedCoordinates(x, y);
        return this.grid[wrappedCoordinates.y][wrappedCoordinates.x];
    }

    getWrappedCoordinates(x, y) {
        const maxX = this.grid[0].length - 1;
        const maxY = this.grid.length - 1;
        x = x < 0 ? maxX : x;
        x = x > maxX ? 0 : x;
        y = y < 0 ? maxY : y;
        y = y > maxY ? 0 : y;

        return {
            x,
            y
        }
    }

    draw() {
        this.context.fillStyle = this.options.aliveColor;

        this.grid.forEach((row, rowIndex) => {
            const y = (rowIndex * this.options.cellSize) + this.gridSettings.offsetY;

            row.forEach((cell, cellIndex) => {
                const x = (cellIndex * this.options.cellSize) + this.gridSettings.offsetX;
                const isAlive = cell;

                if (isAlive) {
                    this.context.fillRect(x, y, this.options.cellSize, this.options.cellSize)
                }
            });
        });
    }

    tick(timestamp) {
        window.requestAnimationFrame(timestamp => this.tick(timestamp));
        const delta = timestamp ? timestamp - this.lastTimestamp : null;
        const shouldUpdate = !delta || delta >= this.options.speed;

        if (shouldUpdate) {
            this.lastTimestamp = timestamp;
            this.clearCanvas();
            this.draw();
            this.iterateGrid();
        }
    }
}

GameOfLife.defaultOptions = {
    element: null,
    cellSize: 10,
    aliveColor: '#000',
    deadColor: '#fff',
    speed: 200
};
