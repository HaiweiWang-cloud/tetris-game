export default class InputHandler {
    constructor() {
        this.keysPressed = new Set();
        window.addEventListener("keydown", (e) => {
            this.keysPressed.add(e.key);
        });

        window.addEventListener("keyup", (e) => {
            this.keysPressed.delete(e.key);
        });
    }
}