
let instance;

export default class Sound {
    constructor() {

        if (instance) {
            return instance;
        }

        instance = this;
        this.ghostKill = wx.createInnerAudioContext();
        this.ghostKill.loop = false;
        this.ghostKill.src = 'audio/ghostKill.wav';

        this.beginning = wx.createInnerAudioContext();
        this.beginning.loop = false;
        this.beginning.src = 'audio/beginning.wav';

        this.newRound = wx.createInnerAudioContext();
        this.newRound.loop = false;
        this.newRound.src = 'audio/newRound.wav';

        this.ghostShow = wx.createInnerAudioContext();
        this.ghostShow.loop = false;
        this.ghostShow.src = 'audio/ghostShow.wav';

        this.playerShow = wx.createInnerAudioContext();
        this.playerShow.loop = false;
        this.playerShow.src = 'audio/playerShow.wav';
        
    }

    playGhostKill() {
        this.ghostKill.play();
    }

    playBeginning() {
        this.beginning.play();
    }

    playThrow() {
        this.throw = wx.createInnerAudioContext();
        this.throw.loop = false;
        this.throw.src = 'audio/throw.wav';
        this.throw.play();
    }

    playBallReach() {
        this.ballReach = wx.createInnerAudioContext();
        this.ballReach.loop = false;
        this.ballReach.src = 'audio/ballReach.wav';
        this.ballReach.play();
    }

    playNewRound() {
        this.newRound.play();
    }

    playGhostShow() {
        this.ghostShow.play();
    }

    playPlayerShow() {
        this.playerShow.play();
    }
}