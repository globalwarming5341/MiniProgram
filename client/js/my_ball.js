
import Sprite from './my_sprite'
import DataBus from './my_databus'
import Sound from './my_sound'
import Animation from './my_animation'
let databus = new DataBus();
let sound = new Sound();

const ANI_BALL_REACH_PATH = 'images/ball_reach.png';
const ANI_BALL_REACH_WIDTH = 80;
const ANI_BALL_REACH_HEIGHT = 80;

export default class GhostBall extends Sprite {
    constructor(x, y, width, height, imgSrc) {
        super(x, y, width, height, imgSrc);
        this.isMoving = false;
        this.speed = 0;
        this.targetUnit = null;
    }

    move() {
        if (this.isMoving) {
            let distance = DataBus.getDistanceBetweenPoints(this.x, this.y, this.targetUnit.x, this.targetUnit.y);
            if (distance > 13) {
                let angle = DataBus.getAngleBetweenPoints(this.x, this.y, this.targetUnit.x, this.targetUnit.y);
                if (this.speed < 12) {
                    this.speed = this.speed + 1;
                }
                this.x = this.x + parseInt(Math.cos(angle) * this.speed);
                this.y = this.y + parseInt(Math.sin(angle) * this.speed);
            } else {
                this.stop();
                this.bindTarget();
            }
        } else {
            this.x = this.targetUnit.x;
            this.y = this.targetUnit.y;
        
            
        }
    }

    bindTarget() {
        Animation.playAnimationOnce(this.targetUnit.x, this.targetUnit.y, ANI_BALL_REACH_WIDTH, ANI_BALL_REACH_HEIGHT, ANI_BALL_REACH_PATH, 5, 20, 192);    
        sound.playBallReach();
        this.targetUnit.ghostBall = this;
    }

    stop() {
        this.isMoving = false;
        this.speed = 0;
    }

    moveToPlayerUnit(u) {
        sound.playThrow();
        if (this.targetUnit) {
            this.targetUnit.ghostBall = null;
        }
        this.targetUnit = u;
        let distance = DataBus.getDistanceBetweenPoints(this.x, this.y, this.targetUnit.x, this.targetUnit.y);
        if (distance > 60) {
            this.isMoving = true;
        } else {
            this.bindTarget();
        }
    }
}