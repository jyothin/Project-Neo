//Type Node.js Here :)

function randomString() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var string_length = 16;
	var random_string = '';
	for (var i=0; i<string_length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		random_string += chars.substring(rnum, rnum+1);
	}
	return random_string;
}

// DB methods
var util = require('util');
var events = require('events');

var SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/datastore'
];
var googleapis = require('googleapis');
function authorize() {
    compute = new googleapis.auth.Compute();
    googleapis.options({ auth: compute });
}
authorize();

function DB(datasetId) {
    this.datasetId = datasetId;
    this.authorize();
}
util.inherits(DB, events.EventEmitter);

// Authorize with Datastore API
DB.prototype.authorize = function() {
    // Retrieve credentials from Compute Engine metadata server.
    //this.compute = new googleapis.auth.Compute();
    /*
    this.compute.authorize((function(err) {
        if (err) {
          this.emit('error', err);
          return;
        }
        this.connect();
    }).bind(this));
    */
    //this.connect();
};

// Connect to the Datastore API
DB.prototype.connect = function() {
    // Build the API bindings for the current version.
    /*
    googleapis.discovery('datastore', 'v1beta2')
      .withAuthClient(this.compute)
      .execute((function(err, client) {
        if (err) {
          this.emit('error', err);
          return;
        }
        // Bind the datastore client to datasetId and get the datasets
        // resource.
        this.datastore = client.datastore.withDefaultParams({
            datasetId: this.datasetId}).datasets;
        //this.beginTransaction();
    }).bind(this));
    */
    this.datastore = googleapis.datastore('v1beta2');
    console.log(this.datastore);
};

// Start a new transaction
DB.prototype.beginTransaction = function() {
    this.datastore.beginTransaction({
    }).execute((function(err, result) {
        if(err) {
            this.emit('error', err);
            return;
        }
        this.transaction = result.transaction;
        //this.lookup(sensor);
    }).bind(this));
};

DB.prototype.lookup = function(sensor) {
    // Get entities by key
    this.datastore.lookup({
        readOptions: {
            // Set the transaction, so we get a consistent snapshot of the
            // value at the time the transaction started.
            transaction: this.transaction
        },
        // Add one entity key to the lookup request, with only one
        // 'path' element (i.e. no parent).
        keys: [{ path: [{ kind: 'Readings', name: sensor }] }]
    }).execute((function(err, result) {
        if(err) {
            this.emit('error', err);
            return;
        }
        // Get the entity from the response if found
        if(result.found) {
            this.entity = result.found[0].entity;
        }
        //this.commit();
    }).bind(this));
};

DB.prototype.commit = function(timestamp, sensor, value) {
    if(!this.entity) {
        // If the entity is not found create it
        this.entity = {
            // Set the entity key with only one 'path' element
            key: { path: [{ kind: 'Readings', name: 'sensors' }] },
            // Set the entity properties
            properties: {
                //o_timestamp: { dateTimeValue:  },
                i_timestamp: { stringValue: timestamp },
                sensor: { stringValue: sensor },
                value: { doubleValue: value }
            }
        };
        // Build a mutation to insert the new entity
        mutation = { insert: [this.entity] };
    } else {
        // No mutation if the entity was found
        mutation = null;
    }

    // Commit the transaction and the insert mutation if the
    // entity was not found
    this.datastore.commit({
        transaction: this.transaction,
        mutation: mutation
    }).execute((function(err, result) {
        if(err) {
            this.emit('error', err);
            return;
        }
    }).bind(this));
};


//console.assert(process.argv.length == 3, 'usage: main.js <dataset-id>');
// Get the dataset-id from the command line parameters
//var db = new DB(process.argv[2]);
//db.once('error', function(err) {
//    console.error('DB:', err);
//});

console.log("Initializing webserver");

var PORT = 8080;

var express = require('express');
var app = express();
app.set('port', PORT);

var body_parser = require('body-parser');
app.use(body_parser.json());
app.use(body_parser.urlencoded({
	extended: true,
}));

// Instantiate DB
var DATASET_ID = 'her-web';
var db = new DB(DATASET_ID);
db.once('error', function(err) {
    console.error('DB:', err);
});

// respond with "Hello World!" on the homepage
app.get('/', function (req, res) {
  res.send('The dbIO webapp is up and running\n');
});
// accept POST request on the homepage
/*app.post('/', function (req, res) {
  res.send('Got a POST request');
});*/

// accept PUT request at /sensors
// curl http://localhost:80/sensor -XPUT -d"name=pulse&type=float"
app.put('/sensor', function (req, res) {
	var name = req.body.name;
	var type = req.body.type;
	console.log(name+': '+type);
	res.send({'id': randomString()});
});
		
// accept PUT request at /reading
// curl http://localhost:80/reading -XPUT -d"key=pulse&value=0.234"
app.put('/reading', function (req, res) {
  res.send('Got a PUT request at /reading\n');
  var now = new Date();
  console.log(now.toISOString()+': '+req.body.key+': '+req.body.value);
  sensor = req.body.key;
  value = req.body.value;
  // Store to DB
  //db.beginTransaction();
  //db.lookup(sensor);
  //db.commit(now.toISOString(), sensor, value);
});

// accept DELETE request at /reading
app.delete('/reading', function (req, res) {
  res.send('Got a DELETE request at /reading\n');
});

var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(app.get('port'), function () {
    console.log("Express server listening on port %s.", httpServer.address().port);
});

