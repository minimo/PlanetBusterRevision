/*
 *  danmaku.utility.js
 *  2015/12/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {
    var action = bulletml.dsl.action;
    var actionRef = bulletml.dsl.actionRef;
    var bullet = bulletml.dsl.bullet;
    var bulletRef = bulletml.dsl.bulletRef;
    var fire = bulletml.dsl.fire;
    var fireRef = bulletml.dsl.fireRef;
    var changeDirection = bulletml.dsl.changeDirection;
    var changeSpeed = bulletml.dsl.changeSpeed;
    var accel = bulletml.dsl.accel;
    var wait = bulletml.dsl.wait;
    var vanish = bulletml.dsl.vanish;
    var repeat = bulletml.dsl.repeat;
    var bindVar = bulletml.dsl.bindVar;
    var notify = bulletml.dsl.notify;
    var direction = bulletml.dsl.direction;
    var speed = bulletml.dsl.speed;
    var horizontal = bulletml.dsl.horizontal;
    var vertical = bulletml.dsl.vertical;
    var fireOption = bulletml.dsl.fireOption;
    var offsetX = bulletml.dsl.offsetX;
    var offsetY = bulletml.dsl.offsetY;
    var autonomy = bulletml.dsl.autonomy;

    var RS  = bullet({ type: "RS"  });
    var RM  = bullet({ type: "RM"  });
    var RL  = bullet({ type: "RL"  });
    var RES = bullet({ type: "RES" });
    var REM = bullet({ type: "REM" });

    var BS  = bullet({ type: "BS"  });
    var BM  = bullet({ type: "BM"  });
    var BL  = bullet({ type: "BL"  });
    var BES = bullet({ type: "BES" });
    var BEM = bullet({ type: "BEM" });
    var THIN = bullet({ type: "THIN" });

    var DM = bullet({ dummy: true });

    var wait = bulletml.dsl.wait;
    var speed = bulletml.dsl.speed;

    bulletml.dsl.interval = function(v) {
        return wait("{0} * (0.3 + (1.0 - $densityRank) * 0.7)".format(v));
    };
    bulletml.dsl.spd = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v));
    };
    bulletml.dsl.spdSeq = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v), "sequence");
    };

    /*自機弾
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.bullet} bullet 弾種
     */
    bulletml.dsl.fireAim0 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(0)) };
    bulletml.dsl.fireAim1 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-2, 2))) };
    bulletml.dsl.fireAim2 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-4, 4))) };

    /*自機狙いNway弾
     * @param {number} way 一度に射出する弾数
     * @param {number} rangeFrom 自機を０とした開始角度
     * @param {number} rangeTo 自機を０とした終了角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.nway = function(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(rangeFrom), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("((" + rangeTo + ")-(" + rangeFrom + "))/($way-1)", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };

    /**
     * 絶対Nway弾
     * @param {number} way 一度に射出する弾数
     * @param {number} rangeFrom 真上を０とした開始角度
     * @param {number} rangeTo 真上を０とした終了角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.absoluteNway = function(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY) {
        return action([
            fire(bullet || RS, speed, $direction(rangeFrom, "absolute"), offsetX, offsetY),
            bindVar("way", "Math.max(2, " + way + ")"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("((" + rangeTo + ")-(" + rangeFrom + "))/($way-1)", "sequence"), offsetX, offsetY),
            ]),
        ]);
    };

    /**
     * 自機狙いサークル弾
     * @param {number} way 一度に射出する弾数
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.circle = function(way, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(0), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            bindVar("dir", "Math.floor(360/$way)"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("$dir", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };

    /**
     * 絶対サークル弾
     * @param {number} way 一度に射出する弾数
     * @param {number} direction 真上を０とした基準角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.absoluteCircle = function(way, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(0, "absolute"), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            bindVar("dir", "Math.floor(360/$way)"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("$dir", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };

    /**
     * ウィップ
     * @param {bulletml.Speed} baseSpeed 初回のスピード
     * @param {number} delta 2回目以降のスピード増分
     * @param {number} count 回数
     * @param {function(bulletml.Speed):bulletml.Action} スピードを受け取りActionを返す関数
     */
    bulletml.dsl.whip = function(baseSpeed, delta, count, actionFunc) {
        return action([
            actionFunc(baseSpeed),
            repeat(count + "-1", [
                actionFunc(spdSeq(delta)),
            ]),
        ]);
    };
});

