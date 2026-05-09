import sqlite3
from config import DATABASE_PATH

def get_db():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nom TEXT NOT NULL,
            prenom TEXT NOT NULL,
            date_naissance TEXT NOT NULL,
            sexe TEXT NOT NULL,
            groupe_sanguin TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            temperature REAL,
            spo2 REAL,
            frequence_cardiaque INTEGER,
            ecg_data TEXT,
            tension TEXT,
            glycemie REAL,
            mdc TEXT,
            cat TEXT,
            atcd TEXT,
            dg TEXT,
            ordonnance TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def create_patient(nom, prenom, date_naissance, sexe, groupe_sanguin):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO patients (nom, prenom, date_naissance, sexe, groupe_sanguin) VALUES (?, ?, ?, ?, ?)',
        (nom, prenom, date_naissance, sexe, groupe_sanguin)
    )
    patient_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return patient_id

def get_patient(patient_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients WHERE id = ?', (patient_id,))
    patient = cursor.fetchone()
    conn.close()
    return dict(patient) if patient else None

def get_all_patients():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM patients ORDER BY created_at DESC')
    patients = cursor.fetchall()
    conn.close()
    return [dict(p) for p in patients]

def save_consultation(data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO consultations 
        (patient_id, temperature, spo2, frequence_cardiaque, ecg_data, tension, glycemie, mdc, cat, atcd, dg, ordonnance)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('patient_id'),
        data.get('temperature'),
        data.get('spo2'),
        data.get('frequence_cardiaque'),
        data.get('ecg_data'),
        data.get('tension'),
        data.get('glycemie'),
        data.get('mdc'),
        data.get('cat'),
        data.get('atcd'),
        data.get('dg'),
        data.get('ordonnance')
    ))
    consultation_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return consultation_id

def get_latest_consultation(patient_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT * FROM consultations WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1',
        (patient_id,)
    )
    consultation = cursor.fetchone()
    conn.close()
    return dict(consultation) if consultation else None

def update_sensor_data(patient_id, temperature, spo2, frequence_cardiaque, ecg_data):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT id FROM consultations WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1',
        (patient_id,)
    )
    existing = cursor.fetchone()
    
    if existing:
        cursor.execute('''
            UPDATE consultations 
            SET temperature=?, spo2=?, frequence_cardiaque=?, ecg_data=?
            WHERE id=?
        ''', (temperature, spo2, frequence_cardiaque, ecg_data, existing['id']))
    else:
        cursor.execute('''
            INSERT INTO consultations (patient_id, temperature, spo2, frequence_cardiaque, ecg_data)
            VALUES (?, ?, ?, ?, ?)
        ''', (patient_id, temperature, spo2, frequence_cardiaque, ecg_data))
    
    conn.commit()
    conn.close()
