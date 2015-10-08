/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.MainScene", {
    superClass: 'phina.display.CanvasScene',

    _member: {
        //再生中BGM
        bgm: null,

        //経過時間
        time: 0,

        labelParam: {
            fill: "white",
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 3,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 20
        },
        scorelabelParam: {
            fill: "white",
            stroke: true,
            strokeColor: 'black',
            strokeWidth: 3,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 20,
            align: "left",
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
        this.lowerLayer = phina.display.CanvasElement().addChildTo(this);
        this.panelLayer = phina.display.CanvasElement().addChildTo(this);
        this.playerLayer = phina.display.CanvasElement().addChildTo(this);
        this.itemLayer = phina.display.CanvasElement().addChildTo(this);

        //プレイヤー準備        
        this.player = pbr.Player()
            .addChildTo(this.playerLayer)
            .setPosition(PN_OFFX, PN_OFFY);
        this.player.visible = false;

        //スコア表示
        var that = this;
        var lb = this.scoreLabel = phina.display.Label("得点:", this.scorelabelParam)
            .addChildTo(this)
            .setPosition(8, 32);
        lb.update = function() {
            this.text = "得点:"+that.score;
        }

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
    },
    
    update: function(app) {
        this.time++;
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
