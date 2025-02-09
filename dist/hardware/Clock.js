"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
const Hardware_1 = require("./Hardware");
class Clock extends Hardware_1.Hardware {
    constructor(id = 0, name = "CLK") {
        super(id, name);
        this.timeListeners = []; //array to track all of the clockListeners
        this.clockIntervalId = null; //for intervalID within setInterval
    }
    addListener(timeListener) {
        this.timeListeners.push(timeListener);
    }
    pulseAll() {
        this.log("Clock pulse Initialized");
        for (const listener of this.timeListeners) {
            listener.pulse();
        }
    }
    startClock(interval = 1000) {
        //storing the interval created when using setInterval so that we can clear the interval to stop the clock
        this.clockIntervalId = setInterval(() => { this.pulseAll(); }, interval);
    }
    stopClock() {
        if (this.clockIntervalId) {
            clearInterval(this.clockIntervalId);
            this.clockIntervalId = null; //resetting the id back to its original null value
        }
    }
}
exports.Clock = Clock;
//# sourceMappingURL=Clock.js.map