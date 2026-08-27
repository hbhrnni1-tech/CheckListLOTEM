import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Plus, Search, Trash2, Pencil, X, ChevronDown, ChevronUp, ClipboardList,
  Users, Calendar, ArrowRight, CheckCircle2, MinusCircle,
  ListChecks, StickyNote, AlertCircle, Sparkles, Rocket, Check, FileDown, Eye,
  Loader2, AlertTriangle, RefreshCw, LogOut
} from "lucide-react";
import { fetchProjects, insertProject, updateProjectRow, deleteProjectRow } from "./lib/projectsApi";
import { getSession, onAuthStateChange, signOut } from "./lib/auth";
import AuthScreen from "./AuthScreen";
import ResetPasswordScreen from "./ResetPasswordScreen";

/* ------------------------------------------------------------------ */
/* Seed data — extracted verbatim from the client's xlsx checklists    */
/* ------------------------------------------------------------------ */

const TEMPLATES = {
  "performance": {
    "label": "הערכת ביצועים",
    "categories": [
      {
        "name": "כללי",
        "items": [
          {
            "text": "במידה והלקוח חדש - העברת פרטי פתיחת חברה ב AB לפתיחת הסביבה - שם החברה, שפות, סוג תהליך (תהליך הערכה/סקר)",
            "heading": false
          },
          {
            "text": "התנעת תהליך מול היועץ (פורום תפעול --> שימושי מערכת חדשה --> פגישת בתנעה - הערכת ביצועים)",
            "heading": false
          }
        ]
      },
      {
        "name": "הכנת מייל תשתיות (ניתן להיעזר בנוסח לדוגמה בנמצא בפורום תפעול > תשתיות מול הלקוח > מייל תשתיות עברית)",
        "items": [
          {
            "text": "שליחת בדיקות מחשוב- העברת קובץ ללקוח לבדיקות של IT (פורום תפעול --> תשתיות מול הלקוח --> בדיקות מחשוב --> קובץ בדיקות מחשוב)",
            "heading": false
          },
          {
            "text": "שליחת קובץ משתתפים ללקוח למילוי - אם מדובר בלקוח קיים אז לשלוח את הקובץ מהתהליך הקודם",
            "heading": false
          },
          {
            "text": "הכנת תכנית עבודה ושליחה ללקוח",
            "heading": false
          },
          {
            "text": "שליחת נוסחי מיילים מתוקפים לאישור הלקוח",
            "heading": false
          }
        ]
      },
      {
        "name": "תשתיות במערכת",
        "items": [
          {
            "text": "חיבור SAML - במידה ורוצים יש לחבר את זיו (פורום תפעול > שימושי מערכת חדשה > הכנה לחיבור ל SAML)",
            "heading": false
          }
        ]
      },
      {
        "name": "תשתיות במערכת לפני אישור לקוח",
        "items": [
          {
            "text": "הגדרות מערכת",
            "heading": true
          },
          {
            "text": "הגדרת צבעי מערכת והוספת לוגו (בגודל 250X35)",
            "heading": false
          },
          {
            "text": "הגדרת לוח בקרה - לוח בקרה (מוצג/לא מוצג), הצג את \"היחידה שלי\"  (מוצג/לא מוצג), הצג כותרת (באנר בגודל 1650X250), אפשר גישה לעובד שאינו מנהל (מוצג/לא מוצג)",
            "heading": false
          },
          {
            "text": "הגדרת אזור אישי - יש לסמן את: הצגת עמוד אזור אישי, העובד יכול לגשת לאזור האישי שלו, הצגת אזור תהליכי הערכה",
            "heading": false
          },
          {
            "text": "הגדרת Flow של התהליך - שלבי פתיחת הטפסים",
            "heading": true
          },
          {
            "text": "בדיקה האם הטופס חובה למילוי ומשפיע על המעבר לטופס הבא (\"סוג הערכה יפתח בתנאי\")",
            "heading": false
          },
          {
            "text": "להגדיר כל טופס האם ניתן לעריכה לאחר שליחה ובאילו תנאים",
            "heading": false
          },
          {
            "text": "בדיקה של חשיפה עבור מנהלים היררכיים- מומלץ להגדיר שכן",
            "heading": false
          },
          {
            "text": "יש לעדכן ברוב המקרים הצגה של הערכת מנהל למוערך בסיום שיחת משוב",
            "heading": false
          },
          {
            "text": "בחלק מהמקרים נגדיר שהערכה עצמית חשופה למנהל רק אחרי סיום מילוי הערכת מנהל",
            "heading": false
          },
          {
            "text": "במידה וההערכה אינה רלוונטית לאוכלוסייה מסוימת בעץ הארגוני, יש ליצור \"הערכה בתנאי\"",
            "heading": false
          },
          {
            "text": "לוודא הגדרה של תאריכי טפסים לכל טופס וכל התהליך באופן כללי",
            "heading": false
          }
        ]
      },
      {
        "name": "בניית טפסים לאישור מול הלקוח",
        "items": [
          {
            "text": "הוספת שדות נוספים בהתאם לדינאמי בתהליך, יש להגדיר את כל השדות הנוספים בפורמט רשימה",
            "heading": false
          },
          {
            "text": "הוספת מדדים במידת הצורך",
            "heading": false
          },
          {
            "text": "הגדרה של השאלונים - הוספת כותרות, הנחיות, שאלות, טבלאות ועוד",
            "heading": false
          },
          {
            "text": "דינאמי, שליפות ושיוך למדדים",
            "heading": false
          },
          {
            "text": "הגדרות של עיצובים ובאנרים (1800X270)",
            "heading": false
          },
          {
            "text": "בניית משתמשי דמו בהתאם לכל שדה דינאמי בתהליך",
            "heading": false
          }
        ]
      },
      {
        "name": "בדיקות על הטפסים לפני אישור לקוח",
        "items": [
          {
            "text": "בדיקה שהשאלונים תואמים את המקור, השוואת הקובץ העדכני ביותר שקיבלנו מהיועץ / לקוח לשאלונים שבנינו + בדיקה שכלל השאלות מופיעות",
            "heading": false
          },
          {
            "text": "בשאלון דינאמי בו יש אלמנטים שונים יש לבדוק את כל המצבים - להיכנס לכל אחד מהדמואים ולבדוק שהטופס של סוג אוכלוסיה זה הוא בהתאם להגדרות",
            "heading": false
          },
          {
            "text": "הגהה של הטופס - בדיקת תקינות ואחידות הדקדוק בשאלונים, בדיקת תקינות ואחידות סימני הפיסוק והניקוד, בדיקת אחידות לשון זכר/נקבה",
            "heading": false
          },
          {
            "text": "בדיקת העיצובים - אחידות גודל, צבע וגופן לכל אורך השאלון",
            "heading": false
          },
          {
            "text": "תרגומים - לוודא שתרגום ההיגדים מדויק (להשוות בין קובץ התרגום לשאלון עצמו)",
            "heading": false
          }
        ]
      },
      {
        "name": "אישור טפסים מול הלקוח",
        "items": [
          {
            "text": "לקבוע teams מול הלקוח על מנת להציג לו את הטפסים השונים",
            "heading": false
          },
          {
            "text": "לשלוח ללקוח את פרטי הדמו שכולל את כל הטפסים המלאים ללא פלאגינים - להסביר שמדובר באישור ניסוחים ונראות כללית, במידה ויש תוספות של פלאגינים",
            "heading": false
          }
        ]
      },
      {
        "name": "תשתיות במערכת לאחר אישור הלקוח",
        "items": [
          {
            "text": "תכנות של פלאגין",
            "heading": true
          },
          {
            "text": "להכין מסמך פלאגין בהתאם להנחיות (מסמכי פלאגין נמצאים בפורום תפעול > פלאגינים חדש 2025-2026) ולשלוח לצוות הפלאגין",
            "heading": false
          },
          {
            "text": "לאחר סיום העבודה על הפלאגין יש לבצע בדיקה שכל ההגדרות שהגדרנו עובדות תקין",
            "heading": false
          },
          {
            "text": "חשוב לזכור -  לאחר עדכון הפלאגין, במידה ויש שינויים במבנה הטבלה לדוג' במס' העמודות/שורות - ייתכן ויידרש עדכון לפלאגין",
            "heading": false
          },
          {
            "text": "הגדרת התראות בתהליך- הגדרת מייל תקשורת",
            "heading": true
          },
          {
            "text": "לוודא שהפייפינג תקין - יש לבדוק תקינות על דמו מעריך ודמו מוערך",
            "heading": false
          },
          {
            "text": "לוודא שההיפר לינק מוגדר וששורת כתובת נמלה לא מופיעה במייל בנוסף להיפר קישור",
            "heading": false
          },
          {
            "text": "לוודא שהלינק מוביל לדף הכניסה למערכת בשפה הנכונה.",
            "heading": false
          },
          {
            "text": "אם יש עובדים עם מיילים של ג'ימייל - לוודא שאין היפר לינק אלא קישור רגיל ולהוסיף הערה על כך שיש להעתיק ולהדביק במידה והקישור לא לחיץ",
            "heading": false
          },
          {
            "text": "לשים לב שמוגדרת השפה הנכונה תחת ההתראה",
            "heading": false
          },
          {
            "text": "לבצע בדיקות עם חברי הצוות (דמו מנהל מוגדר על מייל X והמייל של דמו עובד מוגדר עליי ובכך לבדוק שהמייל מגיע לכתובת הנכונה)",
            "heading": false
          },
          {
            "text": "הגדרת תבנית מייל",
            "heading": true
          },
          {
            "text": "לוודא שהפייפינג תקין-  יש לבדוק תקינות על דמו מעריך ודמו מוערך",
            "heading": false
          },
          {
            "text": "לוודא שההיפר לינק מוגדר וששורת כתובת נמלה לא מופיעה במייל בנוסף להיפר קישור",
            "heading": false
          },
          {
            "text": "לוודא שהלינק מוביל לדף הכניסה למערכת בשפה הנכונה.",
            "heading": false
          },
          {
            "text": "אם יש עובדים עם מיילים של ג'ימייל - לוודא שאין היפר לינק אלא קישור רגיל ולהוסיף הערה על כך שיש להעתיק ולהדביק במידה והקישור לא לחיץ",
            "heading": false
          },
          {
            "text": "אם יש שפות שאינן עברית, חשוב להגדיר את מייל האיפוס סיסמא באנגלית",
            "heading": false
          },
          {
            "text": "לוודא תיקון של נוסח מייל חידוש סיסמה - שלא יוצא מצוות נמל\"ה+",
            "heading": false
          },
          {
            "text": "בדיקה של שליחת מייל עם פרטי כניסה ללקוח כדי לוודא שאין חסימה",
            "heading": false
          }
        ]
      },
      {
        "name": "הטמעת קובץ משתתפים",
        "items": [
          {
            "text": "לוודא שישנה עמודה של שפת המערכת עבור כולם כדי ששפת המייל תגיע בצורה נכונה",
            "heading": false
          },
          {
            "text": "LSID - לוודא שמוגדרת בתור עמודת טקסט תחת \"השדות הנוספים\" ושזה יהיה השם קוד שלה - רלוונטי רק ללקוחות שעברו אלינו מהמערכת הקודמת.",
            "heading": false
          },
          {
            "text": "לכל משתתף מוגדר מספר עובד",
            "heading": false
          },
          {
            "text": "אין כפילויות במספרי העובדים (מספר מזהה)",
            "heading": false
          },
          {
            "text": "לכל עובד מוגדרת כתובת מייל - במידה ומדובר בתהליך ממוחשב. במידה ויש עובדים ללא כתובת מייל לוודא מול הלקוח איך הם אמורים שקבל את ההערכה",
            "heading": false
          },
          {
            "text": "אין כתובות מייל כפולות (לכמה משתתפים הוגדר אותו מייל)",
            "heading": false
          },
          {
            "text": "לכל עובד יש שיוך למחלקה, דרג וכו', עם דגש על קבוצות שיוך שבהתבסס עליהן נשייך טפסים או יוגדר דינאמי",
            "heading": false
          },
          {
            "text": "לכל עובד יש מנהל - מלבד המנכ\"ל",
            "heading": false
          },
          {
            "text": "בדיקה שאין עובדים שמנהלים את עצמם",
            "heading": false
          },
          {
            "text": "כל המנהלים מופיעים גם כמשתתפים בתהליך",
            "heading": false
          },
          {
            "text": "יש לבדוק שמספר העובד  + שם פרטי + שם המשפחה שמוצמד למנהל זהה לזה שברשימת המשתתפים",
            "heading": false
          },
          {
            "text": "לבדוק התאמה בין מספר המנהלים שהוגדרו כמעריכים לבין המשתתפים שהוגדר להם דרג מנהל בקבוצת השיוך. במידה ואין התאמה יש לברר מול הלקוח",
            "heading": false
          },
          {
            "text": "במקרים הם הערכה עקיפה הינו תנאי להמשך תהליך, מומלץ להוסיף עמודה עם תנאי לפתיחת הטופס על מנת שנוכל להחריג עובדים מסוימים.",
            "heading": false
          }
        ]
      },
      {
        "name": "זימון משתתפים לתהליך (ללא שליחת מיילים)",
        "items": [
          {
            "text": "ייבוא טפסים (מנואל) עבור משתמשי דמו",
            "heading": true
          },
          {
            "text": "במידה ויש בטופס עמודת משקל באחוזים, יש לוודא שהעמודה היא מסוג טקסט (לדוגמה, 30% מסוג טקסט)",
            "heading": false
          },
          {
            "text": "לאחר הייבוא לשים לב שהשדות מתעדכנים כמו שצריך",
            "heading": false
          },
          {
            "text": "לדאוג שיהיה עובדי דמו שיכילו את כל המצבים של הייבוא (עובד עם כל השורות והעמודות, עובד רק עם חצי מהשורות)",
            "heading": false
          },
          {
            "text": "יש לשים לב שאין לשנות את מבנה קובץ המנואל או לעצב את הערכים הכתובים בו - פורמט הקובץ מיוצא מהמערכת",
            "heading": false
          },
          {
            "text": "הטמעת נתונים למנואל לאחר זימון העובדים",
            "heading": true
          },
          {
            "text": "לאחר ההטמעה לבדוק באמצעות נוסחת ווילוקאפ בדיקה על כל עמודה בשליפות על כל העובדים",
            "heading": false
          },
          {
            "text": "הדפסת טפסים - לוודא שיש הגדרות להסתרת שאלות/ פרקים במידת הצורך ויתר החלקים מופיעים",
            "heading": false
          },
          {
            "text": "לאחר הטמעת המענים, לבדוק עבור מספר משתמשי אמת שהוטמע תקין",
            "heading": false
          }
        ]
      },
      {
        "name": "דוחות בתהליך",
        "items": [
          {
            "text": "דוח אישי",
            "heading": true
          },
          {
            "text": "לבדוק שכל השאלות שקיימות בטופסים ורלוונטי לדוח מופיעות",
            "heading": false
          },
          {
            "text": "לבדוק ששאלות דינאמיות לא מופיעות בדוח לאוכלוסייה לא רלוונטית",
            "heading": false
          },
          {
            "text": "לוודא ששאלות ללא מענה לא מופיעות",
            "heading": false
          },
          {
            "text": "בשאלות של עוצמות / חולשות - לוודא צביעה בדוח ושמוצגות רק השאלות שנבחרו ולא \"כנדרש\"",
            "heading": false
          },
          {
            "text": "לוודא שהדוח נפתח בהתאם להגדרות (במילוי של טופס הערכת מנהל)",
            "heading": false
          },
          {
            "text": "לוודא שלאחר פתיחת הדוח הוא מתעדכן לאחר מילוי כל טופס אחר התהליך",
            "heading": false
          },
          {
            "text": "במידה ומתרגמים את הדוח יש לשמור גם במסך השינויים וגם בכפתור שמירה בדוח עצמו",
            "heading": false
          },
          {
            "text": "הגדרת דוח התפלגות ציונים",
            "heading": true
          },
          {
            "text": "לפני הגדרת הדוח יש לשייך את השאלה למדד וכן לדרג את תשובות השאלה",
            "heading": false
          },
          {
            "text": "לברר מול היועץ התפלגות רצויה",
            "heading": false
          },
          {
            "text": "למלא מספר שאלונים ולבדוק שהעובדים נמצאים תחת הקבוצה הנכונה (כפי שהוערכו בטופס ההערכה)",
            "heading": false
          },
          {
            "text": "הגדרת דוח ציוותי",
            "heading": true
          },
          {
            "text": "לוודא שהשאלה שעליה מוגדר הדוח הציוותי מוגדרת באלמנט \"טבלה\"",
            "heading": false
          },
          {
            "text": "שימו לב, לא ניתן להגדיר דוח צוותי על שאלות סגנון \"מפתחות להצלחה\" (שאלות שאין מענה של 100% מהצוות)",
            "heading": false
          },
          {
            "text": "הגדרת דוח סטטוס",
            "heading": true
          },
          {
            "text": "חשוב להגדיר את הייצוא לאקסל",
            "heading": false
          },
          {
            "text": "\"אובייקט גרף בלוח הבקרה\" - לוודא שמסומן בתהליך הנוכחי ולהוריד מתהליך עבר",
            "heading": false
          },
          {
            "text": "עדכון סינונים ופילוחים על פי הקבוצות בקובץ משתתפים",
            "heading": false
          },
          {
            "text": "הגדרת דוח ריכוז יעדים",
            "heading": true
          },
          {
            "text": "להגדיר שדות מוערך, שדות מנהל היררכי, שדות רקע מוערך להצגה במסך, שדות רקע מנהל היררכי ושדות מוערך ליצוא באקסל",
            "heading": false
          },
          {
            "text": "הצגת משובים בסטטוס - האם להציג רק בסטטוס בהתהליך או הסתיים",
            "heading": false
          },
          {
            "text": "טבלאות להצגה - לבחור את טבלאות היעדים ולעדכן את כותרת להצגה שתהיה מובנת ללקוח ולא עם מספר הטבלה",
            "heading": false
          },
          {
            "text": "הגדרת דוח הצגת נתונים",
            "heading": true
          },
          {
            "text": "לוודא מול הלקוחה כמה דוחות צריך ואילו שאלות צריך להציג בכל דוח",
            "heading": false
          },
          {
            "text": "להגדיר שדות מוערך, שדות מעריך, שדות לסינון ומינימום תשובות להצגה",
            "heading": false
          },
          {
            "text": "הצגת משובים בסטטוס - האם להציג רק בסטטוס בהתהליך או הסתיים",
            "heading": false
          },
          {
            "text": "במידה ורוצים להציג את סטטוס ההערכות ותאריך מילוי יש לסמן V ואז ללחוץ על 'הצבת שדות בטבלה'",
            "heading": false
          }
        ]
      },
      {
        "name": "בדיקות לקראת העלייה לאוויר",
        "items": [
          {
            "text": "בדיקת דירוג מיילים",
            "heading": false
          },
          {
            "text": "הרצת Flow (בדיקת מיילים, בדיקה של הטפסים והגדרותיהם, בדיקת קבלת מייל תקשורת)",
            "heading": false
          },
          {
            "text": "בדיקת סיכום מענים - לוודא שכל השאלות מופיעות בסיכום מענים ויש עליהן מענה באקסל ואין מקרים של מחיקת נתונים",
            "heading": false
          },
          {
            "text": "במידה ומדובר בתהליך חוזר - וידוא מול הלקוח האם מעוניין לאפס סיסמאות לכולם (פורום תפעול > שימושי מערכת חדשה > נהלי עבודה > הודעה לאיפוס סיסמאות במערכת)",
            "heading": false
          }
        ]
      },
      {
        "name": "הרשאות",
        "items": [
          {
            "text": "עדכון הרשאות מותאמות בהתאם לבקשת הלקוח",
            "heading": false
          },
          {
            "text": "כניסה למשתמשי ההרשאות ובדיקה שהוגדרו נכון",
            "heading": false
          }
        ]
      },
      {
        "name": "חשיפה לעובד",
        "items": [
          {
            "text": "בדיקה שחשיפה לעובד נפתחת רק לאחר שליחת טופס סיכום שיחת משוב",
            "heading": false
          },
          {
            "text": "הגדרת חשיפה לעובד, לשים לב לסמן רק את הכותרות והשאלות בחשיפה (ללא הנחיות)",
            "heading": false
          },
          {
            "text": "בדיקה שאותה הגדרת חשיפה מעודכנת גם עבור הצגת הערכה בהדפסה",
            "heading": false
          },
          {
            "text": "בדיקה שלא נחשפים לעובד שאלות שלא אמורות להיחשף",
            "heading": false
          }
        ]
      },
      {
        "name": "הכנות לקראת עליה לאוויר",
        "items": [
          {
            "text": "הכנת מצגת הדרכה (בהתאם לסגירה מול יועץ)",
            "heading": false
          },
          {
            "text": "הכנת מייל עליה לאוויר (פורום תפעול > שימושי מערכת חדשה > נהלי עבודה > פורמט מייל עליה לאוויר)  + הורדת PDF של הטפסים לשליחה ביום העליה",
            "heading": false
          },
          {
            "text": "במידה ורוצים להדפיס את טופס הצ'ק ליסט, יש להקטין את עמודה A לרוחב 820",
            "heading": false
          }
        ]
      }
    ]
  },
  "survey": {
    "label": "סקר",
    "categories": [
      {
        "name": "כללי",
        "items": [
          {
            "text": "במידה והלקוח חדש - העברת פרטי פתיחת חברה בAB - שם החברה, שפות, סוג תהליך (סקר)",
            "heading": false
          }
        ]
      },
      {
        "name": "תשתיות מול לקוח",
        "items": [
          {
            "text": "בדיקות מחשוב - העברת קובץ בדיקות מחשוב ללקוח לבדיקות של IT",
            "heading": false
          },
          {
            "text": "בדיקה של שליחת מייל עם פרטי כניסה כדי לוודא שאין חסימה",
            "heading": false
          },
          {
            "text": "חיבור SAML בשלב דוח סקר - במידה ורוצים יש לחבר את זיו",
            "heading": false
          },
          {
            "text": "פתיחת חשבון SMS",
            "heading": false
          },
          {
            "text": "שליחת פורמט קובץ משיבים ללקוח למילוי - אם מדובר בלקוח קיים אז לשלוח את הקובץ מהתהליך הקודם (לא חובה)",
            "heading": false
          },
          {
            "text": "הכנת תכנית עבודה ושליחה ללקוח (במידה וקיימות שפות בטופס יש לבדוק עם היועץ - מי מתרגם ומתי מועבר (להכניס כשורה בתוכנית עבודה) בנוסף לוודא שמתרגמים גם את מייל + SMS ואת הדוח סקר)",
            "heading": false
          },
          {
            "text": "נוסח מייל + SMS - להעביר ללקוח את המייל + SMS כמו שהוא יראה במערכת / נייד כדי לא ליצור אי הבנות",
            "heading": false
          }
        ]
      },
      {
        "name": "תשתיות במערכת לפני אישור לקוח",
        "items": [
          {
            "text": "בניית טופס לאישור מול הלקוח",
            "heading": true
          },
          {
            "text": "הגדרה של השאלונים (יש לשים לב, שמידה ומשתמשים בשאלת בחירה יחידה צריך לדרג את השאלה כדי שתיתמך בדוח סקר, בשאלת סולם ניתן להשתמש רק אם הסולם מתחיל ב1)",
            "heading": false
          },
          {
            "text": "הגדרות של עיצובים ובאנרים",
            "heading": false
          },
          {
            "text": "דינאמי",
            "heading": false
          },
          {
            "text": "הגדרת חובה / לא חובה",
            "heading": false
          },
          {
            "text": "במידה וכבר הועברו תרגומים אז להטמיע את השפות במערכת",
            "heading": false
          },
          {
            "text": "בדיקות על הטופס לפני אישור לקוח",
            "heading": true
          },
          {
            "text": "בדיקה שהשאלון תואם את המקור, השוואת הקובץ העדכני ביותר שקיבלנו מהיועץ / לקוח לשאלון שבנינו + בדיקה שכלל השאלות מופיעות.",
            "heading": false
          },
          {
            "text": "בשאלון דינאמי בו יש אלמנטים שונים יש לבדוק את כל המצבים - לדוגמא שאלות ניהוליות שנפתחות בהתאם לחטיבות - יש לבדוק את השאלון עם השאלות החטיבתיות וללא השאלות החטיבתיות",
            "heading": false
          },
          {
            "text": "הגהה של הטופס - בדיקת תקינות ואחידות הדקדוק בשאלונים (לדוג' - זכר / נקבה) בדיקת תקינות ואחידות סימני הפיסוק והניקוד (לדוג' – אם יש נק' בסוף היגד, שיהיה כך בכל ההיגדים)",
            "heading": false
          },
          {
            "text": "בדיקת העיצובים - אחידות גודל, צבע וגופן לכל אורך השאלון",
            "heading": false
          },
          {
            "text": "תרגומים - לוודא שתרגום ההיגדים מדויק (להשוות בין קובץ התרגום לשאלון עצמו)",
            "heading": false
          },
          {
            "text": "אישור טפסים מול הלקוח",
            "heading": true
          },
          {
            "text": "לשלוח ללקוח את השאלון בלינק ישיר כפי שיראה ביום העלייה לאוויר (ייתכן ובאנרים יתווספו בהמשך)",
            "heading": false
          }
        ]
      },
      {
        "name": "תשתיות במערכת לאחר אישור הלקוח",
        "items": [
          {
            "text": "בדיקות אחרונות על השאלון במידה ובוצעו שינויים",
            "heading": false
          },
          {
            "text": "הגדרת מדד על כל שאלה",
            "heading": false
          },
          {
            "text": "עדכון באנרים במידה ולא הוטמעו בשלב קודם",
            "heading": false
          },
          {
            "text": "הגדרת  מייל + SMS",
            "heading": true
          },
          {
            "text": "ניתן לשנות את שם השולח ב SMS + כתובת מייל (שם השולח יכול להכיל עד 11 תווים)",
            "heading": false
          },
          {
            "text": "לוודא שהלינק מוביל ישירות לסקר במייל + SMS",
            "heading": false
          },
          {
            "text": "אם יש עובדים עם מיילים של ג'ימייל - יש לבדוק חלופה של SMS לקבלת הסקר",
            "heading": false
          },
          {
            "text": "בדיקת הגהה על הנוסחים",
            "heading": false
          },
          {
            "text": "בדיקת דירוג מיילים",
            "heading": false
          }
        ]
      },
      {
        "name": "הטמעת קובץ משתתפים",
        "items": [
          {
            "text": "לוודא שישנה עמודה של שפת המערכת עבור כולם כדי ששפת המייל תגיע בצורה נכונה",
            "heading": false
          },
          {
            "text": "לוודא שכל העמודות הדינאמיות יהיו מוגדרות כשדה \"רשימה\"",
            "heading": false
          },
          {
            "text": "לוודא שמספר העובד שהועבר על ידי הלקוח, תואם בשם הפרטי והמשפחה לעץ ארגוני במידה וקיים",
            "heading": false
          },
          {
            "text": "לכל עובד יש מנהל - מלבד המנכ\"ל",
            "heading": false
          },
          {
            "text": "לכל משתתף מוגדר מספר עובד - במידה ולא יש להציף ללקוחה (לא ניתן לשנות את המספר בהמשך)",
            "heading": false
          },
          {
            "text": "אין כפילויות במספרי העובדים (מספר מזהה)",
            "heading": false
          },
          {
            "text": "לכל עובד יש שיוך למחלקה, דרג וכו', עם דגש על קבוצות שיוך שבהתבסס עליהן נשייך טפסים/ יוגדר דינאמי / ישמש כפילוחים בשלב אחוזי מילוי ותוצרים",
            "heading": false
          },
          {
            "text": "לכל עובד מוגדרת כתובת מייל + מספר נייד",
            "heading": false
          },
          {
            "text": "אין כתובות מייל כפולות (לכמה משתתפים הוגדר אותו מייל) / מספרי טלפון כפולים",
            "heading": false
          },
          {
            "text": "כל המנהלים מופיעים גם כמשתתפים בתהליך",
            "heading": false
          },
          {
            "text": "יש לבדוק שמספר העובד  + שם פרטי + שם המשפחה שמוצמד למנהל זהה לזה שברשימת המשתתפים",
            "heading": false
          },
          {
            "text": "לבדוק התאמה בין מספר המנהלים שהוגדרו כמעריכים לבין המשתתפים שהוגדר להם דרג מנהל בקבוצת השיוך. במידה ואין התאמה יש לברר מול הלקוח",
            "heading": false
          },
          {
            "text": "בדיקה שאין עובדים שמנהלים את עצמם",
            "heading": false
          },
          {
            "text": "זימון משתתפים לתהליך (ללא שליחת מיילים + SMS)",
            "heading": true
          }
        ]
      },
      {
        "name": "בדיקות לקראת העלייה לאוויר",
        "items": [
          {
            "text": "בדיקת השאלון באופן סופי",
            "heading": false
          },
          {
            "text": "בדיקת סיכום מענים",
            "heading": false
          },
          {
            "text": "הכנת דוח אחוזי מילוי על תשתית של דוח סקר (לא חובה)",
            "heading": false
          },
          {
            "text": "תזכורות - לקבוע עם הלקוחה זמנים קבועים לשליחת תזכורות ואחוזי מילוי",
            "heading": false
          },
          {
            "text": "הכנת מייל עלייה לאוויר + צירוף PDF של השאלון למייל (ניתן להיעזר בתוסף PrintFriendly בגוגל כרום)",
            "heading": false
          }
        ]
      }
    ]
  }
};

/* ------------------------------------------------------------------ */
/* Color palette (user-selectable per project)                        */
/* ------------------------------------------------------------------ */

const COLOR_PALETTE = [
  {
    key: "pink", name: "ורוד", hex: "#db2777",
    badge: "bg-pink-50 text-pink-800 ring-pink-200",
    dot: "bg-pink-600", solid: "bg-pink-600", solidHover: "hover:bg-pink-700",
    border: "border-pink-600", text: "text-pink-700", swatch: "bg-pink-600",
    focusBorder: "focus:border-pink-600", focusRing: "focus:ring-pink-100", selectedBg: "bg-pink-50", selectedText: "text-pink-800",
  },
  {
    key: "fuchsia", name: "פוקסיה", hex: "#c026d3",
    badge: "bg-fuchsia-50 text-fuchsia-800 ring-fuchsia-200",
    dot: "bg-fuchsia-600", solid: "bg-fuchsia-600", solidHover: "hover:bg-fuchsia-700",
    border: "border-fuchsia-600", text: "text-fuchsia-700", swatch: "bg-fuchsia-600",
    focusBorder: "focus:border-fuchsia-600", focusRing: "focus:ring-fuchsia-100", selectedBg: "bg-fuchsia-50", selectedText: "text-fuchsia-800",
  },
  {
    key: "rose", name: "אדום-ורוד", hex: "#e11d48",
    badge: "bg-rose-50 text-rose-800 ring-rose-200",
    dot: "bg-rose-600", solid: "bg-rose-600", solidHover: "hover:bg-rose-700",
    border: "border-rose-600", text: "text-rose-700", swatch: "bg-rose-600",
    focusBorder: "focus:border-rose-600", focusRing: "focus:ring-rose-100", selectedBg: "bg-rose-50", selectedText: "text-rose-800",
  },
  {
    key: "violet", name: "סגול", hex: "#7c3aed",
    badge: "bg-violet-50 text-violet-800 ring-violet-200",
    dot: "bg-violet-600", solid: "bg-violet-600", solidHover: "hover:bg-violet-700",
    border: "border-violet-600", text: "text-violet-700", swatch: "bg-violet-600",
    focusBorder: "focus:border-violet-600", focusRing: "focus:ring-violet-100", selectedBg: "bg-violet-50", selectedText: "text-violet-800",
  },
  {
    key: "indigo", name: "אינדיגו", hex: "#4f46e5",
    badge: "bg-indigo-50 text-indigo-800 ring-indigo-200",
    dot: "bg-indigo-600", solid: "bg-indigo-600", solidHover: "hover:bg-indigo-700",
    border: "border-indigo-600", text: "text-indigo-700", swatch: "bg-indigo-600",
    focusBorder: "focus:border-indigo-600", focusRing: "focus:ring-indigo-100", selectedBg: "bg-indigo-50", selectedText: "text-indigo-800",
  },
  {
    key: "sky", name: "תכלת", hex: "#0284c7",
    badge: "bg-sky-50 text-sky-800 ring-sky-200",
    dot: "bg-sky-600", solid: "bg-sky-600", solidHover: "hover:bg-sky-700",
    border: "border-sky-600", text: "text-sky-700", swatch: "bg-sky-600",
    focusBorder: "focus:border-sky-600", focusRing: "focus:ring-sky-100", selectedBg: "bg-sky-50", selectedText: "text-sky-800",
  },
  {
    key: "teal", name: "טורקיז", hex: "#0d9488",
    badge: "bg-teal-50 text-teal-800 ring-teal-200",
    dot: "bg-teal-600", solid: "bg-teal-600", solidHover: "hover:bg-teal-700",
    border: "border-teal-600", text: "text-teal-700", swatch: "bg-teal-600",
    focusBorder: "focus:border-teal-600", focusRing: "focus:ring-teal-100", selectedBg: "bg-teal-50", selectedText: "text-teal-800",
  },
  {
    key: "emerald", name: "ירוק", hex: "#059669",
    badge: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    dot: "bg-emerald-600", solid: "bg-emerald-600", solidHover: "hover:bg-emerald-700",
    border: "border-emerald-600", text: "text-emerald-700", swatch: "bg-emerald-600",
    focusBorder: "focus:border-emerald-600", focusRing: "focus:ring-emerald-100", selectedBg: "bg-emerald-50", selectedText: "text-emerald-800",
  },
  {
    key: "amber", name: "ענבר", hex: "#d97706",
    badge: "bg-amber-50 text-amber-800 ring-amber-200",
    dot: "bg-amber-600", solid: "bg-amber-600", solidHover: "hover:bg-amber-700",
    border: "border-amber-600", text: "text-amber-700", swatch: "bg-amber-600",
    focusBorder: "focus:border-amber-600", focusRing: "focus:ring-amber-100", selectedBg: "bg-amber-50", selectedText: "text-amber-800",
  },
  {
    key: "orange", name: "כתום", hex: "#ea580c",
    badge: "bg-orange-50 text-orange-800 ring-orange-200",
    dot: "bg-orange-600", solid: "bg-orange-600", solidHover: "hover:bg-orange-700",
    border: "border-orange-600", text: "text-orange-700", swatch: "bg-orange-600",
    focusBorder: "focus:border-orange-600", focusRing: "focus:ring-orange-100", selectedBg: "bg-orange-50", selectedText: "text-orange-800",
  },
];

const DEFAULT_COLOR = "pink";
const getColor = (key) => COLOR_PALETTE.find((c) => c.key === key) || COLOR_PALETTE[0];

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

function buildTasks(type) {
  const tpl = TEMPLATES[type];
  const tasks = [];
  tpl.categories.forEach((cat) => {
    cat.items.forEach((it) => {
      tasks.push({
        id: uid(),
        category: cat.name,
        text: it.text,
        heading: !!it.heading,
        done: false,
        na: false,
        note: "",
        completedDate: null,
      });
    });
  });
  const categoryOrder = tpl.categories.map((c) => c.name);
  return { tasks, categoryOrder };
}

function getCategoryOrder(project) {
  if (project.categoryOrder && project.categoryOrder.length) return project.categoryOrder;
  const seen = [];
  project.tasks.forEach((t) => {
    if (!seen.includes(t.category)) seen.push(t.category);
  });
  return seen;
}

function computeProgress(tasks) {
  const relevant = tasks.filter((t) => !t.na && !t.heading);
  if (relevant.length === 0) return 100;
  const done = relevant.filter((t) => t.done).length;
  return Math.round((done / relevant.length) * 100);
}

function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ------------------------------------------------------------------ */
/* Small UI atoms                                                     */
/* ------------------------------------------------------------------ */

function TypeBadge({ type, color }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-700 ring-1 ring-neutral-200">
      <span className={"h-1.5 w-1.5 rounded-full " + color.dot} />
      {TEMPLATES[type].label}
    </span>
  );
}

function ProgressRing({ value, size = 56, stroke = 5, color }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E5E5" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.hex}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-neutral-800">{value}%</span>
      </div>
    </div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
      <div className={"h-full rounded-full " + color.solid} style={{ width: value + "%", transition: "width 0.4s ease" }} />
    </div>
  );
}

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_PALETTE.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onChange(c.key)}
          title={c.name}
          className={
            "flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 transition " +
            c.swatch +
            " " +
            (value === c.key ? "ring-neutral-900" : "ring-transparent hover:ring-neutral-300")
          }
        >
          {value === c.key && <Check size={15} className="text-white" strokeWidth={3} />}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* New / edit project modal                                           */
/* ------------------------------------------------------------------ */

function ProjectModal({ initial, onClose, onSave }) {
  const [clientName, setClientName] = useState(initial?.clientName || "");
  const [nameError, setNameError] = useState(false);
  const [consultant, setConsultant] = useState(initial?.consultant || "");
  const [pmoOwner, setPmoOwner] = useState(initial?.pmoOwner || "");
  const [launchDate, setLaunchDate] = useState(initial?.launchDate ? initial.launchDate.slice(0, 10) : "");
  const [type, setType] = useState(initial?.type || "performance");
  const [color, setColor] = useState(initial?.color || DEFAULT_COLOR);
  const isEdit = !!initial;
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, []);

  function trySave() {
    if (!clientName.trim()) {
      setNameError(true);
      return;
    }
    onSave({
      clientName: clientName.trim(),
      consultant: consultant.trim(),
      pmoOwner: pmoOwner.trim(),
      launchDate: launchDate ? new Date(launchDate).toISOString() : null,
      type,
      color,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    trySave();
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 px-4 py-8" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900">{isEdit ? "עריכת פרויקט" : "פרויקט חדש"}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">שם לקוח</label>
            <input
              ref={firstRef}
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value);
                if (nameError) setNameError(false);
              }}
              placeholder="לדוגמה: רשת הריניום"
              className={
                "w-full rounded-lg border px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none focus:ring-2 " +
                (nameError
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
                  : "border-neutral-300 focus:border-pink-600 focus:ring-pink-100")
              }
              required
            />
            {nameError && <p className="mt-1 text-xs text-rose-600">יש להזין שם לקוח</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">יועץ אחראי</label>
              <input
                value={consultant}
                onChange={(e) => setConsultant(e.target.value)}
                placeholder="שם היועץ"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-700">
                PMO אחראי <span className="font-normal text-neutral-400">(לא חובה)</span>
              </label>
              <input
                value={pmoOwner}
                onChange={(e) => setPmoOwner(e.target.value)}
                placeholder="שם ה-PMO"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              תאריך עלייה לאוויר <span className="font-normal text-neutral-400">(לא חובה)</span>
            </label>
            <div className="relative">
              <Rocket size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="date"
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 py-2 pl-3 pr-9 text-neutral-900 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">סוג תהליך</label>
            <div className="grid grid-cols-2 gap-2">
              {["performance", "survey"].map((t) => (
                <button
                  type="button"
                  key={t}
                  disabled={isEdit}
                  onClick={() => setType(t)}
                  className={
                    "rounded-lg border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 " +
                    (type === t
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50")
                  }
                >
                  {TEMPLATES[t].label}
                </button>
              ))}
            </div>
            {isEdit && (
              <p className="mt-1.5 text-xs text-neutral-400">לא ניתן לשנות סוג תהליך לאחר יצירת הפרויקט</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">צבע הפרויקט</label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={trySave}
              className="flex-1 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              {isEdit ? "שמירת שינויים" : "יצירת פרויקט"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirm delete modal                                                */
/* ------------------------------------------------------------------ */

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/50 p-4" onClick={onCancel}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center gap-2 text-rose-600">
          <AlertCircle size={20} />
          <h2 className="text-base font-bold text-neutral-900">{title}</h2>
        </div>
        <p className="mb-5 text-sm text-neutral-600">{message}</p>
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            מחיקה
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Name list modal (used by clickable dashboard stats)                 */
/* ------------------------------------------------------------------ */

function NameListModal({ title, projects, onOpen, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/50 px-4 py-8" onClick={onClose}>
      <div
        className="mx-auto w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-neutral-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-neutral-900">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
            <X size={18} />
          </button>
        </div>

        {projects.length === 0 ? (
          <p className="py-4 text-center text-sm text-neutral-400">אין פרויקטים להצגה</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {projects.map((p) => {
              const color = getColor(p.color);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => {
                      onClose();
                      onOpen(p.id);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-right text-sm font-medium text-neutral-800 transition hover:bg-neutral-50"
                  >
                    <span className={"h-2 w-2 flex-shrink-0 rounded-full " + color.dot} />
                    <span className="truncate">{p.clientName}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                          */
/* ------------------------------------------------------------------ */

function Dashboard({ projects, onOpen, onNew, onEdit, onDelete }) {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [listModal, setListModal] = useState(null); // { title, projects: [...] }

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesType = filterType === "all" || p.type === filterType;
      const matchesQuery = p.clientName.toLowerCase().includes(query.trim().toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [projects, query, filterType]);

  const stats = useMemo(() => {
    const total = projects.length;
    const avg = total
      ? Math.round(projects.reduce((acc, p) => acc + computeProgress(p.tasks), 0) / total)
      : 0;
    const completedProjects = projects.filter((p) => computeProgress(p.tasks) === 100);
    return { total, avg, completed: completedProjects.length, completedProjects };
  }, [projects]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-neutral-400">
            <ListChecks size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">מעקב פרויקטים</span>
          </div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-neutral-900 sm:text-3xl" style={{ fontFamily: "'Rubik', sans-serif" }}>
            לוח הפרויקטים
            <Sparkles size={20} className="text-pink-500" strokeWidth={2.5} />
          </h1>
        </div>
        <button
          onClick={onNew}
          className="flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800"
        >
          <Plus size={18} />
          פרויקט חדש
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setListModal({ title: "פרויקטים פעילים", projects })}
          disabled={stats.total === 0}
          className="rounded-xl border border-neutral-200 bg-white p-4 text-right transition enabled:hover:border-neutral-300 enabled:hover:shadow-sm disabled:cursor-default"
        >
          <p className="text-2xl font-black text-neutral-900">{stats.total}</p>
          <p className="text-xs text-neutral-500">פרויקטים פעילים</p>
        </button>
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <p className="text-2xl font-black text-neutral-900">{stats.avg}%</p>
          <p className="text-xs text-neutral-500">התקדמות ממוצעת</p>
        </div>
        <button
          type="button"
          onClick={() => setListModal({ title: "פרויקטים שהושלמו במלואם", projects: stats.completedProjects })}
          disabled={stats.completed === 0}
          className="rounded-xl border border-neutral-200 bg-white p-4 text-right transition enabled:hover:border-neutral-300 enabled:hover:shadow-sm disabled:cursor-default"
        >
          <p className="text-2xl font-black text-neutral-900">{stats.completed}</p>
          <p className="text-xs text-neutral-500">הושלמו במלואם</p>
        </button>
      </div>

      {listModal && (
        <NameListModal title={listModal.title} projects={listModal.projects} onOpen={onOpen} onClose={() => setListModal(null)} />
      )}

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש לפי שם לקוח..."
            className="w-full rounded-lg border border-neutral-300 bg-white py-2 pl-3 pr-9 text-sm text-neutral-900 placeholder-neutral-400 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
          />
        </div>
        <div className="flex gap-1.5 rounded-lg bg-neutral-100 p-1">
          {[
            { key: "all", label: "הכל" },
            { key: "performance", label: "הערכת ביצועים" },
            { key: "survey", label: "סקר" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={
                "rounded-md px-3 py-1.5 text-xs font-semibold transition " +
                (filterType === f.key ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700")
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white py-16 text-center">
          <ClipboardList className="mx-auto mb-3 text-neutral-300" size={40} />
          <p className="text-sm font-medium text-neutral-500">
            {projects.length === 0 ? "אין עדיין פרויקטים — צרו פרויקט חדש כדי להתחיל" : "לא נמצאו פרויקטים תואמים"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((p) => {
            const progress = computeProgress(p.tasks);
            const color = getColor(p.color);
            return (
              <div
                key={p.id}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className={"absolute inset-x-0 top-0 h-1 " + color.solid} />
                <div className="flex items-start justify-between gap-3">
                  <button onClick={() => onOpen(p.id)} className="flex-1 text-right">
                    <div className="mb-1.5 flex items-center gap-2">
                      <TypeBadge type={p.type} color={color} />
                    </div>
                    <h3 className="mb-1 text-base font-bold text-neutral-900">{p.clientName}</h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
                      {p.consultant && (
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {p.consultant}
                        </span>
                      )}
                      {p.pmoOwner && (
                        <span className="flex items-center gap-1">
                          PMO: {p.pmoOwner}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {formatDate(p.createdDate)}
                      </span>
                      {p.launchDate && (
                        <span className="flex items-center gap-1">
                          <Rocket size={12} /> {formatDate(p.launchDate)}
                        </span>
                      )}
                    </div>
                  </button>
                  <ProgressRing value={progress} color={color} size={48} stroke={4} />
                </div>

                <div className="mt-3">
                  <ProgressBar value={progress} color={color} />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    onClick={() => onOpen(p.id)}
                    className="text-xs font-semibold text-neutral-600 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-900"
                  >
                    פתיחת צ׳ק-ליסט
                  </button>
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => onEdit(p)}
                      className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                      title="עריכה"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className="rounded-md p-1.5 text-neutral-400 hover:bg-rose-50 hover:text-rose-600"
                      title="מחיקה"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Task row                                                            */
/* ------------------------------------------------------------------ */

function TaskRow({ task, color, isFirst, isLast, onToggleDone, onToggleNA, onAddNote, onDeleteNote, onEditText, onDeleteTask, onMoveUp, onMoveDown }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.text);
  const [noteDraft, setNoteDraft] = useState("");

  const notes = task.notes || (task.note ? [{ id: "legacy", text: task.note, date: null }] : []);

  function submitNote() {
    const trimmed = noteDraft.trim();
    if (trimmed) {
      onAddNote(task.id, trimmed);
      setNoteDraft("");
    }
  }

  function startEdit() {
    setDraft(task.text);
    setEditing(true);
  }

  function saveEdit() {
    const trimmed = draft.trim();
    if (trimmed) onEditText(task.id, trimmed);
    setEditing(false);
  }

  if (task.heading) {
    return (
      <div className="flex items-center gap-2 border-b border-neutral-100 bg-neutral-50/70 px-4 py-2 last:border-b-0">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit();
              if (e.key === "Escape") setEditing(false);
            }}
            className={"flex-1 break-words border-b bg-transparent text-xs font-bold uppercase tracking-wide outline-none " + color.text}
          />
        ) : (
          <p className={"flex-1 break-words text-xs font-bold uppercase tracking-wide " + color.text}>{task.text}</p>
        )}
        {editing ? (
          <div className="flex flex-shrink-0 items-center gap-1">
            <button onClick={saveEdit} className="rounded p-1 text-emerald-600 hover:bg-emerald-50">
              <Check size={13} />
            </button>
            <button onClick={() => setEditing(false)} className="rounded p-1 text-neutral-400 hover:bg-neutral-100">
              <X size={13} />
            </button>
          </div>
        ) : (
          <div className="flex flex-shrink-0 items-center gap-0.5">
            <button onClick={onMoveUp} disabled={isFirst} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent" title="הזזה למעלה">
              <ChevronUp size={12} />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent" title="הזזה למטה">
              <ChevronDown size={12} />
            </button>
            <button onClick={startEdit} className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600" title="עריכה">
              <Pencil size={12} />
            </button>
            <button onClick={() => onDeleteTask(task.id)} className="rounded p-1 text-neutral-400 hover:bg-rose-50 hover:text-rose-600" title="מחיקה">
              <Trash2 size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={
        "group flex flex-col gap-2 border-b border-neutral-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-start sm:gap-3 " +
        (task.na ? "opacity-50" : "")
      }
    >
      <button
        onClick={() => onToggleDone(task.id)}
        disabled={task.na}
        className={
          "mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition disabled:cursor-not-allowed " +
          (task.done ? color.solid + " " + color.border + " text-white" : "border-neutral-300 hover:border-neutral-400")
        }
      >
        {task.done && <CheckCircle2 size={13} className="text-white" strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setEditing(false);
              }}
              rows={2}
              className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm leading-relaxed text-neutral-800 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
            <div className="flex items-center gap-1.5">
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 rounded-md bg-neutral-900 px-2 py-1 text-xs font-semibold text-white hover:bg-neutral-800"
              >
                <Check size={12} /> שמירה
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                <X size={12} /> ביטול
              </button>
            </div>
          </div>
        ) : (
          <p className={"whitespace-normal break-words text-sm leading-relaxed text-neutral-800 " + (task.done ? "text-neutral-400 line-through" : "")}>
            {task.text}
          </p>
        )}

        {task.done && task.completedDate && (
          <span className="mt-1.5 flex items-center gap-1 text-xs text-neutral-400">
            <Calendar size={11} /> הושלם ב-{formatDate(task.completedDate)}
          </span>
        )}

        {!editing && (
          <div className="mt-2 flex flex-col gap-1">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start gap-1.5 rounded-md bg-neutral-50 px-2 py-1.5">
                <StickyNote size={12} className="mt-0.5 flex-shrink-0 text-neutral-300" />
                <div className="min-w-0 flex-1">
                  <p className="whitespace-normal break-words text-xs text-neutral-700">{n.text}</p>
                  {n.date && <p className="mt-0.5 text-xs text-neutral-400">{formatDate(n.date)}</p>}
                </div>
                <button
                  onClick={() => onDeleteNote(task.id, n.id)}
                  className="flex-shrink-0 rounded p-0.5 text-neutral-300 hover:bg-rose-50 hover:text-rose-500"
                  title="מחיקת הערה"
                >
                  <X size={11} />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-1.5">
              <StickyNote size={13} className="flex-shrink-0 text-neutral-300" />
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitNote();
                  }
                }}
                placeholder="הוספת הערה..."
                className="w-full rounded-md border border-transparent bg-neutral-50 px-2 py-1 text-xs text-neutral-700 placeholder-neutral-400 outline-none transition focus:border-neutral-300 focus:bg-white"
              />
              {noteDraft.trim() && (
                <button
                  onClick={submitNote}
                  className="flex-shrink-0 rounded-md p-1 text-emerald-600 hover:bg-emerald-50"
                  title="שמירת הערה"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {!editing && (
        <div className="flex flex-shrink-0 items-center gap-1 self-start">
          <button
            onClick={() => onToggleNA(task.id)}
            className={
              "flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold transition " +
              (task.na
                ? "border-neutral-400 bg-neutral-200 text-neutral-700"
                : "border-neutral-200 text-neutral-400 hover:border-neutral-300 hover:text-neutral-600")
            }
            title="סימון כלא רלוונטי"
          >
            <MinusCircle size={12} />
            לא רלוונטי
          </button>
          <button onClick={onMoveUp} disabled={isFirst} className="rounded-md p-1.5 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent" title="הזזה למעלה">
            <ChevronUp size={13} />
          </button>
          <button onClick={onMoveDown} disabled={isLast} className="rounded-md p-1.5 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent" title="הזזה למטה">
            <ChevronDown size={13} />
          </button>
          <button onClick={startEdit} className="rounded-md p-1.5 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600" title="עריכת הניסוח">
            <Pencil size={13} />
          </button>
          <button onClick={() => onDeleteTask(task.id)} className="rounded-md p-1.5 text-neutral-300 hover:bg-rose-50 hover:text-rose-600" title="מחיקת משימה">
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Category accordion                                                  */
/* ------------------------------------------------------------------ */

function CategoryAccordion({ index, name, tasks, color, isOpen, onToggle, taskHandlers, onRenameCategory, onDeleteCategory, onAddTask, isFirst, isLast, onMoveUp, onMoveDown }) {
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [addingTask, setAddingTask] = useState(false);
  const [taskDraft, setTaskDraft] = useState("");

  const relevant = tasks.filter((t) => !t.na && !t.heading);
  const done = relevant.filter((t) => t.done).length;
  const pct = relevant.length ? Math.round((done / relevant.length) * 100) : 100;
  const complete = pct === 100 && relevant.length > 0;

  function startRename() {
    setNameDraft(name);
    setRenaming(true);
  }

  function saveRename() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== name) onRenameCategory(trimmed);
    setRenaming(false);
  }

  function submitNewTask() {
    const trimmed = taskDraft.trim();
    if (trimmed) {
      onAddTask(trimmed);
      setTaskDraft("");
    }
    setAddingTask(false);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <div className="flex items-center gap-2 px-4 py-3">
        <button onClick={onToggle} className="flex flex-1 items-center gap-3 overflow-hidden text-right">
          <span
            className={
              "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-xs font-black " +
              (complete ? "bg-emerald-100 text-emerald-700" : color.badge)
            }
          >
            {complete ? <CheckCircle2 size={15} /> : index + 1}
          </span>
          {renaming ? (
            <span className="flex-1" />
          ) : (
            <span className="flex-1 break-words text-sm font-bold text-neutral-800">{name}</span>
          )}
          <span className="flex-shrink-0 text-xs font-medium text-neutral-400">
            {done}/{relevant.length}
          </span>
        </button>

        {renaming ? (
          <div className="flex flex-1 items-center gap-1.5">
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") setRenaming(false);
              }}
              className="w-full rounded-md border border-neutral-300 px-2 py-1 text-sm font-bold text-neutral-800 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
            />
            <button onClick={saveRename} className="flex-shrink-0 rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50">
              <Check size={15} />
            </button>
            <button onClick={() => setRenaming(false)} className="flex-shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
              <X size={15} />
            </button>
          </div>
        ) : (
          <>
            <button onClick={onMoveUp} disabled={isFirst} className="flex-shrink-0 rounded-md p-1.5 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent" title="הזזת קטגוריה למעלה">
              <ChevronUp size={14} />
            </button>
            <button onClick={onMoveDown} disabled={isLast} className="flex-shrink-0 rounded-md p-1.5 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600 disabled:opacity-30 disabled:hover:bg-transparent" title="הזזת קטגוריה למטה">
              <ChevronDown size={14} />
            </button>
            <button onClick={startRename} className="flex-shrink-0 rounded-md p-1.5 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600" title="עריכת קטגוריה">
              <Pencil size={14} />
            </button>
            <button onClick={onDeleteCategory} className="flex-shrink-0 rounded-md p-1.5 text-neutral-300 hover:bg-rose-50 hover:text-rose-600" title="מחיקת קטגוריה">
              <Trash2 size={14} />
            </button>
            <button onClick={onToggle} className="flex-shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
              <ChevronDown size={16} className={"transition-transform " + (isOpen ? "rotate-180" : "")} />
            </button>
          </>
        )}
      </div>

      {isOpen && (
        <div className="border-t border-neutral-100">
          {tasks.map((t, i) => (
            <TaskRow
              key={t.id}
              task={t}
              color={color}
              isFirst={i === 0}
              isLast={i === tasks.length - 1}
              onMoveUp={() => taskHandlers.onMoveTask(t.id, "up")}
              onMoveDown={() => taskHandlers.onMoveTask(t.id, "down")}
              {...taskHandlers}
            />
          ))}

          <div className="px-4 py-2.5">
            {addingTask ? (
              <div className="flex items-start gap-1.5">
                <textarea
                  autoFocus
                  value={taskDraft}
                  onChange={(e) => setTaskDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setAddingTask(false);
                  }}
                  placeholder="נוסח המשימה החדשה..."
                  rows={2}
                  className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm text-neutral-800 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
                />
                <div className="flex flex-shrink-0 flex-col gap-1">
                  <button onClick={submitNewTask} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50">
                    <Check size={15} />
                  </button>
                  <button onClick={() => setAddingTask(false)} className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
                    <X size={15} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setAddingTask(true)}
                className={"flex items-center gap-1.5 text-xs font-semibold " + color.text}
              >
                <Plus size={14} /> הוספת משימה
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project view                                                        */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Printable summary (shared by the print-only area and the preview)   */
/* ------------------------------------------------------------------ */

function PrintableSummary({ project, categories, progress }) {
  return (
    <div dir="rtl" style={{ fontFamily: "'Heebo', system-ui, sans-serif", padding: "24px", color: "#1c1c1c" }}>
      <h1 style={{ fontSize: "20px", fontWeight: 900, margin: 0 }}>{project.clientName}</h1>
      <p style={{ fontSize: "12px", color: "#555", marginTop: "4px" }}>
        {TEMPLATES[project.type].label} · התקדמות: {progress}%
      </p>
      <div style={{ fontSize: "11px", color: "#555", marginTop: "6px", lineHeight: 1.8 }}>
        {project.consultant && <div>יועץ אחראי: {project.consultant}</div>}
        {project.pmoOwner && <div>PMO אחראי: {project.pmoOwner}</div>}
        {project.launchDate && <div>תאריך עלייה לאוויר: {formatDate(project.launchDate)}</div>}
        <div>הופק בתאריך: {formatDate(new Date().toISOString())}</div>
      </div>

      {categories.map((catName) => {
        const catTasks = project.tasks.filter((t) => t.category === catName);
        return (
          <div key={catName} style={{ marginTop: "18px", pageBreakInside: "avoid" }}>
            <h2 style={{ fontSize: "13px", fontWeight: 800, borderBottom: "1px solid #ddd", paddingBottom: "4px", margin: 0 }}>
              {catName}
            </h2>
            {catTasks.map((t) =>
              t.heading ? (
                <p key={t.id} style={{ fontSize: "10.5px", fontWeight: 700, color: "#777", marginTop: "8px", marginBottom: "2px" }}>
                  {t.text}
                </p>
              ) : (
                <div key={t.id} style={{ fontSize: "11.5px", padding: "3px 0", opacity: t.na ? 0.5 : 1 }}>
                  <span>{t.na ? "➖" : t.done ? "☑" : "☐"}</span>{" "}
                  <span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                  {(t.notes || (t.note ? [{ id: "legacy", text: t.note }] : [])).map((n) => (
                    <div key={n.id} style={{ fontSize: "10px", color: "#888", marginRight: "20px" }}>
                      הערה: {n.text}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PDF preview modal                                                   */
/* ------------------------------------------------------------------ */

function PdfPreviewModal({ project, categories, progress, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/60 px-4 py-8" onClick={onClose}>
      <div
        className="mx-auto flex w-full max-w-2xl flex-col rounded-2xl bg-neutral-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 items-center justify-between rounded-t-2xl border-b border-neutral-200 bg-white px-5 py-3">
          <h2 className="text-sm font-bold text-neutral-800">תצוגה מקדימה — כך ייראה ה-PDF</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
              <FileDown size={13} />
              ייצוא ל-PDF
            </button>
            <button onClick={onClose} className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="p-5">
          <div className="mx-auto max-w-xl rounded-lg bg-white shadow-md ring-1 ring-neutral-200">
            <PrintableSummary project={project} categories={categories} progress={progress} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project view                                                        */
/* ------------------------------------------------------------------ */

function ProjectView({ project, onBack, onUpdate }) {
  const categories = getCategoryOrder(project);
  const [openCategory, setOpenCategory] = useState(categories[0] || null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const progress = computeProgress(project.tasks);
  const color = getColor(project.color);

  function updateTask(taskId, patch) {
    const tasks = project.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t));
    onUpdate({ ...project, tasks });
  }

  const handlers = {
    onToggleDone: (id) => {
      const task = project.tasks.find((t) => t.id === id);
      updateTask(id, {
        done: !task.done,
        completedDate: !task.done ? new Date().toISOString() : null,
      });
    },
    onToggleNA: (id) => {
      const task = project.tasks.find((t) => t.id === id);
      updateTask(id, { na: !task.na });
    },
    onAddNote: (id, text) => {
      const task = project.tasks.find((t) => t.id === id);
      const existing = task.notes || (task.note ? [{ id: uid(), text: task.note, date: null }] : []);
      const notes = [...existing, { id: uid(), text, date: new Date().toISOString() }];
      updateTask(id, { notes, note: "" });
    },
    onDeleteNote: (id, noteId) => {
      const task = project.tasks.find((t) => t.id === id);
      const existing = task.notes || (task.note ? [{ id: "legacy", text: task.note, date: null }] : []);
      updateTask(id, { notes: existing.filter((n) => n.id !== noteId), note: "" });
    },
    onEditText: (id, text) => updateTask(id, { text }),
    onDeleteTask: (id) => {
      onUpdate({ ...project, tasks: project.tasks.filter((t) => t.id !== id) });
    },
    onMoveTask: (taskId, direction) => {
      const task = project.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const indices = [];
      project.tasks.forEach((t, i) => {
        if (t.category === task.category) indices.push(i);
      });
      const localIdx = indices.findIndex((i) => project.tasks[i].id === taskId);
      const swapLocalIdx = direction === "up" ? localIdx - 1 : localIdx + 1;
      if (swapLocalIdx < 0 || swapLocalIdx >= indices.length) return;
      const newTasks = [...project.tasks];
      const gi = indices[localIdx];
      const gj = indices[swapLocalIdx];
      [newTasks[gi], newTasks[gj]] = [newTasks[gj], newTasks[gi]];
      onUpdate({ ...project, tasks: newTasks });
    },
  };

  function renameCategory(oldName, newName) {
    const tasks = project.tasks.map((t) => (t.category === oldName ? { ...t, category: newName } : t));
    const categoryOrder = categories.map((c) => (c === oldName ? newName : c));
    onUpdate({ ...project, tasks, categoryOrder });
    if (openCategory === oldName) setOpenCategory(newName);
  }

  function deleteCategory(catName) {
    const tasks = project.tasks.filter((t) => t.category !== catName);
    const categoryOrder = categories.filter((c) => c !== catName);
    onUpdate({ ...project, tasks, categoryOrder });
    if (openCategory === catName) setOpenCategory(null);
    setDeleteCategoryTarget(null);
  }

  function addTaskToCategory(catName, text) {
    const newTask = {
      id: uid(),
      category: catName,
      text,
      heading: false,
      done: false,
      na: false,
      note: "",
      completedDate: null,
    };
    onUpdate({ ...project, tasks: [...project.tasks, newTask] });
  }

  function moveCategory(catName, direction) {
    const idx = categories.indexOf(catName);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categories.length) return;
    const newOrder = [...categories];
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
    onUpdate({ ...project, categoryOrder: newOrder });
  }

  function submitNewCategory() {
    const trimmed = categoryDraft.trim();
    if (trimmed && !categories.includes(trimmed)) {
      const categoryOrder = [...categories, trimmed];
      onUpdate({ ...project, categoryOrder });
      setOpenCategory(trimmed);
    }
    setCategoryDraft("");
    setAddingCategory(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-800"
        >
          <ArrowRight size={16} />
          חזרה ללוח הפרויקטים
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
          >
            <Eye size={14} />
            תצוגה מקדימה
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-50"
          >
            <FileDown size={14} />
            ייצוא ל-PDF
          </button>
        </div>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5">
        <div className={"absolute inset-x-0 top-0 h-1 " + color.solid} />
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <TypeBadge type={project.type} color={color} />
            <h1 className="mt-2 break-words text-xl font-black text-neutral-900 sm:text-2xl">{project.clientName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
              {project.consultant && (
                <span className="flex items-center gap-1">
                  <Users size={12} /> יועץ: {project.consultant}
                </span>
              )}
              {project.pmoOwner && <span className="flex items-center gap-1">PMO: {project.pmoOwner}</span>}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> נפתח ב-{formatDate(project.createdDate)}
              </span>
              {project.launchDate && (
                <span className="flex items-center gap-1">
                  <Rocket size={12} /> עלייה לאוויר: {formatDate(project.launchDate)}
                </span>
              )}
            </div>
          </div>
          <ProgressRing value={progress} color={color} size={64} stroke={6} />
        </div>
        <ProgressBar value={progress} color={color} />
      </div>

      <div className="flex flex-col gap-2.5">
        {categories.map((catName, idx) => (
          <CategoryAccordion
            key={catName}
            index={idx}
            name={catName}
            color={color}
            tasks={project.tasks.filter((t) => t.category === catName)}
            isOpen={openCategory === catName}
            onToggle={() => setOpenCategory(openCategory === catName ? null : catName)}
            taskHandlers={handlers}
            onRenameCategory={(newName) => renameCategory(catName, newName)}
            onDeleteCategory={() => setDeleteCategoryTarget(catName)}
            onAddTask={(text) => addTaskToCategory(catName, text)}
            isFirst={idx === 0}
            isLast={idx === categories.length - 1}
            onMoveUp={() => moveCategory(catName, "up")}
            onMoveDown={() => moveCategory(catName, "down")}
          />
        ))}

        <div className="rounded-xl border border-dashed border-neutral-300 bg-white px-4 py-3">
          {addingCategory ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={categoryDraft}
                onChange={(e) => setCategoryDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitNewCategory();
                  if (e.key === "Escape") setAddingCategory(false);
                }}
                placeholder="שם הקטגוריה החדשה"
                className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm text-neutral-800 outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-100"
              />
              <button onClick={submitNewCategory} className="flex-shrink-0 rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50">
                <Check size={16} />
              </button>
              <button onClick={() => setAddingCategory(false)} className="flex-shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button onClick={() => setAddingCategory(true)} className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-800">
              <Plus size={16} /> הוספת קטגוריה
            </button>
          )}
        </div>
      </div>

      {deleteCategoryTarget && (
        <ConfirmModal
          title="מחיקת קטגוריה"
          message={`האם למחוק את הקטגוריה "${deleteCategoryTarget}" וכל המשימות שבתוכה? פעולה זו אינה הפיכה.`}
          onConfirm={() => deleteCategory(deleteCategoryTarget)}
          onCancel={() => setDeleteCategoryTarget(null)}
        />
      )}

      {/* Printable summary — hidden on screen, shown only via window.print() / "Save as PDF" */}
      <div id="print-area" style={{ display: "none" }}>
        <PrintableSummary project={project} categories={categories} progress={progress} />
      </div>

      {previewOpen && (
        <PdfPreviewModal project={project} categories={categories} progress={progress} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App root                                                            */
/* ------------------------------------------------------------------ */

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = not checked yet, null = signed out
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [view, setView] = useState({ screen: "dashboard" });
  const [modal, setModal] = useState(null); // { mode: 'new' | 'edit', project? }
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    getSession().then(setSession);
    const subscription = onAuthStateChange((newSession, event) => {
      setSession(newSession);
      if (event === "PASSWORD_RECOVERY") {
        // user clicked the reset-password link from their email — intercept
        // the normal signed-in flow and force the "set new password" screen
        setPasswordRecovery(true);
      }
      if (!newSession) {
        // signed out — clear any previously loaded data and go back to the dashboard
        setProjects([]);
        setView({ screen: "dashboard" });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  function loadFromSupabase() {
    setLoading(true);
    setLoadError(null);
    fetchProjects()
      .then((data) => setProjects(data))
      .catch((err) => {
        console.error(err);
        setLoadError(err.message || "שגיאה בטעינת הפרויקטים מ-Supabase");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    if (session) loadFromSupabase();
  }, [session]);

  const activeProject = view.screen === "project" ? projects.find((p) => p.id === view.projectId) : null;

  function handleCreateOrSave(data) {
    if (modal.mode === "edit") {
      const updated = {
        ...modal.project,
        clientName: data.clientName,
        consultant: data.consultant,
        pmoOwner: data.pmoOwner,
        launchDate: data.launchDate,
        color: data.color,
      };
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      updateProjectRow(updated).catch((err) => {
        console.error(err);
        setSyncError("שמירת השינויים נכשלה: " + (err.message || "שגיאה לא ידועה"));
      });
      setModal(null);
    } else {
      const newProject = {
        id: uid(),
        clientName: data.clientName,
        consultant: data.consultant,
        pmoOwner: data.pmoOwner,
        launchDate: data.launchDate,
        type: data.type,
        color: data.color,
        createdDate: new Date().toISOString(),
        ...buildTasks(data.type),
      };
      setModal(null);
      insertProject(newProject)
        .then((saved) => setProjects((prev) => [saved, ...prev]))
        .catch((err) => {
          console.error(err);
          setSyncError("יצירת הפרויקט נכשלה: " + (err.message || "שגיאה לא ידועה"));
        });
    }
  }

  function handleDelete() {
    const target = confirmDelete;
    setProjects((prev) => prev.filter((p) => p.id !== target.id));
    if (view.screen === "project" && view.projectId === target.id) {
      setView({ screen: "dashboard" });
    }
    setConfirmDelete(null);
    deleteProjectRow(target.id).catch((err) => {
      console.error(err);
      setSyncError("מחיקת הפרויקט נכשלה: " + (err.message || "שגיאה לא ידועה"));
    });
  }

  function handleUpdateProject(updated) {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    updateProjectRow(updated).catch((err) => {
      console.error(err);
      setSyncError("שמירת השינויים נכשלה: " + (err.message || "שגיאה לא ידועה"));
    });
  }

  if (session === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <Loader2 size={28} className="animate-spin text-neutral-300" />
      </div>
    );
  }

  if (passwordRecovery) {
    return <ResetPasswordScreen onDone={() => setPasswordRecovery(false)} />;
  }

  if (!session) {
    return <AuthScreen />;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-neutral-50" style={{ fontFamily: "'Heebo', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700;800&family=Rubik:wght@700;800;900&display=swap');
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { display: block !important; position: absolute; inset: 0; width: 100%; }
        }
      `}</style>

      <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-2 sm:px-6">
        <span className="truncate text-xs text-neutral-400">{session.user.email}</span>
        <button
          onClick={() => signOut()}
          className="flex flex-shrink-0 items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-800"
        >
          <LogOut size={13} />
          התנתקות
        </button>
      </div>

      {syncError && (
        <div className="fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 bg-rose-600 px-4 py-2 text-sm text-white">
          <span className="flex items-center gap-2">
            <AlertTriangle size={16} />
            {syncError}
          </span>
          <button onClick={() => setSyncError(null)} className="rounded p-1 hover:bg-rose-700">
            <X size={16} />
          </button>
        </div>
      )}

      {loading && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-neutral-400">
            <Loader2 size={28} className="animate-spin" />
            <p className="text-sm font-medium">טוען פרויקטים...</p>
          </div>
        </div>
      )}

      {!loading && loadError && (
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-sm rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
            <AlertTriangle size={28} className="mx-auto mb-3 text-rose-500" />
            <p className="mb-1 text-sm font-bold text-rose-800">שגיאה בטעינת הנתונים</p>
            <p className="mb-4 text-xs text-rose-600">{loadError}</p>
            <button
              onClick={loadFromSupabase}
              className="mx-auto flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              <RefreshCw size={14} /> ניסיון חוזר
            </button>
          </div>
        </div>
      )}

      {!loading && !loadError && view.screen === "dashboard" && (
        <Dashboard
          projects={projects}
          onOpen={(id) => setView({ screen: "project", projectId: id })}
          onNew={() => setModal({ mode: "new" })}
          onEdit={(p) => setModal({ mode: "edit", project: p })}
          onDelete={(p) => setConfirmDelete(p)}
        />
      )}

      {!loading && !loadError && view.screen === "project" && activeProject && (
        <ProjectView project={activeProject} onBack={() => setView({ screen: "dashboard" })} onUpdate={handleUpdateProject} />
      )}

      {modal && (
        <ProjectModal
          initial={modal.mode === "edit" ? modal.project : null}
          onClose={() => setModal(null)}
          onSave={handleCreateOrSave}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title="מחיקת פרויקט"
          message={`האם אתם בטוחים שברצונכם למחוק את הפרויקט "${confirmDelete.clientName}"? פעולה זו אינה הפיכה.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
