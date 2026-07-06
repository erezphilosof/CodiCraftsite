const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

let transporter;

async function initTransporter() {
    const isDefaultUser = !process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com';
    if (isDefaultUser) {
        console.log('--------------------------------------------------');
        console.log('💡 No SMTP configuration found in .env.');
        console.log('⚙️ Creating an ephemeral test account with Ethereal Email for testing...');
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('✅ Ethereal test account created successfully!');
            console.log(`✉️ Test email address: ${testAccount.user}`);
            console.log('--------------------------------------------------');
        } catch (err) {
            console.error('❌ Failed to create Ethereal test account:', err);
        }
    } else {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        console.log('✅ SMTP transporter configured using .env credentials.');
    }
}

initTransporter();

// Parse JSON bodies
app.use(express.json());

// Serve the fully localized static site
app.use(express.static(path.join(__dirname, 'website')));

// Fallback chatbot response generator in case API key is rate-limited, expired, or unauthorized (403)
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

// Proxy route for NVIDIA LLM API
app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Messages are required and must be an array.' });
    }
    
    const systemPrompt = `
אתה העוזר הדיגיטלי החכם והרשמי של קודיקראפט (CodiCraft) - בית ספר מוביל לטכנולוגיה, רובוטיקה ותכנות לילדים בכיתות ב' עד ו'.
התפקיד שלך הוא לענות על שאלות ההורים והתלמידים בצורה נעימה, סבלנית, שירותית ומקצועית מאוד.

מידע מפתח על קודיקראפט:
1. חוג תכנות במיינקראפט: הילדים לומדים לוגיקה תכנותית ומעגלים הנדסיים בעזרת כתיבת קוד לסוכן (Agent) בתוך העולם של מיינקראפט ושימוש ברדסטון.
2. חוג רובוטיקה מעשית: חיבור בין חומרה לתוכנה. הילדים בונים רובוטים מחלקי קרטון ורכיבים אלקטרוניים חכמים, מחברים מנועים וחיישנים, ומקודדים אותם לפעולה.
3. חוג בינה מלאכותית (AI Tech): הבנת הטכנולוגיה החדשנית בגובה העיניים. חוקרים מודלי שפה, כותבים פרומפטים יצירתיים ומאמנים מודלים של למידת מכונה (Machine Learning).
4. חוג פיתוח משחקים (Game Dev): יצירת משחקי דו-ממד ותלת-ממד שלב אחרי שלב. מעצבים שלבים, מגדירים חוקי משחק ומכניקות של ניקוד וחיים.
5. הורים שותפים וביטחון: קשר רציף עם ההורים הכולל עדכוני התקדמות שוטפים בוואטסאפ, דוחות למידה בסוף הקורס ותוצרים שהילדים משתפים בגאווה. לומדים בקבוצות קטנות עם יחס אישי.
6. גילאי יעד: מתאים לכיתות ב' עד ו' (גילאי 7 עד 12).
7. קריאה לפעולה: תמיד תעודד את ההורים להשאיר את הפרטים שלהם בטופס ההרשמה שנמצא בתחתית הדף (שער ההרשמה של קודקראפט) כדי שהצוות יחזור אליהם להתאמת קבוצה.

הנחיות שיחה:
- ענה תמיד בעברית טבעית, רהוטה וידידותית (או באנגלית אם הגולש פונה באנגלית).
- שמור על תשובות תמציתיות, ברורות וממוקדות, ואל תכתוב פסקאות ארוכות מדי.
- תהיה תומך ומזמין. אם הגולש מתעניין ברישום, תסביר לו שיש למלא את הטופס בתחתית העמוד.
`;

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
    ];

    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userText = lastUserMessage ? lastUserMessage.content : '';

    try {
        const fs = require('fs');
        let nvidiaApiKey = process.env.NVIDIA_API_KEY;
        
        if (!nvidiaApiKey) {
            const dotenvPath = path.join(__dirname, '.env');
            if (fs.existsSync(dotenvPath)) {
                try {
                    const dotenvContent = fs.readFileSync(dotenvPath, 'utf8');
                    const match = dotenvContent.match(/NVIDIA_API_KEY\s*=\s*(.*)/);
                    if (match) {
                        nvidiaApiKey = match[1].trim();
                    }
                } catch (e) {
                    console.error('Error reading .env file:', e);
                }
            }
        }
        
        const finalKey = nvidiaApiKey || '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';

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${finalKey}`
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-8b-instruct',
                messages: formattedMessages,
                temperature: 0.5,
                top_p: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('NVIDIA API error:', errText);
            console.log('Falling back to local rule-based responder...');
            const reply = getFallbackReply(userText);
            return res.json({ reply, fallback: true });
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;
        res.json({ reply });
        
    } catch (error) {
        console.error('Server proxy error:', error);
        console.log('Falling back to local rule-based responder due to error...');
        const reply = getFallbackReply(userText);
        res.json({ reply, fallback: true });
    }
});

// Fallback generator for Codi's Time Machine stories
function getFallbackTimeMachineStory(name, gender, field, dream) {
    const isMale = gender !== 'female';
    const pronoun = isMale ? 'הילד' : 'הילדה';
    const successVerb = isMale ? 'המציא' : 'המציאה';
    const learnVerb = isMale ? 'למד' : 'למדה';
    const suffix = isMale ? '' : 'ה';
    const suffixEd = isMale ? 'בן' : 'בת';
    const futureTitle = isMale ? 'מנכ"ל ומייסד' : 'מנכ"לית ומייסדת';
    
    const fieldHebrew = {
        games: 'פיתוח משחקי מחשב',
        minecraft: 'תכנות ובנייה במיינקראפט',
        robotics: 'רובוטיקה ואלקטרוניקה מעשית',
        ai: 'בינה מלאכותית',
        cyber: 'סייבר ואבטחת מידע'
    }[field] || 'טכנולוגיה ותכנות';

    const fieldEng = {
        games: '3D futuristic video game environment',
        minecraft: 'blocky 3D Minecraft landscape and buildings',
        robotics: 'cute high-tech helper robot',
        ai: 'highly intelligent holographic AI mind',
        cyber: 'glowing futuristic digital security shield'
    }[field] || 'futuristic technology concept';

    const mascotMapping = {
        games: 'mascot_gamedev.png',
        minecraft: 'mascot_building.png',
        robotics: 'mascot_robot_walk.png',
        ai: 'mascot_ai.png',
        cyber: 'mascot_debugger.png'
    };
    const mascotFile = mascotMapping[field] || 'mascot_standing.png';

    const imagePrompt = `a cute 3D cartoon style illustration of ${dream} related to ${fieldEng}, bright colors, Pixar style, happy, optimistic year 2045 tech, high detail`;
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`;

    // Weave the tech field and the dream together dynamically and logically!
    let dynamicText = '';
    if (field === 'games') {
        dynamicText = `בשנת 2045, העולם מדבר על הטכנולוגיה החדשה ששינתה את ענף הגיימינג. מאחורי ההצלחה הזו עומד/ת לא אחר/ת מאשר ${name}, ש${successVerb} מנוע גרפי ואינטראקטיבי מתקדם שמטרתו המוצהרת היא להמחיש את השאיפה הגדולה: ${dream}.\n\nהכל התחיל בצעד קטן בשנת 2026. כשהיה/הייתה תלמיד/ה צעיר/ה בבית הספר 'קודיקראפט' (CodiCraft) בישראל, שם ${learnVerb} לראשונה את יסודות ה-${fieldHebrew}. כיום, בגיל 29, ${name} משלב/ת משחקי מחשב וטכנולוגיה מתקדמת כדי להפוך את המטרה "${dream}" לחוויה מוחשית המשפיעה על מיליונים!`;
    } else if (field === 'minecraft') {
        dynamicText = `בשנת 2045, מתכנני התשתיות המובילים משתמשים בכלים שפיתח/ה ${name}. המערכת, המבוססת על יסודות הקוד והלוגיקה של מיינקראפט, מאפשרת לתכנן ערים ירוקות ולבנות פרויקטים סביבתיים מדהימים המסייעים להגשים את החלום: ${dream}.\n\nהכל התחיל בשנת 2026 בחוג תכנות מיינקראפט של 'קודיקראפט', שם ${learnVerb} ${name} לכתוב קוד לסוכן דיגיטלי (Agent). החיבור המדהים הזה בין עולמות המשחק לעזרה קהילתית הניח את היסודות להגשמת החלום להביא לשינוי ולממש את השאיפה "${dream}".`;
    } else if (field === 'robotics') {
        dynamicText = `טקס פרסי הטכנולוגיה של שנת 2045 הכתיר את ${name} כחתן/כלת פרס הממציאים. הרובוט החכם והאוטונומי שפיתח/ה שינה לחלוטין את התחום והצליח לתת מענה מושלם לחלום הישן: ${dream}.\n\nהכל התחיל בחוג רובוטיקה מעשית בקודיקראפט בשנת 2026. שם ${name} חיבר/ה מנועים, חיישנים ורכיבי אלקטרוניות, והבין/ה שחומרה ותוכנה משתלבות יחד כדי לפתור בעיות אמיתיות. כיום הרובוטים הללו עוזרים להמונים ומקדמים את השאיפה "${dream}" צעד ענק קדימה.`;
    } else if (field === 'ai') {
        dynamicText = `בשנת 2045, כלי ה-AI המובילים בעולם מבוססים על האלגוריתמים שפיתח/ה ${name}. המערכת החכמה שנוצרה מצליחה לנתח נתונים מורכבים ולעזור להמוני אנשים להשיג את המטרה הגדולה - ${dream}.\n\nהזיק הראשון ניתק בשנת 2026, כאשר ${name} למד/ה לכתוב פרומפטים ולאמן מודלים של למידת מכונה בחוג AI Tech של קודיקראפט. במקום לפחד מהטכנולוגיה, ${name} הפך/ה ליוצר/ת שלה כדי לקדם את החלום "${dream}".`;
    } else { // cyber
        dynamicText = `כאשר מתקפות סייבר איימו על הרשת העולמית בשנת 2045, היה זה פתרון האבטחה שפיתח/ה ${name} שהציל את המצב. מערכת הסייבר החכמה לא רק חסמה את הפריצה, אלא גם עזרה להגן על מערכות המידע המקשרות לחלום הישן שלו/ה: ${dream}.\n\nהבסיס המקצועי הונח בשנת 2026 בחוגי התכנות והסייבר של קודיקראפט, שם למד/ה ${name} לחשוב מחוץ לקופסה ולפתח מערכות הגנה שישמרו על כולנו בטוחים בדרך להגשמת מטרותינו.`;
    }

    return {
        title: `מגזין CODI 2045: פריצת הדרך העולמית של ${name}! 🚀`,
        sub: `מילד/ה ששיחק/ה במחשב בשנת 2026, ל${futureTitle} של אימפריית ${fieldHebrew} עולמית!`,
        text: dynamicText,
        imageUrl: imageUrl,
        mascot: mascotFile,
        achievement: `פיתח/ה את פרויקט "${dream}"`
    };
}

// Codi's Time Machine story generator endpoint
app.post('/api/time-machine', async (req, res) => {
    const { childName, gender, field, dream } = req.body;
    
    if (!childName || !gender || !field || !dream) {
        return res.status(400).json({ error: 'Missing required parameters.' });
    }

    const isMale = gender !== 'female';
    const fieldMapping = {
        games: 'פיתוח משחקי מחשב (Game Development)',
        minecraft: 'תכנות ובנייה במיינקראפט (Minecraft coding)',
        robotics: 'רובוטיקה ואלקטרוניקה מעשית (Robotics & hardware)',
        ai: 'בינה מלאכותית (AI Tech & machine learning)',
        cyber: 'סייבר ואבטחת מידע (Cybersecurity)'
    };
    
    const fieldHebrew = fieldMapping[field] || 'טכנולוגיה ותכנות';

    const fieldEng = {
        games: '3D futuristic video game environment',
        minecraft: 'blocky 3D Minecraft landscape and buildings',
        robotics: 'cute high-tech helper robot',
        ai: 'highly intelligent holographic AI mind',
        cyber: 'glowing futuristic digital security shield'
    }[field] || 'futuristic technology concept';

    const systemPrompt = `
You are a highly creative futuristic technology journalist writing in Hebrew for the year 2045.
Write a short, incredibly inspiring, and positive futuristic magazine cover story about a young Israeli tech leader (the child).
The child's details are:
- Name: ${childName}
- Gender: ${gender} (${isMale ? 'Male/בן' : 'Female/בת'})
- Favorite Tech Field: ${fieldHebrew}
- Short Dream/Goal: ${dream}

Instructions:
1. The story takes place in the year 2045. The child is now around 29 years old.
2. The story must describe how they made a major tech breakthrough or founded a successful start-up/initiative related to their Favorite Tech Field that helps fulfill their Short Dream (${dream}).
3. It MUST explicitly state that their technology journey started in the year 2026 as a young child in the coding school 'CodiCraft' (קודיקראפט) in Israel, where they took a class in ${fieldHebrew}.
4. Maintain proper Hebrew grammar for the child's gender (use verbs like עשה/עשתה, למד/למדה, המציא/המציאה, etc.).
5. Output ONLY a valid JSON object with the following string keys:
   - "title": A catchy, bold, dramatic headline in Hebrew (e.g. "הילד שהגשים את החלום: כך אורי שינה את פני הרפואה העולמית בעזרת רובוטים").
   - "sub": A short, exciting sub-headline in Hebrew (1-2 sentences).
   - "text": The full article text in Hebrew (around 120-200 words). Use standard Hebrew letters and emojis occasionally. Keep paragraphs separated by double newlines (\\n\\n).
   - "image_prompt": A descriptive English prompt for AI image generation representing the child's futuristic breakthrough or dream described in the story (e.g., if their dream is related to space/Mars, write "a cute 3D robot astronaut flying to mars, cartoon style, vibrant colors". If their dream is related to healing animals, write "a cute 3D robot helping a happy dog in a futuristic vet, cartoon style"). Make sure it fits the field (${fieldEng}) and the specific dream (${dream}). Keep it under 20 words, in English.

Do not include any intro, markdown formatting, or code blocks outside the raw JSON object. Make sure the JSON is valid and parsable.
6. Important: Output the entire JSON on a single line. Do not use actual line breaks (newlines) inside the JSON. To separate paragraphs inside "text", use the literal characters '\\n\\n' (backslash-n, backslash-n) rather than a physical line break.
`;

    try {
        const fs = require('fs');
        let nvidiaApiKey = process.env.NVIDIA_API_KEY;
        
        if (!nvidiaApiKey) {
            const dotenvPath = path.join(__dirname, '.env');
            if (fs.existsSync(dotenvPath)) {
                try {
                    const dotenvContent = fs.readFileSync(dotenvPath, 'utf8');
                    const match = dotenvContent.match(/NVIDIA_API_KEY\s*=\s*(.*)/);
                    if (match) {
                        nvidiaApiKey = match[1].trim();
                    }
                } catch (e) {
                    console.error('Error reading .env file:', e);
                }
            }
        }
        
        const finalKey = nvidiaApiKey || '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';

        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${finalKey}`
            },
            body: JSON.stringify({
                model: 'meta/llama-3.1-8b-instruct',
                messages: [
                    { role: 'system', content: systemPrompt }
                ],
                temperature: 0.7,
                top_p: 0.8,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            throw new Error('NVIDIA API error');
        }

        const data = await response.json();
        let rawContent = data.choices[0].message.content.trim();
        
        // Strip markdown code block wrappers if Llama wrapped the JSON
        if (rawContent.startsWith('```')) {
            rawContent = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
        }
        
        // Safe sanitization: replace physical line breaks in JSON output to prevent parse crashes
        rawContent = rawContent.replace(/\r/g, '').replace(/\n/g, ' ');
        
        const parsed = JSON.parse(rawContent);
        
        const fallbackDetails = getFallbackTimeMachineStory(childName, gender, field, dream);
        
        const imagePrompt = parsed.image_prompt || `a cute 3D cartoon style illustration of ${dream} related to ${fieldEng}, bright colors, Pixar style, happy, optimistic year 2045 tech, high detail`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}`;
        
        res.json({
            title: parsed.title || fallbackDetails.title,
            sub: parsed.sub || fallbackDetails.sub,
            text: parsed.text || fallbackDetails.text,
            imageUrl: imageUrl,
            mascot: fallbackDetails.mascot,
            achievement: fallbackDetails.achievement
        });
        
    } catch (error) {
        console.error('Time machine server error, using fallback:', error);
        const fallbackDetails = getFallbackTimeMachineStory(childName, gender, field, dream);
        res.json(fallbackDetails);
    }
});

// Proxy route for Base 44 scheduling and Lead Magnet emailing
app.post('/api/schedule', async (req, res) => {
    const { parentName, phone, childName, childGrade, eventTitle, eventDate, eventTime, email } = req.body;
    
    if (!parentName || !phone || !childName || !childGrade) {
        return res.status(400).json({ error: 'Missing required parent/child fields.' });
    }
    
    const emailStr = email ? ` [אימייל: ${email}]` : '';
    const formattedName = `${parentName}${emailStr} (הילד/ה: ${childName}, כיתה: ${childGrade})`;
    const formattedTrack = `שיעור ניסיון: ${eventTitle || 'חוג'} - בתאריך ${eventDate} בשעה ${eventTime}`;
    const payload = {
        name: formattedName,
        phone: phone,
        track: formattedTrack,
        email: email,
        status: 'חדש'
    };
    
    try {
        console.log('Sending lead to Base 44:', payload);
        const response = await fetch('https://codicraft.base44.app/api/apps/6985ef94cc45c18bc62542c3/entities/Lead', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errText = await response.text();
            console.error('Base 44 API error:', errText);
            // We log the error but don't fail the request if it's just the lead magnet download
            if (childGrade !== "הורדת מדריך") {
                return res.status(500).json({ error: 'Failed to send lead to Base 44', details: errText });
            }
        } else {
            const data = await response.json();
            console.log('Lead successfully saved in Base 44:', data);
        }

        // Nodemailer Email Sending Logic for Lead Magnet
        if (childGrade === "הורדת מדריך" && email) {
            console.log('Sending guide via email to:', email);
            const fromAddress = (process.env.SMTP_FROM || `CodiCraft <${process.env.SMTP_USER}>`).replace(/^"|"$/g, '');
            const mailOptions = {
                from: fromAddress,
                to: email,
                subject: '🚀 המדריך המלא להורים: איך לגלות את הפוטנציאל הטכנולוגי של ילדכם | CodiCraft',
                html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head><meta charset="UTF-8"></head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: 'Segoe UI', Tahoma, Arial, sans-serif;">
<div style="max-width:640px; margin:0 auto; background-color:#1e293b; border-radius:16px; overflow:hidden; border:1px solid #334155;">

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0284c7 0%, #6366f1 100%); padding:35px 30px; text-align:center;">
        <h1 style="color:#fff; margin:0; font-size:26px; font-weight:800;">🧒 המדריך המלא להורים</h1>
        <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:15px;">איך לדעת אם הילד שלכם יכול להיות מתכנת על?</p>
    </div>

    <!-- Greeting -->
    <div style="padding:30px 30px 15px;">
        <p style="color:#e2e8f0; font-size:16px; line-height:1.7; margin:0;">
            שלום <strong style="color:#38bdf8;">${parentName}</strong>,<br><br>
            תודה שהורדתם את המדריך שלנו! בקודיקראפט אנחנו מאמינים שכל ילד הוא יוצר בפוטנציאל — והתפקיד שלנו הוא לתת לו את הכלים הנכונים כדי לגלות את זה. הנה 5 טיפים מעשיים שיעזרו לכם לזהות ולפתח את החוזקות הטכנולוגיות של ילדכם:
        </p>
    </div>

    <!-- Tip 1 -->
    <div style="margin:10px 30px; background:#0f172a; border-radius:12px; padding:20px; border-right:4px solid #22d3ee; direction:rtl; text-align:right;">
        <table dir="rtl" style="width:100%; border-collapse:collapse; margin-bottom:8px; direction:rtl; text-align:right;">
            <tr>
                <td style="width:25px; font-size:18px; vertical-align:middle; padding-left:8px; line-height:1; direction:rtl; text-align:right;">💡</td>
                <td style="color:#22d3ee; font-size:17px; font-weight:bold; vertical-align:middle; text-align:right; line-height:1.2; direction:rtl;">טיפ 1: הפכו את זמן המסך מצריכה ליצירה</td>
            </tr>
        </table>
        <p style="color:#cbd5e1; font-size:14px; line-height:1.7; margin:0; direction:rtl; text-align:right;">
            במקום שהילד רק ישחק במשחקים — תנו לו <strong style="color:#fff;">ליצור משחקים</strong>. כלים כמו Scratch (חינמי לחלוטין!) מאפשרים לילדים בגיל 7 ומעלה לבנות משחקים, אנימציות וסיפורים אינטראקטיביים תוך דקות. שאלו את ילדכם: <em>"מה אם במקום לשחק, אתה תבנה את המשחק הבא?"</em>
        </p>
    </div>

    <!-- Tip 2 -->
    <div style="margin:10px 30px; background:#0f172a; border-radius:12px; padding:20px; border-right:4px solid #a78bfa; direction:rtl; text-align:right;">
        <table dir="rtl" style="width:100%; border-collapse:collapse; margin-bottom:8px; direction:rtl; text-align:right;">
            <tr>
                <td style="width:25px; font-size:18px; vertical-align:middle; padding-left:8px; line-height:1; direction:rtl; text-align:right;">🧩</td>
                <td style="color:#a78bfa; font-size:17px; font-weight:bold; vertical-align:middle; text-align:right; line-height:1.2; direction:rtl;">טיפ 2: שימו לב לסימני "חשיבה תכנותית" טבעית</td>
            </tr>
        </table>
        <p style="color:#cbd5e1; font-size:14px; line-height:1.7; margin:0; direction:rtl; text-align:right;">
            ילד שאוהב לפתור חידות, לבנות מלגו לפי הוראות (או בלי!), לארגן דברים בסדר מסוים, או ששואל "למה?" ו-"איך?" על הכל — כנראה בעל חשיבה לוגית-אלגוריתמית מפותחת. אלה בדיוק הכישורים שמתכנתים גדולים מפתחים!
        </p>
    </div>

    <!-- Tip 3 -->
    <div style="margin:10px 30px; background:#0f172a; border-radius:12px; padding:20px; border-right:4px solid #f472b6; direction:rtl; text-align:right;">
        <table dir="rtl" style="width:100%; border-collapse:collapse; margin-bottom:8px; direction:rtl; text-align:right;">
            <tr>
                <td style="width:25px; font-size:18px; vertical-align:middle; padding-left:8px; line-height:1; direction:rtl; text-align:right;">⛏️</td>
                <td style="color:#f472b6; font-size:17px; font-weight:bold; vertical-align:middle; text-align:right; line-height:1.2; direction:rtl;">טיפ 3: מיינקראפט = הזדמנות לימודית מוסווית</td>
            </tr>
        </table>
        <p style="color:#cbd5e1; font-size:14px; line-height:1.7; margin:0; direction:rtl; text-align:right;">
            אם הילד שלכם מכור למיינקראפט — זו ממש לא בעיה, זו <strong style="color:#fff;">הזדמנות</strong>! בחוג התכנות במיינקראפט של קודיקראפט, הילדים לומדים לוגיקה תכנותית, רדסטון ומעגלים הנדסיים. הם לא רק משחקים — הם כותבים קוד אמיתי לסוכן (Agent) שבונה ויוצר בשבילם. המשחק הופך לכלי למידה עוצמתי.
        </p>
    </div>

    <!-- Tip 4 -->
    <div style="margin:10px 30px; background:#0f172a; border-radius:12px; padding:20px; border-right:4px solid #4ade80; direction:rtl; text-align:right;">
        <table dir="rtl" style="width:100%; border-collapse:collapse; margin-bottom:8px; direction:rtl; text-align:right;">
            <tr>
                <td style="width:25px; font-size:18px; vertical-align:middle; padding-left:8px; line-height:1; direction:rtl; text-align:right;">🤖</td>
                <td style="color:#4ade80; font-size:17px; font-weight:bold; vertical-align:middle; text-align:right; line-height:1.2; direction:rtl;">טיפ 4: בינה מלאכותית — הילד שלכם כבר חי בעולם הזה</td>
            </tr>
        </table>
        <p style="color:#cbd5e1; font-size:14px; line-height:1.7; margin:0; direction:rtl; text-align:right;">
            ילדים כבר משתמשים ב-AI מבלי לדעת (פילטרים בטיקטוק, המלצות ביוטיוב, עוזרות קוליות). במקום שהם רק <em>צרכנים</em> של הטכנולוגיה, למה שלא יהפכו ל<strong style="color:#fff;">יוצרים</strong>? בחוג AI Tech של קודיקראפט, ילדים מגיל 9 לומדים איך מודלי שפה עובדים, כותבים פרומפטים חכמים ואפילו מאמנים מודלים של למידת מכונה בעצמם!
        </p>
    </div>

    <!-- Tip 5 -->
    <div style="margin:10px 30px; background:#0f172a; border-radius:12px; padding:20px; border-right:4px solid #fbbf24; direction:rtl; text-align:right;">
        <table dir="rtl" style="width:100%; border-collapse:collapse; margin-bottom:8px; direction:rtl; text-align:right;">
            <tr>
                <td style="width:25px; font-size:18px; vertical-align:middle; padding-left:8px; line-height:1; direction:rtl; text-align:right;">🎯</td>
                <td style="color:#fbbf24; font-size:17px; font-weight:bold; vertical-align:middle; text-align:right; line-height:1.2; direction:rtl;">טיפ 5: תנו לילד "לנסות לפני שמתחייבים"</td>
            </tr>
        </table>
        <p style="color:#cbd5e1; font-size:14px; line-height:1.7; margin:0; direction:rtl; text-align:right;">
            אל תירשמו לשנה שלמה בלי לדעת אם הילד באמת נהנה. בקודיקראפט אנחנו מציעים <strong style="color:#fff;">שיעור ניסיון חינם לחלוטין וללא התחייבות</strong>, שבו הילד מתנסה בפועל בכתיבת קוד, בניית רובוט או פיתוח משחק. רק אחרי שהוא אומר "וואו, אני רוצה עוד!" — אז נדבר על הרשמה. 😊
        </p>
    </div>

    <!-- Checklist -->
    <div style="margin:20px 30px; background:linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.1)); border-radius:12px; padding:20px; border:1px solid rgba(99,102,241,0.3); direction:rtl; text-align:right;">
        <table dir="rtl" style="width:100%; border-collapse:collapse; margin-bottom:12px; direction:rtl; text-align:right;">
            <tr>
                <td style="width:25px; font-size:18px; vertical-align:middle; padding-left:8px; line-height:1; direction:rtl; text-align:right;">📋</td>
                <td style="color:#fff; font-size:16px; font-weight:bold; vertical-align:middle; text-align:right; line-height:1.2; direction:rtl;">מבדק מהיר: האם הילד שלכם מועמד לכוכב טכנולוגי?</td>
            </tr>
        </table>
        <table style="width:100%; color:#e2e8f0; font-size:14px; line-height:2; direction:rtl; text-align:right;">
            <tr><td style="width:20px; text-align:right; padding-left:5px;">✅</td><td style="text-align:right;">אוהב/ת לפרק דברים ולהבין "מה בפנים"</td></tr>
            <tr><td style="width:20px; text-align:right; padding-left:5px;">✅</td><td style="text-align:right;">נהנה/ית מחידות, משחקי היגיון, או סודוקו</td></tr>
            <tr><td style="width:20px; text-align:right; padding-left:5px;">✅</td><td style="text-align:right;">בונה עולמות מורכבים במיינקראפט / רובלוקס</td></tr>
            <tr><td style="width:20px; text-align:right; padding-left:5px;">✅</td><td style="text-align:right;">שואל/ת "למה?" ו-"איך זה עובד?" על הכל</td></tr>
            <tr><td style="width:20px; text-align:right; padding-left:5px;">✅</td><td style="text-align:right;">אוהב/ת ליצור ולעצב (ציורים, לגו, סיפורים)</td></tr>
            <tr><td style="width:20px; text-align:right; padding-left:5px;">✅</td><td style="text-align:right;">מתעניין/ת ברובוטים, חלל או מחשבים</td></tr>
        </table>
        <p style="color:#94a3b8; font-size:13px; margin:12px 0 0; text-align:center;">
            אם סימנתם 3 או יותר — ילדכם כנראה יפרח בחוג טכנולוגיה! 🌟
        </p>
    </div>

    <!-- CTA Button -->
    <div style="padding:15px 30px 30px; text-align:center;">
        <p style="color:#e2e8f0; font-size:15px; margin:0 0 15px;">
            <strong>מוכנים לראות את האור בעיניים של ילדכם?</strong>
        </p>
        <a href="https://codicraft.co.il/try-now.html" style="display:inline-block; background:linear-gradient(135deg, #00ffea 0%, #0284c7 100%); color:#000; padding:14px 35px; border-radius:30px; font-weight:800; font-size:16px; text-decoration:none; box-shadow:0 4px 15px rgba(0,255,234,0.4);">
            שריינו שיעור ניסיון חינם 🚀
        </a>
        <p style="color:#64748b; font-size:12px; margin:12px 0 0;">ללא עלות • ללא התחייבות • פשוט לנסות וליהנות</p>
    </div>

    <!-- Footer -->
    <div style="background:#0f172a; padding:20px 30px; text-align:center; border-top:1px solid #334155;">
        <p style="color:#64748b; font-size:12px; margin:0;">
            © 2026 CodiCraft — חוגי תכנות, רובוטיקה ובינה מלאכותית לילדים<br>
            <a href="https://codicraft.co.il" style="color:#38bdf8; text-decoration:none;">codicraft.co.il</a>
        </p>
    </div>

</div>
</body>
</html>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending guide email:', error);
                } else {
                    console.log('Guide email sent successfully:', info.response);
                    const previewUrl = nodemailer.getTestMessageUrl(info);
                    if (previewUrl) {
                        console.log('--------------------------------------------------');
                        console.log('🔮 Ethereal Email Preview URL:');
                        console.log(previewUrl);
                        console.log('--------------------------------------------------');
                    }
                }
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error in schedule endpoint:', error);
        res.status(500).json({ error: 'Internal server error while scheduling.' });
    }
});

if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port} (Local Only)`);
    });
}

module.exports = app;
