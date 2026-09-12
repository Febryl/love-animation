const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const countdown = document.getElementById("countdown");
const mainText = document.getElementById("mainText");
const heartText = document.getElementById("heartText");
const replayButton = document.getElementById("replay");

let width;
let height;

let particles = [];
let rain = [];

let animationStart = 0;
let animationRunning = false;

const DPR = Math.min(window.devicePixelRatio || 1, 2);


/* =====================================================
   CANVAS
===================================================== */

function resizeCanvas() {

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = width * DPR;
    canvas.height = height * DPR;

    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    createRain();
}

window.addEventListener("resize", resizeCanvas);


/* =====================================================
   RANDOM
===================================================== */

function random(min, max) {
    return Math.random() * (max - min) + min;
}


/* =====================================================
   MATRIX RAIN
===================================================== */

const chars =
    "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&*@<>[]{}";

function createRain() {

    rain = [];

    const columnWidth = 14;

    const columns =
        Math.ceil(width / columnWidth);

    for (let i = 0; i < columns; i++) {

        rain.push({

            x: i * columnWidth,

            y: random(-height, 0),

            speed: random(1, 4),

            length: Math.floor(random(5, 20)),

            opacity: random(0.15, 0.7),

            size: random(8, 13)

        });
    }
}


function drawRain() {

    ctx.save();

    ctx.font = "12px monospace";

    for (const drop of rain) {

        for (let i = 0; i < drop.length; i++) {

            const char =
                chars[
                    Math.floor(
                        Math.random() * chars.length
                    )
                ];

            const y =
                drop.y -
                i * 15;

            if (y < 0 || y > height) {
                continue;
            }

            const alpha =
                drop.opacity *
                (1 - i / drop.length);

            ctx.fillStyle =
                `rgba(255, 60, 170, ${alpha})`;

            ctx.fillText(
                char,
                drop.x,
                y
            );
        }

        drop.y += drop.speed;

        if (
            drop.y -
            drop.length * 15 >
            height
        ) {

            drop.y = random(-300, 0);

            drop.speed = random(1, 4);
        }
    }

    ctx.restore();
}


/* =====================================================
   PARTICLE
===================================================== */

class Particle {

    constructor(x, y, color = "white") {

        this.x = x;
        this.y = y;

        this.targetX = x;
        this.targetY = y;

        this.vx = random(-2, 2);
        this.vy = random(-2, 2);

        this.size = random(1, 3);

        this.color = color;

        this.alpha = random(0.5, 1);
    }


    update() {

        const dx =
            this.targetX - this.x;

        const dy =
            this.targetY - this.y;

        this.vx += dx * 0.012;
        this.vy += dy * 0.012;

        this.vx *= 0.88;
        this.vy *= 0.88;

        this.x += this.vx;
        this.y += this.vy;
    }


    draw() {

        ctx.beginPath();

        ctx.arc(
            this.x,
            this.y,
            this.size,
            0,
            Math.PI * 2
        );

        ctx.fillStyle =
            this.color;

        ctx.globalAlpha =
            this.alpha;

        ctx.shadowBlur = 10;

        ctx.shadowColor =
            this.color;

        ctx.fill();

        ctx.globalAlpha = 1;

        ctx.shadowBlur = 0;
    }
}


/* =====================================================
   TEXT → PARTICLES
===================================================== */

function createTextParticles(text) {

    const tempCanvas =
        document.createElement("canvas");

    const tempCtx =
        tempCanvas.getContext("2d");

    tempCanvas.width = width;
    tempCanvas.height = height;

    const fontSize =
        Math.min(width * 0.17, 120);

    tempCtx.font =
        `900 ${fontSize}px Arial`;

    tempCtx.textAlign = "center";
    tempCtx.textBaseline = "middle";

    tempCtx.fillStyle = "white";

    tempCtx.fillText(
        text,
        width / 2,
        height / 2
    );

    const image =
        tempCtx.getImageData(
            0,
            0,
            width,
            height
        );

    particles = [];

    const gap = 5;

    for (
        let y = 0;
        y < height;
        y += gap
    ) {

        for (
            let x = 0;
            x < width;
            x += gap
        ) {

            const index =
                (y * width + x) * 4;

            const alpha =
                image.data[index + 3];

            if (alpha > 100) {

                const p =
                    new Particle(
                        width / 2,
                        height / 2
                    );

                p.targetX = x;
                p.targetY = y;

                p.color =
                    "rgb(245,247,210)";

                p.size =
                    random(1, 2.5);

                particles.push(p);
            }
        }
    }
}


/* =====================================================
   HEART
===================================================== */

function heartPoint(t, scale) {

    const x =
        16 * Math.pow(Math.sin(t), 3);

    const y =
        -(
            13 * Math.cos(t)
            - 5 * Math.cos(2 * t)
            - 2 * Math.cos(3 * t)
            - Math.cos(4 * t)
        );

    return {
        x: x * scale,
        y: y * scale
    };
}


function createHeartParticles() {

    particles = [];

    const scale =
        Math.min(
            width / 35,
            height / 42
        );

    const total = 950;

    for (let i = 0; i < total; i++) {

        const t =
            Math.random() *
            Math.PI *
            2;

        const edge =
            heartPoint(t, scale);

        const inside =
            Math.random();

        const x =
            edge.x *
            (0.65 + inside * 0.35);

        const y =
            edge.y *
            (0.65 + inside * 0.35);

        const p =
            new Particle(
                width / 2,
                height / 2,
                "#ff4fa3"
            );

        p.targetX =
            width / 2 + x;

        p.targetY =
            height / 2 + y;

        p.color =
            Math.random() > 0.25
                ? "#ff4fa3"
                : "#ff8fc5";

        p.size =
            random(1, 2.8);

        particles.push(p);
    }
}


/* =====================================================
   EXPLOSION
===================================================== */

function explodeParticles() {

    for (const p of particles) {

        const angle =
            Math.random() *
            Math.PI *
            2;

        const force =
            random(5, 18);

        p.vx =
            Math.cos(angle) * force;

        p.vy =
            Math.sin(angle) * force;

        p.targetX =
            width / 2 +
            random(-width, width);

        p.targetY =
            height / 2 +
            random(-height, height);
    }
}


/* =====================================================
   PARTICLES
===================================================== */

function updateParticles() {

    for (const p of particles) {

        p.update();
        p.draw();
    }
}


/* =====================================================
   COUNTDOWN
===================================================== */

function showCountdown(number) {

    if (countdown.textContent === String(number)) {
        return;
    }

    countdown.textContent = number;

    countdown.classList.remove("show");

    void countdown.offsetWidth;

    countdown.classList.add("show");
}


function hideCountdown() {

    countdown.classList.remove("show");
}


/* =====================================================
   MAIN TEXT
===================================================== */

function showMainText(text) {

    if (mainText.textContent === text) {
        return;
    }

    mainText.textContent = text;

    mainText.classList.remove("show");

    void mainText.offsetWidth;

    mainText.classList.add("show");
}


function hideMainText() {

    mainText.classList.remove("show");
}


/* =====================================================
   HEART TEXT
===================================================== */

function showHeartText() {

    heartText.classList.add("show");
}


function hideHeartText() {

    heartText.classList.remove("show");
}


/* =====================================================
   START / REPLAY
===================================================== */

function runTimeline() {

    animationStart =
        performance.now();

    animationRunning = true;

    particles = [];

    hideHeartText();
    hideMainText();
    hideCountdown();

    replayButton.classList.remove(
        "visible"
    );
}


/* =====================================================
   ANIMATION LOOP
===================================================== */

function animate(time) {

    requestAnimationFrame(animate);

    ctx.fillStyle =
        "rgba(3, 3, 7, 0.25)";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );

    drawRain();

    if (!animationRunning) {

        updateParticles();

        return;
    }

    const elapsed =
        (time - animationStart) / 1000;


    /* 0 - 3 DETIK */

    if (elapsed < 3) {

        hideCountdown();
        hideMainText();
        hideHeartText();

        particles = [];
    }


    /* 3 */

    else if (
        elapsed >= 3 &&
        elapsed < 4
    ) {

        showCountdown(3);
    }


    /* 2 */

    else if (
        elapsed >= 4 &&
        elapsed < 5
    ) {

        showCountdown(2);
    }


    /* 1 */

    else if (
        elapsed >= 5 &&
        elapsed < 6
    ) {

        showCountdown(1);
    }


    /* YOU */

    else if (
        elapsed >= 6 &&
        elapsed < 9
    ) {

        hideCountdown();

        if (
            mainText.textContent !== "You"
        ) {

            createTextParticles("You");

            showMainText("You");
        }
    }


    /* ARE */

    else if (
        elapsed >= 9 &&
        elapsed < 12
    ) {

        if (
            mainText.textContent !== "Are"
        ) {

            createTextParticles("Are");

            showMainText("Are");
        }
    }


    /* MY */

    else if (
        elapsed >= 12 &&
        elapsed < 15
    ) {

        if (
            mainText.textContent !== "My"
        ) {

            createTextParticles("My");

            showMainText("My");
        }
    }


    /* LOVE */

    else if (
        elapsed >= 15 &&
        elapsed < 17.5
    ) {

        if (
            mainText.textContent !== "Love"
        ) {

            createTextParticles("Love");

            showMainText("Love");
        }
    }


    /* EXPLOSION */

    else if (
        elapsed >= 17.5 &&
        elapsed < 19
    ) {

        hideMainText();

        if (particles.length > 0) {

            explodeParticles();
        }
    }


    /* HEART */

    else if (
        elapsed >= 19 &&
        elapsed < 23
    ) {

        if (
            particles.length === 0 ||
            !particles[0].isHeart
        ) {

            createHeartParticles();

            particles.forEach(
                p => p.isHeart = true
            );
        }

        showHeartText();
    }


    /* SELESAI */

    else {

        showHeartText();

        replayButton.classList.add(
            "visible"
        );
    }

    updateParticles();
}


/* =====================================================
   REPLAY BUTTON
===================================================== */

replayButton.addEventListener(
    "click",
    () => {
        runTimeline();
    }
);


/* =====================================================
   INITIALIZE
===================================================== */

resizeCanvas();

runTimeline();

requestAnimationFrame(animate);