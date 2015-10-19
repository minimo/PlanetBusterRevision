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

        //現在ステージ番号
        nowStage: 1,

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
            .setPosition(SC_W*0.5, SC_H*0.5)
            .stageStartup();

//        this.pointer = pbr.PlayerPointer().addChildTo(this);
//        this.pointer.player = this.player;

        //スコア表示
        var that = this;
        this.scoreLabel = phina.display.Label({text:"SCORE:"}.$safe(this.scorelabelParam))
            .addChildTo(this)
            .setPosition(8, 32);
        this.scoreLabel.update = function() {
            this.text = "SCORE "+that.score;
        }

        //ステージ初期化
        this.initStage();

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.alpha = 0;
    },
    
    update: function(app) {
        //ステージ進行
        var event = this.stage.get(this.time);
        if (event) {
            if (typeof(event.value) === 'function') {
                event.value.call(this, app);
            } else {
                this.enterEnemyUnit(event.value);
            }
        }
        this.time++;
    },

    //ステージ初期化
    initStage: function() {
        if (this.ground) this.ground.remove();
        switch (this.nowStage) {
            case 1:
                this.stage = pbr.Stage1(this, this.player);
                this.ground = pbr.Stage1Ground().setPosition(0, -400).addChildTo(this);
                break;
            case 2:
                this.stage = pbr.Stage1(this, this.player);
                this.ground = pbr.Stage1Ground().setPosition(0, -400).addChildTo(this);
                break;
            case 3:
                this.stage = pbr.Stage1(this, this.player);
                this.ground = pbr.Stage1Ground().setPosition(0, -400).addChildTo(this);
                break;
        }
        this.time = 0;
        this.timeVanish = 0;
        this.enemyCount = 0;
        this.enemyKill = 0;
        this.stageMiss = 0;

        //ステージ番号表示
        param = {text: "STAGE "+this.nowStage, fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontWeight: 800, outlineWidth: 2};
        var m1 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        m1.alpha = 0;
        m1.tweener.wait(500).fadeIn(250).wait(1000).fadeOut(250).call(function(){this.remove()}.bind(m1));
    },


    //ステージ再スタート
    restartStage: function() {
    },

    //敵ユニット単位の投入
    enterEnemyUnit: function(name) {
        var unit = pbr.enemyUnit[name];
        if (unit === undefined)return;

        var len = unit.length;
        for (var i = 0; i < len; i++) {
            var e = unit[i];
            var en = pbr.Enemy(e.name,e.x, e.y, this.enemyID, e.param).addChildTo(this);
            if (en.data.type == ENEMY_BOSS) {
                this.bossGauge.setTarget(en);
                this.systemBase.tweener.clear().moveBy(0, 32, 1000);
            }
            this.enemyID++;
            this.enemyCount++;
        }
    },

    //敵単体の投入
    enterEnemy: function(name, x, y, param) {
        this.enemyID++;
        this.enemyCount++;
        return pbr.Enemy(name, x, y, this.enemyID-1, param).addChildTo(this);
    },

    //敵弾一括消去
    eraseBullet: function() {
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

    //addChildオーバーライド
    addChild: function(child) {
        if (child.layer === undefined) {
            return this.superClass.prototype.addChild.apply(this, arguments);
        }
        child.parentScene = this;
        return this.layers[child.layer].addChild(child);
    },
});
