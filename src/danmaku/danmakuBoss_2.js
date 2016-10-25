/*
 *  danmakuBoss_2.js
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

var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;

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

//２面中ボス
pbr.danmaku.Raven = new bulletml.Root({
    top0: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(-15)),
            repeat(3, [
                fire(THIN, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(0)),
                fire(THIN, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(THIN, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(DM, spdSeq(0.08), direction(-30, "sequence")),
                interval(5),
            ]),
            interval(165),
        ]),
    ]),
    top1: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(DM, spd(0.5), direction(-20, "absolute")),
                repeat(6, [
                    fire(RM, spd(0.5), direction(-30, "sequence")),
                    repeat(5, [
                        fire(RM, spdSeq(0.08), direction(0, "sequence")),
                    ]),
                    interval(10),
                ]),
            ]),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(DM, spd(0.5), direction(20, "absolute")),
                repeat(6, [
                    fire(RM, spd(0.5), direction(30, "sequence")),
                    repeat(5, [
                        fire(RM, spdSeq(0.08), direction(0, "sequence")),
                    ]),
                    interval(10),
                ]),
            ]),
            interval(120),
        ]),
    ]),
});


//２面ボス　パターン１
pbr.danmaku.Garuda_1 = new bulletml.Root({
    top0: action([
        interval(30),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(-20)),
            repeat(3, [
                fire(RL, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(0)),
                fire(RL, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(0)),
                fire(RL, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(0)),
                fire(RL, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(0)),
                fire(RL, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(0)),
                fire(DM, spdSeq(0), direction(-40, "sequence")),
                interval(2),
            ]),
            interval(60),
        ]),
    ]),
});

//２面ボス　パターン２
pbr.danmaku.Garuda_2 = new bulletml.Root({
    top0: action([
    ]),
});

//２面ボス　パターン３
pbr.danmaku.Garuda_3 = new bulletml.Root({
    top0: action([
    ]),
});

//２面ボス　パターン４（発狂）
pbr.danmaku.Garuda_4 = new bulletml.Root({
    top0: action([
    ]),
});

//２面ボス砲台
pbr.danmaku.Garuda_hatch_1 = new bulletml.Root({
    top0: action([
    ]),
});
pbr.danmaku.Garuda_hatch_2 = new bulletml.Root({
    top0: action([
    ]),
});
pbr.danmaku.Garuda_hatch_3 = new bulletml.Root({
    top0: action([
    ]),
});

});

