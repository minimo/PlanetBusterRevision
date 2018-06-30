/*
 *  SliceSprite.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("phina.display.SliceSprite", {
    superClass: "phina.display.CanvasElement",

    init: function(image, width, height, option) {
        this.superInit();
        this.option = option.$safe({
            sliceX: 2,  //横分割数
            sliceY: 2,  //縦分割数
            trimming: { //トリミング情報
                x: 0,
                y: 0,
                width: width,
                height: height,
            },
        });

        this.image = image;
        this.width = width;
        this.height = height;

        this.sprites = [];
        var i = 0;
        var cw = ~(width/option.sliceX);
        var ch = ~(height/option.sliceY);
        for (var y = 0; y < option.sliceY; y++) {
            for (var x = 0; x < option.sliceX; x++) {
                var s = phina.display.Sprite(image, cw, ch).addChildTo(this);
                s.setFrameIndex(i).setPosition(x*cw-width/2, y*ch-height/2);
                this.sprites.push(s);
                i++;
            }
        }
    },

    //バラバラ
    fallApart: function(func) {
        func = func || function(e) {
            var sx = (e.x==0?0:(e.x>0?1:-1));
            var sy = (e.y==0?0:(e.y>0?1:-1));
            e.tweener.clear()
                .to({x: e.x*10, y:e.y*10, alpha: 0}, 1000, "easeOutSine");
        }
        this.sprites.each(func);
        return this;
    },

    //元に戻す
    reinstate: function() {
        var i = 0;
        var cw = ~(this.width/this.option.sliceX);
        var ch = ~(this.height/this.option.sliceY);
        for (var y = 0; y < this.option.sliceY; y++) {
            for (var x = 0; x < this.option.sliceX; x++) {
                s.rotation = 0;
                s.setPosition(x*cw-this.width/2, y*ch-this.height/2);
                i++;
            }
        }
        return this;
    },
});

