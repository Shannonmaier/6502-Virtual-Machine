/* ------------------
Memory.ts

-------------------- */
import {hexLog } from "./Hardware";
import { Hardware } from './Hardware';
import {ClockListener} from "./imp/ClockListener";



export class Memory extends Hardware implements ClockListener{ 
    private memory: Uint8Array; // Memory Array to hold 8 bits per array element (unassigned integers)
    private MAR: number = 0x0000; //16 bits for addressing
    private MDR: number  = 0x00;// 8 bits for data

    //Total addressable memory for the 6502 computer - 65536 bytes (64K) 2^16
    private readonly MEM_SIZE: number = 0x10000;


    // Constructor - initalized memory to 0x00 for each address
    constructor(id: number = 0, name = 'RAM') {
        super(id, name); //Call super class constructor
        // Use Uint8Array to store 8 bits
        this.memory = new Uint8Array(this.MEM_SIZE)
        this.initializeMemory();
    }

     // Method to initialize memory - set all elements to 0x00
     public initializeMemory(): void {
        for (let i = 0x0000; i < this.MEM_SIZE; i++) {
            this.memory[i] = 0x00;
        }
    }

    //Method to reset memory - set all elements to 0x00
    public reset(): void{
        this.initializeMemory();
        this.MDR = 0x0000;
        this.MDR = 0x00;

    }

    public displayMemory(startAddr: number, endAddr: number): void {
        for (let addr = startAddr; addr <= endAddr; addr++) {
            let value;
            //Accounting for the future --> made it so that the function handles memory size, not just 0X14
            if (addr < this.MEM_SIZE) {
                value = this.memory[addr];
            } else {
                value = "ERR - Number undefined"; // Handles out-of-range addresses
            }

            const hexAddr = hexLog(addr, 5);  // Format the address to a five digit hex #
            const hexValue = typeof value === "number" ? hexLog(value, 2) : "ERR - Not number";  // Format the value
            const message = `Addr: ${hexAddr} Contains Value: ${hexValue}`;

            this.log(message);  // Use the log method inherited from Hardware
        }
    }

    //Implementing the pulse method to conform to contractual agreements of ClockListener
    public pulse(): void{
        this.log("Received clock pulse");
    }

    //GETTER AND SETTER FOR MAR
    public getMAR(): number{
        return this.MAR;
    }

    public setMAR(MARadd: number):void{
        if (MARadd>= 0 && MARadd < this.MEM_SIZE){
            this.MAR = MARadd;
        }
    }

    //GETTER AND SETTER FOR MDR
    public getMDR(): number{
        return this.MDR;
    }

    public setMDR(MDRdata: number): void{
        if (MDRdata>= 0x00 && MDRdata <= 0xFF){
            this.MDR = MDRdata;
        }
    }

    //Read method - read memory at location in MAR and update MDR
    public read(): number {   
        if (this.MAR < this.MEM_SIZE){
            this.MDR = this.memory[this.MAR]; //setting MDR to data at address in MAR
        }
        return this.getMDR();
    
    }

    public write(): void{
        if (this.MAR < this.MEM_SIZE){
            this.memory[this.MAR] = this.MDR; //write the contnets of the MDR to memory location in MAR 
        }
    }









}




