
import DataBus from './my_databus'

let databus = new DataBus();

export default class Sprite {
    constructor(x = 0, y = 0, width = 0, height = 0, imgSrc = '') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.img = wx.createImage()
        this.img.src = imgSrc;
        this.visible = true;
        this.animated = false;
        databus.sprites.push(this);

    }

    

    drawToCanvas(pt) {
        if (this.visible) {
            pt.drawImage(this.img, this.x, this.y, this.width, this.height);
        }
    }

    setXY(x, y) {
        this.x = x;
        this.y = y;
    }

    hide() {
        this.visible = false;
    }

    show() {
        this.visible = true;
    }
}