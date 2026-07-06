

import anime from 'animejs';
import { initReveal } from './reveal.js';


class Playground3DController {
    constructor(canvasId) {
        this.mascotImg = document.getElementById('mascot2DImg');
        
        this.state = 'idle';
        this.stateTime = 0;
        this.frameTime = 0;
        this.currentFrame = 0;
        this.speedMultiplier = 1.0;
        this.targetScale = 1.0;
        this.currentScale = 1.0;
        this.positionX = 50; // percentage
        this.positionY = 30; // percentage
        this.direction = 1; // 1 for right, -1 for left
        this.glowHue = 0;
        
        this.animations = {
            idle: 4,
            walk: 9,
            run: 7,
            jump: 6,
            crouch: 2,
            push: 4,
            pull: 3,
            climb: 3,
            hurt: 3,
            victory: 4
        };
        
        this.lastTimestamp = performance.now();
        this.tick();
    }
    
    tick() {
        this.animId = requestAnimationFrame(this.tick.bind(this));
        
        const now = performance.now();
        const dt = (now - this.lastTimestamp) / 1000;
        this.lastTimestamp = now;
        
        this.stateTime += dt * this.speedMultiplier;
        this.frameTime += dt * this.speedMultiplier;
        
        const baseFrameDuration = 0.12; 
        const frameDuration = baseFrameDuration / (this.speedMultiplier || 1.0);
        
        const maxFrames = this.animations[this.state] || 1;
        if (this.frameTime >= frameDuration) {
            this.frameTime = 0;
            this.currentFrame = (this.currentFrame + 1) % maxFrames;
            this.updateFrame();
        }
        
        this.updatePhysics(dt);
    }
    
    updateFrame() {
        if (this.mascotImg) {
            const baseUrl = window.BASE_URL || '/';
            const frameSrc = `${baseUrl}assets/img/gallery/mascot_2d_${this.state}_${this.currentFrame}.png`;
            if (this.mascotImg.getAttribute('src') !== frameSrc) {
                this.mascotImg.src = frameSrc;
            }
        }
    }
    
    updatePhysics(dt) {
        if (!this.mascotImg) return;
        
        const scaleDiff = this.targetScale - this.currentScale;
        if (Math.abs(scaleDiff) > 0.01) {
            this.currentScale += scaleDiff * 0.15;
        } else {
            this.currentScale = this.targetScale;
        }
        
        // Handle horizontal movement for walking/running
        if (this.state === 'walk' || this.state === 'run') {
            const baseSpeed = this.state === 'run' ? 60 : 30;
            const speed = baseSpeed * this.speedMultiplier;
            this.positionX += this.direction * speed * dt;
            
            if (this.positionX > 82) {
                this.positionX = 82;
                this.direction = -1;
            } else if (this.positionX < 18) {
                this.positionX = 18;
                this.direction = 1;
            }
        }
        
        // Handle jumping parabolic physics
        if (this.state === 'jump') {
            const jumpDuration = 0.6;
            const progress = Math.min(this.stateTime / jumpDuration, 1.0);
            const height = Math.sin(progress * Math.PI) * 90;
            this.positionY = 30 + height;
            
            const speed = 25 * this.speedMultiplier;
            this.positionX += this.direction * speed * dt;
            if (this.positionX > 82) this.positionX = 82;
            if (this.positionX < 18) this.positionX = 18;
        } 
        // Handle climbing vertical physics
        else if (this.state === 'climb') {
            const climbDuration = 1.0;
            const progress = Math.min(this.stateTime / climbDuration, 1.0);
            const height = Math.sin(progress * Math.PI) * 50;
            this.positionY = 30 + height;
        } 
        // Handle pushing physics
        else if (this.state === 'push') {
            const speed = 10 * this.speedMultiplier;
            this.positionX += this.direction * speed * dt;
            if (this.positionX > 82) this.positionX = 82;
            if (this.positionX < 18) this.positionX = 18;
            this.positionY = 30;
        }
        // Handle pulling physics
        else if (this.state === 'pull') {
            const speed = -10 * this.speedMultiplier;
            this.positionX += this.direction * speed * dt;
            if (this.positionX > 82) this.positionX = 82;
            if (this.positionX < 18) this.positionX = 18;
            this.positionY = 30;
        }
        // Base flat height
        else {
            this.positionY = 30;
        }
        
        const flip = this.direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';
        const rotate = this.state === 'spin' ? `rotate(${Math.floor(this.stateTime * 720) % 360}deg)` : 'rotate(0deg)';
        const scaleStr = `scale(${this.currentScale})`;
        
        this.mascotImg.style.left = `${this.positionX}%`;
        this.mascotImg.style.bottom = `${this.positionY}%`;
        this.mascotImg.style.transform = `translate(-50%, 0) ${flip} ${rotate} ${scaleStr}`;
        
        if (this.state === 'glow') {
            this.glowHue = (this.glowHue + dt * 180) % 360;
            this.mascotImg.style.filter = `drop-shadow(0 0 15px hsl(${this.glowHue}, 100%, 50%))`;
        } else {
            this.mascotImg.style.filter = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.25))';
        }
    }
    
    runSequence(command, duration, speedMultiplier = 1.0) {
        this.state = command;
        this.stateTime = 0;
        this.frameTime = 0;
        this.currentFrame = 0;
        this.speedMultiplier = speedMultiplier;
        
        this.updateFrame();
        
        return new Promise(resolve => {
            setTimeout(() => {
                this.state = 'idle';
                this.stateTime = 0;
                this.frameTime = 0;
                this.currentFrame = 0;
                this.updateFrame();
                resolve();
            }, duration * 1000 * speedMultiplier);
        });
    }
    
    destroy() {
        if (this.animId) {
            cancelAnimationFrame(this.animId);
        }
    }
}

const codeChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789(){}[]<>;:,._-+=!@#$%^&*|\\/\"'`~?";
const scannerLeft = window.innerWidth / 2 - 2;
const scannerRight = window.innerWidth / 2 + 2;

class CardStreamController {
    constructor() { this.container = document.getElementById("cardStream"); this.cardLine = document.getElementById("cardLine"); this.position = 0; this.velocity = 120; this.direction = -1; this.isAnimating = !0; this.isDragging = !1; this.lastTime = 0; this.lastMouseX = 0; this.mouseVelocity = 0; this.friction = 0.95; this.minVelocity = 30; this.containerWidth = 0; this.cardLineWidth = 0; this.init() }
    init() { this.populateCardLine(); this.calculateDimensions(); this.setupEventListeners(); this.updateCardPosition(); this.animate(); this.startPeriodicUpdates(); this.setupIntersectionObserver(); this.generateCodeCache() }
    generateCodeCache() { this.codeCache = []; const w = window.innerWidth < 768 ? 280 : 400; const h = window.innerWidth < 768 ? 175 : 250; const { width, height } = this.calculateCodeDimensions(w, h); for (let i = 0; i < 12; i++) { this.codeCache.push(this.generateCode(width, height)) } }
    setupIntersectionObserver() { this.isPaused = !1; const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { if (this.isPaused) { this.isPaused = !1; this.lastTime = performance.now(); this.animate() } } else { this.isPaused = !0 } }) }, { threshold: 0 }); if (this.container) observer.observe(this.container); }
    calculateDimensions() { this.containerWidth = this.container.offsetWidth; this.containerLeft = this.container.getBoundingClientRect().left; const cardWidth = window.innerWidth < 768 ? 280 : 400; const cardGap = window.innerWidth < 768 ? 30 : 60; const cardCount = this.cardWrappers ? this.cardWrappers.length : this.cardLine.children.length; this.cardLineWidth = (cardWidth + cardGap) * cardCount; this.cardTotalWidth = cardWidth + cardGap }
    setupEventListeners() {
        this.cardLine.addEventListener("mousedown", (e) => this.startDrag(e));
        document.addEventListener("mousemove", (e) => this.onDrag(e));
        document.addEventListener("mouseup", () => this.endDrag());
        
        this.cardLine.addEventListener("touchstart", (e) => {
            this.isTouchDragging = true;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.touchDirectionDetected = false;
            this.isVerticalScroll = false;
            this.startDrag(e.touches[0]);
        }, { passive: true });

        this.cardLine.addEventListener("touchmove", (e) => {
            if (!this.isTouchDragging) return;
            const touch = e.touches[0];
            
            if (!this.touchDirectionDetected) {
                const dx = Math.abs(touch.clientX - this.touchStartX);
                const dy = Math.abs(touch.clientY - this.touchStartY);
                if (dx > 5 || dy > 5) {
                    this.touchDirectionDetected = true;
                    if (dy > dx) {
                        this.isVerticalScroll = true;
                        this.isDragging = false; // Cancel dragging card stream to allow page scroll
                    }
                }
            }

            if (this.isVerticalScroll) {
                return; // Let the browser handle native page scrolling!
            }

            if (e.cancelable) {
                e.preventDefault(); // Lock page scrolling for horizontal drag
            }
            this.onDrag(touch);
        }, { passive: false });

        this.cardLine.addEventListener("touchend", () => {
            this.isTouchDragging = false;
            this.endDrag();
        });

        this.cardLine.addEventListener("selectstart", (e) => e.preventDefault());
        this.cardLine.addEventListener("dragstart", (e) => e.preventDefault());
        window.addEventListener("resize", () => this.calculateDimensions());
    }
    startDrag(e) { if (e.preventDefault) e.preventDefault(); this.isDragging = !0; this.isAnimating = !1; this.lastMouseX = e.clientX; this.mouseVelocity = 0; this.cardLine.style.animation = "none"; this.cardLine.classList.add("dragging"); document.body.style.userSelect = "none"; document.body.style.cursor = "grabbing" }
    onDrag(e) { if (!this.isDragging) return; e.preventDefault(); const deltaX = e.clientX - this.lastMouseX; this.position += deltaX; this.mouseVelocity = deltaX * 60; this.lastMouseX = e.clientX; this.cardLine.style.transform = `translateX(${this.position}px)`; this.updateCardClipping() }
    endDrag() {
        if (!this.isDragging) return; this.isDragging = !1; this.cardLine.classList.remove("dragging"); if (Math.abs(this.mouseVelocity) > this.minVelocity) { this.velocity = Math.abs(this.mouseVelocity); this.direction = this.mouseVelocity > 0 ? 1 : -1 } else { this.velocity = 120 }
        this.isAnimating = !0; document.body.style.userSelect = ""; document.body.style.cursor = ""
    }
    animate() {
        if (this.isPaused) return; const currentTime = performance.now(); const deltaTime = (currentTime - this.lastTime) / 1000; if (deltaTime > 0.1) { this.lastTime = currentTime; requestAnimationFrame(() => this.animate()); return }
        this.lastTime = currentTime; if (this.isAnimating && !this.isDragging) {
            if (this.velocity > this.minVelocity) { this.velocity *= this.friction } else { this.velocity = Math.max(this.minVelocity, this.velocity) }
            this.position += this.velocity * this.direction * deltaTime; this.updateCardPosition()
        }
        requestAnimationFrame(() => this.animate())
    }
    updateCardPosition() {
        const containerWidth = this.containerWidth; const cardLineWidth = this.cardLineWidth; if (this.position < -cardLineWidth) { this.position = containerWidth } else if (this.position > containerWidth) { this.position = -cardLineWidth }
        this.cardLine.style.transform = `translateX(${this.position}px)`; this.updateCardClipping()
    }
    toggleAnimation() { this.isAnimating = !this.isAnimating; if (this.isAnimating) { this.cardLine.style.animation = "none" } }
    resetPosition() { this.position = this.containerWidth; this.velocity = 120; this.direction = -1; this.isAnimating = !0; this.isDragging = !1; this.cardLine.style.animation = "none"; this.cardLine.style.transform = `translateX(${this.position}px)`; this.cardLine.classList.remove("dragging") }
    changeDirection() { this.direction *= -1 }
    generateCode(width, height) {
        const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min; const pick = (arr) => arr[randInt(0, arr.length - 1)]; const header = ["// compiled preview • scanner demo", "/* generated for visual effect – not executed */", "const SCAN_WIDTH = 8;", "const FADE_ZONE = 35;", "const MAX_PARTICLES = 1250;", "const TRANSITION = 0.05;",]; const helpers = ["function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }", "function lerp(a, b, t) { return a + (b - a) * t; }", "const now = () => performance.now();", "function rng(min, max) { return Math.random() * (max - min) + min; }",]; const particleBlock = (idx) => [`class Particle${idx} {`, "  constructor(x, y, vx, vy, r, a) {", "    this.x = x; this.y = y;", "    this.vx = vx; this.vy = vy;", "    this.r = r; this.a = a;", "  }", "  step(dt) { this.x += this.vx * dt; this.y += this.vy * dt; }", "}",]; const scannerBlock = ["const scanner = {", "  x: Math.floor(window.innerWidth / 2),", "  width: SCAN_WIDTH,", "  glow: 3.5,", "};", "", "function drawParticle(ctx, p) {", "  ctx.globalAlpha = clamp(p.a, 0, 1);", "  ctx.drawImage(gradient, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);", "}",]; const loopBlock = ["function tick(t) {", "  // requestAnimationFrame(tick);", "  const dt = 0.016;", "  // update & render", "}",]; const misc = ["const state = { intensity: 1.2, particles: MAX_PARTICLES };", "const bounds = { w: window.innerWidth, h: 300 };", "const gradient = document.createElement('canvas');", "const ctx = gradient.getContext('2d');", "ctx.globalCompositeOperation = 'lighter';", "// ascii overlay is masked with a 3-phase gradient",]; const library = []; header.forEach((l) => library.push(l)); helpers.forEach((l) => library.push(l)); for (let b = 0; b < 3; b++)
            particleBlock(b).forEach((l) => library.push(l)); scannerBlock.forEach((l) => library.push(l)); loopBlock.forEach((l) => library.push(l)); misc.forEach((l) => library.push(l)); for (let i = 0; i < 40; i++) { const n1 = randInt(1, 9); const n2 = randInt(10, 99); library.push(`const v${i} = (${n1} + ${n2}) * 0.${randInt(1, 9)};`) }
        for (let i = 0; i < 20; i++) { library.push(`if (state.intensity > ${1 + (i % 3)}) { scanner.glow += 0.01; }`) }
        let flow = library.join(" "); flow = flow.replace(/\s+/g, " ").trim(); const totalChars = width * height; while (flow.length < totalChars + width) { const extra = pick(library).replace(/\s+/g, " ").trim(); flow += " " + extra }
        let out = ""; let offset = 0; for (let row = 0; row < height; row++) { let line = flow.slice(offset, offset + width); if (line.length < width) line = line + " ".repeat(width - line.length); out += line + (row < height - 1 ? "\n" : ""); offset += width }
        return out
    }
    calculateCodeDimensions(cardWidth, cardHeight) { const fontSize = window.innerWidth < 768 ? 8 : 11; const lineHeight = window.innerWidth < 768 ? 10 : 13; const charWidth = window.innerWidth < 768 ? 4.5 : 6; const width = Math.floor(cardWidth / charWidth); const height = Math.floor(cardHeight / lineHeight); return { width, height, fontSize, lineHeight } }
    createCardWrapper(index) { const wrapper = document.createElement("div"); wrapper.className = "card-wrapper"; const normalCard = document.createElement("div"); normalCard.className = "card card-normal"; const baseUrl = window.BASE_URL || '/'; const cardImages = [`${baseUrl}assets/img/gallery/content1.jpg`, `${baseUrl}assets/img/gallery/content2.png`, `${baseUrl}assets/img/gallery/content3.png`, `${baseUrl}assets/img/gallery/content4.png`, `${baseUrl}assets/img/gallery/content5.png`]; const cardImage = document.createElement("img"); cardImage.className = "card-image"; cardImage.src = cardImages[index % cardImages.length]; cardImage.alt = "Service Card"; cardImage.loading = "lazy"; cardImage.decoding = "async"; cardImage.fetchpriority = "low"; const w = window.innerWidth < 768 ? 280 : 400; const h = window.innerWidth < 768 ? 175 : 250; cardImage.onerror = () => { const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h; const ctx = canvas.getContext("2d"); const gradient = ctx.createLinearGradient(0, 0, w, h); gradient.addColorStop(0, "#6694eaff"); gradient.addColorStop(1, "#714ba2ff"); ctx.fillStyle = gradient; ctx.fillRect(0, 0, w, h); cardImage.src = canvas.toDataURL() }; normalCard.appendChild(cardImage); const asciiCard = document.createElement("div"); asciiCard.className = "card card-ascii"; const asciiContent = document.createElement("div"); asciiContent.className = "ascii-content"; const { width, height, fontSize, lineHeight } = this.calculateCodeDimensions(w, h); asciiContent.style.fontSize = fontSize + "px"; asciiContent.style.lineHeight = lineHeight + "px"; asciiContent.textContent = this.generateCode(width, height); asciiCard.appendChild(asciiContent); wrapper.appendChild(normalCard); wrapper.appendChild(asciiCard); return wrapper }
    updateCardClipping() {
        const scannerX = window.innerWidth / 2; const scannerWidth = 8; const scannerLeft = scannerX - scannerWidth / 2; const scannerRight = scannerX + scannerWidth / 2; let anyScanningActive = !1; const cardWidth = window.innerWidth < 768 ? 280 : 400; const baseOffset = this.containerLeft + this.position; if (!this.cardWrappers) this.cardWrappers = Array.from(this.cardLine.children); for (let i = 0; i < this.cardWrappers.length; i++) {
            const wrapper = this.cardWrappers[i]; const cardLeft = baseOffset + (i * this.cardTotalWidth); const cardRight = cardLeft + cardWidth; if (cardLeft < scannerRight && cardRight > scannerLeft) { anyScanningActive = !0; const scannerIntersectLeft = Math.max(scannerLeft - cardLeft, 0); const scannerIntersectRight = Math.min(scannerRight - cardLeft, cardWidth); const normalClipRight = (scannerIntersectLeft / cardWidth) * 100; const asciiClipLeft = (scannerIntersectRight / cardWidth) * 100; const normalCard = wrapper.children[0]; const asciiCard = wrapper.children[1]; normalCard.style.setProperty("--clip-right", `${normalClipRight}%`); asciiCard.style.setProperty("--clip-left", `${asciiClipLeft}%`); if (!wrapper.hasAttribute("data-scanned") && scannerIntersectLeft > 0) { wrapper.setAttribute("data-scanned", "true") } } else {
                const normalCard = wrapper.children[0]; const asciiCard = wrapper.children[1]; if (cardRight < scannerLeft) { normalCard.style.setProperty("--clip-right", "100%"); asciiCard.style.setProperty("--clip-left", "100%") } else if (cardLeft > scannerRight) { normalCard.style.setProperty("--clip-right", "0%"); asciiCard.style.setProperty("--clip-left", "0%") }
                wrapper.removeAttribute("data-scanned")
            }
        }
        if (window.setScannerScanning) { window.setScannerScanning(anyScanningActive) }
    }
    updateAsciiContent() { if (this.isPaused) return; const cacheSize = this.codeCache.length; document.querySelectorAll(".ascii-content").forEach((content) => { if (Math.random() < 0.15) { const randomIdx = Math.floor(Math.random() * cacheSize); content.textContent = this.codeCache[randomIdx] } }) }
    populateCardLine() { this.cardLine.innerHTML = ""; const cardsCount = 13; this.cardWrappers = []; for (let i = 0; i < cardsCount; i++) { const cardWrapper = this.createCardWrapper(i); this.cardLine.appendChild(cardWrapper); this.cardWrappers.push(cardWrapper) } }
    startPeriodicUpdates() { setInterval(() => { this.updateAsciiContent() }, 200) }
}

let cardStream;
function toggleAnimation() { if (cardStream) { cardStream.toggleAnimation() } }
function resetPosition() { if (cardStream) { cardStream.resetPosition() } }
function changeDirection() { if (cardStream) { cardStream.changeDirection() } }

class ParticleScanner {
    constructor() { this.canvas = document.getElementById("scannerCanvas"); this.ctx = this.canvas.getContext("2d"); this.animationId = null; this.w = window.innerWidth; this.h = window.innerWidth < 768 ? 220 : 300; this.particles = []; this.count = 0; this.maxParticles = 750; this.intensity = 0.8; this.lightBarX = this.w / 2; this.lightBarWidth = 3; this.fadeZone = 60; this.scanTargetIntensity = 1.8; this.scanTargetParticles = 2500; this.scanTargetFadeZone = 35; this.scanningActive = !1; this.baseIntensity = this.intensity; this.baseMaxParticles = this.maxParticles; this.baseFadeZone = this.fadeZone; this.currentIntensity = this.intensity; this.currentMaxParticles = this.maxParticles; this.currentFadeZone = this.fadeZone; this.transitionSpeed = 0.05; this.setupCanvas(); this.createGradientCache(); this.initParticles(); this.animate(); window.addEventListener("resize", () => this.onResize()); this.setupIntersectionObserver() }
    setupIntersectionObserver() { this.isPaused = !1; const observer = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { if (this.isPaused) { this.isPaused = !1; this.lastTime = performance.now(); this.animate() } } else { this.isPaused = !0 } }) }, { threshold: 0 }); if (this.canvas) observer.observe(this.canvas); }
    setupCanvas() { this.canvas.width = this.w; this.canvas.height = this.h; this.canvas.style.width = this.w + "px"; this.canvas.style.height = this.h + "px"; this.ctx.clearRect(0, 0, this.w, this.h) }
    onResize() { this.w = window.innerWidth; this.h = window.innerWidth < 768 ? 220 : 300; this.lightBarX = this.w / 2; this.setupCanvas() }
    createGradientCache() { this.gradientCanvas = document.createElement("canvas"); this.gradientCtx = this.gradientCanvas.getContext("2d"); this.gradientCanvas.width = 16; this.gradientCanvas.height = 16; const half = this.gradientCanvas.width / 2; const gradient = this.gradientCtx.createRadialGradient(half, half, 0, half, half, half); gradient.addColorStop(0, "rgba(255, 255, 255, 1)"); gradient.addColorStop(0.3, "rgba(196, 181, 253, 0.8)"); gradient.addColorStop(0.7, "rgba(139, 92, 246, 0.4)"); gradient.addColorStop(1, "transparent"); this.gradientCtx.fillStyle = gradient; this.gradientCtx.beginPath(); this.gradientCtx.arc(half, half, half, 0, Math.PI * 2); this.gradientCtx.fill() }
    random(min, max) {
        if (arguments.length < 2) { max = min; min = 0 }
        return Math.floor(Math.random() * (max - min + 1)) + min
    }
    randomFloat(min, max) { return Math.random() * (max - min) + min }
    createParticle() { const intensityRatio = this.intensity / this.baseIntensity; const speedMultiplier = 1 + (intensityRatio - 1) * 1.2; const sizeMultiplier = 1 + (intensityRatio - 1) * 0.7; return { x: this.lightBarX + this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2), y: this.randomFloat(0, this.h), vx: this.randomFloat(0.2, 1.0) * speedMultiplier, vy: this.randomFloat(-0.15, 0.15) * speedMultiplier, radius: this.randomFloat(0.4, 1) * sizeMultiplier, alpha: this.randomFloat(0.6, 1), decay: this.randomFloat(0.005, 0.025) * (2 - intensityRatio * 0.5), originalAlpha: 0, life: 1.0, time: 0, startX: 0, twinkleSpeed: this.randomFloat(0.02, 0.08) * speedMultiplier, twinkleAmount: this.randomFloat(0.1, 0.25), } }
    initParticles() { for (let i = 0; i < this.maxParticles; i++) { const particle = this.createParticle(); particle.originalAlpha = particle.alpha; particle.startX = particle.x; this.count++; this.particles[this.count] = particle } }
    updateParticle(particle) { particle.x += particle.vx; particle.y += particle.vy; particle.time++; particle.alpha = particle.originalAlpha * particle.life + Math.sin(particle.time * particle.twinkleSpeed) * particle.twinkleAmount; particle.life -= particle.decay; if (particle.x > this.w + 10 || particle.life <= 0) { this.resetParticle(particle) } }
    resetParticle(particle) { particle.x = this.lightBarX + this.randomFloat(-this.lightBarWidth / 2, this.lightBarWidth / 2); particle.y = this.randomFloat(0, this.h); particle.vx = this.randomFloat(0.2, 1.0); particle.vy = this.randomFloat(-0.15, 0.15); particle.alpha = this.randomFloat(0.6, 1); particle.originalAlpha = particle.alpha; particle.life = 1.0; particle.time = 0; particle.startX = particle.x }
    drawParticle(particle) {
        if (particle.life <= 0) return; let fadeAlpha = 1; if (particle.y < this.fadeZone) { fadeAlpha = particle.y / this.fadeZone } else if (particle.y > this.h - this.fadeZone) { fadeAlpha = (this.h - particle.y) / this.fadeZone }
        fadeAlpha = Math.max(0, Math.min(1, fadeAlpha)); this.ctx.globalAlpha = particle.alpha * fadeAlpha; this.ctx.drawImage(this.gradientCanvas, particle.x - particle.radius, particle.y - particle.radius, particle.radius * 2, particle.radius * 2)
    }
    drawLightBar() {
        const verticalGradient = this.ctx.createLinearGradient(0, 0, 0, this.h); verticalGradient.addColorStop(0, "rgba(255, 255, 255, 0)"); verticalGradient.addColorStop(this.fadeZone / this.h, "rgba(255, 255, 255, 1)"); verticalGradient.addColorStop(1 - this.fadeZone / this.h, "rgba(255, 255, 255, 1)"); verticalGradient.addColorStop(1, "rgba(255, 255, 255, 0)"); this.ctx.globalCompositeOperation = "lighter"; const targetGlowIntensity = this.scanningActive ? 3.5 : 1; if (!this.currentGlowIntensity) this.currentGlowIntensity = 1; this.currentGlowIntensity += (targetGlowIntensity - this.currentGlowIntensity) * this.transitionSpeed; const glowIntensity = this.currentGlowIntensity; const lineWidth = this.lightBarWidth; const glow1Alpha = this.scanningActive ? 1.0 : 0.8; const glow2Alpha = this.scanningActive ? 0.8 : 0.6; const glow3Alpha = this.scanningActive ? 0.6 : 0.4; const coreGradient = this.ctx.createLinearGradient(this.lightBarX - lineWidth / 2, 0, this.lightBarX + lineWidth / 2, 0); coreGradient.addColorStop(0, "rgba(255, 255, 255, 0)"); coreGradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.9 * glowIntensity})`); coreGradient.addColorStop(0.5, `rgba(255, 255, 255, ${1 * glowIntensity})`); coreGradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.9 * glowIntensity})`); coreGradient.addColorStop(1, "rgba(255, 255, 255, 0)"); this.ctx.globalAlpha = 1; this.ctx.fillStyle = coreGradient; const radius = 15; this.ctx.beginPath(); this.ctx.roundRect(this.lightBarX - lineWidth / 2, 0, lineWidth, this.h, radius); this.ctx.fill(); const glow1Gradient = this.ctx.createLinearGradient(this.lightBarX - lineWidth * 2, 0, this.lightBarX + lineWidth * 2, 0); glow1Gradient.addColorStop(0, "rgba(139, 92, 246, 0)"); glow1Gradient.addColorStop(0.5, `rgba(196, 181, 253, ${0.8 * glowIntensity})`); glow1Gradient.addColorStop(1, "rgba(139, 92, 246, 0)"); this.ctx.globalAlpha = glow1Alpha; this.ctx.fillStyle = glow1Gradient; const glow1Radius = 25; this.ctx.beginPath(); this.ctx.roundRect(this.lightBarX - lineWidth * 2, 0, lineWidth * 4, this.h, glow1Radius); this.ctx.fill(); const glow2Gradient = this.ctx.createLinearGradient(this.lightBarX - lineWidth * 4, 0, this.lightBarX + lineWidth * 4, 0); glow2Gradient.addColorStop(0, "rgba(139, 92, 246, 0)"); glow2Gradient.addColorStop(0.5, `rgba(139, 92, 246, ${0.4 * glowIntensity})`); glow2Gradient.addColorStop(1, "rgba(139, 92, 246, 0)"); this.ctx.globalAlpha = glow2Alpha; this.ctx.fillStyle = glow2Gradient; const glow2Radius = 35; this.ctx.beginPath(); this.ctx.roundRect(this.lightBarX - lineWidth * 4, 0, lineWidth * 8, this.h, glow2Radius); this.ctx.fill(); if (this.scanningActive) { const glow3Gradient = this.ctx.createLinearGradient(this.lightBarX - lineWidth * 8, 0, this.lightBarX + lineWidth * 8, 0); glow3Gradient.addColorStop(0, "rgba(139, 92, 246, 0)"); glow3Gradient.addColorStop(0.5, "rgba(139, 92, 246, 0.2)"); glow3Gradient.addColorStop(1, "rgba(139, 92, 246, 0)"); this.ctx.globalAlpha = glow3Alpha; this.ctx.fillStyle = glow3Gradient; const glow3Radius = 45; this.ctx.beginPath(); this.ctx.roundRect(this.lightBarX - lineWidth * 8, 0, lineWidth * 16, this.h, glow3Radius); this.ctx.fill() }
        this.ctx.globalCompositeOperation = "destination-in"; this.ctx.globalAlpha = 1; this.ctx.fillStyle = verticalGradient; this.ctx.fillRect(0, 0, this.w, this.h)
    }
    render() {
        const targetIntensity = this.scanningActive ? this.scanTargetIntensity : this.baseIntensity; const targetMaxParticles = this.scanningActive ? this.scanTargetParticles : this.baseMaxParticles; const targetFadeZone = this.scanningActive ? this.scanTargetFadeZone : this.baseFadeZone; this.currentIntensity += (targetIntensity - this.currentIntensity) * this.transitionSpeed; this.currentMaxParticles += (targetMaxParticles - this.currentMaxParticles) * this.transitionSpeed; this.currentFadeZone += (targetFadeZone - this.currentFadeZone) * this.transitionSpeed; this.intensity = this.currentIntensity; this.maxParticles = Math.floor(this.currentMaxParticles); this.fadeZone = this.currentFadeZone; this.ctx.globalCompositeOperation = "source-over"; this.ctx.clearRect(0, 0, this.w, this.h); this.drawLightBar(); this.ctx.globalCompositeOperation = "lighter"; for (let i = 1; i <= this.count; i++) { if (this.particles[i]) { this.updateParticle(this.particles[i]); this.drawParticle(this.particles[i]) } }
        const currentIntensity = this.intensity; const currentMaxParticles = this.maxParticles; if (Math.random() < currentIntensity && this.count < currentMaxParticles) { const particle = this.createParticle(); particle.originalAlpha = particle.alpha; particle.startX = particle.x; this.count++; this.particles[this.count] = particle }
        const intensityRatio = this.intensity / this.baseIntensity; if (intensityRatio > 1.1 && Math.random() < (intensityRatio - 1.0) * 1.2) { const particle = this.createParticle(); particle.originalAlpha = particle.alpha; particle.startX = particle.x; this.count++; this.particles[this.count] = particle }
        if (intensityRatio > 1.3 && Math.random() < (intensityRatio - 1.3) * 1.4) { const particle = this.createParticle(); particle.originalAlpha = particle.alpha; particle.startX = particle.x; this.count++; this.particles[this.count] = particle }
        if (intensityRatio > 1.5 && Math.random() < (intensityRatio - 1.5) * 1.8) { const particle = this.createParticle(); particle.originalAlpha = particle.alpha; particle.startX = particle.x; this.count++; this.particles[this.count] = particle }
        if (intensityRatio > 2.0 && Math.random() < (intensityRatio - 2.0) * 2.0) { const particle = this.createParticle(); particle.originalAlpha = particle.alpha; particle.startX = particle.x; this.count++; this.particles[this.count] = particle }
        if (this.count > currentMaxParticles + 200) {
            const excessCount = Math.min(15, this.count - currentMaxParticles); for (let i = 0; i < excessCount; i++) { delete this.particles[this.count - i] }
            this.count -= excessCount
        }
    }
    animate() {
        if (this.isPaused) return; const now = performance.now(); const delta = (now - this.lastTime) / 1000; if (delta < 0.016) { this.animationId = requestAnimationFrame(() => this.animate()); return }
        this.lastTime = now; this.render(); this.animationId = requestAnimationFrame(() => this.animate())
    }
    startScanning() { this.scanningActive = !0 }
    stopScanning() { this.scanningActive = !1 }
    setScanningActive(active) { this.scanningActive = active }
    getStats() { return { intensity: this.intensity, maxParticles: this.maxParticles, currentParticles: this.count, lightBarWidth: this.lightBarWidth, fadeZone: this.fadeZone, scanningActive: this.scanningActive, canvasWidth: this.w, canvasHeight: this.h, } }
    destroy() {
        if (this.animationId) { cancelAnimationFrame(this.animationId) }
        this.particles = []; this.count = 0
    }
}

let particleScanner;
let nodes = [];
let gameArea;
let svgContainer;
let modalOverlay;
let modalTitle;
let modalBody;
let modalBadge;
let animationFrameId;

export function initServices() {
    initReveal();
    cardStream = new CardStreamController();

    particleScanner = new ParticleScanner();
    gameArea = document.getElementById('game-area');
    svgContainer = document.getElementById('connections-svg');
    modalOverlay = document.getElementById('info-modal');
    modalTitle = document.getElementById('modal-title');
    modalBody = document.getElementById('modal-body');
    modalBadge = document.getElementById('modal-badge');
    if (gameArea && svgContainer) {
        initNodeSystem()
    } else {
        console.error("Game Area or SVG Container not found in DOM")
    }
    window.setScannerScanning = (active) => { if (particleScanner) { particleScanner.setScanningActive(active) } };
    window.getScannerStats = () => {
        if (particleScanner) { return particleScanner.getStats() }
        return null
    };

    // Initialize papercraft path scroll logic
    initPapercraftScrollPath();
    initCardboard3DTilt();
    // initCodePlayground();

    initSyllabusExplorer();
    initMatchingWizard();
    initScratchPlayground();
    initLessonVisualizer();
    initKidsAIGallery();
}

const servicesData = [
    { id: 'ia', title: (window.SERVICES_DATA && window.SERVICES_DATA.ia.title) || 'IA<br/>Aplicada', subTitle: (window.SERVICES_DATA && window.SERVICES_DATA.ia.subTitle) || 'Automatización y Predicción', desc: (window.SERVICES_DATA && window.SERVICES_DATA.ia.desc) || 'Implementación de modelos de inteligencia artificial.', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 8V3a1 1 0 0 1 1-1h5a1 1 0 0 1 0 2H4v4a1 1 0 0 1-2 0zm1 14h5a1 1 0 0 0 0-2H4v-4a1 1 0 0 0-2 0v5a1 1 0 0 0 1 1zm18-7a1 1 0 0 0-1 1v4h-4a1 1 0 0 0 0 2h5a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1zm0-13h-5a1 1 0 0 0 0 2h4v4a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1zm-9 10a3 3 0 1 0-3-3 3 3 0 0 0 3 3zm-1 2a4 4 0 0 0-4 4h10a4 4 0 0 0-4-4z"/></svg>', x: window.innerWidth > 578 ? 0.125 : 0.05, y: 0.075 },
    { id: 'dev', title: (window.SERVICES_DATA && window.SERVICES_DATA.dev.title) || 'Desarrollo Software', subTitle: (window.SERVICES_DATA && window.SERVICES_DATA.dev.subTitle) || 'Ingeniería Robusta', desc: (window.SERVICES_DATA && window.SERVICES_DATA.dev.desc) || 'Construcción de plataformas escalables.', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7c-4.418 0-8-.895-8-2s3.582-2 8-2 8 .9 8 2-3.582 2-8 2zM4 19c0 1.105 3.582 2 8 2s8-.895 8-2v-3.81c-2.435.916-6.419 1.018-8 1.018s-5.565-.1-8-1.018zm0-6c.593.445 3.387 1.208 8 1.208s7.407-.763 8-1.208V7.7C17.845 8.78 14.4 9 12 9s-5.845-.22-8-1.3z"/></svg>', x: window.innerWidth > 578 ? 0.79 : 0.55, y: 0.075 },
    { id: 'strat', title: (window.SERVICES_DATA && window.SERVICES_DATA.strat.title) || 'Estrategia Digital', subTitle: (window.SERVICES_DATA && window.SERVICES_DATA.strat.subTitle) || 'Visión de Futuro', desc: (window.SERVICES_DATA && window.SERVICES_DATA.strat.desc) || 'Planificación tecnológica y de negocios.', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8,3V7H21L18,17H6V4H4A1,1,0,0,1,4,2H7A1,1,0,0,1,8,3ZM6,20.5A1.5,1.5,0,1,0,7.5,19,1.5,1.5,0,0,0,6,20.5Zm9,0A1.5,1.5,0,1,0,16.5,19,1.5,1.5,0,0,0,15,20.5Z"/></svg>', x: window.innerWidth > 578 ? 0.467 : 0.05, y: window.innerWidth > 578 ? 0.27 : 0.37 },
    { id: 'cro', title: (window.SERVICES_DATA && window.SERVICES_DATA.cro.title) || 'CRO', subTitle: (window.SERVICES_DATA && window.SERVICES_DATA.cro.subTitle) || 'Optimización de Conversión', desc: (window.SERVICES_DATA && window.SERVICES_DATA.cro.desc) || 'Maximización del retorno de inversión.', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M13,9h6L8,22l3-10H5L10,2h7Z"/></svg>', x: window.innerWidth > 578 ? 0.165 : 0.55, y: window.innerWidth > 578 ? 0.55 : 0.37 },
    { id: 'flow', title: (window.SERVICES_DATA && window.SERVICES_DATA.flow.title) || 'Flujos de Información', subTitle: (window.SERVICES_DATA && window.SERVICES_DATA.flow.subTitle) || 'Conectividad y Datos', desc: (window.SERVICES_DATA && window.SERVICES_DATA.flow.desc) || 'Diseño de arquitecturas de información eficientes.', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8.137 11.631a.908.908 0 0 1-.17.038A3.016 3.016 0 0 1 8 12a2.962 2.962 0 0 1-.033.328.949.949 0 0 1 .173.042l8.76 4.115a.991.991 0 0 1 .242.18A2.969 2.969 0 0 1 19 16a3.037 3.037 0 1 1-2.911 2.306c-.014-.006-.029 0-.044-.01l-8.756-4.115a.953.953 0 0 1-.134-.1 3 3 0 1 1 0-4.162 1 1 0 0 1 .133-.1L16.045 5.7c.014-.007.029 0 .044-.011A2.93 2.93 0 0 1 16 5a3 3 0 1 1 3 3 2.969 2.969 0 0 1-1.862-.665 1.03 1.03 0 0 1-.242.18z"/></svg>', x: window.innerWidth > 578 ? 0.755 : 0.55, y: window.innerWidth > 578 ? 0.55 : 0.67 },
    { id: 'ethics', title: (window.SERVICES_DATA && window.SERVICES_DATA.ethics.title) || 'Ética y Normativa', subTitle: (window.SERVICES_DATA && window.SERVICES_DATA.ethics.subTitle) || 'Compliance', desc: (window.SERVICES_DATA && window.SERVICES_DATA.ethics.desc) || 'Aseguramiento del cumplimiento legal y ético.', icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3.292 20.708a1 1 0 0 1 0-1.411l2.828-2.828a8.041 8.041 0 0 1 1.91-9.428C13.072 2 20.9 3.1 20.9 3.1s1.1 7.828-3.941 12.87a8.041 8.041 0 0 1-9.428 1.91L4.7 20.708a1 1 0 0 1-1.408 0z"/></svg>', x: window.innerWidth > 578 ? 0.467 : 0.05, y: 0.67 }
];

class Node {
    constructor(data, parents = []) {
        this.data = data; this.parents = parents.length > 0 ? parents : [this]; this.isSynergy = parents.length > 0; this.dragging = !1; this.element = this.createDOM(); const width = gameArea ? gameArea.offsetWidth : window.innerWidth; const height = gameArea ? gameArea.offsetHeight : window.innerHeight; if (data.x !== undefined && data.y !== undefined) { this.x = width * data.x; this.y = height * data.y } else { this.x = 0; this.y = 0 }
        this.width = this.element.offsetWidth; this.height = this.element.offsetHeight; if (this.width === 0) { this.width = 160; this.height = 160 }
        this.updatePosition(); this.initHammer()
    }
    createDOM() {
        const el = document.createElement('div'); el.className = 'node'; if (this.parents.length >= 6) el.classList.add('synergy-final'); else if (this.parents.length >= 3) el.classList.add('synergy-silver'); else if (this.isSynergy) el.classList.add('synergy-level-1'); const translater = document.createElement('div'); translater.className = 'card__translater'; const rotator = document.createElement('div'); rotator.className = 'card__rotator'; const front = document.createElement('div'); front.className = 'card__front'; const shine = document.createElement('div'); shine.className = 'card__shine'; const glare = document.createElement('div'); glare.className = 'card__glare'; const content = document.createElement('div'); content.className = 'card__content'; const nodeIcon = `<div class="node-icon">${this.data.icon || ''}</div>`; let titleHtml = ''; if (this.isSynergy) {
            titleHtml = `
                <div class="node-count">${this.parents.length}</div>
                <div class="node-title">${this.data.title}</div>
            `} else { titleHtml += `<div class="node-title">${this.data.title}</div>` }
        const accessBtn = document.createElement('div'); accessBtn.className = 'node-access'; accessBtn.innerText = '+'; accessBtn.addEventListener('click', (e) => { e.stopPropagation(); openModal(this) }); accessBtn.addEventListener('touchstart', (e) => { e.stopPropagation() }); const resetBtn = document.createElement('div'); resetBtn.className = 'node-reset-btn'; resetBtn.innerText = (window.SERVICES_DATA && window.SERVICES_DATA.ui.reset) || 'RESET'; resetBtn.addEventListener('click', (e) => { e.stopPropagation(); triggerReset(this) }); resetBtn.addEventListener('touchstart', (e) => { e.stopPropagation() }); content.innerHTML = nodeIcon + titleHtml; content.appendChild(accessBtn); content.appendChild(resetBtn); front.appendChild(shine); front.appendChild(glare); front.appendChild(content); rotator.appendChild(front); rotator.appendChild(front); translater.appendChild(rotator); el.appendChild(translater); gameArea.appendChild(el); this.dom = { el: el, rotator: rotator, glare: glare, shine: shine, resetBtn: resetBtn }; return el
    }
    enableReset() { if (this.dom && this.dom.resetBtn) { this.dom.resetBtn.classList.add('visible') } }
    initHammer() { const mc = new Hammer(this.element); mc.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 12 }); mc.on('panstart', (e) => { this.dragging = !0; this.startX = this.x; this.startY = this.y; anime({ targets: this.element, scale: 1.05, duration: 150, easing: 'easeOutQuad' }) }); mc.on('pan', (e) => { if (this.dragging) { this.x = this.startX + e.deltaX; this.y = this.startY + e.deltaY; this.updatePosition(); updateConnections() } }); mc.on('panend', (e) => { if (this.dragging) { this.dragging = !1; anime({ targets: this.element, scale: 1, duration: 150, easing: 'easeOutQuad' }); checkCollision(this) } }); mc.on('tap', (e) => { if (!this.dragging) openModal(this); }) }
    updatePosition() { this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)` }
    getCenter() { return { x: this.x + (this.width / 2), y: this.y + (this.height / 2) } }
    getRadius() { return this.width / 2 }
    updateDimensions() { this.width = this.element.offsetWidth; this.height = this.element.offsetHeight; const width = gameArea ? gameArea.offsetWidth : window.innerWidth; const height = gameArea ? gameArea.offsetHeight : window.innerHeight; if (this.data.x !== undefined && this.data.y !== undefined) { this.x = width * this.data.x; this.y = height * this.data.y; this.updatePosition(); if (typeof updateConnections === 'function') updateConnections(); } }
}

function checkCollision(activeNode) { const potentialTargets = nodes.filter(n => n !== activeNode && n.element.style.display !== 'none'); for (let other of potentialTargets) { const c1 = activeNode.getCenter(); const c2 = other.getCenter(); const dist = Math.hypot(c2.x - c1.x, c2.y - c1.y); const mergeDist = (activeNode.getRadius() + other.getRadius()) * 0.75; if (dist < mergeDist) { mergeNodes(activeNode, other); break } } }
function mergeNodes(nodeA, nodeB) {
    const allParents = [...nodeA.parents, ...nodeB.parents]; const c1 = nodeA.getCenter(); const c2 = nodeB.getCenter(); const midX = (c1.x + c2.x) / 2; const midY = (c1.y + c2.y) / 2; const level = allParents.length; const isFinal = level >= 6; const isMobile = window.innerWidth < 768; let newSize = isMobile ? 108 : 160; if (level === 2) newSize = isMobile ? 136 : 190; else if (level >= 3) { newSize = isMobile ? 158 * Math.pow(1.17, level - 3) : 220 * Math.pow(1.17, level - 3) }
    const newX = midX - (newSize / 2); const newY = midY - (newSize / 2); const parentIds = allParents.map(p => p.data.id).sort(); const synergyId = parentIds.join('-'); let titleText = (window.SERVICES_DATA && window.SERVICES_DATA.ui.synergy) || "Sinergia Generada"; if (isFinal) { titleText = (window.SERVICES_DATA && window.SERVICES_DATA.ui.convergence) || "Nexus" } else if (level >= 3) { titleText = (window.SERVICES_DATA && window.SERVICES_DATA.ui.convergence_generated) || "Convergencia Generada" }
    const synergyData = { id: synergyId, title: titleText, desc: (window.SERVICES_DATA && window.SERVICES_DATA.ui.convergence_desc) || "Convergencia estratégica de servicios digitales." }; anime({ targets: [nodeA.element, nodeB.element], scale: 0, opacity: 0, duration: 300, easing: 'easeInBack', complete: () => { nodeA.element.style.display = 'none'; nodeB.element.style.display = 'none'; updateConnections() } }); const newNode = new Node(synergyData, allParents); newNode.x = newX; newNode.y = newY; newNode.updatePosition(); nodes.push(newNode); updateConnections(); anime({ targets: newNode.element, scale: [0, 1], duration: 600, easing: 'easeOutElastic(1, .5)' }); if (isFinal) { showToast((window.SERVICES_DATA && window.SERVICES_DATA.ui.toast_convergence) || "Convergencia mejorada"); newNode.enableReset() } else { const synergyLabel = (window.SERVICES_DATA && window.SERVICES_DATA.ui.toast_synergy) || "Sinergia Nivel "; showToast(`${synergyLabel}${allParents.length}`) }
}
function updateConnections() {
    if (!svgContainer) return; svgContainer.innerHTML = ''; const activeNodes = nodes.filter(n => n.element.style.display !== 'none'); for (let i = 0; i < activeNodes.length; i++) {
        for (let j = i + 1; j < activeNodes.length; j++) {
            const n1 = activeNodes[i]; const n2 = activeNodes[j]; const c1 = n1.getCenter(); const c2 = n2.getCenter(); const dist = Math.hypot(c2.x - c1.x, c2.y - c1.y); const opacity = Math.max(0.1, 1 - (dist / 1200)); const weightA = n1.parents.length; const weightB = n2.parents.length; const strokeWidth = 1 + (weightA + weightB) * 1.2; const maxWeight = Math.max(weightA, weightB); let strokeColor = 'rgba(255, 255, 255, 0.3)'; if (maxWeight >= 6) { strokeColor = 'rgba(251, 191, 36, 0.7)' } else if (maxWeight >= 3) { strokeColor = 'rgba(170, 183, 197, 0.6)' }
            const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); const d = `M ${c1.x} ${c1.y} L ${c2.x} ${c2.y}`; path.setAttribute("d", d); path.setAttribute("class", "connection-line"); path.setAttribute("stroke-opacity", opacity); path.setAttribute("stroke-width", strokeWidth); path.setAttribute("stroke", strokeColor); path.setAttribute("fill", strokeColor); svgContainer.appendChild(path)
        }
    }
}
const contentCache = { es: null, en: null };
async function fetchContent(lang) {
    if (contentCache[lang]) return contentCache[lang]; const baseUrl = window.BASE_URL || '/'; try {
        const response = await fetch(`${baseUrl}assets/data/synergies_${lang}.json`); if (!response.ok) { console.warn(`Failed to load ${baseUrl}assets/data/synergies_${lang}.json`); throw new Error("Could not load content JSON") }
        const data = await response.json(); contentCache[lang] = data; return data
    } catch (e) { console.error("Error loading content:", e); return null }
}
async function openModal(node) {
    if (!modalOverlay) return; document.body.classList.add('modal-open'); modalOverlay.classList.add('active'); const currentLang = document.documentElement.lang === 'en' ? 'en' : (document.documentElement.lang === 'he' ? 'he' : 'es'); const uiData = window.SERVICES_DATA && window.SERVICES_DATA.ui; modalTitle.innerText = uiData ? uiData.loading_knowledge : "..."; modalBadge.innerText = "..."; modalBody.innerHTML = `<div style="color:white; text-align:center; padding:20px;">${uiData ? uiData.loading_knowledge : "..."}</div>`; const content = await fetchContent(currentLang); if (!content) { modalBody.innerHTML = '<p style="color:red">Error loading content.</p>'; return }
    const nodeId = node.data.id; let nodeData = null; if (!node.isSynergy) { nodeData = content.nodes[nodeId]; if (nodeData) { modalBadge.className = 'modal-badge badge-individual'; modalBadge.innerText = (uiData && uiData.base_service) || (currentLang === 'en' ? 'Core Service' : 'Servicio Base'); modalTitle.innerText = nodeData.title; modalBody.innerHTML = nodeData.content } } else {
        const isFinal = node.parents.length >= 3; nodeData = content.synergies[nodeId]; if (nodeData) {
            if (isFinal) { modalBadge.className = 'modal-badge badge-final'; modalBadge.innerText = nodeData.title.toUpperCase() } else { modalBadge.className = 'modal-badge badge-synergy'; modalBadge.innerText = (uiData && uiData.synergy_active) || (currentLang === 'en' ? 'Synergy Active' : 'Sinergia Activa') }
            modalTitle.innerText = nodeData.title; modalBody.innerHTML = nodeData.content
        } else if (isFinal) {
            modalBadge.className = 'modal-badge badge-final'; modalBadge.innerText = 'CodiCraft'; modalTitle.innerText = (uiData && uiData.total_integration) || (currentLang === 'en' ? 'Total Integration' : 'Integración Total'); modalBody.innerHTML = `
                <div class="synergy-desc-box" style="border-color: #fbbf24; background: rgba(251, 191, 36, 0.05);">
                    <p style="color: #fff;">${(uiData && uiData.nexus_desc) || (currentLang === 'en'
                    ? 'Multiple disciplines merged into a comprehensive strategy.'
                    : 'Múltiples disciplinas fusionadas en una estrategia integral.')}</p>
                </div>
            `} else { modalBadge.className = 'modal-badge badge-synergy'; modalBadge.innerText = 'Sinergia'; modalTitle.innerText = 'Fusion'; modalBody.innerHTML = '<p style="color:#fff">Sinergia compleja.</p>' }
    }
    if (node.isSynergy && node.parents) { let subTitle = (uiData && uiData.components) || (currentLang === 'en' ? 'Components:' : 'Componentes:'); let htmlList = `<h4 style="color:#fff; margin-top:20px; margin-bottom:10px; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; opacity:0.7;">${subTitle}</h4>`; htmlList += '<div class="service-list">'; node.parents.forEach(parent => { const pData = content.nodes[parent.data.id]; const pTitle = pData ? pData.title : parent.data.title; htmlList += `<div class="service-item"><span>✓</span> ${pTitle}</div>` }); htmlList += '</div>'; modalBody.innerHTML += htmlList }
}
function closeModal() { if (modalOverlay) modalOverlay.classList.remove('active'); document.body.classList.remove('modal-open'); }
function showToast(msg) { const toast = document.getElementById('toast'); if (!toast) return; document.getElementById('toast-message').innerText = msg; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 3000) }
function initNodeSystem() {
    nodes = []; if (gameArea) gameArea.innerHTML = '<svg id="connections-svg"></svg>'; svgContainer = document.getElementById('connections-svg'); servicesData.forEach(data => nodes.push(new Node(data))); if (animationFrameId) cancelAnimationFrame(animationFrameId); function animate() { updateHoloEffects(); animationFrameId = requestAnimationFrame(animate) }
    animate(); setTimeout(() => updateConnections(), 1200); const gameAreaEl = document.getElementById('game-area'); if (gameAreaEl) { window.addEventListener('mousemove', handleMouseMove); gameAreaEl.addEventListener('mouseleave', handleMouseLeave); nodes.forEach(n => n.updateDimensions()); updateGameAreaCache(); const resizeObserver = new ResizeObserver(() => { nodes.forEach(n => n.updateDimensions()); updateGameAreaCache() }); resizeObserver.observe(gameAreaEl) }
    document.querySelectorAll('.close-btn').forEach(btn => btn.addEventListener('click', closeModal)); document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); })
}
let mouseX = 0; let mouseY = 0; let globalMouseX = 0; let globalMouseY = 0; let isMouseActive = !1; let gameAreaOffsetCache = null; function updateGameAreaCache() { if (gameArea) { const rect = gameArea.getBoundingClientRect(); gameAreaOffsetCache = { left: rect.left + window.scrollX, top: rect.top + window.scrollY, width: rect.width, height: rect.height } } }
const modalDom = { wrapper: null, inited: !1 }; function initModalHolo() { if (modalDom.inited) return; const wrapper = document.querySelector('.modal-card-wrapper'); if (wrapper) { modalDom.wrapper = wrapper; modalDom.inited = !0 } }
function handleMouseMove(e) { if (!gameArea) return; if (!gameAreaOffsetCache) updateGameAreaCache(); const offsets = gameAreaOffsetCache; mouseX = e.pageX - offsets.left; mouseY = e.pageY - offsets.top; globalMouseX = e.clientX; globalMouseY = e.clientY; isMouseActive = !0 }
function handleMouseLeave() { isMouseActive = !1 }
function applyHoloToElement(element, gMouseX, gMouseY, isModal = !1, layoutData = null) {
    if (!element) return; let centerX, centerY, w, h, rectLeft, rectTop; if (layoutData) { w = layoutData.width; h = layoutData.height; centerX = layoutData.x + (w / 2); centerY = layoutData.y + (h / 2); rectLeft = layoutData.x; rectTop = layoutData.y } else { const rect = element.getBoundingClientRect(); w = rect.width; h = rect.height; rectLeft = rect.left; rectTop = rect.top; centerX = rectLeft + (w / 2); centerY = rectTop + (h / 2) }
    const distX = gMouseX - centerX; const distY = gMouseY - centerY; const dist = Math.hypot(distX, distY); const limit = isModal ? 600 : 250; if (dist > limit) { element.style.setProperty('--card-opacity', '0'); element.style.setProperty('--rotate-x', '0deg'); element.style.setProperty('--rotate-y', '0deg'); return }
    const damp = isModal ? 60 : 25; const rotateY = (distX / damp); const rotateX = -(distY / damp); const clamp = (val, min, max) => Math.min(Math.max(val, min), max); const limitDeg = isModal ? 2 : 15; const rx = clamp(rotateX, -limitDeg, limitDeg); const ry = clamp(rotateY, -limitDeg, limitDeg); const lx = gMouseX - rectLeft; const ly = gMouseY - rectTop; const px = (lx / w) * 100; const py = (ly / h) * 100; const hypot = Math.sqrt(Math.pow(px - 50, 2) + Math.pow(py - 50, 2)) / 50; let opacity = 1 - (dist / limit); if (isModal) opacity = Math.min(opacity + 0.2, 1); element.style.setProperty('--rotate-x', `${rx}deg`); element.style.setProperty('--rotate-y', `${ry}deg`); element.style.setProperty('--pointer-x', `${px}%`); element.style.setProperty('--pointer-y', `${py}%`); element.style.setProperty('--hypot', hypot); element.style.setProperty('--card-opacity', opacity.toFixed(2))
}
function updateHoloEffects() {
    if (!isMouseActive) {
        nodes.forEach(node => { if (node.dom && node.dom.el) { node.dom.el.style.setProperty('--rotate-x', '0deg'); node.dom.el.style.setProperty('--rotate-y', '0deg'); node.dom.el.style.setProperty('--card-opacity', '0') } }); if (modalDom.wrapper) { modalDom.wrapper.style.setProperty('--rotate-x', '0deg'); modalDom.wrapper.style.setProperty('--rotate-y', '0deg') }
        return
    }
    if (!gameAreaOffsetCache) updateGameAreaCache(); nodes.forEach(node => { if (!node.dom || node.element.style.display === 'none') return; const layoutData = { x: node.x, y: node.y, width: node.width, height: node.height }; applyHoloToElement(node.dom.el, mouseX, mouseY, !1, layoutData) }); if (!modalDom.inited) initModalHolo(); if (modalDom.wrapper && modalOverlay && modalOverlay.classList.contains('active')) { applyHoloToElement(modalDom.wrapper, globalMouseX, globalMouseY, !0) }
}
function triggerReset(activeNode) { const startX = activeNode.x; const startY = activeNode.y; const oldNodes = [...nodes]; nodes = []; anime({ targets: activeNode.element, scale: 0, opacity: 0, duration: 400, easing: 'easeInBack', complete: () => { if (activeNode.element.parentNode) activeNode.element.parentNode.removeChild(activeNode.element); } }); oldNodes.forEach(n => { if (n !== activeNode && n.element.parentNode) { n.element.parentNode.removeChild(n.element) } }); if (svgContainer) svgContainer.innerHTML = ''; servicesData.forEach(data => { const n = new Node(data); nodes.push(n); const targetX = n.x; const targetY = n.y; n.x = startX; n.y = startY; n.updatePosition(); anime({ targets: n, x: targetX, y: targetY, duration: 1200, delay: anime.stagger(50), easing: 'easeOutElastic(1, .6)', update: () => { n.updatePosition(); updateConnections() } }); anime({ targets: n.element, scale: [0, 1], opacity: [0, 1], duration: 800, easing: 'easeOutQuad' }) }); showToast((window.SERVICES_DATA && window.SERVICES_DATA.ui.system_restored) || "Sistema Restaurado") }

function initPapercraftScrollPath() {
    const container = document.querySelector(".scroll-path-container");
    const pathLine = document.getElementById("pathLine");
    const mascot = document.getElementById("scrollingMascot");
    const stations = document.querySelectorAll(".station-block");
    const mascotImg = mascot ? mascot.querySelector("img") : null;
    const mascotBubble = mascot ? mascot.querySelector(".mascot-bubble") : null;

    if (!container || !pathLine || !mascot) {
        console.warn("CodeCraft papercraft scroll elements not loaded yet.");
        return;
    }

    let totalLength = 0;
    try {
        totalLength = pathLine.getTotalLength();
        pathLine.style.strokeDasharray = totalLength;
        pathLine.style.strokeDashoffset = totalLength;
    } catch (e) {
        console.error("Error reading path total length:", e);
    }

    function handleScroll() {
        const rect = container.getBoundingClientRect();
        const containerHeight = rect.height;
        const containerOffsetTop = rect.top + window.scrollY;
        const viewportHeight = window.innerHeight;

        const scrollStart = containerOffsetTop - viewportHeight / 2;
        const scrollRange = containerHeight;
        const currentScroll = window.scrollY;
        
        let progress = (currentScroll - scrollStart) / scrollRange;
        progress = Math.max(0, Math.min(1, progress));

        if (totalLength > 0) {
            const currentLength = progress * totalLength;
            const point = pathLine.getPointAtLength(currentLength);
            
            const xPercent = point.x; 
            const yPixels = (point.y / 600) * containerHeight;

            mascot.style.left = `${xPercent}%`;
            mascot.style.top = `${yPixels}px`;

            let angle = 0;
            if (currentLength + 2 < totalLength) {
                const nextPoint = pathLine.getPointAtLength(currentLength + 2);
                const dx = nextPoint.x - point.x;
                const dy = nextPoint.y - point.y;
                angle = Math.atan2(dy, dx) * 180 / Math.PI - 90;
            }

            if (window.innerWidth < 768) {
                mascot.style.transform = `translate(-50%, -50%) rotate(${angle * 0.4}deg)`;
            } else {
                mascot.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
            }

            pathLine.style.strokeDashoffset = totalLength - currentLength;
        }

        let activeStationId = null;
        let activeStationEl = null;
        stations.forEach((station) => {
            const sRect = station.getBoundingClientRect();
            const elementCenter = sRect.top + sRect.height / 2;
            const viewportCenter = window.innerHeight / 2;

            if (Math.abs(elementCenter - viewportCenter) < viewportHeight / 2.5) {
                station.classList.add("active");
                activeStationId = station.id;
                activeStationEl = station;
            } else {
                station.classList.remove("active");
            }
        });

        // Dynamic pose switching based on scroll location
        if (mascotImg) {
            let targetSrc = 'assets/img/gallery/mascot_reading.png'; // Default: waving mascot (Image 5)
            if (activeStationId === 'station-minecraft') {
                targetSrc = 'assets/img/gallery/mascot_working.png'; // Image 3
            } else if (activeStationId === 'station-robotics') {
                targetSrc = 'assets/img/gallery/mascot_building.png'; // Image 4
            } else if (activeStationId === 'station-ai') {
                targetSrc = 'assets/img/gallery/mascot_ai.png'; // Image 2
            } else if (activeStationId === 'station-gamedev') {
                targetSrc = 'assets/img/gallery/mascot_gamedev.png'; // Image 1
            } else if (activeStationId === 'station-parent') {
                targetSrc = 'assets/img/gallery/mascot_reading.png'; // Image 5
            } else if (activeStationId === 'station-register') {
                targetSrc = 'assets/img/gallery/mascot_reading.png'; // Image 5
            }

            const currentSrc = mascotImg.getAttribute('src');
            const baseCurrentSrc = currentSrc ? currentSrc.split('?')[0] : '';
            if (baseCurrentSrc !== targetSrc) {
                mascotImg.src = targetSrc + '?v=' + new Date().getTime();
            }
        }

        // Dynamic balloon text speech updates in Hebrew
        if (mascotBubble) {
            let targetText = 'היי! גללו למטה 👇';
            if (activeStationId === 'station-minecraft') {
                targetText = 'איזה עולם בניתי במיינקראפט! ⛏️';
            } else if (activeStationId === 'station-robotics') {
                targetText = 'הרובוט שלי מוכן למשימה! 🤖';
            } else if (activeStationId === 'station-ai') {
                targetText = 'אימנתי מודל בינה מלאכותית! 🧠';
            } else if (activeStationId === 'station-gamedev') {
                targetText = 'בואו לשחק במשחק שלי! 🎮';
            } else if (activeStationId === 'station-parent') {
                targetText = 'עדכונים שוטפים להורים! 📱';
            } else if (activeStationId === 'station-register') {
                targetText = 'בואו לתכנת איתנו! הירשמו כאן ✨';
            }
            if (mascotBubble.textContent !== targetText) {
                mascotBubble.textContent = targetText;
            }

            // Adjust bubble side dynamically based on active card side to prevent overlapping
            if (activeStationEl) {
                if (activeStationEl.classList.contains('reverse')) {
                    // Card is on the left, so show bubble on the right
                    mascotBubble.classList.remove('bubble-left');
                } else {
                    // Card is on the right, so show bubble on the left
                    mascotBubble.classList.add('bubble-left');
                }
            } else {
                // Default: show bubble on the right
                mascotBubble.classList.remove('bubble-left');
            }
        }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
        try {
            totalLength = pathLine.getTotalLength();
            pathLine.style.strokeDasharray = totalLength;
        } catch (e) {}
        handleScroll();
    });

    setTimeout(() => {
        try {
            totalLength = pathLine.getTotalLength();
            pathLine.style.strokeDasharray = totalLength;
        } catch (e) {}
        handleScroll();
    }, 150);
}

function initCardboard3DTilt() {
    const cards = document.querySelectorAll('.station-card');
    cards.forEach(card => {
        // Create glare overlay dynamically
        let glare = card.querySelector('.card-glare-overlay');
        if (!glare) {
            glare = document.createElement('div');
            glare.className = 'card-glare-overlay';
            card.appendChild(glare);
        }

        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth < 768) return; // Disable on mobile
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const w = rect.width;
            const h = rect.height;
            
            const rotateX = -((y - h / 2) / (h / 2)) * 12; // tilt up/down
            const rotateY = ((x - w / 2) / (w / 2)) * 12; // tilt left/right
            
            const px = (x / w) * 100;
            const py = (y / h) * 100;
            
            // Apply fast transition for tracking mouse movements
            card.style.transition = 'transform 0.08s ease-out, box-shadow 0.15s ease, opacity 0.4s ease';
            card.style.setProperty('--pointer-x', `${px}%`);
            card.style.setProperty('--pointer-y', `${py}%`);
            card.style.setProperty('--glare-opacity', '0.45');
            
            const stationBlock = card.closest('.station-block');
            const isReverse = stationBlock ? stationBlock.classList.contains('reverse') : false;
            const baseRotation = isReverse ? 'rotate(1deg)' : 'rotate(-1deg)';
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03) ${baseRotation}`;
            card.style.boxShadow = `
                15px 15px 0px #8b5a2b,
                0 25px 45px rgba(0,0,0,0.15)
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            // Restore slow transition for scroll fold-out
            card.style.transition = 'transform 0.6s cubic-bezier(0.25, 1, 0.25, 1), box-shadow 0.6s ease, opacity 0.6s ease';
            
            const stationBlock = card.closest('.station-block');
            const isReverse = stationBlock ? stationBlock.classList.contains('reverse') : false;
            const baseRotation = isReverse ? 'rotate(1deg)' : 'rotate(-1deg)';
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) ${baseRotation}`;
            card.style.setProperty('--glare-opacity', '0');
            
            const isActive = stationBlock ? stationBlock.classList.contains('active') : false;
            if (isActive) {
                card.style.boxShadow = `
                    10px 10px 0px #8b5a2b,
                    0 15px 35px rgba(0,0,0,0.08)
                `;
            } else {
                card.style.boxShadow = `
                    6px 6px 0px #e0dbbd,
                    0 10px 25px rgba(0,0,0,0.05)
                `;
            }
        });
    });
}

function initCodePlayground() {
    const codingWorkspace = document.getElementById('codingWorkspace');
    const blocksShelf = document.getElementById('blocksShelf');
    const canvas = document.getElementById('playground2DStage');
    const mascotSpeech = document.getElementById('mascotSpeech');
    const runCodeBtn = document.getElementById('runCodeBtn');
    const resetPlaygroundBtn = document.getElementById('resetPlaygroundBtn');
    const clearWorkspaceBtn = document.getElementById('clearWorkspaceBtn');

    // Mission elements
    const missionDesc = document.getElementById('missionDesc');
    const missionStatus = document.getElementById('missionStatus');
    const missionTarget = document.getElementById('missionTarget');
    const missionTabs = document.querySelectorAll('.mission-tab');

    if (!codingWorkspace || !blocksShelf || !canvas) {
        console.warn("Interactive Code Playground elements not loaded yet.");
        return;
    }

    if (window.playground3D) {
        window.playground3D.destroy();
    }
    window.playground3D = new Playground3DController('playground2DStage');

    let programStack = [];
    let draggedCommand = null;

    // Puzzle Database
    const missions = [
        {
            desc: "משימה 1: אימון בוקר! עזרו לקודי לצעוד צעד אחד קדימה ולאחר מכן לקפוץ באוויר. 🚶🦘",
            target: "הליכה ➔ קפיצה",
            solution: ["walk", "jump"],
            hint: "גררו 'הליכה' ואז 'קפיצה'!"
        },
        {
            desc: "משימה 2: הזזת מכשולים! עזרו לקודי לדחוף את התיבה ולאחר מכן למשוך את החבל. 💪🧗",
            target: "דחיפה ➔ משיכה",
            solution: ["push", "pull"],
            hint: "גררו 'דחיפה' ואז 'משיכה'!"
        },
        {
            desc: "משימה 3: הטיפוס אל הפסגה! עזרו לקודי לטפס בסולם ולחגוג את הניצחון בגדול! 🪜🏆",
            target: "טיפוס ➔ ניצחון",
            solution: ["climb", "victory"],
            hint: "גררו 'טיפוס' ואז 'ניצחון'!"
        }
    ];

    let currentMissionIdx = 0;
    let solvedMissions = [false, false, false];

    function showSpeechBubble(msg) {
        if (mascotSpeech) {
            mascotSpeech.textContent = msg;
            mascotSpeech.style.opacity = '1';
        }
    }

    function loadMission(idx) {
        currentMissionIdx = idx;
        const m = missions[idx];
        if (missionDesc) missionDesc.textContent = m.desc;
        if (missionTarget) missionTarget.textContent = `יעד: ${m.target}`;
        
        updateMissionStatusUI();

        // Update active tab styles
        missionTabs.forEach((tab, i) => {
            if (i === idx) {
                tab.classList.add('active');
                tab.style.backgroundColor = '#ffe082';
            } else {
                tab.classList.remove('active');
                tab.style.backgroundColor = '#ffffff';
            }
        });
        
        clearWorkspace();
    }

    function updateMissionStatusUI() {
        if (!missionStatus) return;
        if (solvedMissions[currentMissionIdx]) {
            missionStatus.innerHTML = '🔑 סטטוס: <span style="color: #22c55e;">🎉 פתור בהצלחה!</span>';
        } else {
            missionStatus.innerHTML = '🔑 סטטוס: <span style="color: #ef4444;">🛑 לא פתור</span>';
        }
    }

    function checkSolution() {
        const solution = missions[currentMissionIdx].solution;
        if (programStack.length !== solution.length) return false;
        for (let i = 0; i < solution.length; i++) {
            if (programStack[i] !== solution[i]) return false;
        }
        return true;
    }

    // Connect mission selection tabs
    missionTabs.forEach((tab, i) => {
        tab.onclick = () => {
            loadMission(i);
        };
    });

    const textMap = {
        idle: { text: 'מנוחה', icon: '🧍', class: 'block-idle' },
        walk: { text: 'הליכה', icon: '🚶', class: 'block-walk' },
        run: { text: 'ריצה', icon: '🏃', class: 'block-run' },
        jump: { text: 'קפיצה', icon: '🦘', class: 'block-jump' },
        crouch: { text: 'התכופפות', icon: '🧘', class: 'block-crouch' },
        push: { text: 'דחיפה', icon: '💪', class: 'block-push' },
        pull: { text: 'משיכה', icon: '🧗', class: 'block-pull' },
        climb: { text: 'טיפוס', icon: '🪜', class: 'block-climb' },
        hurt: { text: 'סחרחורת', icon: '💫', class: 'block-hurt' },
        victory: { text: 'ניצחון', icon: '🏆', class: 'block-victory' }
    };

    function addBlockToWorkspace(command) {
        if (programStack.length >= 8) {
            showSpeechBubble("הלוח מלא! מחקו קוביות כדי להוסיף חדשות. 🛑");
            return;
        }
        programStack.push(command);
        const info = textMap[command];
        const el = document.createElement('div');
        el.className = `code-block-sticker ${info.class}`;
        el.innerHTML = `<span class="block-icon">${info.icon}</span><span class="block-text">${info.text}</span>`;
        codingWorkspace.appendChild(el);
    }

    // Shelf interactions (tap to add)
    blocksShelf.addEventListener('click', (e) => {
        const block = e.target.closest('.code-block-sticker');
        if (!block) return;
        const command = block.dataset.command;
        addBlockToWorkspace(command);
    });

    // Workspace interactions (delete block)
    codingWorkspace.addEventListener('click', (e) => {
        const block = e.target.closest('.code-block-sticker');
        if (!block) return;
        const index = Array.from(codingWorkspace.children).indexOf(block);
        if (index > -1) {
            programStack.splice(index, 1);
            block.remove();
        }
    });

    // Drag and Drop support
    blocksShelf.addEventListener('dragstart', (e) => {
        const block = e.target.closest('.code-block-sticker');
        if (block) {
            draggedCommand = block.dataset.command;
            block.classList.add('dragging');
        }
    });

    blocksShelf.addEventListener('dragend', (e) => {
        const block = e.target.closest('.code-block-sticker');
        if (block) {
            block.classList.remove('dragging');
        }
    });

    codingWorkspace.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    codingWorkspace.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedCommand) {
            addBlockToWorkspace(draggedCommand);
            draggedCommand = null;
        }
    });

    // Sequenced animation triggers
    async function runCommandAnimation(command, speedMultiplier = 1.0) {
        if (!window.playground3D) {
            return new Promise(r => setTimeout(r, 600 * speedMultiplier));
        }

        let duration = 0.8;
        if (command === 'walk') {
            showSpeechBubble("הולך קדימה... 🚶");
            duration = 1.2;
        } else if (command === 'run') {
            showSpeechBubble("רץ מהר! 🏃");
            duration = 0.85;
        } else if (command === 'jump') {
            showSpeechBubble("הופסה! קופץ! 🦘");
            duration = 0.6;
        } else if (command === 'crouch') {
            showSpeechBubble("מתכופף נמוך... 🧘");
            duration = 0.8;
        } else if (command === 'push') {
            showSpeechBubble("דוחף חזק! 💪");
            duration = 1.0;
        } else if (command === 'pull') {
            showSpeechBubble("מושך בכל הכוח! 🧗");
            duration = 1.0;
        } else if (command === 'climb') {
            showSpeechBubble("מטפס למעלה! 🪜");
            duration = 1.0;
        } else if (command === 'hurt') {
            showSpeechBubble("אוי! קיבלתי מכה... 💫");
            duration = 1.2;
        } else if (command === 'victory') {
            showSpeechBubble("יש! ניצחנו! 🏆");
            duration = 1.2;
        } else if (command === 'idle') {
            showSpeechBubble("נח קצת... 🧍");
            duration = 0.8;
        }

        await window.playground3D.runSequence(command, duration, speedMultiplier);
    }

    async function runSequencer() {
        if (programStack.length === 0) {
            showSpeechBubble("הוסיפו קודם קוביות קוד כדי שאוכל לפעול! 🤖");
            if (window.playground3D) {
                window.playground3D.runSequence('idle', 0.6, 0.5);
            }
            return;
        }
        runCodeBtn.disabled = true;
        resetPlaygroundBtn.disabled = true;
        clearWorkspaceBtn.disabled = true;

        let speedMultiplier = 1.0;

        for (let i = 0; i < programStack.length; i++) {
            const command = programStack[i];
            const domBlock = codingWorkspace.children[i];
            if (domBlock) domBlock.classList.add('executing');

            await runCommandAnimation(command, speedMultiplier);

            if (domBlock) domBlock.classList.remove('executing');
        }

        const isCorrect = checkSolution();
        if (isCorrect) {
            solvedMissions[currentMissionIdx] = true;
            updateMissionStatusUI();
            showSpeechBubble("כל הכבוד! פתרתם את אתגר התכנות! 🏆🎉");
            if (window.playground3D) {
                await window.playground3D.runSequence('victory', 1.2, 1.0);
            }
            
            if (currentMissionIdx < missions.length - 1 && !solvedMissions[currentMissionIdx + 1]) {
                setTimeout(() => {
                    showSpeechBubble(`נפתחה משימה חדשה: משימה ${currentMissionIdx + 2}! 🚀`);
                }, 3200);
            }
        } else {
            showSpeechBubble(`לא בדיוק... 🥺 ${missions[currentMissionIdx].hint}`);
            if (window.playground3D) {
                await window.playground3D.runSequence('hurt', 1.2, 1.0);
            }
            setTimeout(() => {
                resetPlayground();
            }, 3500);
        }

        runCodeBtn.disabled = false;
        resetPlaygroundBtn.disabled = false;
        clearWorkspaceBtn.disabled = false;
    }

    function resetPlayground() {
        if (window.playground3D) {
            window.playground3D.state = 'idle';
            window.playground3D.stateTime = 0;
            window.playground3D.targetScale = 1.0;
            window.playground3D.speedMultiplier = 1.0;
            window.playground3D.positionX = 50;
            window.playground3D.positionY = 30;
            window.playground3D.direction = 1;
            window.playground3D.currentScale = 1.0;
            window.playground3D.currentFrame = 0;
            window.playground3D.updateFrame();
        }
        showSpeechBubble("היי! מוכנים לתכנת אותי? 🤖");
    }

    function clearWorkspace() {
        programStack = [];
        codingWorkspace.innerHTML = "";
        resetPlayground();
    }

    runCodeBtn.addEventListener('click', runSequencer);
    resetPlaygroundBtn.addEventListener('click', resetPlayground);
    clearWorkspaceBtn.addEventListener('click', clearWorkspace);

    // Initial mission load
    loadMission(0);
}
















































































































































































































































































































































































































































































































































































































































const syllabusDatabase = {
    young: {
        minecraft: [
            {
                tools: "סביבת MakeCode Blocks, פקודות תנועה בסיסיות, בניית בלוקים בקוד.",
                outcome: "סוכן (Agent) מתוכנת לניקוי ויישור שטח והנחת יסודות לבית.",
                skills: "הבנת מושג האלגוריתם, תכנון שלבים לביצוע משימה, קואורדינציה חזותית במרחב תלת-ממדי."
            },
            {
                tools: "לולאות (Loops), משתנים בסיסיים, שימוש ב-Redstone ללוגיקה.",
                outcome: "סדרת מנגנונים אוטומטיים במיינקראפט כמו חוות יבולים אוטומטית המופעלת בלחיצת כפתור אחת.",
                skills: "חשיבה מחזורית (לולאות), פירוק בעיה גדולה לתת-משימות, פתרון בעיות (Debugging)."
            },
            {
                tools: "התניות תנאי (If-Else), אירועים (Events), פקודות צ׳אט מתקדמות.",
                outcome: "טירה חכמה המגנה על עצמה - הסוכן בונה חומות באופן אוטומטי כאשר מפלצת מתקרבת, ומזמן גשר נפתח עבור השחקן.",
                skills: "תכנות מבוסס אירועים, אינטגרציה של מספר עקרונות תכנות, הצגת תוצר בפני קהל."
            }
        ],
        robotics: [
            {
                tools: "ערכות חיישנים ומנועים לצעירים, בקר תכנות חזותי.",
                outcome: "בניית רובוט מכונית בסיסי הלומד לנוע קדימה ואחורה ולפנות לפי הוראות בקוד.",
                skills: "יסודות האלקטרוניקה, הבנה של קלט-פלט בחומרה, חשיבה הנדסית מעשית."
            },
            {
                tools: "חיישני קירבה (Ultrasonic) ומנועי סרוו (Servo motors).",
                outcome: "רובוט עכביש מקרטון עם חיישן קירבה שמזהה מכשולים לפניו ועוצר או מחשב מסלול מחדש.",
                skills: "קריאת נתוני חיישנים בזמן אמת, התמודדות עם תקלות פיזיות (הנדסת מכונות), שימוש בלוגיקת השוואה."
            },
            {
                tools: "בקרים מתקדמים, לוגיקה תנאית מלאה, תכנות התנהגות מורכבת.",
                outcome: "רובוט מנווט במבוך עצמאי לחלוטין שמאתר פריטים ומחלץ אותם באמצעות זרוע מכנית קטנה.",
                skills: "תכנון פרויקט הנדסי מאפס, אינטגרציה של תוכנה וחומרה, יצירתיות ואלתור טכנולוגי."
            }
        ],
        ai: [
            {
                tools: "כלי יצירה של Google (Teachable Machine), אינטראקציית בלוקים.",
                outcome: "אפליקציה שמזהה תנועות ידיים או הבעות פנים ומגיבה בהתאם דרך המצלמה.",
                skills: "הבנת מושג ה-AI, מהו אימון מודל ואיסוף נתוני (Dataset)."
            },
            {
                tools: "מודלים של זיהוי קול ומילים (Speech Recognition blocks).",
                outcome: "עוזר קולי אישי שמגיב לפקודות קוליות ומפעיל אנימציות או משחקים על המסך.",
                skills: "עבודה עם נתוני שמע, חשיבה לוגית של זיהוי דפוסים, הבנת השפעת איכות הנתונים על המודל."
            },
            {
                tools: "אימון משולב של תמונה וקול, מחוללי אמנות חכמים מותאמים לילדים.",
                outcome: "חיית מחמד וירטואלית חכמה המזהה את מצב הרוח של הילד לפי חיוך או קול, ומנחמת או משחקת איתו בהתאם.",
                skills: "חשיבה ביקורתית על שימושי בינה מלאכותית, עיצוב חוויית משתמש אינטראקטיבית, אינטגרציית מודלים."
            }
        ],
        gamedev: [
            {
                tools: "סביבת Scratch/MakeCode Arcade, יצירת ספרייטים (Sprites) ותנועה על המסך.",
                outcome: "משחק דו-ממדי פשוט שבו דמות אוספת חפצים הנופלים מהשמיים ומקבלת נקודות.",
                skills: "קואורדינטות X ו-Y, משתני ניקוד, ניהול אירועי מקלדת/עכבר."
            },
            {
                tools: "גילוי התנגשויות (Collision detection), משתני חיים ושלבים.",
                outcome: "משחק פלטפורמה קלאסי עם מכשולים, מדרגות נעות ואויבים קטנים שצריך להימנע מהם.",
                skills: "הבנת חוקי פיזיקה בסיסיים במשחק, תכנון קושי משתנה (Game Design), לוגיקת פסילה וניצחון."
            },
            {
                tools: "שלבים מרובים, שמירת שיאים, עיצוב גרפי אישי.",
                outcome: "משחק הרפתקאות שלם בעל 3 שלבים, כולל שלב בוס סופי מאתגר עם מוזיקת רקע ואפקטים קוליים.",
                skills: "הפקת פרויקט שלם, עיצוב שלבים יצירתי, בדיקת איכות (QA) ופתרון באגים במשחקים."
            }
        ]
    },
    older: {
        minecraft: [
            {
                tools: "תכנות מונחה פקודות טקסט (JavaScript/Python preview) במיינקראפט, משתנים מתקדמים.",
                outcome: "פונקציית בנייה פרמטרית שמייצרת פירמידות או גשרים בכל גודל שהשחקן מקליד בצ׳אט.",
                skills: "מעבר מחשיבה חזותית לחשיבה אלגוריתמית מופשטת, שימוש בפרמטרים בפונקציות."
            },
            {
                tools: "לולאות מקוננות (Nested loops), מערכים (Arrays), עיבוד קלט משתמש.",
                outcome: "מחולל מבוכים תלת-ממדיים אקראיים בקוד, היוצר בכל פעם חוויית משחק שונה לגמרי.",
                skills: "הבנת מבני נתונים, לוגיקה תכנותית רב-ממדית, אופטימיזציה של ריצה."
            },
            {
                tools: "תכנות משחקי רשת מותאמים (Minigames API), אירועים מורכבים.",
                outcome: "משחק הדגל (Capture the Flag) קבוצתי בתוך מיינקראפט, המנוהל כולו על ידי קוד שסופר נקודות, מחלק ציוד ומכריז על המנצחים.",
                skills: "הנדסת תוכנה שלמה, עבודה עם פרוטוקולי אירועים, פיתוח מערכת מרובת משתמשים."
            }
        ],
        robotics: [
            {
                tools: "מיקרו-בקרים מתקדמים (Micro:bit / Arduino-like), תכנות לוגי מבוסס תנאים ומחזוריים.",
                outcome: "מערכת אזעקה ביתית חכמה עם חיישן נפח ומסך תצוגה שמציג קוד אבטחה.",
                skills: "הבנת ארכיטקטורת מחשבים, תקשורת בין רכיבים, קריאת אותות אנלוגיים ודיגיטליים."
            },
            {
                tools: "חיישני צבע, חיישני קו (IR Line trackers), מנועים מדויקים.",
                outcome: "רובוט מעקב קו אוטונומי שמסוגל לעקוב אחרי מסלולים מפותלים במהירות גבוהה ולעצור ברמזור אדום.",
                skills: "תורת הבקרה (Feedback loops), כיול חיישנים מדויק, התמודדות עם רעשי סביבה פיזיים."
            },
            {
                tools: "מודול Bluetooth/WiFi, בקרת סמארטפון, שילוב זרועות סרוו מרובות.",
                outcome: "רכב שטח רובוטי הנשלט מרחוק באפליקציה ייעודית, המצויד במצלמה קטנה ובזרוע למיון חפצים לפי צבע.",
                skills: "תקשורת אלחוטית, הנדסת מערכות מורכבות, פתרון בעיות אינטגרטיביות תחת עומס."
            }
        ],
        ai: [
            {
                tools: "אימון מודלי סיווג טקסט (NLP basics), עיבוד שפה טבעית.",
                outcome: "צ׳אטבוט תמיכה אוטומטי שמסוגל לזהות כוונות משתמש (Intent) ולסווג הודעות כחיוביות או שליליות.",
                skills: "עקרונות עיבוד שפה טבעית, יצירת עץ שיחה חכם, הבנת הטיות במודלי למידה."
            },
            {
                tools: "מודלי ראייה ממוחשבת (Computer Vision), ספריות זיהוי אובייקטים.",
                outcome: "מערכת בקרת כניסה חכמה המבוססת על זיהוי פנים או זיהוי חפצים ספציפיים (כמו עט או מפתח) כדי לפתוח שער וירטואלי.",
                skills: "הבנת עיבוד תמונה מבוסס AI, מושג רשתות נוירונים בסיסי, כיוונון סף דיוק (Confidence threshold)."
            },
            {
                tools: "שימוש ב-APIs של מודלי שפה גדולים (LLMs) וכלי אינטגרציה לפיתוח סוכנים.",
                outcome: "עוזר אישי לימודי מבוסס AI המנהל איתך דיאלוג, בוחן אותך על חומר הלימוד בבית הספר ומייצר שאלות בהתאמה אישית לרמתך.",
                skills: "הנדסת פרומפטים מורכבת, שילוב כלי AI בפיתוח תוכנה, יצירת ממשק ידידותי למשתמש."
            }
        ],
        gamedev: [
            {
                tools: "מנוע משחקים מתקדם (Construct / Unity 2D basic), שפת תסריט (Scripting).",
                outcome: "משחק יריות דו-ממדי בחלל עם אויבים הנוצרים באופן דינמי ואפקטים של חלקיקים בעת פיצוץ.",
                skills: "יצירת מופעים דינמית (Instantiating), ניהול וקטורים ותנועה פיזיקלית, מפתחות אנימציה."
            },
            {
                tools: "בינה מלאכותית של אויבים (Pathfinding / State machine).",
                outcome: "משחק זלדה-סטייל (Top-down Adventure) שבו לאויבים יש בינה מלאכותית בסיסית - הם מסיירים במסלול קבוע, ומחליטים לרדוף אחרי השחקן ברגע שהוא מתקרב.",
                skills: "אלגוריתמי ניווט ומציאת מסלולים, ניהול מצבי משחק (State management), תכנון ארכיטקטורת קוד נקייה."
            },
            {
                tools: "סאונד מתקדם, שמירת נתונים מקומית (Local Storage), עיצוב חוויית משתמש מלאה (UX).",
                outcome: "משחק תפקידים (RPG) שלם הכולל מערכת שלבים ועליית רמות לדמות, חנות לרכישת פריטים במטבעות שנאספו, ושמירת התקדמות השחקן בין הפעלות.",
                skills: "פיתוח מוצר מקצה לקצה, הנדסת מערכת מורכבת של שמירה ואחזור מידע, עיצוב מוכוון משתמש."
            }
        ]
    }
};

function initSyllabusExplorer() {
    const tabs = document.querySelectorAll('.syllabus-tab');
    const chips = document.querySelectorAll('.syllabus-chip');
    const stations = document.querySelectorAll('.syllabus-timeline-station');
    
    const toolsEl = document.getElementById('syllabus-tools');
    const outcomeEl = document.getElementById('syllabus-outcome');
    const skillsEl = document.getElementById('syllabus-skills');
    const detailsPanel = document.querySelector('.syllabus-details-panel');

    if (!toolsEl || !outcomeEl || !skillsEl) {
        console.warn("Syllabus Explorer DOM elements not found.");
        return;
    }

    let activeGrade = 'young';
    let activeCourse = 'minecraft';
    let activeStation = 0;

    function updateDisplay(animate = true) {
        const data = syllabusDatabase[activeGrade]?.[activeCourse]?.[activeStation];
        if (!data) return;

        if (animate && typeof anime !== 'undefined') {
            anime({
                targets: detailsPanel,
                opacity: [1, 0],
                translateY: [0, 10],
                duration: 150,
                easing: 'easeInQuad',
                complete: () => {
                    toolsEl.textContent = data.tools;
                    outcomeEl.textContent = data.outcome;
                    skillsEl.textContent = data.skills;
                    
                    anime({
                        targets: detailsPanel,
                        opacity: [0, 1],
                        translateY: [10, 0],
                        duration: 250,
                        easing: 'easeOutQuad'
                    });
                }
            });
        } else {
            toolsEl.textContent = data.tools;
            outcomeEl.textContent = data.outcome;
            skillsEl.textContent = data.skills;
        }
    }

    // Tabs Event Listeners
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeGrade = tab.getAttribute('data-grade');
            updateDisplay();
        });
    });

    // Chips Event Listeners
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            activeCourse = chip.getAttribute('data-course');
            updateDisplay();
        });
    });

    // Stations Event Listeners
    stations.forEach(station => {
        station.addEventListener('click', () => {
            stations.forEach(s => s.classList.remove('active'));
            station.classList.add('active');
            activeStation = parseInt(station.getAttribute('data-station'), 10);
            updateDisplay();
        });
    });

    // Initial load
    updateDisplay(false);
}


function initMatchingWizard() {
    const wizardStartBtn = document.getElementById('wizard-start-btn');
    const wizardResetBtn = document.getElementById('wizard-reset-btn');
    const optionBtns = document.querySelectorAll('.wizard-option-btn');
    
    const wizardShowSyllabusBtn = document.getElementById('wizard-show-syllabus-btn');
    const wizardRegisterBtn = document.getElementById('wizard-register-btn');
    
    const wizardMascotImg = document.getElementById('wizard-mascot-img');
    const wizardBubble = document.querySelector('.wizard-bubble');
    
    const resultTitle = document.getElementById('wizard-result-title');
    const resultDesc = document.getElementById('wizard-result-desc');

    if (!wizardStartBtn || !wizardMascotImg || !wizardBubble) {
        console.warn("Matching Wizard elements not found.");
        return;
    }

    let answers = {
        grade: '',
        interest: '',
        goal: ''
    };

    let currentStep = 0;

    const stepsData = {
        0: {
            img: "assets/img/gallery/mascot_reading.png",
            text: "היי! בואו נתאים את החוג המושלם לילדכם!"
        },
        1: {
            img: "assets/img/gallery/mascot_pointer.png",
            text: "באיזו כיתה הילד/ה שלכם לומד השנה? 🎒"
        },
        2: {
            img: "assets/img/gallery/mascot_pointer.png", // pointer stick
            text: "מה הכי מעניין אותו או אותה לעשות בזמנם הפנוי? 🤔"
        },
        3: {
            img: "assets/img/gallery/mascot_sitting_laptop.png",
            text: "מהו היעד החינוכי שהכי חשוב לכם לפתח? 🎯"
        },
        4: {
            img: "assets/img/gallery/mascot_robot_walk.png",
            text: "מצאתי! יש לי המלצה מעולה בשבילכם! 🎉"
        }
    };

    function updateMascotUI(step) {
        const info = stepsData[step];
        if (!info) return;

        wizardBubble.textContent = info.text;
        
        // Bounce animation on mascot image and bubble on change
        anime({
            targets: [wizardMascotImg, wizardBubble],
            scale: [0.9, 1],
            opacity: [0.7, 1],
            duration: 300,
            easing: 'easeOutBack'
        });

        // Set src
        const baseUrl = window.BASE_URL || '/';
        wizardMascotImg.src = baseUrl + info.img;
    }

    function showStep(stepIndex) {
        const currentStepEl = document.getElementById(`wizard-step-${currentStep}`);
        const nextStepEl = document.getElementById(`wizard-step-${stepIndex}`);
        
        if (currentStepEl && nextStepEl) {
            // Slide transition out-then-in
            anime({
                targets: currentStepEl,
                opacity: 0,
                translateX: currentStep < stepIndex ? -30 : 30,
                duration: 200,
                easing: 'easeInQuad',
                complete: () => {
                    currentStepEl.style.display = 'none';
                    nextStepEl.style.display = 'block';
                    nextStepEl.style.opacity = '0';
                    nextStepEl.style.transform = `translateX(${currentStep < stepIndex ? '30px' : '-30px'})`;
                    
                    anime({
                        targets: nextStepEl,
                        opacity: 1,
                        translateX: 0,
                        duration: 300,
                        easing: 'easeOutQuad'
                    });
                    
                    currentStep = stepIndex;
                    updateMascotUI(stepIndex);
                    
                    if (stepIndex === 4) {
                        calculateRecommendation();
                    }
                }
            });
        }
    }

    function calculateRecommendation() {
        const courseData = {
            minecraft: {
                title: "מיינקראפט קודינג (Minecraft Coding)",
                desc: "בנינו עבור ילדכם תוכנית ייחודית המנצלת את עולם מיינקראפט ללמידת תכנות אמיתי. הילדים יתכנתו סוכן (Agent) וילמדו עקרונות לוגיים מורכבים כמו לולאות, משתנים ותנאים.",
                goals: {
                    logic: "חוג זה מתמקד במיוחד בפיתוח לוגיקה הנדסית, פירוק בעיות גדולות לתתי-משימות והבנת אלגוריתמים.",
                    creative: "חוג זה מעודד בנייה יצירתית יוצאת דופן בקוד ותכנון מבנים גיאומטריים מורכבים במרחב תלת-ממדי.",
                    confidence: "הלמידה המשותפת והשיתופיות בעולם המשחק תסייע לילדכם לרכוש ביטחון עצמי גבוה ולפתח כישורי שיתוף פעולה."
                }
            },
            robotics: {
                title: "רובוטיקה מעשית (Practical Robotics)",
                desc: "מסלול הנדסי מלהיב המחבר בין קוד לחומרה פיזית. ילדכם יבנה רובוטים מקרטון, יחבר מנועים וחיישנים, וילמד לשלוט בהם ולהנחות אותם באמצעות קוד.",
                goals: {
                    logic: "חוג זה יסייע לילדכם להבין מערכות בקרה מורכבות וחוגי משוב (Feedback loops) פיזיים ודיגיטליים כאחד.",
                    creative: "חוג זה ישלב יצירתיות ואלתור הנדסי בבניית גופים מחומרים זמינים, גזירה והרכבה פיזית.",
                    confidence: "העבודה הצוותית על אתגרי רובוטיקה וניווט תסייע בפיתוח כישורי פתרון בעיות משותפים וביטחון עצמי בקבוצה."
                }
            },
            ai: {
                title: "בינה מלאכותית (AI Tech)",
                desc: "הבנת הטכנולוגיה המשפיעה ביותר בעולם כיום. ילדכם ילמד לאמן מודלים של למידת מכונה, לעבוד עם מודלי שפה, זיהוי קולי וראייה ממוחשבת.",
                goals: {
                    logic: "החוג מעניק הבנה עמוקה של למידת מכונה וכיצד מודלי בינה מלאכותית מקבלים החלטות על סמך נתונים.",
                    creative: "החוג יתמקד ביצירתיות עם פרומפטים, יצירת אמנות בינה מלאכותית וכתיבת עוזרים קוליים מקוריים.",
                    confidence: "הבנת הטכנולוגיה החדשנית תעניק לילדכם ביטחון והובלה דיגיטלית בקרב קבוצת השבים שלו."
                }
            },
            gamedev: {
                title: "פיתוח משחקים (Game Dev)",
                desc: "מצרכן ליוצר! ילדכם יפתח משחקי מחשב משל עצמו, יגדיר חוקים ופיזיקה, יעצב שלבים ומכניקות משחק מלהיבות.",
                goals: {
                    logic: "חוג זה מפתח חשיבה לוגית קיצונית, ארכיטקטורת תוכנה וניהול מצבי משחק (State Management) מורכבים.",
                    creative: "הילדים יעצבו את הדמויות, השלבים, האפקטים המוזיקליים וחוויית המשתמש המלאה של המשחק.",
                    confidence: "פרסום המשחקים והצגתם בפני חברים והורים יעניקו לילדכם תחושת מסוגלות אדירה וגאווה ביצירתו."
                }
            }
        };

        const rec = courseData[answers.interest] || courseData.minecraft;
        const gradeText = answers.grade === 'young' ? 'כיתות ב׳-ג׳ (גילאי 7-9)' : 'כיתות ד׳-ו׳ (גילאי 10-12)';
        
        resultTitle.innerHTML = `${rec.title} – קבוצת ${gradeText}`;
        resultDesc.innerHTML = `${rec.desc}<br/><br/><strong>התאמה למטרות שלכם:</strong> ${rec.goals[answers.goal] || ''}`;
    }

    // Button event wiring
    wizardStartBtn.addEventListener('click', () => {
        answers = { grade: '', interest: '', goal: '' };
        showStep(1);
    });

    optionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const stepWrapper = btn.closest('.wizard-step');
            if (!stepWrapper) return;
            
            const stepId = stepWrapper.id;
            const val = btn.getAttribute('data-val');
            
            if (stepId === 'wizard-step-1') {
                answers.grade = val;
                showStep(2);
            } else if (stepId === 'wizard-step-2') {
                answers.interest = val;
                showStep(3);
            } else if (stepId === 'wizard-step-3') {
                answers.goal = val;
                showStep(4);
            }
        });
    });

    wizardResetBtn.addEventListener('click', () => {
        answers = { grade: '', interest: '', goal: '' };
        showStep(0);
    });

    // Wire Result Action Buttons
    wizardShowSyllabusBtn.addEventListener('click', () => {
        const syllabusSection = document.getElementById('station-syllabus');
        if (syllabusSection) {
            syllabusSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Switch tab
            const tabBtn = document.querySelector(`.syllabus-tab[data-grade="${answers.grade}"]`);
            if (tabBtn) tabBtn.click();

            // Switch course chip
            const chipBtn = document.querySelector(`.syllabus-chip[data-course="${answers.interest}"]`);
            if (chipBtn) chipBtn.click();
        }
    });

    wizardRegisterBtn.addEventListener('click', () => {
        const registerSection = document.getElementById('station-register');
        if (registerSection) {
            registerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Autofill child grade selection in form
            const selectEl = document.getElementById('childGrade');
            if (selectEl) {
                if (answers.grade === 'young') {
                    selectEl.value = 'b'; // Select class B
                } else {
                    selectEl.value = 'd'; // Select class D
                }
                // Trigger change event if form listener requires it
                selectEl.dispatchEvent(new Event('change'));
            }
        }
    });
}

/* =================================================================
   SCRATCH TO CODE PLAYGROUND LOGIC
   ================================================================= */
export function initScratchPlayground() {
    const playGrid = document.getElementById('play-grid');
    const queueBox = document.getElementById('playground-queue');
    const runBtn = document.getElementById('play-run-btn');
    const clearBtn = document.getElementById('play-clear-btn');
    const cmdBtns = document.querySelectorAll('.block-cmd-btn');
    const consoleOutput = document.getElementById('console-code-output');

    if (!playGrid || !queueBox || !runBtn || !clearBtn) {
        console.warn("Scratch Playground DOM elements not found.");
        return;
    }

    // Grid path configuration
    const startRow = 4, startCol = 0;
    const targetRow = 0, targetCol = 4;
    const obstacleRow = 2, obstacleCol = 2;
    
    const pathCells = [
        '4,0', '3,0', '2,0', '2,1', '2,2', '2,3', '2,4', '1,4', '0,4'
    ];

    let commandsQueue = [];
    let mascotPos = { row: startRow, col: startCol };
    let mascotDir = 'up'; // 'up', 'right', 'down', 'left'
    let isObstacleCleared = false;
    let isRunning = false;

    // Render 5x5 grid cells
    playGrid.innerHTML = '';
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            const coord = `${r},${c}`;
            if (r === startRow && c === startCol) {
                cell.classList.add('cell-start');
            } else if (r === targetRow && c === targetCol) {
                cell.classList.add('cell-target');
            } else if (r === obstacleRow && c === obstacleCol) {
                cell.classList.add('cell-obstacle');
            } else if (pathCells.includes(coord)) {
                cell.classList.add('cell-path');
            }
            playGrid.appendChild(cell);
        }
    }

    // Add mascot avatar inside play-grid
    const mascotAvatar = document.createElement('div');
    mascotAvatar.className = 'play-mascot-avatar';
    mascotAvatar.style.right = '0%';
    mascotAvatar.style.top = '80%'; // Row 4 (4 * 20%)
    mascotAvatar.innerHTML = `<img id="play-mascot-sprite" src="assets/img/gallery/mascot_standing_front.png" alt="Mascot">`;
    playGrid.appendChild(mascotAvatar);

    // Update mascot position styling
    function updateMascotTransform() {
        mascotAvatar.style.right = `${mascotPos.col * 20}%`;
        mascotAvatar.style.removeProperty('left');
        mascotAvatar.style.top = `${mascotPos.row * 20}%`;
        
        let rotation = 0;
        if (mascotDir === 'right') rotation = 90;
        else if (mascotDir === 'down') rotation = 180;
        else if (mascotDir === 'left') rotation = 270;
        
        const sprite = document.getElementById('play-mascot-sprite');
        if (sprite) {
            sprite.style.transform = 'rotate(0deg)';
        }
    }

    // Compile commands to Python
    function updatePythonConsole() {
        if (commandsQueue.length === 0) {
            consoleOutput.innerText = "# Python Code:\n# לחצו על פקודות למעלה כדי להתחיל";
            return;
        }
        let code = "# Python Code:\nmascot = CodiMascot()\n\n";
        commandsQueue.forEach(cmd => {
            if (cmd === 'forward') code += "mascot.move_forward()\n";
            else if (cmd === 'right') code += "mascot.turn_right()\n";
            else if (cmd === 'left') code += "mascot.turn_left()\n";
            else if (cmd === 'dig') code += "mascot.dig()\n";
        });
        consoleOutput.innerText = code;
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    // Render block in workspace
    function updateWorkspaceUI() {
        queueBox.innerHTML = '';
        if (commandsQueue.length === 0) {
            queueBox.innerHTML = '<span class="queue-placeholder">הפקודות שלכם יופיעו כאן...</span>';
            return;
        }

        commandsQueue.forEach((cmd, idx) => {
            const block = document.createElement('div');
            block.className = 'queued-block';
            
            let label = '🏃 צעד קדימה';
            if (cmd === 'right') label = '↩️ פנה ימינה';
            if (cmd === 'left') label = '↪️ פנה שמאלה';
            if (cmd === 'dig') label = '⛏️ חפור מכשול';

            block.innerHTML = `
                <span>${idx + 1}. ${label}</span>
                <button class="queued-block-remove" data-index="${idx}">&times;</button>
            `;
            queueBox.appendChild(block);
        });

        // Add delete handlers
        document.querySelectorAll('.queued-block-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (isRunning) return;
                const idx = parseInt(btn.dataset.index);
                commandsQueue.splice(idx, 1);
                updateWorkspaceUI();
                updatePythonConsole();
            });
        });
    }

    // Block button click
    cmdBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isRunning) return;
            const cmd = btn.dataset.cmd;
            if (commandsQueue.length >= 15) {
                alert('ניתן להזין עד 15 פקודות בלבד!');
                return;
            }
            commandsQueue.push(cmd);
            updateWorkspaceUI();
            updatePythonConsole();
        });
    });

    // Reset game state
    function resetPlayground() {
        mascotPos = { row: startRow, col: startCol };
        mascotDir = 'up';
        isObstacleCleared = false;
        
        // Restore obstacle cell UI
        const obsCell = playGrid.querySelector(`[data-row="${obstacleRow}"][data-col="${obstacleCol}"]`);
        if (obsCell) {
            obsCell.className = 'grid-cell cell-obstacle';
        }
        
        const sprite = document.getElementById('play-mascot-sprite');
        if (sprite) {
            sprite.src = 'assets/img/gallery/mascot_standing_front.png';
        }
        
        updateMascotTransform();
    }

    clearBtn.addEventListener('click', () => {
        if (isRunning) return;
        commandsQueue = [];
        updateWorkspaceUI();
        updatePythonConsole();
        resetPlayground();
    });

    // Run code logic
    runBtn.addEventListener('click', async () => {
        if (isRunning) return;
        if (commandsQueue.length === 0) {
            alert('בבקשה הוסיפו פקודות תחילה!');
            return;
        }

        isRunning = true;
        runBtn.disabled = true;
        clearBtn.disabled = true;
        
        resetPlayground();
        const sprite = document.getElementById('play-mascot-sprite');
        if (sprite) sprite.src = 'assets/img/gallery/mascot_standing_front.png';

        let crashed = false;
        let failReason = '';

        for (let i = 0; i < commandsQueue.length; i++) {
            const cmd = commandsQueue[i];
            
            // Highlight active block
            const blocks = queueBox.querySelectorAll('.queued-block');
            blocks.forEach((b, bIdx) => {
                if (bIdx === i) b.style.borderColor = '#22c55e';
                else b.style.borderColor = '#e65100';
            });

            await new Promise(r => setTimeout(r, 600));

            if (cmd === 'right') {
                if (mascotDir === 'up') mascotDir = 'right';
                else if (mascotDir === 'right') mascotDir = 'down';
                else if (mascotDir === 'down') mascotDir = 'left';
                else if (mascotDir === 'left') mascotDir = 'up';
                updateMascotTransform();
            } 
            else if (cmd === 'left') {
                if (mascotDir === 'up') mascotDir = 'left';
                else if (mascotDir === 'left') mascotDir = 'down';
                else if (mascotDir === 'down') mascotDir = 'right';
                else if (mascotDir === 'right') mascotDir = 'up';
                updateMascotTransform();
            } 
            else if (cmd === 'dig') {
                const onObstacle = (mascotPos.row === obstacleRow && mascotPos.col === obstacleCol);
                
                let nextR = mascotPos.row;
                let nextC = mascotPos.col;
                if (mascotDir === 'up') nextR--;
                else if (mascotDir === 'right') nextC--;
                else if (mascotDir === 'down') nextR++;
                else if (mascotDir === 'left') nextC++;
                
                const nextIsObstacle = (nextR === obstacleRow && nextC === obstacleCol);

                if (onObstacle || nextIsObstacle) {
                    isObstacleCleared = true;
                    const obsCell = playGrid.querySelector(`[data-row="${obstacleRow}"][data-col="${obstacleCol}"]`);
                    if (obsCell) {
                        obsCell.className = 'grid-cell cell-obstacle-cleared';
                    }
                    if (sprite) sprite.src = 'assets/img/gallery/mascot_standing_front.png';
                    await new Promise(r => setTimeout(r, 400));
                    if (sprite) sprite.src = 'assets/img/gallery/mascot_standing_front.png';
                }
            } 
            else if (cmd === 'forward') {
                let targetR = mascotPos.row;
                let targetC = mascotPos.col;

                if (mascotDir === 'up') targetR--;
                else if (mascotDir === 'right') targetC--;
                else if (mascotDir === 'down') targetR++;
                else if (mascotDir === 'left') targetC++;

                const nextCoord = `${targetR},${targetC}`;

                if (targetR < 0 || targetR > 4 || targetC < 0 || targetC > 4) {
                    crashed = true;
                    failReason = 'פגעתי בקיר הגבול!';
                    break;
                }

                if (!pathCells.includes(nextCoord)) {
                    crashed = true;
                    failReason = 'אופס! יצאתי מהשביל!';
                    break;
                }

                if (targetR === obstacleRow && targetC === obstacleCol && !isObstacleCleared) {
                    crashed = true;
                    failReason = 'יש פה מכשול סלעים! הייתי צריך לחפור קודם ⛏️';
                    break;
                }

                mascotPos.row = targetR;
                mascotPos.col = targetC;
                updateMascotTransform();
            }
        }

        await new Promise(r => setTimeout(r, 400));

        if (crashed) {
            if (sprite) sprite.src = 'assets/img/gallery/mascot_standing_front.png';
            alert(`קודי אומר: "${failReason}" בואו ננסה שוב! 🔄`);
            resetPlayground();
        } else if (mascotPos.row === targetRow && mascotPos.col === targetCol) {
            if (sprite) sprite.src = 'assets/img/gallery/mascot_standing_front.png';
            triggerVictoryConfetti();
            alert('כל הכבוד! 🎉 קודי הגיע לתיבת האוצר! כתבתם קוד פייתון אמיתי!');
        } else {
            if (sprite) sprite.src = 'assets/img/gallery/mascot_standing_front.png';
            alert('קודי אומר: "לא הגעתי לתיבה... אולי כדאי להוסיף או לתקן פקודות!"');
            resetPlayground();
        }

        const blocks = queueBox.querySelectorAll('.queued-block');
        blocks.forEach(b => b.style.borderColor = '#e65100');

        isRunning = false;
        runBtn.disabled = false;
        clearBtn.disabled = false;
    });

    function triggerVictoryConfetti() {
        const chestCell = playGrid.querySelector(`[data-row="${targetRow}"][data-col="${targetCol}"]`);
        if (!chestCell) return;
        
        const rect = chestCell.getBoundingClientRect();
        const container = document.body;
        
        const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#facc15', '#ef4444'];
        const particles = [];
        
        for (let i = 0; i < 40; i++) {
            const p = document.createElement('div');
            p.style.position = 'fixed';
            p.style.left = `${rect.left + rect.width / 2}px`;
            p.style.top = `${rect.top + rect.height / 2}px`;
            p.style.width = `${Math.random() * 8 + 6}px`;
            p.style.height = `${Math.random() * 8 + 6}px`;
            p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            p.style.borderRadius = '20%';
            p.style.zIndex = '9999';
            p.style.pointerEvents = 'none';
            container.appendChild(p);
            particles.push(p);
        }

        anime({
            targets: particles,
            translateX: () => (Math.random() - 0.5) * 200,
            translateY: () => (Math.random() - 0.5) * 200 - 100,
            scale: [1, 0],
            rotate: () => Math.random() * 360,
            opacity: [1, 0],
            duration: 1500,
            easing: 'easeOutExpo',
            complete: () => {
                particles.forEach(p => p.remove());
            }
        });
    }

    updateMascotTransform();
}

/* =================================================================
   LESSON FLOW VISUALIZER LOGIC
   ================================================================= */
export function initLessonVisualizer() {
    const stepNodes = document.querySelectorAll('.lesson-step-node');
    const titleEl = document.getElementById('lesson-step-title');
    const descEl = document.getElementById('lesson-step-desc');
    const bulletsEl = document.getElementById('lesson-step-bullets');
    const mascotImg = document.getElementById('lesson-mascot-img');
    const detailsDisplay = document.querySelector('.lesson-details-display');

    if (stepNodes.length === 0 || !titleEl || !descEl || !bulletsEl || !mascotImg) {
        console.warn("Lesson Visualizer DOM elements not found.");
        return;
    }

    const lessonSteps = [
        {
            title: "🧠 1. חימום ואתגר פתיחה (Brain Teaser)",
            time: "0-15 דקות",
            desc: "מתחילים את המפגש בפתרון חידת היגיון, אתגר קוד קצר או דיון טכנולוגי מסקרן. זה עוזר לילדים להשאיר את הטרדות של בית הספר מאחור, להתחבר לקבוצה ולהתחיל לחשוב כמו מהנדסי תוכנה!",
            bullets: [
                "חידות היגיון ולוגיקה מותאמות גיל.",
                "מעבר קצר על החומר של המפגש הקודם.",
                "חיבור החומרה והכנת סביבת העבודה."
            ],
            mascot: "assets/img/gallery/mascot_reading.png"
        },
        {
            title: "💻 2. למידה מעשית מונחית (Interactive Lab)",
            time: "15-45 דקות",
            desc: "המדריך מציג את הנושא היומי בעזרת סימולציות חזותיות, והילדים מיישמים את הקוד ישירות על פרויקטים חיים. לומדים חוקי תכנות, משתנים, תנאים ולולאות דרך בניית דוגמאות מוחשיות.",
            bullets: [
                "הדמיית מודלים וחוקי קוד בגובה העיניים.",
                "כתיבת קוד שלב-אחר-שלב בליווי צמוד.",
                "מענה לשאלות ופתרון בעיות (Debugging) בזמן אמת."
            ],
            mascot: "assets/img/gallery/mascot_board_pointing.png"
        },
        {
            title: "🛠️ 3. פיתוח פרויקט עצמאי (Creative Sandbox)",
            time: "45-80 דקות",
            desc: "השלב היצירתי של השיעור! הילדים לוקחים את הנושא שלמדו ומפתחים משחק, רובוט או יישום חכם משלהם. המדריך מלווה אותם באופן אישי ומסייע להם להביא את הרעיונות שלהם לחיים.",
            bullets: [
                "התאמה אישית של שלבים, עיצוב ומכניקות משחק.",
                "התנסות מעשית בפתרון בעיות הנדסיות.",
                "חיבור חיישנים ומנועים (בחוגי רובוטיקה)."
            ],
            mascot: "assets/img/gallery/mascot_robot_walk.png"
        },
        {
            title: "📱 4. שיתוף ועדכון הורים (Show & Tell)",
            time: "80-90 דקות",
            desc: "הילדים מציגים את התוצרים שפיתחו לחבריהם לקבוצה. בסיום השיעור, המדריך מצלם ושולח לכם סרטון או דוח קצר של הפרויקט ישירות לוואטסאפ, כדי שתוכלו לראות ולה להיות שותפים לגאווה!",
            bullets: [
                "הצגת פרויקטים ופיתוח ביטחון עצמי.",
                "משלוח סרטוני פרויקט ועדכוני התקדמות להורים.",
                "סיכום המפגש וקבלת שבבי הישגים (Badges)."
            ],
            mascot: "assets/img/gallery/mascot_sitting_laptop.png"
        }
    ];

    let currentStep = 0;
    let autoCycleTimer = null;

    function showStep(index) {
        currentStep = index;
        
        stepNodes.forEach((node, idx) => {
            if (idx === index) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });

        const stepData = lessonSteps[index];

        anime({
            targets: detailsDisplay,
            opacity: [1, 0],
            translateY: [0, -10],
            duration: 250,
            easing: 'easeInQuad',
            complete: () => {
                titleEl.innerText = stepData.title;
                descEl.innerText = stepData.desc;
                
                bulletsEl.innerHTML = '';
                stepData.bullets.forEach(b => {
                    const li = document.createElement('li');
                    li.innerText = b;
                    bulletsEl.appendChild(li);
                });

                mascotImg.src = stepData.mascot;

                anime({
                    targets: detailsDisplay,
                    opacity: [0, 1],
                    translateY: [10, 0],
                    duration: 350,
                    easing: 'easeOutQuad'
                });
            }
        });
    }

    function startAutoCycle() {
        stopAutoCycle();
        autoCycleTimer = setInterval(() => {
            let nextStep = (currentStep + 1) % lessonSteps.length;
            showStep(nextStep);
        }, 6000);
    }

    function stopAutoCycle() {
        if (autoCycleTimer) {
            clearInterval(autoCycleTimer);
            autoCycleTimer = null;
        }
    }

    stepNodes.forEach(node => {
        node.addEventListener('click', () => {
            const stepIndex = parseInt(node.dataset.step);
            stopAutoCycle();
            showStep(stepIndex);
        });
    });

    startAutoCycle();
}

export function initKidsAIGallery() {
    // 1. Comic Showcase Logic
    const comicTabs = document.querySelectorAll('.comic-tab');
    const comicViewerImg = document.getElementById('comic-viewer-img');
    const comicPageFrame = document.querySelector('.comic-page-frame');
    const comicLightbox = document.getElementById('comic-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close-btn');

    const comicImagesMap = {
        blue_hero: 'assets/img/gallery/kids_comic_blue_hero.jpg',
        superhero_school: 'assets/img/gallery/kids_comic_superhero_school_p1.jpg',
        thunder_flash: 'assets/img/gallery/kids_comic_thunder_flash_1.jpg',
        panther_mcqueen: 'assets/img/gallery/kids_comic_panther_mcqueen_cover.jpg',
        katy_cat: 'assets/img/gallery/kids_comic_katy_cat_p1.jpg'
    };

    const comicPagesMap = {
        blue_hero: ['assets/img/gallery/kids_comic_blue_hero.jpg'],
        superhero_school: [
            'assets/img/gallery/kids_comic_superhero_school_p1.jpg',
            'assets/img/gallery/kids_comic_superhero_school_p2.jpg',
            'assets/img/gallery/kids_comic_superhero_school_p3.jpg',
            'assets/img/gallery/kids_comic_superhero_school_p4.jpg'
        ],
        thunder_flash: [
            'assets/img/gallery/kids_comic_thunder_flash_1.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_2.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_3.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_4.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_5.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_6.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_7.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_8.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_9.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_10.jpg',
            'assets/img/gallery/kids_comic_thunder_flash_11.jpg'
        ],
        panther_mcqueen: [
            'assets/img/gallery/kids_comic_panther_mcqueen_cover.jpg',
            'assets/img/gallery/kids_comic_panther_mcqueen_p2.jpg',
            'assets/img/gallery/kids_comic_panther_mcqueen_p5.jpg',
            'assets/img/gallery/kids_comic_panther_mcqueen_p7.jpg',
            'assets/img/gallery/kids_comic_panther_mcqueen_p8.jpg'
        ],
        katy_cat: [
            'assets/img/gallery/kids_comic_katy_cat_p1.jpg',
            'assets/img/gallery/kids_comic_katy_cat_p2.jpg',
            'assets/img/gallery/kids_comic_katy_cat_p3.jpg',
            'assets/img/gallery/kids_comic_katy_cat_p4.jpg'
        ]
    };

    let currentLightboxPages = [];
    let currentLightboxPageIndex = 0;

    const updateLightboxImage = () => {
        if (!lightboxImg || currentLightboxPages.length === 0) return;
        lightboxImg.src = currentLightboxPages[currentLightboxPageIndex];
        
        const prevBtn = document.getElementById('lightbox-prev-btn');
        const nextBtn = document.getElementById('lightbox-next-btn');
        if (prevBtn && nextBtn) {
            if (currentLightboxPages.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
        }
    };

    if (comicTabs.length > 0 && comicViewerImg) {
        comicTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                comicTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const comicKey = tab.getAttribute('data-comic');
                const imgSrc = comicImagesMap[comicKey];
                if (imgSrc) {
                    comicViewerImg.src = imgSrc;
                }
            });
        });
    }

    if (comicPageFrame && comicLightbox && lightboxImg) {
        comicPageFrame.addEventListener('click', () => {
            const activeTab = document.querySelector('.comic-tab.active');
            const comicKey = activeTab ? activeTab.getAttribute('data-comic') : 'blue_hero';
            
            currentLightboxPages = comicPagesMap[comicKey] || [comicViewerImg.src];
            currentLightboxPageIndex = 0;
            updateLightboxImage();
            
            comicLightbox.style.display = 'flex';
            setTimeout(() => {
                comicLightbox.classList.add('active');
            }, 10);
        });

        const closeLightbox = () => {
            comicLightbox.classList.remove('active');
            setTimeout(() => {
                comicLightbox.style.display = 'none';
            }, 300);
        };

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }
        comicLightbox.addEventListener('click', (e) => {
            if (e.target === comicLightbox || e.target.classList.contains('lightbox-content-container')) {
                closeLightbox();
            }
        });

        // Next/Prev navigation listeners
        const prevBtn = document.getElementById('lightbox-prev-btn');
        const nextBtn = document.getElementById('lightbox-next-btn');
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentLightboxPages.length > 1) {
                    currentLightboxPageIndex = (currentLightboxPageIndex - 1 + currentLightboxPages.length) % currentLightboxPages.length;
                    updateLightboxImage();
                }
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (currentLightboxPages.length > 1) {
                    currentLightboxPageIndex = (currentLightboxPageIndex + 1) % currentLightboxPages.length;
                    updateLightboxImage();
                }
            });
        }
    }

    // 2. Game Modal Logic
    const gameModal = document.getElementById('game-modal');
    const gameIframe = document.getElementById('game-iframe');
    const gameCloseBtn = document.querySelector('.game-modal-close-btn');

    const openGameModal = (url) => {
        if (!gameIframe || !gameModal) return;
        gameIframe.src = url;
        gameModal.style.display = 'flex';
        setTimeout(() => {
            gameModal.classList.add('active');
        }, 10);
    };

    const closeGameModal = () => {
        if (!gameModal || !gameIframe) return;
        gameModal.classList.remove('active');
        setTimeout(() => {
            gameModal.style.display = 'none';
            gameIframe.src = '';
        }, 300);
    };

    if (gameCloseBtn) {
        gameCloseBtn.addEventListener('click', closeGameModal);
    }
    if (gameModal) {
        gameModal.addEventListener('click', (e) => {
            if (e.target === gameModal) {
                closeGameModal();
            }
        });
    }

    // 3. Stories & Games Catalog Logic
    const booksGrid = document.getElementById('books-grid');
    const loadMoreBtn = document.getElementById('load-more-books-btn');
    const filterChips = document.querySelectorAll('.filter-chip');

    if (!booksGrid || !loadMoreBtn) {
        return;
    }

    let allBooks = [];
    let filteredBooks = [];
    let displayLimit = 12;

    const getPatternClass = (pattern) => {
        if (pattern === 0) return 'stripes';
        if (pattern === 1) return 'dots';
        return 'grid';
    };

    const renderBooks = (appendOnly = false) => {
        if (!appendOnly) {
            // Prevent layout shift/scroll jumping by locking the current height
            const currentHeight = booksGrid.offsetHeight;
            if (currentHeight > 0) {
                booksGrid.style.minHeight = `${currentHeight}px`;
            }
            booksGrid.innerHTML = '';
        }

        const startIndex = appendOnly ? booksGrid.children.length : 0;
        const booksToRender = filteredBooks.slice(startIndex, displayLimit);
        
        booksToRender.forEach(book => {
            const card = document.createElement('a');
            card.className = 'book-card';
            
            if (book.category === 'game') {
                card.href = '#';
                card.title = 'לחצו כדי לשחק במשחק! 🎮';
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    openGameModal(book.url);
                });
            } else if (book.category === 'comic' && (book.url.startsWith('assets/') || book.pages)) {
                card.href = '#';
                card.title = 'לחצו לקריאה בקומיקס 📖';
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    currentLightboxPages = book.pages || [book.url];
                    currentLightboxPageIndex = 0;
                    updateLightboxImage();
                    comicLightbox.style.display = 'flex';
                    setTimeout(() => {
                        comicLightbox.classList.add('active');
                    }, 10);
                });
            } else {
                card.href = book.url;
                card.target = '_blank';
                card.title = 'לחצו לקריאה ב-Google Drive/Canva';
            }
            
            // Build dynamic text structures, hiding empty authors/grades
            const authorText = book.author ? `מאת: ${book.author}` : '';
            const coverAuthorHtml = book.author ? `<div class="book-author-text">מאת: ${book.author}</div>` : '';
            const metaAuthorHtml = book.author ? `<p class="book-meta-author">${authorText}</p>` : '';
            
            const tagText = book.gradeLabel ? `${book.gradeLabel} • ${book.categoryName}` : book.categoryName;
            
            card.innerHTML = `
                <div class="book-cover-3d" style="background-color: ${book.coverColor || '#8b5a2b'};">
                    <div class="book-cover-front pattern-${getPatternClass(book.coverPattern)}">
                        <div class="book-title-text">${book.title}</div>
                        ${coverAuthorHtml}
                     </div>
                    <div class="book-pages-side"></div>
                </div>
                <div class="book-card-meta">
                    <h5 class="book-meta-title" title="${book.title}">${book.title}</h5>
                    ${metaAuthorHtml}
                    <span class="book-meta-tag">${tagText}</span>
                </div>
            `;
            booksGrid.appendChild(card);
        });

        // Hide load more button if all books are shown
        if (displayLimit >= filteredBooks.length) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'inline-block';
        }

        if (!appendOnly) {
            // Release the height lock after browser has laid out the new cards
            // Use double requestAnimationFrame to ensure style/layout/paint are completed
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    booksGrid.style.minHeight = '';
                });
            });
        }
    };

    const applyFilter = (filterKey) => {
        if (filterKey === 'all') {
            filteredBooks = [...allBooks];
        } else if (filterKey === 'grade_young') {
            filteredBooks = allBooks.filter(b => b.gradeValue === 'b');
        } else if (filterKey === 'grade_older') {
            filteredBooks = allBooks.filter(b => b.gradeValue === 'd');
        } else if (filterKey.startsWith('cat_')) {
            const catVal = filterKey.replace('cat_', '');
            filteredBooks = allBooks.filter(b => b.category === catVal);
        }
        
        displayLimit = 12;
        renderBooks();
    };

    // Load data from JSON
    const baseUrl = window.BASE_URL || '/';
    fetch(`${baseUrl}assets/data/ai_products.json`)
        .then(res => res.json())
        .then(data => {
            allBooks = data;
            filteredBooks = [...allBooks];
            renderBooks();
        })
        .catch(err => {
            console.error('Error loading AI products JSON:', err);
        });

    // Wire filters
    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            filterChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            
            const filterKey = chip.getAttribute('data-filter');
            applyFilter(filterKey);
        });
    });

    // Wire load more
    loadMoreBtn.addEventListener('click', (e) => {
        if (e) e.preventDefault();
        displayLimit += 12;
        renderBooks(true);
    });
}
