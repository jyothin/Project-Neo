/*
 * Please see the included README.md file for license terms and conditions.
 */


/*jslint browser:true, devel:true, white:true, vars:true */
/*global $:false, intel:false app:false, dev:false, cordova:false */

var IOT_IP_ADDRESS = '';
var IOT_PORT = 1337;
var socket = null;

// This file contains your event handlers, the center of your application.
// NOTE: see app.initEvents() in init-app.js for event handler initialization code.

function connectHandler() {
    "use strict" ;

    var ua = navigator.userAgent ;
    var str ;

	/* On device */
    if( window.Cordova && dev.isDeviceReady.c_cordova_ready__ ) {
            str = "It worked! Cordova device ready detected at " + dev.isDeviceReady.c_cordova_ready__ + " milliseconds!" ;
    }
	/* On development server */
    else if( window.intel && intel.xdk && dev.isDeviceReady.d_xdk_ready______ ) {
            str = "It worked! Intel XDK device ready detected at " + dev.isDeviceReady.d_xdk_ready______ + " milliseconds!" ;
    }
	/* Neither of the above */
    else {
        str = "Bad device ready, or none available because we're running in a browser." ;
    }

    console.log(str);
	
	/* Connect to IoT device */

	
	socket = window.io(IOT_IP_ADDRESS+':'+IOT_PORT);
	socket.connect();
	
	socket.on('connect', function () {
		console.log('Connected to server...');
	});
	
	socket.on('message', function (event) {
		console.log("received message: "+event);
		
		var pulse = event.pulse;
		var temp = event.temp;
		
		var table = document.getElementById('readings');
		var tr = document.createElement('tr');
		table.appendChild(tr);
		
		var td = document.createElement('td');
		td.setAttribute('class', 'readings');
		tr.appendChild(td);
		var text = document.createTextNode(pulse);
		td.appendChild(text);
		
		td = document.createElement('td');
		td.setAttribute('class', 'readings');
		tr.appendChild(td);
		text = document.createTextNode(pulse);
		td.appendChild(text);
		
	});

	//Attach a 'disconnect' event handler to the socket
	socket.on('disconnect', function () {
		console.log('Disconnected from server...');
	});

}

function sendMsgToClient(msg) {
	socket.send(msg);
}

function disconnectHandler() {
	"use strict" ;

	if(socket !== null) {
		socket.disconnect();
	}
	
}

// ...additional event handlers here...
