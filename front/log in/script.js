import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB1P0Wk6ICLDxBoStHL0dboD8z7_0yhNXg",
    authDomain: "dia-care-86f57.firebaseapp.com",
    projectId: "dia-care-86f57",
    storageBucket: "dia-care-86f57.firebasestorage.app",
    messagingSenderId: "192885531387",
    appId: "1:192885531387:web:1ba384d658d1a0ea3f465e",
    measurementId: "G-3BBW3L00FP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log('DiaCare script loaded!');

// ==========================================
// DiaCare Integrated Local Database (JSON)
// ==========================================
window.DiaCareDB = {
    init: function () {
        if (!localStorage.getItem('db_glucose')) localStorage.setItem('db_glucose', JSON.stringify([]));
        if (!localStorage.getItem('db_weight')) localStorage.setItem('db_weight', JSON.stringify([]));
        if (!localStorage.getItem('db_meals')) localStorage.setItem('db_meals', JSON.stringify([]));
    },
    addLog: async function (table, data) {
        let records = JSON.parse(localStorage.getItem(table) || '[]');
        data.timestamp = new Date().toISOString(); // حفظ التاريخ والوقت بدقة
        records.push(data);
        localStorage.setItem(table, JSON.stringify(records));

        // الحفظ في Firebase Firestore إذا كان المستخدم مسجلاً
        if (auth && auth.currentUser) {
            try {
                await addDoc(collection(db, `users/${auth.currentUser.uid}/${table}`), data);
            } catch (e) {
                console.error("Error adding document to Firebase: ", e);
            }
        }
        return true;
    },
    getLogs: function (table) {
        return JSON.parse(localStorage.getItem(table) || '[]');
    },
    syncLogs: async function (table) {
        // جلب السجلات من Firebase لتحديث LocalStorage
        if (auth && auth.currentUser) {
            try {
                const querySnapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/${table}`));
                let records = [];
                querySnapshot.forEach((docSnap) => {
                    records.push(docSnap.data());
                });
                if (records.length > 0) {
                    localStorage.setItem(table, JSON.stringify(records));
                }
            } catch (e) {
                console.error("Error syncing documents from Firebase: ", e);
            }
        }
    },
    updateProfile: async function (fname, type) {
        if (auth && auth.currentUser) {
            try {
                await setDoc(doc(db, "users", auth.currentUser.uid), {
                    fname: fname,
                    type: type
                }, { merge: true });
            } catch (e) {
                console.error("Error updating profile in Firebase: ", e);
            }
        }
    },
    logout: async function () {
        if (auth) {
            await signOut(auth);
        }
        localStorage.removeItem('diacare_user_fname');
        localStorage.removeItem('diacare_diabetes_type');
        localStorage.removeItem('diacare_user_email');
        localStorage.removeItem('db_glucose');
        localStorage.removeItem('db_weight');
        localStorage.removeItem('db_meals');
        localStorage.removeItem('diacare_chat_history');
    }
};
window.DiaCareDB.init();

// مراقبة حالة تسجيل الدخول وتحديث البيانات من Firebase بشكل دائم
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            localStorage.setItem('diacare_user_fname', userData.fname);
            localStorage.setItem('diacare_diabetes_type', userData.type);
            document.dispatchEvent(new Event('userDataLoaded'));
        }
        await window.DiaCareDB.syncLogs('db_glucose');
        await window.DiaCareDB.syncLogs('db_weight');
        await window.DiaCareDB.syncLogs('db_meals');
        document.dispatchEvent(new Event('logsSynced'));
    }
});

window.switchTab = function (tab) {
    // Get elements
    const loginBtn = document.getElementById('tab-login');
    const signupBtn = document.getElementById('tab-signup');
    const loginForm = document.getElementById('form-login');
    const signupForm = document.getElementById('form-signup');

    if (tab === 'login') {
        // Update tabs
        loginBtn.classList.add('active');
        signupBtn.classList.remove('active');

        // Update forms
        loginForm.classList.remove('form-hidden');
        loginForm.classList.add('form-active');
        signupForm.classList.remove('form-active');
        signupForm.classList.add('form-hidden');
    } else {
        // Update tabs
        signupBtn.classList.add('active');
        loginBtn.classList.remove('active');

        // Update forms
        signupForm.classList.remove('form-hidden');
        signupForm.classList.add('form-active');
        loginForm.classList.remove('form-active');
        loginForm.classList.add('form-hidden');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- ميزة الدخول التلقائي: تخطي صفحة التسجيل إذا كان المستخدم مسجلاً ---
    /* تم تعطيل الدخول التلقائي مؤقتاً لتطوير صفحة الدخول
    // const isLoggedIn = localStorage.getItem('diacare_user_fname');
    // const currentPage = window.location.pathname.toLowerCase();
    // const isIndexPage = currentPage.endsWith('index.html') || currentPage.endsWith('/') || !currentPage.includes('.html');
    // if (isLoggedIn && isIndexPage) {
    //     window.location.href = 'dashboard.html';
    //     return;
    // }
    */

    // Form submissions
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                return;
            }

            const btn = e.target.querySelector('button[type="submit"]');
            const isArabic = document.documentElement.getAttribute('lang') === 'ar';
            btn.textContent = isArabic ? 'جاري تسجيل الدخول...' : 'Logging In...';
            btn.disabled = true;

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // جلب بيانات المستخدم من Firestore
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    localStorage.setItem('diacare_user_fname', userData.fname);
                    localStorage.setItem('diacare_diabetes_type', userData.type);
                } else {
                    localStorage.setItem('diacare_user_fname', 'مستخدم');
                }

                localStorage.setItem('diacare_user_email', user.email);

                // مزامنة السجلات من قاعدة البيانات (السكر، الوزن، الوجبات)
                await window.DiaCareDB.syncLogs('db_glucose');
                await window.DiaCareDB.syncLogs('db_weight');
                await window.DiaCareDB.syncLogs('db_meals');

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Login error:", error);
                alert(isArabic ? 'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.' : 'Login failed. Please check your credentials.');
                btn.textContent = isArabic ? 'تسجيل الدخول' : 'Sign In';
                btn.disabled = false;
            }
        });
    }

    const signupFormElement = document.getElementById('form-signup');
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fname = document.getElementById('signup-fname').value;
            const type = document.getElementById('signup-type').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;

            if (!fname || !type || !email || !password) {
                return; // Validation handled by HTML required attrs
            }

            const btn = e.target.querySelector('button[type="submit"]');
            const isArabic = document.documentElement.getAttribute('lang') === 'ar';
            btn.textContent = isArabic ? 'جاري إنشاء الحساب...' : 'Creating Account...';
            btn.disabled = true;

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // حفظ بيانات المستخدم الإضافية في Firestore
                await setDoc(doc(db, "users", user.uid), {
                    fname: fname,
                    type: type,
                    email: email,
                    createdAt: new Date().toISOString()
                });

                // الحفظ في LocalStorage ليعمل الموقع كما هو متوقع
                localStorage.setItem('diacare_user_fname', fname);
                localStorage.setItem('diacare_diabetes_type', type);
                localStorage.setItem('diacare_user_email', email);
                // تم حذف تخزين كلمة المرور محلياً لزيادة الأمان

                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error("Signup error:", error);
                alert(isArabic ? 'حدث خطأ أثناء إنشاء الحساب. قد يكون البريد مستخدماً بالفعل أو كلمة المرور ضعيفة.' : 'Error creating account. Email might be in use or password too weak.');
                btn.textContent = isArabic ? 'إنشاء حساب' : 'Create Account';
                btn.disabled = false;
            }
        });
    }

    // --- AI Chatbot Shared Logic for Index ---
    if (window.chatBotAttached) return;
    window.chatBotAttached = true;

    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');

    if (chatbotToggle) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWindow.classList.toggle('active');
            if (chatbotWindow.classList.contains('active')) chatInput.focus();
        });

        chatbotClose.addEventListener('click', () => {
            chatbotWindow.classList.remove('active');
        });

        const appendMessage = (text, sender, saveToHistory = true) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message msg-${sender}`;
            msgDiv.textContent = text;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            if (saveToHistory) {
                let history = JSON.parse(sessionStorage.getItem('diacare_chat_history') || '[]');
                history.push({ text, sender });
                sessionStorage.setItem('diacare_chat_history', JSON.stringify(history));
            }
        };

        const loadChatHistory = () => {
            let history = JSON.parse(sessionStorage.getItem('diacare_chat_history') || '[]');
            if (history.length > 0) {
                chatMessages.innerHTML = ''; // clear default welcome
                history.forEach(msg => {
                    appendMessage(msg.text, msg.sender, false);
                });
            }
        };
        loadChatHistory();

        const showTypingIndicator = () => {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'typing-indicator';
            typingDiv.id = 'typing-indicator';
            typingDiv.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
            chatMessages.appendChild(typingDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const hideTypingIndicator = () => {
            const typingDiv = document.getElementById('typing-indicator');
            if (typingDiv) typingDiv.remove();
        };

        const handleChatSubmit = async () => {
            const userText = chatInput.value.trim();
            if (!userText) return;

            appendMessage(userText, 'user');
            chatInput.value = '';
            showTypingIndicator();

            setTimeout(() => {
                hideTypingIndicator();
                const isArabic = document.documentElement.getAttribute('lang') === 'ar';
                const type = localStorage.getItem('diacare_diabetes_type') || 'type1';
                const lastGlucose = parseFloat(localStorage.getItem('diacare_last_glucose'));
                let response = "";

                if (userText.toLowerCase().includes('رياض') || userText.toLowerCase().includes('sport') || userText.toLowerCase().includes('exercise')) {
                    response = isArabic ?
                        "الرياضة ممتازة لخفض السكر! يُنصح بـ 150 دقيقة من التمارين الهوائية أسبوعياً (مثل المشي السريع). تأكد من فحص السكر قبل الرياضة؛ إذا كان أقل من 100، تناول وجبة خفيفة. وإذا كان فوق 250، احذر من التمارين الشاقة." :
                        "Exercise is great for lowering blood sugar! 150 mins/week of aerobic activity is recommended. Check sugar before: if <100, eat a snack. If >250, avoid strenuous exercise.";
                } else if (userText.toLowerCase().includes('أكل') || userText.toLowerCase().includes('طعام') || userText.toLowerCase().includes('eat') || userText.toLowerCase().includes('food') || userText.toLowerCase().includes('diet')) {
                    response = isArabic ?
                        "ينصح بالتركيز على الخضروات غير النشوية، والبروتينات الخالية من الدهون، والكربوهيدرات المعقدة (مثل الشوفان والخبز الأسمر). تجنب السكريات البسيطة والمشروبات المحلاة." :
                        "Focus on non-starchy vegetables, lean proteins, and complex carbs (like oats and whole wheat bread). Avoid simple sugars and sweetened drinks.";
                } else if (!isNaN(lastGlucose) && (userText.includes(lastGlucose.toString()) || userText.includes('قراءت') || userText.includes('reading') || userText.includes('سكر'))) {
                    if (lastGlucose < 70) {
                        response = isArabic ?
                            `قراءتك الحالية (${lastGlucose}) منخفضة جداً (نقص سكر الدم) 🚨\n\n📌 **الإجراء الطبي (حسب جمعية السكري الأمريكية ADA):**\n١. **تطبيق قاعدة 15:** تناول 15 جرام من الكربوهيدرات السريعة فوراً (مثل: نصف كوب عصير، ملعقة عسل، أو 3 أقراص جلوكوز).\n٢. انتظر 15 دقيقة ثم افحص السكر مرة أخرى.\n٣. إذا كان لا يزال أقل من 70، كرر الخطوة الأولى.\n٤. إذا ارتفع فوق 70، تناول وجبة خفيفة تحتوي على بروتين (مثل نصف ساندويتش) لمنع هبوطه مجدداً.` :
                            `Your reading (${lastGlucose}) is very low (Hypoglycemia) 🚨\n\n📌 **Medical Action (ADA Guidelines):**\n1. **Rule of 15:** Eat 15g of fast-acting carbs immediately (e.g., 1/2 cup juice, 1 tbsp honey).\n2. Wait 15 mins and check again.\n3. If still < 70, repeat step 1.\n4. Once > 70, eat a small snack with protein (e.g., half sandwich) to stabilize it.`;
                    } else if (lastGlucose > 180) {
                        if (type === 'type1') {
                            response = isArabic ?
                                `قراءتك الحالية (${lastGlucose}) مرتفعة ⚠️\n\n📌 **الإجراء الطبي:**\n١. اشرب كوبين من الماء للمساعدة في التخلص من السكر الزائد عبر البول.\n٢. خذ جرعة تصحيحية من الإنسولين السريع حسب توجيهات طبيبك.\n٣. **تحذير:** إذا كان السكر فوق 250، افحص الكيتونات وتجنب الرياضة الشاقة تماماً.\n٤. أعد الفحص بعد ساعتين.` :
                                `Your reading (${lastGlucose}) is high ⚠️\n\n📌 **Medical Action:**\n1. Drink plenty of water to help flush excess sugar via urine.\n2. Take a rapid insulin correction dose as directed by your doctor.\n3. **Warning:** If > 250, check for ketones and avoid strenuous exercise.\n4. Recheck in 2 hours.`;
                        } else if (type === 'type2') {
                            response = isArabic ?
                                `قراءتك الحالية (${lastGlucose}) مرتفعة ⚠️\n\n📌 **الإجراء الطبي:**\n١. تأكد من أخذ أدويتك الموصوفة (مثل حبة المنظم 700مغ) في وقتها.\n٢. اشرب الماء بكثرة للترطيب.\n٣. قم بنشاط بدني خفيف (مثل المشي لـ 15-20 دقيقة) لأن ذلك يساعد العضلات على حرق السكر الزائد.\n٤. تجنب الكربوهيدرات البسيطة في وجبتك القادمة.` :
                                `Your reading (${lastGlucose}) is high ⚠️\n\n📌 **Medical Action:**\n1. Ensure you took your prescribed meds (e.g., Metformin 700mg) on time.\n2. Drink plenty of water.\n3. Do light exercise (like a 15-20 min walk) to help muscles use excess sugar.\n4. Avoid simple carbs in your next meal.`;
                        } else if (type === 'gestational') {
                            response = isArabic ?
                                `قراءتك الحالية (${lastGlucose}) أعلى من النطاق الآمن للحمل ⚠️\n\n📌 **الإجراء الطبي:**\n١. اشربي الماء والتزمي حرفياً بالحمية الغذائية المحددة لكِ.\n٢. المشي الخفيف لـ 15 دقيقة بعد الوجبات يساعد جداً في خفض السكر.\n٣. تواصلي مع طبيبك لمراجعة الخطة العلاجية (الإنسولين هو الخيار الآمن إذا استمر الارتفاع).` :
                                `Your reading (${lastGlucose}) is above the safe pregnancy target ⚠️\n\n📌 **Medical Action:**\n1. Drink water and strictly follow your gestational diet plan.\n2. A 15-min light walk after meals significantly lowers sugar.\n3. Consult your doctor to review your treatment (Insulin is the safe option if it remains high).`;
                        } else {
                            response = isArabic ?
                                `قراءة طفلك (${lastGlucose}) مرتفعة ⚠️\n\n📌 **الإجراء الطبي:**\n١. شجعه على شرب الماء لترطيب جسمه.\n٢. احسب جرعة تصحيحية بحذر حسب توجيهات طبيب الأطفال.\n٣. راقب السكر مرة أخرى بعد الجرعة وتجنب إعطاءه سكريات إضافية.` :
                                `Your child's reading (${lastGlucose}) is high ⚠️\n\n📌 **Medical Action:**\n1. Encourage them to drink plenty of water.\n2. Calculate a careful correction dose per pediatrician's guidance.\n3. Recheck sugar later and avoid extra sweets.`;
                        }
                    } else {
                        response = isArabic ?
                            `قراءتك الحالية (${lastGlucose}) ممتازة وضمن النطاق الطبيعي الموصى به! 🎉\n\n📌 **نصيحة طبية:**\nأنت تقوم بعمل رائع. استمر في الحفاظ على هذا التوازن من خلال الالتزام بخطتك الغذائية والعلاجية، وممارسة نشاط بدني يومي.` :
                            `Your current reading (${lastGlucose}) is excellent and in range! 🎉\n\n📌 **Medical Advice:**\nYou are doing a great job. Keep this balance by sticking to your meal and treatment plan, and getting daily physical activity.`;
                    }
                } else {
                    response = isArabic ?
                        "مرحباً بك! أنا المساعد الطبي المحلي المعتمد على مراجع طبية موثوقة (مثل جمعية السكري الأمريكية ADA). يمكنك سؤالي عن الرياضة، الطعام، أو الضغط على (توضيح طبي) ليتم تحليل قراءتك." :
                        "Welcome! I am your local Medical Assistant based on reliable guidelines (like ADA). Ask me about exercise, food, or click (Medical Explanation) to get your reading analyzed.";
                }

                appendMessage(response + (isArabic ? "\n\n(ملاحظة: هذه إرشادات مرجعية، يرجى دائماً مراجعة طبيبك المعالج)." : "\n\n(Note: These are reference guidelines, always consult your treating doctor)."), 'ai');
            }, 600);
        };

        chatSendBtn.addEventListener('click', handleChatSubmit);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChatSubmit();
        });
    }

    // --- ميزة تسجيل الخروج الموحدة لجميع الصفحات ---
    const globalLogoutBtn = document.getElementById('logout-btn');
    if (globalLogoutBtn) {
        const newLogoutBtn = globalLogoutBtn.cloneNode(true);
        globalLogoutBtn.parentNode.replaceChild(newLogoutBtn, globalLogoutBtn);
        newLogoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.DiaCareDB && window.DiaCareDB.logout) {
                await window.DiaCareDB.logout();
            }
            window.location.href = 'index.html';
        });
    }
});
