const util = require('util');
const bleno = require('@abandonware/bleno');

const fs = require('fs');
const {exec} = require("child_process");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function () {
  CustomCharacteristic.super_.call(this, {
    uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a631',
    properties: ['write'],
  });
  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(CustomCharacteristic, BlenoCharacteristic);

module.exports = CustomCharacteristic;

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
  let msg = data.toString();
  if (msg === 'reset') {
    fs.unlinkSync('/etc/wpa_supplicant/wpa_supplicant.conf');
    console.log('restart pi');
    setTimeout(() => {
      exec('shutdown -r  now');
    }, 1500);
    callback(this.RESULT_SUCCESS);
    return;
  }
  callback(this.RESULT_SUCCESS);
};
