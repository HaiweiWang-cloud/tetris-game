export default class Grid {
    constructor(canvas, Nx, Ny) {
        this.Nx = Nx;
        this.Ny = Ny;
        this.canvas = canvas;

        /* Calculated properties */
        this.squareLength = Math.min(canvas.width/this.Nx, canvas.height/this.Ny);
        this.width = this.squareLength * this.Nx;
        this.height = this.squareLength * this.Ny;

        this.x = 0;
        this.y = 0;

        if (Math.abs(canvas.width - this.width) < 0.01) {
            this.y = (canvas.height - this.height) / 2;
        } else {
            this.x = (canvas.width - this.width) / 2;
        }
    }

    draw(gridColor, backgroundColor) {
        let ctx = this.canvas.getContext("2d");
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = gridColor;
        for (let i=1; i<this.Nx; i++) {
            ctx.beginPath();
            ctx.moveTo(this.squareLength * i, 0);
            ctx.lineTo(this.squareLength * i, this.height);
            ctx.stroke();
        }

        for (let i=1; i<this.Ny; i++) {
            ctx.beginPath();
            ctx.moveTo(0, this.squareLength * i);
            ctx.lineTo(this.width, this.squareLength * i);
            ctx.stroke();
        }
    }
}