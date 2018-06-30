/*
 *  danmaku.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

const danmaku = {};

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

var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;

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

//攻撃ヘリ「ホーネット」
danmaku.Hornet1 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

//攻撃ヘリ「ホーネット」
danmaku.Hornet2 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

//攻撃ヘリ「ホーネット」
danmaku.Hornet3 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            notify('missile'),
            interval(240),
        ]),
    ]),
});

//中型攻撃ヘリ MudDauber
danmaku.MudDauber = new bulletml.Root({
    top0: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.6), direction(0), offsetY(30)),
            repeat("$burst + 3", [
                fire(THIN, spdSeq(0), direction(0, "sequence"), offsetY(30)),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
    top1: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.5), direction(180, "absolute"), offsetX(-32)),
            repeat("$burst + 3", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(-32)),
                fire(DM, spdSeq(0), direction(-40, "sequence")),
                interval(15),
            ]),
            interval(160),
        ]),
    ]),
    top2: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.5), direction(140, "absolute"), offsetX(32)),
            repeat("$burst + 3", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(32)),
                fire(DM, spdSeq(0), direction(-40, "sequence")),
                interval(15),
            ]),
            interval(160),
        ]),
    ]),
});

//中型爆撃機「ビッグウィング」
danmaku.BigWing = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            repeat(4, [
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(200, "absolute")),
                    fire(RS, spdSeq(0), direction(  0, "sequence"), offsetX(-32), offsetY(16)),
                    fire(RS, spdSeq(0), direction( 20, "sequence"), offsetX(-32), offsetY(16)),
                    fire(RS, spdSeq(0), direction( 20, "sequence"), offsetX(-32), offsetY(16)),
                ]),
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(160, "absolute")),
                    fire(RS, spdSeq(0), direction(  0, "sequence"), offsetX(32), offsetY(16)),
                    fire(RS, spdSeq(0), direction(-20, "sequence"), offsetX(32), offsetY(16)),
                    fire(RS, spdSeq(0), direction(-20, "sequence"), offsetX(32), offsetY(16)),
                ]),
                interval(10),
            ]),
            repeat(3, [
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(200, "absolute")),
                    fire(BS, spdSeq(0), direction(180, "absolute"), offsetX( 16), offsetY(16)),
                    fire(BS, spdSeq(0), direction(180, "absolute"), offsetX(-16), offsetY(16)),
                ]),
                interval(20),
            ]),
            interval(60),
        ]),
    ]),
});

//飛空艇「スカイブレード」
danmaku.SkyBlade = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.7), direction(0), offsetY(-32)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetY(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetY(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetY(-32)),
                fire(DM, spdSeq(0.05), direction(-20, "sequence")),
            ]),
            interval(90),
        ]),
    ]),
});


//中型戦車「フラガラッハ」
danmaku.Fragarach = new bulletml.Root({
    top: action([
        interval(60),
        repeat(Infinity, [
            fire(RS, spd(0.5), direction(0)),
            repeat("$burst", [
                fire(RS, spdSeq(0.15), direction(-5, "sequence")),
                fire(RS, spdSeq(0.15), direction(10, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置１）
danmaku.Brionac1_1 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(2), direction(0, "absolute")),
            repeat("$burst + 2", [
                fire(RM, spdSeq(0.15), direction( 0, "sequence")),
                fire(RM, spdSeq(0), direction( 1, "sequence")),
                fire(RM, spdSeq(0), direction(-2, "sequence")),
                interval(2),
                fire(RM, spdSeq(0.15), direction( 3, "sequence")),
                fire(RM, spdSeq(0), direction( 5, "sequence")),
                fire(RM, spdSeq(0), direction(-7, "sequence")),
                interval(2),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置２）
danmaku.Brionac1_2 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(1), direction(0)),
            repeat("$burst + 2", [
                fire(RM, spdSeq(0), direction(0, "sequence")),
                fire(RM, spdSeq(0), direction(5, "sequence")),
                fire(RM, spdSeq(0), direction(5, "sequence")),
                fire(DM, spdSeq(0.05), direction(-10, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置３）
danmaku.Brionac1_3 = new bulletml.Root({
    top1: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top2: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(90, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top3: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(180, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top3: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(270, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//中型輸送機「トイボックス」
danmaku.ToyBox = new bulletml.Root({
    top: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(1), direction(0)),
            repeat("$burst + 1", [
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

});

