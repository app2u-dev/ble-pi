const bleno = require('@abandonware/bleno');
const characteristicSsid = require('./characteristic-ssid');
const characteristicSsidNotify = require('./characteristic-ssid-notify');
const characteristicIp = require('./characteristic-ip');
const characteristicQr = require('./characteristic-qr');
const characteristicCountry = require('./characteristic-country');
const characteristicTimezone = require('./characteristic-timezone');
const characteristicPassword = require('./characteristic-password');
const characteristicReset = require('./characteristic-reset');
const characteristicSN = require('./characteristic-sn');
const characteristicAlias = require('./characteristic-alias');
const characteristicModel = require('./characteristic-model');
const settings = require('./settings');

const BlenoPrimaryService = bleno.PrimaryService;

const serviceName = 'cuckoo-clock';
const kServiceUuidOne = '27cf08c1-076a-41af-becd-02ed6f6109b9';
const serviceUuids = [kServiceUuidOne];
// default uuid: 'fd758b93-0bfa-4c52-8af0-85845a74a606', - not work
// ssid: 'fd758b93-0bfa-4c52-8af0-85845a74a607', RW
// ssid-notify: 'fd758b93-0bfa-4c52-8af0-85845a74a617', N
// qr: 'fd758b93-0bfa-4c52-8af0-85845a74a621', W
// ip: 'fd758b93-0bfa-4c52-8af0-85845a74a608', R
// country: 'fd758b93-0bfa-4c52-8af0-85845a74a609', RW
// timezone: 'fd758b93-0bfa-4c52-8af0-85845a74a610', RW
// password: 'fd758b93-0bfa-4c52-8af0-85845a74a611', W
// password: 'fd758b93-0bfa-4c52-8af0-85845a74a631', W
// serial_num: 'fd758b93-0bfa-4c52-8af0-85845a74a615', R
// alias: 'fd758b93-0bfa-4c52-8af0-85845a74a613', R
// model: 'fd758b93-0bfa-4c52-8af0-85845a74a615', R


const listenOnStateChange = () =>
  bleno.on('stateChange', (state) => {
    console.log('on -> stateChange: ' + state + ', address = ' + bleno.address);
    if (state === 'poweredOn') {
      console.log('advertising start.');
      bleno.startAdvertising(serviceName, serviceUuids);
    } else {
      console.log('advertising stop.');
      bleno.stopAdvertising();
    }
  });

/**
 * Create an instance of `CustomCharacteristic` in the constructor of the service
 *
 * When the advertising starts, assuming there are no errors, set the services to an array
 * that contains a `BlenoPrimaryService` with a UUID that matches the service UUID that is
 * advertising after the poweredOn state change.
 */
const listenOnadvertisingStart = () =>
  bleno.on('advertisingStart', function (error) {
    console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
    if (!error) {
      // bleno.PrimaryService.call(this, {
      //     uuid: kServiceUuidOne,
      //     characteristics: [
      //       new characteristicSsid(),
      //       new characteristicIp(),
      //       new characteristicCountry(),
      //       new characteristicTimezone(),
      //       new characteristicSN(),
      //       new characteristicAlias(),
      //     ]
      // })
      // bleno.setServices([
      //     new BlenoPrimaryService({
      //         uuid: kServiceUuidOne,
      //         characteristics: [new CustomCharacteristic()]
      //     }),]);

      bleno.setServices([
        new BlenoPrimaryService({
          uuid: kServiceUuidOne,
          characteristics: [
            new characteristicSsid(settings),
            new characteristicSsidNotify(settings),
            new characteristicQr(settings),
            new characteristicIp(),
            new characteristicCountry(settings),
            new characteristicTimezone(settings),
            new characteristicPassword(settings),
            new characteristicReset(settings),
            new characteristicSN(),
            new characteristicAlias(),
            new characteristicModel(),
          ] // 607
        }),]);
    }
  })
;

const start = () => {
  listenOnStateChange();
  listenOnadvertisingStart();
};


module.exports = {
  start,
};
