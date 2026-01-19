// #include <WiFi.h>
// #include <PubSubClient.h>

// /* =====================================================
//    ESP32 9-Button PAHM Remote Control
//    MQTT Bridge for Web Application
//    ===================================================== */

// // WiFi credentials
// const char* ssid = "Fiber 5 GHz";
// const char* password = "methuki123";

// // MQTT Broker settings
// const char* mqtt_server = "broker.hivemq.com";
// const int mqtt_port = 1883;

// // LED pins for ESP32
// const int LED_START_PIN = 12;  // START LED (Green)
// const int LED_STOP_PIN = 13;   // STOP LED (Red)

// // 9 Button pins for ESP32
// const int BUTTON_PINS[9] = {
//   14, 27, 26,  // Row 0: [0][0], [0][1], [0][2]
//   25, 33, 32,  // Row 1: [1][0], [1][1], [1][2]
//   18, 19, 21   // Row 2: [2][0], [2][1], [2][2]
// };

// // PAHM Grid Layout:
// // [Nostalgia] [Likes]        [Anticipation]  <- Row 0
// // [Past]      [Present]      [Future]        <- Row 1
// // [Regret]    [Dislikes]     [Worry]         <- Row 2

// const int NUM_BUTTONS = 9;

// // Variables
// WiFiClient espClient;
// PubSubClient client(espClient);

// bool buttonStates[NUM_BUTTONS] = {false};
// bool lastButtonStates[NUM_BUTTONS] = {false};
// unsigned long lastDebounceTime[NUM_BUTTONS] = {0};
// const unsigned long debounceDelay = 50;  // 50ms debounce

// bool buttonReadingEnabled = true;  // AUTO-ENABLED (set false for START/STOP control)
// unsigned long lastMsg = 0;

// /* =====================================================
//    WIFI SETUP
//    ===================================================== */
// void setup_wifi() {
//   delay(10);
//   Serial.println("\n========================================");
//   Serial.println("  ESP32 9-Button Remote Control");
//   Serial.println("  MQTT + WebSocket Bridge for PAHM");
//   Serial.println("========================================\n");
  
//   Serial.print("Connecting to WiFi: ");
//   Serial.println(ssid);
//   Serial.println("========================================");

//   WiFi.mode(WIFI_STA);
//   WiFi.begin(ssid, password);

//   int attempts = 0;
//   while (WiFi.status() != WL_CONNECTED && attempts < 30) {
//     delay(500);
//     Serial.print(".");
//     attempts++;
//   }

//   Serial.println();
//   if (WiFi.status() == WL_CONNECTED) {
//     Serial.println("WiFi connected successfully!");
//     Serial.print("IP Address: ");
//     Serial.println(WiFi.localIP());
//     Serial.print("Signal Strength: ");
//     Serial.print(WiFi.RSSI());
//     Serial.println(" dBm");
//   } else {
//     Serial.println("WiFi connection FAILED!");
//     Serial.println("Check your SSID and password");
//   }
//   Serial.println("========================================\n");
// }

// /* =====================================================
//    MQTT CALLBACK - Handle START/STOP Commands
//    ===================================================== */
// void callback(char* topic, byte* payload, unsigned int length) {
//   String message = "";
//   for (unsigned int i = 0; i < length; i++) {
//     message += (char)payload[i];
//   }

//   Serial.print("[MQTT] ");
//   Serial.print(topic);
//   Serial.print(" -> ");
//   Serial.println(message);

//   // Handle START command
//   if (String(topic) == "esp32/led/start" && message == "START") {
//     digitalWrite(LED_START_PIN, LOW);   // Turn ON START LED
//     digitalWrite(LED_STOP_PIN, HIGH);   // Turn OFF STOP LED
//     buttonReadingEnabled = true;
    
//     Serial.println("\n========================================");
//     Serial.println("START COMMAND RECEIVED");
//     Serial.println("  START LED: ON");
//     Serial.println("  STOP LED: OFF");
//     Serial.println("  Button Reading: ENABLED");
//     Serial.println("========================================\n");
    
//     // Reset button states to prevent ghost presses
//     for (int i = 0; i < NUM_BUTTONS; i++) {
//       lastButtonStates[i] = !digitalRead(BUTTON_PINS[i]);
//     }
    
//     client.publish("esp32/control", "STARTED");
//   }
  
//   // Handle STOP command
//   else if (String(topic) == "esp32/led/stop" && message == "STOP") {
//     digitalWrite(LED_START_PIN, HIGH);  // Turn OFF START LED
//     digitalWrite(LED_STOP_PIN, LOW);    // Turn ON STOP LED
//     buttonReadingEnabled = false;
    
//     Serial.println("\n========================================");
//     Serial.println("STOP COMMAND RECEIVED");
//     Serial.println("  START LED: OFF");
//     Serial.println("  STOP LED: ON");
//     Serial.println("  Button Reading: DISABLED");
//     Serial.println("========================================\n");
    
//     client.publish("esp32/control", "STOPPED");
//   }
// }

// /* =====================================================
//    MQTT RECONNECT
//    ===================================================== */
// void reconnect() {
//   while (!client.connected()) {
//     Serial.print("Connecting to MQTT broker...");
    
//     // Create unique client ID
//     String clientId = "ESP32-9BTN-";
//     clientId += String(random(0xffff), HEX);
    
//     if (client.connect(clientId.c_str())) {
//       Serial.println(" CONNECTED!");
//       Serial.print("   Client ID: ");
//       Serial.println(clientId);
      
//       // Subscribe to control topics
//       client.subscribe("esp32/led/start");
//       client.subscribe("esp32/led/stop");
      
//       Serial.println("   Subscribed to:");
//       Serial.println("      - esp32/led/start");
//       Serial.println("      - esp32/led/stop");
      
//       // Announce online status
//       bool published = client.publish("esp32/control", "ESP32_ONLINE");
//       if (published) {
//         Serial.println("   Published: ESP32_ONLINE");
//       } else {
//         Serial.println("   Failed to publish online status");
//       }
      
//       // Show button reading status
//       if (buttonReadingEnabled) {
//         Serial.println("\nBUTTON READING: AUTO-ENABLED");
//         Serial.println("   Ready to detect button presses!");
//       } else {
//         Serial.println("\nBUTTON READING: DISABLED");
//         Serial.println("   Waiting for START command from web app");
//       }
      
//     } else {
//       Serial.print(" FAILED! rc=");
//       Serial.print(client.state());
//       Serial.println(" | Retrying in 5 seconds...");
//       delay(5000);
//     }
//   }
// }

// /* =====================================================
//    BUTTON TEST AT STARTUP
//    ===================================================== */
// void testButtons() {
//   Serial.println("\n========================================");
//   Serial.println("     BUTTON CONNECTION TEST");
//   Serial.println("========================================\n");
  
//   const char* buttonLabels[9] = {
//     "Nostalgia", "Likes", "Anticipation",
//     "Past", "Present", "Future",
//     "Regret", "Dislikes", "Worry"
//   };
  
//   Serial.println("Grid Layout:");
//   Serial.println("[0][0] [0][1] [0][2]  <- Row 0");
//   Serial.println("[1][0] [1][1] [1][2]  <- Row 1");
//   Serial.println("[2][0] [2][1] [2][2]  <- Row 2\n");
  
//   for (int i = 0; i < NUM_BUTTONS; i++) {
//     int pinState = digitalRead(BUTTON_PINS[i]);
//     int row = i / 3;
//     int col = i % 3;
    
//     Serial.print("Button [");
//     Serial.print(row);
//     Serial.print("][");
//     Serial.print(col);
//     Serial.print("] Pin ");
//     Serial.print(BUTTON_PINS[i]);
//     Serial.print(" (");
//     Serial.print(buttonLabels[i]);
//     Serial.print("): ");
    
//     if (pinState == HIGH) {
//       Serial.println("Ready (Pull-up active)");
//     } else {
//       Serial.println("PRESSED or SHORT CIRCUIT!");
//     }
//     delay(50);
//   }
  
//   Serial.println("\n========================================");
//   Serial.println("Press any button to test...");
//   Serial.println("========================================\n");
// }

// /* =====================================================
//    CHECK BUTTONS WITH DEBOUNCE
//    ===================================================== */
// void checkButtons() {
//   if (!buttonReadingEnabled) {
//     return;  // Don't read buttons if disabled
//   }
  
//   unsigned long currentTime = millis();
  
//   for (int i = 0; i < NUM_BUTTONS; i++) {
//     int reading = !digitalRead(BUTTON_PINS[i]);  // Inverted (INPUT_PULLUP)
    
//     // Check if state changed
//     if (reading != buttonStates[i]) {
//       lastDebounceTime[i] = currentTime;
//     }
    
//     // Only act if debounce time has passed
//     if ((currentTime - lastDebounceTime[i]) > debounceDelay) {
      
//       // If state actually changed
//       if (reading != lastButtonStates[i]) {
//         lastButtonStates[i] = reading;
        
//         int row = i / 3;
//         int col = i % 3;
//         int pinNum = BUTTON_PINS[i];
        
//         const char* buttonLabels[9] = {
//           "Nostalgia", "Likes", "Anticipation",
//           "Past", "Present", "Future",
//           "Regret", "Dislikes", "Worry"
//         };
        
//         String state = reading ? "PRESSED" : "RELEASED";
//         String topic = "esp32/button/" + String(row) + "/" + String(col);
        
//         // Publish to MQTT
//         bool published = client.publish(topic.c_str(), state.c_str());
        
//         if (reading) {
//           // Button PRESSED
//           Serial.println("========================================");
//           Serial.print("Button [");
//           Serial.print(row);
//           Serial.print("][");
//           Serial.print(col);
//           Serial.print("] Pin ");
//           Serial.print(pinNum);
//           Serial.print(" -> PRESSED");
//           Serial.println();
//           Serial.print("    ");
//           Serial.println(buttonLabels[i]);
//           Serial.println("========================================");
//         } else {
//           // Button RELEASED
//           Serial.print("   Button [");
//           Serial.print(row);
//           Serial.print("][");
//           Serial.print(col);
//           Serial.print("] Pin ");
//           Serial.print(pinNum);
//           Serial.println(" -> RELEASED");
//         }
        
//         if (!published) {
//           Serial.println("   MQTT publish failed!");
//         }
//       }
//     }
    
//     buttonStates[i] = reading;
//   }
// }

// /* =====================================================
//    SETUP
//    ===================================================== */
// void setup() {
//   Serial.begin(115200);
//   delay(1000);
  
//   // Initialize LED pins
//   pinMode(LED_START_PIN, OUTPUT);
//   pinMode(LED_STOP_PIN, OUTPUT);
//   digitalWrite(LED_START_PIN, HIGH);  // OFF initially
//   digitalWrite(LED_STOP_PIN, LOW);    // ON initially (STOP state)
  
//   // Initialize button pins
//   Serial.println("\nInitializing 9-button grid...");
//   for (int i = 0; i < NUM_BUTTONS; i++) {
//     pinMode(BUTTON_PINS[i], INPUT_PULLUP);
//     lastButtonStates[i] = false;
//     lastDebounceTime[i] = 0;
    
//     Serial.print("   [");
//     Serial.print(i/3);
//     Serial.print("][");
//     Serial.print(i%3);
//     Serial.print("] -> Pin ");
//     Serial.println(BUTTON_PINS[i]);
//   }
//   Serial.println("All buttons initialized\n");
  
//   // Connect to WiFi
//   setup_wifi();
  
//   // Test buttons
//   testButtons();
  
//   // Setup MQTT
//   client.setServer(mqtt_server, mqtt_port);
//   client.setCallback(callback);
  
//   Serial.println("\nESP32 READY\n");
// }

// /* =====================================================
//    MAIN LOOP
//    ===================================================== */
// void loop() {
//   // Maintain MQTT connection
//   if (!client.connected()) {
//     reconnect();
//   }
//   client.loop();
  
//   // Check buttons every 50ms
//   unsigned long now = millis();
//   if (now - lastMsg > 50) {
//     lastMsg = now;
//     checkButtons();
//   }
  
//   delay(10);
// }