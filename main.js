var SCREEN_WIDTH = document.documentElement.clientWidth;
var SCREEN_HEIGHT = document.documentElement.clientHeight;
var RADIUS = Math.floor(Math.min(SCREEN_HEIGHT, SCREEN_WIDTH) * 0.275);
var MIN_PARTICLE_RADIUS = 1;
var MAX_PARTICLE_RADIUS = 12;
var HUE_SHIFT = 0.1;
var PARTICLE_COUNT = 500;
var AUTO_FADE = false;
var hue = 0;
var canvas = document.getElementById('visual');
var ctx = canvas.getContext('2d');
var controls = document.getElementById('controls');
canvas.setAttribute("width", String(SCREEN_WIDTH));
canvas.setAttribute("height", String(SCREEN_HEIGHT));
ctx.globalCompositeOperation = "hard-light";
var controllers = document.querySelectorAll('.js-controller');
[].forEach.call(controllers, function (controller) {
    controller.addEventListener('change', function (changeEvent) {
        var value = changeEvent.target.value;
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
    });
});
document.addEventListener('keypress', function (keyEvent) {
    if (keyEvent.charCode === 63) {
        controls.classList.toggle('js-hidden');
    }
});
var HSLAColor = (function () {
    function HSLAColor(h, s, l, a) {
        if (a === void 0) { a = 0.8; }
        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }
    HSLAColor.prototype.toString = function () {
        return "hsla(" + this.h + ", " + this.s + "%, " + this.l + "%, " + this.a + ")";
    };
    return HSLAColor;
}());
var Particle = (function () {
    function Particle(x, y) {
        this.radius = 1;
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }
    Particle.prototype.diff = function (p) {
        var dx = Math.abs(this.x - p.x);
        var dy = Math.abs(this.y - p.y);
        return Math.sqrt(dx * dx + dy * dy);
    };
    Particle.prototype.delta = function (p, r) {
        var diff = this.diff(p);
        return diff >= r ? r / diff : diff / r;
    };
    return Particle;
}());
function randomParticleFactory(maxWidth, maxHeight) {
    var x = Math.floor(Math.random() * maxWidth);
    var y = Math.floor(Math.random() * maxHeight);
    return new Particle(x, y);
}
function createLightnessFromDelta(delta) {
    return Math.floor(delta * 40 + 10);
}
var CENTRUM = new Particle(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);
function drawParticle(particle, color) {
    var s = Math.random() * (2 * Math.PI);
    var e = Math.random() * (2 * Math.PI);
    ctx.beginPath();
    ctx.fillStyle = color.toString();
    ctx.arc(particle.x, particle.y, particle.radius, s, e);
    ctx.closePath();
    ctx.fill();
}
function drawLine(particle, color, start) {
    if (start === void 0) { start = CENTRUM; }
    ctx.beginPath();
    ctx.strokeStyle = color.toString();
    ctx.lineWidth = 2;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(particle.x, particle.y);
    ctx.closePath();
    ctx.stroke();
}
function draw() {
    var MAX_PARTICLES = PARTICLE_COUNT;
    while (MAX_PARTICLES--) {
        var particle = randomParticleFactory(SCREEN_WIDTH, SCREEN_HEIGHT);
        var delta = particle.delta(CENTRUM, RADIUS);
        var sat = delta * 50 + 10;
        particle.radius = delta * (MAX_PARTICLE_RADIUS - MIN_PARTICLE_RADIUS) + MIN_PARTICLE_RADIUS;
        if (MAX_PARTICLES % 10 === 0) {
            var alpha = delta * 0.1 + 0.2;
            var lightness = createLightnessFromDelta(alpha);
            var lineColor = new HSLAColor(hue, sat, lightness, alpha);
            drawLine(particle, lineColor);
        }
        else {
            var lightness = createLightnessFromDelta(delta);
            var fillColor = new HSLAColor(hue, sat, lightness, delta * 0.6 + 0.2);
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
//# sourceMappingURL=main.js.map