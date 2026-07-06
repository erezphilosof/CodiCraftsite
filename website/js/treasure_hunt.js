/* Codi's Mascot Treasure Hunt Game Engine */

class CodiTreasureHunt {
    constructor() {
        // Check for reset query parameter to allow easy re-testing
        if (window.location.search.includes('reset_hunt=true') || window.location.search.includes('reset')) {
            localStorage.removeItem('codi_faq_found');
            localStorage.removeItem('codi_gallery_found');
            localStorage.removeItem('codi_contact_found');
            localStorage.removeItem('codi_victory_viewed');
            console.log('Codi Hunt states reset successfully!');
        }

        this.states = {
            faq: localStorage.getItem('codi_faq_found') === 'true',
            gallery: localStorage.getItem('codi_gallery_found') === 'true',
            contact: localStorage.getItem('codi_contact_found') === 'true'
        };
        this.totalRobots = 3;
        this.audioCtx = null;
        this.confettiActive = false;
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupUI();
            this.bindEvents();
            this.checkVictoryOnLoad();
        });
    }

    setupUI() {
        // Create Floating Progress indicator if at least one robot is found
        const foundCount = this.getFoundCount();
        if (foundCount > 0 && foundCount < this.totalRobots) {
            this.createProgressIndicator(foundCount);
        }

        // Hide robots that are already found on their respective pages
        const currentPage = this.getCurrentPage();
        if (currentPage && this.states[currentPage]) {
            const robot = document.querySelector(`.hidden-codi[data-robot="${currentPage}"]`);
            if (robot) {
                robot.classList.add('found');
            }
        }
    }

    bindEvents() {
        // Find all robots on the page and bind click
        const robots = document.querySelectorAll('.hidden-codi');
        robots.forEach(robot => {
            const robotId = robot.getAttribute('data-robot');
            // If already found, don't allow clicks
            if (this.states[robotId]) {
                robot.classList.add('found');
                return;
            }

            robot.addEventListener('click', (e) => {
                e.stopPropagation();
                this.findRobot(robotId, robot);
            });
        });
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('faq.html')) return 'faq';
        if (path.includes('gallery.html')) return 'gallery';
        if (path.includes('contact.html')) return 'contact';
        return null;
    }

    getFoundCount() {
        return Object.values(this.states).filter(Boolean).length;
    }

    playChime() {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            
            const now = this.audioCtx.currentTime;
            // E5, G5, C6 (Bright retro major chord)
            const notes = [659.25, 783.99, 1046.50];
            
            notes.forEach((freq, idx) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                
                gain.gain.setValueAtTime(0.12, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.35);
                
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.35);
            });
        } catch (e) {
            console.error('Audio synthesis failed:', e);
        }
    }

    playVictorySound() {
        try {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            const now = this.audioCtx.currentTime;
            
            // Retro victory scale: C5 -> E5 -> G5 -> C6 (long)
            const notes = [523.25, 659.25, 783.99, 1046.50];
            
            notes.forEach((freq, idx) => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.12);
                
                const duration = idx === notes.length - 1 ? 0.8 : 0.2;
                gain.gain.setValueAtTime(0.15, now + idx * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + duration);
                
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                
                osc.start(now + idx * 0.12);
                osc.stop(now + idx * 0.12 + duration);
            });
        } catch (e) {
            console.error('Victory audio failed:', e);
        }
    }

    findRobot(id, element) {
        if (this.states[id]) return;

        // Set state
        this.states[id] = true;
        localStorage.setItem(`codi_${id}_found`, 'true');
        
        // Visual effects on click
        element.classList.add('found');
        this.playChime();

        const foundCount = this.getFoundCount();
        
        if (foundCount === this.totalRobots) {
            // Victory!
            const indicator = document.getElementById('codi-hunt-progress');
            if (indicator) indicator.classList.remove('visible');
            
            setTimeout(() => {
                this.showVictoryModal();
            }, 600);
        } else {
            // Show or update progress indicator
            this.updateProgressIndicator(foundCount);
        }
    }

    createProgressIndicator(count) {
        if (document.getElementById('codi-hunt-progress')) return;

        const progressHtml = `
            <div id="codi-hunt-progress">
                <span>🤖 מצאת את קודי הרובוט! (${count}/${this.totalRobots})</span>
                <div class="progress-dots">
                    <div class="progress-dot ${count >= 1 ? 'active' : ''}"></div>
                    <div class="progress-dot ${count >= 2 ? 'active' : ''}"></div>
                    <div class="progress-dot ${count >= 3 ? 'active' : ''}"></div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', progressHtml);
        
        setTimeout(() => {
            const indicator = document.getElementById('codi-hunt-progress');
            if (indicator) indicator.classList.add('visible');
        }, 100);
    }

    updateProgressIndicator(count) {
        const indicator = document.getElementById('codi-hunt-progress');
        if (!indicator) {
            this.createProgressIndicator(count);
            return;
        }

        indicator.querySelector('span').textContent = `🤖 מצאת את קודי הרובוט! (${count}/${this.totalRobots})`;
        const dots = indicator.querySelectorAll('.progress-dot');
        dots.forEach((dot, idx) => {
            if (idx < count) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        indicator.classList.add('visible');
    }

    checkVictoryOnLoad() {
        const foundCount = this.getFoundCount();
        // If already completed and user hasn't closed it permanently, show Victory modal on load?
        // Let's only trigger on the exact moment they find the 3rd, but if they reload we don't spam.
        // Actually, let's keep a victory viewed flag so we don't open it every reload.
        const victoryViewed = localStorage.getItem('codi_victory_viewed') === 'true';
        if (foundCount === this.totalRobots && !victoryViewed) {
            this.showVictoryModal();
        }
    }

    showVictoryModal() {
        if (document.getElementById('codi-victory-modal')) return;

        const modalHtml = `
            <div id="codi-victory-modal">
                <div class="victory-container">
                    <canvas id="victory-confetti"></canvas>
                    <div class="victory-content">
                        <div class="victory-badge">
                            <img src="assets/img/gallery/mascot_thumbsup.png" alt="Codi Robot Victory" style="width: 100%; height: 100%; object-fit: contain;">
                        </div>
                        <h2 class="victory-title">כל הכבוד האקר! 🏆</h2>
                        <div class="victory-subtitle">הסמכת: "חוקר סייבר מוסמך"</div>
                        <p class="victory-desc">
                            מצאתם את כל שלושת הרובוטים של קודי שמסתתרים באתר! הוכחתם סקרנות, עירנות וכישורי בילוש של מתכנתים אמיתיים.
                        </p>
                        
                        <div class="coupon-box">
                            <span class="coupon-label">הפרס: הילד/ה זכאי/ת לשיעור ניסיון חינם ללא כל התחייבות! 🎉</span>
                            <div class="coupon-row" style="margin-top: 10px;">
                                <a href="try-now.html" class="btn-close-victory" style="text-decoration: none; padding: 12px 30px; font-size: 1.1rem; display: inline-block;">שריינו שיעור ניסיון חינם עכשיו! 🚀</a>
                            </div>
                        </div>
                        
                        <button class="btn-close-victory" id="btn-close-victory" style="background: transparent; border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.6); box-shadow: none; margin-top: 10px; padding: 8px 24px; font-size: 0.95rem;">חזרה לאתר</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        setTimeout(() => {
            const modal = document.getElementById('codi-victory-modal');
            if (modal) modal.classList.add('visible');
            this.playVictorySound();
            this.startConfetti();
        }, 100);

        // Bind copy button
        document.addEventListener('click', (e) => {
            if (e.target && e.target.id === 'btn-copy-coupon') {
                const couponText = document.getElementById('victory-coupon').textContent;
                navigator.clipboard.writeText(couponText).then(() => {
                    e.target.textContent = 'הועתק! ✓';
                    setTimeout(() => { e.target.textContent = 'העתק קוד'; }, 2000);
                });
            }

            if (e.target && e.target.id === 'btn-close-victory') {
                const modal = document.getElementById('codi-victory-modal');
                if (modal) {
                    modal.classList.remove('visible');
                    localStorage.setItem('codi_victory_viewed', 'true');
                    this.confettiActive = false;
                    setTimeout(() => { modal.remove(); }, 600);
                }
            }
        });
    }

    startConfetti() {
        const canvas = document.getElementById('victory-confetti');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        
        const particles = [];
        const colors = ['#00ffea', '#00a2ff', '#b55fe6', '#ffea00', '#ff007f'];
        this.confettiActive = true;

        for (let i = 0; i < 70; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                r: Math.random() * 4 + 3,
                d: Math.random() * canvas.height,
                color: colors[Math.floor(Math.random() * colors.length)],
                tilt: Math.random() * 10 - 5,
                tiltAngleIncremental: Math.random() * 0.07 + 0.02,
                tiltAngle: 0
            });
        }

        const draw = () => {
            if (!this.confettiActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, idx) => {
                p.tiltAngle += p.tiltAngleIncremental;
                p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
                p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;
                
                if (p.y > canvas.height) {
                    particles[idx] = {
                        x: Math.random() * canvas.width,
                        y: -20,
                        r: p.r,
                        d: p.d,
                        color: p.color,
                        tilt: p.tilt,
                        tiltAngleIncremental: p.tiltAngleIncremental,
                        tiltAngle: p.tiltAngle
                    };
                }
                
                ctx.beginPath();
                ctx.lineWidth = p.r;
                ctx.strokeStyle = p.color;
                ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
                ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
                ctx.stroke();
            });
            
            requestAnimationFrame(draw);
        };
        
        draw();
    }
}

// Instantiate globally
window.codiHunt = new CodiTreasureHunt();
