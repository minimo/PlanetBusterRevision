/*
 *  TitileScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("pbr.TitleScene", {
    superClass: phina.app.Scene,
    
    _member: {
        //ラベル用パラメータ
        labelParam: {fontFamily: "Orbitron", align: "left", baseline: "middle", fontSize: 20},
    },

    init: function(stageNumber) {
        this.superInit();
        this.$extend(this._member);

        var labelParam = {
            text: "PlanetBuster",
            fill: "white",
            stroke: true,
            strokeColor: 'blue',
            strokeWidth: 3,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 20
        };
        var label = phina.display.Label(labelParam)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
    },
    
    update: function() {
    },

    //タッチorクリック開始処理
    ontouchstart: function(e) {
    },

    //タッチorクリック移動処理
    ontouchmove: function(e) {
    },

    //タッチorクリック終了処理
    ontouchend: function(e) {
    },
});


