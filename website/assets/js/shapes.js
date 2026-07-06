import * as THREE from 'three';

const tempVec = new THREE.Vector3();

function generateTextPoints(text, count, fontSize = 200, fontFamily = 'Arial', xShift = -18, sizeRatio = 1.0) {
    if (!text) {
        return new Float32Array(count * 3);
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // First set the font to measure text width accurately
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);

    // Add padding to ensure nothing is clipped on the edges
    const textWidth = Math.ceil(metrics.width) + 120;
    // Emojis and Hebrew text can be taller than the nominal font size
    const textHeight = Math.ceil(fontSize * 1.6);

    canvas.width = textWidth;
    canvas.height = textHeight;

    // Reset font and text alignments since resizing canvas resets context state
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const pixels = [];

    const step = 2;
    for (let i = 0; i < canvas.height; i += step) {
        for (let j = 0; j < canvas.width; j += step) {
            const index = (i * canvas.width + j) * 4;
            if (data[index + 3] > 128) {
                // Centered coordinates scaled to 3D space
                const x = (j - canvas.width / 2) * 0.035;
                const y = (canvas.height / 2 - i) * 0.035;
                pixels.push(x, y);
            }
        }
    }

    const points = new Float32Array(count * 3);
    if (pixels.length === 0) return points;

    const zOffset = 12 * sizeRatio;
    const scaledXShift = xShift * sizeRatio;
    const scaledYShift = -1.5 * sizeRatio;

    for (let i = 0; i < count; i++) {
        const pixelIndex = Math.floor(Math.random() * (pixels.length / 2)) * 2;
        points[i * 3] = pixels[pixelIndex] * sizeRatio + scaledXShift;
        points[i * 3 + 1] = pixels[pixelIndex + 1] * sizeRatio + scaledYShift;
        points[i * 3 + 2] = zOffset; // push forward so it doesn't intersect the sphere heavily
    }
    return points;
}

function generateShapeWithText(shapeGenerator, name, totalCount, size, fontSize = 140, xShift = 0) {
    if (!name) {
        return shapeGenerator(totalCount, size);
    }
    const textCount = Math.floor(totalCount * 0.25);
    const shapeCount = totalCount - textCount;

    const shapePoints = shapeGenerator(shapeCount, size);
    const sizeRatio = size / 14;
    const textPoints = generateTextPoints(name, textCount, fontSize, 'Arial', xShift, sizeRatio);

    const combined = new Float32Array(totalCount * 3);
    combined.set(shapePoints);
    combined.set(textPoints, shapePoints.length);
    return combined;
}


const DATA = window.CODICRAFT_DATA || {};

export function generate3DIconShape(icon, count, size, scale = 0.4) {
    // Large font size ensures high particle density and detail
    const sizeRatio = size / 14;
    const points2D = generateTextPoints(icon, count, 300, 'Segoe UI Emoji, Arial', 0, sizeRatio);
    const points = new Float32Array(count * 3);
    const depth = size * 0.05; // Flatter Z-depth for text readability

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        points[i3] = points2D[i3] * scale;
        points[i3 + 1] = points2D[i3 + 1] * scale;
        points[i3 + 2] = (Math.random() - 0.5) * depth;
    }

    return points;
}

export const SHAPES = [
    {
        name: 'Company',
        title: DATA['Company']?.title || 'CodiCraft',
        description: DATA['Company']?.desc || '',
        generator: (c, s) => {
            const data = window.CODICRAFT_DATA || {};
            const name = data['Company']?.name || 'CodiCraft';
            const cleanName = name.replace(/[^\x00-\x7F]/g, '').trim(); // Remove emojis to keep brain shape clean
            return generateShapeWithText(generateSphere, cleanName || 'CodiCraft', c, s, 180, 0);
        }
    },
    {
        name: 'Creativity',
        title: DATA['Sphere']?.title || 'חשיבה יצירתית',
        description: DATA['Sphere']?.desc || '',
        generator: (c, s) => {
            const data = window.CODICRAFT_DATA || {};
            const name = data['Sphere']?.name || '💡 יצירתיות';
            return generate3DIconShape(name, c, s, 0.4);
        }
    },
    {
        name: 'Technology',
        title: DATA['Cube']?.title || 'טכנולוגיה מתקדמת',
        description: DATA['Cube']?.desc || '',
        generator: (c, s) => {
            const data = window.CODICRAFT_DATA || {};
            const name = data['Cube']?.name || '💻 טכנולוגיה';
            return generate3DIconShape(name, c, s, 0.4);
        }
    },
    {
        name: 'Learning',
        title: DATA['Wave']?.title || 'למידה מתמדת',
        description: DATA['Wave']?.desc || '',
        generator: (c, s) => {
            const data = window.CODICRAFT_DATA || {};
            const name = data['Wave']?.name || '📖 למידה';
            return generate3DIconShape(name, c, s, 0.48); // Enlarged scale for the book
        }
    },
    {
        name: 'Gameplay',
        title: DATA['Pyramid']?.title || 'חווית משתמש',
        description: DATA['Pyramid']?.desc || '',
        generator: (c, s) => {
            const data = window.CODICRAFT_DATA || {};
            const name = data['Pyramid']?.name || '🎲 משחקיות';
            return generate3DIconShape(name, c, s, 0.4);
        }
    }
];
//export function generateLogoTag(count, size) {
export function generateSphere(count, size) {
    const points = new Float32Array(count * 3);
    const phi = Math.PI * (Math.sqrt(5) - 1);
    const shapeCount = count;

    let idx = 0;
    const rotationAngle = -(80 * Math.PI) / 180;
    const cosAngle = Math.cos(rotationAngle);
    const sinAngle = Math.sin(rotationAngle);

    const brainScale = 0.6;

    const offsetX = -0.05;
    const offsetY = 0.08;

    const itOffsetY = -0.1;

    for (let i = 0; i < shapeCount; i++) {
        const y = 1 - (i / (shapeCount - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        let x = Math.cos(theta) * radius;
        let z = Math.sin(theta) * radius;

        const heightFactor = (y + 1) / 2;
        const triangleScale = 0.3 + heightFactor * 0.7;
        const leftShift = (1 - heightFactor) * 0.4;

        x = x * triangleScale - leftShift;

        if (y > 0.3) {
            const roundFactor = (y - 0.3) / 0.7;
            x *= 1 + roundFactor * 0.2;
        }

        const wave1 = Math.sin(theta * 5) * 0.08;
        const wave2 = Math.sin(theta * 8 + y * 3) * 0.05;
        const wave3 = Math.cos(theta * 12 - y * 4) * 0.04;

        const verticalFold = Math.sin(y * 6) * 0.06;

        const noise = Math.sin(theta * 15.7) * Math.cos(y * 8.3) * 0.07;

        const organicFactor = wave1 + wave2 + wave3 + verticalFold + noise;
        x += organicFactor;
        z += organicFactor * 0.6;
        z *= 0.4;

        const rotatedX = x * cosAngle - y * sinAngle;
        const rotatedY = x * sinAngle + y * cosAngle;

        points[idx * 3] = (rotatedX * brainScale + offsetX) * size;
        points[idx * 3 + 1] = (rotatedY * brainScale + offsetY) * size;
        points[idx * 3 + 2] = z * size * brainScale;
        idx++;
    }
    return points;
}
/*
export function generateSphere(count, size) {
    const points = new Float32Array(count * 3);
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        points[i * 3] = x * size;
        points[i * 3 + 1] = y * size;
        points[i * 3 + 2] = z * size;
    }
    return points;
}
    */
export function generateCube(count, size) {
    const points = new Float32Array(count * 3);
    const halfSize = size / 2;
    for (let i = 0; i < count; i++) {
        const face = Math.floor(Math.random() * 6);
        const u = Math.random() * size - halfSize;
        const v = Math.random() * size - halfSize;
        switch (face) {
            case 0: points.set([halfSize, u, v], i * 3); break;
            case 1: points.set([-halfSize, u, v], i * 3); break;
            case 2: points.set([u, halfSize, v], i * 3); break;
            case 3: points.set([u, -halfSize, v], i * 3); break;
            case 4: points.set([u, v, halfSize], i * 3); break;
            case 5: points.set([u, v, -halfSize], i * 3); break;
        }
    }
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        points[i * 0.55] = x * size;
        points[i * 0.55 + 1] = y * size;
        points[i * 0.55 + 2] = z * size;
    }
    return points;
}

export function generatePyramid(count, size) {
    const points = new Float32Array(count * 3);
    const halfBase = size / 2;
    const height = size * 1.2;
    const apex = new THREE.Vector3(0, height / 2, 0);
    const baseVertices = [
        new THREE.Vector3(-halfBase, -height / 2, -halfBase), new THREE.Vector3(halfBase, -height / 2, -halfBase),
        new THREE.Vector3(halfBase, -height / 2, halfBase), new THREE.Vector3(-halfBase, -height / 2, halfBase)
    ];
    const baseArea = size * size;
    const sideFaceHeight = Math.sqrt(Math.pow(height, 2) + Math.pow(halfBase, 2));
    const sideFaceArea = 0.5 * size * sideFaceHeight;
    const totalArea = baseArea + 4 * sideFaceArea;
    const baseWeight = baseArea / totalArea;
    const sideWeight = sideFaceArea / totalArea;
    for (let i = 0; i < count; i++) {
        const r = Math.random();
        let p = new THREE.Vector3(); let u, v;
        if (r < baseWeight) {
            u = Math.random(); v = Math.random();
            p.lerpVectors(baseVertices[0], baseVertices[1], u);
            const p2 = new THREE.Vector3().lerpVectors(baseVertices[3], baseVertices[2], u);
            p.lerp(p2, v);
        } else {
            const faceIndex = Math.floor((r - baseWeight) / sideWeight);
            const v1 = baseVertices[faceIndex]; const v2 = baseVertices[(faceIndex + 1) % 4];
            u = Math.random(); v = Math.random();
            if (u + v > 1) { u = 1 - u; v = 1 - v; }
            p.addVectors(v1, tempVec.subVectors(v2, v1).multiplyScalar(u));
            p.add(tempVec.subVectors(apex, v1).multiplyScalar(v));
        }
        points.set([p.x, p.y, p.z], i * 3);
    }
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < count / 1.25; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        points[i * 0.75] = x * size;
        points[i * 0.75 + 1] = y * size;
        points[i * 0.75 + 2] = z * size;
    }
    return points;
}
export function generateTorus(count, size) {
    const points = new Float32Array(count * 3);

    const torusCount = Math.floor(count * 0.6);
    const topFunnelCount = Math.floor(count * 0.2);
    const bottomFunnelCount = count - torusCount - topFunnelCount;
    const R = size * 0.6;
    const r = size * 0.25;

    let pIndex = 0;

    for (let i = 0; i < torusCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;

        const x = (R + r * Math.cos(phi)) * Math.cos(theta);
        const y = r * Math.sin(phi);
        const z = (R + r * Math.cos(phi)) * Math.sin(theta);

        points[pIndex * 3] = x;
        points[pIndex * 3 + 1] = y;
        points[pIndex * 3 + 2] = z;
        pIndex++;
    }

    const funnelTopY = size * 1.8;
    const funnelBottomY = size * 0.3;
    const funnelTopRadius = size * 1.0;
    const funnelBottomRadius = size * 0.1;

    for (let i = 0; i < topFunnelCount; i++) {
        const h = Math.random();
        const xH = Math.pow(h, 3);

        const y = funnelBottomY + (funnelTopY - funnelBottomY) * h;

        const radius = funnelBottomRadius + (funnelTopRadius - funnelBottomRadius) * h;
        const theta = Math.random() * Math.PI * 2;

        const rSpread = radius * (0.9 + Math.random() * 0.2);

        const x = rSpread * Math.cos(theta);
        const z = rSpread * Math.sin(theta);

        points[pIndex * 3] = x;
        points[pIndex * 3 + 1] = y;
        points[pIndex * 3 + 2] = z;
        pIndex++;
    }

    const exitTopY = -size * 0.3;
    const exitBottomY = -size * 1.8;
    const exitTopRadius = size * 0.1;
    const exitBottomRadius = size * 1.0;

    for (let i = 0; i < bottomFunnelCount; i++) {
        const h = Math.random();
        const y = exitTopY + (exitBottomY - exitTopY) * h;

        const radius = exitTopRadius + (exitBottomRadius - exitTopRadius) * h;
        const theta = Math.random() * Math.PI * 2;

        const rSpread = radius * (0.9 + Math.random() * 0.2);

        const x = rSpread * Math.cos(theta);
        const z = rSpread * Math.sin(theta);

        points[pIndex * 3] = x;
        points[pIndex * 3 + 1] = y;
        points[pIndex * 3 + 2] = z;
        pIndex++;
    }

    return points;
}
export function generateGalaxy(count, size) {
    const points = new Float32Array(count * 3);

    const cubeProportion = 0.75;
    const lineProportion = 1 - cubeProportion;

    const cubeCount = Math.floor(count * cubeProportion);
    const lineCount = count - cubeCount;

    const singleCubeCount = Math.floor(cubeCount / 3);
    const singleLineCount = Math.floor(lineCount / 3);

    const offset = size * 0.8;
    const height = size * 0.5;
    const centers = [
        { x: 0, y: height, z: 0 },          // Top
        { x: -offset, y: -height, z: 0 },   // Bottom Left
        { x: offset, y: -height, z: 0 }     // Bottom Right
    ];

    const cubeSize = size * 0.4;
    const halfCube = cubeSize / 2;

    let idx = 0;
    for (let c = 0; c < 3; c++) {
        const cx = centers[c].x;
        const cy = centers[c].y;
        const cz = centers[c].z;

        const currentCount = (c === 2) ? (cubeCount - 2 * singleCubeCount) : singleCubeCount;

        for (let i = 0; i < currentCount; i++) {
            const x = (Math.random() - 0.5) * cubeSize;
            const y = (Math.random() - 0.5) * cubeSize;
            const z = (Math.random() - 0.5) * cubeSize;

            points[idx * 3] = cx + x;
            points[idx * 3 + 1] = cy + y;
            points[idx * 3 + 2] = cz + z;
            idx++;
        }
    }

    const lines = [
        { from: 0, to: 1 },
        { from: 1, to: 2 },
        { from: 2, to: 0 }
    ];

    for (let l = 0; l < 3; l++) {
        const fromP = centers[lines[l].from];
        const toP = centers[lines[l].to];

        const currentCount = (l === 2) ? (lineCount - 2 * singleLineCount) : singleLineCount;

        for (let i = 0; i < currentCount; i++) {
            const t = Math.random();
            const x = fromP.x + (toP.x - fromP.x) * t;
            const y = fromP.y + (toP.y - fromP.y) * t;
            const z = fromP.z + (toP.z - fromP.z) * t;

            const scatter = size * 0.02;
            const sx = (Math.random() - 0.5) * scatter;
            const sy = (Math.random() - 0.5) * scatter;
            const sz = (Math.random() - 0.5) * scatter;

            points[idx * 3] = x + sx;
            points[idx * 3 + 1] = y + sy;
            points[idx * 3 + 2] = z + sz;
            idx++;
        }
    }

    return points;
}
export function generateWave(count, size) {
    const points = new Float32Array(count * 3);

    const side = Math.ceil(Math.sqrt(count));
    const step = (size * 2) / side;
    const offset = (side * step) / 2;

    let idx = 0;
    for (let i = 0; i < side; i++) {
        for (let j = 0; j < side; j++) {
            if (idx >= count) break;

            const x = (i * step) - offset;
            const z = (j * step) - offset;
            const r = Math.sqrt(x * x + z * z);

            const frequency = 5.0 / size;
            let y = Math.sin(r * frequency) * (size * 0.3);

            y += Math.sin(x * 3.0 / size) * Math.cos(z * 3.0 / size) * (size * 0.1);

            points[idx * 3] = x;
            points[idx * 3 + 1] = y;
            points[idx * 3 + 2] = z;
            idx++;
        }
    }
    return points;
}

export function generate404(count, size) {
    const text = "404";
    // Shift left by ~33% (half of previous).
    const sizeRatio = size / 14;
    const points2D = generateTextPoints(text, count, 350, 'Arial', -18, sizeRatio);
    const points = new Float32Array(count * 3);
    const depth = size * 0.15;

    // Scale factor to make 404 take up reasonable space
    // 2D points are approx -25 to +25. 
    // If we want radius ~size (14), we use factor ~0.65
    const scale = 0.65;

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        points[i3] = points2D[i3] * scale;
        points[i3 + 1] = points2D[i3 + 1] * scale;
        points[i3 + 2] = (Math.random() - 0.5) * depth;
    }

    return points;
}

export const SHAPES_404 = [
    {
        name: '404',
        title: DATA['404']?.title || 'Error 404',
        description: DATA['404']?.desc || 'Page not found',
        generator: generate404
    }
];