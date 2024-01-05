import Block from "./block.js";

const TEEWEE_STATES = [
[
    [0,0],
    [-1, 0],
    [0, -1],
    [1, 0],
],
[
    [0,0],
    [0, -1],
    [1, 0],
    [0, 1],
],
[
    [0,0],
    [1, 0],
    [0, 1],
    [-1, 0],
],
[
    [0,0],
    [0, 1],
    [-1, 0],
    [0, -1],
],
];

const RHODE_STATES = [
    [
        [0,0],
        [-1, 0],
        [0, -1],
        [1, -1],
    ],
    [
        [0,0],
        [0, -1],
        [1, 0],
        [1, 1],
    ],
    [
        [0,0],
        [1, 0],
        [0, 1],
        [-1, 1],
    ],
    [
        [0,0],
        [0, 1],
        [-1, 0],
        [-1, -1],
    ],
];

const CLEVELAND_STATES = [
    [
        [0,0],
        [1, 0],
        [0, -1],
        [-1, -1],
    ],
    [
        [0,0],
        [0, 1],
        [1, 0],
        [1, -1],
    ],
    [
        [0,0],
        [-1, 0],
        [0, 1],
        [1, 1],
    ],
    [
        [0,0],
        [0, -1],
        [-1, 0],
        [-1, 1],
    ],
];

const ORICKY_STATES = [
    [
        [0,0],
        [-1, 0],
        [1, 0],
        [1, -1],
    ],
    [
        [0,0],
        [0, -1],
        [0, 1],
        [1, 1],
    ],
    [
        [0,0],
        [1,0],
        [-1,0],
        [-1,1],
    ],
    [
        [0,0],
        [0,1],
        [0,-1],
        [-1,-1],
    ],
];

const BRICKY_STATES = [
    [
        [0,0],
        [1, 0],
        [-1, 0],
        [-1, -1],
    ],
    [
        [0,0],
        [0, 1],
        [0, -1],
        [1, -1],
    ],
    [
        [0,0],
        [-1,0],
        [1,0],
        [1,1],
    ],
    [
        [0,0],
        [0,-1],
        [0,1],
        [-1,1],
    ],
];
    

const HERO_STATES = [
    [
        [0, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
    ],
    [
        [0, 0],
        [0, -1],
        [0, 1],
        [0, 2],
    ],
    [
        [0, 0],
        [-1, 0],
        [1, 0],
        [2, 0],
    ],
    [
        [1, 0],
        [1, -1],
        [1, 1],
        [1, 2],
    ],
];

const SMASHBOY_STATES = [
    [
        [0, 0],
        [1, 0],
        [0, -1],
        [1, -1],
    ],
];



class Tetris {
    constructor(grid, i, j) {
        this.grid = grid;
        /*
        Game rules:
        The tetris moves down together by one unit per update when it is not "frozen".

        If the y coordinate of one of the blocks is 
         */

        this.blocks = [];

        /* Position of the origin of the assembly */
        this.i = i;
        this.j = j;

        /* State management */
        this.timeBeforeFreeze = 500; // ms
        this.frozen = false; // assembly has landed somewhere
        this.state = 0; // rotational state of the tetris
        this.stateRule;
        this.numStates;
    }

    initialise(color) {
        this.stateRule[this.state].forEach((coordinate) => {
            this.blocks.push(new Block(this.grid, this.i+coordinate[0], this.j+coordinate[1], color));
        });
    }

    update() {
        if (!this.frozen) {
            this.blocks.forEach((e, index) => {
                e.i = this.i+this.stateRule[this.state][index][0];
                e.j = this.j+this.stateRule[this.state][index][1];
            });
        }
    }

    moveOffBoundaries() {
        let clippedLeft = false;
        let clippedRight = false;
        this.blocks.forEach((e) => {
            if (e.i < 0) {
                clippedLeft = true;
            } else if (e.i > this.grid.Nx - 1) {
                clippedRight = true;
            }
        });

        if (clippedLeft) {
            this.i++;
            this.update();
        } else if (clippedRight) {
            this.i--;
            this.update();
        }
    }

    checkCollisionBottom() {
        let hasCollided = false;
        
        this.blocks.forEach((block) => {
            if (block.j > this.grid.Ny-1) {
                hasCollided = true;
            }
        });

        return hasCollided;
    }

    checkCollisionWith(inactiveBlock) {
        let hasCollided = false;
        this.blocks.forEach((block) => {
            if (block.i === inactiveBlock.i && block.j === inactiveBlock.j) {
                hasCollided = true;
            }
        });

        return hasCollided;
    }

    advanceState() {
        if (this.state < this.numStates-1) {
            this.state++;
        } else {
            this.state = 0;
        }
        this.update();
        this.blocks.forEach((e) => {
            if (e.i > this.grid.Nx-1) {
                this.i--;
                this.update();
            } else if (e.i < 0) {
                this.i++;
                this.update();
            }
        });
        
    }

    retardState() {
        
        if (this.state > 0) {
            this.state--;
        } else {
            this.state = this.numStates - 1;
        }
        this.update();
    
    }

    moveDown() {
        if (!this.frozen) {
            this.j++;
            this.update();
        } 
    }

    moveUp() {
        if (!this.frozen) {
            this.j--;
            this.update();
        } 
    }

    moveLeft() {
        if (this.blocks.filter((e) => e.i === 0).length === 0) {
            this.i--;
            this.update();
        }
    }

    moveRight() {
        if (this.blocks.filter((e) => e.i === this.grid.Nx - 1).length === 0) {
            this.i++;
            this.update();
        }
    }

    draw(ctx, offset) {
        this.blocks.forEach((e) => {
            e.draw(ctx, offset);
        });
    }
}

export class Teewee extends Tetris {
    constructor(grid, i, j, color) {    
        super(grid, i, j);
        this.stateRule = TEEWEE_STATES;
        this.numStates = this.stateRule.length;
        this.initialise(color)
    }
}

export class Rhode extends Tetris {
    constructor(grid, i, j, color) {    
        super(grid, i, j);
        this.stateRule = RHODE_STATES;
        this.numStates = this.stateRule.length;
        this.initialise(color);
    }
}

export class Cleveland extends Tetris {
    constructor(grid, i, j, color) {    
        super(grid, i, j);
        this.stateRule = CLEVELAND_STATES;
        this.numStates = this.stateRule.length;
        this.initialise(color);
    }
}

export class ORicky extends Tetris {
    constructor(grid, i, j, color) {    
        super(grid, i, j);
        this.stateRule = ORICKY_STATES;
        this.numStates = this.stateRule.length;
        this.initialise(color);
    }
}

export class BRicky extends Tetris {
    constructor(grid, i, j, color) {    
        super(grid, i, j);
        this.stateRule = BRICKY_STATES;
        this.numStates = this.stateRule.length;
        this.initialise(color);
    }
}

export class Hero extends Tetris {
    constructor(grid, i, j, color) {    
        super(grid, i, j);
        this.stateRule = HERO_STATES;
        this.numStates = this.stateRule.length;
        this.initialise(color);
    }
}

export class Smashboy extends Tetris {
    constructor(grid, i, j, color) {    
        super(grid, i, j);
        this.stateRule = SMASHBOY_STATES;
        this.numStates = this.stateRule.length;
        this.initialise(color);
    }
}