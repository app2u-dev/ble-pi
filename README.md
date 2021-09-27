## Prerequisites


### Linux

* Kernel version 3.6 or above
* ```libbluetooth-dev```
* ```bluetoothd``` disabled, if BlueZ 5.14 or later is installed. Use ```sudo hciconfig hci0 up``` to power Bluetooth adapter up after stopping or disabling ```bluetoothd```.
    * ```systemd```
        * ```sudo systemctl stop bluetooth``` (once)
        * ```sudo systemctl disable bluetooth``` (persist on reboot)

#### Ubuntu/Debian/Raspbian

```sh
sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev libusb-1.0-0-dev
```

Make sure ```node``` is on your path, if it's not, some options:
* symlink ```nodejs``` to ```node```: ```sudo ln -s /usr/bin/nodejs /usr/bin/node```
* [install Node.js using the NodeSource package](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

## Install

```sh
git clone https://github.com/app2u-dev/ble-pi.git
```
```sh
cd ble-pi
```


## Usage
```sh
sudo node src/server.js
```

## Install ble-pi service
Check and edit the working directory if necessary
```sh
sudo cp ble-pi.service /etc/systemd/system/
```

## Run ble-pi service
```sh
sudo systemctl enable ble-pi.service
sudo systemctl restart ble-pi.service
```