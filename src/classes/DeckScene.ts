import { Container } from 'pixi.js'
import { default as Scene, SizeParams } from './Scene'

// The deck of cards scene
class DeckScene extends Scene {
    constructor() {
        super();
        this.name = "Deck of Cards";
    }

    // Update on each tick.
    update(delta: number): void {
        
    }

    // Update when the window is resized.
    setSize({width, height}:SizeParams): void {
        super.setSize({width, height});
    }
}

export default DeckScene;
