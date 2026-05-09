#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <ArduinoJson.h>

#include "MAX30105.h"
#include "spo2_algorithm.h"
#include "heartRate.h"
#include "SparkFun_MAX30205.h"

// ============================================================
//  CONFIGURATION — Modifier selon votre réseau et serveur
// ============================================================
const char* WIFI_SSID     = "VOTRE_WIFI_SSID";
const char* WIFI_PASSWORD  = "VOTRE_WIFI_PASSWORD";
const char* SERVER_IP      = "192.168.1.100";
const int   SERVER_PORT    = 5000;
const int   PATIENT_ID     = 1;
const int   SEND_INTERVAL  = 2000;
// ============================================================

// ============================================================
//  CONFIGURATION CAPTEURS — Modifier si vous changez de capteur
// ============================================================
const int I2C_SDA = 21;
const int I2C_SCL = 22;
const int ECG_PIN = 34;
const int ECG_SAMPLES = 50;
// ============================================================

MAX30105 particleSensor;
MAX30205 tempSensor;

uint32_t irBuffer[100];
uint32_t redBuffer[100];
int32_t bufferLength = 100;
int32_t spo2;
int8_t  validSPO2;
int32_t heartRate;
int8_t  validHeartRate;

const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

float currentTemperature = 0.0;
float currentSpo2 = 0.0;
int   currentHeartRate = 0;
int   ecgBuffer[ECG_SAMPLES];
int   ecgIndex = 0;

bool max30102_ok = false;
bool max30205_ok = false;

unsigned long lastSend = 0;
unsigned long lastEcgSample = 0;

void connectWiFi() {
    Serial.print("Connexion WiFi: ");
    Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi connecté!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("\nEchec connexion WiFi - mode hors-ligne");
    }
}

void initMAX30102() {
    if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
        Serial.println("MAX30102 non trouvé");
        return;
    }
    particleSensor.setup();
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeGreen(0);
    max30102_ok = true;
    Serial.println("MAX30102 OK");
}

void initMAX30205() {
    if (!tempSensor.begin()) {
        Serial.println("MAX30205 non trouvé");
        return;
    }
    tempSensor.setOneShot(false);
    tempSensor.setResolution(MAX30205_RESOLUTION_0_0625);
    max30205_ok = true;
    Serial.println("MAX30205 OK");
}

void readTemperature() {
    if (!max30205_ok) {
        currentTemperature = 0.0;
        return;
    }
    currentTemperature = tempSensor.getTemperature();
}

void readMAX30102() {
    if (!max30102_ok) return;

    for (int i = 0; i < bufferLength; i++) {
        while (!particleSensor.available()) {
            particleSensor.check();
        }
        redBuffer[i] = particleSensor.getRed();
        irBuffer[i]  = particleSensor.getIR();
        particleSensor.nextSample();
    }

    maxim_heart_rate_and_oxygen_saturation(
        irBuffer, bufferLength, redBuffer,
        &spo2, &validSPO2, &heartRate, &validHeartRate
    );

    if (validSPO2) currentSpo2 = spo2;
    if (validHeartRate && heartRate > 20 && heartRate < 220) {
        currentHeartRate = heartRate;
    }
}

void readECG() {
    if (millis() - lastEcgSample < 20) return;
    lastEcgSample = millis();
    ecgBuffer[ecgIndex] = analogRead(ECG_PIN);
    ecgIndex = (ecgIndex + 1) % ECG_SAMPLES;
}

void sendData() {
    if (WiFi.status() != WL_CONNECTED) {
        connectWiFi();
        return;
    }

    StaticJsonDocument<1024> doc;
    doc["patient_id"] = PATIENT_ID;
    doc["temperature"] = currentTemperature;
    doc["spo2"] = currentSpo2;
    doc["frequence_cardiaque"] = currentHeartRate;

    JsonArray ecgArray = doc.createNestedArray("ecg_data");
    for (int i = 0; i < ECG_SAMPLES; i++) {
        int idx = (ecgIndex + i) % ECG_SAMPLES;
        ecgArray.add(ecgBuffer[idx]);
    }

    String jsonString;
    serializeJson(doc, jsonString);

    HTTPClient http;
    String url = "http://" + String(SERVER_IP) + ":" + String(SERVER_PORT) + "/api/sensor";
    http.begin(url);
    http.addHeader("Content-Type", "application/json");

    int responseCode = http.POST(jsonString);

    if (responseCode > 0) {
        Serial.print("Envoi OK — Code: ");
        Serial.println(responseCode);
    } else {
        Serial.print("Erreur envoi: ");
        Serial.println(http.errorToString(responseCode));
    }

    http.end();
}

void setup() {
    Serial.begin(115200);
    Wire.begin(I2C_SDA, I2C_SCL);
    analogReadResolution(12);

    Serial.println("=== MediScan Pro — ESP32 ===");

    connectWiFi();
    initMAX30102();
    initMAX30205();

    Serial.println("Démarrage des mesures...");
}

void loop() {
    readECG();
    readTemperature();

    if (max30102_ok) {
        readMAX30102();
    }

    Serial.printf("T:%.2f°C | SpO2:%.0f%% | FC:%dbpm\n",
        currentTemperature, currentSpo2, currentHeartRate);

    if (millis() - lastSend >= SEND_INTERVAL) {
        lastSend = millis();
        sendData();
    }

    delay(10);
}
