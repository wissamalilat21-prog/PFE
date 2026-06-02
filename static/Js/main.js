// ===== قاموس الترجمة الكامل =====
const translations = {
    fr: {
        new_patient: "Nouveau Patient",
        form_title: "Enregistrement du Patient",
        form_sub: "Remplissez les informations ci-dessous pour créer le dossier médical du patient.",
        monitoring: "Monitoring",
        connected: "Connecté",
        secure: "Sécurisé",
        patient_info: "Informations",
        consultation: "Consultation",
        nom: "Nom",
        prenom: "Prénom",
        date_naissance: "Date de naissance",
        sexe: "Sexe",
        masculin: "Masculin",
        feminin: "Féminin",
        groupe_sanguin: "Groupe Sanguin",
        enregistrer: "Enregistrer & Continuer",
        constantes: "Constantes Vitales",
        live: "En direct",
        temperature: "Température",
        capteur: "Capteur",
        freq_card: "Fréq. Cardiaque",
        tension: "Tension Artérielle",
        manuel: "Saisie manuelle",
        glycemie: "Glycémie",
        compte_rendu: "Compte Rendu",
        mdc: "Motif de Consultation",
        atcd: "Antécédents",
        dg: "Diagnostic",
        cat: "Conduite à Tenir",
        ordonnance: "Ordonnance",
        signature: "Signature du médecin",
        sauvegarder: "Sauvegarder la consultation",
        ans: "ans",
        nouveau: "Nouveau",
        imprimer: "Imprimer",
        // Partie Admin
        admin_title: "Tableau de bord Administrateur",
        admin_subtitle: "Tous les patients enregistrés dans la base de données",
        birth_date: "Date de naissance",
        gender: "Sexe",
        blood_type: "Groupe sanguin",
        reg_date: "Date d'inscription",
        actions: "Actions",
        delete: "Supprimer",
        dashboard: "Dashboard"
    },
    ar: {
        new_patient: "مريض جديد",
        form_title: "تسجيل المريض",
        form_sub: "أدخل المعلومات أدناه لإنشاء الملف الطبي للمريض.",
        monitoring: "مراقبة",
        connected: "متصل",
        secure: "آمن",
        patient_info: "المعلومات",
        consultation: "الاستشارة",
        nom: "اللقب",
        prenom: "الاسم",
        date_naissance: "تاريخ الميلاد",
        sexe: "الجنس",
        masculin: "ذكر",
        feminin: "أنثى",
        groupe_sanguin: "فصيلة الدم",
        enregistrer: "حفظ والمتابعة",
        constantes: "العلامات الحيوية",
        live: "مباشر",
        temperature: "درجة الحرارة",
        capteur: "حساس",
        freq_card: "معدل ضربات القلب",
        tension: "ضغط الدم",
        manuel: "إدخال يدوي",
        glycemie: "نسبة السكر في الدم",
        compte_rendu: "التقرير الطبي",
        mdc: "سبب الزيارة",
        atcd: "السوابق المرضية",
        dg: "التشخيص",
        cat: "السلوك العلاجي",
        ordonnance: "الوصفة الطبية",
        signature: "توقيع الطبيب",
        sauvegarder: "حفظ الاستشارة",
        ans: "سنة",
        nouveau: "جديد",
        imprimer: "طباعة",
        // Partie Admin
        admin_title: "لوحة تحكم الأدمين",
        admin_subtitle: "جميع المرضى المسجلين في قاعدة البيانات",
        birth_date: "تاريخ الميلاد",
        gender: "الجنس",
        blood_type: "فصيلة الدم",
        reg_date: "تاريخ التسجيل",
        actions: "العمليات",
        delete: "حذف",
        dashboard: "لوحة التحكم"
    },
    en: {
        new_patient: "New Patient",
        form_title: "Patient Registration",
        form_sub: "Fill in the information below to create the patient's medical record.",
        monitoring: "Monitoring",
        connected: "Connected",
        secure: "Secure",
        patient_info: "Information",
        consultation: "Consultation",
        nom: "Last Name",
        prenom: "First Name",
        date_naissance: "Date of Birth",
        sexe: "Gender",
        masculin: "Male",
        feminin: "Female",
        groupe_sanguin: "Blood Group",
        enregistrer: "Save & Continue",
        constantes: "Vital Signs",
        live: "Live",
        temperature: "Temperature",
        capteur: "Sensor",
        freq_card: "Heart Rate",
        tension: "Blood Pressure",
        manuel: "Manual input",
        glycemie: "Blood Glucose",
        compte_rendu: "Medical Report",
        mdc: "Reason for Visit",
        atcd: "Medical History",
        dg: "Diagnosis",
        cat: "Treatment Plan",
        ordonnance: "Prescription",
        signature: "Doctor's Signature",
        sauvegarder: "Save Consultation",
        ans: "years",
        nouveau: "New",
        imprimer: "Print",
        // Partie Admin
        admin_title: "Admin Dashboard",
        admin_subtitle: "All patients registered in the database",
        birth_date: "Date of birth",
        gender: "Gender",
        blood_type: "Blood type",
        reg_date: "Registration date",
        actions: "Actions",
        delete: "Delete",
        dashboard: "Dashboard"
    }
};

// ===== دالة تغيير اللغة =====
function setLang(lang) {
    localStorage.setItem('mediscan_lang', lang);
    
    // Mettre à jour l'attribut dir (direction) pour l'arabe
    const html = document.documentElement;
    if (lang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
    } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', lang);
    }
    
    // Mettre à jour tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translations[lang][key];
            } else if (el.tagName === 'BUTTON') {
                el.innerHTML = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
    
    // Mettre à jour le bouton actif
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `btn-${lang}`) {
            btn.classList.add('active');
        }
    });
}

// ===== دالة تبديل الثيم (Dark/Light) =====
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mediscan_theme', next);
}

// ===== Chargement initial =====
document.addEventListener('DOMContentLoaded', () => {
    // Thème
    const savedTheme = localStorage.getItem('mediscan_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Langue
    const savedLang = localStorage.getItem('mediscan_lang') || 'fr';
    setLang(savedLang);
});