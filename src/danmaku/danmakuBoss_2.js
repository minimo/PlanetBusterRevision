/*
 *  danmakuBoss_2.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

pbr.danmaku = pbr.danmaku || {};

//ショートハンド
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

//マクロ
var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;
var fireAim0 = bulletml.dsl.fireAim0;
var fireAim1 = bulletml.dsl.fireAim1;
var fireAim2 = bulletml.dsl.fireAim2;
var nway = bulletml.dsl.nway;
var nwayVs = bulletml.dsl.nwayVs;
var absoluteNway = bulletml.dsl.absoluteNway;
var absoluteNwayVs = bulletml.dsl.absoluteNwayVs;
var circle = bulletml.dsl.circle;
var absoluteCircle = bulletml.dsl.absoluteCircle;
var whip = bulletml.dsl.whip;

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

var THIN   = bullet({type: "THIN", size: 1.0});
var THIN_L = bullet({type: "THIN", size: 1.5});

var DM = bullet({dummy: true});

//２面中ボス
pbr.danmaku.Raven = new bulletml.Root({
    top0: action([
        wait(120),
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
        interval(90),
        repeat(4, [
            repeat("$rank/10+3", [
                nway(5, -20, 20, RL, spd(0.8), offsetX(0), offsetY(0), autonomy(true)),
                interval(2),
            ]),
            interval(180),
        ]),
        notify("finish"),
    ]),
    top1: action([
        wait(120),
        repeat(4, [
            repeat("$rank/10", [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(-148), offsetY(0), autonomy(true)),
                interval(6),
            ]),
            interval(180),
        ]),
    ]),
    top2: action([
        wait(120),
        repeat(4, [
            repeat("$rank/10", [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(148), offsetY(0), autonomy(true)),
                interval(6),
            ]),
            interval(180),
        ]),
    ]),
});

//２面ボス　パターン２
pbr.danmaku.Garuda_2 = new bulletml.Root({
    top0: action([
        wait(90),
        repeat(10, [
            notify('bomb'),
            interval(60),
        ]),
        notify("finish"),
    ]),
});

//２面ボス　パターン３
pbr.danmaku.Garuda_3 = new bulletml.Root({
    top0: action([
        interval(90),
        notify("finish"),
    ]),
});

//２面ボス　パターン４（発狂）
pbr.danmaku.Garuda_4 = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            fire(bullet(DM, actionRef("inv1")), spd(3), direction("$loop.index * 5", "absolute")),
            repeat(16, [
                fire(bullet(DM, actionRef("inv1")), spdSeq(0), direction(360 / 16, "sequence")),
            ]),
            interval(60),
            fire(bullet(DM, actionRef("inv2")), spd(3), direction("$loop.index * -5", "absolute")),
            repeat(16, [
                fire(bullet(DM, actionRef("inv2")), spdSeq(0), direction(-360 / 16, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    inv1: action([
        wait(1),
        fire(RL, spd(1.2), direction(90, "relative")),
        vanish(),
    ]),
    inv2: action([
        wait(1),
        fire(RL, spd(1.2), direction(-90, "relative")),
        vanish(),
    ]),
});

//２面ボス砲台
pbr.danmaku.Garuda_hatch_1 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        repeat(5, [
            fire(DM, spd(0.4), direction(0, "absolute")),
            repeat("$burst + 5", [
                repeat(10, [
                    fire(REM, spdSeq(0), direction(38, "sequence")),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "absolute")),
            ]),
            interval(150),
        ]),
        notify("end"),
    ]),
});
pbr.danmaku.Garuda_hatch_2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        notify("end"),
    ]),
});
pbr.danmaku.Garuda_hatch_3 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        notify("end"),
    ]),
});
pbr.danmaku.Garuda_hatch_4 = new bulletml.Root({
    top0: action([
        notify("start"),
        interval(120),
        repeat(Infinity, [
            interval(120),
        ]),
    ]),
});

//２面ボスオプション武器
pbr.danmaku.GarudaBomb = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            fire(THIN, spd(0.5), direction( 90, "absolute")),
            fire(THIN, spd(0.5), direction(270, "absolute")),
            interval(30),
        ]),
    ]),
});

});

