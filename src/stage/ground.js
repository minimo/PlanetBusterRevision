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
        map: null,
        belt: false,    //繰り返し地形フラグ

        direction: 0,
        speed: 1,

        deltaX : 0,        
        deltaY : 0,        
    },

    init: function(option) {
        this.superInit();
        this.$safe(this._member);
        option = (option || {}).$safe({
            asset: null,
            belt: false,
        });
        this.asset = option.asset;
        this.belt = option.belt;

        this.position.x = SC_W/2;
        this.position.y = SC_H/2;

        this.mapBase = phina.display.CanvasElement().setPosition(0, 0).addChildTo(this);
        this.tweener.setUpdateType('fps');
        this.mapBase.tweener.setUpdateType('fps');

        if (!this.belt) {
            this.map = phina.display.Sprite(this.asset).addChildTo(this.mapBase);
        } else {
            this.map = [];
            for (i = 0; i < 2; i++) {
                this.map[i] = [];
                for (var r = 0; r < 3; r++) {
                    this.map[i][r] = phina.display.Sprite(this.asset).addChildTo(this.mapBase);
                    var w = this.map[i][r].width;
                    var h = this.map[i][r].height;
                    this.map[i][r].setPosition(w*r-w, h*-i);
                }
            }
        }
        this.map = phina.display.Sprite("map1g").addChildTo(this.mapBase);
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
