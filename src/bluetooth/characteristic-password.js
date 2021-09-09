const util = require('util');
const bleno = require('@abandonware/bleno');

let settings = require('./settings');

const {exec} = require("child_process");
const fs = require("fs");

const BlenoCharacteristic = bleno.Characteristic;

const CustomCharacteristic = function (settings) {
    CustomCharacteristic.super_.call(this, {
        // password
        uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a611',
        properties: ['write'],
    });
    this._value = new Buffer(0);
    this._updateValueCallback = null;
    this.settings = settings;
};

util.inherits(CustomCharacteristic, BlenoCharacteristic);

module.exports = CustomCharacteristic;


CustomCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
    this._value = data;
    let password = data.toString();
    let ssid = this.settings.ssid;
    let country = this.settings.country;
    console.log(`settings: ${ssid} ${country} ${password}`);
    if (password !== '' && ssid !== '' && country !== '') {
    let wpa = `ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=${country}
	
network={
	ssid="${ssid}"
	psk="${password}"
}
`;
        console.log('start configuration');
        fs.writeFileSync('/etc/wpa_supplicant/wpa_supplicant.conf', wpa);
        // let wpaCmd = 'wpa_cli -i wlan0 reconfigure';
        // let wpaCmdRestart = 'systemctl restart wpa_supplicant.service';

        console.log('restart pi');
        setTimeout(()=> {
            exec('shutdown -r  now');
        }, 1000);
        callback(this.RESULT_SUCCESS);
    }

};