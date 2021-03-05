import Sprite from './my_sprite'
import Pool from './my_pool'
import DataBus from './my_databus'
const __ = {
    timer: Symbol('timer'),
};


let pool = new Pool();
let databus = new DataBus();

export default class Animation extends Sprite{
    constructor(x = 0, y = 0, w = 0, h = 0, imgSrc = '', c = 0, n = 0, s = 0) {
        super(x, y, w, h, imgSrc);
        this.columns = c;
        this.numbers = n;
        this.eachSize = s;
        this.isPlaying = false;
        this.index = -1;
        this.loop = false;
        this.animated = true;
    }

    init(x = 0, y = 0, w = 0, h = 0, imgSrc = '', c = 0, n = 0, s = 0) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.img.src = imgSrc;
        this.columns = c;
        this.numbers = n;
        this.eachSize = s;
        this.isPlaying = false;
        this.index = -1;
        this.loop = false;
        this.visible = true;
        
    }

    drawAnimation(pt) {
        if (this.isPlaying) {
            pt.drawAnimation(this.img, this.x, this.y, this.width, this.height, this.index % this.columns * this.eachSize, parseInt(this.index / this.columns) * this.eachSize, this.eachSize, this.eachSize);
        }
        
    }

    playAnimation(index = 0, loop = false) {
        this.index = index;
        this.loop = loop;
        this.isPlaying = true;
        this.visible = true;
    }

    stop() {
        this.isPlaying = false;
        this.visible = false;
        this.index = -1;
    }

    static playAnimationOnce(x, y, width, height, path, c, n, s) {
        let p = pool.getPoolBySign('animation');
        let attack_animation = null;
        if (p.length) {
            attack_animation = p.shift();
            attack_animation.init(x, y, width, height, path, c, n, s);
        } else {
            attack_animation = new Animation(x, y, width, height, path, c, n, s);
        }
        attack_animation.playAnimation(0, false);
    }

}