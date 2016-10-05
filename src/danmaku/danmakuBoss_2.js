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

//２面中ボス
pbr.danmaku.Raven = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(20, "absolute"), offsetX(-32), offsetY(16)),
                repeat(5, [
                    fire(RM, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            interval(30),
        ]),
    ]),
});


});
