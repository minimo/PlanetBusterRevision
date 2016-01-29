/*
 *  Ground.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Ground", {
    superClass: "phina.display.CanvasElement",
    layer: LAYER_BACKGROUND,    //所属レイヤー

    _member: {
        belt: false,    //繰り返し地形フラグ

        deltaX : 0,        
        deltaY : 0,        

        direction: 0,
        speed: 1,
    },

    init: function() {
        this.superInit();
        this.$safe(this._member);
        this.mapBase = phina.display.CanvasElement().setPosition(0, 0).addChildTo(this);
        this.tweener.setUpdateType('fps');
        this.mapBase.tweener.setUpdateType('fps');
    },

    update: function() {
        var rad = (this.direction+90)*toRad;
        this.deltaX = Math.cos(rad)*this.speed;
        this.deltaY = Math.sin(rad)*this.speed;

        this.mapBase.x += this.deltaX;
        this.mapBase.y += this.deltaY;
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
