import Painter from './my_painter'
import Player from './my_player'
import Ghost from './my_ghost'
import Sound from './my_sound'
import Animation from './my_animation'
import DataBus from './my_databus'
import GhostBall from './my_ball'
import Pool from './my_pool'

const GHOSTBALL_IMG_PATH = 'images/ghost_ball.png'
const GHOSTBALL_IMG_WIDTH = 15;
const GHOSTBALL_IMG_HEIGHT = 15;
const PLAYER_MAIN_IMG_PATH = 'images/player_main.png'
const PLAYER_OTHER_IMG_PATH = 'images/player_other.png'
const PLAYER_IMG_WIDTH = 30;
const PLAYER_IMG_HEIGHT = 30;
const GHOST_IMG_PATH = 'images/ghost.png'
const GHOST_IMG_WIDTH = 30;
const GHOST_IMG_HEIGHT = 30;
const ANI_GHOST_ATTACK_PATH = 'images/ghost_attack.png';
const ANI_GHOST_ATTACK_WIDTH = 80;
const ANI_GHOST_ATTACK_HEIGHT = 80;
const ANI_GHOST_SHOW_PATH = 'images/ghost_show.png';
const ANI_GHOST_SHOW_WIDTH = 100;
const ANI_GHOST_SHOW_HEIGHT = 100;
const START_BUTTON_PATH = 'images/start_button.png'
const START_BUTTON_WIDTH = 60;
const START_BUTTON_HEIGHT = 40;

const window_width = wx.getSystemInfoSync().windowWidth;
const window_height = wx.getSystemInfoSync().windowHeight;

let databus = new DataBus();
let pool = new Pool();

const special_character_pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？ ]")


export default class Main {
    constructor() {
        this.pt = new Painter();
        this.originX = this.pt.origin_x;
        this.originY = this.pt.origin_y;
        this.netFrame = []
        this.listenKeyboard = null;
        this.keyboardConfirm = null;
        this.isStartToCount = false;
        
        this.playerList = []
        this.isHost = false;
        this.isStart = false;
        this.isRender = false;
        this.waitList = [];
        this.name = '';
        this.preFrame = -1;
        this.aniId = 0;
        this.seed = 0;
        this.mainPlayer = null;
        this.socketId = -1;
        this.init();
        
        this.roomEnter();
        //this.restart();
        
    }

    init() {
        this.sound = new Sound();
        this.initSocket();
        databus.client_width = this.pt.client_width;
        databus.client_height = this.pt.client_height; 
        this.startButtonImage = wx.createImage()
        this.startButtonImage.src = START_BUTTON_PATH;
        this.startButtonPos = [240, 480, START_BUTTON_WIDTH, START_BUTTON_HEIGHT];
    }

    initSocket() {
        wx.onSocketMessage(function (res) {
            if ( res.data.charAt(0) == 'A') {
                this.netFrame.push(res.data);
            } else if (res.data.indexOf('{') == 0) {
                console.log(res);
                let data_patch = JSON.parse(res.data)
                let data_type = data_patch.type;
                let data = data_patch.data;
                if (data_type == 'getId') {
                    this.socketId = data;
                } else if (data_type == 'set') {
                    this[data.property] = data.value;
                } else if (data_type.indexOf('update-') != -1) {
                    let property = data_type.split('-').pop();
                    this[property] = data;
                } else if (data_type == 'game') {
                    if (data.cmd == 'ready') {
                        this.seed = data.time;
                        this.pt.fadeOut();
                        this.createPlayer();
                    }
                } else if (data_type == 'player-leave') {
                    let leave_player = databus.players[data];
                    leave_player.online = false;
                    console.log('Player (' + data + ')' + ' ' + leave_player.name + ' left the party.');  
                    console.log("online:" + databus.players[data].online)
                }
            } else if (res.data == 'game-start') {
                this.isStart = true;
                this.pt.fadeIn();
                this.restart();
                this.initEvent();
                cancelAnimationFrame(this.aniId);
                this.aniId = requestAnimationFrame(this.loop.bind(this))
            }
        }.bind(this));
        wx.onSocketOpen(function (res) {
            let name = this.name;
            wx.sendSocketMessage({
                data: JSON.stringify({
                    type: 'create-player',
                    data: {
                        name: name,
                    },
                })
            });
            wx.offTouchStart();
            wx.offKeyboardComplete();
            this.initStart();

        }.bind(this));
        wx.onSocketClose(function (res) {
            console.log("onSocketClose");
            wx.showModal({
                title: 'Error',
                content: 'Server is unexpectedly closed.',
                showCancel: false,
                confirmText: 'OK',
            })
        });
        wx.onSocketError(function (e) {
            console.log('onSocketError');
            this.name = '';
            wx.showModal({
                title: 'Error',
                content: 'No response from server.',
                showCancel: false,
                confirmText: 'OK',
            })
        })
    }

    initStart() {
        wx.onTouchStart(function (e) {
            let cx = e.touches[0].clientX - this.originX;
            let cy = e.touches[0].clientY - this.originY;
            
            if (this.playerList.length) {
                if (this.playerList[0] == this.name) {
                    
                    if (cx <= this.startButtonPos[0] + this.startButtonPos[2] / 2
                        && cx >= this.startButtonPos[0] - this.startButtonPos[2] / 2  
                        && cy <= this.startButtonPos[1] + this.startButtonPos[3] / 2
                        && cy >= this.startButtonPos[1] - this.startButtonPos[3] / 2) {
                            wx.offTouchStart();
                            let n_palyers = this.playerList.length;
                            wx.sendSocketMessage({
                                data: JSON.stringify({
                                    type: 'game',
                                    data: {
                                        cmd: 'ready',
                                        n_players: n_palyers,
                                        time: Date.now(),
                                    }
                                })
                            })
                            
                    }
                }
            }
        }.bind(this))
    }

    roomEnter() {
        this.listenKeyboard = function (e) {
            wx.showKeyboard({
                defaultValue: '',
                maxLength: 5,
                multiple: false,
                comfirmHold: true,
                confirmType: 'done',
            })
        }
        this.keyboardConfirm = function (res) {
            let value = res.value
            if (!this.name) {
                if (value == '') {
                    wx.showModal({
                        title: 'Error',
                        content: 'Your name can not be empty.',
                        showCancel: false,
                        confirmText: 'OK'
                    });
                } else {
                    if (value.search(special_character_pattern) == -1) {
                        wx.showModal({
                            title: 'Make sure:',
                            content: 'The name will remain constant until the end of the party. Do you really want to name yourself "' + value + '"?',
                            showCancel: true,
                            cancelText: 'No',
                            confirmText: 'Yes',
                            success: function (res) {
                                if (res.confirm) {
                                    this.name = value;
                                    wx.connectSocket({
                                        url: 'wss://shiquying.applinzi.com',
                                    });
                                } else {

                                }
                            }.bind(this)
                        })

                    } else {
                        wx.showModal({
                            title: 'Error',
                            content: 'Your name can not contain special characters.',
                            showCancel: false,
                            confirmText: 'OK'
                        });
                    }
                    
                    
                }
            }
        }.bind(this);
        wx.onTouchStart(this.listenKeyboard);
        wx.onKeyboardComplete(this.keyboardConfirm)
        cancelAnimationFrame(this.aniId);
        this.aniId = requestAnimationFrame(this.roomLoop.bind(this))

    }

    createPlayer() {
        for (let i = 0; i < this.playerList.length; i++) {
            let x = this.random(parseInt(PLAYER_IMG_WIDTH / 2), this.pt.client_width - parseInt(PLAYER_IMG_WIDTH / 2));
            let y = this.random(PLAYER_IMG_HEIGHT / 2, this.pt.client_height - PLAYER_IMG_HEIGHT / 2);
            let player = new Player(i, this.playerList[i]);
            player.createUnit(x, y, PLAYER_IMG_WIDTH, PLAYER_IMG_HEIGHT, PLAYER_OTHER_IMG_PATH, 2)
            if (player.name == this.name) {
                this.mainPlayer = player;
                this.mainPlayer.unit.img.src = PLAYER_MAIN_IMG_PATH;
                this.mainPlayer.unit.imgNormalPath = PLAYER_MAIN_IMG_PATH;
            }
        }
    }

    restart() {
        if (!this.ghostBall) {
            this.ghostBall = new GhostBall(0, 0, GHOSTBALL_IMG_WIDTH, GHOSTBALL_IMG_HEIGHT, GHOSTBALL_IMG_PATH);
        }
        if (!this.ghost) {
            this.ghost = new Ghost(0, 0, GHOST_IMG_WIDTH, GHOST_IMG_HEIGHT, GHOST_IMG_PATH)
        }
        this.ghostBall.setXY(this.pt.client_width / 2, this.pt.client_height / 2)
        this.ghostBall.isMoving = false
        this.ghostBall.hide();
        this.ghost.setXY(this.pt.client_width / 2, this.pt.client_height / 2)
        this.ghost.isMoving = false;
        this.ghost.hide();
        this.sound.playPlayerShow();
        this.wait(3500, function() {
            this.sound.playBeginning();
            this.wait(8500, function() {
                this.ghostBall.isMoving = true;
                this.ghostBall.show();
                Animation.playAnimationOnce(this.ghostBall.x, this.ghostBall.y, ANI_GHOST_ATTACK_WIDTH + 20, ANI_GHOST_ATTACK_HEIGHT + 20, ANI_GHOST_ATTACK_PATH, 5, 20, 192);
                this.throwGhostBallRandomly();
                this.wait(3000, function() {
                    this.sound.playGhostShow();
                    this.ghost.isMoving = true;
                    this.ghost.show();
                    Animation.playAnimationOnce(this.ghost.x, this.ghost.y, ANI_GHOST_SHOW_WIDTH, ANI_GHOST_SHOW_HEIGHT, ANI_GHOST_SHOW_PATH, 5, 20, 192);
                    this.ghost.selectTargetUnit(this.ghostBall.targetUnit);
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    getAliveUnits() {
        let AliveUnits = [];
        for (let i = 0; i < databus.players.length; i++) {
            let u = databus.players[i].unit;
            if (u.isAlive) {
                AliveUnits.push(u);
            }
        }
        return AliveUnits;
    }

    wait(t, f) {
        this.waitList.push([databus.frame, t / 26, f]);
    }

    ghostKill(u) {
        if (this.ghost.isMoving) {
            if (Math.abs(this.ghost.x - u.x) < 30 && Math.abs(this.ghost.y - u.y) < 30) {
                this.ghostBall.targetUnit.ghostBall = null;
                this.ghostBall.targetUnit = null;
                this.ghost.stop();
                u.die();
                Animation.playAnimationOnce(u.x, u.y, ANI_GHOST_ATTACK_WIDTH, ANI_GHOST_ATTACK_HEIGHT, ANI_GHOST_ATTACK_PATH, 5, 10, 192);
                console.log('Current frame:' + databus.frame);
                this.sound.playGhostKill();
                this.wait(3000, function () {
                    let aliveUnits = this.getAliveUnits();
                    if (aliveUnits.length <= 1) {
                        this.sound.playNewRound();
                        databus.sprites.forEach( item => {
                            item.stop();
                            item.hide();
                        });
                        databus.players.forEach(item => {
                            item.unit.stop();
                            if (!item.online) {
                                item.unit.isAlive = false;
                            }
                        });
                        this.wait(3000, function () {
                            for (let i = 0; i < databus.players.length; i++){
                                if (databus.players[i].online) {
                                    databus.players[i].unit.revive();
                                    databus.players[i].unit.show();
                                    databus.players[i].unit.setXY(this.random(parseInt(PLAYER_IMG_WIDTH / 2), this.pt.client_width - parseInt(PLAYER_IMG_WIDTH / 2)), this.random(PLAYER_IMG_HEIGHT / 2, this.pt.client_height - PLAYER_IMG_HEIGHT / 2));
                                } 
                            }
                            this.restart();
                        }.bind(this))
                    } else {
                        this.throwGhostBallRandomly();
                        this.ghost.isMoving = true;
                        this.ghost.selectTargetUnit(this.ghostBall.targetUnit);
                        
                    }
                }.bind(this))
                
            }
        }
        
    }

    throwGhostBallRandomly() {
        let targetUnits = this.getAliveUnits();
        this.ghostBall.moveToPlayerUnit(targetUnits[this.random(0, targetUnits.length - 1)]);
    }

    roomLoop() {
        this.pt.clear(0);
        this.pt.drawText('Welcome !', 10, 40, 50, 'Black');
        this.pt.drawText('presented by Zhuang', 10, 510, 10, 'Black');
        if (!this.name) {
            this.pt.drawText('Please enter your name first', 10, 120, 15, 'Black');
        } else {
            this.pt.drawText('The number of current connections: ' + this.playerList.length, 10, 120, 15, 'Black');
        }

        if (this.playerList.length) {
            let row = 140;
            for (let i = 0; i < this.playerList.length; i++) {
                this.pt.drawText('' + this.playerList[i], 10, row, 10, 'Black');
                row = row + 30;
            }
            if (this.playerList[0] == this.name) {
                this.pt.drawImage(this.startButtonImage, ...this.startButtonPos);
            }
        }
        
        this.aniId = requestAnimationFrame(this.roomLoop.bind(this));

    }

    update() {

        if (this.netFrame.length) {
            let data = this.netFrame.shift().replace('A', '');
            if (this.isStart && this.mainPlayer.orderSet.length) {
                wx.sendSocketMessage({
                    data: this.mainPlayer.orderSet.shift(),
                });
            }
            if (data) {
                data = data.split('&');
                for (let i = 0; i < data.length; i++) {
                    let order = data[i].split('#')
                    let playerIndex = order[0];
                    let cmdType = order[1];
                    if (cmdType == 'mov') {
                        let pos = order[2].split('_');
                        databus.players[playerIndex].unit.issueMove(parseInt(pos[0]), parseInt(pos[1]));
                    } else if (cmdType == 'throw') {
                        if (databus.players[playerIndex].unit.isAlive) {
                            let targetId = order[2];
                            if (this.ghostBall.targetUnit.ghostBall) {
                                this.ghostBall.moveToPlayerUnit(databus.players[parseInt(targetId)].unit);
                                this.ghost.selectTargetUnit(databus.players[parseInt(targetId)].unit);
                            }
                            
                        }
                        
                    }
                }
            }
            
            databus.frame++;
            databus.players.forEach(item => {
                if (item && item.unit.isAlive) {
                    item.unit.move();
                }

            })

            if (this.ghostBall.targetUnit) {
                this.ghostBall.move();
                if (this.ghostBall.targetUnit.ghostBall) {
                    this.ghostKill(this.ghostBall.targetUnit);
                }
            }
            
            this.ghost.move()

            if (this.ghost.isMoving && databus.frame % 5 == 0) {
                this.ghost.acceleration = this.ghost.acceleration + 0.001;
            }

            for (let i = 0; i < this.waitList.length; i++) {
                if (databus.frame - this.waitList[i][0] 
                    >= this.waitList[i][1]) {
                    this.waitList[i][2]();
                    this.waitList.splice(i, 1);
                }
            }

        }

        
        
        
    }

    render() {
        this.pt.clear(1);
        
        /** 
        if (this.mainPlayer){
            if (this.mainPlayer.unit) {
                var that = this;
                var obj = {
                    x: that.mainPlayer.unit.x,
                    y: that.mainPlayer.unit.y,
                    index: that.mainPlayer.id,
                }
                wx.sendSocketMessage({
                    data: JSON.stringify({
                        type: 'update',
                        data: obj,
                    })
                })
            }
            
        }
        */


        /** 
        databus.sprites.forEach(item => {
            if (item && item.visible) {
                if (item.animated) {

                } else {
                    
                }
                
            }

        })
        */
        for (let i = 0; i < databus.sprites.length; i++) {
            if (databus.sprites[i].animated) {
                databus.sprites[i].drawAnimation(this.pt);
                databus.sprites[i].index++;
                if (databus.sprites[i].index >= databus.sprites[i].numbers) {
                    if (databus.sprites[i].loop) {
                        databus.sprites[i].index = 0;
                    } else {
                        databus.sprites[i].stop();
                        pool.getPoolBySign('animation').push(databus.sprites[i]);               
                    }
                }
            } else {
                databus.sprites[i].drawToCanvas(this.pt);
            }
            
        }
        for (let i = 0; i < databus.players.length; i++) {
            if (databus.players[i].online 
                && databus.players[i].unit.isAlive
                && databus.players[i].unit.visible) {
                this.pt.drawPlayerNameToUnit(databus.players[i], (databus.players[i] == this.mainPlayer ? '#ff0000' : '#58b1f0'));
            }
        }

        
        
        

    }

    

    loop() {
        this.update();
        this.render();
        this.aniId = requestAnimationFrame(this.loop.bind(this));
    }


    initEvent() {
        wx.onTouchStart(function (e) {
            if (this.mainPlayer.unit.isAlive) {
                let cx = parseInt(e.touches[0].clientX - this.originX);
                let cy = parseInt(e.touches[0].clientY - this.originY);
                for (let i = 0; i < databus.players.length; i++) {
                    let item = databus.players[i];
                    if (item.unit.isAlive
                        && item != this.mainPlayer
                        && cx <= item.unit.x + item.unit.width / 2
                        && cx >= item.unit.x - item.unit.width / 2
                        && cy <= item.unit.y + item.unit.height / 2
                        && cy >= item.unit.y - item.unit.height / 2) {
                        if (this.mainPlayer.unit.ghostBall) {
                            this.mainPlayer.orderSet.push('A' + this.mainPlayer.id + '#' + 'throw' + '#' + item.id);
                        }
                        return;
                    }
                }

                this.mainPlayer.orderSet.push('A' + this.mainPlayer.id + '#' + 'mov' + '#' + cx + '_' + cy);
            }
        }.bind(this));
    }

    random(min, max) {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var rnd = this.seed / 233280.0;

        return parseInt(min + rnd * (max - min + 1));
    }

}