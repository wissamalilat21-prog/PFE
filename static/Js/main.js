const translations = {
    fr: {
        new_patient:"Nouveau Patient",form_title:"Enregistrement du Patient",
        form_sub:"Remplissez les informations ci-dessous pour créer le dossier médical du patient.",
        monitoring:"Monitoring",connected:"Connecté",secure:"Sécurisé",
        patient_info:"Informations",consultation:"Consultation",
        nom:"Nom",prenom:"Prénom",date_naissance:"Date de naissance",
        sexe:"Sexe",masculin:"Masculin",feminin:"Féminin",
        groupe_sanguin:"Groupe Sanguin",enregistrer:"Enregistrer & Continuer",
        constantes:"Constantes Vitales",live:"En direct",temperature:"Température",
        capteur:"Capteur",freq_card:"Fréq. Cardiaque",tension:"Tension Artérielle",
        manuel:"Saisie manuelle",glycemie:"Glycémie",compte_rendu:"Compte Rendu",
        mdc:"Motif de Consultation",atcd:"Antécédents",dg:"Diagnostic",
        cat:"Conduite à Tenir",ordonnance:"Ordonnance",signature:"Signature du médecin",
        sauvegarder:"Sauvegarder la consultation",ans:"ans",nouveau:"Nouveau",imprimer:"Imprimer"
    },
    ar: {
        new_patient:"مريض جديد",form_title:"تسجيل المريض",
        form_sub:"أدخل المعلومات أدناه لإنشاء الملف الطبي للمريض.",
        monitoring:"مراقبة",connected:"متصل",secure:"آمن",
        patient_info:"المعلومات",consultation:"الاستشارة",
        nom:"اللقب",prenom:"الاسم",date_naissance:"تاريخ الميلاد",
        sexe:"الجنس",masculin:"ذكر",feminin:"أنثى",
        groupe_sanguin:"فصيلة الدم",enregistrer:"حفظ والمتابعة",
        constantes:"العلامات الحيوية",live:"مباشر",temperature:"درجة الحرارة",
        capteur:"حساس",freq_card:"معدل ضربات القلب",tension:"ضغط الدم",
        manuel:"إدخال يدوي",glycemie:"نسبة السكر في الدم",compte_rendu:"التقرير الطبي",
        mdc:"سبب الزيارة",atcd:"السوابق المرضية",dg:"التشخيص",
        cat:"السلوك العلاجي",ordonnance:"الوصفة الطبية",signature:"توقيع الطبيب",
        sauvegarder:"حفظ الاستشارة",ans:"سنة",nouveau:"جديد",imprimer:"طباعة"
    },
    en: {
        new_patient:"New Patient",form_title:"Patient Registration",
        form_sub:"Fill in the information below to create the patient's medical record.",
        monitoring:"Monitoring",connected:"Connected",secure:"Secure",
        patient_info:"Information",consultation:"Consultation",
        nom:"Last Name",prenom:"First Name",date_naissance:"Date of Birth",
        sexe:"Gender",masculin:"Male",feminin:"Female",
        groupe_sanguin:"Blood Group",enregistrer:"Save & Continue",
        constantes:"Vital Signs",live:"Live",temperature:"Temperature",
        capteur:"Sensor",freq_card:"Heart Rate",tension:"Blood Pressure",
        manuel:"Manual input",glycemie:"Blood Glucose",compte_rendu:"Medical Report",
        mdc:"Reason for Visit",atcd:"Medical History",dg:"Diagnosis",
        cat:"Treatment Plan",ordonnance:"Prescription",signature:"Doctor's Signature",
        sauvegarder:"Save Consultation",ans:"years",nouveau:"New",imprimer:"Print"
    }
};

let currentLang = localStorage.getItem('mediscan_lang') || 'fr';

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('mediscan_lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById('btn-' + lang);
    if (btn) btn.classList.add('active');
    const html = document.documentElement;
    if (lang === 'ar') {
        html.setAttribute('dir', 'rtl');
        html.setAttribute('lang', 'ar');
        document.body.setAttribute('dir', 'rtl');
    } else {
        html.setAttribute('dir', 'ltr');
        html.setAttribute('lang', lang);
        document.body.setAttribute('dir', 'ltr');
    }
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const k = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][k]) el.textContent = translations[lang][k];
    });
}

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('mediscan_theme', next);
}

document.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('mediscan_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    setLang(currentLang);

    document.querySelectorAll('.field-input, .cr-textarea, .ordonnance-textarea, .constante-input').forEach(input => {
        input.addEventListener('focus', () => {
            input.closest('.field-group, .cr-field, .constante-card')?.classList.add('focused');
        });
        input.addEventListener('blur', () => {
            input.closest('.field-group, .cr-field, .constante-card')?.classList.remove('focused');
        });
    });
});
