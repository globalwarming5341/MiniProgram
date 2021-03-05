
import Sprite from './my_sprite'


export default class Ghost extends Sprite {
    constructor(x, y, width, height, imgSrc, speed = 5) {
        super(x, y, width, height, imgSrc);
        this.isMoving = true;
        this.speedX = 0;
        this.speedY = 0;
        this.acceleration = 0;
        this.targetUnit = null;
    }

    stop() {
        this.isMoving = false;
        this.speedX = 0.0;
        this.speedY = 0.0;
        this.acceleration = 0.0;
        this.targetUnit = null;
    }

    selectTargetUnit(u) {
        this.targetUnit = u;
    }

    move() {
        if (this.isMoving) {
            if (this.x < this.targetUnit.x) {
                this.speedX = this.speedX + this.acceleration;
            } else {
                this.speedX = this.speedX - this.acceleration;
            }
            if (this.y < this.targetUnit.y) {
                this.speedY = this.speedY + this.acceleration;
            } else {
                this.speedY = this.speedY - this.acceleration;
            }

            this.x = this.x + this.speedX;
            this.y = this.y + this.speedY;
            
            if (this.speedX < -5) {
                this.speedX = -5;
            } else if (this.speedX > 5) {
                this.speedX = 5;
            }
            if (this.speedY < -5) {
                this.speedY = -5;
            } else if (this.speedY > 5) {
                this.speedY = 5;
            }
        }
        
    }


    


}