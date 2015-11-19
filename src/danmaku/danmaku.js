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

var R0 = bullet({
  type: 4
});
var R1 = bullet({
  type: 5
});
var R2 = bullet({
  type: 6
});
var R3 = bullet({
  type: 7
});
var B4 = bullet({
  type: 8
});
var B5 = bullet({
  type: 9
});
var R4 = bullet({
  type: 10
});
var R5 = bullet({
  type: 11
});
var DM = bullet({
  dummy: true
});

// ƒUƒRƒwƒŠ—p
var basic = function(s, dir) {
  return new bulletml.Root({
    top: action([
      interval(10),
      repeat(Infinity, [
        fire(DM, spd(s), direction(dir)),
        repeat("$burst + 1", [
          fire(R2, spdSeq(0.15), direction(0, "sequence")),
        ]),
        interval(50),
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

});

