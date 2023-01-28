import { Container, Sprite, Texture, Ticker } from "pixi.js"
import { default as Scene, SizeParams } from './Scene'
import TextImageCombiner from "./TextImageCombiner";

interface TextImageSceneParams {
    // Time between each update in milliseconds
    updatePeriod: number;
    // Array of textures to generate sprites from
    textures: Texture[];
    // Array of words to shuffle
    words: string[];
    // Font size range
    fontSizeRange: {min:number, max:number};
    // Font color
    color: string | Array<string> | number | Array<number> | CanvasGradient | CanvasPattern;
}

export default class TextImageScene extends Scene {
    
    // Duration between updates in frames
    duration: number;

    // Elapsed (ideal) frames
    elapsed: number;

    // Container with some text and images
    textContainer: Container;

    // Possible textures to use
    textures: Texture[];

    // Possible words to use
    words: string[];

    // Font size range to choose
    fontSizeRange: {min:number, max:number};

    // Color for the text
    color: string | Array<string> | number | Array<number> | CanvasGradient | CanvasPattern

    // Center of the stage
    stageCenter: {x:number, y:number}

    constructor({updatePeriod, textures, words, fontSizeRange, color}:TextImageSceneParams) {
        super()
        this.duration = updatePeriod * Ticker.targetFPMS;
        this.elapsed = 0;
        this.textures = textures
        this.words = words;
        this.color = color;
        this.fontSizeRange = fontSizeRange;
        this.stageCenter = {x:0, y:0};
        this.generateContainer();
    }
    
    // Called when updating the size of the stage
    setSize({width, height}: SizeParams): void {
        this.stageCenter.x = width / 2;
        this.stageCenter.y = height / 2;
        this.positionContainer();
    }

    // Put the textContainer in the middle.
    positionContainer() {
        if (this.textContainer && !this.textContainer.destroyed) {
            this.textContainer.x = this.stageCenter.x - this.textContainer.width / 2;
            this.textContainer.y = this.stageCenter.y - this.textContainer.height / 2;
        }
    }

    // Called by the ticker
    update(delta: number): void {
        this.elapsed += delta;
        if (this.elapsed > this.duration) {
            this.elapsed -= this.duration;
            this.removeOldContainer();
            this.generateContainer();
        }
    }

    // Throw out the old container
    removeOldContainer() {
        this.container.removeChild(this.textContainer);
        this.textContainer.destroy();
    }

    // Generate a new array of text and sprites
    generateContainer() {
        const array:Array<Sprite|string> = [];
        for (let i=0; i<3; i++) {
            // Word or sprite?
            if (0.5 > Math.random()) {
                const randomTexture : Texture = this.getRandomElement(this.textures);
                array.push(Sprite.from(randomTexture));
            } else {
                array.push(this.getRandomElement(this.words));
            }
        }

        const fontSize:number = Math.floor(Math.random() * (this.fontSizeRange.max - this.fontSizeRange.min)) + this.fontSizeRange.min;

        this.textContainer = TextImageCombiner.combineStringsSprites({
            array,
            fontSize,
            color: this.color
        })
        this.container.addChild(this.textContainer);
        this.positionContainer();
    }

    // Helper method to get a random element of an array
    getRandomElement<Type>(array: Array<Type>): Type {
        const randomIndex = Math.floor(Math.random() * array.length);
        return array[randomIndex];
    }
}