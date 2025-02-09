/*--------
System.ts
----------*/

// import statements for hardware
import {Cpu} from "./hardware/Cpu";
import {Hardware} from "./hardware/Hardware";
import { Memory } from "./hardware/Memory";
import { Clock } from "./hardware/Clock";
import {MMU} from "./hardware/MMU"
import { InterruptController } from "./hardware/InterruptController";
import { Keyboard } from "./hardware/Keyboard";
import { InterruptPriority } from "./hardware/imp/Interrupt";






/*
    Constants
 */
// Initialization Parameters for Hardware
// Clock cycle interval
const CLOCK_INTERVAL= 100;               // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.


export class System extends Hardware{
    private _InterruptController: InterruptController = null;
    private _CPU : Cpu = null;
    private _Memory: Memory = null;
    private _Clock: Clock = null;
    private _MMU: MMU = null;
    private _Keyboard: Keyboard = null;
    public running: boolean = false;


    constructor(id: number = 0, name: string = "System") {
        super(id, name);
        this._Memory = new Memory();
        this._MMU = new MMU(this._Memory);
        this._InterruptController = new InterruptController();
        this._CPU = new Cpu(this._MMU, this, this._InterruptController);
        this._Clock = new Clock();
        this._Keyboard = new Keyboard(1, InterruptPriority.NORMAL, this._InterruptController);


        this._Clock.addListener(this._CPU);
        this._Clock.addListener(this._Memory);
        this._Clock.addListener(this._InterruptController);

        this._InterruptController.registerDevice(this._Keyboard);



        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */
        this.startSystem();

    }

    public startSystem(): boolean {
        //Used to test - switches, can do for any part of hardware
        this._Memory.debug = true;
       

        this.log("created")
        this._CPU.log("created");
        this._Memory.log("created - Addressable space : 65536");
        this._MMU.log("created");
        this._Clock.log("created");

        
        //Initializing memory and displaying memory up to 0x0014
        this._Memory.initializeMemory();  // Initialize memory

        //writing the static program to memory
        const program = [ 0xA2, 0x03, 0xFF, 0x06, 0x00, 0x00, 0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20, 0x57, 0x6F,
            0x72, 0x6C, 0x64, 0x21, 0x0A, 0x00];
        this._MMU.loadProgram(0x0000, program);

        //Dump  the memory from the program you just put in
        this._MMU.memoryDump(0x0000,0x0009);
        
        this._Clock.startClock(CLOCK_INTERVAL);
        

        return true;
    }

    public stopSystem(): boolean {
        this._Clock.stopClock();//Stop clock if system stops
        return false;

    }
}

let system: System = new System();
