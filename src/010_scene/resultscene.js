/*
 *  resultscene.js
 *  2016/04/05
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("ResultScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //ラベル用パラメータ
        labelParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: false,
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function(options) {
        this.superInit();
        this.$extend(this._member);
        options = (options||{}).$safe({
            stageId: 0,
        });

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
        this.bg.tweener.setUpdateType('fps');

        phina.display.Label({text: "STAGE "+options.stageId+" CLEAR"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.2);

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(20);

        this.time = 0;
    },
    
    update: function(app) {
        this.time++;
    },
});
