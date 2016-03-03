/* jshint -W097 */// jshint strict:false
/*jslint node: true */


"use strict";

var fritz = require('smartfritz-promise');


// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils

// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.template.0
var adapter = utils.adapter('fritzdect');

// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    // Warning, obj can be null if it was deleted
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

// is called if a subscribed state changes
adapter.on('stateChange', function (id, state) {
    // Warning, state can be null if it was deleted
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));

    // you can use the ack flag to detect if it is status (true) or command (false)
    if (state && !state.ack) {
        adapter.log.info('ack is not set!');

        var tmp = id.split('.');
        var dp = tmp.pop();
        adapter.log.info('dp'+dp);
        var idx = tmp.pop();
        id = idx.replace(/DECT200_/g,''); //Switch
        adapter.log.debug('SWITCH ID: '+ id + 'identified');

        if (dp == 'state') {
            if (state.val == 0) {
                if (id==="GuestWLAN"){
                    fritz.getSessionID(username, password, function (sid) {
                        fritz.setGuestWLan(sid, state.val, function (sid) {
                            adapter.log.info('Turned WLAN ' + id + ' off');
                        });
                    });

                }else {
                    fritz.getSessionID(username, password, function (sid) {
                        fritz.setSwitchOff(sid, id, function (sid) {
                            adapter.log.info('Turned switch ' + id + ' off');
                        });
                    });
                }
            }
            else if (state.val == 1) {
                if (id==="GuestWLAN"){
                    fritz.getSessionID(username, password, function (sid) {
                        fritz.setGuestWLan(sid, state.val, function (sid) {
                            adapter.log.info('Turned WLAN ' + id + ' on');
                        }, moreWLAN);
                    });
                }else {
                    fritz.getSessionID(username, password, function (sid) {
                        fritz.setSwitchOn(sid, id, function (sid) {
                            adapter.log.info('Turned switch ' + id + ' on');
                        });
                    });
                }

            }
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    adapter.log.info('entered ready');
    main();
});

function main() {
    
    
var username = "admin";
var password = adapter.config.fritz_pw || "9999";
var moreParam = { url: "192.168.178.1" };

    function insertDECT200(id){
        adapter.log.info('setting up object '+ id);

            var newId = id;
            adapter.setObject('DECT200_' + newId, {
                type: 'channel',
                common: {
                    name: 'FritzDECT200 ' + newId,
                    role: 'switch'
                },
                native: {
                    "aid": newId
                }
            });
            adapter.setObject('DECT200_' + newId +'.state', {
                type: 'state',
                common: {
                    "name":  "Switch on/off",
                    "type": "boolean",
                    "read": true,
                    "write": true,
                    "role": "switch",
                    "desc":  "Switch on/off"
                },
                native: {
                }
            });
            adapter.setObject('DECT200_' + newId +'.present', {
                type: 'state',
                common: {
                    "name":  "Switch present",
                    "type": "boolean",
                    "read": true,
                    "write": false,
                    "role": "indicator.connected",
                    "desc":  "Switch present"
                },
                native: {
                }
            });
            adapter.setObject('DECT200_' + newId +'.mode', {
                type: 'state',
                common: {
                    "name":  "Switch mode", //auto or man
                    "type": "boolean",
                    "read": true,
                    "write": false,
                    "role": "indicator",
                    "desc":  "Switch mode"
                },
                native: {
                }
            });
            adapter.setObject('DECT200_' + newId +'.lock', {
                type: 'state',
                common: {
                    "name":  "Switch mode", //switch lock 0=unlocked, 1=locked
                    "type": "number",
                    "read": true,
                    "write": false,
                    "role": "indicator"
                },
                native: {
                }
            });
            adapter.setObject('DECT200_' + newId +'.temp', {
                type: 'state',
                common: {
                    "name":  "Switch Temp",
                    "type": "number",
                    "unit": "°C",
                    "read": true,
                    "write": false,
                    "role": "value.temperature",
                    "desc":  "Switch Temp"
                },
                native: {
                }
            });
            adapter.setObject('DECT200_' + newId +'.power', {
                type: 'state',
                common: {
                    "name":  "Switch act power",
                    "type": "number",
                    "unit": "mW",
                    "min": 0,
                    "max": 4000,
                    "read": true,
                    "write": false,
                    "role": "value",
                    "desc":  "Switch act power"
                },
                native: {
                }
            });
            adapter.setObject('DECT200_' + newId +'.energy', {
                type: 'state',
                common: {
                    "name":  "Switch total energy",
                    "type": "number",
                    "unit": "Wh",
                    "min": 0,
                    "read": true,
                    "write": false,
                    "role": "value.power.consumption",
                    "desc":  "Switch total energy"
                },
                native: {
                }
            });
    }

        fritz.getSessionID(username, password, function(sid){
        adapter.log.info('SID : '+sid);
        fritz.getSwitchList(sid,function(listinfos){
            adapter.log.info("Switches AIDs: "+listinfos);
            insertDECT200(listinfos);
        });
    }, moreParam);

    fritz.getSessionID(username, password, function(sid){
        fritz.getGuestWLan(sid,function(listinfos){
            adapter.log.info("WLANs: "+JSON.stringify(listinfos));
        });
    }, moreParam);

    fritz.getSessionID(username, password, function(sid){
        console.log('sid2 : '+ sid);
        fritz.getSwitchState(sid, '087610006102', function(sid){
            adapter.log.info('state :' + sid);
            adapter.setState('DECT200_'+ '087610006102' +'.state', {val: sid, ack: true});
        });
        fritz.getSwitchPresence(sid, '087610006102', function(sid){
            adapter.log.info('present :' + sid);
            adapter.setState('DECT200_'+ '087610006102' +'.present', {val: sid, ack: true});
        });
        fritz.getTemperature(sid, '087610006102', function(sid){
            adapter.log.info('temp :' + sid);
            adapter.setState('DECT200_'+ '087610006102' +'.temp', {val: sid, ack: true});
        });
        fritz.getSwitchPower(sid, '087610006102', function(sid){
            adapter.log.info('pwer :' + sid);
            adapter.setState('DECT200_'+ '087610006102' +'.power', {val: sid, ack: true});
        });
        fritz.getSwitchEnergy(sid, '087610006102', function(sid){
            adapter.log.info('energy :' + sid);
            adapter.setState('DECT200_'+ '087610006102' +'.energy', {val: sid, ack: true});
        });

    }, moreParam);

  
    // in this template all states changes inside the adapters namespace are subscribed
    adapter.subscribeStates('*');


    /**
     *   setState examples
     *
     *   you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
     *
     */

    // the variable testVariable is set to true as command (ack=false)
    adapter.setState('testVariable', true);

    // same thing, but the value is flagged "ack"
    // ack should be always set to true if the value is received from or acknowledged from the target system
    adapter.setState('testVariable', {val: true, ack: true});

    // same thing, but the state is deleted after 30s (getState will return null afterwards)
    adapter.setState('testVariable', {val: true, ack: true, expire: 30});



}
