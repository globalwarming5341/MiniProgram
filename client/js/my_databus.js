
import Pool from './my_pool'

let instance;
let pool = new Pool();

export default class DataBus {
    constructor() {
        if (instance) {
            return instance;
        }
        instance = this;
        this.sprites = [];
        this.players = [];
        this.survivors = [];
        this.animations = [];
        this.frame = 0;
        this.client_width = 0;
        this.client_height = 0;
        this.reset();
    }

    reset() {
        this.animations = [];
        this.players = [];
    }

    static getDistanceBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    static getAngleBetweenPoints(x1,y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }


}