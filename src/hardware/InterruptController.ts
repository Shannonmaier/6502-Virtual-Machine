import { Hardware } from "./Hardware";
import { Interrupt } from "./imp/Interrupt";
import { ClockListener } from "./imp/ClockListener";

export class InterruptController extends Hardware implements ClockListener {
    private interruptQueue: Interrupt[] = [];
    private devices: Interrupt[] = [];

    constructor(id: number = 0, name: string = "InterruptController") {
        super(id, name);
    }

    //Takes in a device that can generate interrupts
    public registerDevice(device: Interrupt): void {
        this.devices.push(device);
    }

    //Adds a device to the queue and reorders queue based on priority
    public acceptInterrupt(device: Interrupt): void {
        this.interruptQueue.push(device);
        this.interruptQueue.sort((a, b) => b.priority - a.priority);
    }

    //Removes interupt on top of queue and returns it to be processed
    public handleNextInterrupt(): Interrupt | null {
        if (this.interruptQueue.length > 0) {
            const nextInterrupt = this.interruptQueue.shift(); // Return and also remove the highest-priority interrupt
            return nextInterrupt;
        }
        return null;
    }
    
    

    public pulse(): void {
        this.logQueue(); 
        const interrupt = this.handleNextInterrupt();
        if (interrupt) {
            this.log(`Processing interrupt: ${interrupt.deviceName}`);
        }
    }


    
    
    public logQueue(): void {
        if (this.interruptQueue.length === 0) {
            this.log("Interrupt queue is empty."); //If nothing in interrupt queue
        } else { // if anything in interrupt queue
            this.log("Current Interrupt Queue:");
            this.interruptQueue.forEach((interrupt, index) => {
                this.log(
                    `Queue Position ${index}: Device ${interrupt.deviceName}, Key: ${interrupt.outputBuffer?.slice(-1)[0]}, Priority: ${interrupt.priority}`
                );
            });
        }
    }
    
    
}
