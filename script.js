import Game from "./game.js";

window.addEventListener("load", function() {
    let paused = true;
    let mute = true;
    let lastTime = 0;
    let deltaTime = 0;

    let game = new Game();


    function togglePlay() {
        if (paused) {
            paused = false;
            pauseButton.innerHTML = "<span class=\"material-symbols-outlined\"> pause</span>";
        } else {
            paused = true;
            pauseButton.innerHTML = "<span class=\"material-symbols-outlined\"> play_arrow</span>";
        }
    }

    function toggleAudio() {
        if (mute) {
            mute = false;
            muteButton.innerHTML = "<span class=\"material-symbols-outlined\"> volume_up</span>";
        } else {
            mute = true;
            muteButton.innerHTML = "<span class=\"material-symbols-outlined\"> volume_off</span>";
        }

        game.mute = mute;
        game.music.muted = mute;
    }

    function restart() {
        game = new Game();
        game.mute = mute;
        game.music.muted = mute;
        paused = true;
        togglePlay();
    }

    restartButton.addEventListener("click", restart);
    pauseButton.addEventListener("click", togglePlay);
    muteButton.addEventListener("click", toggleAudio);

    
    function animate(timestamp) {
        deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        if (!paused && !game.gameOver) {
            game.update(deltaTime);
            game.draw();
            score.innerText = game.score;
        }
        
        requestAnimationFrame(animate);
    }

    animate(0);
});
