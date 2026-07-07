// Codi's Time Machine - Frontend Controller

document.addEventListener('DOMContentLoaded', () => {
    const tmForm = document.getElementById('time-machine-form');
    const tmPortalLoading = document.getElementById('tm-portal-loading');
    const tmFutureResult = document.getElementById('tm-future-result');
    const tmLoadingStep = document.getElementById('tm-loading-step');
    
    // Inputs
    const childNameInput = document.getElementById('tm-child-name');
    const childFieldInput = document.getElementById('tm-child-field');
    const childDreamInput = document.getElementById('tm-child-dream');
    
    // Result elements
    const magStoryTitle = document.getElementById('mag-story-title');
    const magStorySub = document.getElementById('mag-story-sub');
    const magStoryText = document.getElementById('mag-story-text');
    const magMascotPic = document.getElementById('mag-mascot-pic');
    const magStoryBadge = document.getElementById('mag-story-badge');
    const magAchievementText = document.getElementById('mag-achievement-text');
    
    // Actions
    const tmShareWhatsapp = document.getElementById('tm-share-whatsapp');
    const tmResetBtn = document.getElementById('tm-reset-btn');

    let currentStory = null;
    let stopWarp = null;

    if (tmForm) {
        tmForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const childName = childNameInput.value.trim();
            const gender = document.querySelector('input[name="tm-gender"]:checked').value;
            const field = childFieldInput.value;
            const dream = childDreamInput.value.trim();

            if (!childName || !dream) return;

            // 1. Play futuristic portal sound
            playWarpSound();

            // 2. Hide form, show portal loading
            tmForm.style.display = 'none';
            tmPortalLoading.style.display = 'flex';

            // Start 3D Warp Tunnel animation!
            if (stopWarp) stopWarp();
            stopWarp = startWarpTunnel();

            // 3. Loading animation steps simulation
            const steps = [
                'מטעין קבלים דיגיטליים... 🔋',
                'מתחבר לשנת 2045... 🌐',
                'מנתח חלומות ותחביבים... 🧠',
                'מריץ הדמיות AI עתידיות... 🔮',
                'מייצר כתבת שער חגיגית... 📰'
            ];

            let stepIdx = 0;
            const stepInterval = setInterval(() => {
                if (stepIdx < steps.length) {
                    tmLoadingStep.textContent = steps[stepIdx];
                    stepIdx++;
                }
            }, 600);

            try {
                // 4. Fetch future story from server
                const response = await fetch('/api/time-machine', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ childName, gender, field, dream })
                });

                if (!response.ok) throw new Error('API failed');

                const data = await response.json();
                currentStory = data;

                // Wait at least 3.5 seconds total for maximum dramatic effect
                setTimeout(() => {
                    clearInterval(stepInterval);
                    if (stopWarp) {
                        stopWarp();
                        stopWarp = null;
                    }
                    showResult(data, childName, gender);
                }, 3500);

            } catch (err) {
                console.error("Time Machine warp error, using client-side generator:", err);
                // Client-side fallback if server fails
                const fallback = getClientFallbackStory(childName, gender, field, dream);
                currentStory = fallback;
                
                setTimeout(() => {
                    clearInterval(stepInterval);
                    if (stopWarp) {
                        stopWarp();
                        stopWarp = null;
                    }
                    showResult(fallback, childName, gender);
                }, 3500);
            }
        });
    }

    if (tmResetBtn) {
        tmResetBtn.addEventListener('click', () => {
            tmFutureResult.style.display = 'none';
            tmPortalLoading.style.display = 'none';
            tmForm.style.display = 'grid';
            if (stopWarp) {
                stopWarp();
                stopWarp = null;
            }
            
            // Focus back to name input
            childNameInput.focus();
        });
    }

    if (tmShareWhatsapp && tmForm) {
        tmShareWhatsapp.addEventListener('click', () => {
            if (!currentStory) return;
            
            const childName = childNameInput.value.trim();
            const text = `וואו! ראיתם מה ${childName} יעשה/תעשה בשנת 2045? 🔮 הכנסו למכונת הזמן של קודיקראפט וגלו גם אתם את העתיד של ילדכם: ${window.location.origin}`;
            
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
            window.open(whatsappUrl, '_blank');
        });
    }

    function showResult(data, childName, gender) {
        tmPortalLoading.style.display = 'none';
        tmFutureResult.style.display = 'block';

        // Set content
        magStoryTitle.textContent = data.title;
        magStorySub.textContent = data.sub;
        magStoryText.innerHTML = data.text.replace(/\n\n/g, '<br><br>');
        
        // Resolve image source based on data.imageUrl or data.mascot filename
        if (data.imageUrl) {
            magMascotPic.src = data.imageUrl;
            const magSidebarLabel = document.getElementById('mag-sidebar-label');
            if (magSidebarLabel) {
                magSidebarLabel.textContent = `ההמצאה של ${childName} 🚀`;
            }
        } else if (data.mascot) {
            magMascotPic.src = `assets/img/gallery/${data.mascot}`;
            const magSidebarLabel = document.getElementById('mag-sidebar-label');
            if (magSidebarLabel) {
                magSidebarLabel.textContent = "קודי הרובוט מדווח מהעתיד";
            }
        }
        
        // Customize badge and award based on gender
        const isMale = gender !== 'female';
        magStoryBadge.textContent = isMale ? 'מתכנת על 🚀' : 'מתכנתת על 🚀';
        magAchievementText.textContent = isMale ? 'פרס החדשנות 2045 🏆' : 'פרסת החדשנות 2045 🏆';
    }

    // Play a procedurally generated futuristic synthesizer sound using the Web Audio API
    function playWarpSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            // 1. Synth Oscillator
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, ctx.currentTime);
            
            // Sweep frequency up like a warp transition
            osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 2.0);

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 2.5);

            // 2. Add some laser beams
            setTimeout(() => {
                const osc2 = ctx.createOscillator();
                const gain2 = ctx.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(800, ctx.currentTime);
                osc2.frequency.linearRampToValueAtTime(200, ctx.currentTime + 0.8);
                gain2.gain.setValueAtTime(0.1, ctx.currentTime);
                gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
                osc2.connect(gain2);
                gain2.connect(ctx.destination);
                osc2.start();
                osc2.stop(ctx.currentTime + 0.8);
            }, 500);

        } catch (e) {
            console.log('Web Audio not supported or blocked by gesture');
        }
    }

    // Client-side fallback generator if server goes offline
    function getClientFallbackStory(name, gender, field, dream) {
        const isMale = gender !== 'female';
        const suffix = isMale ? '' : 'ה';
        const suffixEd = isMale ? 'בן' : 'בת';
        
        let mascot = 'mascot_gamedev.png';
        let storyTitle = '';
        let storySub = '';
        let storyText = '';

        switch(field) {
            case 'games':
                mascot = 'game_platformer_powerups.png';
                storyTitle = `הכירו את ${name}: ${suffixEd}-הלגו שהקימ${isMale?'':'ה'} את אימפריית הגיימינג הגדולה בעולם!`;
                storySub = `מגזין העתיד חושף: איך ילד${isMale?'':'ה'} שחלמ${isMale?'':'ה'} ${dream} שינה את הדרך שבה האנושות משחקת.`;
                storyText = `בשנת 2045, ${name} (היום ${suffixEd} 29) נחשב${suffix} לאחד השמות החזקים ביותר בתעשיית המציאות המדומה והגיימינג הגלובלית. הכל התחיל בשנת 2026, כשהשתתפ${suffix} בחוג פיתוח משחקים בבית הספר לקוד 'קודיקראפט'.\n\nשם, בין שורות הקוד של משחק הדו-ממד הראשון ${isMale?'שלו':'שלה'}, ${name} פיתח${suffix} את הכלים הראשונים שהובילו לפריצת הדרך הגדולה: פלטפורמה אינטראקטיבית שמאפשרת לאנשים ברחבי העולם להתחבר ולשחק יחד תוך כדי שהם מגשימים את החלום הגדול שלהם - ${dream}.\n\nהשבוע, החברה של ${name} הוכרזה כחברת החדשנות המשפיעה ביותר של העשור, והוכיחה שזמן מסך יכול להפוך לקריירה משנה מציאות.`;
                break;
            case 'minecraft':
                mascot = 'game_mario_space_jump.png';
                storyTitle = `כך ${name} הפכ${isMale?'':'ה'} את מיינקראפט למנוע לפיתוח ערים חכמות!`;
                storySub = `מיינקראפט כבר מזמן לא רק משחק: איך הכלים ש${name} פיתח${suffix} בילדותו סייעו להגשים את החלום: ${dream}.`;
                storyText = `בשנת 2045, מתכנני הערים הגדולות בעולם משתמשים בתוכנה שפיתח${suffix} ${name}. התוכנה, המבוססת על לוגיקת הבנייה והקוד של מיינקראפט, מאפשרת לתכנן תשתיות ירוקות ולבנות בצורה חכמה.\n\n"בילדותי, כולם חשבו שאני רק משחק במיינקראפט", מספר${suffix} ${name} בחיוך בראיון חגיגי, "אבל בחוג בקודיקראפט בשנת 2026 לימדו אותי לקחת את המשחק ולכתוב קוד אמיתי לסוכן הדיגיטלי (Agent). שם הבנתי שאני יכול${suffix} להשתמש בקוד כדי לעזור לעולם ולהגשים את השאיפה שלי: ${dream}."\n\nהיום, הפיתוח של ${name} מיושם בלמעלה מ-50 ערים חכמות ברחבי הגלובוס.`;
                break;
            case 'robotics':
                mascot = 'mascot_standing_front.png';
                storyTitle = `הרובוט שמציל חיים: ההמצאה המדהימה של ${name} שמשגעת את העולם!`;
                storySub = `הכירו את המתכנת${isMale?'':'ת'} הצעיר${isMale?'':'ה'} שהגשימ${isMale?'':'ה'} את החלום ${dream} בעזרת רובוטיקה מתקדמת.`;
                storyText = `טקס פרסי הטכנולוגיה הבינלאומי של שנת 2045 הכתיר את ${name} כחתן פרס הממציאים הצעירים. הרובוט החכם שפיתח${suffix} שינה לחלוטין את התחום והצליח לממש את השאיפה הישנה שלו: ${dream}.\n\nהכל התחיל בחוג רובוטיקה מעשית בקודיקראפט בשנת 2026. ${name} הגיע${suffix} עם המון סקרנות והתחיל${suffix} לחבר מנועים, חיישנים ורכיבים אלקטרוניים חכמים. ההבנה שחומרה ותוכנה משתלבות יחד נתנה לו את ההשראה לבנות מכונות שעוזרות לאנשים ופותרות בעיות אמיתיות.\n\n"לא האמנתי שהרובוט הקטן שבניתי מקרטון בחוג יהפוך יום אחד לחברה שמעסיקה מאות מהנדסים ומצילה חיים כל יום", שיתפ${suffix} בהתרגשות.`;
                break;
            case 'ai':
                mascot = 'game_barnaby_shop.png';
                storyTitle = `מהפכת ה-AI של ${name}: ממודל בינה מלאכותית בחוג לפטנט עולמי!`;
                storySub = `איך מתכנת${isMale?'':'ת'} שהתחיל${isMale?'':'ה'} את דרכו בגיל 10 אימנ${isMale?'':'ה'} את הבינה המלאכותית להגשים את החלום: ${dream}.`;
                storyText = `בשנת 2045, כלי ה-AI המובילים בעולם מבוססים על האלגוריתמים שפיתח${suffix} ${name}. המערכת החכמה שנוצרה מצליחה לנתח נתונים מורכבים ולעזור להמוני אנשים להשיג את המטרה הגדולה - ${dream}.\n\nהזיק הראשון ניתק בשנת 2026, כאשר ${name} למד${suffix} לכתוב פרומפטים ולאמן מודלים של למידת מכונה בחוג AI Tech של קודיקראפט. במקום לפחד מהטכנולוגיה, ${name} הפכ${suffix} ליוצר שלה.\n\n"קודיקראפט פתחו לי את העיניים להבין איך AI עובד מאחורי הקלעים", אומר${suffix} ${name}, "ההבנה הזו היא שהובילה אותי לפתח את הדור הבא של הבינות המלאכותיות שעוזרות לאנושות."`;
                break;
            case 'cyber':
                mascot = 'mascot_reading.png';
                storyTitle = `מגן הסייבר העולמי: כך ${name} הציל${isMale?'':'ה'} את הרשת הדיגיטלית!`;
                storySub = `מגזין אבטחת המידע 2045 חושף את סיפורו של המגן הדיגיטלי שהגשים את החלום: ${dream}.`;
                storyText = `כאשר מתקפת סייבר גלובלית איימה להפיל את רשתות החשמל והתקשורת העולמיות בשנת 2045, היה זה פתרון האבטחה שפיתח${suffix} ${name} שהציל את המצב. מערכת הסייבר החכמה לא רק חסמה את הפריצה, אלא גם עזרה להגשים את החלום שלו: ${dream}.\n\nהבסיס המקצועי הונח בשנת 2026 בחוגי התכנות והסייבר של קודיקראפט, שם למד${suffix} ${name} על רשתות, לוגיקה תכנותית, ואיך לחשוב כמו מגן סייבר יצירתי.\n\n"בסייבר צריך תמיד לחשוב צעד אחד לפני כולם", מסביר${suffix} ${name}, "החוגים בקודיקראפט נתנו לי את המוח והיצירתיות לחשוב מחוץ לקופסה ולפתח מערכות הגנה שישמרו על כולנו בטוחים."`;
                break;
        }

        const fieldEng = {
            games: '3D futuristic video game environment',
            minecraft: 'blocky 3D Minecraft landscape and buildings',
            robotics: 'cute high-tech helper robot',
            ai: 'highly intelligent holographic AI mind',
            cyber: 'glowing futuristic digital security shield'
        }[field] || 'futuristic technology concept';
        const imagePrompt = `a cute 3D cartoon style illustration of ${dream} related to ${fieldEng}, bright colors, Pixar style, happy, optimistic year 2045 tech, high detail`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`;

        return {
            title: storyTitle,
            sub: storySub,
            text: storyText,
            imageUrl: imageUrl,
            mascot: mascot
        };
    }
});

// 3D Canvas Warp Tunnel Animation Engine
function startWarpTunnel() {
    const canvas = document.getElementById('tm-warp-canvas');
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
        if (!canvas) return;
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    };
    window.addEventListener('resize', resize);

    const numStars = 180;
    const stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            z: Math.random() * 1000,
            color: getRandomColor()
        });
    }

    function getRandomColor() {
        const colors = ['#00ffea', '#0284c7', '#6366f1', '#f472b6', '#3b82f6'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    let speed = 18;
    let animId = null;

    function draw() {
        ctx.fillStyle = 'rgba(2, 6, 23, 0.18)';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        for (let i = 0; i < numStars; i++) {
            const star = stars[i];
            star.z -= speed;

            if (star.z <= 0) {
                star.x = (Math.random() - 0.5) * 1000;
                star.y = (Math.random() - 0.5) * 1000;
                star.z = 1000;
            }

            const k = 400 / star.z;
            const px = star.x * k + cx;
            const py = star.y * k + cy;

            if (px >= 0 && px < width && py >= 0 && py < height) {
                const size = (1 - star.z / 1000) * 4;
                const prevK = 400 / (star.z + speed * 1.5);
                const ppx = star.x * prevK + cx;
                const ppy = star.y * prevK + cy;

                ctx.beginPath();
                ctx.strokeStyle = star.color;
                ctx.lineWidth = size;
                ctx.moveTo(px, py);
                ctx.lineTo(ppx, ppy);
                ctx.stroke();
            }
        }

        if (speed < 40) {
            speed += 0.15;
        }

        animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
        if (animId) {
            cancelAnimationFrame(animId);
        }
        window.removeEventListener('resize', resize);
    };
}
