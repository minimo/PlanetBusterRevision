/*
 *  Enemy.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Enemy", {
    superClass: "phina.display.DisplayElement",

    _member: {
        layer: LAYER_OBJECT_MIDDLE,    //所属レイヤー
        parentEnemy: null,      //親となる敵キャラ

        //各種フラグ
        isCollision: true,  //当り判定
        isDead: false,      //死亡
        isSelfCrash: false, //自爆
        isMuteki: false,    //無敵
        isBoss: false,      //ボス
        isOnScreen: false,  //画面内に入った
        isGround: false,    //地上フラグ
        isHover: false,     //マップスクロールの影響無視
        isEnemy: true,      //敵機判別
        isAttack: true,     //攻撃フラグ
        isCrashDown: false, //墜落フラグ

        //キャラクタ情報
        name: null,
        type: -1,
        def: 0,
        defMax: 0,
        danmakuName: null,
        id: -1,
        enterParam: null,
        altitude: 1,

        //機体用テクスチャ情報
        body: null,
        texName: null,
        texIndex: 0,
        texWidth: 32,
        texHeight: 32,
        texColor: "",

        //基本情報
        data: null,
        player: null,

        //前フレーム座標
        beforeX: 0,
        beforeY: 0,

        //実行タスクキュー
        task: null,
    },

    init: function(name, x, y, id, param) {
        this.superInit();
        this.$extend(this._member);

        //TweenerをFPSベースにする
        this.tweener.setUpdateType('fps');

        x = x || 0;
        y = y || 0;
        this.setPosition(x, y);
        this.id = id || -1;
        this.enterParam = param; //EnemyUnitからの投入時パラメータ

        this.name = name;
        var d = this.data = enemyData[name];
        if (!d) {
            console.warn("Enemy data not found.: '"+name+"'");
            return false;
        }

        //弾幕定義
        if (d.danmakuName) {
            this.danmakuName = d.danmakuName
            if (d.danmakuName instanceof Array) {
                this.startDanmaku(this.danmakuName[0]);
            } else {
                this.startDanmaku(this.danmakuName);
            }
        }

        //基本仕様コピー
        this.type = d.type || ENEMY_SMALL;
        this.def = this.defMax = d.def;
        this.width = d.width || 32;
        this.height = d.height || 32;
        this.layer = d.layer || LAYER_OBJECT_MIDDLE;
        this.point = d.point || 0;

        this.setup = d.setup || this.setup;
        this.equipment = d.epuipment || this.equipment;
        this.algorithm = d.algorithm || this.algorithm;
        this.deadChild = d.deadChild || this.deadChild;
        this.changeColor = d.changeColor || this.changeColor;

        //破壊パターン
        if (this.type == ENEMY_MBOSS || this.type == ENEMY_BOSS ){
            this.dead = d.dead || this.defaultDeadBoss;
        } else {
            this.dead = d.dead || this.defaultDead;
        }

        //機体用スプライト
        if (d.texName) {
            this.texName = d.texName;
            this.texIndex = d.texIndex || 0;
            this.texWidth = d.texWidth;
            this.texHeight = d.texHeight;
            this.body = phina.display.Sprite(d.texName, d.texWidth, d.texHeight).addChildTo(this);
            this.body.tweener.setUpdateType('fps');

            this.texTrimX = d.texTrimX || 0;
            this.texTrimY = d.texTrimY || 0;
            this.texTrimWidth = d.texTrimWidth || this.body.image.width;
            this.texTrimHeight = d.texTrimHeight || this.body.image.height;

            this.body.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
            this.body.setFrameIndex(this.texIndex);
        } else {
            //当り判定ダミー表示
            var that = this;
            this.texName = null;
            this.texWidth = this.width;
            this.texHeight = this.height;
            this.body = phina.display.Shape({width:this.width, height:this.height}).addChildTo(this);
            this.body.tweener.setUpdateType('fps');
            this.body.renderRectangle({fillStyle: "rgba(255,255,0,1.0)", strokeStyle: "rgba(255,255,0,1.0)"});
            this.body.update = function() {this.rotation = -that.rotation;};
        }
        this.body.alpha = 1.0;
        this.body.blendMode = "source-over";

        if (VIEW_COLLISION) {
            this.col = phina.display.Shape({width:this.width, height:this.height}).addChildTo(this);
            this.col.renderRectangle({fillStyle: "rgba(255,255,0,0.5)", strokeStyle: "rgba(255,255,0,0.5)"});
            this.col.update = function() {this.rotation = -that.rotation;};
        }

        if (DEBUG) {
            //耐久力表示
            var df = this.defDisp = phina.display.Label({text: "[0/0]"}).addChildTo(this);
            var that = this;
            df.update = function() {
                this.rotation = -that.rotation;
                this.text = "["+that.def+"/"+that.defMax+"]";
            }
        }

        //フラグセット
        this.isCollision = d.isCollision || this.isCollision;
        this.isDead      = d.isDead      || this.isDead;
        this.isSelfCrash = d.isSelfCrash || this.isSelfCrash;
        this.isMuteki    = d.isMuteki    || this.isMuteki
        this.isOnScreen  = d.isOnScreen  || this.isOnScreen;
        this.isGround    = d.isGround    || this.isGround;
        this.isHover     = d.isHover     || this.isHover;
        this.isEnemy     = d.isEnemy     || this.isEnemy;
        this.isAttack    = d.isAttack    || this.isAttack;
        this.isCrashDown = d.isCrashDown || this.isCrashDown;
        if (this.type == ENEMY_MBOSS
            || this.type == ENEMY_BOSS
            || this.type == ENEMY_BOSS_EQUIP) this.isBoss = true;

        //それ以外の固有変数をコピー
        this.$safe(d);

        //パラメータセットアップ
        this.parentScene = app.currentScene;
        this.player = this.parentScene.player;
        this.setup(param);

        //機影追加
        this.addShadow();

        //当り判定設定
        this.boundingType = "rect";

        //add時
        this.on('added', this.equipment);

        //remove時
        this.on('removed', this.release);

        this.time = 0;
    },

    setup: function(enterParam) {
    },

    equipment: function(enterParam) {
    },

    update: function(app) {
        //bulletML.runner更新処理
        if (!this.isDead && this.runner) {
            this.runner.x = this.position.x;
            this.runner.y = this.position.y;
            this.runner.update();
        }

        //地上物現座標調整
        if (this.isGround && !this.isHover) {
            var ground = this.parentScene.ground;
            this.x += ground.deltaX;
            this.y += ground.deltaY;
        }

        //ボス系破壊時弾消去
        if (this.isDead) {
            if (this.type == ENEMY_MBOSS || this.type == ENEMY_BOSS) this.parentScene.eraseBullet();
        }

        //タスク処理
        if (this.task) {
            this.execTask(this.time);
        }

        //行動アルゴリズム
        this.algorithm(app);

        //スクリーン内入った判定
        if (this.isOnScreen) {
            if (!this.isBoss) {
                var w = this.body.width/2;
                var h = this.body.height/2;
                if (this.x < -w || this.x > SC_W+w || this.y < -h || this.y > SC_H+h) {
                    this.remove();
                    this.isCollision = false;
                }
            }
        } else {
            //中心が画面内に入った時点を画面内と判定する
            if (0 < this.x && this.x < SC_W && 0 < this.y && this.y < SC_H) this.isOnScreen = true;
        }

        //自機との当り判定チェック
        var player = this.player;
        if (this.type == ENEMY_ITEM) {
            //アイテムの場合
            if (this.isHitElement(player)) {
                this.remove();
                player.getItem(this.kind);
            }
        } else {
            //アイテム以外の場合
            if (this.isCollision && !this.isGround && !this.isDead && player.isCollision && this.isHitElement(player)) {
                player.damage();
            }
        }

        //親機が破壊された場合、自分も破壊
        if (!this.isDead && this.parentEnemy && this.parentEnemy.isDead) {
            this.isSelfCrash = true;
            this.dead();
        }

        //瀕死
        if (this.def < this.defMax*0.2) this.nearDeath();

        //地上敵で自機に近い場合は弾を撃たない
        if (this.isGround && !this.isBoss) {
            if (distanceSq(this, this.parentScene.player) < 4096)
                this.isAttack = false;
            else
                this.isAttack = true;
        }

        this.body.frameIndex = this.texIndex;

        this.beforeX = this.x;
        this.beforeY = this.y;
        this.time++;
    },

    //アルゴリズム
    algorithm: function() {
    },

    damage: function(power, force) {
        if (this.isMuteki || this.isDead || !this.isCollision) return false;

        this.def -= power;
        if (force) this.def = -1;
        if (this.def < 1) {
            this.def = 0;

            //破壊パターン投入
            this.flare('dead');
            this.dead();

            //親機に破壊を通知
            if (this.parentEnemy) {
                this.parentEnemy.deadChild(this);
            }

            //スコア加算
            if (!this.isSelfCrash) app.score += this.point;

            //ボス撃破をシーンに通知
            if (this.data.type == ENEMY_BOSS || this.data.type == ENEMY_MBOSS) {
                this.parentScene.flare('end_boss');
            }

            this.parentScene.enemyKill++;
            return true;
        }

        //被ダメージ演出
        this.changeColor("White", true);
        this.body.tweener.clear().wait(1).call(function(){this.changeColor()}.bind(this));

        return false;
    },

    //瀕死状態
    nearDeath: function() {
        if (this.time % 30 == 0) {
            this.changeColor("Red");
        } else if (this.time % 30 == 5) {
            this.changeColor();
        }

        if (this.time % 35 == 0) {
            var ground = this.parentScene.ground;
            var w = this.width/2;
            var h = this.height/2;
            var num = this.type == ENEMY_BOSS || this.type == ENEMY_MBOSS? 3: 1;
            for (var i = 0; i < num; i++) {
                var x = this.x+rand(-w, w);
                var y = this.y+rand(-h, h);
                var layer = this.parentScene.effectLayerUpper;
                var delay = i == 0? 0: rand(0, 15);
                Effect.enterExplode(layer, {
                    position: {x: x, y: y},
                    velocity: {x: ground.deltaX, y: ground.deltaY, decay: 0.9},
                    delay: delay,
                });
            }
            app.playSE("explodeSmall");
        }
        return this;
    },

    //色を赤or白くする
    changeColor: function(color, reverse) {
        if (!this.texName) return;
 
        //指定色によって画像名が変わる
        if (reverse && this.texColor != "") {
            this.texColor = "";
        } else {
            if (color === undefined) {
                this.texColor = "";
            } else {
                if (color != "Red" && color != "White" && color != "Black") color = "Red";
                this.texColor = color;
            }
        }

        //画像の再設定
        this.body.setImage(this.texName+this.texColor, this.texWidth, this.texHeight);
        this.body.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
        this.body.setFrameIndex(this.texIndex);
    },

    //通常破壊パターン
    defaultDead: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode(width, height);        

        //弾消し
        if (this.data.type == ENEMY_MIDDLE) {
            this.parentScene.eraseBullet(this);
        } else if (this.data.type == ENEMY_LARGE) {
            this.parentScene.eraseBullet();
            this.parentScene.timeVanish = 60;
        }


        if (this.isCrashDown) {
            var grY = this.y + 80;
            this.tweener.clear()
                .to({y: grY, altitude: 0.1}, 120, "easeSineOut")
                .call(function(){
                    this.explode();
                    this.remove();
                }.bind(this));
        } else {
            //破壊時消去インターバル
            if (this.data.explodeType == EXPLODE_SMALL) {
                this.remove();
            } else {
                this.tweener.clear()
                    .to({alpha: 0}, 15)
                    .call(function(){
                        this.remove();
                    }.bind(this));
                if (this.shadow) {
                    this.shadow.tweener.clear()
                       .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }
        }

        return this;
    },

    defaultDeadBoss: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode(width, height);
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, 80, 300)
            .call(function() {
                this.explode(width, height);
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },

    explode: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        //爆発無し
        if (this.data.explodeType == EXPLODE_NOTHING) return;

        var ground = this.parentScene.ground;
        var upper = this.parentScene.effectLayerUpper;
        var lower = this.parentScene.effectLayerLower;
        var vx = this.x-this.beforeX+ground.deltaX;
        var vy = this.y-this.beforeY+ground.deltaY;

        switch (this.data.explodeType) {
            case EXPLODE_SMALL:
                Effect.enterExplode(upper, {
                    position: {x: this.x, y: this.y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
                app.playSE("explodeSmall");
                break;
            case EXPLODE_MIDDLE:
            case EXPLODE_LARGE:
                var num = rand(20, 30)*this.data.explodeType;
                for (var i = 0; i < num; i++) {
                    var x = this.x+rand(-width, width);
                    var y = this.y+rand(-height, height);
                    var delay = rand(0, 30);
                    Effect.enterExplode(upper, {
                        position: {x: x, y: y},
                        velocity: {x: vx, y: vy, decay: 0.95},
                        delay: delay,
                    });
                }
                app.playSE("explodeLarge");
                break;
            case EXPLODE_GROUND:
                Effect.enterExplodeGround(lower, {
                    position: {x: this.x, y: this.y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
                app.playSE("explodeSmall");
                break;
            case EXPLODE_BOSS:
                var num = rand(100, 150);
                for (var i = 0; i < num; i++) {
                    var x = this.x+rand(-width*0.7, width*0.7);
                    var y = this.y+rand(-height*0.7, height*0.7);
                    var delay = rand(0, 15);
                    Effect.enterExplode(upper, {
                        position: {x: x, y: y},
                        velocity: {x: vx, y: vy, decay: 0.95},
                        delay: delay,
                    });
                }
                break;
        }
    },

    //BulletML起動
    startDanmaku: function(danmakuName) {
        if (this.runner) {
            this.runner.stop = true;
            this.runner = null;
        }
        this.runner = danmaku[danmakuName].createRunner(BulletConfig);
        this.runner.host = this;
        this.runner.onNotify = function(eventType, event) {
            this.flare("bullet" + eventType, event);
        }.bind(this);
        return this;
    },

    //BulletML停止
    stopDanmaku: function() {
        if (this.runner) {
            this.runner.stop = true;
        }
        return this;
    },

    //BulletML再開
    resumeDanmaku: function() {
        if (this.runner) {
            this.runner.stop = false;
        }
        return this;
    },

    //親機のセット
    setParentEnemy: function(parent) {
        this.parentEnemy = parent;
        return this;
    },

    //子機が破壊された場合に呼ばれるコールバック
    deadChild: function(child) {
    },

    //指定ターゲットの方向を向く
    lookAt: function(target) {
        target = target || this.player;

        //ターゲットの方向を向く
        var ax = this.x - target.x;
        var ay = this.y - target.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);
        this.rotation = deg + 90;
        return this;
    },

    //指定ターゲットの方向に進む
    moveTo: function(target, speed, look) {
        target = target || this.player;
        speed = speed || 5;

        //ターゲットの方向を計算
        var ax = this.x - target.x;
        var ay = this.y - target.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);

        if (look || look === undefined) this.rotation = deg + 90;

        this.vx = Math.cos(rad+Math.PI)*speed;
        this.vy = Math.sin(rad+Math.PI)*speed;
        this.x += this.vx;
        this.y += this.vy;
        return this;
    },

    release: function() {
        if (this.shadow) this.shadow.remove();
        this.removeChildren();
        return this;
    },

    //処理タスクの追加
    addTask: function(time, task) {
        if (!this.task) this.task = [];
        this.task[time] = task;
    },

    //処理タスクの実行
    execTask: function(time) {
        var t = this.task[time];
        if (t) {
            if (typeof(t) === 'function') {
                t.call(this, app);
            } else {
                this.fire(t);
            }
        }
    },

    //機影追加
    addShadow: function() {
        this.shadow = phina.display.Sprite(this.texName+"Black", this.texWidth, this.texHeight);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
        this.shadow.setFrameIndex(this.texIndex);

        var that = this;
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            this.visible = ground.isShadow;

            this.rotation = that.rotation;
            if (that.isGround) {
                this.x = that.x + 10;
                this.y = that.y + 10;
            } else {
                this.x = that.x + ground.shadowX * that.altitude;
                this.y = that.y + ground.shadowY * that.altitude;
                this.scaleX = ground.scaleX;
                this.scaleY = ground.scaleY;
            }
        }
    },

    //土煙追加
    addSmoke: function(volume, width, height) {
        if (this.isDead) return this;
        volume = volume || 5;
        if (width === undefined) width = this.width;
        if (height === undefined) height = this.width;

        var layer = this.parentScene.effectLayerLower;
        var ground = this.parentScene.ground;
        var vx = ground.deltaX;
        var vy = ground.deltaY;
        var w = width/2;
        var h = height/2;

        for (var i = 0; i < volume; i++) {
            var x = this.x+rand(-w, w);
            var y = this.y+rand(-h, h);
            layer.enterSmoke({
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 1},
            });
        }
    },
    //土煙追加（小）
    addSmokeSmall: function(volume, width, height) {
        if (this.isDead) return this;
        volume = volume || 5;
        if (width === undefined) width = this.width;
        if (height === undefined) height = this.width;

        var layer = this.parentScene.effectLayerLower;
        var ground = this.parentScene.ground;
        var vx = ground.deltaX;
        var vy = ground.deltaY;
        var w = width/2;
        var h = height/2;

        for (var i = 0; i < volume; i++) {
            var x = this.x+rand(-w, w);
            var y = this.y+rand(-h, h);
            layer.enterSmokeSmall({
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 1},
            });
        }
    },
});
