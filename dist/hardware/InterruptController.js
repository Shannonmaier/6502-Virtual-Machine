"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterruptController = void 0;
const Hardware_1 = require("./Hardware");
class InterruptController extends Hardware_1.Hardware {
    constructor(id = 0, name = "InterruptController") {
        super(id, name);
        this.interruptQueue = [];
        this.devices = [];
    }
    //Takes in a device that can generate interrupts
    registerDevice(device) {
        this.devices.push(device);
    }
    //Adds a device to the queue and reorders queue based on priority
    acceptInterrupt(device) {
        this.interruptQueue.push(device);
        this.interruptQueue.sort((a, b) => b.priority - a.priority);
    }
    //Removes interupt on top of queue and returns it to be processed
    handleNextInterrupt() {
        if (this.interruptQueue.length > 0) {
            const nextInterrupt = this.interruptQueue.shift(); // Return and also remove the highest-priority interrupt
            return nextInterrupt;
        }
        return null;
    }
    pulse() {
        this.logQueue();
        const interrupt = this.handleNextInterrupt();
        if (interrupt) {
            this.log(`Processing interrupt: ${interrupt.deviceName}`);
        }
    }
    logQueue() {
        if (this.interruptQueue.length === 0) {
            this.log("Interrupt queue is empty."); //If nothing in interrupt queue
        }
        else { // if anything in interrupt queue
            this.log("Current Interrupt Queue:");
            this.interruptQueue.forEach((interrupt, index) => {
                var _a;
                this.log(`Queue Position ${index}: Device ${interrupt.deviceName}, Key: ${(_a = interrupt.outputBuffer) === null || _a === void 0 ? void 0 : _a.slice(-1)[0]}, Priority: ${interrupt.priority}`);
            });
        }
    }
}
exports.InterruptController = InterruptController;
//# sourceMappingURL=InterruptController.js.map