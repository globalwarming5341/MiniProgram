

let canvas = wx.createCanvas();

let ctx = canvas.getContext('2d')
export default class Painter {
    constructor() {
        this.client_width = 300;
        this.client_height = 520;
        this.window_width = wx.getSystemInfoSync().windowWidth;
        this.window_height = wx.getSystemInfoSync().windowHeight;
        this.origin_x = parseInt((this.window_width - this.client_width) / 2);
        this.origin_y = parseInt((this.window_height - this.client_height) / 2);
        ctx.translate(this.origin_x, this.origin_y);   
    }

    fadeOut() {
        let alpha = 1.0;
        ctx.globalAlpha = alpha;
        let fadeTimer = setInterval(function () {
            if (alpha <= 0) {
                ctx.globalAlpha = 0;
                clearInterval(fadeTimer);
            } else {
                alpha = alpha - 0.02;
                ctx.globalAlpha = alpha;
            }
        }, 40)
    }

    fadeIn() {
        let alpha = 0.0;
        ctx.globalAlpha = alpha;
        let fadeTimer = setInterval(function () {
            if (alpha >= 1.0) {
                ctx.globalAlpha = 1.0;
                clearInterval(fadeTimer);
            } else {
                alpha = alpha + 0.02;
                ctx.globalAlpha = alpha;
            }
        }, 40)
    }


    drawRect(x, y, width, height, color) {
        ctx.fillStyle = color;
        //ctx.fillRect(x - width / 2,y - height / 2,width,height);
        ctx.fillRect(x, y, width, height);
    }

    drawImage(img, x, y, width, height) {
        ctx.drawImage(img, x - width / 2, y - height / 2, width, height);
    }

    drawAnimation(img, x, y, width, height, sx, sy, sWidth, sHeight) {
        ctx.drawImage(img, sx, sy, sWidth, sHeight, x - width / 2, y - height / 2, width, height);
    }

    drawText(content, x, y, size, color, fontFamily = 'Arial', align = 'start') {
        ctx.textAlign = align;
        ctx.font = size + 'px ' + fontFamily;
        ctx.fillStyle = color;
        ctx.fillText(content, x, y);
    }

    drawPlayerNameToUnit(player, color = '#58b1f0') {
        this.drawText(player.name, player.unit.x, player.unit.y + 25, 10, color, 'Arial', 'center')
    }

    clear(index) {
        switch (index) {
            case 0:
                ctx.clearRect(0 - this.origin_x, 0 - this.origin_y, this.window_width, this.window_height);
                ctx.fillStyle = 'white';
                ctx.fillRect(0 - this.origin_x, 0 - this.origin_y, this.window_width, this.window_height);
                break;
            case 1:
                ctx.clearRect(0 - this.origin_x, 0 - this.origin_y, this.window_width, this.window_height);
                ctx.fillStyle = 'black';
                ctx.fillRect(0 - this.origin_x, 0 - this.origin_y, this.window_width, this.window_height);
                ctx.strokeStyle = 'gray';
                ctx.strokeRect(0, 0, this.client_width, this.client_height);
                break;
            default: break;
        }
        
    }
}