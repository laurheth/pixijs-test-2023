import { Container, Sprite, Ticker, Texture } from 'pixi.js'
import { default as Scene, SizeParams } from './Scene'

// Format for starting deck data
interface Deck {
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
class DeckScene extends Scene {

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
        this.name = "Deck of Cards";
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
                card.update(0);
                this.movingCards.splice(i, 1);
            }
        }
    }

    // Update when the window is resized.
    setSize({width, height}:SizeParams): void {
        super.setSize({width, height});
        const padding = 10;
        // Update deck positions
        console.log(width, height);
        this.startDeck.container.x = padding;
        this.endDeck.container.x = width - padding - this.cardSize.width;
        console.log(this.startDeck.container);

        // vertical position should be the same for both decks
        const yPosition = height / 2 - this.cardSize.height / 2 + this.deckSize / 2
        this.startDeck.container.y = yPosition;
        this.endDeck.container.y = yPosition;

        // Update the positions of the cards
        this.startDeck.cards.forEach(card => card.update(0));
        this.endDeck.cards.forEach(card => card.update(0));
    }
}

interface CardParams {
    sprite: Texture;
    startIndex: number;
    endIndex: number;
    duration: number;
    startDeck: Deck;
    endDeck: Deck;
}

// Class for one card
class Card {
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

export default DeckScene;
