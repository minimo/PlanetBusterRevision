/*
 *  Ground.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Ground", {
    superClass: "phina.display.DisplayElement",
    layer: LAYER_BACKGROUND,    //所属レイヤー

    _member: {
        map: null,
        belt: false,    //繰り返し地形フラグ

        direction: 0,   //スクロール方向
        speed: 1,       //スクロール速度

        altitudeBasic: 50,  //基本高度
        altitude: 1,        //現在高度（基本高度に対する割合：１を１００％とする)
        isShadow: true,     //影有りフラグ

        deltaX : 0,        
        deltaY : 0,        
    },

    init: function(option) {
        this.superInit();
        this.$safe(this._member);
        option = (option || {}).$safe({
            asset: null,
            belt: false,
            beltW: 3,
            beltH: 2,
        });
        this.asset = option.asset;
        this.belt = option.belt;
        this.beltW = option.beltW;
        this.beltH = option.beltH;

        this.position.x = SC_W/2;
        this.position.y = SC_H/2;

        this.mapBase = phina.display.DisplayElement().setPosition(0, 0).addChildTo(this);
        this.tweener.setUpdateType('fps');
        this.mapBase.tweener.setUpdateType('fps');

        if (this.asset) {
            this.setupMap();
        }

        this.on("enterframe", this.defaultEnterframe);
    },

    defaultEnterframe: function() {
        var rad = (this.direction+90)*toRad;
        this.deltaX = Math.cos(rad)*this.speed;
        this.deltaY = Math.sin(rad)*this.speed;

        this.mapBase.x += this.deltaX;
        this.mapBase.y += this.deltaY;
    },

    setupMap: function() {
        if (!this.belt) {
            this.map = phina.display.Sprite(this.asset).addChildTo(this.mapBase);
            this.map.alpha = 0.5;
            var w = this.map.width;
            var h = this.map.height;
            this.map.setPosition(0, 0);
        } else {
            this.map = [];
            for (var x = 0; x < this.beltW; x++) {
                this.map[x] = [];
                for (var y = 0; y < this.beltH; y++) {
                    this.map[x][y] = phina.display.Sprite(this.asset).addChildTo(this.mapBase);
                    var w = this.map[x][y].width;
                    var h = this.map[x][y].height;
                    var offsetW = (this.beltW*w)/2;
                    var offsetH = h/2;
                    this.map[x][y].mapX = x;
                    this.map[x][y].mapY = y;
                    this.map[x][y].setPosition(w*x-offsetW, h*-(y+1)+offsetH);
                }
            }
            this.mapW = this.map[0][0].width;
            this.mapH = this.map[0][0].height;
        }
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

        shadowX: {
            "get": function() {
                return (this.altitudeBasic * this.altitude)*0.5;
            },
            "set": function(y) {}
        },
        shadowY: {
            "get": function() {
                return this.altitudeBasic * this.altitude;
            },
            "set": function(y) {}
        },
/*
        scaleX: {
            "get": function() { return this.mapBase.scaleX; },
            "set": function(x) { this.mapBase.scaleX = x;}
        },
        scaleY: {
            "get": function() { return this.mapBase.scaleY; },
            "set": function(y) { this.mapBase.scaleY = y;}
        },
*/
    }
});
