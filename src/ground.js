/*
 *  Ground.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

tm.define("pb3.Ground", {
    superClass: "phina.display.CanvasElement",
    layer: LAYER_BACKGROUND,    //所属レイヤー

    _member: {
        belt: false,    //繰り返し地形フラグ

        direction: 0,
        speed: 1,
    },

    init: function() {
        this.superInit();
        this.mapBase = phina.display.CanvasElement().setPosition(0, 0).addChildTo(this);
    },

    update: function() {
        var rad = (this.direction+90)*toRad;
        var vx = Math.cos(rad)*this.speed;
        var vy = Math.sin(rad)*this.speed;

        this.mapBase.x+=vx;
        this.mapBase.y+=vy;
    },

    addLayer: function(name) {
    },

    setDirection: function(dir) {
        this.direction = dir;
        return this;
    },

    setSpeed: function(speed) {
        this.speed = speed;
        return this;
    },

    setPosition: function(x, y) {
        this.mapBase.x = x;
        this.mapBase.y = y;
        return this;
    },

    _accessor: {
        x: {
            "get": function() { return this.mapBase.x; },
            "set": function(x) { this.mapBase.x = x;}
        },
        y: {
            "get": function() { return this.mapBase.y; },
            "set": function(y) { this.mapBase.x = y;}
        },
    }
});
