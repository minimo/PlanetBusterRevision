/*
 *  dialog.js
 *  2015/10/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("pbr.ConfirmDialog", {
    superClass: phina.app.CanvasScene,

    answer: null,

    //ラベル用フォントパラメータ
    labelParam: {fontFamily:"Yasashisa", align: "center", baseline:"middle", outlineWidth:3 },

    init: function(caption, button, fontSize) {
        this.superInit();
        
        button = button || ["OK", "CANCEL"];
        fontSize = fontSize || 50;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        var that = this;
        var width = SC_W-28, height = 90;
        var param = {fillStyle:'rgba(0,80,0,1)', lineWidth:4};

        //キャプション
        if (caption instanceof Array) {
            phina.display.Label(caption[0], fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.39);
            phina.display.Label(caption[1], fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.43);
        } else {
            phina.display.Label(caption, fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.42);
        }

        //ＹＥＳ
        phina.extension.Button(width, height, button[0], {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .addEventListener("pushed", function() {
                that.answer = true;
                appMain.popScene();
            });

        //ＮＯ
        phina.extension.Button(width, height, button[1], {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.58)
            .addEventListener("pushed", function() {
                that.answer = false;
                appMain.popScene();
            });
    },
});

var DEFALT_ALERTPARAM = {
    height: SC_H*0.35,
    text1: "text",
    text2: null,
    text3: null,
    fontSize: 32,
    button: "OK",
}

phina.define("shotgun.AlertDialog", {
    superClass: phina.app.CanvasScene,

    //ラベル用フォントパラメータ
    labelParam: {fontFamily:"Yasashisa", align: "center", baseline:"middle", outlineWidth:2 },

    init: function(param) {
        this.superInit();
        param = {}.$extend(DEFALT_ALERTPARAM, param);

        //バックグラウンド
        phina.display.RoundRectangleShape({width: SC_W-20, height: param.height, fillStyle: appMain.bgColor, lineWidth: 4})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        var that = this;
        var width = SC_W-28, height = 90;

        //キャプション
        var pos = SC_H*0.47;
        if (param.text2) pos -= SC_H*0.05;
        if (param.text3) pos -= SC_H*0.05;

        var lb = phina.display.Label(param.text1, param.fontSize).addChildTo(this);
        lb.setParam(this.labelParam);
        lb.setPosition(SC_W*0.5, pos);

        if (param.text2) {
            pos += SC_H*0.05;
            var lb = phina.display.Label(param.text2, param.fontSize).addChildTo(this);
            lb.setParam(this.labelParam);
            lb.setPosition(SC_W*0.5, pos);
        }
        if (param.text3) {
            pos += SC_H*0.05;
            var lb = phina.display.Label(param.text3, param.fontSize).addChildTo(this);
            lb.setParam(this.labelParam);
            lb.setPosition(SC_W*0.5, pos);
        }

        //ボタン
        phina.extension.Button(width, height, param.button, {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.55)
            .addEventListener("pushed", function() {
                that.answer = false;
                appMain.popScene();
            });
    },
});
