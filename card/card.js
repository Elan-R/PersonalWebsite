const dots = setUpDots(new CanvasDrawing());
dots.scatter();
dots.normal();

let previousTimeStamp;

function loop(timeStamp) {
    if (previousTimeStamp === undefined || timeStamp - previousTimeStamp > 50) {
        previousTimeStamp = timeStamp;
        window.requestAnimationFrame(loop);
        return;
    }
    if (previousTimeStamp !== timeStamp) {
        const scale = timeStamp - previousTimeStamp;
        dots.update(scale);
        dots.draw();

        previousTimeStamp = timeStamp;
    }

    window.requestAnimationFrame(loop);
}

loop();
