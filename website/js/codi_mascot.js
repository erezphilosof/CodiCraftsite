/**
 * 🤖 Codi — The CodiCraft 3D Robot Mascot
 * Eyes track the cursor, occasional blinking, random speech bubbles.
 */
(function () {
    'use strict';

    /* ── Speech lines ──────────────────────────────────────── */
    const SPEECHES = [
        'היי! בואו ללמוד לקודד! 🚀',
        'ידעתם? גם אני נבניתי בקוד! 💻',
        'חוג רובוטיקה מתחיל בקרוב! 🤖',
        'נסו את משחקי הקוד שלנו! 🎮',
        'שיעור ניסיון חינם מחכה לכם! ✨',
        'בואו נבנה רובוט ביחד! 🔧',
        'קוד + יצירתיות = קסם! 🧠',
        'לחצו עליי לשיחה! 💬'
    ];

    /* ── Build the mascot DOM ──────────────────────────────── */
    function buildMascot() {
        const container = document.createElement('div');
        container.id = 'codi-mascot-container';
        container.setAttribute('aria-label', 'Codi — הרובוט של CodiCraft');
        container.innerHTML = `
            <div class="codi-speech" id="codi-speech"></div>
            <div class="codi-robot" id="codi-robot">
                <div class="codi-antenna">
                    <div class="codi-antenna-tip"></div>
                </div>
                <div class="codi-head" id="codi-head">
                    <div class="codi-eyes">
                        <div class="codi-eye" id="codi-eye-left">
                            <div class="codi-pupil" id="codi-pupil-left"></div>
                        </div>
                        <div class="codi-eye" id="codi-eye-right">
                            <div class="codi-pupil" id="codi-pupil-right"></div>
                        </div>
                    </div>
                    <div class="codi-mouth"></div>
                </div>
                <div class="codi-arm codi-arm-left"></div>
                <div class="codi-arm codi-arm-right"></div>
                <div class="codi-body">
                    <div class="codi-chest-light"></div>
                    <div class="codi-chest-lines">
                        <div class="codi-chest-line"></div>
                        <div class="codi-chest-line"></div>
                        <div class="codi-chest-line"></div>
                    </div>
                </div>
                <div class="codi-feet">
                    <div class="codi-foot"></div>
                    <div class="codi-foot"></div>
                </div>
                <div class="codi-shadow"></div>
            </div>
        `;
        document.body.appendChild(container);
        return container;
    }

    /* ── Eye-tracking ─────────────────────────────────────── */
    function initEyeTracking() {
        const pupilLeft  = document.getElementById('codi-pupil-left');
        const pupilRight = document.getElementById('codi-pupil-right');
        const head       = document.getElementById('codi-head');
        if (!pupilLeft || !pupilRight || !head) return;

        const MAX_PUPIL = 3.5;  // px
        const MAX_HEAD_X = 8;   // deg
        const MAX_HEAD_Y = 6;   // deg

        function onPointerMove(e) {
            const cx = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            const cy = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

            const rect = head.getBoundingClientRect();
            const hx = rect.left + rect.width / 2;
            const hy = rect.top  + rect.height / 2;

            const dx = cx - hx;
            const dy = cy - hy;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            // Normalize
            const nx = dx / dist;
            const ny = dy / dist;

            // Clamp pupil movement
            const px = nx * MAX_PUPIL;
            const py = ny * MAX_PUPIL;

            pupilLeft.style.transform  = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;
            pupilRight.style.transform = `translate(calc(-50% + ${px}px), calc(-50% + ${py}px))`;

            // Tilt head slightly toward cursor
            const tiltY = -(nx * MAX_HEAD_X);  // rotate Y — left/right
            const tiltX =  (ny * MAX_HEAD_Y);  // rotate X — up/down
            head.style.transform = `translateX(-50%) rotateY(${tiltY}deg) rotateX(${tiltX}deg)`;
        }

        document.addEventListener('mousemove', onPointerMove, { passive: true });
        document.addEventListener('touchmove', onPointerMove, { passive: true });
    }

    /* ── Blinking ─────────────────────────────────────────── */
    function initBlinking() {
        const eyes = document.querySelectorAll('.codi-eye');
        if (!eyes.length) return;

        function blink() {
            eyes.forEach(eye => {
                eye.classList.add('blinking');
                setTimeout(() => eye.classList.remove('blinking'), 150);
            });
            // Next blink between 2-6 seconds
            setTimeout(blink, 2000 + Math.random() * 4000);
        }
        setTimeout(blink, 3000);
    }

    /* ── Speech bubbles ───────────────────────────────────── */
    function initSpeech() {
        const bubble = document.getElementById('codi-speech');
        if (!bubble) return;

        let index = 0;

        function showSpeech() {
            bubble.textContent = SPEECHES[index];
            bubble.classList.add('visible');

            setTimeout(() => {
                bubble.classList.remove('visible');
            }, 3500);

            index = (index + 1) % SPEECHES.length;
            // Next speech in 12-22 seconds
            setTimeout(showSpeech, 12000 + Math.random() * 10000);
        }

        // First speech after 5 seconds
        setTimeout(showSpeech, 5000);
    }

    /* ── Click → scroll to contact ────────────────────────── */
    function initClick() {
        const container = document.getElementById('codi-mascot-container');
        if (!container) return;

        container.addEventListener('click', () => {
            // Try to open chat agent if available
            const chatWindow = document.getElementById('chat-agent-window');
            const chatBubble = document.getElementById('chat-agent-bubble');
            if (chatWindow && chatBubble) {
                chatWindow.classList.remove('hidden');
                chatBubble.style.display = 'none';
            }
        });
    }

    /* ── Initialize ───────────────────────────────────────── */
    function init() {
        buildMascot();
        initEyeTracking();
        initBlinking();
        initSpeech();
        initClick();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
