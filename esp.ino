#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 oled(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

const char* ssid = "keenetic";
const char* password = "3120919631";

WebServer server(80);

float cpuTemp = 0;
float gpuTemp = 0;
float power = 0;
float ramUsed = 0;
String sessionUptime = "";


void drawStats() {
  oled.clearDisplay();

  oled.setTextColor(SSD1306_WHITE);
  oled.setTextSize(1);

  oled.setCursor(0, 0);
  oled.println("PC Monitor");

  oled.setCursor(0, 12);
  oled.print("CPU Temp: "); oled.print(cpuTemp); oled.println(" C");

  oled.setCursor(0, 22);
  oled.print("GPU Temp: "); oled.print(gpuTemp); oled.println(" C");

  oled.setCursor(0, 32);
  oled.print("Power: "); oled.print(power); oled.println(" W");

  oled.setCursor(0, 42);
  oled.print("RAM Used: "); oled.print(ramUsed); oled.println(" %");

  oled.setCursor(0, 52);
  oled.print("Up: "); oled.println(sessionUptime);

  oled.display();
}


void recieveData() {
  if (!server.hasArg("plain")) {
    server.send(400, "text/plain", "No JSON");
    return;
  }

  String body = server.arg("plain");
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, body);

  if (error) {
    server.send(400, "text/plain", "Invalid JSON");
    return;
  }

  cpuTemp = doc["cpuTemp"];
  gpuTemp = doc["gpuTemp"];
  power = doc["totalPower"];
  ramUsed = doc["ramUsed"];
  sessionUptime = doc["sessionUptimeFormatted"].as<String>();

  drawStats();

  server.send(200, "text/plain", "OK");
}

void setup() {
  Serial.begin(115200);


  if(!oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("SSD1306 allocation failed");
    for(;;);
  }
  oled.clearDisplay();
 

  // WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n WiFi connected");
  Serial.print("ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // server
  server.on("/data", HTTP_POST, recieveData);
  server.begin();
  Serial.println("HTTP server started");

  drawStats(); 
}

void loop() {
  server.handleClient();
}
