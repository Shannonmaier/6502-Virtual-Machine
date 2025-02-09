"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MMU = void 0;
const Hardware_1 = require("./Hardware");
class MMU extends Hardware_1.Hardware {
    constructor(memory) {
        super(0, "MMU");
        this.LowOrderByte = 0x00;
        this.HighOrderByte = 0x00;
        this.mem = memory;
        this.log("Memory Intitialized");
    }
    //Set the MAR (uses memory's setter within)
    setMAR(address) {
        if (address >= 0x0000 && address <= 0xFFFF) {
            this.mem.setMAR(address);
        }
    }
    //Method to seperate high and low order bytes for little endian
    LittleEndianAddr(lowByte, highByte) {
        const address = ((highByte << 8) | lowByte);
        return address;
    }
    LittleEndianLow(LOB) {
        this.LowOrderByte = LOB;
        return this.LowOrderByte;
    }
    LittleEndianHigh(HOB) {
        this.HighOrderByte = HOB;
        return this.HighOrderByte;
    }
    //set the MDR (uses memory's setter within)
    setMDR(data) {
        if (data >= 0x00 && data <= 0xFF) {
            this.mem.setMDR(data);
        }
    }
    write() {
        this.mem.write();
    }
    read() {
        return this.mem.read();
    }
    writeImmediate(address, data) {
        // Set MAR to the specified address
        this.setMAR(address);
        // Set MDR to the specified data byte
        this.setMDR(data);
        // Write MDR to memory at MAR
        this.write();
    }
    ReadImmediate(address) {
        this.setMAR(address);
        return this.read();
    }
    //Enter full program as parameter and use writeImmediate to write each byte to mem
    loadProgram(startAddress, program) {
        program.forEach((data, index) => {
            this.writeImmediate(startAddress + index, data);
        });
    }
    //Memory Dump method - different formatting than Memory's displayMemory 
    //and also uses the MAR and MDR to access memory instead of directly
    memoryDump(startAddress, endAddress) {
        this.log("Memory Dump: Debug");
        this.log("--------------------");
        for (let addr = startAddress; addr <= endAddress; addr++) {
            this.setMAR(addr);
            this.read();
            const data = this.mem.getMDR();
            this.log(`Addr ${addr.toString(16).toUpperCase().padStart(4, '0')}:   |  ${data.toString(16).toUpperCase().padStart(2, '0')}`);
        }
        this.log("--------------------");
        this.log("Memory Dump: Complete");
    }
}
exports.MMU = MMU;
//# sourceMappingURL=MMU.js.map