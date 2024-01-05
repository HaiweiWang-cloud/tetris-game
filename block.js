export default class Block {
    constructor(grid, i, j, color) {
        this.grid = grid;
        this.i = i;
        this.j = j;
        this.color = color;
    }

    draw(ctx, offset) {
        ctx.fillStyle = this.color;
        ctx.fillRect((this.i + offset * 0.5) * this.grid.squareLength + this.grid.x, (this.j + offset * 0.5) * this.grid.squareLength + this.grid.y, this.grid.squareLength * (1-offset), this.grid.squareLength * (1-offset));
    }
}