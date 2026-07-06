document.addEventListener('DOMContentLoaded', () => {
    const lmForm = document.getElementById('lead-magnet-form');
    const lmName = document.getElementById('lm-name');
    const lmPhone = document.getElementById('lm-phone');
    const lmEmail = document.getElementById('lm-email');
    const lmBtn = document.querySelector('.lm-btn');
    const lmSuccessMsg = document.getElementById('lm-success-msg');

    if (lmForm) {
        lmForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = lmName.value.trim();
            const phone = lmPhone.value.trim();
            const email = lmEmail.value.trim();
            
            if (!name || !phone || !email) return;

            // Change button state
            const originalText = lmBtn.innerHTML;
            lmBtn.innerHTML = 'שולח... ⏳';
            lmBtn.disabled = true;

            try {
                // Send lead to the API
                const response = await fetch('/api/schedule', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        parentName: name,
                        phone: phone,
                        email: email,
                        childName: "מגנט לידים",
                        childGrade: "הורדת מדריך",
                        eventTitle: "הורדת מדריך להורים",
                        eventDate: new Date().toLocaleDateString('he-IL'),
                        eventTime: "דיגיטלי"
                    })
                });

                if (response.ok) {
                    // Show success message
                    lmSuccessMsg.textContent = 'תודה! המדריך נשלח בהצלחה לכתובת האימייל שלכם. אנא בדקו את תיבת הדואר הנכנס (והספאם).';
                    lmSuccessMsg.style.color = '#22c55e';
                    lmSuccessMsg.style.display = 'block';
                    lmForm.reset();
                } else {
                    throw new Error('Failed to submit lead');
                }
            } catch (error) {
                console.error("Error submitting lead:", error);
                lmSuccessMsg.textContent = 'אופס! משהו השתבש, נסו שוב מאוחר יותר.';
                lmSuccessMsg.style.color = '#ef4444';
                lmSuccessMsg.style.display = 'block';
            } finally {
                lmBtn.innerHTML = originalText;
                lmBtn.disabled = false;
            }
        });
    }
});
