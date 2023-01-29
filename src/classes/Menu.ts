import { Container, Text } from "pixi.js";

interface MenuOptionParams {
    text:string;
    callback:()=>void;
}

// In-game menu to switch scenes
export default class Menu {
    // Main menu container
    container: Container;

    // Buttons
    buttons: Text[];

    // Current font size
    currentFontSize: number;

    constructor() {
        this.container = new Container();
        this.buttons = [];
        this.currentFontSize = 30;
    }

    // Add a new menu option
    addMenuOption({text, callback}:MenuOptionParams) {
        const newText = new Text(text,{
            fill:"white",
            fontSize: this.currentFontSize,
            strokeThickness: 2
        });
        // Set up the positioning and bump up any existing buttons
        this.container.addChild(newText);
        newText.x = -newText.width / 2;
        newText.y = -newText.height;
        newText.resolution = 2;
        this.buttons.forEach(button => button.y -= newText.height);
        this.buttons.push(newText);
        
        // Set up interactions
        newText.interactive = true;
        newText.addEventListener('click', callback);
        newText.addEventListener('touchstart', callback);

        newText.addEventListener('mouseover', ()=>{
            newText.style.fill = "yellow";
        });
        newText.addEventListener('mouseout', ()=>{
            newText.style.fill = "white";
        });
    }

    // Handle changes in screen size.
    setSize({width, height}:{width:number, height:number}) {
        // My intention was 30pt font on ~800px high screen. Obviously this can change dramatically. Try to handle it.
        let fontSize = 30;
        if (height > 800) {
            fontSize = (height / 800) * fontSize;
        }
        // If the screen is tall and narrow, we might overflow on the edges. Check for this and adjust further.
        this.buttons.forEach(button => {
            const expectedWidth = (fontSize / this.currentFontSize) * button.width
            const widthBoundary = 0.9 * width;
            if (expectedWidth > widthBoundary) {
                fontSize *= widthBoundary / expectedWidth;
            }
        });

        // Okay, set it!
        this.currentFontSize = Math.max(Math.floor(fontSize), 10);
        this.buttons.forEach(button=>button.style.fontSize = this.currentFontSize);

        // Now reposition the buttons to fit properly
        let y = 0;
        for (let i=this.buttons.length-1; i>=0; i--) {
            const button = this.buttons[i];
            button.x = -button.width / 2;
            button.y = -button.height - y;
            y += button.height
        }
    }
}