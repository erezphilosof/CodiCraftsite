function initChatAgent() {
    const bubble = document.getElementById('chat-agent-bubble');
    const windowEl = document.getElementById('chat-agent-window');
    const closeBtn = document.getElementById('chat-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const inputField = document.getElementById('chat-input-field');
    const messagesBox = document.getElementById('chat-messages-box');
    const quickReplies = document.getElementById('chat-quick-replies');

    if (!bubble || !windowEl) return;

    let history = []; // Message history to send to server

    // Toggle chat window
    bubble.addEventListener('click', () => {
        windowEl.classList.toggle('hidden');
        if (!windowEl.classList.contains('hidden')) {
            inputField.focus();
            scrollBottom();
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.add('hidden');
    });

    // Send on click
    sendBtn.addEventListener('click', () => {
        submitMessage();
    });

    // Send on Enter
    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            submitMessage();
        }
    });

    // Quick replies handler
    quickReplies.addEventListener('click', (e) => {
        const btn = e.target.closest('.quick-reply-btn');
        if (!btn) return;
        const query = btn.getAttribute('data-query');
        if (query) {
            inputField.value = query;
            submitMessage();
        }
    });

    function scrollBottom() {
        setTimeout(() => {
            messagesBox.scrollTop = messagesBox.scrollHeight;
        }, 50);
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        messagesBox.appendChild(msgDiv);
        scrollBottom();
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator-container';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesBox.appendChild(typingDiv);
        scrollBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    async function submitMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        // Clear input
        inputField.value = '';

        // Add user message to UI and history
        appendMessage('user', text);
        history.push({ role: 'user', content: text });

        // Show loader and disable input
        showTypingIndicator();
        inputField.disabled = true;
        sendBtn.disabled = true;

        let gotReply = false;
        let replyText = '';

        // Attempt 1: Call Backend Server
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: history })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.reply) {
                    replyText = data.reply;
                    gotReply = true;
                }
            }
        } catch (error) {
            console.warn('Local API failed, trying direct NVIDIA fallback:', error);
        }

        // Attempt 2: Call NVIDIA API directly from client side if local backend fails
        if (!gotReply) {
            try {
                const nvidiaUrl = 'https://integrate.api.nvidia.com/v1/chat/completions';
                const nvidiaKey = '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';
                const sysPrompt = `
אתה העוזר הדיגיטלי החכם של קודיקראפט (CodiCraft) - בית ספר מוביל לטכנולוגיה, רובוטיקה ותכנות לילדים בכיתות ב' עד ו'.
התפקיד שלך הוא לענות על שאלות ההורים והתלמידים בצורה נעימה, סבלנית, שירותית ומקצועית מאוד.

מידע מפתח על קודיקראפט:
1. חוג תכנות במיינקראפט: לוגיקה ותכנות לסוכן (Agent) בתוך מיינקראפט ושימוש ברדסטון.
2. חוג רובוטיקה מעשית: בניית רובוטים מחלקי קרטון ואלקטרוניקה חכמה, מנועים וחיישנים.
3. חוג בינה מלאכותית (AI Tech): כתיבת פרומפטים ואימון מודלי למידת מכונה (Machine Learning).
4. חוג פיתוח משחקים (Game Dev): יצירת משחקי דו-ממד ותלת-ממד.
5. שותפות הורים: עדכוני התקדמות בוואטסאפ, דוחות למידה בסוף הקורס. לומדים בקבוצות קטנות.
6. גילאי יעד: כיתות ב' עד ו' (גילאי 7 עד 12).
7. קריאה לפעולה: להשאיר פרטים בטופס ההרשמה בתחתית הדף לשיעור ניסיון חינם.

ענה תמיד בעברית טבעית, רהוטה וידידותית, ותשובות קצרות וברורות.
`;
                const formattedMessages = [
                    { role: 'system', content: sysPrompt },
                    ...history
                ];

                const response = await fetch(nvidiaUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nvidiaKey}`
                    },
                    body: JSON.stringify({
                        model: 'meta/llama-3.1-8b-instruct',
                        messages: formattedMessages,
                        temperature: 0.5,
                        top_p: 0.7,
                        max_tokens: 1024
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.choices && data.choices[0] && data.choices[0].message) {
                        replyText = data.choices[0].message.content;
                        gotReply = true;
                    }
                }
            } catch (err) {
                console.warn('Direct NVIDIA API failed, using rule-based local fallback:', err);
            }
        }

        // Attempt 3: Local Rule-Based Responder (Never fails!)
        if (!gotReply) {
            replyText = getFallbackReply(text);
        }

        // Display response
        removeTypingIndicator();
        inputField.disabled = false;
        sendBtn.disabled = false;
        inputField.focus();

        appendMessage('assistant', replyText);
        history.push({ role: 'assistant', content: replyText });
    }

    function getFallbackReply(userMessage) {
        const text = (userMessage || '').toLowerCase();
        
        if (text.includes('מיינקראפט') || text.includes('minecraft') || text.includes('סוכן') || text.includes('agent')) {
            return "בחוג תכנות במיינקראפט, הילדים לומדים לוגיקה תכנותית ומעגלים הנדסיים על ידי כתיבת קוד לסוכן (Agent) בתוך העולם של מיינקראפט ושימוש ברדסטון. זה שילוב מושלם של משחק ולמידה מעמיקה! ⛏️";
        }
        if (text.includes('רובוטיקה') || text.includes('רובוט') || text.includes('חיישן') || text.includes('מנוע') || text.includes('אלקטרוניקה')) {
            return "בחוג רובוטיקה מעשית, הילדים בונים רובוטים מחלקי קרטון ורכיבים אלקטרוניים חכמים, מחברים מנועים וחיישנים, ומקודדים אותם לפעולה. זהו חיבור חווייתי בין חומרה לתוכנה! 🤖";
        }
        if (text.includes('בינה מלאכותית') || text.includes('ai') || text.includes('למידת מכונה') || text.includes('פרומפט') || text.includes('מלאכותית')) {
            return "בחוג בינה מלאכותית (AI Tech), הילדים חוקרים מודלי שפה, לומדים לכתוב פרומפטים יצירתיים ומאמנים מודלים של למידת מכונה (Machine Learning) בצורה פשוטה וחווייתית בגובה העיניים! 💡";
        }
        if (text.includes('משחק') || text.includes('משחקים') || text.includes('גיימינג') || text.includes('gamedev') || text.includes('game')) {
            return "בחוג פיתוח משחקים, הילדים יוצרים משחקי דו-ממד ותלת-ממד שלב אחרי שלב. הם מעצבים שלבים, מגדירים חוקי משחק ומכניקות של ניקוד וחיים, ומביאים את הרעיונות שלהם לחיים! 🎮";
        }
        if (text.includes('גיל') || text.includes('גילאים') || text.includes('כיתה') || text.includes('כיתות') || text.includes('מתאים') || text.includes('ב\' עד ו\'')) {
            return "החוגים שלנו מותאמים במיוחד לילדים בכיתות ב' עד ו' (גילאי 7 עד 12), ומחולקים לקבוצות קטנות לפי גיל ורמת ניסיון כדי להבטיח יחס אישי לכל תלמיד. 🎯";
        }
        if (text.includes('הורים') || text.includes('אבא') || text.includes('אמא') || text.includes('וואטסאפ') || text.includes('עדכון') || text.includes('קשר') || text.includes('קבוצות') || text.includes('whatsapp')) {
            return "אנחנו מאמינים בשותפות מלאה עם ההורים! במהלך הקורס נשלח לכם עדכוני התקדמות שוטפים בוואטסאפ, דוחות למידה בסוף הקורס ותוצרים שהילדים בנו בגאווה. 📱";
        }
        if (text.includes('הרשמה') || text.includes('להירשם') || text.includes('להרשם') || text.includes('להצטרף') || text.includes('טופס') || text.includes('פרטים')) {
            return "כדי להירשם או לשמוע עוד פרטים, פשוט מלאו את טופס יצירת הקשר שנמצא בתחתית העמוד, והצוות שלנו יחזור אליכם בהקדם להתאמת הקבוצה המושלמת עבור ילדכם! ✨";
        }
        if (text.includes('קייטנה') || text.includes('קייטנות') || text.includes('קיץ') || text.includes('סדנה') || text.includes('סדנאות')) {
            return "אנו מציעים קייטנות ומסלולי למידה מרוכזים בחופשות הקיץ, וכן סדנאות טכנולוגיה חווייתיות לבתי ספר ומרכזים קהילתיים. נשמח לתת לכם פרטים נוספים אם תשאיר פרטים בטופס בתחתית העמוד! ☀️";
        }
        
        return "אני כאן כדי לעזור לכם להכיר את קודיקראפט! אנחנו מציעים חוגי תכנות, רובוטיקה, בינה מלאכותית ופיתוח משחקים לכיתות ב'-ו'. במה תרצו להתמקד? (תוכלו גם למלא את הטופס בתחתית העמוד ונציג שלנו יחזור אליכם). 😊";
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatAgent);
} else {
    initChatAgent();
}

