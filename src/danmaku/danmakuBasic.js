/*
 *  danmakuBasic.js
 *  2016/04/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

pbr.danmaku = pbr.danmaku || {};

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

var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;

//íeéÌ
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

//é©ã@ë_Ç¢íe
var basic = function(s, dir) {
  return new bulletml.Root({
    top: action([
      interval(60),
      repeat(Infinity, [
        fire(DM, spd(s), direction(dir)),
        repeat("$burst + 1", [
          fire(RS, spdSeq(0.15), direction(0, "sequence")),
        ]),
        interval(60),
      ]),
    ]),
  });
};
pbr.danmaku.basic = basic(1, 0);
pbr.danmaku.basicR1 = basic(1, -5);
pbr.danmaku.basicL1 = basic(1, +5);
pbr.danmaku.basicR2 = basic(1, -15);
pbr.danmaku.basicL2 = basic(1, +15);
pbr.danmaku.basicF = basic(1.2, 0);
pbr.danmaku.basicFR1 = basic(1.2, -5);
pbr.danmaku.basicFL1 = basic(1.2, +5);
pbr.danmaku.basicFR2 = basic(1.2, -15);
pbr.danmaku.basicFL2 = basic(1.2, +15);

//N-Way(é©ã@ë_Ç¢)
var basicNway = function(n, dir, s) {
    var rn = (n-1)/2;
    return new bulletml.Root({
        top: action([
            interval(60),
            repeat(Infinity, [
                fire(DM, spd(s), direction(-dir*rn)),
                repeat("$burst + 1", [
                    fire(RS, spdSeq(0), direction(0, "sequence")),
                    repeat(n-1, [
                        fire(RS, spdSeq(0), direction(dir, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(-dir*n, "sequence")),
                ]),
                interval(60),
            ]),
        ]),
    });
};
pbr.danmaku.basic3way = basicNway(3, 10, 0.7);
pbr.danmaku.basic4way = basicNway(4, 10, 0.7);
pbr.danmaku.basic5way = basicNway(5, 10, 0.7);
pbr.danmaku.basic6way = basicNway(6, 10, 0.7);
pbr.danmaku.basic7way = basicNway(7, 10, 0.7);

//ä¬èÛíe
var basicNwayCircle = function(n, s) {
    var dir = ~~(360/n);
    var rn = (n-1)/2;
    return new bulletml.Root({
        top: action([
            interval(60),
            repeat(Infinity, [
                fire(DM, spd(s), direction(0, "absolute")),
                repeat("$burst + 1", [
                    fire(RS, spdSeq(0), direction(0, "sequence")),
                    repeat(n-1, [
                        fire(RS, spdSeq(0), direction(dir, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(-dir*n, "sequence")),
                ]),
                interval(60),
            ]),
        ]),
    });
};
pbr.danmaku.basic8wayCircle = basicNwayCircle(8, 0.7);
pbr.danmaku.basic16wayCircle = basicNwayCircle(16, 0.7);

});

