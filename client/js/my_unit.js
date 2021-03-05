import Sprite from './my_sprite'
import DataBus from './my_databus'

const DEATH_FALG_PATH = 'images/death_flag.png';
let databus = new DataBus();

export default class Unit extends Sprite {
    constructor(x, y, width, height, imgSrc, speed = 5) {
        super(x, y, width, height, imgSrc);
        this.imgNormalPath = imgSrc;
        this.isMoving = false;
        this.displacement = 0;
        this.moveDirection = 0;
        this.isAlive = true;
        this.dx = 0;
        this.dy = 0;
        this.tx = 0;
        this.ty = 0;
        this.speed = speed;
        this.ghostBall = null;
        this.boundaryMinX = this.width / 2
        this.boundaryMaxX = databus.client_width - this.width / 2
        this.boundaryMinY = this.height / 2
        this.boundaryMaxY = databus.client_height - this.height / 2
    }

    revive() {
        this.isAlive = true;
        this.img.src = this.imgNormalPath
    }

    die() {
        this.stop();
        this.isAlive = false;
        this.img.src = DEATH_FALG_PATH
    }

    stop() {
        this.isMoving = false;
        this.displacement = 0;
        this.moveDirection = 0;
        this.dx = 0;
        this.dy = 0;
        this.tx = 0;
        this.ty = 0;
    }

    move() {
        if (this.isMoving) {
            if (this.displacement <= this.speed) {
                this.x = this.tx;
                this.y = this.ty;
                this.stop();
            } else {
                this.x = this.x + this.dx;
                this.y = this.y + this.dy;
                this.displacement = this.displacement - this.speed;
            }
        }
        
    }

    issueMove(targetX, targetY) {
        this.stop();
        if (targetX <= this.boundaryMinX) {
            targetX = this.boundaryMinX;
        } else if (targetX >= this.boundaryMaxX) {
            targetX = this.boundaryMaxX
        }
        if (targetY < this.boundaryMinY) {
            targetY = this.boundaryMinY;
        } else if (targetY >= this.boundaryMaxY) {
            targetY = this.boundaryMaxY
        }
        this.isMoving = true;
        this.tx = targetX;
        this.ty = targetY;
        this.displacement = Math.sqrt(Math.pow(targetX - this.x, 2) + Math.pow(targetY - this.y, 2));
        this.moveDirection = Math.atan2((targetY - this.y) , (targetX - this.x));
        this.dx = Math.cos(this.moveDirection) * this.speed;
        this.dy = Math.sin(this.moveDirection) * this.speed;
        
    }
}