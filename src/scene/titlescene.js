/*
 *  TitileScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("pbr.TitleScene", {
    superClass: "phina.display.CanvasScene",
    
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
            fontSize: 32,
            fontWeight: ''
        },
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        var label = phina.display.Label({text: "PlanetBuster"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.time = 0;
    },
    
    update: function() {
        this.time++;
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
        this.app.popScene();
    },
});


