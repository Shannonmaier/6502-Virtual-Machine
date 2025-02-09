"use strict";
/* ----------
Cpu.ts
-------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cpu = void 0;
const Hardware_1 = require("./Hardware");
const Hardware_2 = require("./Hardware");
const ASCII_1 = require("../ASCII");
class Cpu extends Hardware_1.Hardware {
    constructor(mmu, system, intteruptController) {
        super(0, "Cpu");
        this.cpuClockCount = 0x00; // Clock Count
        this.PC = 0x0000; // Program Counter 
        this.Acc = 0x00; // Accumulator 
        this.XReg = 0x00; // X Register 
        this.YReg = 0x00; // Y Register 
        this.IR = 0x00; // Instruction Register 
        this.ZFlag = 0x00; // Zero Flag 
        this.CarryFlag = 0x00; // Carry Flag 
        this.step = 0x00; // Current step in the pipeline
        this.mmu = mmu;
        this.system = system; // Store the System instance
        this.cpuClockCount = 0x00; //Make the clock count 0 every time CPU initialized
        this.interruptController = intteruptController;
    }
    //Implementing pulse method from ClockListener
    pulse() {
        this.cpuClockCount++;
        this.log(`received clock pulse - CPU Clock Count: ${this.cpuClockCount}`);
        this.log("CPU State | Mode: 0 PC: " + (0, Hardware_2.hexLog)(this.PC, 4) + " IR: " + (0, Hardware_2.hexLog)(this.IR, 2) + " Acc: " + (0, Hardware_2.hexLog)(this.Acc, 2) + " xReg: " + (0, Hardware_2.hexLog)(this.XReg, 2) + " yReg: " + (0, Hardware_2.hexLog)(this.YReg, 2) + " zFlag: " + this.ZFlag + " Step: " + this.step);
        this.pipelineStep();
    }
    pipelineStep() {
        switch (this.step) {
            case 0x00:
                this.fetch();
                break;
            case 0x01:
                this.decode1();
                break;
            case 0x02:
                this.decode2();
                break;
            case 0x03:
                this.execute1();
                break;
            case 0x04:
                this.execute2();
                break;
            case 0x05:
                this.writeBack();
                break;
            case 0x06:
                this.interruptCheck();
                break;
        }
    }
    fetch() {
        this.IR = this.mmu.ReadImmediate(this.PC);
        this.PC++;
        this.step = 0x01; //Moves to next step (Decode1)
    }
    decode1() {
        switch (this.IR) {
            case 0xA9:
                this.Acc = this.mmu.ReadImmediate(this.PC);
                this.step = 0x06; //Moves to last step (IntCheck)
                this.PC++;
                break;
            case 0xAD:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //(Moves to next decode2
                break;
            case 0x8D:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //Moves to next decode2
                break;
            case 0x8A:
                this.Acc = this.XReg;
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0x98:
                this.Acc = this.YReg;
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0x6D:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //Moves to next decode2
                break;
            case 0xA2:
                this.XReg = this.mmu.ReadImmediate(this.PC);
                this.step = 0x06; //Moves to last step (IntCheck)
                this.PC++;
                break;
            case 0xAE:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //Moves to next decode2
                break;
            case 0xAA:
                this.XReg = this.Acc;
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0xA0:
                this.YReg = this.mmu.ReadImmediate(this.PC);
                this.step = 0x06; //Moves to last step (IntCheck)
                this.PC++;
                break;
            case 0xAC:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //Moves to next decode2
                break;
            case 0xA8:
                this.YReg = this.Acc;
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0xEA: //NO OP
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0x00: //Break
                this.system.stopSystem();
                break;
            case 0xEC:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //Moves to next decode2
                break;
            case 0xD0:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.PC++; // Increment PC to point to the next instruction (beyond offset)
                this.step = 0x03; //Moves to execute1
                break;
            case 0xEE:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //Moves to next decode2
                break;
            case 0xFF:
                if (this.XReg == 0x01) {
                    console.log("SYS CALL 1");
                    console.log((0, Hardware_2.hexLog)(this.YReg, 2));
                    this.step = 0x06;
                }
                else if (this.XReg == 0x03) {
                    console.log("SYS CALL 3");
                    this.tempStore = this.mmu.ReadImmediate(this.PC);
                    this.mmu.LittleEndianLow(this.tempStore);
                    this.PC++;
                    this.step = 0x02;
                }
                break;
            default:
                console.log("Error: Invalid Instruction");
                break;
        }
    }
    decode2() {
        switch (this.IR) {
            case 0xAD:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to Execute1
                break;
            case 0x8D:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to execute1
                break;
            case 0x6D:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to execute1
                break;
            case 0xAE:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to execute1
                break;
            case 0xAC:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to Execute1
                break;
            case 0xEC:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to execute1
                break;
            case 0xEE:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to execute1
                break;
            case 0xFF:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03; //Moves to execute1
                break;
            default:
                this.PC++;
                this.step = 0x06; // Skip to the interrupt check step
                break;
        }
    }
    execute1() {
        switch (this.IR) {
            case 0xAD:
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.Acc = this.mmu.ReadImmediate(this.LittleEndianStore);
                this.step = 0x06; //Moves to last step (IntCheck)  
                break;
            case 0x8D:
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.mmu.writeImmediate(this.LittleEndianStore, this.Acc);
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0x6D: //ADD WITH CARRY -- work in progress
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.tempStore = this.mmu.ReadImmediate(this.LittleEndianStore);
                this.Acc = this.Acc + this.tempStore;
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0xAE:
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.XReg = this.mmu.ReadImmediate(this.LittleEndianStore);
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0xAC:
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.YReg = this.mmu.ReadImmediate(this.LittleEndianStore);
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0xEC:
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.tempStore = this.mmu.ReadImmediate(this.LittleEndianStore);
                if (this.tempStore == this.XReg) {
                    this.ZFlag = 0x01;
                }
                else {
                    this.ZFlag = 0x00;
                }
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0xD0:
                let offset = this.tempStore;
                if (this.ZFlag === 0x00) { // Branch only if ZFlag is 0
                    if (offset < 0x80) {
                        // Positive offset (forward branch) (less than 80)
                        this.PC = this.PC + offset; //Add offset to PC
                    }
                    else {
                        // Negative offset (backward branch) (80 or over)
                        this.PC = this.PC - ((~offset + 1) & 0xFF); //calculating 2s comp of offset to find neg value
                    }
                    // WRAP AROUND:
                    // PC is above 0xFFFF --> wraps around to 0x0000.
                    // PC is below 0x0000 --> it wraps around to 0xFFFF.
                    this.PC &= 0xFFFF;
                }
                else {
                }
                this.step = 0x06; // Move to interrupt check
                break;
            case 0xEE:
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.tempStore = this.mmu.ReadImmediate(this.LittleEndianStore);
                this.step = 0x04;
                break;
            case 0xFF:
                if (this.XReg === 0x03) {
                    this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                    let decodedString = ""; // Empty string to collect decoded characters
                    let loop = true;
                    while (loop) {
                        const dataToDecode = this.mmu.ReadImmediate(this.LittleEndianStore);
                        if (dataToDecode !== 0x00) {
                            decodedString += ASCII_1.Ascii.decode(dataToDecode); // Appending Character to string
                            this.LittleEndianStore++;
                        }
                        else {
                            loop = false; // Exit the loop when get to 0x00
                        }
                    }
                    console.log(decodedString);
                    this.step = 0x06; //Moves to last step (IntCheck)
                }
                break;
            default:
                break;
        }
    }
    execute2() {
        switch (this.IR) {
            case 0xEE:
                this.tempStore++;
                this.step = 0x05;
                break;
        }
    }
    writeBack() {
        switch (this.IR) {
            case 0xEE:
                this.mmu.writeImmediate(this.LittleEndianStore, this.tempStore);
                this.step = 0x06;
                break;
        }
    }
    interruptCheck() {
        const interrupt = this.interruptController.handleNextInterrupt();
        if (interrupt) {
            this.log(`Processing interrupt: ${interrupt.deviceName}`);
            // Perform interrupt-specific actions inline here, or log the key pressed
            if (interrupt.outputBuffer) {
                this.log(`Key pressed: ${interrupt.outputBuffer[interrupt.outputBuffer.length - 1]}`);
            }
        }
        else {
            this.log("No pending interrupts.");
        }
        this.step = 0x00;
    }
}
exports.Cpu = Cpu;
//# sourceMappingURL=Cpu.js.map