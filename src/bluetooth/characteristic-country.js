const util = require('util');
const bleno = require('@abandonware/bleno');

const fs = require('fs');
const {exec} = require("child_process");
let settings = require('./settings');
const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function (settings) {
    CustomCharacteristic.super_.call(this, {
        uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a609',
        properties: ['read', 'write'],
    });
    this._value = new Buffer(0);
    this._updateValueCallback = null;
    this.settings = settings;
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
    console.log(`Country onReadRequest`);
    exec("cat /etc/wpa_supplicant/wpa_supplicant.conf | grep country | sed 's/country=//' ", (error, country, stderr) => {

        if (error) {
            console.error(`get country error: ${error.message}`);
            let err = 'not set'
            let data = new Buffer.from(err);
            callback(this.RESULT_SUCCESS, data);
            return;
        }
        if (stderr) {
            console.error(`get country stderr: ${stderr}`);
            let err = 'not set'
            let data = new Buffer.from(err);
            callback(this.RESULT_SUCCESS, data);
            return;
        }
        console.log('country: ', country);
        let data = new Buffer.from(country);
        callback(this.RESULT_SUCCESS, data);
    });
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
    this.settings.country = data.toString().trim();
    console.log(`writer country: ${this.settings.country}`);
    callback(this.RESULT_SUCCESS);
};