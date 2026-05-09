from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from database import init_db, create_patient, get_patient, save_consultation, get_latest_consultation, update_sensor_data, get_all_patients
from config import SECRET_KEY, DEBUG, HOST, PORT
from datetime import datetime, date
import json

app = Flask(__name__)
app.secret_key = SECRET_KEY

latest_sensor_data = {
    'temperature': None,
    'spo2': None,
    'frequence_cardiaque': None,
    'ecg_data': None,
    'patient_id': None
}

@app.route('/')
def index():
    return redirect(url_for('patient_form'))

@app.route('/patient/new', methods=['GET', 'POST'])
def patient_form():
    if request.method == 'POST':
        data = request.form
        patient_id = create_patient(
            nom=data.get('nom'),
            prenom=data.get('prenom'),
            date_naissance=data.get('date_naissance'),
            sexe=data.get('sexe'),
            groupe_sanguin=data.get('groupe_sanguin')
        )
        latest_sensor_data['patient_id'] = patient_id
        return redirect(url_for('patient_dashboard', patient_id=patient_id))
    return render_template('patient_form.html')

@app.route('/patient/<int:patient_id>/dashboard')
def patient_dashboard(patient_id):
    patient = get_patient(patient_id)
    if not patient:
        return redirect(url_for('patient_form'))
    
    today = date.today()
    dob = datetime.strptime(patient['date_naissance'], '%Y-%m-%d').date()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    patient['age'] = age
    
    consultation = get_latest_consultation(patient_id)
    sensor = latest_sensor_data if latest_sensor_data['patient_id'] == patient_id else {}
    
    return render_template('patient_dashboard.html', patient=patient, consultation=consultation, sensor=sensor)

@app.route('/patient/<int:patient_id>/save', methods=['POST'])
def save_patient_data(patient_id):
    data = request.form.to_dict()
    data['patient_id'] = patient_id
    
    for field in ['temperature', 'spo2', 'frequence_cardiaque', 'glycemie']:
        if data.get(field):
            try:
                data[field] = float(data[field])
            except:
                data[field] = None
    
    save_consultation(data)
    return jsonify({'success': True, 'message': 'Consultation sauvegardée avec succès'})

@app.route('/api/sensor', methods=['POST'])
def receive_sensor_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data received'}), 400
        
        patient_id = data.get('patient_id') or latest_sensor_data['patient_id']
        
        latest_sensor_data['temperature'] = data.get('temperature')
        latest_sensor_data['spo2'] = data.get('spo2')
        latest_sensor_data['frequence_cardiaque'] = data.get('frequence_cardiaque')
        latest_sensor_data['ecg_data'] = data.get('ecg_data')
        latest_sensor_data['patient_id'] = patient_id
        
        if patient_id:
            update_sensor_data(
                patient_id,
                data.get('temperature'),
                data.get('spo2'),
                data.get('frequence_cardiaque'),
                json.dumps(data.get('ecg_data', []))
            )
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sensor/latest')
def get_sensor_data():
    return jsonify(latest_sensor_data)

@app.route('/api/patients')
def api_patients():
    patients = get_all_patients()
    return jsonify(patients)

if __name__ == '__main__':
    init_db()
    app.run(debug=DEBUG, host=HOST, port=PORT)
