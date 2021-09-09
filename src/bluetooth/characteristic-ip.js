const util = require('util');
const bleno = require('@abandonware/bleno');

const fs = require('fs');
const {exec} = require("child_process");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function () {
    CustomCharacteristic.super_.call(this, {
        uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a608',
        properties: ['read',],
    });
    this._value = new Buffer(0);
    this._updateValueCallback = null;
};

util.inherits(CustomCharacteristic, BlenoCharacteristic);

module.exports = CustomCharacteristic;

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
    console.log('ip onReadRequest');
    exec("ip addr | grep wlan0 | grep inet | awk '{print $2}' | cut -d/ -f1", (error, ip, stderr) => {
        if (error) {
            console.error(`get ip error: ${error.message}`);
            let err = ''
            let data = new Buffer.from(err);
            callback(this.RESULT_SUCCESS, data);
            return;
        }
        if (stderr) {
            console.error(`get ip stderr: ${stderr}`);
            let err = ''
            let data = new Buffer.from(err);
            callback(this.RESULT_SUCCESS, data);
            return;
        }
        console.log('ip add: ', ip);
        let data = new Buffer.from(ip);
        callback(this.RESULT_SUCCESS, data);
    });
}