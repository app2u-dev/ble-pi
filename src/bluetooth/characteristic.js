const util = require('util');
const bleno = require('@abandonware/bleno');

const fs = require('fs');
const {exec} = require("child_process");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function () {
    CustomCharacteristic.super_.call(this, {
        uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a606',
        properties: ['read', 'write', 'notify'],
    });
    this._value = new Buffer(0);
    this._updateValueCallback = null;
};

util.inherits(CustomCharacteristic, BlenoCharacteristic);

module.exports = CustomCharacteristic;

function getSerial() {
    let fs = require('fs');
    const path = '/sys/firmware/devicetree/base/serial-number';
    return (fs.readFileSync(path,'utf8'));
}
const  serialNumber = getSerial();
let reqInd = 0;
let config = {status: 'none', length: 0, offset: 0, msg: ''};
let country = '';
let ssid = '';
let pass = '';
let tz = '';

/**
 * This will run when a read is performed on this characteristic.
 *
 * It’ll write to the console log, create a buffer with a length of one byte,
 * write a single byte with a value of ‘42’ to that buffer,
 * and finally call the callback function that was passed into the handler with two parameters.
 *
 * @param {*} offset
 * @param {*} callback
 */
CustomCharacteristic.prototype.onReadRequest = function (offset, callback) {
    console.log(`CustomCharacteristic onReadRequest ${reqInd}`);
    if (config.status === "none") {
        exec("ip addr | grep wlan0 | grep inet | awk '{print $2}' | cut -d/ -f1", (error, ip, stderr) => {
            if (error) {
                console.error(`get ip error: ${error.message}`);
                ip = '-';
                // return;
            }
            if (stderr) {
                console.error(`get ip stderr: ${stderr}`);
                ip = '-';
                // return;
            }
            console.log('ip add: ', ip);

            try {
                if (fs.existsSync('/etc/wpa_supplicant/wpa_supplicant.conf')) {
                    //file exists
                    exec("cat /etc/wpa_supplicant/wpa_supplicant.conf | grep ssid | sed 's/ssid=//' ", (error, ssid, stderr) => {
                        if (error) {
                            console.error(`get ssid error: ${error.message}`);
                            // return;
                        }
                        if (stderr) {
                            console.error(`get ssid stderr: ${stderr}`);
                            // return;
                        }
                        console.log('ssid:', ssid);
                        exec('cat /etc/timezone', (error, timezone, stderr) => {
                            if (error) {
                                console.error(`get timezone error: ${error.message}`);
                                // return;
                            }
                            if (stderr) {
                                console.error(`get timezone stderr: ${stderr}`);
                                // return;
                            }
                            console.log('timezone: ', timezone)
                            exec("cat /etc/wpa_supplicant/wpa_supplicant.conf | grep country | sed 's/country=//' ", (error, country, stderr) => {
                                if (error) {
                                    console.error(`get country error: ${error.message}`);
                                    // return;
                                }
                                if (stderr) {
                                    console.error(`get country stderr: ${stderr}`);
                                    // return;
                                }
                                console.log('country: ', country)

                                if (ssid !== '-') {
                                    ssid = ssid.slice(0, -1).trim();
                                    ssid = ssid.slice(1, -1);
                                }
                                if (ip !== '-') ip = ip.slice(0, -1).trim();
                                if (timezone !== '-') timezone = timezone.slice(0, -1).trim();
                                if (country !== '-') country = country.slice(0, -1).trim();
                                // country = country.slice(1, -1);

                                if (reqInd === 0) {
                                    console.log('req = 0 ssid: ', ssid);
                                    let bufSrc = new Buffer.from(`ssid\n${ssid}`);
                                    callback(this.RESULT_SUCCESS, bufSrc);
                                    reqInd++;
                                } else if (reqInd === 1) {
                                    console.log('req = 1 ip: ', ip);
                                    let bufSrc = new Buffer.from(`ip\n${ip}`);
                                    callback(this.RESULT_SUCCESS, bufSrc);
                                    reqInd++;
                                } else if (reqInd === 2) {
                                    console.log('req = 2 timezone: ', timezone);
                                    let bufSrc = new Buffer.from(`tz\n${timezone}`);
                                    callback(this.RESULT_SUCCESS, bufSrc);
                                    reqInd++;
                                } else if (reqInd === 3) {
                                    console.log('req = 3 country: ', country);
                                    let bufSrc = new Buffer.from(`cn\n${country}`);
                                    callback(this.RESULT_SUCCESS, bufSrc);
                                    reqInd = 0;
                                }
                            })
                            // callback(this.RESULT_SUCCESS, new Buffer.from(`{"t":"cg", "l":"${configMesg.length}"}`));
                            // callback(this.RESULT_SUCCESS, new Buffer.from(configMesg));
                        });
                    });
                } else {
                    if (reqInd === 0) {
                        // console.log('req = 0 ssid: ', ssid);
                        let bufSrc = new Buffer.from(`ssid\n-`);
                        callback(this.RESULT_SUCCESS, bufSrc);
                        reqInd++;
                    } else if (reqInd === 1) {
                        // console.log('req = 1 ip: ', ip);
                        let bufSrc = new Buffer.from(`ip\n-`);
                        callback(this.RESULT_SUCCESS, bufSrc);
                        reqInd++;
                    } else if (reqInd === 2) {
                        // console.log('req = 2 timezone: ', timezone);
                        let bufSrc = new Buffer.from(`tz\n-`);
                        callback(this.RESULT_SUCCESS, bufSrc);
                        reqInd++;
                    } else if (reqInd === 3) {
                        // console.log('req = 3 country: ', country);
                        let bufSrc = new Buffer.from(`cn\n-`);
                        callback(this.RESULT_SUCCESS, bufSrc);
                        reqInd = 0;
                    }
                }
            } catch (err) {
                console.error(err)
            }


        });
        //iwgetid                                                                                                                                      │································
        //    wlan0     ESSID:"pl96"
        // exec('iwgetid', (error, stdout, stderr) => {
        //
        //     let iface = stdout.slice(0, stdout.indexOf(' '));
        //     let ssid = stdout.slice((stdout.indexOf(':"') + 2), -1);
        //     let ip = require('local-ip')(iface);
        //     let data = `{"iface":"${iface}", "ssid":"${ssid}, "ip":"${ip}"}`;
        //     console.log(data);
        //     data = new Buffer.from(data);
        //     callback(this.RESULT_SUCCESS, data);
        // });
    } else {
        let msg;
        let offsetLength = 15;
        if ((config.offset + offsetLength) > config.length) {
            msg = config.msg.slice(config.offset);
        } else {
            msg = config.msg.slice(config.offset, config.offset + offsetLength);
        }
        console.log(`next part: ${msg}`);
        config.offset = config.offset + offsetLength;
        callback(this.RESULT_ERROR, new Buffer.from(msg));
    }
}

/**
 * This method will run when a write is performed to this characteristic.
 *
 * It’ll take in the value that was written, print the value to the log as a hex value String,
 * and call the callback indicating it was a success.
 *
 * @param {*} data
 * @param {*} offset
 * @param {*} withoutResponse
 * @param {*} callback
 */
CustomCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
    this._value = data;
    // console.log('data: ',data);
    let msg = data.toString();
    let splitArr = msg.split('\n');
    let skinNumber = -1;
    // console.log('splitArr: ', splitArr);
    if (splitArr.length > 1) {
        if (splitArr[0] === 'clock') {
            skinNumber = splitArr[1];
        } else if (splitArr[0] === 'cn') {
            country = splitArr[1];
        } else if (splitArr[0] === 'ssid') {
            ssid = splitArr[1];
        } else if (splitArr[0] === 'pass') {
            pass = splitArr[1];
        } else if (splitArr[0] === 'tz') {
            tz = splitArr[1];
        } else if (splitArr[0] === 'resetRequest') {
            reqInd = 0;
            callback(this.RESULT_SUCCESS);
            return;
        }
        if (skinNumber > 0) {
            let selectSkin = `[Unit]
Description=Setup a gui clock
After=graphical.target
PartOf=srv-watcher-tz.service

[Service]
Environment="DISPLAY=:0"
Environment="PATH=/usr/local/lib/processing-3.5.3/java/bin/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
Environment="XAUTHORITY=/home/pi/.Xauthority"
WorkingDirectory=/usr/local/bin/${skinNumber}/
ExecStart=/usr/local/bin/${skinNumber}/HDTU_Clock

# Restart every >2 seconds to avoid StartLimitInterval failure
RestartSec=3
Restart=always

[Install]
WantedBy=graphical.target
`;
            let skinCmd = `systemctl restart hdtu-clock.service`;
            exec(skinCmd, (error, timezone, stderr) => {
                if (error) {
                    console.error(`set timezone error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`set timezone stderr: ${stderr}`);
                    return;
                }

                console.log('set timezone success');
                callback(this.RESULT_SUCCESS);
                return;
            });
        } else {
            console.log('set piConfig: ', country, ssid, pass, tz);
            if ((country === '') || (ssid === '') || (pass === '') || (tz === '')) {
                callback(this.RESULT_SUCCESS);
                return;
            } else {
                //console.log('CustomCharacteristic - onWriteRequest: value = ' + this._value.toString('hex'));
                //let ssid = 'ssid';
                //let pass = 'pass';
                let wpa = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=${country}
	
network={
	ssid=${ssid}
	psk="${pass}"
}
`;
                tz = tz.trim();
                let tzEnv = `TIMEZONE=${tz}`;
                console.log('tz:', tzEnv);
                console.log('start configuration');
                fs.writeFileSync('/etc/wpa_supplicant/wpa_supplicant.conf', wpa);
                let tzCmd = `timedatectl set-timezone ${tz}`;
                console.log('tZone: ',tzCmd);
                exec(tzCmd, (error, timezone, stderr) => {
                    if (error) {
                        console.error(`set timezone error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.error(`set timezone stderr: ${stderr}`);
                        return;
                    }

                    console.log('set timezone success');
                });
                let wpaCmd = 'wpa_cli -i wlan0 reconfigure';
                let wpaCmdRestart = 'systemctl restart wpa_supplicant.service';

                console.log('restart pi');
                setTimeout(()=> {
                    exec('shutdown -r  now');
                }, 1000);
                callback(this.RESULT_SUCCESS);

                // exec(wpaCmd, (error, stderr) => {
                //         if (error) {
                //             console.log(`set wpa_cli error ${error.message}`);
                //         } else if (stderr) {
                //             console.log(`set wpa_cli stderr ${error.message}`);
                //         } else {
                //             console.log('set wpc_cli reconfigure success');
                //             exec(wpaCmdRestart, (error, stderr) =>{
                //                 if (error) {
                //                     console.log(`set wpa_cli_restart error ${error.message}`);
                //                 } else if (stderr) {
                //                     console.log(`set wpa_cli_restart stderr ${error.message}`);
                //                 } else {
                //                     console.log('set wpa_cli_restart success');
                //                 }
                //             });
                //         }
                //     }
                // );

                //fs.writeFileSync('/home/pi/ws/bluf/inWpa/wpa_supplicant.conf', wpa);
                //fs.writeFileSync('/home/pi/ws/bluf/inTz/timezone.txt', tzEnv);
            }
        }
    }
};

/**
 * A flag var where can be used to track whether the notify subscription is active.
 */
var isSubscribed = false;

/**
 * The interval at which to fire notifications in seconds
 */
var notifyInterval = 5; //seconds

/**
 * Delay the execution of some code by `notifyInterval`
 *
 * If `isSubscribed` is true, create a new Buffer with length of 3 bytes,
 * then invoke the callback and pass the data buffer through that call.
 * Finally, call `delayedNotification` again with the same callback. This allow notification
 * to continually fire every 5 seconds until unsubscribed.
 *
 * @param {*} callback
 */
function delayedNotification(callback) {
    setTimeout(function () {
        if (isSubscribed) {
            var data = Buffer(3);
            var now = new Date();
            data.writeUInt8(now.getHours(), 0);
            data.writeUInt8(now.getMinutes(), 1);
            data.writeUInt8(now.getSeconds(), 2);
            callback(data);
            delayedNotification(callback);
        }
    }, notifyInterval * 1000);
}

CustomCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
    console.log('CustomCharacteristic - onSubscribe');
    isSubscribed = true;
    delayedNotification(updateValueCallback);
    this._updateValueCallback = updateValueCallback;
};

CustomCharacteristic.prototype.onUnsubscribe = function () {
    console.log('CustomCharacteristic - onUnsubscribe');
    isSubscribed = false;
    this._updateValueCallback = null;
};
