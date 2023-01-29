import { Texture, Sprite, utils } from "pixi.js"

interface FireParticleProperties {
    texture: Texture;
    expectedLifetime: number;
}

export default class FireParticle {
    // Sprite for this particle
    sprite: Sprite;
    // Current particle velocity
    velocity: {x: number, y:number};
    // How long we expect this particle to exist
    expectedLifetime: number;

    // How long it has existed
    elapsed: number;

    constructor({texture, expectedLifetime}:FireParticleProperties) {
        this.sprite = Sprite.from(texture);
        // Start invisible to make it a bit nicer
        this.sprite.visible = false;
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.velocity = {x:0, y:0};
        this.expectedLifetime = expectedLifetime;
    }

    resetProperties(startVelocity: {x:number, y:number}) {
        this.velocity = startVelocity;
        this.sprite.x = 0;
        this.sprite.y = 0;
        this.sprite.visible = true;
        this.elapsed = 0;
        this.sprite.tint = 0xFFFF00;
        this.sprite.parent.setChildIndex(this.sprite, this.sprite.parent.children.length - 1);
    }

    update(delta: number, acceleration:{x:number, y:number}) {
        this.velocity.x += delta * acceleration.x;
        this.velocity.y += delta * acceleration.y;
        
        this.sprite.x += delta * this.velocity.x;
        this.sprite.y += delta * this.velocity.y;
        this.elapsed += delta;
        const fraction = Math.min(1, this.elapsed / this.expectedLifetime);
        this.sprite.tint = utils.rgb2hex([1, 1 - fraction, 0]);
    }
}