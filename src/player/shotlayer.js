/*
 *  shotlayer.js
 *  2015/11/17
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.ShotLayer", {
    superClass: "phina.display.DisplayElement",

    _member: {
        max: 64,
        pool : null,
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var b = pbr.Shot();
            b.shotLayer = self;
            return b;
        });
    },

    //弾投入
    enterShot: function(x, y, option) {
        var b = this.pool.shift();
        if (!b) {
            console.warn("Shot empty!!");
            return null;
        }
        b.setup(option).addChildTo(this).setPosition(x, y);
        return b;
    },

    //弾を消去
    erace: function() {
        for (var i = 0; i < len; i++) {
            b = list[i];
            b.erase();
            b.remove();
        }
    },
});
