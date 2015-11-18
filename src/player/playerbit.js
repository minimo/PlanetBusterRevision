/*
 *  playerbit.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.PlayerBit", {
    superClass: "phina.display.Sprite",

    _member: {
        layer: LAYER_PLAYER,
        id: 0,
        active: false,
    },

    init: function(id) {
        this.superInit("bit", 32, 32);
        this.$extend(this._member);

        this.setScale(0.5);
        this.index = 0;
        this.id = id;

        this.alpha = 1;

        this.beforeX = 0;
        this.beforeY = 0;

        this.time = 0;
    },

    update: function(app) {
        if (this.time % 2 == 0) {
            if (this.id % 2 == 0) {
                this.index--;
                if (this.index < 0) this.index = 8;
            } else {
                this.index = (this.index+1)%9;
            }
            this.setFrameIndex(this.index);
        }
        var player = this.parent;
        if (player.shotON) {
            if (this.time % player.shotInterval == 0) {
                var x = this.x + player.x;
                var y = this.y + player.y;
                var sl = player.parentScene.shotLayer;
                sl.enterShot(x, y-4, {type: 1, rotation: this.rotation, power: player.shotPower});
            }
        }

        if (player.type == 1) {
            this.rotation = Math.clamp(player.rollcount-50, -25, 25);
            if (-4 < this.rotation && this.rotation < 4) this.rotation = 0;
        }
        this.time++;
    },
});
