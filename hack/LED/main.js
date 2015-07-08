/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
/*global */

/*
A simple node.js application intended to blink the onboard LED on the Intel based development boards such as the Intel(R) Galileo and Edison with Arduino breakout board.

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
console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the Intel XDK console
console.log("Ok to go");

var led_sensor_interval = 1000;
var led_pin = new mraa.Gpio(2); //LED hooked up to digital pin 4 (or built in pin on Galileo Gen1 & Gen2)
led_pin.dir(mraa.DIR_OUT); //set the gpio direction to output
var led_state = true; //Boolean to hold the state of Led
function periodicActivityLED()
{
  led_pin.write(led_state? 1 : 0); //if led_state is true then write a '1' (high) otherwise write a '0' (low)
  led_state = !led_state; //invert the ledState
  setTimeout(periodicActivityLED, led_sensor_interval); //call the indicated function after 1 second (1000 milliseconds)
}
periodicActivityLED();

var touch_sensor_interval = 500;
var touch_pin = new mraa.Gpio(5);
touch_pin.dir(mraa.DIR_IN);
function startTouchWatch(socket) {
    'use strict';
    var touch_value = 0, last_touch_value;

    setInterval(
		function () {
			touch_value = touch_pin.read();
			//console.log("touch_value = " + touch_value);
			if (touch_value === 1 && last_touch_value === 0) {
				console.log("Touch activated...");
				// Notify client
				//if(socket) {
				//	socket.emit('message', 'on');
				//}
				//buzzer_pin.write(touch_value);
				//if (other_watch !== null) {
				//	clearTimeout(other_watch);
				//	other_watch = null;
				//} else {
				//	// Start watching other sensors
				//	periodicActivity(socket);
				//}
			} else if (touch_value === 0 && last_touch_value === 1) {
				console.log("Touch deactivated...");
				//buzzer_pin.write(touch_value);
			}
			last_touch_value = touch_value;
		},
		touch_sensor_interval
	);
}
startTouchWatch();

//var myOnboardLed = new mraa.Gpio(6); //LED hooked up to digital pin 13 (or built in pin on Galileo Gen1 & Gen2)
//myOnboardLed.dir(mraa.DIR_IN); //set the gpio direction to output
//var ledState = true; //Boolean to hold the state of Led

//periodicActivity(); //call the periodicActivity function
/*
function periodicActivity()
{
  myOnboardLed.write(ledState?1:0); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
  //ledState = !ledState; //invert the ledState
  setTimeout(periodicActivity,1000); //call the indicated function after 1 second (1000 milliseconds)
}
*/

var BPM = 0;
var SPO2 = 0;
var i = 0;

function getBPM() {
  return BPM;
}

function getOxygenSaturation() {
  return SPO2;
}

var pulse_pin = new mraa.Aio(0); //setup access analog input Analog pin #0 (A0)
var beats = 0;
var counted = false;
function resetBeats() {
    if(beats > 0) {
        console.log("Resetting beats..");
        beats = 0;
        setTimeout(resetBeats, 60000);
    }
}
function getPulseRate() {
    
    var pulseValue = pulse_pin.read(); //read the value of the analog pin
    /*
    if (pulseValue > 156 && counted === false){
        beats = beats + 1;
        counted = true;
    } else if(pulseValue < 146) {
        counted = false;
    }
    */
    /*
    if(pulseValue > 156) {
        beats = beats + 1;
    }
    console.log("pulseValue = "+pulseValue+", beats = "+beats);
    */
    //setTimeout(getPulseRate, 300);
    
    beats = pulseValue - 210;
}
/*
function segToNumber(A, B, C, D, E, F, G){
    if ((A === 1) && (B === 1) && (C === 1) && (D === 0) && (E === 1) && (F === 1) && (G === 1)) {
        return 0;
    } else if ((A === 0) && (B === 1) && (C === 0) && (D === 0) && (E === 1) && (F === 0) && (G === 0)) {  
        return 1;
    } else if ((A === 1) && (B === 1) && (C === 0) && (D === 1) && (E === 0) && (F === 1) && (G === 1)) { 
        return 2;
    } else if ((A === 1) && (B === 1) && (C === 0) && (D === 1) && (E === 1) && (F === 0) && (G === 1)) { 
        return 3;
    } else if ((A === 0) && (B === 1) && (C === 1) && (D === 1) && (E === 1) && (F === 0) && (G === 0)) { 
        return 4;
    } else if ((A === 1) && (B === 0) && (C === 1) && (D === 1) && (E === 1) && (F === 0) && (G === 1)) { 
        return 5;
    } else if ((A === 1) && (B === 0) && (C === 1) && (D === 1) && (E === 1) && (F === 1) && (G === 1)) { 
        return 6;
    } else if ((A === 1) && (B === 1) && (C === 0) && (D === 0) && (E === 1) && (F === 0) && (G === 0)) {
        return 7;  
    } else if ((A === 1) && (B === 1) && (C === 1) && (D === 1) && (E === 1) && (F === 1) && (G === 1)) { 
        return 8;
    } else if ((A === 1) && (B === 1) && (C === 1) && (D === 1) && (E === 1) && (F === 0) && (G === 1)) { 
        return 9;	
    } else  {
        return 0;
    }
}

var digitalIO_13 = new mraa.Gpio(13);
digitalIO_13.dir(mraa.DIR_IN);
var digitalIO_12 = new mraa.Gpio(12);
digitalIO_12.dir(mraa.DIR_IN);
var digitalIO_11 = new mraa.Gpio(11);
digitalIO_11.dir(mraa.DIR_IN);
var digitalIO_10 = new mraa.Gpio(10);
digitalIO_10.dir(mraa.DIR_IN);
var digitalIO_9 = new mraa.Gpio(9);
digitalIO_9.dir(mraa.DIR_IN);
var digitalIO_8 = new mraa.Gpio(8);
digitalIO_8.dir(mraa.DIR_IN);
var digitalIO_7 = new mraa.Gpio(7);
digitalIO_7.dir(mraa.DIR_IN);

var digito = [];

var A = 0;
var B = 0;
var C = 0;
var D = 0;
var E = 0;
var F = 0;
var G = 0;

var i;
function delay300() {
    if(i < 41) {
    //for(var ii=0; ii<41; ii++) {
        
        A = (digitalIO_13.read() === 1 ? 0: 1); //if ledState is true then write a '1' (high) otherwise write a '0' (low)    
        B = (digitalIO_12.read() === 1? 0: 1); //if ledState is true then write a '1' (high) otherwise write a '0' (low)  
        C = (digitalIO_11.read() === 1? 0: 1); //if ledState is true then write a '1' (high) otherwise write a '0' (low)  
        D = (digitalIO_10.read() === 1? 0: 1); //if ledState is true then write a '1' (high) otherwise write a '0' (low)  
        E = (digitalIO_9.read() === 1? 0: 1); //if ledState is true then write a '1' (high) otherwise write a '0' (low)  
        F = (digitalIO_8.read() === 1? 0: 1); //if ledState is true then write a '1' (high) otherwise write a '0' (low)
        G = (digitalIO_7.read() === 1? 0: 1); //if ledState is true then write a '1' (high) otherwise write a '0' (low)  

        console.log("i="+i+": A="+A+": B="+B+": C="+C+": D="+D+": E="+E+": F="+F+": G="+G);
        
        digito[i] = segToNumber(A, B, C, D, E, F, G);
		i = i + 1;
		
		setTimeout(delay300(), 300);

    }
}

function readPulsioximeter() {    

    i = 0;
	A = 0;
	B = 0;
	C = 0;
	D = 0;
	E = 0;
	F = 0;
	G = 0;

	delay300();
    
    //SPO2 = 10 * digito[25] + digito[20];
    //BPM  = 100 * digito[19] + 10 * digito[2] + digito[0];

}


var cnt = 0;
function periodicActivityPulse()
{
  cnt = cnt + 1;
	
  if(cnt === 5) {
    console.log('cnt = '+cnt);
    cnt = 0;
    readPulsioximeter();
  }
}
//periodicActivityPulse();
*/
/*
var digitalIO_6 = new mraa.Gpio(6);
digitalIO_6.dir(mraa.DIR_IN);
*/
/*
setInterval(function () {
	if(digitalIO_6.read()) {
		console.log("Got interrupt!");
		periodicActivityPulse();
	}
}, 100);
*/

var b_temp_pin = new mraa.Aio(3); //setup access analog input Analog pin #0 (A0)

var Temperature; //Corporal Temperature 
var Resistance;  //Resistance of sensor.
var ganancia = 5.0;
var Vcc = 3.3;
var RefTension = 3.0; // Voltage Reference of Wheatstone bridge.
var Ra = 4700.0; //Wheatstone bridge resistance.
var Rc = 4700.0; //Wheatstone bridge resistance.
var Rb = 821.0; //Wheatstone bridge resistance.

var B = 3975;

function getBodyTemperature() {
	//Local variables
		
		var sensorValue = b_temp_pin.read(); //read the value of the analog pin
		/*
		var voltage2 = (sensorValue * Vcc) / 1023; // binary to voltage conversion  

		// Wheatstone bridge output voltage.
		voltage2 = voltage2 / ganancia;
	
		// Resistance sensor calculate 
		var aux = (voltage2 / RefTension) + Rb / (Rb + Ra);
		Resistance = Rc * aux / (1 - aux);
	
		if (Resistance >= 1822.8) {
			// if temperature between 25ºC and 29.9ºC. R(tª)=6638.20457*(0.95768)^t
			Temperature = Math.log(Resistance / 6638.20457) / Math.log(0.95768);  
		} else {
			if (Resistance >= 1477.1) {
				// if temperature between 30ºC and 34.9ºC. R(tª)=6403.49306*(0.95883)^t
				Temperature = Math.log(Resistance / 6403.49306) / Math.log(0.95883);
			} else {
				if (Resistance >= 1204.8) {
					// if temperature between 35ºC and 39.9ºC. R(tª)=6118.01620*(0.96008)^t
					Temperature = Math.log(Resistance / 6118.01620) / Math.log(0.96008);
				} else {
					if (Resistance >= 988.1) {
						// if temperature between 40ºC and 44.9ºC. R(tª)=5859.06368*(0.96112)^t
						Temperature = Math.log(Resistance / 5859.06368) / Math.log(0.96112);
					} else {
						if (Resistance >= 811.7) {
							// if temperature between 45ºC and 50ºC. R(tª)=5575.94572*(0.96218)^t
							Temperature = Math.log(Resistance / 5575.94572) / Math.log(0.96218);
						}
					}
				}
			}
		}
        
		return Temperature;
        */
		
        Resistance = (1023 - sensorValue) * 10000 / sensorValue; //get the resistance of the sensor;
        //console.log("Resistance: "+resistance);
        var celsius_temperature = 1 / (Math.log(Resistance / 10000) / B + 1 / 298.15) - 273.15;//convert to temperature via datasheet ;
        //console.log("Celsius Temperature "+celsius_temperature); 
        var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
        //console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
		return fahrenheit_temperature;
}

var temp_pin = new mraa.Aio(0);
function getAmbientTemperature() {
	var temp_value = temp_pin.read();
	var B = 3975;
	var resistance = (1023 + temp_value) * 10000 / temp_value; //get the resistance of the sensor;
	//console.log("Resistance: " + resistance);
	var celsius_temperature = 1 / (Math.log(resistance / 10000) / B + 1 / 298.15) - 273.15; //convert to temperature via datasheet
	//console.log("Celsius Temperature "+celsius_temperature);
	var fahrenheit_temperature = (celsius_temperature * (9 / 5)) + 32;
	//console.log("Fahrenheit Temperature: " + fahrenheit_temperature);
	return celsius_temperature;
}


var lcd_lib = require("jsupm_i2clcd");
var lcd_pin = new lcd_lib.Jhd1313m1(0, 0x3E, 0x62);
lcd_pin.setCursor(0, 0);

var day = 86400000;
function loop() {
    /*
	if(i === 41) {
		i = 0;
		console.log(digito[25]+", "+digito[20]+", "+digito[19]+", "+digito[2]+", "+digito[0]);
		SPO2 = 10 * digito[25] + digito[20];
		BPM  = 100 * digito[19] + 10 * digito[2] + digito[0];
		console.log("BPM: "+getBPM());
		console.log("SPO2: "+getOxygenSaturation());
	}
    */
	
    var b_temp = getBodyTemperature();
	console.log("Body temp (F): " + b_temp.toString());
    
    //resetBeats();
    //getPulseRate();
    //console.log("Beats: " + beats);
	
	//console.log("Ambient temp (C): " + getAmbientTemperature());
    /*
    console.log(new Date().getTime() - day);
    var data = [{
        sensorName : "bTemp",
        sensorType: "temperature.v1.0",
        observations: [{
            on: new Date().getTime() - (day),
            value: b_temp.toString()
        }]
    }];
    //sendToDashboard(data);
    */

    lcd_pin.write("Hello World!     TesserIoT ");
    
}
//setInterval(loop, 5000);

console.log("Running...");

/*

// Sample data, replace it desired values
*/
/*
var g_data = [{
    sensorName : "bTemp",
    sensorType: "temperature.v1.0",
    observations: [{
        on: new Date().getTime() - (day),
        value: "22.1"
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
        client.send(mesg, 0, mesg.length, options.port, options.host, function(err, bytes) {
            if (err) throw err;
            console.log('UDP message sent to ' + options.host +':'+ options.port);
            // client.close();

        });
    }
});

function sendToDashboard(data) {
    data.forEach(function(item) {
        //registerNewSensor(item.sensorName, item.sensorType, function () {
            item.observations.forEach(function (observation) {
                setTimeout(function () {
                    sendObservation(item.sensorName, observation.value, observation.on);
                }, 5000);
            });
        //});
    });
}
*/

var util = require('util'),
    logger = require("./lib/logger").init(),
    EventEmitter = require('events').EventEmitter;

var MyObservationEmitter = function(){

	var me = this;

	me.get = function(config){
		throw "Not Implemented";
	};

	me.sub = function(config){
		setTimeout(function () {
            var _b_temp = getBodyTemperature().toString();
			me.emit("data", [{
                "componentId": config.component,
                "on": (new Date).getTime(),
                //"value": Math.floor((Math.random() * 100) + 1).toString()
              "value": _b_temp
            }]);
            me.sub(config);
            lcd_pin.write("B Temp: "+ _b_temp+" ");
		}, 5000);
		return me;
	}; // sub

}; // object

util.inherits(MyObservationEmitter, EventEmitter);
var observationEmitter = new MyObservationEmitter();

module.exports = {
    get: observationEmitter.get,
    sub: observationEmitter.sub
};


// imports
var config = require("./configs/app"),
    //provider = require("./providers/event-provider"),
    logger = require("./lib/logger").init(),
    cloud = require("./index"),
    events = require("events");

// global errors
process.on("uncaughtException", function(err) {
    logger.error("UncaughtException:", err.message);
    logger.error(err.stack);
    process.exit(1);
});

var err_handler = function(err, data){
  if (err) throw err;
};

logger.info("Cloud Setup...");
cloud.setup(config, function(err, state){
  if (err) throw err;
  if (state){
    logger.debug("State: %s", state);

    logger.info("Subscribe to events...");
    //provider.sub(state).on("data", function(observations){
    observationEmitter.sub(state).on("data", function(observations){  

      logger.info("Submit data: ", observations);
      cloud.submitObservations(state, observations, err_handler);

    }); // sub

  } // data

}); // setup

//"account": "89d9776e-9dfe-4855-9c58-24b6f40292c1"

