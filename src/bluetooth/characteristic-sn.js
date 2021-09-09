const util = require('util');
const bleno = require('@abandonware/bleno');

const fs = require('fs');
const {exec} = require("child_process");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function () {
  CustomCharacteristic.super_.call(this, {
    uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a612',
    properties: ['read',],
  });
  this._value = new Buffer(0);
  this._updateValueCallback = null;
};

util.inherits(CustomCharacteristic, BlenoCharacteristic);

module.exports = CustomCharacteristic;

function getSerial() {
  let fs = require('fs');
  const path = '/sys/firmware/devicetree/base/serial-number';
  let res = fs.readFileSync(path,'ascii');
  return res.replace(/[^\x20-\x7E]/g, '').toString();
}

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
  console.log('Test onReadRequest');
  let alias = getSerial();
  console.log(`test: ${alias}`);
  let data = new Buffer.from(alias);
  callback(this.RESULT_SUCCESS, data);
}