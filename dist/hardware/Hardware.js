"use strict";
/*------------------
Hardware.ts
----------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hardware = void 0;
exports.hexLog = hexLog;
class Hardware {
    constructor(id, name) {
        this.id = id;
        this.Hardwarename = name;
        this.debug = true;
    }
    log(message) {
        if (this.debug) {
            const time = Date.now();
            console.log(`[HW - ${this.Hardwarename} id: ${this.id} - ${time}]: ${message}`);
        }
    }
    start() {
        this.log("Starting...");
    }
    turnOff() {
        this.log("Turning off....");
    }
}
exports.Hardware = Hardware;
function hexLog(number, length) {
    //Change given number to hexidecimal
    let hexString = number.toString(16).toUpperCase();
    //Add leading zeroes where needs
    while (hexString.length < length) {
        hexString = '0' + hexString;
    }
    //Return the hex number
    return hexString;
}
//# sourceMappingURL=Hardware.js.map