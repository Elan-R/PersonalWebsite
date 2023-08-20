const WAIT = 600;
const BAR_IN = 200;
const NAME_SLIDE = 500;
const BAR_COLLAPSE = 200;
const EXPLODE = 1000;

const elan = document.querySelector("#elan");
const ronen = document.querySelector("#ronen");
const bar = document.querySelector("#bar");
const dots = setUpDots(new CanvasDrawing());

function lineGrow() {
    bar.animate(
        [
            { height: "0.2vw" },
            { height: "18vw" }
        ],
        BAR_IN
    ).onfinish = function() {
        bar.style.height = "18vw";
        nameExpand();
    };
}

function nameExpand() {
    const elanRect = elan.getBoundingClientRect();
    const ronenRect = ronen.getBoundingClientRect();
    const spaceRect = document.querySelector("#space").getBoundingClientRect();
    const totalWidth = elanRect.width + spaceRect.width + ronenRect.width;
    const elanStart = pxToVw(elanRect.width / 2);
    const elanEnd = pxToVw((elanRect.width - totalWidth) / 2);
    const ronenStart = pxToVw(-ronenRect.width / 2);
    const ronenEnd = pxToVw((totalWidth - ronenRect.width) / 2);
    const barEnd = pxToVw((spaceRect.width - totalWidth) / 2 + elanRect.width);
    animate(function(frac) {
        bar.style.marginLeft = to(0, barEnd, frac) + "vw";
        elan.style.marginLeft = to(elanStart, elanEnd, frac) + "vw";
        ronen.style.marginLeft = to(ronenStart, ronenEnd, frac) + "vw";
        elan.style["-webkit-mask-position"] = elan.style["mask-position"] = to(90, 2, frac) + "%";
        ronen.style["-webkit-mask-position"] = ronen.style["mask-position"] = to(10, 95, frac) + "%";
    }, NAME_SLIDE, function() {
        elan.style["-webkit-mask-position"] = elan.style["mask-position"] = "0%";
        ronen.style["-webkit-mask-position"] = ronen.style["mask-position"] = "100%";
        lineShrink();
    });
}

function lineShrink() {
    bar.animate(
        [
            { height: "18vw" },
            { height: "0.2vw" }
        ],
        BAR_COLLAPSE
    ).onfinish = function() {
        bar.style.height = "0.2vw";
        dotsExplode();
    };
}

function dotsExplode() {
    const explosionSpeed = Math.max(WIDTH, HEIGHT) * DOT_SPEED / 7;
    const x = adjustXCoord(bar.offsetLeft);
    const y = HEIGHT / 2;
    let dx, dy;
    if (WIDTH > HEIGHT) {
        dx = explosionSpeed;
        dy = explosionSpeed * HEIGHT / WIDTH;
    } else {
        dx = explosionSpeed * WIDTH / HEIGHT;
        dy = explosionSpeed;
    }
    const dxLeft = x * dx / (WIDTH - x);

    for (const dot of dots.dots) {
        dot.x = x;
        dot.y = y;
        dot.dx = random(-dxLeft, dx);
        dot.dy = random(-dy, dy);
    }

    bar.style.display = "none";

    const end = dots.MAX_D;
    dots.MAX_D = 0;
    const grow = end * (dx / WIDTH);

    let start, previousTimeStamp, avg;

    function slowDown(timeStamp) {
        if (previousTimeStamp === undefined) {
            start = previousTimeStamp = timeStamp;
            window.requestAnimationFrame(slowDown);
            return;
        }
        if (previousTimeStamp !== timeStamp) {
            const scale = timeStamp - previousTimeStamp;
            dots.MAX_D = Math.min(dots.MAX_D + grow * scale, end);
            dots.update(scale);
            avg = 0;
            for (const dot of dots.dots) {
                dot.dx *= 0.9;
                dot.dy *= 0.9;
                if (dot.x < 0 || dot.x > WIDTH || dot.y < 0 || dot.y > HEIGHT) {
                    dot.x = Math.max(0, Math.min(WIDTH, dot.x));
                    dot.y = Math.max(0, Math.min(HEIGHT, dot.y));
                }
                avg += dot.dx * scale + dot.dy * scale;
            }
            avg /= dots.dots.length * 2;
            dots.draw();

            previousTimeStamp = timeStamp;
        }

        if (timeStamp - start >= EXPLODE) {
            window.cancelAnimationFrame(slowDown);
            dotsMove();
        } else {
            window.requestAnimationFrame(slowDown);
        }
        
    }

    slowDown();
}

function dotsMove() {
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
}

document.fonts.ready.then(function() {
    setTimeout(lineGrow, WAIT);
});
