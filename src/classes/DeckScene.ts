import { Container, Sprite, Ticker, Texture } from 'pixi.js'
import { default as Scene, SizeParams } from './Scene'
import Card from "./Card"

// Format for starting deck data
export interface Deck {
    container: Container;
    cards: Card[];
}

// Parameters to set up the deck scene
interface DeckSceneParams {
    // Texture to use for cards.
    sprite: Texture;
    // Number of cards
    cardCount: number;
    // Number of milliseconds for movement to take
    moveDuration: number;
    // Number of milliseconds to wait between cards
    waitDuration: number;
}

// The deck of cards scene
export default class DeckScene extends Scene {

    // Start and end deck
    startDeck: Deck;
    endDeck: Deck;

    // Cards in motion
    movingCards: Card[];

    // Deck size
    deckSize: number;

    // Size of a card, for position calculations
    cardSize: {width:number, height:number}

    // Frames to wait between moving cards
    waitFrames: number;

    // Frames elapsed since last card started moving (targetted, anyway)
    elapsed: number;

    constructor({sprite, cardCount, moveDuration, waitDuration}:DeckSceneParams) {
        super();
        this.name = "Deck of Sprites";
        this.deckSize = cardCount;
        this.waitFrames = waitDuration * Ticker.targetFPMS;
        this.elapsed = 0;
        this.movingCards = [];

        // Setup the two decks
        this.startDeck = {
            container: new Container(),
            cards: []
        }

        this.endDeck = {
            container: new Container(),
            cards: []
        }

        this.startDeck.container.sortableChildren = true;
        this.endDeck.container.sortableChildren = true;

        this.container.addChild(this.startDeck.container);
        this.container.addChild(this.endDeck.container);

        // Fill the first deck with cards
        const durationInFrames = moveDuration * Ticker.targetFPMS;
        for (let i=0; i<cardCount; i++) {
            const newCard = new Card({
                sprite: sprite,
                startIndex: i,
                endIndex: cardCount - i - 1,
                duration: durationInFrames,
                startDeck: this.startDeck,
                endDeck: this.endDeck
            });
            this.startDeck.cards.push(newCard);

        }
        // Remember the size of a card, for future reference
        if (this.startDeck.cards[0]) {
            this.cardSize = {
                width: this.startDeck.cards[0].card.width,
                height: this.startDeck.cards[0].card.height,
            }
        }
    }

    // Update on each tick.
    update(delta: number): void {
        this.elapsed += delta;
        if (this.elapsed > this.waitFrames) {
            // Start another card in motion
            this.elapsed -= this.waitFrames;
            const nextCard = this.startDeck.cards.pop();
            // Make sure there actually is a next card
            if (nextCard) {
                nextCard.start();
                this.movingCards.unshift(nextCard);
                this.startDeck.container.removeChild(nextCard.card);
                this.container.addChild(nextCard.card);
            }
        }
        // Update positions of the moving cards
        // Go from high to low to make it easier to delete elements as we go.
        for (let i=this.movingCards.length-1; i>=0; i--) {
            const card = this.movingCards[i];
            card.update(delta);
            if (!card.moving) {
                // Add card to the end deck and remove from the movingCards array
                this.endDeck.cards.push(card);
                this.endDeck.container.addChild(card.card);
                this.movingCards.splice(i, 1);
                card.update(0);
            }
        }
    }

    // Update when the window is resized.
    setSize({width, height}:SizeParams): void {
        const padding = 10;
        // Update deck positions
        this.startDeck.container.x = padding;
        this.endDeck.container.x = width - padding - this.cardSize.width;

        // vertical position should be the same for both decks
        const yPosition = height / 2 - this.cardSize.height / 2 + this.deckSize / 2
        this.startDeck.container.y = yPosition;
        this.endDeck.container.y = yPosition;

        // Update the positions of the cards
        this.startDeck.cards.forEach(card => card.update(0));
        this.endDeck.cards.forEach(card => card.update(0));
    }
}
