/* Try Now - Mini Coding Challenge Game Engine */

// Sound effects synthesizer using Web Audio API
class AudioSynth {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playClick() {
        this.init();
        if (!this.ctx) return;
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playStep() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playSuccess() {
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 (Major arpeggio)
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.12);
            
            gain.gain.setValueAtTime(0.15, now + idx * 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.3);

            osc.start(now + idx * 0.12);
            osc.stop(now + idx * 0.12 + 0.3);
        });
    }

    playFail() {
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
}

const synth = new AudioSynth();

// Confetti Particle System
class ConfettiSystem {
    constructor() {
        this.canvas = document.getElementById('confetti-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.animationFrame = null;
        this.active = false;
        
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    start() {
        this.resizeCanvas();
        this.particles = [];
        this.active = true;
        
        const colors = ['#00ffea', '#00a2ff', '#b55fe6', '#f97316', '#ffea00', '#ff007f'];
        const numParticles = 120;

        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 100,
                y: window.innerHeight + 50,
                radius: Math.random() * 5 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vx: (Math.random() - 0.5) * 15,
                vy: -Math.random() * 15 - 10,
                gravity: 0.35,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10
            });
        }

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.tick();
    }

    stop() {
        this.active = false;
        this.particles = [];
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    tick() {
        if (!this.active) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        let activeParticles = 0;

        this.particles.forEach(p => {
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;

            if (p.y < window.innerHeight + 50) {
                activeParticles++;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.rotation * Math.PI / 180);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 1.4);
            this.ctx.restore();
        });

        if (activeParticles > 0) {
            this.animationFrame = requestAnimationFrame(() => this.tick());
        } else {
            this.stop();
        }
    }
}

// Game levels database
const LEVELS = {
    1: {
        gridSize: 5,
        startPos: { x: 0, y: 2 },
        startDir: 'E',
        targetPos: { x: 3, y: 2 },
        obstacles: [],
        description: '<strong>המשימה:</strong> קודי צריך להגיע לשבב הזיכרון שנמצא 3 משבצות קדימה. השתמשו בבלוקי התנועה כדי להצעיד אותו ולאחר מכן איספו את השבב!',
        helperText: 'לחצו על הפקודה "קדימה ⬆️" שלוש פעמים, ולאחר מכן לחצו על "אסוף שבב 💎". כשתסיימו, לחצו על "הפעל קוד ▶️".'
    },
    2: {
        gridSize: 5,
        startPos: { x: 1, y: 4 },
        startDir: 'N',
        targetPos: { x: 3, y: 1 },
        obstacles: [
            { x: 1, y: 2 },
            { x: 2, y: 2 }
        ],
        description: '<strong>המשימה:</strong> קודי צריך לאסוף את שבב הזיכרון בראש הרשת, אך ישנו מחסום לייזר בדרך! תכנתו אותו לעקוף את המחסום.',
        helperText: 'צעדו קדימה עד סמוך למחסום, פנו ימינה לעקוף אותו, צעדו קדימה, פנו שמאלה ולאחר מכן אספו את השבב!'
    },
    3: {
        gridSize: 6,
        startPos: { x: 0, y: 5 },
        startDir: 'N',
        targetPos: { x: 4, y: 1 },
        obstacles: [
            { x: 1, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 4, y: 3 }
        ],
        description: '<strong>המשימה:</strong> שבב הזיכרון נמצא רחוק! מומלץ להשתמש בבלוק <strong>"לולאה"</strong> כדי לחזור על פקודת התנועה במקום להוסיף פקודות רבות.',
        helperText: 'לחצו על בלוק "לולאה", בחרו בחצים לחזור עליו 4 פעמים, הוסיפו בפנים "קדימה", סגרו את הלולאה ב-"סוף לולאה", פנו ימינה, ועשו לולאה נוספת כדי להתקדם ולאסוף את השבב!'
    }
};

// Global Game Controller State
class GameController {
    constructor() {
        this.currentLevelNum = 1;
        this.mascotPos = { x: 0, y: 0 };
        this.mascotDir = 'E';
        this.hasCollected = false;
        this.isExecuting = false;
        
        this.blockStack = [];
        this.blockIdCounter = 0;
        this.openLoops = 0; // count of currently unclosed loops in workspace

        this.confetti = null;

        // UI DOM Elements references
        this.dom = {
            gridBoard: document.getElementById('grid-board'),
            spriteMascot: document.getElementById('sprite-mascot'),
            spriteTarget: document.getElementById('sprite-target'),
            workspaceBlocks: document.getElementById('workspace-blocks'),
            workspacePlaceholder: document.getElementById('workspace-placeholder'),
            runBtn: document.getElementById('run-btn'),
            resetBtn: document.getElementById('reset-btn'),
            clearBtn: document.getElementById('clear-btn'),
            levelBadge: document.getElementById('level-badge'),
            objectiveDesc: document.getElementById('objective-desc'),
            helperText: document.getElementById('helper-text'),
            statusOverlay: document.getElementById('status-overlay'),
            statusTitle: document.getElementById('status-title'),
            statusText: document.getElementById('status-text'),
            overlayActionBtn: document.getElementById('overlay-action-btn'),
            loopBtn: document.getElementById('loop-btn'),
            endloopBtn: document.getElementById('endloop-btn'),
            
            // Lead Modal Elements
            leadModal: document.getElementById('lead-modal'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            scheduleForm: document.getElementById('schedule-lead-form'),
            leadFormContent: document.getElementById('lead-form-content'),
            leadSuccessContent: document.getElementById('lead-success-content'),
            successCloseBtn: document.getElementById('success-close-btn')
        };
    }

    init() {
        this.confetti = new ConfettiSystem();
        this.loadLevel(1);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toolbox Blocks click listeners
        document.querySelectorAll('.toolbox .code-block').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const command = btn.getAttribute('data-command');
                if (this.isExecuting) return;
                synth.playClick();
                this.addBlockToWorkspace(command);
            });
        });

        // Controls
        this.dom.runBtn.addEventListener('click', () => this.runProgram());
        this.dom.resetBtn.addEventListener('click', () => this.resetSimulation());
        this.dom.clearBtn.addEventListener('click', () => {
            if (this.isExecuting) return;
            synth.playClick();
            this.clearWorkspace();
        });

        // Level navigation
        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.isExecuting) return;
                const targetLvl = parseInt(btn.getAttribute('data-level'));
                synth.playClick();
                
                // Toggle active class on level selection buttons
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.loadLevel(targetLvl);
            });
        });

        // Modal Action buttons
        this.dom.overlayActionBtn.addEventListener('click', () => {
            this.dom.statusOverlay.classList.remove('visible');
            if (this.currentLevelNum < 3) {
                // Advance level
                const nextLvl = this.currentLevelNum + 1;
                this.loadLevel(nextLvl);
                
                // Update active button classes in level selector
                document.querySelectorAll('.level-btn').forEach(btn => {
                    const lNum = parseInt(btn.getAttribute('data-level'));
                    if (lNum === nextLvl) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });
            } else {
                // Completed Level 3 - Open Lead Modal!
                this.openModal();
            }
        });

        // Close Modal events
        this.dom.modalCloseBtn.addEventListener('click', () => this.closeModal());
        this.dom.successCloseBtn.addEventListener('click', () => this.closeModal());
        
        // Lead Form submit handler
        this.dom.scheduleForm.addEventListener('submit', (e) => this.handleLeadSubmit(e));
    }

    loadLevel(levelNum) {
        this.currentLevelNum = levelNum;
        const lvl = LEVELS[levelNum];

        // Update levels metadata HUD
        this.dom.levelBadge.textContent = `שלב ${levelNum}`;
        this.dom.objectiveDesc.innerHTML = lvl.description;
        this.dom.helperText.textContent = lvl.helperText;

        // Hide overlay status screen
        this.dom.statusOverlay.classList.remove('visible');
        
        // Setup Grid structure dynamically
        this.dom.gridBoard.innerHTML = '';
        this.dom.gridBoard.style.gridTemplateColumns = `repeat(${lvl.gridSize}, 1fr)`;
        this.dom.gridBoard.style.gridTemplateRows = `repeat(${lvl.gridSize}, 1fr)`;

        // Generate grid tiles
        for (let r = 0; r < lvl.gridSize; r++) {
            for (let c = 0; c < lvl.gridSize; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.id = `cell-${c}-${r}`;
                
                // Zebra styling
                if ((r + c) % 2 === 0) {
                    cell.classList.add('even-tile');
                }

                // Check if this cell is an obstacle
                const isObstacle = lvl.obstacles.some(o => o.x === c && o.y === r);
                if (isObstacle) {
                    const obstacleEl = document.createElement('div');
                    obstacleEl.className = 'sprite-obstacle';
                    cell.appendChild(obstacleEl);
                }

                this.dom.gridBoard.appendChild(cell);
            }
        }

        // Re-inject Mascot and Target to board grid container
        this.dom.gridBoard.appendChild(this.dom.statusOverlay);

        // Reset positions
        this.mascotPos = { ...lvl.startPos };
        this.mascotDir = lvl.startDir;
        this.hasCollected = false;

        this.updateSpritesDOM();
        this.resetSimulationUI();
    }

    updateSpritesDOM() {
        // Place Target (Memory chip) on cell
        const targetCell = document.getElementById(`cell-${this.currentLevel().targetPos.x}-${this.currentLevel().targetPos.y}`);
        if (targetCell) {
            targetCell.appendChild(this.dom.spriteTarget);
        }
        this.dom.spriteTarget.style.display = this.hasCollected ? 'none' : 'block';

        // Place Mascot
        const mascotCell = document.getElementById(`cell-${this.mascotPos.x}-${this.mascotPos.y}`);
        if (mascotCell) {
            mascotCell.appendChild(this.dom.spriteMascot);
        }

        // Set facing direction rotation styles
        this.dom.spriteMascot.className = 'sprite-mascot';
        if (this.mascotDir === 'N') this.dom.spriteMascot.classList.add('dir-north');
        if (this.mascotDir === 'E') this.dom.spriteMascot.classList.add('dir-east');
        if (this.mascotDir === 'S') this.dom.spriteMascot.classList.add('dir-south');
        if (this.mascotDir === 'W') this.dom.spriteMascot.classList.add('dir-west');
    }

    currentLevel() {
        return LEVELS[this.currentLevelNum];
    }

    // Workspace blocks operations
    addBlockToWorkspace(command) {
        if (command === 'endRepeat' && this.openLoops === 0) return;

        const id = `block-${this.blockIdCounter++}`;
        const isIndented = this.openLoops > 0 && command !== 'endRepeat';

        let blockObj = { id, command, isIndented };

        if (command === 'repeat') {
            blockObj.value = 3; // Default loop repeats limit
            this.openLoops++;
            this.updateToolboxLoopButtons();
        } else if (command === 'endRepeat') {
            this.openLoops--;
            this.updateToolboxLoopButtons();
        }

        this.blockStack.push(blockObj);
        this.renderWorkspace();
    }

    removeBlock(id) {
        if (this.isExecuting) return;
        synth.playClick();

        const index = this.blockStack.findIndex(b => b.id === id);
        if (index === -1) return;

        const block = this.blockStack[index];

        // If removing repeat block, adjust open loops logic safely
        if (block.command === 'repeat') {
            // Find and adjust any matching nested elements
            this.openLoops = Math.max(0, this.openLoops - 1);
        } else if (block.command === 'endRepeat') {
            // Removing loop end block: we increase open loop count back
            this.openLoops++;
        }

        this.blockStack.splice(index, 1);
        this.recalculateIndents();
        this.renderWorkspace();
        this.updateToolboxLoopButtons();
    }

    recalculateIndents() {
        let currentLoops = 0;
        this.blockStack.forEach(b => {
            if (b.command === 'repeat') {
                b.isIndented = currentLoops > 0;
                currentLoops++;
            } else if (b.command === 'endRepeat') {
                currentLoops = Math.max(0, currentLoops - 1);
                b.isIndented = currentLoops > 0;
            } else {
                b.isIndented = currentLoops > 0;
            }
        });
        this.openLoops = currentLoops;
    }

    updateToolboxLoopButtons() {
        // Toggle endRepeat button visibility in Toolbox based on whether loops are open
        if (this.openLoops > 0) {
            this.dom.endloopBtn.style.display = 'flex';
        } else {
            this.dom.endloopBtn.style.display = 'none';
        }
    }

    clearWorkspace() {
        this.blockStack = [];
        this.openLoops = 0;
        this.renderWorkspace();
        this.updateToolboxLoopButtons();
    }

    renderWorkspace() {
        const blocksList = this.dom.workspaceBlocks;
        
        // Toggle layout placeholder based on block count
        if (this.blockStack.length === 0) {
            this.dom.workspacePlaceholder.style.display = 'block';
            blocksList.innerHTML = '';
            return;
        }
        
        this.dom.workspacePlaceholder.style.display = 'none';
        blocksList.innerHTML = '';

        this.blockStack.forEach(block => {
            const el = document.createElement('div');
            el.className = `code-block stacked-block`;
            el.id = block.id;

            if (block.isIndented) {
                el.classList.add('indented');
            }

            // Assign colors matching action types
            if (block.command === 'moveForward' || block.command === 'turnRight' || block.command === 'turnLeft') {
                el.classList.add('block-move');
            } else if (block.command === 'collect') {
                el.classList.add('block-action');
            } else if (block.command === 'repeat') {
                el.classList.add('block-loop');
            } else if (block.command === 'endRepeat') {
                el.classList.add('block-endloop');
            }

            // Inline details contents
            let html = '';
            if (block.command === 'moveForward') html = '<span>קדימה ⬆️</span>';
            else if (block.command === 'turnRight') html = '<span>פנה ימינה ➡️</span>';
            else if (block.command === 'turnLeft') html = '<span>פנה שמאלה ⬅️</span>';
            else if (block.command === 'collect') html = '<span>אסוף שבב 💎</span>';
            else if (block.command === 'endRepeat') html = '<span>סוף לולאה 🔚</span>';
            else if (block.command === 'repeat') {
                html = `
                    <div style="display:flex; align-items:center; gap:5px;">
                        <span>חזור 🔁</span>
                        <select class="loop-count-select" data-id="${block.id}">
                            <option value="2" ${block.value == 2 ? 'selected' : ''}>2</option>
                            <option value="3" ${block.value == 3 ? 'selected' : ''}>3</option>
                            <option value="4" ${block.value == 4 ? 'selected' : ''}>4</option>
                            <option value="5" ${block.value == 5 ? 'selected' : ''}>5</option>
                        </select>
                        <span>פעמים:</span>
                    </div>
                `;
            }

            el.innerHTML = html;

            // Delete action button
            const delBtn = document.createElement('button');
            delBtn.className = 'delete-btn';
            delBtn.innerHTML = '&times;';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeBlock(block.id);
            });
            el.appendChild(delBtn);

            // Select change listener for loop repeat value
            if (block.command === 'repeat') {
                const select = el.querySelector('.loop-count-select');
                select.addEventListener('change', (e) => {
                    const blockId = select.getAttribute('data-id');
                    const val = parseInt(select.value);
                    const bObj = this.blockStack.find(b => b.id === blockId);
                    if (bObj) {
                        bObj.value = val;
                        synth.playClick();
                    }
                });
            }

            blocksList.appendChild(el);
        });
    }

    // Program execution recursive logic expansion
    expandBlocks(blocks) {
        let result = [];
        let i = 0;
        
        while (i < blocks.length) {
            let b = blocks[i];
            
            if (b.command === 'repeat') {
                const loopCount = b.value || 3;
                let loopBody = [];
                let nestLevel = 1;
                let j = i + 1;
                
                while (j < blocks.length) {
                    if (blocks[j].command === 'repeat') nestLevel++;
                    if (blocks[j].command === 'endRepeat') {
                        nestLevel--;
                        if (nestLevel === 0) break;
                    }
                    loopBody.push(blocks[j]);
                    j++;
                }

                // Recursively expand loop contents
                const expandedBody = this.expandBlocks(loopBody);
                for (let c = 0; c < loopCount; c++) {
                    result = result.concat(expandedBody);
                }
                
                i = j + 1; // Advance pointer past closed loop brackets
            } else if (b.command === 'endRepeat') {
                i++; // Skip unassociated loop end blocks safely
            } else {
                result.push(b.command);
                i++;
            }
        }
        
        return result;
    }

    async runProgram() {
        if (this.isExecuting) return;

        // Auto close open loops
        if (this.openLoops > 0) {
            while (this.openLoops > 0) {
                this.addBlockToWorkspace('endRepeat');
            }
        }

        const commandSequence = this.expandBlocks(this.blockStack);

        if (commandSequence.length === 0) {
            alert('מרחב העבודה ריק! הוסיפו בלוקים לפני הפעלת הסימולטור.');
            return;
        }

        this.isExecuting = true;
        this.dom.runBtn.disabled = true;
        this.dom.clearBtn.disabled = true;
        this.dom.resetBtn.disabled = false;
        
        // Clear previous cell trails
        document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('trail'));

        const lvl = this.currentLevel();
        this.mascotPos = { ...lvl.startPos };
        this.mascotDir = lvl.startDir;
        this.hasCollected = false;
        this.updateSpritesDOM();

        // Mark starting tile as trail
        const startCell = document.getElementById(`cell-${this.mascotPos.x}-${this.mascotPos.y}`);
        if (startCell) startCell.classList.add('trail');

        // Execute commands sequentially with 650ms intervals
        for (let step = 0; step < commandSequence.length; step++) {
            if (!this.isExecuting) break; // If user clicked Reset, stop immediately
            
            const cmd = commandSequence[step];
            await this.delay(650);
            
            if (!this.isExecuting) break;

            const nextPos = { ...this.mascotPos };

            if (cmd === 'moveForward') {
                if (this.mascotDir === 'N') nextPos.y--;
                if (this.mascotDir === 'E') nextPos.x++;
                if (this.mascotDir === 'S') nextPos.y++;
                if (this.mascotDir === 'W') nextPos.x--;
                
                // Bounds Collision check
                if (nextPos.x < 0 || nextPos.x >= lvl.gridSize || nextPos.y < 0 || nextPos.y >= lvl.gridSize) {
                    this.triggerCrash('bounds');
                    return;
                }

                // Obstacle collision check
                const hitObstacle = lvl.obstacles.some(o => o.x === nextPos.x && o.y === nextPos.y);
                if (hitObstacle) {
                    this.triggerCrash('obstacle');
                    return;
                }

                this.mascotPos = nextPos;
                synth.playStep();
                
                // Add path trail trace highlight
                const cell = document.getElementById(`cell-${this.mascotPos.x}-${this.mascotPos.y}`);
                if (cell) cell.classList.add('trail');
                
            } else if (cmd === 'turnRight') {
                const dirs = ['N', 'E', 'S', 'W'];
                const idx = dirs.indexOf(this.mascotDir);
                this.mascotDir = dirs[(idx + 1) % 4];
                synth.playStep();
                
            } else if (cmd === 'turnLeft') {
                const dirs = ['N', 'E', 'S', 'W'];
                const idx = dirs.indexOf(this.mascotDir);
                this.mascotDir = dirs[(idx + 3) % 4];
                synth.playStep();
                
            } else if (cmd === 'collect') {
                if (this.mascotPos.x === lvl.targetPos.x && this.mascotPos.y === lvl.targetPos.y) {
                    this.hasCollected = true;
                    synth.playStep();
                }
            }

            this.updateSpritesDOM();
        }

        // Program finished. Check success state
        if (this.isExecuting) {
            await this.delay(400);
            this.evaluateFinalState();
        }
    }

    triggerCrash(type) {
        synth.playFail();
        this.isExecuting = false;

        // Apply shake animation to mascot
        this.dom.spriteMascot.animate([
            { transform: 'translate(1px, 1px) rotate(0deg)' },
            { transform: 'translate(-1px, -2px) rotate(-1deg)' },
            { transform: 'translate(-3px, 0px) rotate(1deg)' },
            { transform: 'translate(0px, 2px) rotate(0deg)' },
            { transform: 'translate(1px, -1px) rotate(1deg)' },
            { transform: 'translate(-1px, 2px) rotate(-1deg)' },
            { transform: 'translate(-3px, 1px) rotate(0deg)' },
            { transform: 'translate(2px, 1px) rotate(-2deg)' },
            { transform: 'translate(-1px, -1px) rotate(1deg)' },
            { transform: 'translate(2px, 2px) rotate(0deg)' },
            { transform: 'translate(1px, -2px) rotate(-1deg)' }
        ], {
            duration: 500,
            iterations: 1
        });

        // Show HUD crash message overlay
        this.dom.statusTitle.className = 'status-title fail';
        this.dom.statusTitle.textContent = 'התנגשות! 💥';
        
        if (type === 'bounds') {
            this.dom.statusText.textContent = 'אופס! קודי ניסה לצאת מגבולות הרשת הדיגיטלית.';
        } else {
            this.dom.statusText.textContent = 'זהירות! קודי נכנס לתוך מחסום הלייזר הזוהר.';
        }
        
        this.dom.overlayActionBtn.textContent = 'נסו שוב 🔄';
        
        // Bind retry overlay button action
        this.dom.overlayActionBtn.onclick = () => {
            this.resetSimulation();
        };

        this.dom.statusOverlay.classList.add('visible');
    }

    evaluateFinalState() {
        this.isExecuting = false;
        const lvl = this.currentLevel();

        const onTarget = this.mascotPos.x === lvl.targetPos.x && this.mascotPos.y === lvl.targetPos.y;

        if (this.hasCollected && onTarget) {
            // SUCCESS!
            synth.playSuccess();
            this.confetti.start();

            this.dom.statusTitle.className = 'status-title success';
            this.dom.statusTitle.textContent = 'כל הכבוד! 🎉';
            this.dom.statusText.textContent = `פילסתם לקודי את הדרך בצורה מבריקה בשלב ${this.currentLevelNum}!`;
            
            if (this.currentLevelNum < 3) {
                this.dom.overlayActionBtn.textContent = 'מעבר לשלב הבא ❯';
            } else {
                this.dom.overlayActionBtn.textContent = 'סיום האתגר! 🏆';
            }

            this.dom.statusOverlay.classList.add('visible');
        } else {
            // FAILURE (Didn't pick up memory chip)
            synth.playFail();
            this.dom.statusTitle.className = 'status-title fail';
            this.dom.statusTitle.textContent = 'ניסיון יפה 🤖';
            
            if (!this.hasCollected && onTarget) {
                this.dom.statusText.textContent = 'הגעתם אל המטרה, אך שכחתם לאסוף את השבב בעזרת בלוק "אסוף שבב 💎".';
            } else {
                this.dom.statusText.textContent = 'הפקודות הסתיימו אך קודי לא הצליח להגיע אל שבב הזיכרון.';
            }

            this.dom.overlayActionBtn.textContent = 'נסו שוב 🔄';
            this.dom.overlayActionBtn.onclick = () => {
                this.resetSimulation();
            };

            this.dom.statusOverlay.classList.add('visible');
        }
    }

    resetSimulation() {
        this.isExecuting = false;
        this.confetti.stop();
        this.dom.statusOverlay.classList.remove('visible');

        const lvl = this.currentLevel();
        this.mascotPos = { ...lvl.startPos };
        this.mascotDir = lvl.startDir;
        this.hasCollected = false;

        document.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('trail'));
        this.updateSpritesDOM();
        this.resetSimulationUI();
    }

    resetSimulationUI() {
        this.dom.runBtn.disabled = false;
        this.dom.clearBtn.disabled = false;
        this.dom.resetBtn.disabled = true;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Modal popup actions
    openModal() {
        this.dom.leadModal.classList.add('open');
    }

    closeModal() {
        this.dom.leadModal.classList.remove('open');
        this.confetti.stop();
        this.resetSimulation();
    }

    // Handle Form Lead schedule submissions
    async handleLeadSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('lead-submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'שולח... ⏳';

        const parentName = document.getElementById('parent-name').value;
        const phone = document.getElementById('phone-number').value;
        const childName = document.getElementById('child-name').value;
        const childGrade = document.getElementById('child-grade').value;

        // Fetch date formats for lead scheduler
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const timeStr = today.toTimeString().split(' ')[0].substring(0, 5);

        const payload = {
            parentName,
            phone,
            childName,
            childGrade,
            eventTitle: 'אתגר קוד "נסה עכשיו" בהצלחה',
            eventDate: dateStr,
            eventTime: timeStr
        };

        try {
            console.log('Sending game-lead details to Base 44 api:', payload);
            const response = await fetch('/api/schedule', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                // Toggle success views inside modal popup card
                this.dom.leadFormContent.style.display = 'none';
                this.dom.leadSuccessContent.style.display = 'block';
            } else {
                const err = await response.json();
                alert(`שגיאה בשליחת הפרטים: ${err.error || 'אנא נסו שוב מאוחר יותר'}`);
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'שלחו ושריינו שיעור ניסיון! 🚀';
            }
        } catch (error) {
            console.error('Error submitting try-now lead form:', error);
            alert('שגיאה בחיבור לשרת. אנא בדקו את חיבור האינטרנט שלכם ונסו שנית.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'שלחו ושריינו שיעור ניסיון! 🚀';
        }
    }
}

// Instantiate and initialize game immediately since it is loaded dynamically as a module
const game = new GameController();
game.init();
