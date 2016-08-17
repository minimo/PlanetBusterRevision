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
        maxStageId: 1,

        //ステージクリアフラグ
        isStageClear: false,

        //ゲームオーバーフラグ
        isGameOver: false,

        //ボス戦闘中フラグ
        isBossBattle: false,
        bossObject: null,

        //各種判定用
        missCount: 0,       //プレイヤー総ミス回数
        stageMissCount: 0,  //プレイヤーステージ内ミス回数

        //敵関連        
        enemyCount: 0,  //敵総数
        enemyKill: 0,   //敵破壊数

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
                case LAYER_SHADOW:
                    this.layers[i] = phina.display.DisplayElement().addChildTo(this.base);
                    //地形と影レイヤーのみ目隠し
                    this.groundMask = phina.display.RectangleShape(param)
                        .addChildTo(this.base)
                        .setPosition(SC_W*0.5, SC_H*0.5);
                    this.groundMask.tweener.setUpdateType('fps');
                    this.groundMask.tweener.clear().fadeOut(20);
                    break;
                default:
                    this.layers[i] = phina.display.DisplayElement().addChildTo(this.base);
            }
            this.layers[i].parentScene = this;
        }

        //プレイヤー準備
        var player = this.player = pbr.Player()
            .addChildTo(this)
            .addShadow()
            .setPosition(SC_W*0.5, SC_H*0.5)
            .stageStartup();
        player.shotLayer = this.shotLayer;

//        this.pointer = pbr.PlayerPointer().addChildTo(this);
//        this.pointer.player = this.player;

        //弾幕設定クラス
        pbr.BulletConfig.setup(player, this.bulletLayer);

        //システム表示ベース
        this.systemBase = phina.display.DisplayElement().addChildTo(this.base);

        //ボス耐久力ゲージ
        var gaugeStyle = {
            width: SC_W*0.9,
            height: 10,
            style: {
                fill: 'rgba(0, 0, 200, 1.0)',
                empty: 'rgba(0, 0, 0, 0.0)',
                stroke: 'rgba(255, 255, 255, 1.0)',
                strokeWidth: 1,
            },
        }
        this.bossGauge = phina.extension.Gauge(gaugeStyle)
            .setPosition(SC_W*0.5, -10)
            .addChildTo(this.systemBase);

        //スコア表示
        var that = this;
        this.scoreLabel = phina.display.Label({text:"SCORE:"}.$safe(this.scorelabelParam))
            .addChildTo(this.systemBase)
            .setPosition(10, 10);
        this.scoreLabel.score = 0;
        this.scoreLabel.s = 0;
        this.scoreLabel.update = function(e) {
            if (e.ticker.frame%10 == 0) {
                this.s = ~~((app.score-this.score)/7);
                if (this.s < 3) this.s = 3;
                if (this.s > 7777) this.s = 7777;
            }
            this.score += this.s;
            if (this.score > app.score) this.score = app.score;

            this.text = "SCORE "+this.score.comma();
        }

        //ランク表示
        this.rankLabel = phina.display.Label({text:"RANK:"}.$safe(this.scorelabelParam))
            .addChildTo(this.systemBase)
            .setPosition(10, 30);
        this.rankLabel.update = function() {
            this.text = "RANK "+app.rank;
        };

        //残機表示
        for (var i = 0; i < 9; i++) {
            var s = this.sprite = phina.display.Sprite("gunship", 48, 48)
                .addChildTo(this.systemBase)
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
                .addChildTo(this.systemBase)
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

        //目隠し
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.tweener.setUpdateType('fps');
        this.mask.tweener.clear().fadeOut(20);

        //ステージ初期化
        this.initStage();

        //イベント処理
        //ボス戦開始
        this.on('start_boss', function() {
            this.isBossBattle = true;
            this.systemBase.tweener.clear().to({y: 20}, 1000);
        }.bind(this));

        //ボス撃破
        this.on('end_boss', function() {
            this.isBossBattle = false;
            this.systemBase.tweener.clear().to({y: 0}, 1000);

            //ボスタイプ判定
            if (this.bossObject.type == ENEMY_MBOSS) {
                //中ボスの場合早回し
                var time = this.stage.getNextEventTime(this.time);
                this.time = time-1;
            } else {
                //ステージボスの場合ステージクリア
                this.flare('stageclear');
            }
            this.bossObject = null;
        }.bind(this));

        //ステージクリア
        this.on('stageclear', function() {
            //プレイヤショットオフ・当たり判定無し
            this.player.isShotOK  = false;
            this.player.isCollision  = false;

            //１０秒後にリザルト処理
            phina.app.Object2D().addChildTo(this)
                .tweener.clear()
                .wait(10000)
                .call(function() {
                    this.result();
                }.bind(this));
        }.bind(this));

        //コンティニュー時
        this.on("continue", function() {
            app.numContinue++;

            //初期状態へ戻す
            app.score = 0;
            app.rank = 1;
            app.zanki = app._defaultSetting.zanki;
            app.bombStock = app._defaultSetting.bombStock;

            this.player.visible = true;
            this.player.startup();
            this.scoreLabel.score = 0;
        }.bind(this));

        //ゲームオーバー時
        this.on("gameover", function() {
            app.stopBGM();
            this.exit("gameover");
        }.bind(this));
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
            var cos = pbr.ContinueScene(this);
            phina.app.Object2D().addChildTo(this).tweener.clear()
                .wait(2000)
                .call( function() {
                    app.pushScene(cos);
                });
        }

        if (this.bossObject) {
            this.bossGauge.setValue(this.bossObject.def);
        }

        var kb = app.keyboard;
        if (app.keyboard.getKey("C")) {
            this.eraseBullet();
        }
        if (app.keyboard.getKey("D")) {
            this.bulletDomination();
        }
        if (app.keyboard.getKey("P")) {
            app.pushScene(pbr.PauseScene());
        }

        this.time++;
    },

    //ステージ初期化
    initStage: function() {
        if (this.ground) {
            this.ground.remove();
            this.ground = null;
        }
        if (this.stage) this.stage = null;

        //ステージ進行と背景追加
        switch (this.stageId) {
            case 1:
                this.stage = pbr.Stage1(this, this.player);
                this.ground = pbr.Stage1Ground().addChildTo(this);
                break;
            case 2:
                this.stage = pbr.Stage1(this, this.player);
                this.ground = pbr.Stage1Ground().addChildTo(this);
                break;
            case 3:
                this.stage = pbr.Stage1(this, this.player);
                this.ground = pbr.Stage1Ground().addChildTo(this);
                break;
        }
        this.time = 0;
        this.timeVanish = 0;
        this.enemyCount = 0;
        this.enemyKill = 0;
        this.stageMissCount = 0;

        //地形消去用マスク
        this.groundMask.tweener.clear().fadeOut(20);

        //ステージ番号表示
        var param = {text: "STAGE "+this.stageId, fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontWeight: 600, outlineWidth: 2};
        var m1 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        m1.alpha = 0;
        m1.tweener.setUpdateType('fps');
        m1.tweener.wait(30).fadeIn(15).wait(171).fadeOut(15).call(function(){this.remove()}.bind(m1));

        //ステージ名表示
        var name = pbr.Application.stageName[this.stageId];
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

    result: function() {
        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "left",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        };

        //クリア時ＢＧＭ
        app.playBGM("stageclear");

        //地形消去用マスク
        this.groundMask.tweener.clear().fadeIn(300);

        var that = this;

        var base = phina.display.DisplayElement()
            .addChildTo(this)
            .setPosition(SC_W*1.5, 0);
        base.update = function() {
        };
        base.tweener.clear()
            .to({x: 0}, 500,"easeOutSine")
            .wait(5000)
            .call(function() {
                that.stageClear();
                this.remove();
            }.bind(base));

        //ステージ番号表示
        var text1 = "STAGE "+this.stageId+" CLEAR";
        var res1 = phina.display.Label({text: text1, align: "center", fontSize: 25}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.5, SC_H*0.25);

        //ステージクリアボーナス表示
        var bonusClear = this.stageId*100000;
        var res2 = phina.display.Label({text: ""}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.1, SC_H*0.4);
        res2.score = 0;
        res2.scorePlus = Math.floor(bonusClear/60);
        res2.time = 0;
        res2.update = function() {
            this.text = "CLEAR BONUS: "+this.score.comma();
            if (this.time == 60) app.score += bonusClear;
            if (this.time > 60) {
                this.score += this.scorePlus;
                if (this.score > bonusClear) this.score = bonusClear;
            }
            this.time++;
        }

        //ヒット数ボーナス表示
        var bonusHit = this.enemyKill*100;
        var res3 = phina.display.Label({text: ""}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.1, SC_H*0.5);
        res3.score = 0;
        res3.scorePlus = Math.floor(bonusHit/60);
        res3.time = 0;
        res3.update = function() {
            this.text = "HIT BONUS: "+this.score.comma();
            if (this.time == 90) app.score += bonusHit;
            if (this.time > 90) {
                this.score += this.scorePlus;
                if (this.score > bonusHit) this.score = bonusHit;
            }
            this.time++;
        }

        //ノーミスクリアボーナス表示
        if (this.stageMissCount == 0) {
            var bonusNomiss = 100000;
            var res4 = phina.display.Label({text: ""}.$safe(labelParam))
                .addChildTo(base)
                .setPosition(SC_W*0.1, SC_H*0.6);
            res4.score = 0;
            res4.scorePlus = Math.floor(bonusNomiss/60);
            res4.time = 0;
            res4.update = function() {
                this.text = "NO MISS BONUS: "+this.score.comma();
                if (this.time == 120) app.score += bonusNomiss;
                if (this.time > 120) {
                    this.score += this.scorePlus;
                    if (this.score > bonusNomiss) this.score = bonusNomiss;
                }
                this.time++;
            }
        }
    },

    //ステージクリア処理
    stageClear: function() {
        if (this.stageId < this.maxStageId) {
            //次のステージへ
            this.stageId++;
            this.initStage();
        } else {
            //オールクリア
            this.mask.tweener.clear()
                .fadeIn(60)
                .wait(60)
                .call(function() {
                    this.flare('gameover');
                }.bind(this));
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
            if (en.data.type == ENEMY_BOSS || en.data.type == ENEMY_MBOSS) {
                this.bossGauge.setMax(en.defMax).setValue(en.defMax);
                this.bossObject = en;
                this.flare('start_boss');
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
        if (this.bombTime > 0 || app.bombStock < 1) return;
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

    //弾幕撃ち返し
    bulletDomination: function() {
        var sl = this.shotLayer;
        this.bulletLayer.children.each(function(a) {
            var rot = Math.atan2(-a.vy, -a.vx)*toDeg+90;
            sl.enterShot(a.x, a.y, {type: 1, rotation: rot, power: 20, velocity: 5});
        });
        this.bulletLayer.erase();
    },

    //Warning表示
    enterWarning: function() {

        //警告音
        app.playBGM("warning", false);

        var style = {
            width: SC_W,
            height: SC_H*0.1,
            fill: "red",
            stroke: "red",
            strokeWidth: 1
        }
        var belt = phina.display.RectangleShape(style)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .addChildTo(this);
        var text = phina.display.Label({text: "WARNING", align: "center", fontFamily: "Orbitron"})
            .setPosition(0, 3)
            .addChildTo(belt);

        var param = {
            fill: "red",
            stroke: "red",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            fontSize: 16,
            fontWeight: ''
        };
        var text = "CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION";
        caution1 = phina.display.Label({text: text}.$safe(param))
            .setPosition(SC_W*0.5, SC_H*-0.05-8)
            .addChildTo(belt);
        caution1.update = function() {
            this.x -= 1;
        }
        caution2 = phina.display.Label({text: text}.$safe(param))
            .setPosition(SC_W*0.5, SC_H*0.05+12)
            .addChildTo(belt);
        caution2.update = function() {
            this.x += 1;
        }

        belt.tweener.setUpdateType('fps');
        belt.tweener.clear()
            .wait(90).fadeOut(5).wait(24).fadeIn(1)
            .wait(90).fadeOut(5).wait(24).fadeIn(1)
            .wait(90).fadeOut(5).wait(24)
            .call(function(){
                caution1.x = 0;
                caution2.x = 0;
            })
            .call(function(){
                app.playBGM("boss", true);
                this.remove();
            }.bind(belt));
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
