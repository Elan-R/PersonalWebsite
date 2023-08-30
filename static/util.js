console.log("8/12/2023")

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const DOT_SPEED = 1/50;

function animate(func, time, callback) {
    let start, previousTimeStamp;

    function animation(timeStamp) {
        if (start === undefined) {
            start = timeStamp;
        }
        const elapsed = timeStamp - start;

        if (previousTimeStamp !== timeStamp) {
            func(Math.min(elapsed / NAME_SLIDE, 1));
        }

        if (elapsed < time) {
            previousTimeStamp = timeStamp;
            window.requestAnimationFrame(animation);
        } else {
            window.cancelAnimationFrame(animation);
            callback();
        }
    }

    window.requestAnimationFrame(animation);
}

function pxToVw(px) {
    return 100 * px / window.innerWidth;
}

function easeInOut(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function to(start, end, x) {
    return (end - start) * easeInOut(x) + start;
}

function adjustXCoord(x) {
    return x / window.innerWidth * WIDTH;
}

function adjustYCoord(y) {
    return y / window.innerHeight * HEIGHT;
}

function random(a, b){
    return Math.random() * (b - a) + a;
}

function circleLayOutElements(elements) {
    const degree = 2 * Math.PI / elements.length;

    const scale = 13;
    let xScale, yScale;

    if (WIDTH > HEIGHT) {
        xScale = scale * WIDTH / HEIGHT;
        yScale = scale;
    } else {
        xScale = scale;
        yScale = scale * HEIGHT / WIDTH;
    }

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        element.style.marginLeft = xScale * Math.cos(degree * i - Math.PI / 2) + "vw";
        element.style.marginTop = yScale * Math.sin(degree * i - Math.PI / 2) + "vw";
    }
}

function setUpDots(drawing) {
    const dots = new Dots(100, drawing)

    dots.forceZones.window = function(dot) {
        if (dot.x <= 0 || dot.x >= WIDTH) {
            dot.dx = -dot.dx;
        }
        if (dot.y <= 0 || dot.y >= HEIGHT) {
            dot.dy = -dot.dy;
        }
        dot.x = Math.max(0, Math.min(WIDTH, dot.x));
        dot.y = Math.max(0, Math.min(HEIGHT, dot.y));
    };

    return dots;
}

class Dots {

    constructor (n, drawing) {
        this.drawing = drawing;
        this.n = n;
        this.dots = Array.from(Array(n), () => ({
            x: 0, y: 0,
            dx: 0, dy: 0
        }));
        this.forceZones = {};
        this.MAX_D = Math.min(WIDTH, HEIGHT) / 4;
    }

    distance(dot1, dot2) {
        return Math.sqrt(((dot2.x - dot1.x) ** 2) + ((dot2.y - dot1.y) ** 2));
    }

    draw() {
        this.drawing.clear();
        for (const dot1 of this.dots) {
            for (const dot2 of this.dots) {
                const distance = this.distance(dot1, dot2);
                if (distance < this.MAX_D) {
                    this.drawing.drawLine(dot1.x, dot1.y, dot2.x, dot2.y, `rgba(0, 255, 0, ${1 - distance / this.MAX_D})`);
                }
            }
        }
    }

    update(scale) {
        for (const dot of this.dots) {
            dot.x += dot.dx * scale;
            dot.y += dot.dy * scale;
            for (const forceZone of Object.values(this.forceZones)) {
                forceZone(dot, scale);
            }
        }
    }

    normal() {
        for (const dot of this.dots) {
            dot.dx = random(-DOT_SPEED, DOT_SPEED);
            dot.dy = random(-DOT_SPEED, DOT_SPEED);
        }
    }

    scatter() {
        for (const dot of this.dots) {
            dot.x = random(0, WIDTH);
            dot.y = random(0, HEIGHT);
        }
    }

}

class CanvasDrawing {

    constructor() {
        this.canvas = document.querySelector("canvas");
        this.canvas.width = WIDTH * window.devicePixelRatio;
        this.canvas.height = HEIGHT * window.devicePixelRatio;
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        this.ctx = this.canvas.getContext("2d");
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = "butt";
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawLine(x1, y1, x2, y2, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }

}

document.fonts.ready.then(function() {
    const nav = document.querySelector("nav");

    if (nav !== null) nav.style.setProperty("--nav-width", nav.getBoundingClientRect().width + 40);
});
