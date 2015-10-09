/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.MainScene", {
    superClass: "phina.display.CanvasScene",

    _member: {
        score: 0,

        //再生中BGM
        bgm: null,

        //自機コントロール可能フラグ
        control: true,

        //ラベル用パラメータ
        labelParam: {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        },
        scorelabelParam: {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "left",
            baseline: "middle",
            fontSize: 20,
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

        //レイヤー準備
        this.base = phina.display.Layer().addChildTo(this).setPosition(SC_OFFSET_X, 0);
        this.layers = [];
        for (var i = 0; i < LAYER_SYSTEM+1; i++) {
            this.layers[i] = phina.display.Layer().addChildTo(this.base);
        }

        //プレイヤー準備        
        this.player = pbr.Player()
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        //スコア表示
        var that = this;
        this.scoreLabel = phina.display.Label({text:"SCORE:"}.$safe(this.scorelabelParam))
            .addChildTo(this)
            .setPosition(8, 32);
        this.scoreLabel.update = function() {
            this.text = "SCORE "+that.score;
        }

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.alpha = 0;
    },
    
    update: function(app) {
        if (this.control) {
            var player = this.player;
            //マウス操作
            var p = app.mouse;
            if (p.getPointing()) {
                var pt = this.parentScene.pointer;
                this.x += (pt.x - this.x)/this.touchSpeed;
                this.y += (pt.y - this.y)/this.touchSpeed;

                this.mouseON = true;
                this.shotON = true;
            } else {
                this.mouseON = false;
                this.shotON = false;
            }

            //キーボード操作
            var kb = app.keyboard;
            var angle = kb.getKeyAngle();
            if (angle !== null) {
                var m = KEYBOARD_MOVE[angle];
                this.player.x += m.x*this.player.speed;
                this.player.y += m.y*this.player.speed;
            }
            if (!this.mouseON) this.shotON = app.keyboard.getKey("Z");

            //ショットタイプ変更（テスト用）
            if (app.keyboard.getKey("X") && this.time > this.changeInterval) {
                this.type = (this.type+1)%3;
                this.openBit(this.type);
                this.changeInterval = this.time+30;
            }

            //移動範囲の制限
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);
        }
    },

    //ステージ初期化
    initStage: function() {
    },

    //ステージ再スタート
    restartStage: function() {
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
    },
});
