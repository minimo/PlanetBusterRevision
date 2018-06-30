/*
 *  Ground.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Ground", {
    superClass: "phina.display.DisplayElement",
    layer: LAYER_BACKGROUND,    //所属レイヤー

    _member: {
        map: null,
        belt: false,    //繰り返し地形フラグ

        direction: 0,   //スクロール方向
        speed: 1,       //スクロール速度

        altitudeBasic: 20,  //基本高度
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
            type: "image",
            belt: false,
            x: SC_W*0.5,
            y: SC_H*0.5
        });
        this.asset = option.asset;
        this.type = option.type;
        this.belt = option.belt;

        this.position.x = option.x;
        this.position.y = option.y;

        this.tweener.setUpdateType('fps');

        this.mapBase = phina.display.DisplayElement().setPosition(0, 0).addChildTo(this);
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

        if (this.belt) {
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    var m = this.map[x][y];
                    var sx = Math.floor((this.mapBase.x + m.x)/this.map.width);
                    if (sx >  0) m.x -= this.map.width*3;
                    if (sx < -2) m.x += this.map.width*3;
                    var sy = Math.floor((this.mapBase.y + m.y)/this.map.height);
                    if (sy >  0) m.y -= this.map.height*3;
                    if (sy < -2) m.y += this.map.height*3;
                }
            }
        }
    },

    setupMap: function() {
        if (!this.belt) {
            if (this.type == "image") {
                this.map = phina.display.Sprite(this.asset).addChildTo(this.mapBase);
            } else if (this.type == "tmx") {
                var tmx = phina.asset.AssetManager.get('tmx', this.asset);
                this.map = phina.display.Sprite(tmx.image).addChildTo(this.mapBase);
            }
            var w = this.map.width;
            var h = this.map.height;
            this.map.setPosition(0, 0);
            this.map.setOrigin(0, 0);
        } else {
            if (this.type == "image") {
                var image = phina.asset.AssetManager.get('image', this.asset);
            } else if (this.type == "tmx") {
                var tmx = phina.asset.AssetManager.get('tmx', this.asset);
                var image = tmx.image;
            }
            this.map = [];
            this.map.width = image.domElement.width;
            this.map.height = image.domElement.height;
            for (var x = 0; x < 3; x++) {
                this.map[x] = [];
                for (var y = 0; y < 3; y++) {
                    var mx = (x-1) * this.map.width;
                    var my = (y-1) * this.map.height;
                    this.map[x][y] = phina.display.Sprite(image)
                        .addChildTo(this.mapBase)
                        .setPosition(mx, my)
                        .setOrigin(0, 0);
                    this.map[x][y].mapX = Math.floor(mx / this.map.width);
                    this.map[x][y].mapY = Math.floor(my / this.map.height);
                }
            }
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
