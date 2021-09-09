const util = require('util');
const bleno = require('@abandonware/bleno');

let settings = require('./settings');

const {exec} = require("child_process");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function (settings) {
  CustomCharacteristic.super_.call(this, {
    uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a607',
    properties: ['read', 'write',],
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
  console.log(`ssid onReadRequest`);
  exec("cat /etc/wpa_supplicant/wpa_supplicant.conf | grep ssid | sed 's/ssid=//' ", (error, ssid, stderr) => {
    if (error) {
      console.error(`get ssid error: ${error.message}`);
      let err = 'not set'
      let data = new Buffer.from(err);
      callback(this.RESULT_SUCCESS, data);
      return;
    }
    if (stderr) {
      console.error(`get ssid stderr: ${stderr}`);
      let err = 'not set'
      let data = new Buffer.from(err);
      callback(this.RESULT_SUCCESS, data);
      return;
    }
    ssid = ssid.trim();
    if (ssid.charAt(0) === '"') {
      ssid = ssid.replace('"', '');
      ssid = ssid.replace('"', '');
    }
    console.log('ssid:', ssid);
    let data = new Buffer.from(ssid)
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
  this.settings.ssid = data.toString().trim();
  console.log(`write ssid: ${this.settings.ssid}`);
  callback(this.RESULT_SUCCESS);
};