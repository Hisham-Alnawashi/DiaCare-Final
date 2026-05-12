const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// مفتاحك آمن هنا في السيرفر الخلفي، ولا يمكن لأي مستخدم في الموقع رؤيته!
// 🚨 ضعي مفتاحك الجديد هنا فقط بدلاً من النص العربي 🚨
const GEMINI_API_KEY = "ضعي_مفتاحك_الجديد_هنا_بعد_حذف_القديم_من_جوجل";

app.post('/api/ai', async (req, res) => {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            throw new Error(`Google API Error: ${await response.text()}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('✅ Backend Server is running on http://localhost:3000');
});