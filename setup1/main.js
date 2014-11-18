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

/* Network config and settings */
var port = 1337;

/* Watches */
var touch_watch = null;
var other_watch = null;

/* Intervals */
var other_sensor_interval = 100; /* 100 milliseconds */
var touch_sensor_interval = 500; /* 500 milliseconds */

/* PIN config */
//GROVE Kit Shield D0 --> GPIO0
//GROVE Kit Shield D1 --> GPIO1
/* Using Digital pin #0 (D0) for Pulsing reading */
var pulse_pin = new mraa.Gpio(0); //setup digital read on Digital pin #0 (D0)
pulse_pin.dir(mraa.DIR_IN); //set the gpio direction to input

/* Using Analog pin #0 (A0) for Temperature reading */
//GROVE Kit A0 Connector --> Aio(0)
var temp_pin = new mraa.Aio(0);

/* Use touch sensor to activate data watch */
/* Using Digital pin #2 (D2) for Touch reading */
var touch_pin = new mraa.Gpio(2);
touch_pin.dir(mraa.DIR_IN);

/* Use buzzer to indicate that data watch is activated */
/* Buzer is connected to D3 */
var buzzer_pin = new mraa.Gpio(3);
buzzer_pin.dir(mraa.DIR_OUT);
/* Turn off buzzer on start */
buzzer_pin.write(0);

/* Do Not start other sensors on init */
//periodicActivity(); //call the periodicActivity function

function convertPulseValue(v) {
	return v;
}

function convertTempValue(v) {
	var B = 3975;
	var resistance = (1023 - v) * 10000 / v; //get the resistance of the sensor;
	console.log("Resistance: " + resistance);
	var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
	console.log("Celsius Temperature "+celsius_temperature); 
	var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
	console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
	return fahrenheit_temperature;
}
	
function periodicActivity(socket) //
{
  var pulse_value =  pulse_pin.read(); //read the pulse reading
  console.log('Gpio 1 is ' + pulse_value); //write the read value out to the console
  var converted_pulse_value = convertPulseValue(pulse_value);
  console.log('Converted Pulse value = ' + converted_pulse_value);
  socket.emit("message", converted_pulse_value);
    
  var temp_value = temp_pin.read(); //read the temperature reading
  console.log("Aio 0 is: " + temp_value);
  var converted_temp_value = convertTempValue(temp_value);
  console.log('Converted temp value = ' + converted_temp_value);
	
  socket.emit("message", {'pulse': converted_pulse_value, 'temp': converted_temp_value});
	
  /* Push values to client */

  other_watch = setTimeout(periodicActivity, other_sensor_interval); //call the indicated function after 1 second (1000 milliseconds)
  
}

function startSensorWatch(socket) {
    'use strict';
    var touch_value = 0, last_touch_value;

	/* Check for touch every 500 milliseconds */
	/* If touch is sensed, start watching other sensors for readings */
    touch_watch = setInterval(
		function () {
			touch_value = touch_pin.read();
			if (touch_value === 1 && last_touch_value === 0) {
				console.log("Touch activated...");
				/* Notify client */
				socket.emit('message', "on");
				buzzer_pin.write(touch_value);
				if (other_watch !== null) {
					clearInterval(other_watch);
					other_watch = null;
				} else {
					/* Start watching other sensors */
					periodicActivity(socket);
				}
			} else if (touch_value === 0 && last_touch_value === 1) {
				//console.log("Touch deactivated...");
				/* Do not notify client */
				//socket.emit('message', "off");
				//buzzer_pin.write(touch_value);
			}
			last_touch_value = touch_value;
		},
		touch_sensor_interval
	); 
}

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
    startSensorWatch(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('Client disconnected');
    });
});