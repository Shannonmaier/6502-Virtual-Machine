import {Hardware} from "./Hardware";
import {ClockListener} from "./imp/ClockListener";

export class Clock extends Hardware{
    
    private timeListeners: ClockListener[] = []; //array to track all of the clockListeners
    private clockIntervalId: NodeJS.Timeout | null = null; //for intervalID within setInterval

    constructor (id: number = 0, name: string = "CLK" ){
        super(id, name);
    }

    public addListener(timeListener:ClockListener):void{
        this.timeListeners.push(timeListener);

    }

    public pulseAll():void{ //pulse all listeners of the Clock interface (memory and CPU)
        this.log("Clock pulse Initialized")
        for (const listener of this.timeListeners) {
            listener.pulse();
        }

    }

    public startClock(interval: number = 1000): void {
        //storing the interval created when using setInterval so that we can clear the interval to stop the clock
        this.clockIntervalId = setInterval(()=> {this.pulseAll();}, interval);
    }

    public stopClock(): void{
        if (this.clockIntervalId){
            clearInterval(this.clockIntervalId)
            this.clockIntervalId = null;//resetting the id back to its original null value
    

        }
    }
        



}