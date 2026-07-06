import { SHAPES } from './shapes.js?v=1.0.1'; let activeShapes = SHAPES; import *as THREE from 'three'; import { OrbitControls } from 'three/addons/controls/OrbitControls.js'; import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'; import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'; import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'; import anime from 'animejs'; import { createNoise3D, createNoise4D } from 'simplex-noise'; let scene, camera, renderer, controls, clock; let composer, bloomPass; let particlesGeometry, particlesMaterial, particleSystem; let currentPositions, sourcePositions, targetPositions, swarmPositions; let particleSizes, particleOpacities, particleEffectStrengths; let noise3D, noise4D; let morphTimeline = null; let isInitialized = !1; let isMorphing = !1; let isInteractionActive = !1; let isSettled = !0; let interactionTimer = null; const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2(-9999, -9999); const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); const rayLine = new THREE.Line3(); let scrollArrowPoints; const getOptimizedParticleCount = () => { const isMobile = window.innerWidth < 768; const hardwareConcurrency = navigator.hardwareConcurrency || 3; if (isMobile) { return hardwareConcurrency <= 3 ? 4500 : 6200 } else { return hardwareConcurrency <= 3 ? 11000 : 15000 } }; const optimizedParticleCount = getOptimizedParticleCount(); const optimizedStarCount = Math.floor(optimizedParticleCount * 1.2); const getShapeSize = () => { return window.innerWidth < 768 ? 8.5 : 14 }; const CONFIG = { particleCount: optimizedParticleCount, shapeSize: getShapeSize(), swarmDistanceFactor: 2.5, swirlFactor: 4.0, noiseFrequency: 0.1, noiseTimeScale: 0.04, noiseMaxStrength: 2.8, colorScheme: 'neon', morphDuration: 4000, particleSizeRange: [0.08, 0.25], starCount: optimizedStarCount, bloomStrength: 1.3, bloomRadius: 0.5, bloomThreshold: 0.05, idleFlowStrength: 0.05, idleFlowSpeed: 0.08, idleRotationSpeed: 0.02, morphSizeFactor: 0.5, morphBrightnessFactor: 0.6, interactionRadius: 2.5, interactionStrength: 3.0 }; let currentShapeIndex = 0; const morphState = { progress: 0.0 }; let activeColorScheme; const COLOR_SCHEMES = { fire: { startHue: 0, endHue: 45, saturation: 0.95, lightness: 0.6 }, neon: { startHue: 300, endHue: 180, saturation: 1.0, lightness: 0.65 }, nature: { startHue: 90, endHue: 160, saturation: 0.85, lightness: 0.55 }, rainbow: { startHue: 0, endHue: 360, saturation: 0.9, lightness: 0.6 } }; const tempVec = new THREE.Vector3(); const sourceVec = new THREE.Vector3(); const targetVec = new THREE.Vector3(); const swarmVec = new THREE.Vector3(); const noiseOffset = new THREE.Vector3(); const flowVec = new THREE.Vector3(); const bezPos = new THREE.Vector3(); const swirlAxis = new THREE.Vector3(); const currentVec = new THREE.Vector3(); const repelVec = new THREE.Vector3(); const closestPoint = new THREE.Vector3(); function init(options = {}) {
    if (options.shapes) { activeShapes = options.shapes }
    let progress = 0; const progressBar = document.getElementById('progress'); const loadingScreen = document.getElementById('loading'); function updateProgress(increment) { progress += increment; progressBar.style.width = `${Math.min(100, progress)}%`; if (progress >= 100) { setTimeout(() => { loadingScreen.style.opacity = '0'; setTimeout(() => { loadingScreen.style.display = 'none' }, 500) }, 200) } }
    clock = new THREE.Clock(); noise3D = createNoise3D(() => Math.random()); noise4D = createNoise4D(() => Math.random()); scene = new THREE.Scene(); scene.fog = new THREE.FogExp2(0x000308, 0.09); activeColorScheme = { ...COLOR_SCHEMES[CONFIG.colorScheme] }; updateUIColors(); updateProgress(5); camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000); camera.position.set(0, 8, 5); camera.lookAt(scene.position); updateProgress(5); const canvas = document.getElementById('webglCanvas'); renderer = new THREE.WebGLRenderer({ canvas, antialias: !0, alpha: !0, powerPreference: 'high-performance' }); renderer.setSize(window.innerWidth, window.innerHeight); renderer.setPixelRatio(window.innerWidth < 768 ? 1.0 : Math.min(window.devicePixelRatio, 2)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1; updateProgress(10); controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = !0; controls.dampingFactor = 0.05; controls.minDistance = 5; controls.maxDistance = 80; controls.autoRotate = !0; controls.autoRotateSpeed = 0.3; updateProgress(5); scene.add(new THREE.AmbientLight(0x004060)); const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.5); dirLight1.position.set(15, 20, 10); scene.add(dirLight1); const dirLight2 = new THREE.DirectionalLight(0x88aaff, 0.9); dirLight2.position.set(-15, -10, -15); updateProgress(10); setupPostProcessing(); updateProgress(10); createStarfield(); updateProgress(15); setupParticleSystem(); updateProgress(25); window.addEventListener('resize', onWindowResize); window.addEventListener('click', onCanvasClick); updateProgress(15); setupInteraction(); isInitialized = !0; controls.enabled = !1; const initialAspect = window.innerWidth / window.innerHeight; const targetZ = initialAspect >= 1.25 ? 28 : Math.min(45, 28 * (1.25 / Math.max(0.65, initialAspect))); anime({ targets: camera.position, z: targetZ, y: 8, duration: 3500, easing: 'easeOutCubic', update: () => camera.lookAt(scene.position), complete: () => { controls.enabled = !0 } }); animate(); return { scene, camera, renderer, controls }
}
function setupInteraction() { window.addEventListener('mousemove', (event) => { mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; isInteractionActive = !0; isSettled = !1; clearTimeout(interactionTimer); interactionTimer = setTimeout(() => { isInteractionActive = !1 }, 2000) }); const hammer = new Hammer(document.body); hammer.get('pan').set({ direction: Hammer.DIRECTION_ALL }); hammer.on('pan', (ev) => { mouse.x = (ev.center.x / window.innerWidth) * 2 - 1; mouse.y = -(ev.center.y / window.innerHeight) * 2 + 1; isInteractionActive = !0; isSettled = !1; clearTimeout(interactionTimer); interactionTimer = setTimeout(() => { isInteractionActive = !1 }, 2000) }); hammer.on('panend', () => { }) }
function setupPostProcessing() { composer = new EffectComposer(renderer); composer.addPass(new RenderPass(scene, camera)); const isMobile = window.innerWidth < 768; if (!isMobile) { bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), CONFIG.bloomStrength, CONFIG.bloomRadius, CONFIG.bloomThreshold); composer.addPass(bloomPass) } }
function createCodeCharTexture(char) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, size);

    // Light neon blue/cyan shadow glow matching the theme
    ctx.shadowColor = '#00ffea';
    ctx.shadowBlur = 12;

    // Bold tech font
    ctx.font = 'bold 58px "Courier New", Courier, monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, size / 2, size / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

function createStarfield() {
    const codingChars = ['{', '}', '[', ']', '</>', 'if', 'var', '=>', 'let', 'const', 'JSON', 'AI'];
    const numGroups = codingChars.length;
    const starsPerGroup = Math.floor(CONFIG.starCount / numGroups);

    for (let g = 0; g < numGroups; g++) {
        const starVertices = [];
        const starSizes = [];
        const starColors = [];
        const starGeometry = new THREE.BufferGeometry();

        for (let i = 0; i < starsPerGroup; i++) {
            tempVec.set(THREE.MathUtils.randFloatSpread(400), THREE.MathUtils.randFloatSpread(400), THREE.MathUtils.randFloatSpread(400));
            if (tempVec.length() < 100) tempVec.setLength(100 + Math.random() * 300);
            
            starVertices.push(tempVec.x, tempVec.y, tempVec.z);
            // Code characters need to be slightly larger to be visible, scaled up:
            starSizes.push(Math.random() * 0.35 + 0.15);

            const color = new THREE.Color();
            if (Math.random() < 0.15) {
                // HSL random neon accents
                color.setHSL(Math.random(), 0.9, 0.6);
            } else {
                // HSL deep cyans/blues matching CodiCraft UI
                color.setHSL(0.52 + Math.random() * 0.08, 0.85, 0.65 + Math.random() * 0.15);
            }
            starColors.push(color.r, color.g, color.b);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

        const charTexture = createCodeCharTexture(codingChars[g]);
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: { pointTexture: { value: charTexture } },
            vertexShader: `
                attribute float size; varying vec3 vColor;
                void main() {
                    vColor = color; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (450.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition;
                }`,
            fragmentShader: `
                uniform sampler2D pointTexture; varying vec3 vColor;
                void main() {
                    float alpha = texture2D(pointTexture, gl_PointCoord).a; if (alpha < 0.15) discard;
                    gl_FragColor = vec4(vColor, alpha * 0.95);
                }`,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });

        scene.add(new THREE.Points(starGeometry, starMaterial));
    }
}

function createStarTexture() { const size = 64; const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size; const context = canvas.getContext('2d'); const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2); gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)'); gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)'); gradient.addColorStop(1, 'rgba(255, 255, 255, 0)'); context.fillStyle = gradient; context.fillRect(0, 0, size, size); return new THREE.CanvasTexture(canvas) }
function setupParticleSystem() {
    targetPositions = activeShapes.map(shape => shape.generator(CONFIG.particleCount, CONFIG.shapeSize)); particlesGeometry = new THREE.BufferGeometry(); currentPositions = new Float32Array(targetPositions[0]); sourcePositions = new Float32Array(targetPositions[0]); swarmPositions = new Float32Array(CONFIG.particleCount * 3); particlesGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3)); particleSizes = new Float32Array(CONFIG.particleCount); particleOpacities = new Float32Array(CONFIG.particleCount); particleEffectStrengths = new Float32Array(CONFIG.particleCount); for (let i = 0; i < CONFIG.particleCount; i++) { particleSizes[i] = THREE.MathUtils.randFloat(CONFIG.particleSizeRange[0], CONFIG.particleSizeRange[1]); particleOpacities[i] = 1.0; particleEffectStrengths[i] = 0.0 }
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1)); particlesGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1)); particlesGeometry.setAttribute('aEffectStrength', new THREE.BufferAttribute(particleEffectStrengths, 1)); const colors = new Float32Array(CONFIG.particleCount * 3); updateColorArray(colors, currentPositions); particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); particlesMaterial = new THREE.ShaderMaterial({
        uniforms: { pointTexture: { value: createStarTexture() }, uTime: { value: 0 }, uFlowSpeed: { value: CONFIG.idleFlowSpeed }, uFlowStrength: { value: CONFIG.idleFlowStrength } }, vertexShader: `
            attribute float size;
            attribute float opacity;
            attribute float aEffectStrength;
            varying vec3 vColor;
            varying float vOpacity;
            varying float vEffectStrength;
            uniform float uTime;
            uniform float uFlowSpeed;
            uniform float uFlowStrength;

            // Simple 3D noise for shader (lighter than Simplex)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            
            float snoise(vec3 v) {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

                // First corner
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;

                // Other corners
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );

                //   x0 = x0 - 0.0 + 0.0 * C.xxx;
                //   x1 = x0 - i1  + 1.0 * C.xxx;
                //   x2 = x0 - i2  + 2.0 * C.xxx;
                //   x3 = x0 - 1.0 + 3.0 * C.xxx;
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
                vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

                // Permutations
                i = mod289(i);
                vec4 p = permute( permute( permute(
                            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

                // Gradients: 7x7 points over a square, mapped onto an octahedron.
                // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
                float n_ = 0.142857142857; // 1.0/7.0
                vec3  ns = n_ * D.wyz - D.xzx;

                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);

                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );

                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));

                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);

                //Normalise gradients
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;

                // Mix final noise value
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                            dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                vColor = color;
                vOpacity = opacity;
                vEffectStrength = aEffectStrength;

                vec3 pos = position;

                // GPU Idle Animation (Flow/Breath)
                // Only apply if NOT morphing heavily (optional, but cleaner)
                // We use calculate noise based on position and time
                
                float time = uTime * uFlowSpeed;
                float noiseVal = snoise(vec3(pos.x * 0.1, pos.y * 0.1 + time, pos.z * 0.1));
                
                // Breath effect
                float breath = 1.0 + sin(uTime * 0.5) * 0.015;
                pos *= breath;

                // Flow effect
                pos.x += snoise(vec3(pos.x, pos.y, time)) * uFlowStrength;
                pos.y += snoise(vec3(pos.x, pos.y + 10.0, time)) * uFlowStrength;
                pos.z += snoise(vec3(pos.x, pos.y + 20.0, time)) * uFlowStrength;


                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

                float sizeScale = 1.0 - vEffectStrength * ${CONFIG.morphSizeFactor.toFixed(2)};
                gl_PointSize = size * sizeScale * (400.0 / -mvPosition.z);

                gl_Position = projectionMatrix * mvPosition;
            }
        `, fragmentShader: `
                uniform sampler2D pointTexture;
                varying vec3 vColor;
                varying float vOpacity;
                varying float vEffectStrength;

                void main() {
                    float alpha = texture2D(pointTexture, gl_PointCoord).a;
                    if (alpha < 0.05) discard;

                    vec3 finalColor = vColor * (1.0 + vEffectStrength * ${CONFIG.morphBrightnessFactor.toFixed(2)});

                    gl_FragColor = vec4(finalColor, alpha * vOpacity);
                }
            `, blending: THREE.AdditiveBlending, depthTest: !0, depthWrite: !1, transparent: !0, vertexColors: !0
    }); particleSystem = new THREE.Points(particlesGeometry, particlesMaterial); particleSystem.position.x = 0; scene.add(particleSystem); createScrollArrow();
}
function createScrollArrow() {
    if (camera && !camera.parent) { scene.add(camera); }
    const arrowGeometry = new THREE.BufferGeometry();
    const count = 90;
    const vertices = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const arrowWidth = 1.6;
    const arrowHeight = 0.45;
    let idx = 0;
    const chevron1Count = Math.floor(count / 2);
    for (let i = 0; i < chevron1Count; i++) {
        const t = i / (chevron1Count - 1);
        let x, y;
        if (t < 0.5) {
            const t2 = t * 2;
            x = -arrowWidth / 2 * (1 - t2);
            y = arrowHeight * (1 - t2);
        } else {
            const t2 = (t - 0.5) * 2;
            x = arrowWidth / 2 * t2;
            y = arrowHeight * t2;
        }
        vertices[idx * 3] = x; vertices[idx * 3 + 1] = y; vertices[idx * 3 + 2] = 0;
        const color = new THREE.Color().setHSL(0.5 + t * 0.1, 1.0, 0.65);
        colors[idx * 3] = color.r; colors[idx * 3 + 1] = color.g; colors[idx * 3 + 2] = color.b;
        sizes[idx] = 0.08 + Math.random() * 0.08; idx++;
    }
    const chevron2Count = count - chevron1Count;
    const offset = -0.35;
    for (let i = 0; i < chevron2Count; i++) {
        const t = i / (chevron2Count - 1);
        let x, y;
        if (t < 0.5) {
            const t2 = t * 2;
            x = -arrowWidth / 2 * (1 - t2);
            y = offset + arrowHeight * (1 - t2);
        } else {
            const t2 = (t - 0.5) * 2;
            x = arrowWidth / 2 * t2;
            y = offset + arrowHeight * t2;
        }
        vertices[idx * 3] = x; vertices[idx * 3 + 1] = y; vertices[idx * 3 + 2] = 0;
        const color = new THREE.Color().setHSL(0.5 + t * 0.1, 1.0, 0.65);
        colors[idx * 3] = color.r; colors[idx * 3 + 1] = color.g; colors[idx * 3 + 2] = color.b;
        sizes[idx] = 0.08 + Math.random() * 0.08; idx++;
    }
    arrowGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    arrowGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    arrowGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    const arrowMaterial = new THREE.ShaderMaterial({
        uniforms: { pointTexture: { value: createStarTexture() }, uTime: { value: 0 }, uOpacity: { value: 1.0 } },
        vertexShader: `
            attribute float size; varying vec3 vColor; uniform float uTime;
            void main() {
                vColor = color; vec3 pos = position; pos.y += sin(uTime * 4.0) * 0.08;
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (350.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture; uniform float uOpacity; varying vec3 vColor;
            void main() {
                float alpha = texture2D(pointTexture, gl_PointCoord).a; if (alpha < 0.1) discard;
                gl_FragColor = vec4(vColor, alpha * 0.95 * uOpacity);
            }
        `,
        blending: THREE.AdditiveBlending, depthWrite: !1, transparent: !0, vertexColors: !0
    });
    scrollArrowPoints = new THREE.Points(arrowGeometry, arrowMaterial);
    scrollArrowPoints.position.set(0, -1.8, -5.0);
    camera.add(scrollArrowPoints);
}
function updateColorArray(colors, positionsArray) { const center = new THREE.Vector3(0, 0, 0); const maxRadius = CONFIG.shapeSize * 1.1; for (let i = 0; i < CONFIG.particleCount; i++) { const i3 = i * 3; tempVec.fromArray(positionsArray, i3); const dist = tempVec.distanceTo(center); let hue; hue = THREE.MathUtils.mapLinear(dist, 0, maxRadius, activeColorScheme.startHue, activeColorScheme.endHue); const noiseValue = (noise3D(tempVec.x * 0.2, tempVec.y * 0.2, tempVec.z * 0.2) + 1) * 0.5; const saturation = THREE.MathUtils.clamp(activeColorScheme.saturation * (0.9 + noiseValue * 0.2), 0, 1); const lightness = THREE.MathUtils.clamp(activeColorScheme.lightness * (0.85 + noiseValue * 0.3), 0.1, 0.9); const color = new THREE.Color().setHSL(hue / 360, saturation, lightness); color.toArray(colors, i3) } }
function updateUIColors() { const ui = document.getElementById('ui'); if (!ui) return; const toHSL = (h, s, l) => `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`; const s = activeColorScheme.saturation; const l = activeColorScheme.lightness; const c1 = toHSL(activeColorScheme.startHue, s * 0.3, 0.85); const c2 = toHSL(activeColorScheme.startHue, s, l); const midHue = (activeColorScheme.startHue + activeColorScheme.endHue) / 2; const c3 = toHSL(midHue, s, l); const c4 = toHSL(activeColorScheme.endHue, s * 0.8, l * 0.8); ui.style.setProperty('--ui-glow-1', c1); ui.style.setProperty('--ui-glow-2', c2); ui.style.setProperty('--ui-glow-3', c3); ui.style.setProperty('--ui-glow-4', c4) }
function updateColors() { const colors = particlesGeometry.attributes.color.array; updateColorArray(colors, particlesGeometry.attributes.position.array); particlesGeometry.attributes.color.needsUpdate = !0 }
export function nextShape() { const nextIndex = (currentShapeIndex + 1) % activeShapes.length; return triggerMorph(nextIndex).then(() => activeShapes[nextIndex]) }
export function prevShape() { const prevIndex = (currentShapeIndex - 1 + activeShapes.length) % activeShapes.length; return triggerMorph(prevIndex).then(() => activeShapes[prevIndex]) }
function triggerMorph(targetIndex) {
    if (isMorphing || targetIndex === currentShapeIndex) return Promise.resolve(); return new Promise((resolve) => {
        isMorphing = !0; controls.autoRotate = !1; console.log("Morphing triggered..."); const schemes = Object.keys(COLOR_SCHEMES).filter(k => k !== 'rainbow'); let newSchemeKey; do { newSchemeKey = schemes[Math.floor(Math.random() * schemes.length)] } while (newSchemeKey === CONFIG.colorScheme); CONFIG.colorScheme = newSchemeKey; const targetScheme = COLOR_SCHEMES[newSchemeKey]; anime({ targets: activeColorScheme, startHue: targetScheme.startHue, endHue: targetScheme.endHue, saturation: targetScheme.saturation, lightness: targetScheme.lightness, duration: CONFIG.morphDuration, easing: 'easeInOutQuad', update: () => { updateColors(); updateUIColors() } }); sourcePositions.set(currentPositions); const nextTargetPositions = targetPositions[targetIndex]; const centerOffsetAmount = CONFIG.shapeSize * CONFIG.swarmDistanceFactor; for (let i = 0; i < CONFIG.particleCount; i++) { const i3 = i * 3; sourceVec.fromArray(sourcePositions, i3); targetVec.fromArray(nextTargetPositions, i3); swarmVec.lerpVectors(sourceVec, targetVec, 0.5); const offsetDir = tempVec.set(noise3D(i * 0.05, 10, 10), noise3D(20, i * 0.05, 20), noise3D(30, 30, i * 0.05)).normalize(); const distFactor = sourceVec.distanceTo(targetVec) * 0.1 + centerOffsetAmount; swarmVec.addScaledVector(offsetDir, distFactor * (0.5 + Math.random() * 0.8)); swarmPositions[i3] = swarmVec.x; swarmPositions[i3 + 1] = swarmVec.y; swarmPositions[i3 + 2] = swarmVec.z }
        currentShapeIndex = targetIndex; morphState.progress = 0; if (morphTimeline) morphTimeline.pause(); morphTimeline = anime({ targets: morphState, progress: 1, duration: CONFIG.morphDuration, easing: 'cubicBezier(0.4, 0.0, 0.2, 1.0)', complete: () => { console.log("Morphing complete."); currentPositions.set(targetPositions[currentShapeIndex]); particlesGeometry.attributes.position.needsUpdate = !0; particleEffectStrengths.fill(0.0); particlesGeometry.attributes.aEffectStrength.needsUpdate = !0; sourcePositions.set(targetPositions[currentShapeIndex]); isMorphing = !1; controls.autoRotate = !0; resolve() } })
    })
}
function animate() {
    requestAnimationFrame(animate); if (!isInitialized) return; const elapsedTime = clock.getElapsedTime(); const deltaTime = clock.getDelta(); controls.update(); const positions = particlesGeometry.attributes.position.array; const effectStrengths = particlesGeometry.attributes.aEffectStrength.array; if (isMorphing) { updateMorphAnimation(positions, effectStrengths, elapsedTime, deltaTime) } else { updateIdleAnimation(positions, effectStrengths, elapsedTime, deltaTime) }
    particlesGeometry.attributes.position.needsUpdate = !0; if (isMorphing || particlesGeometry.attributes.aEffectStrength.needsUpdate) { particlesGeometry.attributes.aEffectStrength.needsUpdate = !0 }
    if (scrollArrowPoints) {
        scrollArrowPoints.material.uniforms.uTime.value = elapsedTime;
        let opacity = 1.0;
        if (controls) {
            const dist = controls.getDistance();
            const startD = 9.0;
            const endD = 35.0;
            if (dist > startD) {
                opacity = 1.0 - (dist - startD) / (endD - startD);
                opacity = Math.max(0.0, Math.min(1.0, opacity));
            }
        }
        if (window.scrollY > 10) {
            const scrollOpacity = 1.0 - window.scrollY / 150.0;
            opacity = Math.min(opacity, Math.max(0.0, scrollOpacity));
        }
        scrollArrowPoints.material.uniforms.uOpacity.value = opacity;
        scrollArrowPoints.visible = opacity > 0.001;
    }
    composer.render(deltaTime)
}
function updateMorphAnimation(positions, effectStrengths, elapsedTime, deltaTime) {
    const t = morphState.progress; const targets = targetPositions[currentShapeIndex]; const effectStrength = Math.sin(t * Math.PI); const currentSwirl = effectStrength * CONFIG.swirlFactor * deltaTime * 50; const currentNoise = effectStrength * CONFIG.noiseMaxStrength; for (let i = 0; i < CONFIG.particleCount; i++) {
        const i3 = i * 3; sourceVec.fromArray(sourcePositions, i3); swarmVec.fromArray(swarmPositions, i3); targetVec.fromArray(targets, i3); const t_inv = 1.0 - t; const t_inv_sq = t_inv * t_inv; const t_sq = t * t; bezPos.copy(sourceVec).multiplyScalar(t_inv_sq); bezPos.addScaledVector(swarmVec, 2.0 * t_inv * t); bezPos.addScaledVector(targetVec, t_sq); if (currentSwirl > 0.01) { tempVec.subVectors(bezPos, sourceVec); swirlAxis.set(noise3D(i * 0.02, elapsedTime * 0.1, 0), noise3D(0, i * 0.02, elapsedTime * 0.1 + 5), noise3D(elapsedTime * 0.1 + 10, 0, i * 0.02)).normalize(); tempVec.applyAxisAngle(swirlAxis, currentSwirl * (0.5 + Math.random() * 0.5)); bezPos.copy(sourceVec).add(tempVec) }
        if (currentNoise > 0.01) { const noiseTime = elapsedTime * CONFIG.noiseTimeScale; noiseOffset.set(noise4D(bezPos.x * CONFIG.noiseFrequency, bezPos.y * CONFIG.noiseFrequency, bezPos.z * CONFIG.noiseFrequency, noiseTime), noise4D(bezPos.x * CONFIG.noiseFrequency + 100, bezPos.y * CONFIG.noiseFrequency + 100, bezPos.z * CONFIG.noiseFrequency + 100, noiseTime), noise4D(bezPos.x * CONFIG.noiseFrequency + 200, bezPos.y * CONFIG.noiseFrequency + 200, bezPos.z * CONFIG.noiseFrequency + 200, noiseTime)); bezPos.addScaledVector(noiseOffset, currentNoise) }
        positions[i3] = bezPos.x; positions[i3 + 1] = bezPos.y; positions[i3 + 2] = bezPos.z; effectStrengths[i] = effectStrength
    }
    particlesGeometry.attributes.aEffectStrength.needsUpdate = !0
}
function updateIdleAnimation(positions, effectStrengths, elapsedTime, deltaTime) {
    particlesMaterial.uniforms.uTime.value = elapsedTime; if (!isInteractionActive && isSettled) return; let needsUpdate = !1; let needsEffectStrengthReset = !1; let anyParticleMoving = !1; if (isInteractionActive) {
        raycaster.setFromCamera(mouse, camera); const systemOffset = particleSystem.position; const interactSq = CONFIG.interactionRadius * CONFIG.interactionRadius; for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3; tempVec.fromArray(sourcePositions, i3); currentVec.copy(tempVec).add(systemOffset); const distSq = raycaster.ray.distanceSqToPoint(currentVec); if (distSq < interactSq) { raycaster.ray.closestPointToPoint(currentVec, closestPoint); repelVec.subVectors(currentVec, closestPoint); const force = (1.0 - repelVec.length() / CONFIG.interactionRadius) * CONFIG.interactionStrength; repelVec.normalize().multiplyScalar(force); tempVec.add(repelVec); positions[i3] = tempVec.x; positions[i3 + 1] = tempVec.y; positions[i3 + 2] = tempVec.z; needsUpdate = !0; anyParticleMoving = !0 } else {
                const ox = sourcePositions[i3]; const oy = sourcePositions[i3 + 1]; const oz = sourcePositions[i3 + 2]; if (Math.abs(positions[i3] - ox) > 0.01 || Math.abs(positions[i3 + 1] - oy) > 0.01 || Math.abs(positions[i3 + 2] - oz) > 0.01) { positions[i3] += (ox - positions[i3]) * 0.1; positions[i3 + 1] += (oy - positions[i3 + 1]) * 0.1; positions[i3 + 2] += (oz - positions[i3 + 2]) * 0.1; needsUpdate = !0; anyParticleMoving = !0 } else {
                    if (positions[i3] !== ox) { positions[i3] = ox; needsUpdate = !0 }
                    if (positions[i3 + 1] !== oy) { positions[i3 + 1] = oy; needsUpdate = !0 }
                    if (positions[i3 + 2] !== oz) { positions[i3 + 2] = oz; needsUpdate = !0 }
                }
            }
            if (effectStrengths[i] !== 0.0) { effectStrengths[i] = 0.0; needsEffectStrengthReset = !0 }
        }
    } else {
        for (let i = 0; i < CONFIG.particleCount; i++) {
            const i3 = i * 3; const ox = sourcePositions[i3]; const oy = sourcePositions[i3 + 1]; const oz = sourcePositions[i3 + 2]; if (positions[i3] !== ox || positions[i3 + 1] !== oy || positions[i3 + 2] !== oz) { positions[i3] += (ox - positions[i3]) * 0.1; positions[i3 + 1] += (oy - positions[i3 + 1]) * 0.1; positions[i3 + 2] += (oz - positions[i3 + 2]) * 0.1; if (Math.abs(positions[i3] - ox) < 0.01) positions[i3] = ox; if (Math.abs(positions[i3 + 1] - oy) < 0.01) positions[i3 + 1] = oy; if (Math.abs(positions[i3 + 2] - oz) < 0.01) positions[i3 + 2] = oz; needsUpdate = !0; anyParticleMoving = !0 }
            if (effectStrengths[i] !== 0.0) { effectStrengths[i] = 0.0; needsEffectStrengthReset = !0 }
        }
    }
    isSettled = !anyParticleMoving; if (needsUpdate) { particlesGeometry.attributes.position.needsUpdate = !0 }
    if (needsEffectStrengthReset) { particlesGeometry.attributes.aEffectStrength.needsUpdate = !0 }
}
function onCanvasClick(event) { if (event.target.closest('#controls')) { return } }
function onWindowResize() { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); composer.setSize(window.innerWidth, window.innerHeight); if (controls) { const targetZ = camera.aspect >= 1.25 ? 28 : Math.min(45, 28 * (1.25 / Math.max(0.65, camera.aspect))); const currentDist = camera.position.distanceTo(new THREE.Vector3(0, 8, 0)); if (Math.abs(currentDist - 28) < 2 || isMorphing) { const dir = new THREE.Vector3().subVectors(camera.position, new THREE.Vector3(0, 8, 0)).normalize(); camera.position.copy(new THREE.Vector3(0, 8, 0)).addScaledVector(dir, targetZ); controls.update() } } }
export { init, camera, renderer, controls, onWindowResize }