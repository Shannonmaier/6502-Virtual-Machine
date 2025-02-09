export interface Interrupt {
    irq: number; // IRQ number for the device
    priority: InterruptPriority; // Priority of the interrupt
    deviceName: string; // Name of the device generating the interrupt
    inputBuffer?: any[]; // Optional input buffer
    outputBuffer?: any[]; // Optional output buffer

   
}

export enum InterruptPriority {
    LOW = 1,
    NORMAL = 2,
    HIGH = 3,
    HIGHER = 4,
}

