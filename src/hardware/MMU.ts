import { Memory } from './Memory';
import { Hardware } from './Hardware';
import { Cpu } from "./Cpu";
import {hexLog } from "./Hardware";




export class MMU extends Hardware{
    public mem: Memory;
    public LowOrderByte: number = 0x00;
    public HighOrderByte: number = 0x00;

    constructor(memory: Memory ){
        super(0, "MMU");
        this.mem = memory;
        this.log("Memory Intitialized")
    
    }
    //Set the MAR (uses memory's setter within)
    public setMAR(address: number): void{
        if (address >= 0x0000 && address <= 0xFFFF) {
            this.mem.setMAR(address);
        }
    }
    
    //Method to seperate high and low order bytes for little endian
    public LittleEndianAddr(lowByte:number, highByte:number):number{
        const address = ((highByte << 8 )| lowByte);
        return address;
    }

    public LittleEndianLow(LOB:number): number{
        this.LowOrderByte = LOB;
        return this.LowOrderByte;
    }

    public LittleEndianHigh(HOB: number): number{
        this.HighOrderByte = HOB;
        return this.HighOrderByte;
    }


    //set the MDR (uses memory's setter within)
    public setMDR(data: number): void {
        if (data >= 0x00 && data <= 0xFF) {
            this.mem.setMDR(data);
        }
    }

    public write(): void{
        this.mem.write();
    }

    public read(): number {
        return this.mem.read();
    }

    public writeImmediate(address: number, data: number): void {
        // Set MAR to the specified address
        this.setMAR(address);
        // Set MDR to the specified data byte
        this.setMDR(data);
        // Write MDR to memory at MAR
        this.write()             
        
    }
    public ReadImmediate(address: number): number {
        this.setMAR(address);
        return this.read();
    }




    //Enter full program as parameter and use writeImmediate to write each byte to mem
    public loadProgram(startAddress: number, program: number[]): void {
        program.forEach((data, index) => {
            this.writeImmediate(startAddress + index, data);
        });
    }
    //Memory Dump method - different formatting than Memory's displayMemory 
    //and also uses the MAR and MDR to access memory instead of directly
    public memoryDump(startAddress: number, endAddress: number): void {
        this.log("Memory Dump: Debug");
        this.log ("--------------------")
        for (let addr = startAddress; addr <= endAddress; addr++) {
            this.setMAR(addr);
            this.read();
            const data = this.mem.getMDR();
            this.log(`Addr ${addr.toString(16).toUpperCase().padStart(4, '0')}:   |  ${data.toString(16).toUpperCase().padStart(2, '0')}`);
        }
        this.log ("--------------------")

        this.log("Memory Dump: Complete");
    }
}

    







