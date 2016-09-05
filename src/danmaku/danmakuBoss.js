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
var THIN = bullet({ type: "THIN" });

var DM = bullet({ dummy: true });

//１面中ボス
pbr.danmaku.ThorHammer = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(20, "absolute"), offsetX(-32), offsetY(16)),
                repeat(5, [
                    fire(RM, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(340, "absolute"), offsetX(32), offsetY(16)),
                repeat(5, [
                    fire(RM, spdSeq(0), direction(30, "sequence"), offsetX(32), offsetY(16)),
                ]),
            ]),
            interval(20),

            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(40, "absolute"), offsetX(-32), offsetY(16)),
                repeat(6, [
                    fire(RS, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(320, "absolute"), offsetX(32), offsetY(16)),
                repeat(6, [
                    fire(RS, spdSeq(0), direction(30, "sequence"), offsetX(32), offsetY(16)),
                ]),
            ]),
            interval(30),
        ]),
    ]),
});

//１面中ボス（砲台）
pbr.danmaku.ThorHammerTurret = new bulletml.Root({
    top0: action([
        interval(30),
        repeat(Infinity, [
            fire(DM, spd(1), direction(-15)),
            repeat("$burst + 2", [
                fire(BS, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(0)),
                fire(BS, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(BS, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(DM, spdSeq(0.05), direction(-30, "sequence")),
                interval(10),
            ]),
            interval(30),
        ]),
    ]),
});

//１面ボス（パターン１）
pbr.danmaku.Golyat1_1 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(5, [
            notify("start"),
            interval(30),
            fire(DM, spd(0.5), direction(0, "absolute"), offsetY(-8)),
            repeat("$burst + 1", [
                fire(BEM, spdSeq(0), direction(0, "sequence"), offsetY(-8)),
                repeat(30, [
                    fire(BEM, spdSeq(0.01), direction(12, "sequence"), offsetY(-8)),
                    interval(1),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "sequence"), offsetY(-8)),
                interval(10),
            ]),
            interval(30),
            notify("end"),
            interval(120),
        ]),
        notify("finish"),
    ]),
});

//１面ボス（パターン２）
pbr.danmaku.Golyat1_2 = new bulletml.Root({
    top0: action([
        notify("start"),
        interval(30),
        repeat("$burst + 5", [
            repeat("$burst + 10", [
                fire(DM, spd(0.5), direction(0, "absolute")),
                repeat(5, [
                    fire(BEM, spdSeq(0.02), direction(36, "sequence")),
                ]),
                interval(10),
            ]),
            interval(60),
        ]),
        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（パターン３）
pbr.danmaku.Golyat1_3 = new bulletml.Root({
    top0: action([
        notify("start"),
        interval(30),

        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（発狂パターン）
pbr.danmaku.Golyat2 = new bulletml.Root({
    top0: action([
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（アーム砲台パターン１）
pbr.danmaku.GolyatArm1 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            interval(30),
            fire(DM, spd(1.0), direction(-20), offsetX(0), offsetY(-40)),
            repeat("$burst + 1", [
                fire(RM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(DM, spdSeq(0.1), direction(-20, "sequence")),
                interval(10),
            ]),
            notify("end1"),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            interval(30),
            fire(DM, spd(0.8), direction(-50), offsetX(0), offsetY(20)),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                fire(BM, spdSeq(0), direction(20, "sequence"), offsetX(0), offsetY(20)),
                fire(BM, spdSeq(0), direction(20, "sequence"), offsetX(0), offsetY(20)),
                fire(BM, spdSeq(0), direction(20, "sequence"), offsetX(0), offsetY(20)),
                fire(DM, spdSeq(0.1), direction(-50, "sequence")),
                interval(10),
            ]),
            notify("end2"),
            interval(120),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン２）
pbr.danmaku.GolyatArm2 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start2"),
            interval(30),
            fire(DM, spd(1.0), direction(180, "absolute"), offsetX(0), offsetY(20)),
            repeat(10, [
                fire(RM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                interval(15),
            ]),
            interval(60),
            notify("end2"),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            interval(30),
            fire(DM, spd(1.0), direction(180, "absolute"), offsetX(0), offsetY(20)),
            repeat(10, [
                fire(BM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                interval(15),
            ]),
            interval(60),
            notify("end2"),
            interval(120),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン３）
pbr.danmaku.GolyatArm3 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            interval(30),
            notify("missile1"),
            interval(60),
            notify("missile1"),
            interval(60),
            notify("missile1"),
            interval(30),
            notify("end1"),
            interval(180),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            interval(30),
            notify("missile2"),
            interval(60),
            notify("missile2"),
            interval(60),
            notify("missile2"),
            interval(30),
            notify("end2"),
            interval(180),
        ]),
    ]),
});

});

