import "./styles/index.css";
import App from "./classes/App"
import DeckScene from "./classes/DeckScene"
import TextImageScene from "./classes/TextImageScene"
import FireScene from "./classes/FireScene"
import { Assets, Texture } from "pixi.js"

// Function to set everything up
async function init() {
    // Get the root node to append our application to
    const appRoot = document.getElementById("appRoot");
    
    // Create the application
    const app = new App(appRoot);
    
    // Preload images
    const cardSprite = await Assets.load("assets/catMaybe.png") as Texture;
    
    // Add the scenes
    app.addScene(new DeckScene({
        sprite: cardSprite,
        cardCount: 144,
        moveDuration: 2000,
        waitDuration: 1000
    }));
    app.addScene(new TextImageScene({
        updatePeriod: 2000,
        textures: [cardSprite],
        words: ["Cat", "Meow", "Hello", "Purrfect"],
        fontSizeRange: {
            max: 60,
            min: 10
        },
        color: "black"
    }));

    const fireParticle = await Assets.load("assets/fireParticle.png") as Texture;

    app.addScene(new FireScene({
        particlePeriod: 100,
        texture: fireParticle,
        particleCount: 10,
        upAcceleration: 0.1,
        startVelocityScatter: 0.5,
        randomWalkAccelerationAmount: 0.1,
    }))
}

// Start the application!
init();
