# ניהול צ'ק-ליסטים לפרויקטים

אפליקציית React + Tailwind לניהול צ'ק-ליסטים של פרויקטים (סקרים והערכות ביצועים), עם שמירת נתונים ב-Supabase והתחברות עם אימייל וסיסמה — כל משתמש רואה **רק** את הפרויקטים שהוא יצר.

> 💡 לגבי "שם משתמש": Supabase Auth מבוסס על **אימייל** ולא על שם משתמש חופשי. זה בפועל אותו דבר מבחינת שימוש (כל אחד נכנס עם משהו ייחודי + סיסמה), אבל פשוט וחסין הרבה יותר להטמעה (כולל תמיכה מובנית באיפוס סיסמה בעתיד אם תרצו).

## 1. הקמת Supabase

1. פתחו פרויקט חדש ב-[supabase.com](https://supabase.com).
2. בתפריט השמאלי: **SQL Editor** → **New query**, הדביקו את התוכן של `supabase/schema.sql` והריצו (Run).
   זה יוצר את הטבלה `projects` עם עמודת `user_id`, ומגדיר מדיניות RLS (Row Level Security) כך שכל משתמש רואה/עורך/מוחק **רק** את הפרויקטים שלו.
3. בתפריט **Authentication → Providers**, ודאו ש-**Email** מופעל (מופעל כברירת מחדל).
4. **חשוב**: בתפריט **Authentication → Settings**, יש אפשרות "Confirm email" — אם היא מופעלת, משתמש חדש שנרשם יקבל מייל אימות וצריך ללחוץ עליו לפני שיוכל להתחבר. לצוות פנימי קטן אפשר לכבות את זה כדי לפשט את ההרשמה (Auth → Settings → Email Auth → בטלו את "Confirm email"), או להשאיר מופעל לביטחון נוסף.
5. **לצורך "שכחתי סיסמה"**: בתפריט **Authentication → URL Configuration**, הוסיפו את הכתובת שבה האפליקציה תרוץ (למשל `https://your-app.vercel.app`, וגם `http://localhost:5173` לבדיקות מקומיות) תחת **Redirect URLs**. בלי זה, הקישור שנשלח במייל לאיפוס סיסמה לא יחזיר את המשתמש לאפליקציה כמו שצריך.
5. בתפריט **Project Settings → API**, העתיקו:
   - `Project URL`
   - `anon public` key

## 2. הרצה מקומית

```bash
npm install
cp .env.example .env
# ערכו את .env והכניסו את ה-URL וה-anon key מ-Supabase
npm run dev
```

האתר ירוץ בכתובת `http://localhost:5173`. בפעם הראשונה תראו מסך התחברות/הרשמה — הירשמו עם אימייל וסיסמה כדי להתחיל.

## 3. העלאה ל-GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## 4. פריסה ב-Vercel

1. היכנסו ל-[vercel.com](https://vercel.com) → **Add New Project** → ייבאו את ה-repo מ-GitHub.
2. Vercel יזהה אוטומטית שזה פרויקט Vite (Framework Preset: Vite).
3. תחת **Environment Variables**, הוסיפו:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (אותם ערכים מ-`.env` שלכם)
4. לחצו **Deploy**.

בכל פעם שתדחפו (push) לענף הראשי ב-GitHub, Vercel יבנה ויפרוס גרסה חדשה אוטומטית.

## מבנה הפרויקט

```
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── .env.example
├── supabase/
│   └── schema.sql          # סכימת הטבלה + RLS להרצה ב-Supabase SQL Editor
└── src/
    ├── main.jsx             # נקודת הכניסה
    ├── App.jsx              # כל הרכיבים והלוגיקה של האפליקציה + שער האימות
    ├── AuthScreen.jsx        # מסך התחברות / הרשמה
    ├── index.css            # Tailwind
    └── lib/
        ├── supabase.js      # יצירת לקוח ה-Supabase
        ├── auth.js          # signIn / signUp / signOut / onAuthStateChange
        └── projectsApi.js   # שכבת גישה לנתונים (fetch/insert/update/delete)
```

## איך הבידוד בין משתמשים עובד

- לכל פרויקט בטבלה יש עמודת `user_id`.
- מדיניות ה-RLS ב-`schema.sql` אוכפת בצד השרת (לא רק בקוד הצד-לקוח) שמשתמש יכול לקרוא/לכתוב/למחוק רק שורות ש-`user_id` שלהן שווה למשתמש המחובר (`auth.uid()`).
- המשמעות: גם אם יש באג בקוד ה-React, אף משתמש לא יכול "לראות בטעות" פרויקט של מישהו אחר — ההגנה האמיתית היא ברמת מסד הנתונים.
- כשמשתמש יוצר פרויקט חדש, ה-`user_id` שלו מוצמד אוטומטית.

### אם כבר יש לכם טבלה קיימת בלי `user_id`

אם הרצתם בעבר גרסה ישנה יותר של `schema.sql` (בלי אימות), יש הוראות מיגרציה בהערה בתוך הקובץ `supabase/schema.sql` — בקצרה: מוסיפים את עמודת `user_id`, משייכים את השורות הקיימות למשתמש מסוים ידנית, ורק אז מגדירים את העמודה כ-`not null`.

## הערות נוספות

- האפליקציה **לא** מגיעה עם משתמשי דמו — כל משתמש מתחיל עם לוח ריק.
- כל שינוי בצ'ק-ליסט (סימון V, הערה, עריכת ניסוח, שינוי סדר וכו') נשמר מיידית ל-Supabase ברקע (ללא כפתור "שמירה" נפרד).
- ייצוא ל-PDF מתבצע דרך פונקציית ההדפסה של הדפדפן (`window.print()` → שמירה כ-PDF), כדי לתמוך נכון בעברית/RTL בלי תלות בספריות PDF כבדות.
- **שים לב**: הגרסאות המקומיות-בלבד (קובץ ה-HTML העצמאי / ה-artifact בצ'אט) משתמשות ב-localStorage של הדפדפן ואין בהן מנגנון התחברות אמיתי — הן כבר "פרטיות" מטבען כי כל דפדפן שומר את הנתונים שלו בנפרד, אבל אין בהן בידוד רב-משתמשי אמיתי מול שרת. כניסה עם אימייל/סיסמה ובידוד נתונים אמיתי בין אנשי צוות שונים קיימים **רק** בגרסת Supabase/Vercel שבתיקייה הזו.

