import { Container, Sprite, Text } from "pixi.js"

interface CombineStringsSpriteParams {
    // Array of strings and sprites that we wish to combine.
    array:Array<Sprite|string>;
    // Font size to use.
    fontSize?: number;
    // Font color
    color?: string | Array<string> | number | Array<number> | CanvasGradient | CanvasPattern;
}

export default class TextImageCombiner {
    // Takes an array of strings and sprites, combines them within a container, and then returns the container
    static combineStringsSprites({array, fontSize = 10, color = "black"}: CombineStringsSpriteParams): Container {
        // Container we're going to return.
        const container = new Container();
        let x = 0;
        
        // Format the array of things.
        const formattedArray: Array<Sprite|Text> = array.map(item => {
            if (item instanceof Sprite) {
                // Make it fit in a line of text
                const scale = fontSize / item.height;
                item.scale.x = scale;
                item.scale.y = scale;
                return item;
            } else {
                return new Text(item, {
                    fontSize: fontSize,
                    fill: color
                });
            }
        });

        // Put everything into the container.
        formattedArray.forEach(item => {
            container.addChild(item);
            item.x = x;
            x += item.width;
        });

        return container;
    }
}