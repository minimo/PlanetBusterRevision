/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.MainScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //シーン内設定
        bombTime: 0,    //ボム効果継続残りフレーム数
        timeVanish: 0,  //弾消し時間

        //現在ステージＩＤ
        stageId: 1,

        //ステージクリアフラグ
        isStageClear: false,

        //ゲームオーバーフラグ
        isGameOver: false,

        //ボス戦闘中フラグ
        isBossBattle: false,
        isBossBattleEnd: false,
        bossObject: null,

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

        stageName: {
            1: "Operation PLANET_BUSTER",
        },
    },

    init: function(option) {
        this.superInit();
        this.$extend(this._member);

        option = (option || {}).$safe({stageId: 1});
        this.stageId = option.stageId;

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

        //エフェクトプール
        var effectPool = pbr.EffectPool(2048);

        //レイヤー準備
        this.base = phina.display.DisplayElement().addChildTo(this).setPosition(SC_OFFSET_X, 0);
        this.layers = [];
        for (var i = 0; i < LAYER_SYSTEM+1; i++) {
            switch (i) {
                case LAYER_BULLET:
                    this.layers[i] = pbr.BulletLayer().addChildTo(this.base);
                    this.bulletLayer = this.layers[i];
                    break;
                case LAYER_SHOT:
                    this.layers[i] = pbr.ShotLayer().addChildTo(this.base);
                    this.shotLayer = this.layers[i];
                    break;
                case LAYER_EFFECT_UPPER:
                    this.layers[i] = pbr.EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerUpper = this.layers[i];
                    break;
                case LAYER_EFFECT_MIDDLE:
                    this.layers[i] = pbr.EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerMiddle = this.layers[i];
                    break;
                case LAYER_EFFECT_LOWER:
                    this.layers[i] = pbr.EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerLower = this.layers[i];
                    break;
                default:
                    this.layers[i] = phina.display.DisplayElement().addChildTo(this.base);
            }
            this.layers[i].parentScene = this;
        }

        //プレイヤー準備
        var player = this.player = pbr.Player()
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .stageStartup();
        player.shotLayer = this.shotLayer;

//        this.pointer = pbr.PlayerPointer().addChildTo(this);
//        this.pointer.player = this.player;

        //弾幕設定クラス
        pbr.BulletConfig.setup(player, this.bulletLayer);

        //スコア表示
        var that = this;
        this.scoreLabel = phina.display.Label({text:"SCORE:"}.$safe(this.scorelabelParam))
            .addChildTo(this)
            .setPosition(10, 10);
        this.scoreLabel.score = 0;
        this.scoreLabel.update = function() {
            if (this.score < app.score) {
                var s = ~~((app.score-this.score)/5);
                if (s < 3) s=3;
                this.score += s;
                if (this.score > app.score)this.score = app.score;
            }
            this.text = "SCORE "+this.score;
        }

        //ランク表示
        this.rankLabel = phina.display.Label({text:"RANK:"}.$safe(this.scorelabelParam))
            .addChildTo(this)
            .setPosition(10, 30);
        this.rankLabel.update = function() {
            this.text = "RANK "+app.rank;
        };

        //残機表示
        for (var i = 0; i < 9; i++) {
            var s = this.sprite = phina.display.Sprite("gunship", 48, 48)
                .addChildTo(this)
                .setFrameIndex(4)
                .setScale(0.3)
                .setPosition(i*16+16, 48);
            s.num = i;
            s.visible = false;
            s.update = function() {
                if (app.zanki-1 > this.num) this.visible = true; else this.visible = false;
            }
        }

        //残ボム表示
        for (var i = 0; i < 9; i++) {
            var s = this.sprite = phina.display.Sprite("bomb", 96, 96)
                .addChildTo(this)
                .setFrameIndex(0)
                .setScale(0.16)
                .setPosition(i*16+16, 64);
            s.num = i;
            s.visible = false;
            s.update = function() {
                if (app.bombStock > this.num) this.visible = true; else this.visible = false;
            }
            var lparam = {
                text: "B",
                fill: "blue",
                stroke: "black",
                strokeWidth: 2,
                fontFamily: "Orbitron",
                align: "center",
                baseline: "middle",
                fontSize: 32,
                fontWeight: ''
            };
            phina.display.Label(lparam).addChildTo(s).setScale(2.5);
        }

        //ステージ初期化
        this.initStage();

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.tweener.setUpdateType('fps');
        this.mask.tweener.clear().fadeOut(20);

        //イベント処理
        //コンティニュー時
        this.on("continue", function() {
            app.numContinue++;

            //初期状態へ戻す
            app.zanki = 3;
            app.bombStock = 3;
            app.score = 0;
            app.rank = 1;

            this.player.visible = true;
            this.player.startup();
            this.scoreLabel.score = 0;
        }.bind(this));

        //ゲームオーバー時
        this.on("gameover", function() {
            app.stopBGM();
        });
    },
    
    update: function(app) {
        //ステージ進行
        var event = this.stage.get(this.time);
        if (event) {
            if (typeof(event.value) === 'function') {
                event.value.call(this, app);
            } else {
                this.enterEnemyUnit(event.value);
                if (event.option && event.option.boss) {
                    this.isBossBattle = true;
                }
            }
        }

        //ボス破壊
        if (this.isBossBattleEnd) {
            this.isBossBattleEnd = false;
            if (this.isStageClear) {
                this.isStageClear = false;
            } else {
                //早回し
                var time = this.stage.getNextEventTime(this.time);
                this.time = time-1;
            }
        }

        //ボム効果
        if (this.bombTime > 0) {
            this.bombTime--;
            this.eraseBullet();
            this.addEnemyDamage(10);
        }

        //弾消し
        if (this.timeVanish > 0) {
            this.timeVanish--;
            this.eraseBullet();
        }

        //ゲームオーバー処理
        if (this.isGameOver) {
            this.isGameOver = false;
            this.player.isControl = false;
            var cos = pbr.ContinueScene(this, this.stageId, this.isStageBoss, false);
            phina.app.Object2D().addChildTo(this).tweener.clear()
                .wait(2000)
                .call( function() {
                    app.pushScene(cos);
                });
        }

        var kb = app.keyboard;
        if (app.keyboard.getKey("C")) {
            this.eraseBullet();
        }
        if (app.keyboard.getKey("B")) {
            this.enterBomb();
        }

        this.time++;
    },

    //ステージ初期化
    initStage: function() {
        if (this.ground) this.ground.remove();
        switch (this.stageId) {
            case 1:
                this.stage = pbr.Stage1(this, this.player);
                this.ground = pbr.Stage1Ground().addChildTo(this);
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
        var param = {text: "STAGE "+this.stageId, fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontWeight: 600, outlineWidth: 2};
        var m1 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        m1.alpha = 0;
        m1.tweener.setUpdateType('fps');
        m1.tweener.wait(30).fadeIn(15).wait(171).fadeOut(15).call(function(){this.remove()}.bind(m1));

        //ステージ名表示
        var name = this.stageName[this.stageId];
        var param = {text: "_", fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontSize: 16, fontWeight: 200, outlineWidth: 2};
        var m2 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.55)
        m2.alpha = 0;
        m2.col = 0;
        m2.max = name.length;
        m2.tweener.setUpdateType('fps');
        m2.tweener
            .wait(30)
            .fadeIn(6)
            .to({col: m2.max}, 60)
            .wait(120)
            .fadeOut(15)
            .call(function(){this.remove()}.bind(m2));
        m2.update = function() {
            this.text = name.substring(0, ~~this.col)+"_";
        }
    },

    //ステージ再スタート
    restartStage: function() {
    },

    //シーン内容リセット
    reset: function() {
        this.layers = [];
        for (var i = 0; i < LAYER_SYSTEM+1; i++) {
            this.layers[i].removeChildren();
        }
    },

    //敵ユニット単位の投入
    enterEnemyUnit: function(name) {
        var unit = pbr.enemyUnit[name];
        if (unit === undefined)return;

        var len = unit.length;
        for (var i = 0; i < len; i++) {
            var e = unit[i];
            var en = pbr.Enemy(e.name, e.x, e.y, this.enemyID, e.param).addChildTo(this);
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

    //ボム投入
    enterBomb: function() {
        if (this.bombTime > 0) return;
        this.bombTime = 90;
        app.bombStock--;

        this.eraseBullet();
        var layer = this.effectLayerMiddle;
        var x = this.player.x;
        var y = this.player.y;
        pbr.Effect.enterBomb(layer, {position: {x: x, y: y}});

        this.addEnemyDamage(1000);
        app.playSE("bomb");
    },

    //敵に一律ダメージ付加
    addEnemyDamage: function(power) {
        var checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT, LAYER_OBJECT_LOWER];

        //敵との当り判定チェック
        for (var i = 0; i < 3; i++) {
            var layer = this.layers[checkLayers[i]];
            layer.children.each(function(a) {
                if (a instanceof pbr.Enemy && a.isOnScreen) a.damage(power);
            }.bind(this));
        }
    },

    //敵弾一括消去
    eraseBullet: function() {
        this.bulletLayer.erase();
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
