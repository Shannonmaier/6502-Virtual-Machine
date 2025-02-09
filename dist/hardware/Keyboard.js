"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Keyboard = void 0;
const Hardware_1 = require("./Hardware");
const Interrupt_1 = require("./imp/Interrupt");
class Keyboard extends Hardware_1.Hardware {
    constructor(irq, priority, interruptController) {
        super(irq, "Keyboard");
        this.outputBuffer = [];
        this.irq = irq;
        this.priority = priority; // Default priority
        this.deviceName = "Keyboard";
        this.interruptController = interruptController;
        this.monitorKeys();
    }
    monitorKeys() {
        /*
        character stream from stdin code (most of the contents of this function) taken from here
        https://stackoverflow.com/questions/5006821/nodejs-how-to-read-keystrokes-from-stdin

        This takes care of the simulation we need to do to capture stdin from the console and retrieve the character.
        Then we can put it in the buffer and trigger the interrupt.
         */
        var stdin = process.stdin;
        // without this, we would only get streams once enter is pressed
        stdin.setRawMode(true);
        // resume stdin in the parent process (node app won't quit all by itself
        // unless an error or process.exit() happens)
        stdin.resume();
        // i don't want binary, do you?
        //stdin.setEncoding( 'utf8' );
        stdin.setEncoding(null);
        stdin.on("data", function (key) {
            //let keyPressed : String = key.charCodeAt(0).toString(2);
            //while(keyPressed.length < 8) keyPressed = "0" + keyPressed;
            let keyPressed = key.toString();
            this.log(`Key pressed: ${keyPressed}`);
            // ctrl-c ( end of text )
            // this let's us break out with ctrl-c
            if (key.toString() === '\u0003') {
                process.exit();
            }
            // Assign priorities based on the key pressed - for making sure priorties work
            if (keyPressed === "g") {
                this.priority = Interrupt_1.InterruptPriority.HIGHER; // G gets the highest priority
            }
            else if (keyPressed === "a") {
                this.priority = Interrupt_1.InterruptPriority.HIGH;
            }
            else if (keyPressed === "b") {
                this.priority = Interrupt_1.InterruptPriority.LOW;
            }
            else {
                this.priority = Interrupt_1.InterruptPriority.NORMAL;
            }
            this.interruptController.acceptInterrupt({
                irq: this.irq,
                priority: this.priority,
                deviceName: this.deviceName,
                outputBuffer: [keyPressed], // Include only the relevant key
            });
        }.bind(this));
    }
}
exports.Keyboard = Keyboard;
//# sourceMappingURL=Keyboard.js.map