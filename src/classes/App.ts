import { Application, Text } from 'pixi.js';
import Scene from './Scene';

// Main class for our application
class App {
    // Main pixi.js application object
    pixiApp: Application;
    
    // Element the application will be appended to
    appRoot: HTMLElement;

    // Collection of scenes
    scenes: Scene[];

    // The currently active scene
    activeScene: Scene;

    // Text object to show the current Frames Per Second
    fpsText: Text;

    // Main constructor
    constructor(rootNode: HTMLElement) {
        this.appRoot = rootNode;

        // Initialize the application object
        this.pixiApp = new Application({
            backgroundColor: "black",
            autoDensity: true
        });

        // Put the canvas in appRoot
        this.appRoot.append(this.pixiApp.view as HTMLCanvasElement);

        // Detect when the window is resized, and update the renderer to accomodate.
        window.onresize = () => this.canvasResize();
        this.canvasResize();

        // Initialize the scenes array
        this.scenes = [];

        // Setup the FPS counter
        this.fpsText = new Text("FPS : 0", {
            fontSize: 30,
            fill: "white"
        });

        this.pixiApp.stage.addChild(this.fpsText);

        // Set the handler for tick events, kicking things into motion
        this.pixiApp.ticker.add(delta => this.update(delta))
        this.pixiApp.ticker.start();
    }

    // Add a scene to the scene list, and to the stage.
    addScene(newScene:Scene): void {
        this.scenes.push(newScene);

        // If there's no active scene, grab the first one we get.
        if (!this.activeScene) {
            this.activeScene = newScene;
            newScene.container.visible = true;
        } else {
            newScene.container.visible = false;
        }
        newScene.setSize(this.pixiApp.stage);
        this.pixiApp.stage.addChild(newScene.container);
    }

    // Resize the canvas/renderer to fit appRoot
    canvasResize(): void {
        this.pixiApp.view.width = this.appRoot.clientWidth;
        this.pixiApp.view.height = this.appRoot.clientHeight;
        this.pixiApp.renderer.resize(this.appRoot.clientWidth, this.appRoot.clientHeight);

        // Propogate the resize down
        this.scenes.forEach(scene => scene.setSize(this.pixiApp.stage));
    }

    // Run every timestep.
    update(delta:number): void {
        // Update the FPS counter
        this.fpsText.text = `FPS : ${this.pixiApp.ticker.FPS.toFixed(1)}`;
        // Update the currently active scene
        this.activeScene?.update(delta);
    }
}

export default App;
