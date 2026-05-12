document.addEventListener('DOMContentLoaded', () => {
    // --- Shared Logic: Theme & Language ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    const savedTheme = localStorage.getItem('diacare_theme');
    if (savedTheme === 'dark' && themeIcon) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            if (isDark) {
                document.documentElement.removeAttribute('data-theme');
                if (themeIcon) themeIcon.className = 'fas fa-moon';
                localStorage.setItem('diacare_theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                if (themeIcon) themeIcon.className = 'fas fa-sun';
                localStorage.setItem('diacare_theme', 'dark');
            }
        });
    }

    // Load user profile
    const userName = localStorage.getItem('diacare_user_fname');
    if (userName) {
        const greetingEl = document.getElementById('user-greeting');
        if (greetingEl) {
            const updateGreeting = () => {
                const curLang = document.documentElement.getAttribute('lang') || 'en';
                const welcomeStr = dictionary && dictionary['welcome'] ? dictionary['welcome'][curLang] : 'Welcome,';
                greetingEl.textContent = `${welcomeStr} ${userName}!`;
            };
            setTimeout(updateGreeting, 50);
            const langBtn = document.getElementById('lang-toggle');
            if (langBtn) {
                langBtn.addEventListener('click', () => setTimeout(updateGreeting, 50));
            }
        }
    }

    // --- Personalized Diet Plan Logic ---
    const renderDietPlan = () => {
        const dietPlanContainer = document.getElementById('personalized-diet-plan');
        if (!dietPlanContainer) return;

        const lang = document.documentElement.getAttribute('lang') || 'en';
        const isArabic = lang === 'ar';

        // استخدام متغير لحفظ النوع المختار من القائمة وعرض النظام الخاص به (الافتراضي هو نوع المريض المسجل)
        if (!window.selectedDietType) {
            window.selectedDietType = localStorage.getItem('diacare_diabetes_type') || 'type1';
        }
        const type = window.selectedDietType;

        const plans = {
            type1: {
                title: { ar: 'النظام الغذائي: السكري النوع الأول', en: 'Diet Plan: Type 1 Diabetes' },
                desc: { ar: 'يعتمد نظامك بشكل أساسي على مطابقة جرعة الإنسولين مع كمية الكربوهيدرات التي تتناولها للحفاظ على استقرار السكر.', en: 'Your plan focuses on matching your insulin dose with your carbohydrate intake to maintain steady blood sugar.' },
                eat: { ar: 'الكربوهيدرات المعقدة (شوفان، خبز أسمر)، الخضراوات غير النشوية، البروتينات (بيض، دجاج، أسماك)، والدهون الصحية كمصدر طاقة بطيء.', en: 'Complex carbs (oats, brown bread), non-starchy veggies, proteins (eggs, chicken), and healthy fats for slow energy.' },
                avoid: { ar: 'العصائر المحلاة، المشروبات الغازية، والحلويات السريعة (تُستخدم فقط في حالة هبوط السكر المفاجئ).', en: 'Sweetened juices, sodas, and fast sugars (use these ONLY to treat sudden lows).' },
                tips: { ar: 'قم بقياس وحساب الكربوهيدرات بدقة لكل وجبة، ولا تفوت الوجبات الرئيسية لضمان عمل الإنسولين القاعدي بشكل آمن.', en: 'Accurately count carbs for each meal, and do not skip main meals to ensure basal insulin works safely.' },
                menu: {
                    breakfast: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> نصف كوب شوفان مع حليب، مكسرات، ونصف تفاحة.</li><li><b>خيار 2:</b> شريحتان توست أسمر + بيضتان مسلوقتان + خضار.</li><li><b>خيار 3:</b> كوب زبادي يوناني + كوب فراولة + بذور الشيا.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> 1/2 cup oatmeal with milk, nuts, and half an apple.</li><li><b>Option 2:</b> 2 slices brown toast + 2 boiled eggs + veggies.</li><li><b>Option 3:</b> 1 cup greek yogurt + strawberries + chia seeds.</li></ul>'
                    },
                    lunch: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> صدر دجاج مشوي + نصف كوب كينوا أو أرز أسمر + سلطة.</li><li><b>خيار 2:</b> 150 جم سمك مشوي بالفرن + حبة بطاطا مشوية + بروكلي.</li><li><b>خيار 3:</b> كوب عدس مطبوخ + سلطة خضراء + نصف رغيف أسمر.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Grilled chicken + 1/2 cup quinoa/brown rice + salad.</li><li><b>Option 2:</b> 150g baked fish + 1 baked potato + broccoli.</li><li><b>Option 3:</b> 1 cup cooked lentils + side salad + 1/2 brown pita.</li></ul>'
                    },
                    dinner: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> بيضتان مسلوقتان + شريحة توست أسمر + خيار وطماطم.</li><li><b>خيار 2:</b> سلطة تونة (بالماء) مع زيت زيتون + شريحة توست أسمر.</li><li><b>خيار 3:</b> 3 ملاعق فول + ملعقة زيت زيتون + نصف رغيف أسمر.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> 2 boiled eggs + 1 brown toast + cucumber/tomato.</li><li><b>Option 2:</b> Water-packed tuna salad with olive oil + 1 brown toast.</li><li><b>Option 3:</b> 3 tbsp foul (fava beans) + olive oil + 1/2 brown pita.</li></ul>'
                    },
                    snacks: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> زبادي يوناني سادة.</li><li><b>خيار 2:</b> حفنة من اللوز أو الجوز غير المملح.</li><li><b>خيار 3:</b> تفاحة صغيرة + ملعقة زبدة فول سوداني.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Plain Greek yogurt.</li><li><b>Option 2:</b> Handful of unsalted almonds or walnuts.</li><li><b>Option 3:</b> Small apple + 1 tbsp peanut butter.</li></ul>'
                    }
                }
            },
            type2: {
                title: { ar: 'النظام الغذائي: السكري النوع الثاني', en: 'Diet Plan: Type 2 Diabetes' },
                desc: { ar: 'يركز نظامك على إدارة الوزن وتقليل مقاومة الجسم للإنسولين من خلال اختيار أطعمة ذات مؤشر جلايسيمي منخفض.', en: 'Your plan focuses on weight management and reducing insulin resistance by choosing low glycemic index foods.' },
                eat: { ar: 'الأطعمة الغنية بالألياف (الخضار الورقية، بذور الشيا)، البروتينات الخالية من الدهون، والدهون الصحية (زيت الزيتون، الأفوكادو).', en: 'High-fiber foods (leafy greens, chia seeds), lean proteins, and healthy fats (olive oil, avocado).' },
                avoid: { ar: 'الخبز الأبيض، الأرز الأبيض بكميات كبيرة، السكريات المضافة، الوجبات السريعة، والأطعمة المقلية بالزيوت المهدرجة.', en: 'White bread, large portions of white rice, added sugars, fast food, and heavily fried foods.' },
                tips: { ar: 'استخدم "طريقة الطبق" (نصف خضار، ربع بروتين، ربع كربوهيدرات). المشي لـ 15 دقيقة بعد الأكل يحسن استجابة الإنسولين بشكل كبير.', en: 'Use the "Plate Method" (half veg, 1/4 protein, 1/4 carbs). A 15-min walk after meals greatly improves insulin response.' },
                menu: {
                    breakfast: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> لبنة مع زيت زيتون + شريحة توست أسمر + نعناع وزيتون.</li><li><b>خيار 2:</b> أومليت بالسبانخ والفطر + نصف رغيف أسمر.</li><li><b>خيار 3:</b> بودينج بذور الشيا بحليب اللوز (غير المحلى).</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Labneh with olive oil + 1 brown toast + mint & olives.</li><li><b>Option 2:</b> Spinach and mushroom omelet + 1/2 brown pita.</li><li><b>Option 3:</b> Chia seed pudding made with unsweetened almond milk.</li></ul>'
                    },
                    lunch: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> شريحة سمك/سلمون مشوي + بروكلي + نصف كوب عدس.</li><li><b>خيار 2:</b> سلطة سيزر دجاج (بدون خبز محمص) + صلصة خفيفة.</li><li><b>خيار 3:</b> كوسا أو باذنجان بالفرن مع لحم مفروم وصلصة طماطم.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Grilled fish/salmon + steamed broccoli + 1/2 cup lentils.</li><li><b>Option 2:</b> Chicken Caesar salad (no croutons) + light dressing.</li><li><b>Option 3:</b> Zucchini or eggplant baked with minced meat in tomato sauce.</li></ul>'
                    },
                    dinner: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> جبن حلوم مشوي مع سلطة سبانخ وجوز.</li><li><b>خيار 2:</b> طبق شوربة خضار + قطعة دجاج مشوي صغيرة.</li><li><b>خيار 3:</b> سلطة يونانية مع جبن فيتا وزيتون كالاماتا.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Grilled halloumi cheese with spinach & walnut salad.</li><li><b>Option 2:</b> Bowl of vegetable soup + small piece of grilled chicken.</li><li><b>Option 3:</b> Greek salad with feta cheese and kalamata olives.</li></ul>'
                    },
                    snacks: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> شرائح خيار وجزر + ملعقتين حمص.</li><li><b>خيار 2:</b> مكعب شوكولاتة داكنة (أكثر من 70% كاكاو).</li><li><b>خيار 3:</b> نصف كوب إدامامي أو حمص محمص بالفرن.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Cucumber & carrot slices + 2 tbsp hummus.</li><li><b>Option 2:</b> 1 square of dark chocolate (>70% cocoa).</li><li><b>Option 3:</b> 1/2 cup roasted edamame or chickpeas.</li></ul>'
                    }
                }
            },
            gestational: {
                title: { ar: 'النظام الغذائي: سكري الحمل', en: 'Diet Plan: Gestational Diabetes' },
                desc: { ar: 'يهدف نظامك إلى توفير تغذية سليمة لنمو طفلك، مع السيطرة الصارمة على مستويات السكر لتجنب أي مضاعفات أثناء الحمل.', en: 'Your plan provides proper nutrition for your baby\'s growth, with strict sugar control to avoid pregnancy complications.' },
                eat: { ar: 'وجبات صغيرة ومتعددة (3 رئيسية و 2-3 خفيفة)، بروتين مع كل وجبة للمساعدة في الشبع، وكربوهيدرات غنية بالألياف.', en: 'Small, frequent meals (3 main, 2-3 snacks), protein with every meal for satiety, and high-fiber carbs.' },
                avoid: { ar: 'الكربوهيدرات العالية في وجبة الإفطار (مقاومة الإنسولين تكون أعلى في الصباح)، الحلويات، والعصائر بجميع أنواعها.', en: 'High carbs at breakfast (insulin resistance is highest in the morning), sweets, and all juices.' },
                tips: { ar: 'وزعي الكربوهيدرات على مدار اليوم ولا تتناولي كمية كبيرة دفعة واحدة. تجنبي الصيام أو الجوع لفترات طويلة.', en: 'Distribute carbs throughout the day. Avoid eating large amounts at once, and do not go hungry for long periods.' },
                menu: {
                    breakfast: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> بيضة مسلوقة + توست أسمر + شاي بدون سكر.</li><li><b>خيار 2:</b> بيضتان مخفوقتان + نصف حبة أفوكادو (بدون خبز).</li><li><b>خيار 3:</b> نصف كوب جبن قريش (Cottage) + حفنة توت.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> 1 boiled egg + 1 brown toast + unsweetened tea.</li><li><b>Option 2:</b> 2 scrambled eggs + 1/2 avocado (no bread).</li><li><b>Option 3:</b> 1/2 cup cottage cheese + handful of berries.</li></ul>'
                    },
                    lunch: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> يخنة لحم مع خضار (كوسا/فاصولياء) + 4 ملاعق أرز أسمر.</li><li><b>خيار 2:</b> دجاج مشوي + سلطة مشكلة كبيرة + نصف حبة بطاطا حلوة.</li><li><b>خيار 3:</b> سلمون مشوي بالفرن + هليون أو بروكلي + ثلث كوب كينوا.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Meat & vegetable stew + 4 tbsp brown rice.</li><li><b>Option 2:</b> Grilled chicken + large mixed salad + 1/2 sweet potato.</li><li><b>Option 3:</b> Baked salmon + asparagus/broccoli + 1/3 cup quinoa.</li></ul>'
                    },
                    dinner: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> سلطة دجاج مشوي مع القليل من زيت الزيتون والليمون.</li><li><b>خيار 2:</b> شريحة خبز حبوب كاملة + جبن + شرائح طماطم.</li><li><b>خيار 3:</b> طبق شوربة عدس + خضروات ورقية جانبية.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Grilled chicken salad with olive oil and lemon.</li><li><b>Option 2:</b> 1 slice whole grain bread + cheese + sliced tomatoes.</li><li><b>Option 3:</b> Bowl of lentil soup + side of leafy greens.</li></ul>'
                    },
                    snacks: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> تفاحة صغيرة + ملعقة زبدة فول سوداني.</li><li><b>خيار 2:</b> كوب حليب خالي الدسم + 3 حبات لوز.</li><li><b>خيار 3:</b> حفنة صغيرة من الفستق الحلبي أو الجوز.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Small apple + 1 tbsp peanut butter.</li><li><b>Option 2:</b> 1 cup skim milk + 3 almonds.</li><li><b>Option 3:</b> Small handful of pistachios or walnuts.</li></ul>'
                    }
                }
            },
            pediatric: {
                title: { ar: 'النظام الغذائي: سكري الأطفال', en: 'Diet Plan: Pediatric Diabetes' },
                desc: { ar: 'يهدف النظام لضمان النمو والتطور الجسدي والعقلي السليم للطفل، مع الحفاظ على المرونة لتقليل الضغط النفسي عليه.', en: 'Aims to ensure proper physical and mental growth for your child, keeping the diet flexible to reduce stress.' },
                eat: { ar: 'وجبات متوازنة ومغذية: فواكه طازجة، ألبان، حبوب كاملة، وبروتينات متنوعة لبناء العضلات.', en: 'Balanced nutritious meals: fresh fruits, dairy, whole grains, and diverse proteins to build muscles.' },
                avoid: { ar: 'المشروبات الغازية المحلاة، العصائر الصناعية، والاعتماد المفرط على السكاكر والحلويات كوجبات خفيفة يومية.', en: 'Sugary sodas, artificial juices, and heavy daily reliance on candies and sweets as snacks.' },
                tips: { ar: 'اجعل وقت الطعام ممتعاً! شارك طفلك في اختيار الأطعمة الصحية، وعلّمه كيفية حساب الكربوهيدرات تدريجياً وبطريقة مبسطة.', en: 'Make mealtime fun! Involve your child in healthy choices, and teach them simple carb counting gradually.' },
                menu: {
                    breakfast: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> حبوب إفطار (كورن فليكس) أسمر مع حليب وفراولة.</li><li><b>خيار 2:</b> ساندويتش بيض بخبز أسمر + نصف كوب عصير برتقال طبيعي.</li><li><b>خيار 3:</b> زبدة فول سوداني على توست أسمر + نصف موزة.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Whole grain cereal with milk and strawberries.</li><li><b>Option 2:</b> Egg sandwich (brown bread) + 1/2 cup fresh orange juice.</li><li><b>Option 3:</b> Peanut butter on brown toast + 1/2 banana.</li></ul>'
                    },
                    lunch: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> برجر منزلي بخبز القمح الكامل + أصابع جزر وخيار.</li><li><b>خيار 2:</b> قطع دجاج مشوية بالفرن + نصف كوب ذرة حلوة + شرائح تفاح.</li><li><b>خيار 3:</b> ساندويتش تونة أو جبنة بخبز التورتيلا الأسمر + طماطم كرزية.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Homemade burger on whole wheat bun + carrot/cucumber sticks.</li><li><b>Option 2:</b> Baked chicken strips + 1/2 cup sweet corn + apple slices.</li><li><b>Option 3:</b> Tuna or cheese wrap (whole wheat) + cherry tomatoes.</li></ul>'
                    },
                    dinner: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> معكرونة بصلصة الطماطم واللحم المفروم + سلطة جانبية.</li><li><b>خيار 2:</b> شريحة بيتزا منزلية (عجينة سمراء وخضار) + قطعة دجاج.</li><li><b>خيار 3:</b> كباب لحم مشوي + 3 ملاعق أرز + زبادي.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Pasta with tomato sauce and minced meat + side salad.</li><li><b>Option 2:</b> Homemade whole-wheat pizza slice (veggies) + chicken piece.</li><li><b>Option 3:</b> Grilled meat kabab + 3 tbsp rice + yogurt.</li></ul>'
                    },
                    snacks: {
                        ar: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>خيار 1:</b> كوب بوشار (فشار) معد بالمنزل بقليل من الزيت.</li><li><b>خيار 2:</b> أصابع جبنة (String Cheese).</li><li><b>خيار 3:</b> زبادي فواكه (بدون سكر مضاف) أو سلطة فواكه صغيرة.</li></ul>',
                        en: '<ul style="margin:0; padding-inline-start: 1.2rem; display: flex; flex-direction: column; gap: 0.3rem;"><li><b>Option 1:</b> Cup of homemade popcorn (light oil).</li><li><b>Option 2:</b> String cheese / cheese sticks.</li><li><b>Option 3:</b> Unsweetened fruit yogurt or small fruit salad.</li></ul>'
                    }
                }
            }
        };

        const plan = plans[type] || plans.type1;

        dietPlanContainer.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; color: var(--primary-color); font-size: 1.5rem;">
                        <i class="fas fa-clipboard-check"></i>
                    </div>
                    <h3 style="margin: 0; color: var(--primary-dark); font-size: 1.4rem;">${plan.title[lang]}</h3>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <select id="diet-plan-selector" style="padding: 0.5rem; border-radius: 8px; border: 1px solid var(--border); background: var(--input-bg); color: var(--text-main); font-family: inherit; font-weight: bold; cursor: pointer;">
                        <option value="type1" ${type === 'type1' ? 'selected' : ''}>${isArabic ? 'النوع الأول (Type 1)' : 'Type 1 Diabetes'}</option>
                        <option value="type2" ${type === 'type2' ? 'selected' : ''}>${isArabic ? 'النوع الثاني (Type 2)' : 'Type 2 Diabetes'}</option>
                        <option value="gestational" ${type === 'gestational' ? 'selected' : ''}>${isArabic ? 'سكري الحمل (Gestational)' : 'Gestational'}</option>
                        <option value="pediatric" ${type === 'pediatric' ? 'selected' : ''}>${isArabic ? 'سكري الأطفال (Pediatric)' : 'Pediatric'}</option>
                    </select>
                    <button id="print-diet-btn" style="background: var(--primary-color); color: white; border: none; padding: 0.5rem 0.8rem; border-radius: 8px; cursor: pointer; transition: 0.3s;" title="${isArabic ? 'طباعة النظام الغذائي' : 'Print Diet Plan'}"><i class="fas fa-print"></i></button>
                </div>
            </div>
            <p style="color: var(--text-main); font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem; background: var(--surface); padding: 1rem; border-radius: 8px; border-left: 4px solid var(--primary-color);">
                ${plan.desc[lang]}
            </p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 1rem;">
                    <h4 style="color: #059669; margin-top: 0; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-check-circle"></i> ${isArabic ? 'ماذا تأكل / تُركّز عليه' : 'What to Eat / Focus On'}</h4>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-main); line-height: 1.5;">${plan.eat[lang]}</p>
                </div>
                <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 1rem;">
                    <h4 style="color: #dc2626; margin-top: 0; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-times-circle"></i> ${isArabic ? 'ماذا تتجنّب / تُقلّل منه' : 'What to Avoid / Limit'}</h4>
                    <p style="margin: 0; font-size: 0.9rem; color: var(--text-main); line-height: 1.5;">${plan.avoid[lang]}</p>
                </div>
            </div>

            <!-- نموذج الوجبات اليومية -->
            <h4 style="color: var(--primary-dark); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-utensils"></i> ${isArabic ? 'نموذج وجبات يومي مقترح' : 'Daily Meal Plan Example'}</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem;">
                    <h5 style="color: var(--secondary-color); margin: 0 0 0.5rem 0;"><i class="fas fa-sun"></i> ${isArabic ? 'الإفطار' : 'Breakfast'}</h5>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.4;">${plan.menu.breakfast[lang]}</p>
                </div>
                <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem;">
                    <h5 style="color: var(--secondary-color); margin: 0 0 0.5rem 0;"><i class="fas fa-cloud-sun"></i> ${isArabic ? 'الغداء' : 'Lunch'}</h5>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.4;">${plan.menu.lunch[lang]}</p>
                </div>
                <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem;">
                    <h5 style="color: var(--secondary-color); margin: 0 0 0.5rem 0;"><i class="fas fa-moon"></i> ${isArabic ? 'العشاء' : 'Dinner'}</h5>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.4;">${plan.menu.dinner[lang]}</p>
                </div>
                <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1rem;">
                    <h5 style="color: var(--secondary-color); margin: 0 0 0.5rem 0;"><i class="fas fa-apple-alt"></i> ${isArabic ? 'وجبات خفيفة' : 'Snacks'}</h5>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-main); line-height: 1.4;">${plan.menu.snacks[lang]}</p>
                </div>
            </div>

            <div style="background: var(--input-bg); border-radius: 8px; padding: 1rem;">
                <h4 style="color: var(--secondary-color); margin-top: 0; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;"><i class="fas fa-lightbulb"></i> ${isArabic ? 'نصيحة ذهبية' : 'Golden Tip'}</h4>
                <p style="margin: 0; font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">${plan.tips[lang]}</p>
            </div>
        `;

        // تحديث النظام المعروض عند التبديل من القائمة
        const selector = document.getElementById('diet-plan-selector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                window.selectedDietType = e.target.value;
                renderDietPlan();
            });
        }

        // تفعيل أداة طباعة النظام الغذائي
        const printBtn = document.getElementById('print-diet-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                const printContent = document.getElementById('personalized-diet-plan').innerHTML;
                const originalContent = document.body.innerHTML;

                // إنشاء واجهة طباعة نظيفة وخالية من الأزرار الجانبية
                document.body.innerHTML = `
                    <div style="padding: 2rem; direction: ${isArabic ? 'rtl' : 'ltr'}; font-family: 'Cairo', sans-serif;">
                        <h2 style="color: #6a3ec4; text-align: center; border-bottom: 2px solid #eee; padding-bottom: 1rem; margin-bottom: 2rem;">DiaCare Diet Plan</h2>
                        ${printContent.replace(/<button.*?>.*?<\/button>/g, '')}
                        <p style="text-align: center; margin-top: 3rem; font-size: 0.8rem; color: #666;">Generated by DiaCare Platform</p>
                    </div>
                `;

                window.print();

                document.body.innerHTML = originalContent;
                window.location.reload(); // استرجاع الأحداث البرمجية بعد الطباعة
            });
        }
    };
    renderDietPlan();

    // Re-render when language changes
    document.addEventListener('languageChanged', () => {
        if (typeof renderDietPlan === 'function') renderDietPlan();

        // update user greeting
        const userName = localStorage.getItem('diacare_user_fname');
        if (userName) {
            const greetingEl = document.getElementById('user-greeting');
            if (greetingEl) {
                const curLang = document.documentElement.getAttribute('lang') || 'en';
                const welcomeStr = dictionary && dictionary['welcome'] ? dictionary['welcome'][curLang] : 'Welcome,';
                greetingEl.textContent = `${welcomeStr} ${userName}!`;
            }
        }
    });

    // --- AI Chatbot Shared Logic ---
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
                } else if (userText.toLowerCase().includes('بيتزا') || userText.toLowerCase().includes('برجر') || userText.toLowerCase().includes('سريع') || userText.toLowerCase().includes('pizza') || userText.toLowerCase().includes('burger')) {
                    response = isArabic ?
                        "🍕 الوجبات السريعة والبيتزا تحتوي على نسبة عالية من الكربوهيدرات والدهون معاً. الدهون تبطئ هضم الكربوهيدرات، مما يسبب ما يُعرف بـ (تأثير البيتزا)، وهو ارتفاع متأخر في السكر (بعد 3-4 ساعات). يُنصح بمراقبة سكرك لفترة أطول بعد هذه الوجبة." :
                        "🍕 Fast food and pizza are high in carbs and fats. Fats delay carb digestion, causing the 'Pizza Effect' - a delayed sugar spike (3-4 hours later). Monitor your sugar for a longer period after this meal.";
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

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.DiaCareDB && window.DiaCareDB.logout) {
                await window.DiaCareDB.logout();
            }
            localStorage.removeItem('diacare_user_fname');
            localStorage.removeItem('diacare_diabetes_type');
            localStorage.removeItem('diacare_chat_history');
            window.location.href = 'index.html';
        });
    }
});
