import { BLEND_MODES, ParticleContainer, Sprite, Texture, Ticker, utils } from 'pixi.js';
import { default as Scene, SizeParams } from './Scene'

interface FireParticleProperties {
    texture: Texture;
    expectedLifetime: number;
}

class FireParticle {
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

interface FireSceneParams {
    // Time between each particle emission, in milliseconds
    particlePeriod: number;
    texture: Texture;
    particleCount: number;
    upAcceleration: number;
    startVelocityScatter: number;
    randomWalkAccelerationAmount: number;
}

export default class FireScene extends Scene {

    // Particle container to hold the fire
    particleContainer: ParticleContainer;

    // Cache of particles
    particleArray: FireParticle[];

    // How long between each particle, in frames
    particlePeriod: number;

    // Frames elapsed
    elapsed: number;

    // Uniform up acceleration
    upAcceleration: number;

    // Amount to scatter the start velocity
    startVelocityScatter: number;

    // Amount to simulate wind and turbulence
    randomWalkAccelerationAmount: number;

    // Sprite size, to help with positioning
    spriteSize: {width:number, height:number}

    constructor({particlePeriod, texture, particleCount, upAcceleration, startVelocityScatter, randomWalkAccelerationAmount}:FireSceneParams) {
        super();
        this.spriteSize = {
            width: texture.width,
            height: texture.height
        }
        this.particlePeriod = particlePeriod * Ticker.targetFPMS;
        this.upAcceleration = upAcceleration;
        this.elapsed = 0;
        this.startVelocityScatter = startVelocityScatter;
        this.randomWalkAccelerationAmount = randomWalkAccelerationAmount;

        this.particleContainer = new ParticleContainer(particleCount, {
            tint: true
        });
        this.particleContainer.blendMode = BLEND_MODES.NORMAL;
        this.container.addChild(this.particleContainer);
        
        // Initialize the particles
        this.particleArray = [];
        for (let i=0; i<particleCount; i++) {
            const newParticle = new FireParticle({
                texture,
                expectedLifetime: this.particlePeriod * particleCount
            });
            this.particleArray.push(newParticle);
            this.particleContainer.addChild(newParticle.sprite);
        }
    }

    // Called by the ticker
    update(delta: number): void {
        this.elapsed += delta;
        if (this.elapsed > this.particlePeriod) {
            this.elapsed -= this.particlePeriod;
            // Get the last particle and reset it
            const particle = this.particleArray.pop()
            particle.resetProperties({
                x:this.randomSpread(this.startVelocityScatter),
                y:this.randomSpread(this.startVelocityScatter)
            });
            this.particleArray.unshift(particle);
        }
        const acceleration = {x:this.randomSpread(this.randomWalkAccelerationAmount, 0), y:-this.upAcceleration};
        this.particleArray.forEach(particle => {
            // Have slightly different accelerations, but keep depending on the previous value, to make the "wind" feel more believable and uniform.
            acceleration.x = this.randomSpread(this.randomWalkAccelerationAmount, acceleration.x);
            acceleration.y = this.randomSpread(this.randomWalkAccelerationAmount, acceleration.y);
            particle.update(delta, acceleration)
        });
    }

    // Helper function to get a random number with a specified spread
    randomSpread(spread: number, base: number = 0): number {
        let output = base;
        // Add and subtract as a cheap way to get a distribution that sticks to the middle
        output += Math.random() * spread;
        output -= Math.random() * spread;
        return output;
    }

    // Called when the stage is resized
    setSize({width, height}: SizeParams): void {
        this.particleContainer.x = width/2 - this.spriteSize.width / 2;
        this.particleContainer.y = height/2 - this.spriteSize.height / 2;
    }
}