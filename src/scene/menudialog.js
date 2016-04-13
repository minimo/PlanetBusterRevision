/*
 *  MenuDialog.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("pbr.MenuDialog", {
    superClass: "phina.display.DisplayScene",
    
    _member: {
        //ラベル用パラメータ
        titleParam: {
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

        defaultOption: {
            title: "notitle",
            menu: ["menu1", "menu2"],
            description: ["menu1", "menu2"],
        },
    },

    init: function() {
        this.superInit(option, callback);
        this.$extend(this._member);

        //メニュー項目数
        var numMenuItem = option.menu.length;

        //バックグラウンド
        var param = {
            width:SC_W*0.8,
            height:SC_H*(numMenuItem*0.2),
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(255, 255, 255, 0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(1.0, 0);
        this.bg.tweener.to({scaleY: 1}, 1000, "easeOutCubic");

        //初期位置
        var posY = SC_H*0.5-(numMenuItem*0.1);

        //メニュータイトル
        phina.display.Label({text: "SETTING"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, posY);

        //メニュー項目
        for (var i = 0; i < numMenuItem; i++) {
        }

        //注釈
        var param2 = {
            width:SC_W,
            height:SC_H*0.15,
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(0, 0, 0, 0.7)",
            backgroundColor: 'transparent',
        };
        phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W, SC_H*0.8)

        this.time = 0;
    },
    
    update: function(app) {
        this.time++;
    },
});
