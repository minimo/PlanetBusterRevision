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
        option = option.$safe({
            sliceX: 2,  //横分割数
            sliceY: 2,  //縦分割数
            trimming: { //トリミング情報
                x: 0,
                y: 0,
                width: width,
                height: height,
            },
        });

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
    fallApart: function() {
    },
});

