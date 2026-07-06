if (window.trustedTypes && window.trustedTypes.createPolicy) {
    window.trustedTypes.createPolicy('default', {
        createHTML: (string) => string,
        createScript: (string) => string,
        createScriptURL: (string) => string
    });
}

// Check if loaded via file:// protocol (which breaks ES modules and CORS requests)
if (window.location.protocol === 'file:') {
    document.addEventListener('DOMContentLoaded', function() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.backgroundColor = '#0b0f19';
        overlay.style.color = '#fff';
        overlay.style.zIndex = '9999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        overlay.style.padding = '20px';
        overlay.style.textAlign = 'center';
        overlay.style.direction = 'rtl';
        
        overlay.innerHTML = `
            <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid rgba(56, 189, 248, 0.4); padding: 40px; border-radius: 24px; max-width: 600px; box-shadow: 0 20px 50px rgba(0,0,0,0.6); backdrop-filter: blur(10px);">
                <div style="font-size: 4.5rem; margin-bottom: 20px;">🚀</div>
                <h1 style="font-size: 2.2rem; color: #00ffea; margin-bottom: 15px; font-weight: 700; font-family: 'Secular One', sans-serif;">פתחו את השרת המקומי!</h1>
                <p style="font-size: 1.2rem; color: #cbd5e1; line-height: 1.6; margin-bottom: 25px;">
                    דפדפנים מודרניים חוסמים טעינת רכיבי קוד (ES Modules) ואתרי אינטרנט שלמים ישירות מהקבצים במחשב (פרוטוקול <code style="color: #ef4444; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">file://</code>) מטעמי אבטחה.<br><br>
                    כדי שהאתר יפעל בצורה מושלמת, אנא כנסו לכתובת הבאה בדפדפן שלכם:
                </p>
                <div style="background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; font-family: monospace; font-size: 1.5rem; color: #00ffea; border: 1px dashed rgba(0,255,234,0.4); margin-bottom: 30px; user-select: all; cursor: pointer;" title="לחצו להעתקה">
                    http://localhost:3000
                </div>
                <p style="font-size: 1rem; color: #64748b; margin: 0;">
                    (וודאו שהשרת שלכם מופעל על ידי הרצת הפקודה <code style="background: #1e293b; padding: 3px 8px; border-radius: 6px; color: #f1f5f9; font-family: monospace;">node server.js</code> בתיקיית הפרויקט)
                </p>
            </div>
        `;
        
        document.body.appendChild(overlay);
    });
}
