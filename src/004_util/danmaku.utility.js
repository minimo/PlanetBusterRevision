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

    //弾種
    var RS  = bullet({type: "normal", color: "red", size: 0.6});
    var RM  = bullet({type: "normal", color: "red", size: 0.8});
    var RL  = bullet({type: "normal", color: "red", size: 1.0});
    var RES = bullet({type: "roll", color: "red", size: 0.6});
    var REM = bullet({type: "roll", color: "red", size: 1.0});

    var BS  = bullet({type: "normal", color: "blue", size: 0.6});
    var BM  = bullet({type: "normal", color: "blue", size: 0.8});
    var BL  = bullet({type: "normal", color: "blue", size: 1.0});
    var BES = bullet({type: "roll", color: "blue", size: 0.6});
    var BEM = bullet({type: "roll", color: "blue", size: 1.0});

    var THIN = bullet({ type: "THIN" });

    var DM  = bullet({ dummy: true });

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

    bulletml.dsl.rank = function() {
        return "$difficulty + ($rank*0.01)-1";
    };

    /*自機弾
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.bullet} bullet 弾種
     */
    bulletml.dsl.fireAim0 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(0)) };
    bulletml.dsl.fireAim1 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-2, 2))) };
    bulletml.dsl.fireAim2 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-4, 4))) };
    //ウィップ用
    bulletml.dsl.fireAim0Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim0(bullet, speed);
        };
    };
    bulletml.dsl.fireAim1Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim1(bullet, speed);
        };
    };
    bulletml.dsl.fireAim2Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim2(bullet, speed);
        };
    };

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
    //ウィップ用
    bulletml.dsl.nwayVs = function(way, rangeFrom, rangeTo, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.nway(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY, autonomy);
        };
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
    //ウィップ用
    bulletml.dsl.absoluteNwayVs = function(way, rangeFrom, rangeTo, bullet, offsetX, offsetY) {
        return function(speed) {
            return bulletml.dsl.nway(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY);
        };
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
    //ウィップ用
    bulletml.dsl.circleVs = function(way, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.circle(way, bullet, speed, offsetX, offsetY, autonomy);
        }
    };

    /**
     * 絶対サークル弾
     * @param {number} way 一度に射出する弾数
     * @param {number} dir 真上を０とした基準角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.absoluteCircle = function(way, dir, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(dir, "absolute"), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            bindVar("dir", "Math.floor(360/$way)"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("$dir", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.absoluteCircleVs = function(way, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.circle(way, bullet, speed, offsetX, offsetY, autonomy);
        }
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
                actionFunc(bulletml.dsl.spdSeq(delta)),
            ]),
        ]);
    };
});
