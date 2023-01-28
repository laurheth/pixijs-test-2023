import { Container } from 'pixi.js';

export interface SizeParams {
    width: number;
    height: number;
}

// Base class I want to use for the various scenes
abstract class Scene {
    // The name of this scene.
    name: String;

    // The container holding the scene contents
    container: Container;

    // Update method, to be called via the ticker
    abstract update(delta:number): void;

    // Resize method, to be called when the window size is changed, and at the start.
    abstract setSize(size:SizeParams): void;

    constructor() {
        this.container = new Container();
    }
}

export default Scene;
