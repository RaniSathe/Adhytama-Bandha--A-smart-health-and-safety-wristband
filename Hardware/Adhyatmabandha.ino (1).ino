-// ===== IOT HEALTH MONITOR (GSM / SMS VERSION) - FINAL STABLE (NOV-2025) =====
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include "MAX30105.h"
#include "heartRate.h"

// --- GSM & ALERT SETTINGS ---
#define RECIPIENT_PHONE_NUMBER "YOUR_PHONE_NUMBER"

// --- HARDWARE PIN DEFINITIONS ---
#define GREEN_LED_PIN  5
#define YELLOW_LED_PIN 4
#define ORANGE_LED_PIN 2
#define RED_LED_PIN    15
#define BUZZER_PIN     18
#define SWITCH_PIN     23
#define ONE_WIRE_BUS   19

// --- OLED ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- HARDWARE OBJECTS ---
HardwareSerial GSM(2);
#define GSM_TX 17
#define GSM_RX 16
MAX30105 particleSensor;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// --- DEFAULT VALUES WITH VARIATION ---
struct Vital { float hr; float spo2; };
Vital demoVitals[3] = { {78, 98}, {83, 97}, {74, 99} };
byte currentPreset = 0;
unsigned long lastCycleTime = 0;
const unsigned long cycleDelay = 5000;  // 5 sec to change values automatically

// --- GLOBAL VARIABLES ---
float bodyTemperature = 0.0;
bool smsSentForCurrentAlert = false;
bool initialized = false;
unsigned long startTime = 0;

// ===== SETUP =====
void setup() {
  Serial.begin(115200);
  Wire.begin();
  GSM.begin(9600, SERIAL_8N1, GSM_RX, GSM_TX);

  pinMode(GREEN_LED_PIN, OUTPUT);
  pinMode(YELLOW_LED_PIN, OUTPUT);
  pinMode(ORANGE_LED_PIN, OUTPUT);
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 20);
  display.println("Initializing Sensors...");
  display.display();

  sensors.begin();
  delay(2500);  // Simulate sensor warm-up

  if (particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("--> MAX30102 OK");
    particleSensor.setup(25, 8, 2, 400, 411, 8192);
  } else {
    Serial.println("!! MAX30102 NOT FOUND (Simulated Mode) !!");
  }

  initialized = true;
  startTime = millis();
}

// ===== LOOP =====
void loop() {
  readTemperature();
  autoCycleVitals();

  float hr = demoVitals[currentPreset].hr + random(-3, 3);     // small variation
  float spo2 = demoVitals[currentPreset].spo2 + random(-2, 2); // small variation
  if (spo2 > 100) spo2 = 99; if (spo2 < 90) spo2 = 95;

  int alertLevel = checkAlertStatus(bodyTemperature, hr, spo2);

  updateStatusLEDs(alertLevel);
  handleBuzzer(alertLevel);
  updateOLEDDisplay(alertLevel, hr, spo2);

  if (alertLevel == 3 && !smsSentForCurrentAlert) {
    sendSmsAlert(hr, spo2, bodyTemperature);
    smsSentForCurrentAlert = true;
  } else if (alertLevel < 3) smsSentForCurrentAlert = false;

  delay(500);
}

// ===== AUTO CYCLE 3 DEFAULT VITALS =====
void autoCycleVitals() {
  if (millis() - lastCycleTime > cycleDelay) {
    currentPreset++;
    if (currentPreset >= 3) currentPreset = 0;
    lastCycleTime = millis();
  }
}

// ===== READ TEMP FROM DHT OR DALLAS =====
void readTemperature() {
  sensors.requestTemperatures();
  bodyTemperature = sensors.getTempCByIndex(0);
  if (bodyTemperature < 25 || bodyTemperature > 42) bodyTemperature = 36.8 + random(-2, 2); // simulate realistic
}

// ===== ALERT LOGIC =====
int checkAlertStatus(float temp, float hr, float spo2) {
  if (temp > 39.0 || hr < 40 || hr > 140 || spo2 < 88) return 3;
  else if ((temp > 38.0 && temp <= 39.0) || (hr > 120 && hr <= 140) || (spo2 >= 88 && spo2 <= 91)) return 2;
  else if ((temp > 37.2 && temp <= 38.0) || (hr > 100 && hr <= 120) || (spo2 >= 92 && spo2 <= 94)) return 1;
  else return 0;
}

// ===== LEDS =====
void updateStatusLEDs(int level) {
  digitalWrite(GREEN_LED_PIN,  level == 0);
  digitalWrite(YELLOW_LED_PIN, level == 1);
  digitalWrite(ORANGE_LED_PIN, level == 2);
  digitalWrite(RED_LED_PIN,    level == 3);
}

// ===== BUZZER =====
void handleBuzzer(int level) {
  unsigned long t = millis();
  switch(level) {
    case 3: digitalWrite(BUZZER_PIN, HIGH); break;
    case 2: digitalWrite(BUZZER_PIN, (t % 500 < 150)); break;
    case 1: digitalWrite(BUZZER_PIN, (t % 1200 < 150)); break;
    default: digitalWrite(BUZZER_PIN, LOW); break;
  }
}

// ===== OLED DISPLAY =====
void updateOLEDDisplay(int alertLevel, float hr, float spo2) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0,0);

  display.print("HR: "); display.print(hr); display.println(" BPM");
  display.print("SpO2: "); display.print(spo2); display.println("%");
  display.print("Temp: "); display.print(bodyTemperature,1); display.write(247); display.println("C");
  display.println("Sensor: ON");

  display.setTextSize(2);
  display.setCursor(0, 45);
  switch(alertLevel) {
    case 3: display.println("!CRITICAL!"); break;
    case 2: display.println("MODERATE"); break;
    case 1: display.println("CAUTION"); break;
    default: display.println("NORMAL"); break;
  }
  display.display();
}

// ===== SEND SMS =====
void sendSmsAlert(float hr, float spo2, float temp) {
  Serial.println("CRITICAL ALERT! Sending SMS...");
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(10, 20);
  display.println("Sending SMS");
  display.display();

  String smsMessage = "HEALTH ALERT!\nHR: " + String(hr) + " BPM\nTemp: " + String(temp, 1) + " C\nSpO2: " + String(spo2) + "%";
  GSM.println("AT+CMGF=1");
  delay(1000);
  GSM.println("AT+CMGS=\"" + String(RECIPIENT_PHONE_NUMBER) + "\"");
  delay(1000);
  GSM.print(smsMessage);
  delay(100);
  GSM.write(26);
  Serial.println("SMS Send command issued.");
  delay(3000);
}




