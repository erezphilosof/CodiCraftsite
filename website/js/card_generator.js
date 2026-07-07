/* CodiCraft Guild Card Creator Engine */

class CardGenerator {
    constructor() {
        this.professions = {
            minecraft: {
                title: 'מפתח מיינקראפט',
                color: '#10b981', // Emerald Green
                glow: 'rgba(16, 185, 129, 0.4)',
                stats: { logic: 88, creativity: 98, coding: 82, hardware: 65 }
            },
            robotics: {
                title: 'מהנדס רובוטיקה',
                color: '#8b5cf6', // Violet Purple
                glow: 'rgba(139, 92, 246, 0.4)',
                stats: { logic: 92, creativity: 85, coding: 88, hardware: 99 }
            },
            ai: {
                title: 'מומחה בינה מלאכותית',
                color: '#06b6d4', // Cyan Blue
                glow: 'rgba(6, 182, 212, 0.4)',
                stats: { logic: 99, creativity: 82, coding: 95, hardware: 72 }
            },
            gamedev: {
                title: 'מפתח משחקים',
                color: '#ef4444', // Coral Red
                glow: 'rgba(239, 68, 68, 0.4)',
                stats: { logic: 85, creativity: 96, coding: 92, hardware: 78 }
            }
        };

        this.selectedProfession = 'minecraft';
        this.selectedAvatar = 'assets/img/gallery/mascot_standing_front.png'; // default
        
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.cacheDOM();
            this.bindEvents();
            this.updatePreview();
            this.setupCardTilt();
        });
    }

    cacheDOM() {
        this.nameInput = document.getElementById('cg-name-input');
        this.profSelect = document.getElementById('cg-profession-select');
        this.promptInput = document.getElementById('cg-prompt-input');
        this.btnGenerateAi = document.getElementById('btn-generate-ai');
        this.loaderContainer = document.getElementById('card-loader-container');
        
        this.cardElement = document.getElementById('codicraft-card');
        this.cardName = document.getElementById('card-preview-name');
        this.cardBadge = document.getElementById('card-preview-badge');
        this.cardImg = document.getElementById('card-preview-img');
        
        this.barLogic = document.getElementById('bar-logic');
        this.barCreativity = document.getElementById('bar-creativity');
        this.barCoding = document.getElementById('bar-coding');
        this.barHardware = document.getElementById('bar-hardware');
        
        this.valLogic = document.getElementById('val-logic');
        this.valCreativity = document.getElementById('val-creativity');
        this.valCoding = document.getElementById('val-coding');
        this.valHardware = document.getElementById('val-hardware');
        
        this.btnDownload = document.getElementById('btn-download-card');

        // New camera & file upload elements
        this.btnUploadAvatar = document.getElementById('btn-upload-avatar');
        this.btnCameraAvatar = document.getElementById('btn-camera-avatar');
        this.fileInput = document.getElementById('cg-file-input');
        
        this.cameraModal = document.getElementById('camera-modal');
        this.closeCameraBtn = document.getElementById('close-camera-modal');
        this.videoStream = document.getElementById('camera-stream');
        this.btnCapturePhoto = document.getElementById('btn-capture-photo');
        this.stream = null;
    }

    bindEvents() {
        // Name change listener
        if (this.nameInput) {
            this.nameInput.addEventListener('input', () => this.updatePreview());
        }

        // Profession change listener
        if (this.profSelect) {
            this.profSelect.addEventListener('change', (e) => {
                this.selectedProfession = e.target.value;
                this.updatePreview();
            });
        }

        // AI generate button
        if (this.btnGenerateAi) {
            this.btnGenerateAi.addEventListener('click', () => this.generateAvatar());
        }

        // Download button
        if (this.btnDownload) {
            this.btnDownload.addEventListener('click', () => this.downloadCard());
        }

        // File upload trigger
        if (this.btnUploadAvatar && this.fileInput) {
            this.btnUploadAvatar.addEventListener('click', () => this.fileInput.click());
            this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Camera trigger & modal actions
        if (this.btnCameraAvatar) {
            this.btnCameraAvatar.addEventListener('click', () => this.openCamera());
        }
        if (this.closeCameraBtn) {
            this.closeCameraBtn.addEventListener('click', () => this.closeCamera());
        }
        if (this.btnCapturePhoto) {
            this.btnCapturePhoto.addEventListener('click', () => this.captureSelfie());
        }
    }

    async openCamera() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('מצלמה אינה נתמכת בדפדפן או במכשיר זה. אנא העלו תמונה מהגלריה.');
            return;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 480, height: 480 }
            });
            if (this.videoStream) {
                this.videoStream.srcObject = this.stream;
            }
            if (this.cameraModal) {
                this.cameraModal.style.display = 'flex';
            }
        } catch (err) {
            console.error('Error opening camera:', err);
            alert('לא הצלחנו לגשת למצלמה. ודאו שאישרתם הרשאות מצלמה או בחרו באפשרות העלאת תמונה.');
        }
    }

    closeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoStream) {
            this.videoStream.srcObject = null;
        }
        if (this.cameraModal) {
            this.cameraModal.style.display = 'none';
        }
    }

    captureSelfie() {
        if (!this.videoStream || !this.stream) return;

        try {
            const canvas = document.createElement('canvas');
            canvas.width = 480;
            canvas.height = 480;
            const ctx = canvas.getContext('2d');
            
            // Mirror selfie naturally
            ctx.translate(480, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(this.videoStream, 0, 0, 480, 480);
            
            const dataUrl = canvas.toDataURL('image/png');
            this.selectedAvatar = dataUrl;
            this.updatePreview();
            this.closeCamera();
        } catch (err) {
            console.error('Error capturing photo:', err);
            alert('שגיאה בלכידת התמונה. אנא נסו שוב.');
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('אנא בחרו קובץ תמונה תקין.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            this.selectedAvatar = event.target.result;
            this.updatePreview();
        };
        reader.onerror = () => {
            alert('שגיאה בקריאת הקובץ. נסו שוב.');
        };
        reader.readAsDataURL(file);
    }

    translateHebrew(text) {
        let t = text.toLowerCase().trim();
        const dict = {
            'רובוט': 'robot',
            'מתכנת': 'programmer',
            'מיינקראפט': 'minecraft',
            'נינג\'ה': 'ninja',
            'אדום': 'red',
            'כחול': 'blue',
            'ירוק': 'green',
            'צהוב': 'yellow',
            'סגול': 'purple',
            'זהב': 'gold',
            'כתום': 'orange',
            'לבן': 'white',
            'שחור': 'black',
            'חרב': 'sword',
            'מגן': 'shield',
            'קסדה': 'helmet',
            'משקפיים': 'glasses',
            'אוזניות': 'headphones',
            'חלל': 'space',
            'אש': 'fire',
            'מים': 'water',
            'ברק': 'lightning',
            'גיימר': 'gamer',
            'מחשב': 'computer',
            'סייבר': 'cyber',
            'עתידני': 'futuristic',
            'זוהר': 'glowing',
            'דיגיטלי': 'digital',
            'כנפיים': 'wings',
            'חתול': 'cat',
            'כלב': 'dog',
            'קטן': 'small',
            'חמוד': 'cute',
            'מצחיק': 'funny',
            'ענק': 'huge',
            'מתכת': 'metal',
            'ברזל': 'iron'
        };
        // Replace words
        for (const [heb, eng] of Object.entries(dict)) {
            t = t.replace(new RegExp(heb, 'g'), eng);
        }
        return t;
    }

    async generateAvatar() {
        const promptVal = this.promptInput ? this.promptInput.value.trim() : '';
        if (!promptVal) {
            alert('אנא תארו קודם את רובוט החלומות שלכם בשדה הטקסט!');
            return;
        }

        // Disable button and show loader
        this.btnGenerateAi.disabled = true;
        const originalBtnText = this.btnGenerateAi.innerHTML;
        this.btnGenerateAi.innerHTML = 'מחשב... 🤖';
        
        if (this.loaderContainer) {
            this.loaderContainer.classList.add('active');
        }
        if (this.cardImg) {
            this.cardImg.classList.add('hidden');
        }

        try {
            const userPromptTranslated = this.translateHebrew(promptVal);
            // Construct the optimal prompt format for Pollinations AI
            const basePrompt = `3D cute small pixel-art robot, ${userPromptTranslated}, gaming mascot, shiny neon glow, high quality render, transparent background`;
            const encodedPrompt = encodeURIComponent(basePrompt);
            const seed = Math.floor(Math.random() * 10000000);
            const imageUrl = `https://image.pollinations.ai/p/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}`;

            console.log('Generating AI Avatar with prompt:', basePrompt);

            // Preload image with Anonymous Cross-Origin to prevent Canvas Tainting
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });

            // Update preview
            this.selectedAvatar = imageUrl;
            if (this.cardImg) {
                this.cardImg.src = imageUrl;
            }

        } catch (err) {
            console.error('Failed to generate AI Avatar:', err);
            alert('אופס! השרת עמוס כרגע, נסה שנית בעוד מספר שניות.');
        } finally {
            this.btnGenerateAi.disabled = false;
            this.btnGenerateAi.innerHTML = originalBtnText;
            if (this.loaderContainer) {
                this.loaderContainer.classList.remove('active');
            }
            if (this.cardImg) {
                this.cardImg.classList.remove('hidden');
            }
        }
    }

    updatePreview() {
        if (!this.cardElement) return;

        // Name
        const name = this.nameInput ? this.nameInput.value.trim() : '';
        this.cardName.textContent = name || 'השם שלך';

        // Profession data
        const prof = this.professions[this.selectedProfession];
        this.cardBadge.textContent = prof.title;
        
        // Colors & Neon Glow
        this.cardElement.style.borderColor = prof.color;
        this.cardElement.style.boxShadow = `0 15px 40px rgba(0, 0, 0, 0.6), 0 0 25px ${prof.glow}`;
        this.cardBadge.style.borderColor = prof.color;
        this.cardBadge.style.background = `${prof.color}25`; // transparent
        this.cardBadge.style.color = prof.color;

        // Avatar Image
        if (this.cardImg && this.cardImg.src !== this.selectedAvatar) {
            this.cardImg.src = this.selectedAvatar;
        }

        // Stats fill
        const stats = prof.stats;
        this.animateBar(this.barLogic, this.valLogic, stats.logic, prof.color);
        this.animateBar(this.barCreativity, this.valCreativity, stats.creativity, prof.color);
        this.animateBar(this.barCoding, this.valCoding, stats.coding, prof.color);
        this.animateBar(this.barHardware, this.valHardware, stats.hardware, prof.color);
    }

    animateBar(bar, valEl, value, color) {
        if (!bar || !valEl) return;
        bar.style.width = `${value}%`;
        bar.style.backgroundColor = color;
        valEl.textContent = value;
        valEl.style.color = color;
    }

    setupCardTilt() {
        const card = this.cardElement;
        if (!card) return;

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            
            // Calculate tilt angle
            const angleX = (yc - y) / 10;
            const angleY = (x - xc) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
        });
    }

    async downloadCard() {
        const originalText = this.btnDownload.textContent;
        this.btnDownload.textContent = 'מייצר כרטיס... ⏳';
        this.btnDownload.disabled = true;

        try {
            // Create Canvas
            const canvas = document.createElement('canvas');
            canvas.width = 600; // Double size for high resolution
            canvas.height = 900;
            const ctx = canvas.getContext('2d');
            ctx.direction = 'rtl'; // Support RTL for Hebrew texts natively

            const prof = this.professions[this.selectedProfession];

            // 1. Draw Card Background (Radial Gradient)
            const bgGrad = ctx.createRadialGradient(300, 450, 50, 300, 450, 600);
            bgGrad.addColorStop(0, '#1e293b');
            bgGrad.addColorStop(1, '#080c18');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, 600, 900);

            // 2. Draw Tech Grid inside Avatar Frame area (centered)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
            ctx.lineWidth = 1;
            for (let i = 40; i < 560; i += 30) {
                ctx.beginPath();
                ctx.moveTo(i, 110);
                ctx.lineTo(i, 450);
                ctx.stroke();
            }
            for (let i = 110; i < 450; i += 30) {
                ctx.beginPath();
                ctx.moveTo(40, i);
                ctx.lineTo(560, i);
                ctx.stroke();
            }

            // 3. Draw Neon Border with Glow
            ctx.shadowColor = prof.color;
            ctx.shadowBlur = 30;
            ctx.strokeStyle = prof.color;
            ctx.lineWidth = 8;
            // Draw rounded rectangle for outer border
            this.drawRoundedRect(ctx, 20, 20, 560, 860, 30);
            ctx.stroke();
            ctx.shadowBlur = 0; // reset shadow

            // 4. Draw Header
            // Name
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px "Secular One", Arial, sans-serif';
            ctx.textAlign = 'right';
            const name = this.nameInput ? this.nameInput.value.trim() : '';
            ctx.fillText(name || 'השם שלך', 520, 80);

            // Badge / Profession
            ctx.strokeStyle = prof.color;
            ctx.lineWidth = 2;
            ctx.fillStyle = `${prof.color}20`; // transparent
            this.drawRoundedRect(ctx, 45, 45, 200, 50, 10);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = prof.color;
            ctx.font = 'bold 22px "Rubik", Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(prof.title, 145, 70);
            ctx.textBaseline = 'alphabetic'; // reset

            // 5. Draw Avatar Image Frame (Rounded Rect)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            this.drawRoundedRect(ctx, 40, 110, 520, 340, 20);
            ctx.stroke();

            // Load and Draw Avatar Image
            const img = new Image();
            img.crossOrigin = 'anonymous'; // CRITICAL: prevent tainted canvas security error
            img.src = this.selectedAvatar;
            await new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if image fails to load
            });

            // Center image inside avatar frame (40, 110, 520, 340)
            const scale = Math.min(420 / img.width, 280 / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = 40 + (520 - w) / 2;
            const y = 110 + (340 - h) / 2;

            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 20;
            ctx.drawImage(img, x, y, w, h);
            ctx.shadowBlur = 0; // reset

            // 6. Draw Stats
            const stats = prof.stats;
            const statsConfig = [
                { name: 'לוגיקה', val: stats.logic },
                { name: 'יצירתיות', val: stats.creativity },
                { name: 'כתיבת קוד', val: stats.coding },
                { name: 'אלקטרוניקה', val: stats.hardware }
            ];

            let statY = 510;
            statsConfig.forEach(s => {
                // Stat label
                ctx.fillStyle = '#94a3b8';
                ctx.font = 'bold 24px "Rubik", Arial, sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText(s.name, 520, statY);

                // Progress Bar Background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
                this.drawRoundedRect(ctx, 160, statY - 20, 230, 16, 8);
                ctx.fill();

                // Progress Bar Fill
                ctx.fillStyle = prof.color;
                this.drawRoundedRect(ctx, 160 + (230 - (230 * s.val / 100)), statY - 20, 230 * s.val / 100, 16, 8);
                ctx.fill();

                // Stat Value
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 26px "Courier New", monospace';
                ctx.textAlign = 'left';
                ctx.fillText(s.val.toString(), 60, statY + 2);

                statY += 60;
            });

            // 7. Draw Footer Divider
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(40, 770);
            ctx.lineTo(560, 770);
            ctx.stroke();

            // 8. Draw Branding Footer
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 26px "Secular One", Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('תלמיד/ה חדש/ה ב-CodiCraft 🚀', 520, 825);

            ctx.fillStyle = '#64748b';
            ctx.font = '20px "Rubik", Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('codicraft.co.il', 80, 822);

            // 9. Download Trigger
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `CodiCraft_Guild_${name || 'Player'}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error('Failed to generate card:', err);
            alert('אופס! נראה שיש שגיאה בייצור כרטיס השחקן. נסו שוב.');
        } finally {
            this.btnDownload.textContent = originalText;
            this.btnDownload.disabled = false;
        }
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }
}

// Instantiate
new CardGenerator();
