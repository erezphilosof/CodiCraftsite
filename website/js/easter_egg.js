// easter_egg.js
(function() {
    // Secret sequence: Up, Up, Down, Down
    const secretCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'];
    let inputSequence = [];

    document.addEventListener('keydown', function(e) {
        // Add the pressed key to the sequence
        inputSequence.push(e.key);

        // Keep the sequence length equal to the secret code length
        if (inputSequence.length > secretCode.length) {
            inputSequence.shift();
        }

        // Check if the input sequence matches the secret code
        if (inputSequence.join(',') === secretCode.join(',')) {
            triggerEasterEgg();
            inputSequence = []; // Reset sequence after triggering
        }
    });

    function triggerEasterEgg() {
        // Prevent triggering multiple times at once
        if (document.getElementById('easter-egg-overlay')) return;

        // 1. Play a cool 8-bit success sound using Web Audio API
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const now = ctx.currentTime;
            
            const freqs = [330, 392, 523, 659, 784, 1046]; // E4, G4, C5, E5, G5, C6
            
            freqs.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);
                
                gain.gain.setValueAtTime(0.1, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.1);

                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.1);
            });
        } catch (e) {
            console.log("Audio not supported or muted");
        }

        // 2. Create the hacker overlay
        const overlay = document.createElement('div');
        overlay.id = 'easter-egg-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontFamily = "'Courier New', Courier, monospace";
        overlay.style.color = '#0f0';
        overlay.style.overflow = 'hidden';
        overlay.style.cursor = 'pointer';

        // Add Matrix digital rain background canvas
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '1';
        overlay.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const letters = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];
        for(let x = 0; x < columns; x++) drops[x] = 1;

        function drawMatrix() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px arial';
            for(let i = 0; i < drops.length; i++) {
                const text = letters.charAt(Math.floor(Math.random() * letters.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }
        const matrixInterval = setInterval(drawMatrix, 33);

        // Add the message container
        const messageContainer = document.createElement('div');
        messageContainer.style.position = 'relative';
        messageContainer.style.zIndex = '2';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.backgroundColor = 'rgba(0, 20, 0, 0.8)';
        messageContainer.style.border = '2px solid #0f0';
        messageContainer.style.padding = '40px';
        messageContainer.style.borderRadius = '10px';
        messageContainer.style.boxShadow = '0 0 30px #0f0';
        messageContainer.style.transform = 'scale(0.1)';
        messageContainer.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

        messageContainer.innerHTML = `
            <div style="font-size: 5rem; margin-bottom: 20px;">👾</div>
            <h1 style="font-size: 3rem; margin: 0 0 10px 0; text-shadow: 0 0 10px #0f0;">כל הכבוד האקר!</h1>
            <p style="font-size: 1.5rem; margin: 0; color: #aaffaa;">מצאת את הקוד הסודי של קודיקראפט</p>
            <p style="font-size: 1rem; margin-top: 30px; color: #55ff55; opacity: 0.8;">(לחצו בכל מקום כדי לסגור)</p>
        `;

        overlay.appendChild(messageContainer);
        document.body.appendChild(overlay);

        // Animate message pop-in
        setTimeout(() => {
            messageContainer.style.transform = 'scale(1)';
        }, 50);

        // Click to close
        overlay.addEventListener('click', function() {
            clearInterval(matrixInterval);
            overlay.style.opacity = '0';
            overlay.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                overlay.remove();
            }, 300);
        });
    }

    // Global Mobile Navbar Toggle Handler
    document.addEventListener('DOMContentLoaded', function() {
        const menuToggle = document.querySelector("#ui .menu");
        if (menuToggle) {
            const isMainPage = document.getElementById('webglCanvas') !== null;
            const hasInlineScript = window.location.pathname.endsWith('services.html') || 
                                    window.location.pathname.endsWith('faq.html') || 
                                    window.location.pathname.endsWith('contact.html');
            if (!isMainPage && !hasInlineScript && !menuToggle.dataset.menuListenerAttached) {
                menuToggle.dataset.menuListenerAttached = "true";
                menuToggle.addEventListener('click', function(e) {
                    e.stopPropagation();
                    menuToggle.classList.toggle('active');
                });
            }
        }
        
        // Also close the menu when a link inside the nav is clicked
        const navLinks = document.querySelectorAll('#ui nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (menuToggle && menuToggle.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                }
            });
        });
    });
})();
