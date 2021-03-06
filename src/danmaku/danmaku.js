/*
 *  danmaku.js
 *  2015/10/11
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

var interval = function(v) {
  return wait("{0} * (0.3 + (1.0 - $densityRank) * 0.7)".format(v));
};
var spd = function(v) {
  return speed("{0} * (1.0 + $speedRank * 2.0)".format(v));
};
var spdSeq = function(v) {
  return speed("{0} * (1.0 + $speedRank * 2.0)".format(v), "sequence");
};

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

var DM  = bullet({ dummy: true });

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

var basic3way = function(dir) {
    return new bulletml.Root({
        top: action([
            interval(10),
            repeat(Infinity, [
                fire(DM, spd(1), direction(dir - 7)),
                repeat("$burst + 1", [
                    fire(RS, spdSeq(0), direction(0, "sequence")),
                    fire(RS, spdSeq(0), direction(7, "sequence")),
                    fire(RS, spdSeq(0), direction(7, "sequence")),
                    fire(DM, spdSeq(0.05), direction(-14, "sequence")),
                ]),
                interval(50),
            ]),
        ]),
    });
};
pbr.danmaku.basic3way = basic3way(0);
pbr.danmaku.basic3wayR1 = basic3way(-5);
pbr.danmaku.basic3wayL1 = basic3way(+5);
pbr.danmaku.basic3wayR2 = basic3way(-15);
pbr.danmaku.basic3wayL2 = basic3way(+15);

//中型攻撃ヘリ MudDauber
pbr.danmaku.MudDauber = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(1), direction(-10)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetX(-32)),
                fire(DM, spdSeq(0.05), direction(-20, "sequence")),
            ]),
            interval(60),
        ]),
    ]),
    top1: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(1), direction(-10)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetX(32)),
                fire(DM, spdSeq(0.05), direction(-20, "sequence")),
            ]),
            interval(60),
        ]),
    ]),
});

 //中型爆撃機「ビッグウィング」
 pbr.danmaku.BigWing = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction( 0, "absolute"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(10, "absolute"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(10, "absolute"), offsetX(-32)),
            ]),
            interval(60),
        ]),
    ]),
});

});

