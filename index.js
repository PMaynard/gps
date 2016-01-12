#!/usr/bin/env node
process.title = "gps-logging";

var gpsd = require('node-gpsd');
var util = require("util");

var listener = new gpsd.Listener({
    port: 2947,
    hostname: 'localhost',
    logger:  {
        info: function() {},
        warn: console.warn,
        error: console.error
    },
    parse: true
});

listener.connect(function() {
    listener.device();
    listener.watch();
});

listener.on('WATCH', function (raw) {
    util.log("WATCH " + JSON.stringify(raw));
});

listener.on('TPV', function (tpv) {
    util.log("{0} {1} {2} {3} {4} {5}".format([tpv.time, tpv.lat, tpv.lon, tpv.speed, tpv.alt, tpv.climb]));
});

listener.on('ATT', function (att) {
    util.log("ATT " + JSON.stringify(att));
});

listener.on('raw', function (raw) {
    util.log("RAW " + raw);
});

listener.on('INFO', function (info) {
    util.log("INFO " + info);
});

listener.on('VERSION', function (version) {
    util.log("Connected to GPSD Version " + version.release);
});

listener.on('DEVICE', function (device) {
    util.log("Using device " + device.driver + " at " + device.path + " (" + device.activated + ")");
});

listener.on('error', function (err) {
    util.log("ERROR: " + err);
});

/* 
 * Helper function to allow easy format of strings 
 * http://www.codeproject.com/Tips/201899/String-Format-in-JavaScript
 */

String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function(item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = "{";
        } else if (intVal === -2) {
            replace = "}";
        } else {
            replace = "";
        }
        return replace;
    });
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");