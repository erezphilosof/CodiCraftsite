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

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages: history })
            });

            removeTypingIndicator();
            inputField.disabled = false;
            sendBtn.disabled = false;
            inputField.focus();

            if (!response.ok) {
                appendMessage('assistant', 'אופס, אירעה שגיאה בחיבור לשרת. אנא נסו שוב מאוחר יותר.');
                return;
            }

            const data = await response.json();
            if (data.reply) {
                appendMessage('assistant', data.reply);
                history.push({ role: 'assistant', content: data.reply });
            } else {
                appendMessage('assistant', 'משהו השתבש, אנא נסו שוב.');
            }

        } catch (error) {
            console.error('Chat error:', error);
            removeTypingIndicator();
            inputField.disabled = false;
            sendBtn.disabled = false;
            inputField.focus();
            appendMessage('assistant', 'לא הצלחתי להתחבר לשרת. ודאו שאתם מחוברים לאינטרנט.');
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatAgent);
} else {
    initChatAgent();
}

