/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
/*global */

/*
MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/intel-xdk-iot-edition-nodejs-templates
*/

var mraa = require('mraa'); //require mraa
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console
console.log('Ok to go...');

/* Network config and settings */
var port = 1337;

/* Watches */
var touch_watch = null;
var other_watch = null;

/* Intervals */
var led_sensor_interval = 1000;
var touch_sensor_interval = 500;
var other_sensor_interval = 5000;

/* PIN config */
var led_pin = new mraa.Gpio(4); //LED hooked up to digital pin 4 (or built in pin on Galileo Gen1 & Gen2)
led_pin.dir(mraa.DIR_OUT); //set the gpio direction to output
var led_state = true; //Boolean to hold the state of Led

/* Use touch sensor to activate data watch */
/* Using Digital pin #5 (D5) for Touch reading */
var touch_pin = new mraa.Gpio(5);
touch_pin.dir(mraa.DIR_IN);

/* Use buzzer to indicate that data watch is activated */
/* Buzer is connected to D6 */
var buzzer_pin = new mraa.Gpio(6);
buzzer_pin.dir(mraa.DIR_OUT);
/* Turn off buzzer on start */
buzzer_pin.write(0);

//GROVE Kit Shield D0 --> GPIO0
//GROVE Kit Shield D1 --> GPIO1
/* Using Digital pin #0 (D0) for Pulsing reading */
var pulse_pin = new mraa.Gpio(2); //setup digital read on Digital pin #0 (D0)
pulse_pin.dir(mraa.DIR_IN); //set the gpio direction to input

/* Using Analog pin #0 (A0) for Temperature reading */
//GROVE Kit A0 Connector --> Aio(0)
var temp_pin = new mraa.Aio(0);

function periodicActivityLED()
{
  led_pin.write(led_state? 1 : 0); //if led_state is true then write a '1' (high) otherwise write a '0' (low)
  led_state = !led_state; //invert the ledState
  setTimeout(periodicActivityLED, led_sensor_interval); //call the indicated function after 1 second (1000 milliseconds)
}
periodicActivityLED();

function convertPulseValue(v) {
	return v;
}

function convertTempValue(v) {
	var B = 3975;
	var resistance = (1023 + v) * 10000 / v; //get the resistance of the sensor;
	console.log("Resistance: " + resistance);
	var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15; //convert to temperature via datasheet
	console.log("Celsius Temperature "+celsius_temperature);
	var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
	console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
	return fahrenheit_temperature;
}

function periodicActivity(socket) {
    //var pulse_value =  pulse_pin.read(); //read the pulse reading
    var pulse_value = 0.0;
    //console.log('pulse_value is ' + pulse_value); //write the read value out to the console
    var converted_pulse_value = convertPulseValue(pulse_value);
    //console.log('Converted Pulse value = ' + converted_pulse_value);
	
    var temp_value = temp_pin.read(); //read the temperature reading
    console.log("temp_value is: " + temp_value);
    var converted_temp_value = convertTempValue(temp_value);
    console.log('Converted temp value = ' + converted_temp_value);

    // Push values to client
	if(socket) {
        //socket.emit("reading", {'pulse': converted_pulse_value, 'temp': converted_temp_value});
	}

    other_watch = setTimeout(periodicActivity(socket), other_sensor_interval); //call the indicated function after 1 second (1000 milliseconds)
}
//periodicActivity(null); //call the periodicActivity function

function startTouchWatch(socket) {
    'use strict';
    var touch_value = 0, last_touch_value;

	// Check for touch every 500 milliseconds
	// If touch is sensed, start watching other sensors for readings
    touch_watch = setInterval(
		function () {
			touch_value = touch_pin.read();
			//console.log("touch_value = " + touch_value);
			if (touch_value === 1 && last_touch_value === 0) {
				console.log("Touch activated...");
				// Notify client
				if(socket) {
					socket.emit('message', 'on');
				}
				buzzer_pin.write(touch_value);
				if (other_watch !== null) {
					clearTimeout(other_watch);
					other_watch = null;
				} else {
					// Start watching other sensors
					periodicActivity(socket);
				}
			} else if (touch_value === 0 && last_touch_value === 1) {
				buzzer_pin.write(touch_value);
			}
			last_touch_value = touch_value;
		},
		touch_sensor_interval
	); 
}
//startTouchWatch(null);

//Create Socket.io server
var http = require('http');
var app = http.createServer(function (req, res) {
  // req - request
  // res - response
    'use strict';
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Watching for incoming connections...');
}).listen(port);
var io = require('socket.io')(app);

//Attach a 'connection' event handler to the client
io.on('connection', function (socket) {
    'use strict';
    console.log('Client connected');
    //Emits an event along with a message
    socket.emit('connected', 'Connected');

    //Start watching Sensors connected to Galileo board
    startTouchWatch(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('Client disconnected');
    });
});


/* Common for UDP and TCP */
/*
var day = 86400000;
// Sample data, replace it desired values
var data = [{
    sensorName : "actuator1",
    sensorType: "control.v1.0",
    observations: [{
        on: new Date().getTime() - (day * 3),
        value: "10"
    },{
        on: new Date().getTime() - (day * 2),
        value: "20"
    },{
        on: new Date().getTime() - (day),
        value: "30"
    }]
},{
    sensorName : "hum-sensor1",
    sensorType: "humidity.v1.0",
    observations: [{
        on: new Date().getTime() - (day * 3),
        value: "90"
    },{
        on: new Date().getTime() - (day * 2),
        value: "50"
    },{
        on: new Date().getTime() - (day),
        value: "80"
    }]
},{
    sensorName : "temp-sensor",
    sensorType: "temperature.v1.0",
    observations: [{
        on: new Date().getTime() - (day * 3),
        value: "10"
    },{
        on: new Date().getTime() - (day * 2),
        value: "20"
    },{
        on: new Date().getTime() - (day),
        value: "30"
    }]
},{
    sensorName : "hum-sensor",
    sensorType: "humidity.v1.0",
    observations: [{
        on: new Date().getTime() - (day * 3),
        value: "90"
    },{
        on: new Date().getTime() - (day * 2),
        value: "50"
    },{
        on: new Date().getTime() - (day),
        value: "80"
    }]
}];
*/


/* Using iot-agent UDP */
/*
var dgram = require('dgram');
var client = dgram.createSocket('udp4');

// UDP Options
var options = {
    host : '127.0.0.1',
    port : 41234
};

function registerNewSensor(name, type, callback){
    var msg = JSON.stringify({
        n: name,
        t: type
    });

    var sentMsg = new Buffer(msg);
    console.log("Registering sensor: " + sentMsg);
    client.send(sentMsg, 0, sentMsg.length, options.port, options.host, callback);
}

function sendObservation(name, value, on){
    var msg = JSON.stringify({
        n: name,
        v: value,
        on: on
    });

    var sentMsg = new Buffer(msg);
    console.log("Sending observation: " + sentMsg);
    client.send(sentMsg, 0, sentMsg.length, options.port, options.host);
}

client.on("message", function(mesg, rinfo){
    console.log('UDP message from %s:%d', rinfo.address, rinfo.port);
    var a = JSON.parse(mesg);
    console.log(" m ", JSON.parse(mesg));

    if (a.b == 5) {
        client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + HOST +':'+ PORT);
            // client.close();

        });
    }
});


data.forEach(function(item) {
    registerNewSensor(item.sensorName, item.sensorType, function () {
        item.observations.forEach(function (observation) {
            setTimeout(function () {
                sendObservation(item.sensorName, observation.value, observation.on);
            }, 5000);
        });
    });
});
*/

/* Using iot-agent TCP */
/*
var net = require('net');
var client = new net.Socket();

// TCP Options
var options = {
    host : 'localhost',
    port : 7070
};

function registerNewSensor(name, type, callback){
    var msg = JSON.stringify({
        n: name,
        t: type
    });

    var sentMsg = msg.length + "#" + msg;
    console.log("Registering sensor: " + sentMsg);
    client.write(sentMsg);
    callback();
}

function sendObservation(name, value, on){
    var msg = JSON.stringify({
        n: name,
        v: value,
        on: on
    });

    var sentMsg = msg.length + "#" + msg;
    console.log("Sending observation: " + sentMsg);
    client.write(sentMsg);
}

client.connect(options.port, options.host, function() {
    console.log('Connected');

    data.forEach(function(item){
       registerNewSensor(item.sensorName, item.sensorType, function(){
           item.observations.forEach(function(observation){
               setTimeout(function(){
                   sendObservation(item.sensorName, observation.value, observation.on);
               }, 3000);
           });
       });
    });
});
*/

/* Using iot-agent REST */
/*
var http = require('http'),
    os = require("os"),
    fs =  require("fs");

// Sample data, replace it with sensor call results
var msg = { 
    "s": "temp-sensor", 
    "v": 26.7 
};

// HTTP Headers
var putHeaders = {
    'Content-Type' : 'application/json',
    'Content-Length' : Buffer.byteLength(jsonObj, 'utf8')
};

// HTTP Options 
var putOpts = {
    host : '127.0.0.1',
    port : 8080,
    path : '/data',
    method : 'PUT',
    headers : putHeaders
};

// Do the POST call
var putReq = http.request(putOpts, function(res) {
    console.log("statusCode: ", res.statusCode);
    res.on('data', function(d) {
        console.info('PUT result:\n');
        process.stdout.write(d);
        console.info('\n\nPUT completed');
    });
});

// Write JSON data
putReq.write(jsonObj);
putReq.end();
putReq.on('error', function(e) {
    console.error(e);
});
*/

/* backend-1 DB write */

