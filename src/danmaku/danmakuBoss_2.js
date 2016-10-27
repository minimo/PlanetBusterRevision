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

//マクロ
var fireAim0 = bulletml.dsl.fireAim0;
var fireAim1 = bulletml.dsl.fireAim1;
var fireAim2 = bulletml.dsl.fireAim2;
var nway = bulletml.dsl.nway;
var absoluteNway = bulletml.dsl.absoluteNway;
var circle = bulletml.dsl.circle;
var absoluteCircle = bulletml.dsl.absoluteCircle;
var whip = bulletml.dsl.whip;

//２面中ボス
pbr.danmaku.Raven = new bulletml.Root({
    top0: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.8)),
            repeat(3, [
                nway(3, -15, 15, THIN, spd(0.08)),
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
            repeat(3, [
                nway(5, -20, 20, RL, spd(0.8)),
                interval(2),
            ]),
            interval(180),
        ]),
    ]),
    top1: action([
        interval(30),
        repeat(Infinity, [
            repeat(1, [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(-148), offsetY(0)),
                interval(6),
            ]),
            interval(180),
        ]),
    ]),
    top2: action([
        interval(30),
        repeat(Infinity, [
            repeat(1, [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(148), offsetY(0)),
                interval(6),
            ]),
            interval(180),
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

