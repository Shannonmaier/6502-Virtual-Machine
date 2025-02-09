/* ----------
Cpu.ts
-------------*/

import {Hardware} from "./Hardware";
import {ClockListener} from "./imp/ClockListener";
import { MMU } from "./MMU";
import {hexLog } from "./Hardware";
import { System } from "../System";
import { Ascii } from "../ASCII";
import { InterruptController } from "./InterruptController";
import { Interrupt } from "./imp/Interrupt";


export class Cpu extends Hardware implements ClockListener{
    private cpuClockCount: number = 0x00; // Clock Count
    private PC: number = 0x0000; // Program Counter 
    private Acc: number = 0x00; // Accumulator 
    private XReg: number = 0x00; // X Register 
    private YReg: number = 0x00; // Y Register 
    private IR: number = 0x00; // Instruction Register 
    private ZFlag: number = 0x00; // Zero Flag 
    private CarryFlag: number = 0x00; // Carry Flag 
    private step: number = 0x00; // Current step in the pipeline
    private mmu: MMU;
    private system: System;
    public interruptController: InterruptController;



    private tempStore: number; //tempoary storage place for addresses, data, etc
    LittleEndianStore: number;


    constructor(mmu:MMU, system: System, intteruptController:InterruptController) {
        super(0, "Cpu");
        this.mmu = mmu;
        this.system = system; // Store the System instance
        this.cpuClockCount = 0x00; //Make the clock count 0 every time CPU initialized
        this.interruptController= intteruptController;

 
    }

    //Implementing pulse method from ClockListener
    public pulse(): void{
        this.cpuClockCount++
        this.log(`received clock pulse - CPU Clock Count: ${this.cpuClockCount}`);
        this.log("CPU State | Mode: 0 PC: "+ hexLog(this.PC, 4)+" IR: "+ hexLog(this.IR,2)+" Acc: "+ hexLog(this.Acc,2)+" xReg: "+hexLog(this.XReg,2) +" yReg: "+ hexLog(this.YReg,2) +" zFlag: "+ this.ZFlag+" Step: "+ this.step);
        this.pipelineStep();


    }

    private pipelineStep(): void {
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

    private fetch():void{
        this.IR = this.mmu.ReadImmediate(this.PC);
        this.PC++;
        this.step = 0x01; //Moves to next step (Decode1)

    }
   
    private decode1():void{
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
                this.step = 0x03;//Moves to execute1
                break;
            case 0xEE:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianLow(this.tempStore);
                this.PC++;
                this.step = 0x02; //Moves to next decode2
                break;
            case 0xFF:
                if (this.XReg == 0x01){
                    console.log("SYS CALL 1");
                        console.log(hexLog(this.YReg, 2));
                        this.step = 0x06
                }
                else if (this.XReg ==0x03){
                    console.log("SYS CALL 3");
                    this.tempStore = this.mmu.ReadImmediate(this.PC);
                    this.mmu.LittleEndianLow(this.tempStore);
                    this.PC++;
                    this.step = 0x02;

                }
                break;
            default:
                console.log("Error: Invalid Instruction");
                break


        }    

    }

    private decode2():void{
       
        switch (this.IR){
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
                this.step = 0x03;//Moves to execute1
                break;
            case 0x6D:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03;//Moves to execute1
                break;
            case 0xAE:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03;//Moves to execute1
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
                this.step = 0x03;//Moves to execute1
                break;
            case 0xEE:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03;//Moves to execute1
                break;  
            case 0xFF:
                this.tempStore = this.mmu.ReadImmediate(this.PC);
                this.mmu.LittleEndianHigh(this.tempStore);
                this.PC++;
                this.step = 0x03;//Moves to execute1
                break;          
            default:
                this.PC++;
                this.step = 0x06; // Skip to the interrupt check step
                break;  
                  

        }


    }

    private execute1():void{
        switch (this.IR){
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
                if (this.tempStore == this.XReg){
                    this.ZFlag = 0x01;
                }
                else{
                    this.ZFlag = 0x00;
                }
                this.step = 0x06; //Moves to last step (IntCheck)
                break;
            case 0xD0:
                let offset = this.tempStore;
                if (this.ZFlag === 0x00) { // Branch only if ZFlag is 0
                    if (offset < 0x80) {
                        // Positive offset (forward branch) (less than 80)
                        this.PC =  this.PC + offset; //Add offset to PC
                    } else {
                        // Negative offset (backward branch) (80 or over)
                        this.PC = this.PC - ((~offset + 1) & 0xFF);//calculating 2s comp of offset to find neg value
                    }
            
                    // WRAP AROUND:
                    // PC is above 0xFFFF --> wraps around to 0x0000.
                    // PC is below 0x0000 --> it wraps around to 0xFFFF.
                    this.PC &= 0xFFFF;
            
                } else {
                }
                this.step = 0x06; // Move to interrupt check
                break;

               
            case 0xEE:
                this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                this.tempStore= this.mmu.ReadImmediate(this.LittleEndianStore);
                this.step = 0x04;
                break;
            
            case 0xFF:
                if (this.XReg === 0x03) {
                    this.LittleEndianStore = this.mmu.LittleEndianAddr(this.mmu.LowOrderByte, this.mmu.HighOrderByte);
                    let decodedString = ""; // Empty string to collect decoded characters
                    let loop = true;
            
                    while (loop) {
                        const dataToDecode: number = this.mmu.ReadImmediate(this.LittleEndianStore);
            
                        if (dataToDecode !== 0x00) {
                            decodedString += Ascii.decode(dataToDecode); // Appending Character to string
                            this.LittleEndianStore++;
                        } else {
                            loop = false; // Exit the loop when get to 0x00
                        }
                    }
            
                    console.log(decodedString); 
                    this.step = 0x06;  //Moves to last step (IntCheck)
                }
                break;
                
            default:
                break;
        }                
                
        }
    

    private execute2():void{
        switch (this.IR){
            case 0xEE:
                this.tempStore++;
                this.step = 0x05;
                break;
        }



    }

    private writeBack():void{
        switch (this.IR){
            case 0xEE:
                this.mmu.writeImmediate(this.LittleEndianStore, this.tempStore);
                this.step = 0x06;
                break;
        }

    }

    private interruptCheck():void{
        const interrupt: Interrupt | null = this.interruptController.handleNextInterrupt();

        if (interrupt) {
            this.log(`Processing interrupt: ${interrupt.deviceName}`);
            // Perform interrupt-specific actions inline here, or log the key pressed
            if (interrupt.outputBuffer) {
                this.log(`Key pressed: ${interrupt.outputBuffer[interrupt.outputBuffer.length - 1]}`);
            }
        } else {
            this.log("No pending interrupts.");
        }

        this.step = 0x00;                           

        
       

    }

















}
