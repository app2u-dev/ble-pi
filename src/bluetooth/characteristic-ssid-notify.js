const util = require('util');
const bleno = require('@abandonware/bleno');

let settings = require('./settings');

const {exec} = require("child_process");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function (settings) {
  CustomCharacteristic.super_.call(this, {
    uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a617',
    properties: ['read', 'notify'],
  });
  this._value = new Buffer(0);
  this._updateValueCallback = null;
  this.settings = settings;
  this.isNewRequest = true;
  this.requestNum = 0;
  this._ssid_arr = [];
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
  console.log(`ssid-notify onReadRequest`);
  if (this.isNewRequest) {


    exec("iwlist wlan0 scan | grep ESSID | grep -o '\"[^\"]\\+\"' ", (error, ssid, stderr) => {
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

      ssid_arr = ssid.split('\n');
      for (let i = 0; i < ssid_arr.length; i++) {
        ssid_arr[i] = ssid_arr[i].trim();
        if (ssid_arr[i].charAt(0) === '"') {
          ssid_arr[i] = ssid_arr[i].replace('"', '');
          ssid_arr[i] = ssid_arr[i].replace('"', '');
        }
        if (ssid_arr[i].length > 0 && ssid_arr[i] !== "") {
          this._ssid_arr.push(ssid_arr[i]);
        }
      }
      console.log('ssid count:', this._ssid_arr.length);
      console.log('ssid arr:', this._ssid_arr);
      let data = new Buffer.from(`range:${this.requestNum}-${this._ssid_arr.length}`);
      if (this._ssid_arr.length > 0) {
        this.isNewRequest = false;
        this.requestNum = this.requestNum + 1;
      }
      callback(this.RESULT_SUCCESS, data);
    });
  } else {
    console.log(`request not new, ssid count: ${this.requestNum} - ${this._ssid_arr.length}`);
    if (this._updateValueCallback) {
      let data = new Buffer.from(`ssid:${this._ssid_arr[this.requestNum - 1]}`);
      console.log(`EchoCharacteristic - onReadRequest: notifying ${data}`);
      this._updateValueCallback(data);
    }
    let data = new Buffer.from(`range:${this.requestNum}-${this._ssid_arr.length}`);
    if (this.requestNum === this._ssid_arr.length) {
      this.requestNum = 0;
      this.isNewRequest = true;
      this._ssid_arr.length = 0;
    } else {
      this.requestNum = this.requestNum + 1;
    }
    callback(this.RESULT_SUCCESS, data);
  }
}

CustomCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
  console.log(`ssid notify onSubscribe`);
  this._updateValueCallback = updateValueCallback;
};

CustomCharacteristic.prototype.onUnsubscribe = function () {
  console.log('ssid notify onUnsubscribe - reset');
  this.requestNum = 0;
  this.isNewRequest = true;
  this._ssid_arr.length = 0;
  this._updateValueCallback = null;
};