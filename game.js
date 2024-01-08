import InputHandler from "./input.js";
import * as tetris from "./tetrisBlocks.js";
import Grid from "./grid.js";

const GAME_HEIGHT = 600;
const GAME_WIDTH = 300;
const N_X = 10;
const N_Y = 20;
const NEXT_N_X = 5;
const NEXT_N_Y = 10;

const TEEWEE_COLOR = "rgb(221, 10, 178)";
const SMASHBOY_COLOR = "rgb(254, 251, 52)";
const ORICKY_COLOR = "rgb(255, 200, 46)";
const BRICKY_COLOR = "rgb(0, 119, 211)";
const CLEVELAND_COLOR = "rgb(234, 20, 28)";
const RHODE_COLOR = "rgb(83, 218, 63)";
const HERO_COLOR = "rgb(1, 237, 250)";

backgroundCanvas.width = blocksCanvas.width = GAME_WIDTH;
backgroundCanvas.height = blocksCanvas.height = GAME_HEIGHT;

nextCanvas.width = 100;
nextCanvas.height = 200;

holdCanvas.width = 100;
holdCanvas.height = 100;

export default class Game {
    constructor() {
        this.score = 0;
        this.grid = new Grid(backgroundCanvas, N_X, N_Y);
        this.grid.draw("white", "black");
        this.ctx = blocksCanvas.getContext("2d");
        this.input = new InputHandler();
        this.activeBlock = this.generateNewBlock();
        this.offset = 0.2;
        this.dropTimer = 0;
        this.dropInterval = 500;

        this.nextGrid = new Grid(nextCanvas, NEXT_N_X, NEXT_N_Y);
        this.nextCtx = nextCanvas.getContext("2d");

        this.holdGrid = new Grid(holdCanvas, NEXT_N_X, NEXT_N_X);
        this.holdCtx = holdCanvas.getContext("2d");

        this.moveTimer = 0;
        this.moveInterval = 120;

        this.freezeCooldown = 200;
        this.freezeTimer = 0;

        this.rotated = false;

        this.inactiveBlocks = [];

        this.mute = true;
        this.music = gameMusic;
        this.music.volume = 0.1;
        this.music.muted = this.mute;
        this.music.loop = true;
        this.music.play();
        
        this.nextBlockIndex = [this.randomiseBlock(), this.randomiseBlock(), this.randomiseBlock()];
        this.updateNext();

        this.activeBlockTypeId = this.randomiseBlock();
        this.heldBlockTypeId = this.activeBlockTypeId;
        this.activeBlock = this.generateNewBlock(this.grid, this.activeBlockTypeId, 4, -1);
        this.holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
        this.heldBlock = "none";
        this.heldToggled = false;
        this.dropDownDisabled = false;

        this.clearSound = scoreSFX;

        this.gameOver = false;
    }

    update(deltaTime) {
        if (!this.gameOver) {
            if (this.input.keysPressed.has("w")) {
                if (!this.rotated)  {
                    this.activeBlock.advanceState()
                    if (this.checkCollisions()) {
                        this.activeBlock.retardState();
                    }
                }
                this.rotated = true;
            } else {
                this.rotated = false;
            }
    
            if (this.moveTimer > this.moveInterval) {
                if (this.input.keysPressed.has("d")) {
                    this.activeBlock.moveRight();
                    if (this.checkCollisions()) {
                        this.activeBlock.moveLeft();
                    }
                    this.moveTimer = 0;
                } else if (this.input.keysPressed.has("a")){
                    this.activeBlock.moveLeft();
                    if (this.checkCollisions()) {
                        this.activeBlock.moveRight();
                    }
                    this.moveTimer = 0;
                }
            } else {
                this.moveTimer += deltaTime
            }
            
            if (this.input.keysPressed.has("s") && !this.dropDownDisabled) this.drop();
            else if (this.dropDownDisabled && !this.input.keysPressed.has('s')) this.dropDownDisabled = false;
           
            if (this.dropTimer >= this.dropInterval){
                this.drop();
                this.dropTimer = 0;
            } else {
                this.dropTimer += deltaTime;
            }
    
            if (this.input.keysPressed.has("q")) {
                if (!this.heldToggled) this.updateHeld();
                this.heldToggled = true;
            } else {
                this.heldToggled = false;
            }
    
            if (this.activeBlock.frozen) {
                this.activeBlock.blocks.forEach((block) =>
                this.inactiveBlocks.push(block));
                this.dropDownDisabled = true;
                this.clearLines();
                this.updateNext();
                this.checkGameOver();
            } 
        }
    }

    checkGameOver() {
        this.inactiveBlocks.forEach((block) => {
            if (block.j < 0) {
                this.gameOver = true;
            }
        });
    }

    updateHeld() {
        if (this.heldBlock === "none") {
            this.heldBlockTypeId = this.activeBlockTypeId;
            this.heldBlock = this.generateNewBlock(this.holdGrid, this.heldBlockTypeId, 2, 2);
            this.updateNext();
        } else {
            let oldHeldId = this.heldBlockTypeId;
            this.heldBlockTypeId = this.activeBlockTypeId;
            this.activeBlockTypeId = oldHeldId;

            this.heldBlock = this.generateNewBlock(this.holdGrid, this.heldBlockTypeId, 2, 2);
            this.activeBlock = this.generateNewBlock(this.grid, this.activeBlockTypeId, this.activeBlock.i, this.activeBlock.j);
            this.activeBlock.moveOffBoundaries();
        }

        this.holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
        this.heldBlock.draw(this.holdCtx, this.offset);
    }

    updateNext() {
        this.activeBlockTypeId = this.nextBlockIndex.reverse().pop();
        this.activeBlock = this.generateNewBlock(this.grid, this.activeBlockTypeId, 4, -1);
        this.nextBlockIndex.reverse().push(this.randomiseBlock());
        this.nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        this.nextBlockIndex.forEach((e, i) => {
            let displayBlock = this.generateNewBlock(this.nextGrid, e, 2, 2+3*i);
            displayBlock.draw(this.nextCtx, this.offset);
        });
    }

    drop() {
        this.activeBlock.moveDown();
        if (this.checkCollisions() || this.activeBlock.checkCollisionBottom()) {
            this.activeBlock.moveUp();
            this.activeBlock.frozen = true;
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let j=0; j < this.grid.Ny; j++) {
            if (this.inactiveBlocks.filter((block) => block.j === j).length === this.grid.Nx) {
                this.inactiveBlocks = this.inactiveBlocks.filter((block) => block.j != j);
                this.inactiveBlocks.forEach((block) => {
                    if (block.j < j) {
                        block.j++;
                    }
                });
                linesCleared += 1;
            }
        }

        if (linesCleared === 4) {
            this.score += 800;
        } else {
            this.score += 100 * linesCleared;
        }
        if (linesCleared > 0 && !this.mute) {
            this.clearSound.play();
        }
    }

    checkCollisions() {
        let hasCollided = false;
        this.inactiveBlocks.forEach((block) => {
            if (this.activeBlock.checkCollisionWith(block)) {
                hasCollided = true;
            }
        });

        return hasCollided;
    }

    randomiseBlock() {
        return Math.floor(Math.random()*7);
    }

    generateNewBlock(grid, index, i, j) {
    
        switch (index) {
            case 0:
                return new tetris.Smashboy(grid, i, j, SMASHBOY_COLOR);
                
            case 1:
                return new tetris.Teewee(grid, i, j, TEEWEE_COLOR);
                
            case 2:
                return new tetris.Rhode(grid, i, j, RHODE_COLOR);
                
            case 3:
                return new tetris.Cleveland(grid, i, j, CLEVELAND_COLOR);
                
            case 4:
                return new tetris.ORicky(grid, i, j, ORICKY_COLOR);
                
            case 5:
                return new tetris.BRicky(grid, i, j, BRICKY_COLOR);
                
            case 6:
                return new tetris.Hero(grid, i, j, HERO_COLOR);
                
        }
    }

    draw() {
        if (!this.gameOver) {
            this.ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
            this.inactiveBlocks.forEach((e) => e.draw(this.ctx, this.offset));
            this.activeBlock.draw(this.ctx, this.offset);
        } else {
            this.ctx.fillStyle = "white";
            this.ctx.font = "36px Impact";
            this.ctx.fillText("Game Over.", blocksCanvas.width/2-80, blocksCanvas.height/2);
        }
    }
}