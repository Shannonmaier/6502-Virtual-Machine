export class Ascii {
    private static charToHex: Map<string, number> = new Map();
    private static hexToChar: Map<number, string> = new Map();

    //Map entries, ACII Characters
    static {
        const entries: [string, number][] = [
            ["\n", 0x0A], [" ", 0x20], ["!", 0x21], [".", 0x2E], ["-", 0x2D], // Special characters
            ["A", 0x41], ["B", 0x42], ["C", 0x43], ["D", 0x44], ["E", 0x45], ["F", 0x46], // Uppercase
            ["G", 0x47], ["H", 0x48], ["I", 0x49], ["J", 0x4A], ["K", 0x4B], ["L", 0x4C],
            ["M", 0x4D], ["N", 0x4E], ["O", 0x4F], ["P", 0x50], ["Q", 0x51], ["R", 0x52],
            ["S", 0x53], ["T", 0x54], ["U", 0x55], ["V", 0x56], ["W", 0x57], ["X", 0x58],
            ["Y", 0x59], ["Z", 0x5A], // All Uppercase
            ["a", 0x61], ["b", 0x62], ["c", 0x63], ["d", 0x64], ["e", 0x65], ["f", 0x66], // Lowercase
            ["g", 0x67], ["h", 0x68], ["i", 0x69], ["j", 0x6A], ["k", 0x6B], ["l", 0x6C],
            ["m", 0x6D], ["n", 0x6E], ["o", 0x6F], ["p", 0x70], ["q", 0x71], ["r", 0x72],
            ["s", 0x73], ["t", 0x74], ["u", 0x75], ["v", 0x76], ["w", 0x77], ["x", 0x78],
            ["y", 0x79], ["z", 0x7A], // All Lowercase
            ["0", 0x30], ["1", 0x31], ["2", 0x32], ["3", 0x33], ["4", 0x34], ["5", 0x35],
            ["6", 0x36], ["7", 0x37], ["8", 0x38], ["9", 0x39], // Numbers
        ];

        // Add entries to both maps (so can look up both ways)
        for (const [char, hex] of entries) {
            this.charToHex.set(char, hex);
            this.hexToChar.set(hex, char);
        }
    }

    
    public static decode(hex: number): string {
        const char = this.hexToChar.get(hex);
        if (char === undefined) {
            throw new Error("Error: Unrecognized ASCII byte");
        }
        return char;
    }
    
     
    public static encode(char: string): number {
        const hex = this.charToHex.get(char);
        if (hex === undefined) {
            throw new Error("Error: Unrecognized character");
        }
        return hex;
    }

   
}
