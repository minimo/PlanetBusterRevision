/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.BulletLayer", {
    superClass: "phina.display.CanvasElement",

    _member: {
        max: 256,
        pool : null,
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var b = pbr.Bullet();
            b.bulletLayer = self;
            return b;
        });
    },

    enterBullet: function(param) {
        var b = this.pool.shift();
        if (!b) {
            console.warn("Bullet empty!!");
            return null;
        }
        b.setup(param).addChildTo(this);
        return b;
    },

    //射出IDに合致する弾を消去（未指定時全消去）
    erace: function(id) {
        var all = (id === undefined? true: false);
    },
});
