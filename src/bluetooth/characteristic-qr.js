const util = require('util');
const bleno = require('@abandonware/bleno');

let settings = require('./settings');

const {exec} = require("child_process");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function (settings) {
  CustomCharacteristic.super_.call(this, {
    // password
    uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a621',
    properties: ['write'],
  });
  this._value = new Buffer(0);
  this._updateValueCallback = null;
  this.settings = settings;
};

util.inherits(CustomCharacteristic, BlenoCharacteristic);

module.exports = CustomCharacteristic;


CustomCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
  this._value = data.toString();
  console.log(`start qrcode show, value: ${this._value}`);
  if (this._value === 'show') {
    console.log('exec start pngview');
    exec('pngview qrcode.png', (error, res, stderr) => {
      if (error) {
        console.log(`pngview error + ${error}`);
      } else if (stderr) {
        console.error(`pngview stderr: ${stderr}`);
      }
      console.log('pngview success');
      setTimeout(() => {
        exec('killall pngview');
      }, 10000);
    });
  } else {
    console.log('exec killall pngview');
    exec('killall pngview');
  }
  callback(this.RESULT_SUCCESS);
};