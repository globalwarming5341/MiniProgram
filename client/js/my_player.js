
import Sprite from './my_sprite'
import Sound from './my_sound'
import Unit from './my_unit'
import DataBus from './my_databus'

let databus = new DataBus();

export default class Player {
    constructor(id = -1, name = 'null') {
        
        this.unit = null;
        this.id = id;
        this.name = name;
        this.orderSet = [];
        this.online = true;
        
        databus.players.push(this);
    }

    createUnit(x, y, width, height, imgSrc, speed = 5) {
        this.unit = new Unit(x, y, width, height, imgSrc, speed);
    }
 
    
}