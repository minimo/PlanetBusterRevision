/*
 *  Enemy.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Enemy", {
    superClass: "phina.display.CanvasElement",

    _member: {
        layer: LAYER_OBJECT,    //所属レイヤー
        parentEnemy: null,      //親となる敵キャラ

        //各種フラグ
        isCollision: true,  //当り判定
        isDead: false,      //死亡
        isSelfCrash: false, //自爆
        isMuteki: false,    //無敵
        isBoss: false,      //ボス
        isOnScreen: false,  //画面内に入った
        isGround: false,    //地上フラグ
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
        altitude: 0,

        //機体用テクスチャ情報
        body: null,
        texName: null,
        texIndex: 0,
        texWidth: 32,
        texHeight: 32,

        //基本情報
        data: null,

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

        this.setPosition(x, y);
        this.id = id || -1;
        this.enterParam = param; //EnemyUnitからの投入時パラメータ

        this.name = name;
        var d = this.data = pbr.enemyData[name];
        if (!d) return false;

        //弾幕定義
        if (d.danmakuName) {
            this.danmakuName = d.danmakuName;
            this.startDanmaku(this.danmakuName);
        }

        //基本仕様コピー
        this.type = d.type || ENEMY_SMALL;
        if (this.type == ENEMY_MBOSS || this.type == ENEMY_BOSS) this.isBoss = true;
        this.def = this.defMax = d.def;
        this.width = d.width || 32;
        this.height = d.height || 32;
        this.layer = d.layer || LAYER_OBJECT;
        this.point = d.point || 0;

        this.setup = d.setup || this.setup;
        this.algorithm = d.algorithm || this.algorithm;
        this.changeColor = d.changeColor || this.changeColor;

        //破壊パターン
        if (this.type == ENEMY_BOSS || this.type == ENEMY_BOSS ){
            this.dead = d.dead || this.defaultDeadBoss;
        } else {
            this.dead = d.dead || this.defaultDead;
        }

        //機体用スプライト
        if (d.texName) {
            this.texName = d.texName;
            this.texIndex = d.texIndex;
            this.texWidth = d.texWidth;
            this.texHeight = d.texHeight;
            this.body = phina.display.Sprite(d.texName, d.texWidth, d.texHeight).addChildTo(this);

            this.texTrimX = d.texTrimX || 0;
            this.texTrimY = d.texTrimX || 0;
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
        this.isBoss      = d.isBoss      || this.isBoss;
        this.isOnScreen  = d.isOnScreen  || this.isOnScreen;
        this.isGround    = d.isGround    || this.isGround;
        this.isEnemy     = d.isEnemy     || this.isEnemy;
        this.isAttack    = d.isAttack    || this.isAttack;
        this.isCrashDown = d.isCrashDown || this.isCrashDown;

        //パラメータセットアップ
        this.parentScene = app.currentScene;
        this.setup(param);

        //当り判定設定
        this.boundingType = "rect";

        //remove時
        this.on('removed', this.release);

        this.time = 0;
    },

    setup: function(enterParam) {
    },

    update: function(app) {
        if (!this.isDead && this.runner) {
            this.runner.x = this.position.x;
            this.runner.y = this.position.y;
            this.runner.update();
        }

        //地上物現座標調整
        if (this.isGround) {
            var ground = this.parentScene.ground;
            this.x += ground.deltaX;
            this.y += ground.deltaY;
        }

        //行動アルゴリズム
        this.algorithm(app);

        //タスク処理
        if (this.task) {
            var t = this.task.shift();
            if (t) {
                if (typeof(t) === 'function') {
                    t.call(this, app);
                } else {
                    this.fire(t);
                }
            }
            if (this.task.length == 0) this.task = null;
        }

        //スクリーン内入った判定
        if (this.isOnScreen) {
            if (this.x < -100 || this.x > SC_W+100 || this.y < -100 || this.y > SC_H+100) {
                if (!this.isBoss) {
                    this.remove();
                    this.isCollision = false;
                }
            }
        } else {
            if (0 < this.x && this.x < SC_W && 0 < this.y && this.y < SC_H) this.isOnScreen = true;
        }

        //自機との当り判定チェック
        var player = this.parentScene.player;
        if (this.isCollision && !this.isGround && player.isCollision && this.isHitElement(player)) {
            player.damage();
        }

        //親機が破壊された場合、自分も破壊
        if (this.parentEnemy && this.parentEnemy.isDead) {
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

        this.beforeX = this.x;
        this.beforeY = this.y;
        this.time++;
    },

    //アルゴリズム
    algorithm: function() {
    },

    damage: function(power, force) {
        if (this.isMuteki || this.isDead) return;
        this.def -= power;
        if (force) this.def = -1;
        if (this.def < 1) {
            //破壊パターン投入
            if (this.data.type == ENEMY_BOSS) {
                this.deadBoss();
                //ボスの場合はステージクリアを親シーンに通知
                this.parentScene.stageClear = true;
            } else {
                this.dead();
            }
            this.parentScene.enemyKill++;

            //親機に破壊を通知
            if (this.parentEnemy) this.parentEnemy.deadChild(this);

            //スコア加算
            if (!this.isSelfCrash) app.score += this.data.point;

            return true;
        }

        //被ダメージ演出
        this.changeColor("White");
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
            var x = this.x+rand(-w, w);
            var y = this.y+rand(-h, h);
            var layer = this.parentScene.effectLayerUpper;
            pbr.Effect.enterExplode(layer, {
                position: {x: x, y: y},
                velocity: {x: ground.deltaX, y: ground.deltaY, decay: 0.9},
                delay: 0,
            });
        }
    },

    //色を赤or白くする
    changeColor: function(color) {
/*
        if (!this.texName) return;
        if (color === undefined) {
            color = "";
        } else {
            if (color != "Red" && color != "White") color = "Red";
        }
        this.body.setImage(this.texName+color, this.texWidth, this.texHeight);
        this.body.setFrameIndex(this.texIndex);
*/
    },

    //通常破壊パターン
    defaultDead: function() {
        var ground = this.parentScene.ground;
        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        var upper = this.parentScene.effectLayerUpper;
        var lower = this.parentScene.effectLayerLower;

        var vx = this.x-this.beforeX+ground.deltaX;
        var vy = this.y-this.beforeY+ground.deltaY;
        if (this.data.explodeType == EXPLODE_SMALL) {
            pbr.Effect.enterExplode(upper, {
                position: {x: this.x, y: this.y},
                velocity: {x: vx, y: vy, decay: 0.95},
                delay: delay,
            });
            app.playSE("explodeSmall");
        }
        if (this.data.explodeType == EXPLODE_MIDDLE ||
            this.data.explodeType == EXPLODE_LARGE ) {
            var num = rand(20, 30)*this.data.explodeType;
            for (var i = 0; i < num; i++) {
                var x = this.x+rand(-this.width, this.width);
                var y = this.y+rand(-this.height, this.height);
                var delay = rand(0, 30);
                pbr.Effect.enterExplode(upper, {
                    position: {x: x, y: y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
            }
            app.playSE("explodeLarge");
        }
        if (this.data.explodeType == EXPLODE_GROUND) {
            var lower = this.parentScene.effectLayerLower;
            pbr.Effect.enterExplodeGround(lower, {
                position: {x: this.x, y: this.y},
                velocity: {x: vx, y: vy, decay: 0.95},
                delay: delay,
            });
            app.playSE("explodeSmall");
        }

        //弾消し
        if (this.data.type == ENEMY_MIDDLE) {
            this.parentScene.eraseBullet(this);
        } else if (this.data.type == ENEMY_LARGE) {
            this.parentScene.eraseBullet();
            this.parentScene.timeVanish = 60;
        }

        //破壊時消去インターバル
        if (this.data.explodeType == EXPLODE_SMALL) {
            this.remove();
        } else {
            this.tweener.clear()
                .to({alpha: 0}, 60)
                .call(function(){
                    this.remove();
                }.bind(this));
        }
    },

    defaultDeadBoss: function() {
        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.on("enterframe", function() {
            this.alpha *= 0.9;
            if (this.alpha < 0.02) this.remove();
        }.bind(this));

        var layer = this.parentScene.effectLayerUpper;
        var vx = this.x-this.beforeX;
        var vy = this.y-this.beforeY;
        for (var i = 0; i < 10; i++) {
            var x = rand(0, this.width)-this.width/2;
            var y = rand(0, this.height)-this.height/2;
            pbr.Effect.enterExplodeSmall(layer, {
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 0.95},
                delay: delay,
            });
        }
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();

        this.remove();
        this.parentScene.bossBattle = false;
    },

    //BulletML起動
    startDanmaku: function(danmakuName) {
        this.runner = pbr.danmaku[danmakuName].createRunner(pbr.BulletConfig);
        this.runner.onNotify = function(eventType, event) {
            this.flare("bullet" + eventType, event);
        }.bind(this);
    },

    //BulletML停止
    stopDanmaku: function() {
        if (this.runner) {
            this.runner.stop = true;
        }
    },

    //BulletML再開
    resumeDanmaku: function() {
        if (this.runner) {
            this.runner.stop = false;
        }
    },

    //親機のセット
    setParentEnemy: function(parent) {
        this.parentEnemy = parent;
    },

    //子機が破壊された場合に呼ばれるコールバック
    deadChild: function(child) {
    },

    //指定ターゲットの方向を向く
    lookAt: function(target) {
        target = target || this.parentScene.player;

        //ターゲットの方向を向く
        var ax = this.x - target.x;
        var ay = this.y - target.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);
        this.rotation = deg + 90;
    },

    //指定ターゲットの方向に進む
    moveTo: function(target, speed, look) {
        target = target || this.parentScene.player;
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
    },

    release: function() {
        this.removeChildren();
    },
});
