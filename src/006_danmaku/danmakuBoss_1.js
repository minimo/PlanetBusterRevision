/*
 *  danmakuBoss_1.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

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

var THIN = bullet({ type: "THIN" });

var DM = bullet({ dummy: true });

//１面中ボス
danmaku.ThorHammer = new bulletml.Root({
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
                    fire(RM, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(320, "absolute"), offsetX(32), offsetY(16)),
                repeat(6, [
                    fire(RM, spdSeq(0), direction(30, "sequence"), offsetX(32), offsetY(16)),
                ]),
            ]),
            interval(30),
        ]),
    ]),
});

//１面中ボス（砲台）
danmaku.ThorHammerTurret = new bulletml.Root({
    top0: action([
        interval(30),
        repeat(Infinity, [
            fire(DM, spd(1), direction(-15)),
            repeat("$burst + 2", [
                fire(BEM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(0)),
                fire(BEM, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(BEM, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(DM, spdSeq(0.05), direction(-30, "sequence")),
                interval(10),
            ]),
            interval(30),
        ]),
    ]),
});

//１面ボス（パターン１）
danmaku.Golyat1_1 = new bulletml.Root({
    top0: action([
        wait(30),
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
danmaku.Golyat1_2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(30),
        repeat(5, [
            fire(DM, spd(0.4), direction(0, "absolute")),
            repeat("$burst + 5", [
                repeat(10, [
                    fire(BEM, spdSeq(0), direction(38, "sequence")),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "absolute")),
            ]),
            interval(150),
        ]),
        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（パターン３）
danmaku.Golyat1_3 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(30),

        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（発狂パターン）
danmaku.Golyat2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(60),
        repeat(Infinity, [
            repeat(3, [
                fire(THIN, spd(0.6), direction(0)),
                repeat(3, [
                    fire(THIN, spdSeq(0.1), direction(0, "sequence")),
                ]),
                fire(THIN, spdSeq(0.1), direction(-20, "sequence")),
                repeat(4, [
                    fire(THIN, spdSeq(0), direction(10, "sequence")),
                ]),
                interval(60),
            ]),
            interval(120),
        ]),
    ]),

    top1: action([
        wait(60),
        repeat(Infinity, [
            interval(30),
            repeat(5, [
                fire(DM, spd(0.5), direction(0, "absolute")),
                repeat("$burst + 5", [
                    repeat(10, [
                        fire(REM, spdSeq(0), direction(36, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(0, "absolute")),
                ]),
                interval(120),
            ]),
            interval(30),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン１）
danmaku.GolyatArm1 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            wait(30),
            fire(DM, spd(1.0), direction(-10), offsetX(0), offsetY(-40)),
            repeat("$burst + 3", [
                fire(RM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(-40)),
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
            wait(30),
            fire(DM, spd(0.8), direction(-5), offsetX(0), offsetY(20)),
            repeat("$burst + 3", [
                fire(BM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                fire(BM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(20)),
                fire(DM, spdSeq(0.1), direction(-10, "sequence")),
                interval(10),
            ]),
            notify("end2"),
            interval(120),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン２）
danmaku.GolyatArm2 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
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
            wait(30),
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
danmaku.GolyatArm3 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            wait(30),
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
            wait(30),
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
