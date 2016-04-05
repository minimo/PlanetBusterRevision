/*
 *  TitileScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("pbr.TitleScene", {
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

    init: function() {
        this.superInit();
        this.$extend(this._member);

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

        //タイトル
        phina.display.Label({text: "Planet"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.3-5, SC_H*0.3);
        phina.display.Label({text: "Buster"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.7+5, SC_H*0.3);
        phina.display.Label({text: "REVISION", fontSize:16, stroke: "red"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.35);

        var that = this;
        //選択カーソル
        var param2 = {
            width:SC_W,
            height:SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6)

        phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6);

        phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.7);

        phina.display.Label({text: "SETTING"}.$safe(this.msgParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.8);

        //タッチ用
        for (var i = 0; i < 3; i++) {
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*SC_H*0.1)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.select != this.select) {
                    that.select = this.select;
                    that.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(that.select*SC_H*0.1), 200, "easeOutCubic");
                } else {
                    that.menuSelect();
                }
            }
        }

        //選択中メニュー番号
        this.select = 0;

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(20);

        this.time = 0;
    },
    
    update: function(app) {
        //キーボード操作
        if (this.time > 10) {
            var kb = app.keyboard;
            if (kb.getKey("up")) {
                this.select--;
                if (this.select < 0) this.select = 0;
                this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1), 200, "easeOutCubic");
                this.time = 0;
            }
            if (kb.getKey("down")) {
                this.select++;
                if (this.select > 2) this.select = 2;
                this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1), 200, "easeOutCubic");
                this.time = 0;
            }
            if (kb.getKey("Z")) {
                this.menuSelect();
            }
        }
        this.time++;
    },

    menuSelect: function() {
        switch (this.select) {
            case 0:
                this.arcadeMode();
                break;
            case 1:
                this.practiceMode();
                break;
            case 2:
                this.setting();
                break;
        }
    },

    arcadeMode: function() {
        this.exit();
    },

    practiceMode: function() {
    },

    setting: function() {
    },
});


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
        //キーボード操作
        var kb = this.app.keyboard;
        if (this.time > 30 && app.keyboard.getKey("X")) {
            this.exit("arcade");
        }
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


