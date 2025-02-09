/*------------------
Hardware.ts
----------------*/

export class Hardware {
    public Hardwarename: string;
    private id: number;
    public debug: boolean;

    constructor (id: number, name: string){
        this.id=id;
        this.Hardwarename = name;
        this.debug=true;
    }

    public log(message:string): void{
        if (this.debug){
            const time = Date.now();
            console.log(`[HW - ${this.Hardwarename} id: ${this.id} - ${time}]: ${message}`);
            

        }
        
    }

    public start(): void{
        this.log("Starting...");
    }

    public turnOff(): void{
        this.log("Turning off....");
    }

    public hexLog
    

}

export function hexLog(number: number, length: number): string {
    //Change given number to hexidecimal
    let hexString = number.toString(16).toUpperCase()

    //Add leading zeroes where needs
    while (hexString.length < length) {
        hexString = '0' + hexString;
    }
    //Return the hex number
    return hexString;
}

