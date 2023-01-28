import { Texture, Sprite } from "pixi.js"
import { Deck } from "./DeckScene"

export interface CardParams {
    sprite: Texture;
    startIndex: number;
    endIndex: number;
    duration: number;
    startDeck: Deck;
    endDeck: Deck;
}

// Class for one card
export default class Card {
    // Sprite for this card
    card: Sprite;
    // Index in deck 1 this card is coming from
    startIndex: number;
    // Index in deck 2 that this card is going to
    endIndex: number;
    // Target duration in frames
    duration: number;
    // Starting deck
    startDeck: Deck;
    // Ending deck
    endDeck: Deck;
    // Progress so far.
    progress: number;
    // Are we moving yet?
    moving: boolean;
    // Have we finished moving from one deck to the other?
    doneMoving: boolean;

    constructor({sprite, startIndex, endIndex, duration, startDeck, endDeck}:CardParams) {
        this.card = Sprite.from(sprite);
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.duration = duration;
        this.startDeck = startDeck;
        this.startDeck.container.addChild(this.card);
        this.endDeck = endDeck;
        this.card.zIndex = startIndex;
        this.progress = 0;
        this.moving = false;
        this.doneMoving = false;
    }

    // Update the position of this card.
    update(delta: number) {
        if (this.moving) {
            this.progress += delta;
            if (this.progress > this.duration) {
                this.progress = this.duration;
                this.stop();
            }
            // Figure out positions
            const moveFraction = this.progress / this.duration;
            const moveVector = [this.endDeck.container.x - this.startDeck.container.x, this.endDeck.container.y - this.startDeck.container.y - this.endIndex + this.startIndex];
            this.card.x = this.startDeck.container.x + moveVector[0] * moveFraction;
            this.card.y = this.startDeck.container.y -this.startIndex + moveVector[1] * moveFraction;
        } else {
            this.card.x = 0;
            this.card.y = this.doneMoving ? -this.endIndex : -this.startIndex;
        }
    }

    // Start moving
    start() {
        this.moving = true;
    }

    // Stop moving
    stop() {
        this.card.zIndex = this.endIndex;
        this.moving = false;
        this.doneMoving = true;
    }
}