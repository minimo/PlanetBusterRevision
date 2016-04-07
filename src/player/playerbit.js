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

        this.on('removed', function() {
            if (this.shadow) this.shadow.remove();
        }.bind(this));

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

    addShadow: function() {
        var that = this;
        this.shadow = phina.display.Sprite("bitBlack", 32, 32);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.3;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameIndex(0).setScale(0.5);
        this.shadow.update = function(e) {
            this.rotation = that.rotation;
            this.x = that.x + 20 + that.parent.x;
            this.y = that.y + 40 + that.parent.y;
            this.scaleX = that.parentScene.ground.scaleX*0.5;
            this.scaleY = that.parentScene.ground.scaleY*0.5;
            this.frameIndex = that.frameIndex;
            this.visible = that.visible;
        }
        return this;
    },
});
