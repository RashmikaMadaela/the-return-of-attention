const mqtt = require('mqtt');

// Connect to the same broker
const client = mqtt.connect('mqtt://broker.hivemq.com', {
    clientId: 'esp32_simulator_' + Math.random().toString(16).substr(2, 8)
});

client.on('connect', () => {
    console.log('✅ ESP32 Simulator connected to MQTT broker');
    console.log('🎯 Listening for START/STOP commands...');
    
    // Subscribe to LED control topics
    client.subscribe('esp32/led/start');
    client.subscribe('esp32/led/stop');
    console.log('✅ Subscribed to esp32/led/start');
    console.log('✅ Subscribed to esp32/led/stop');
});

client.on('message', (topic, message) => {
    const data = message.toString();
    console.log(`📨 Received: ${topic} -> ${data}`);
    
    if (topic === 'esp32/led/start' && data === 'START') {
        console.log('🟢 START command received - Button reading ENABLED');
        
        // Send acknowledgment like the real ESP32 would
        setTimeout(() => {
            client.publish('esp32/control', 'START_LED_ON - Button reading enabled');
            console.log('📤 Sent acknowledgment: Button reading enabled');
            
            // Simulate some button presses after START
            simulateButtonPresses();
        }, 500);
    }
    
    if (topic === 'esp32/led/stop' && data === 'STOP') {
        console.log('🔴 STOP command received - Button reading DISABLED');
        
        // Send acknowledgment like the real ESP32 would
        setTimeout(() => {
            client.publish('esp32/control', 'STOP_LED_ON - Button reading disabled');
            console.log('📤 Sent acknowledgment: Button reading disabled');
        }, 500);
    }
});

function simulateButtonPresses() {
    console.log('🎮 Simulating button presses...');
    
    // Simulate a few button presses
    setTimeout(() => {
        client.publish('esp32/buttons', 'Button[1][1] PRESSED (Pin 13)');
        client.publish('esp32/button/1/1', 'PRESSED');
        console.log('📤 Simulated button [1][1] PRESSED');
    }, 1000);
    
    setTimeout(() => {
        client.publish('esp32/buttons', 'Button[1][1] RELEASED (Pin 13)');
        client.publish('esp32/button/1/1', 'RELEASED');
        console.log('📤 Simulated button [1][1] RELEASED');
    }, 1500);
    
    setTimeout(() => {
        client.publish('esp32/buttons', 'Button[0][2] PRESSED (Pin 5)');
        client.publish('esp32/button/0/2', 'PRESSED');
        console.log('📤 Simulated button [0][2] PRESSED');
    }, 2000);
    
    setTimeout(() => {
        client.publish('esp32/buttons', 'Button[0][2] RELEASED (Pin 5)');
        client.publish('esp32/button/0/2', 'RELEASED');
        console.log('📤 Simulated button [0][2] RELEASED');
    }, 2500);
}

client.on('error', (error) => {
    console.error('❌ MQTT Error:', error);
});

console.log('🤖 ESP32 Simulator starting...');
console.log('   Will respond to START/STOP commands');
console.log('   Will simulate button presses after START command');
console.log('   Press Ctrl+C to stop');