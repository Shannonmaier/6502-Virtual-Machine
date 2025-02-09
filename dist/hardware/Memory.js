"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memory = void 0;
/* ------------------
Memory.ts

-------------------- */
const Hardware_1 = require("./Hardware");
const Hardware_2 = require("./Hardware");
class Memory extends Hardware_2.Hardware {
    // Constructor - initalized memory to 0x00 for each address
    constructor(id = 0, name = 'RAM') {
        super(id, name); //Call super class constructor
        this.MAR = 0x0000; //16 bits for addressing
        this.MDR = 0x00; // 8 bits for data
        //Total addressable memory for the 6502 computer - 65536 bytes (64K) 2^16
        this.MEM_SIZE = 0x10000;
        // Use Uint8Array to store 8 bits
        this.memory = new Uint8Array(this.MEM_SIZE);
        this.initializeMemory();
    }
    // Method to initialize memory - set all elements to 0x00
    initializeMemory() {
        for (let i = 0x0000; i < this.MEM_SIZE; i++) {
            this.memory[i] = 0x00;
        }
    }
    //Method to reset memory - set all elements to 0x00
    reset() {
        this.initializeMemory();
        this.MDR = 0x0000;
        this.MDR = 0x00;
    }
    displayMemory(startAddr, endAddr) {
        for (let addr = startAddr; addr <= endAddr; addr++) {
            let value;
            //Accounting for the future --> made it so that the function handles memory size, not just 0X14
            if (addr < this.MEM_SIZE) {
                value = this.memory[addr];
            }
            else {
                value = "ERR - Number undefined"; // Handles out-of-range addresses
            }
            const hexAddr = (0, Hardware_1.hexLog)(addr, 5); // Format the address to a five digit hex #
            const hexValue = typeof value === "number" ? (0, Hardware_1.hexLog)(value, 2) : "ERR - Not number"; // Format the value
            const message = `Addr: ${hexAddr} Contains Value: ${hexValue}`;
            this.log(message); // Use the log method inherited from Hardware
        }
    }
    //Implementing the pulse method to conform to contractual agreements of ClockListener
    pulse() {
        this.log("Received clock pulse");
    }
    //GETTER AND SETTER FOR MAR
    getMAR() {
        return this.MAR;
    }
    setMAR(MARadd) {
        if (MARadd >= 0 && MARadd < this.MEM_SIZE) {
            this.MAR = MARadd;
        }
    }
    //GETTER AND SETTER FOR MDR
    getMDR() {
        return this.MDR;
    }
    setMDR(MDRdata) {
        if (MDRdata >= 0x00 && MDRdata <= 0xFF) {
            this.MDR = MDRdata;
        }
    }
    //Read method - read memory at location in MAR and update MDR
    read() {
        if (this.MAR < this.MEM_SIZE) {
            this.MDR = this.memory[this.MAR]; //setting MDR to data at address in MAR
        }
        return this.getMDR();
    }
    write() {
        if (this.MAR < this.MEM_SIZE) {
            this.memory[this.MAR] = this.MDR; //write the contnets of the MDR to memory location in MAR 
        }
    }
}
exports.Memory = Memory;
//# sourceMappingURL=Memory.js.map