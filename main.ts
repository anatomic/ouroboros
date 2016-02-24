const SCREEN_WIDTH:number = document.documentElement.clientWidth;
const SCREEN_HEIGHT:number = document.documentElement.clientHeight;
const RADIUS:number = Math.floor(Math.min(SCREEN_HEIGHT, SCREEN_WIDTH) * 0.275);
let MIN_PARTICLE_RADIUS = 1;
let MAX_PARTICLE_RADIUS:number = 12;
let HUE_SHIFT:number = 0.1;
let PARTICLE_COUNT:number = 500;
let AUTO_FADE: boolean = false;
let hue:number = 0;
const canvas = <HTMLCanvasElement> document.getElementById('visual');
const ctx:CanvasRenderingContext2D = canvas.getContext('2d');
const controls: HTMLElement = document.getElementById('controls');

canvas.setAttribute("width", String(SCREEN_WIDTH));
canvas.setAttribute("height", String(SCREEN_HEIGHT));

ctx.globalCompositeOperation = "hard-light";

const controllers = document.querySelectorAll('.js-controller');
[].forEach.call(controllers, (controller) => {
    controller.addEventListener('change', (changeEvent) => {
        const value = changeEvent.target.value;
        switch (changeEvent.target.id) {
            case "max-size":
                MAX_PARTICLE_RADIUS = parseFloat(value);
                break;
            case "min-size":
                MIN_PARTICLE_RADIUS = parseFloat(value);
                break;
            case "hue-shift":
                HUE_SHIFT = parseFloat(value);
                break;
            case "particle-count":
                PARTICLE_COUNT = parseFloat(value);
                break;
            case "auto-fade":
                AUTO_FADE = changeEvent.target.checked;
                break;
        }
    })
});

document.addEventListener('keypress', (keyEvent:KeyboardEvent) => {
    if (keyEvent.charCode === 63){
        controls.classList.toggle('js-hidden');
    }
});

interface PaintableColor {
    toString(): string;
}

class HSLAColor implements PaintableColor {
    constructor(private h:number,
                private s:number,
                private l:number,
                private a:number = 0.8) {
    }

    toString() {
        return `hsla(${this.h}, ${this.s}%, ${this.l}%, ${this.a})`;
    }
}

class Particle {
    radius:number = 1;
    x:number;
    y:number;

    constructor(x:number, y:number) {
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }

    diff(p:Particle):number {
        const dx = Math.abs(this.x - p.x);
        const dy = Math.abs(this.y - p.y);
        return Math.sqrt(dx * dx + dy * dy);
    }

    delta(p:Particle, r:number):number {
        const diff = this.diff(p);
        return diff >= r ? r / diff : diff / r;
    }
}

function randomParticleFactory(maxWidth:number, maxHeight:number):Particle {
    const x = Math.floor(Math.random() * maxWidth);
    const y = Math.floor(Math.random() * maxHeight);
    return new Particle(x, y);
}

function createLightnessFromDelta(delta:number):number {
    return Math.floor(delta * 40 + 10);
}

const CENTRUM:Particle = new Particle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);

function drawParticle(particle:Particle, color:PaintableColor) {
    const s = Math.random() * (2 * Math.PI);
    const e = Math.random() * (2 * Math.PI);
    ctx.beginPath();
    ctx.fillStyle = color.toString();
    ctx.arc(particle.x, particle.y, particle.radius, s, e);
    ctx.closePath();
    ctx.fill();
}

function drawLine(particle:Particle, color:PaintableColor, start:Particle = CENTRUM) {
    ctx.beginPath();
    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(particle.x, particle.y);
    ctx.closePath();
    ctx.stroke();
}

function draw() {
    let MAX_PARTICLES:number = PARTICLE_COUNT;
    while (MAX_PARTICLES--) {
        const particle = randomParticleFactory(SCREEN_WIDTH, SCREEN_HEIGHT);
        const delta:number = particle.delta(CENTRUM, RADIUS);
        const sat = delta * 50 + 10;

        particle.radius = delta * (MAX_PARTICLE_RADIUS - MIN_PARTICLE_RADIUS) + MIN_PARTICLE_RADIUS;

        if (MAX_PARTICLES % 10 === 0) {
            const alpha = delta * 0.1 + 0.2;
            const lightness = createLightnessFromDelta(alpha)
            const lineColor:HSLAColor = new HSLAColor(hue, sat, lightness, alpha);
            drawLine(particle, lineColor);
        } else {
            const lightness = createLightnessFromDelta(delta);
            const fillColor:HSLAColor = new HSLAColor(hue, sat, lightness, delta * 0.6 + 0.2);
            drawParticle(particle, fillColor);
        }
    }

    hue += HUE_SHIFT;
    if (AUTO_FADE) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.025)";
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
    requestAnimationFrame(draw);
}

draw();
