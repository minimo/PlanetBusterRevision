/*
 *  player.js
 *  2014/09/05
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("pbr.Player", {
    superClass: "phina.display.CanvasElement",
    _member: {
        layer: LAYER_PLAYER,

        //当り判定サイズ
        width: 2,
        height: 2,

        control: true,  //操作可能フラグ
        shotON: false,  //ショットフラグ
        mouseON: false, //マウス操作中フラグ

        isCollision: false, //当り判定有効フラグ

        timeMuteki: 0, //無敵フレーム残り時間

        speed: 4,       //移動係数
        touchSpeed: 4,  //タッチ操作時移動係数
        type: 0,        //自機タイプ(0:赤 1:緑 2:青)
        power: 0,       //パワーアップ段階
        powerMax: 5,    //パワーアップ最大

        shotPower: 10,      //ショット威力
        shotInterval: 6,    //ショット間隔

        rollcount: 50,
        pitchcount: 50,

        parentScene: null,
        indecies: [0,1,2,3,4,4,4,5,6,7,8],
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;
        this.checkHierarchy = true;

        this.time = 0;
        this.changeInterval = 0;
        return this;
    },

    update: function() {
        //機体ロール
        var x = ~~this.x;
        var bx = ~~this.bx;
        if (bx > x) {
            this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
        }
        if (bx < x) {
            this.rollcount+=2;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        var vx = Math.abs(bx - x);
        if (vx < 2) {
            if (this.rollcount < 50) this.rollcount+=2; else this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        this.setFrameIndex(this.indecies[Math.clamp(~~(this.rollcount/10),0, 9)]);

        this.bx = this.x;
        this.by = this.y;
        this.time++;
        this.timeMuteki--;
    },

    //被弾処理
    damage: function() {
    },

    //ショット発射
    enterShot: function() {
    },

    //ビット展開
    openBit: function(type) {
    },

    //プレイヤー投入時演出
    startup: function() {
    },

    //ステージ開始時演出
    stageStartup: function() {
    },
});

//プレイヤー操作用ポインタ
phina.define("pbr.PlayerPointer", {
    superClass: "phina.display.Shape",
    layer: LAYER_OBJECT_LOWER,

    init: function() {
        this.superInit({width:32, height:32});
        this.canvas.lineWidth = 3;
        this.canvas.globalCompositeOperation = "lighter";
        this.canvas.strokeStyle = "rgb(255, 255, 255)";
        this.canvas.strokeArc(16, 16, 8, Math.PI*2, 0, true);
    },

    update: function() {
        var p = app.pointing;
        if (app.player.control && p.getPointing()) {
            if (~~(this.x) == ~~(app.player.x) && ~~(this.y) == ~~(app.player.y)) {
                this.alpha = 0;
            } else {
                this.alpha = 0.5;
            }
            this.x += (p.position.x - p.prevPosition.x);
            this.y += (p.position.y - p.prevPosition.y);
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);
        } else {
            this.x = app.player.x;
            this.y = app.player.y;
            this.alpha = 0;
        }
    },
});

