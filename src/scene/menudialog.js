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

        var rectParam = {
            width: SC_W*0.2,
            height: 0,

            backgroundColor: 'transparent',
            fill: '#22f',
            stroke: '#fff',
            strokeWidth: 3,
            cornerRadius: 0,
        };
        var frame = phina.display.RectangleShape(rectParam)
            .addChildTo(this)
            .setPosition(SC_W_C, SC_H_C);
        frame.tweener.clear()
            .to({width: SC_W*0.8, height: SC_H*0.3}, 100, "easeSineOut");

        //メニュー項目
        var len = option.menu.length;
        var posY = SC_H*0.5-(len*30);
        for (var i = 0; i < len; i++) {
        }

        this.time = 0;
    },
    
    update: function(app) {
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
        this.exit("arcade");
    },
});
