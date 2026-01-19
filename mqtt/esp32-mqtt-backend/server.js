const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const axios = require('axios');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Next.js API endpoint (change if your Next.js runs on a different port)
const NEXTJS_API = 'http://localhost:3000/api/mqtt/websocket';

// Track if remote is connected
let remoteConnected = false;
let remoteEnabled = false; // Only track button presses when enabled

// CORS middleware - Allow requests from Next.js frontend
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Serve static files
app.use(express.static(__dirname + '/public'));
app.use(express.json()); // Parse JSON bodies

// Session tracking
const sessionStats = new Map(); // clientId -> { startTime, buttonClicks: [] }

// MQTT Setup - using unique client ID to avoid conflicts
const mqttClient = mqtt.connect('mqtt://broker.hivemq.com', {
    clientId: 'esp32_web_monitor_' + Date.now() + '_' + Math.random().toString(16).substr(2, 8),
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    port: 1883,
    protocol: 'mqtt'
});

console.log('🔄 Attempting to connect to MQTT broker...');

mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    console.log('Client ID:', mqttClient.options.clientId);
    
    mqttClient.subscribe('esp32/buttons', { qos: 0 });
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            mqttClient.subscribe(`esp32/button/${row}/${col}`, { qos: 0 });
        }
    }
    
    mqttClient.subscribe('esp32/control', { qos: 0 });
    
    setTimeout(() => {
        mqttClient.publish('esp32/buttons', 'Server connected');
    }, 2000);
});

mqttClient.on('message', (topic, message) => {
    const data = message.toString();
    const timestamp = new Date().toISOString();
    
    console.log('📨 MQTT message received:');
    console.log('   Topic:', topic);
    console.log('   Message:', data);
    console.log('   Time:', new Date().toLocaleString());
    
    // Process 9-button grid messages
    if(topic === 'esp32/buttons') {
        console.log('🎯 ESP8266 9-Button Grid Data received:', data);
        
        // Parse button grid data
        const buttonData = {
            message: data,
            timestamp: timestamp,
            displayTime: new Date().toLocaleString(),
            isPressed: data.toLowerCase().includes('pressed') && !data.toLowerCase().includes('released'),
            isReleased: data.toLowerCase().includes('released'),
            type: 'grid'
        };
        
        // Extract row and column if possible
        const gridMatch = data.match(/Button\[(\d+)\]\[(\d+)\]/);
        if (gridMatch) {
            buttonData.row = parseInt(gridMatch[1]);
            buttonData.col = parseInt(gridMatch[2]);
        }
        
        // Extract ESP8266 pin (D0-D8) if possible
        const pinMatch = data.match(/Pin (D\d+)/);
        if (pinMatch) {
            buttonData.pin = pinMatch[1]; // ESP8266 pin like "D1", "D2", etc.
        } else {
            // Fallback: try to extract numeric pin
            const numPinMatch = data.match(/Pin (\d+)/);
            if (numPinMatch) {
                buttonData.pin = numPinMatch[1];
            }
        }
        
        // Broadcast to all connected clients
        io.emit('buttonGrid', buttonData);
        console.log('📡 Grid data sent to', io.engine.clientsCount, 'frontend clients');
    }
    
    if(topic.startsWith('esp32/button/')) {
        const parts = topic.split('/');
        if (parts.length === 4) {
            const row = parseInt(parts[2]);
            const col = parseInt(parts[3]);
            
            const pahmPositions = [
                ['nostalgia', 'likes', 'anticipation'],
                ['past', 'present', 'future'],
                ['regret', 'dislikes', 'worry']
            ];
            const position = pahmPositions[row]?.[col] || 'unknown';
            
            const buttonData = {
                message: data,
                timestamp: timestamp,
                displayTime: new Date().toLocaleString(),
                row: row,
                col: col,
                position: position,
                isPressed: data === 'PRESSED',
                isReleased: data === 'RELEASED',
                type: 'individual'
            };
            
            if (data === 'PRESSED' && remoteEnabled) {
                sessionStats.forEach((session, clientId) => {
                    if (session.active) {
                        session.buttonClicks.push({
                            button: `[${row}][${col}]`,
                            row: row,
                            col: col,
                            position: position,
                            time: new Date().toLocaleString(),
                            timestamp: timestamp
                        });
                    }
                });
                
                axios.post(NEXTJS_API, buttonData).catch(() => {});
            }
            
            io.emit('buttonIndividual', buttonData);
        }
    }
    
    // Legacy support for single button (backward compatibility)
    if(topic === 'esp32/button') {
        console.log('🎯 ESP32 Legacy Button Data received:', data);
        
        const buttonData = {
            message: data,
            timestamp: timestamp,
            displayTime: new Date().toLocaleString(),
            isPressed: data.toLowerCase().includes('pressed') && !data.toLowerCase().includes('released'),
            isReleased: data.toLowerCase().includes('released'),
            type: 'legacy'
        };
        
        io.emit('button', buttonData);
        console.log('📡 Legacy button data sent to', io.engine.clientsCount, 'frontend clients');
    }
    
    // Process control acknowledgments from ESP32
    if(topic === 'esp32/control') {
        console.log('🎯 ESP32 Control acknowledgment received:', data);
        
        // Track remote connection
        if (data.includes('ESP32_ONLINE') || data.includes('ONLINE')) {
            remoteConnected = true;
            console.log('✅ ESP32 Remote connected!');
        }
        
        // Parse the control status from the message
        let buttonReadingEnabled = null;
        let ledStatus = null;
        
        if (data.includes('Button reading enabled') || data.includes('STARTED')) {
            buttonReadingEnabled = true;
            ledStatus = 'START';
            remoteEnabled = true;
            console.log('✅ Remote button tracking ENABLED');
        } else if (data.includes('Button reading disabled') || data.includes('STOPPED')) {
            buttonReadingEnabled = false;
            ledStatus = 'STOP';
            remoteEnabled = false;
            console.log('⏹️ Remote button tracking DISABLED');
        }
        
        // Enhanced data object for frontend
        const controlData = {
            message: data,
            timestamp: timestamp,
            remoteConnected: remoteConnected,
            remoteEnabled: remoteEnabled,
            displayTime: new Date().toLocaleString(),
            type: 'control_ack',
            buttonReadingEnabled: buttonReadingEnabled,
            ledStatus: ledStatus
        };
        
        // Broadcast to all connected clients
        io.emit('controlAck', controlData);
        console.log('📡 Control acknowledgment sent to', io.engine.clientsCount, 'frontend clients');
        
        if (buttonReadingEnabled !== null) {
            console.log(`🎮 Button reading status: ${buttonReadingEnabled ? 'ENABLED' : 'DISABLED'}`);
        }
    }
});

mqttClient.on('error', (error) => {
    console.error('❌ MQTT Error:', error);
});

mqttClient.on('reconnect', () => {
    console.log('🔄 Reconnecting to MQTT broker...');
});

mqttClient.on('offline', () => {
    console.log('📴 MQTT client offline');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // Handle start command (LED on port 23 + enable button reading)
    socket.on('start', () => {
        console.log('🟢 Start command received from client:', socket.id);
        
        // Initialize or reset session stats
        sessionStats.set(socket.id, {
            startTime: new Date(),
            buttonClicks: [],
            active: true
        });
        
        mqttClient.publish('esp32/led/start', 'START', { qos: 1 });
        console.log('📤 Published START command to esp32/led/start (Enable button reading + LED port 23)');
        console.log('📊 Session started for client:', socket.id);
        
        // Send immediate feedback to client
        socket.emit('commandSent', {
            command: 'START',
            message: 'START command sent - Enabling button reading',
            timestamp: new Date().toISOString()
        });
    });
    
    // Handle stop command (LED on port 22 + disable button reading)
    socket.on('stop', () => {
        console.log('🔴 Stop command received from client:', socket.id);
        
        const session = sessionStats.get(socket.id);
        if (session && session.active) {
            session.active = false;
            const endTime = new Date();
            const duration = Math.floor((endTime - session.startTime) / 1000); // seconds
            
            // Generate session summary
            const summary = {
                startTime: session.startTime.toLocaleString(),
                endTime: endTime.toLocaleString(),
                duration: `${Math.floor(duration / 60)}m ${duration % 60}s`,
                totalClicks: session.buttonClicks.length,
                buttonDetails: []
            };
            
            // Count clicks per button
            const clickCount = {};
            session.buttonClicks.forEach(click => {
                const key = click.button;
                if (!clickCount[key]) {
                    clickCount[key] = {
                        button: key,
                        row: click.row,
                        col: click.col,
                        count: 0,
                        times: []
                    };
                }
                clickCount[key].count++;
                clickCount[key].times.push(click.time);
            });
            
            // Convert to array and sort by button position
            summary.buttonDetails = Object.values(clickCount).sort((a, b) => {
                if (a.row !== b.row) return a.row - b.row;
                return a.col - b.col;
            });
            
            console.log('\n========================================');
            console.log('📊 SESSION SUMMARY - Client:', socket.id);
            console.log('========================================');
            console.log('⏱️  Start Time:', summary.startTime);
            console.log('⏱️  End Time:', summary.endTime);
            console.log('⏱️  Duration:', summary.duration);
            console.log('🔢 Total Button Clicks:', summary.totalClicks);
            console.log('\n📋 Button Click Details:');
            if (summary.buttonDetails.length > 0) {
                summary.buttonDetails.forEach(btn => {
                    console.log(`   Button ${btn.button}: ${btn.count} clicks`);
                    btn.times.forEach((time, i) => {
                        console.log(`      ${i + 1}. ${time}`);
                    });
                });
            } else {
                console.log('   No buttons clicked during this session');
            }
            console.log('========================================\n');
            
            // Send summary to client
            socket.emit('sessionSummary', summary);
        }
        
        mqttClient.publish('esp32/led/stop', 'STOP', { qos: 1 });
        console.log('📤 Published STOP command to esp32/led/stop (Disable button reading + LED port 22)');
        
        // Send immediate feedback to client
        socket.emit('commandSent', {
            command: 'STOP',
            message: 'STOP command sent - Disabling button reading',
            timestamp: new Date().toISOString()
        });
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected:', socket.id);
        // Clean up session data
        sessionStats.delete(socket.id);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mqtt_connected: mqttClient.connected,
        remote_connected: remoteConnected,
        remote_enabled: remoteEnabled,
        timestamp: new Date().toISOString()
    });
});

// API endpoint to enable remote (called when Start Meditation is clicked)
app.post('/api/remote/enable', (req, res) => {
    console.log('🟢 Remote enable request received');
    remoteEnabled = true;
    mqttClient.publish('esp32/led/start', 'START', { qos: 1 });
    res.json({ success: true, enabled: true, message: 'Remote enabled' });
});

// API endpoint to disable remote (called when meditation ends)
app.post('/api/remote/disable', (req, res) => {
    console.log('🔴 Remote disable request received');
    remoteEnabled = false;
    mqttClient.publish('esp32/led/stop', 'STOP', { qos: 1 });
    res.json({ success: true, enabled: false, message: 'Remote disabled' });
});

// API endpoint to check remote status
app.get('/api/remote/status', (req, res) => {
    res.json({
        connected: remoteConnected,
        enabled: remoteEnabled,
        mqtt_connected: mqttClient.connected
    });
});

// Start server
const PORT = process.env.PORT || 4000; // Changed to 4000 to avoid conflict with Next.js
server.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 MQTT Bridge Server running on http://localhost:' + PORT);
    console.log('📱 Device: ESP32 with 9-button remote');
    console.log('📡 MQTT Topics: esp32/buttons, esp32/button/[row]/[col]');
    console.log('🎮 Button Layout (PAHM Matrix):');
    console.log('   [Nostalgia] [Likes]    [Anticipation]  <- Row 0');
    console.log('   [Past]      [Present]  [Future]        <- Row 1');
    console.log('   [Regret]    [Dislikes] [Worry]         <- Row 2');
    console.log('💡 LEDs: Port 12=START (Green), Port 13=STOP (Red)');
    console.log('🌐 Next.js API: ' + NEXTJS_API);
    console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹️  Shutting down gracefully...');
    mqttClient.end();
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
