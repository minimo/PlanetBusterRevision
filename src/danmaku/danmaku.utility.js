/*
 *  danmaku.utility.js
 *  2015/12/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {
    bulletml.dsl.global = function() {
        $action = bulletml.dsl.action;
        $actionRef = bulletml.dsl.actionRef;
        $bullet = bulletml.dsl.bullet;
        $bulletRef = bulletml.dsl.bulletRef;
        $fire = bulletml.dsl.fire;
        $fireRef = bulletml.dsl.fireRef;
        $changeDirection = bulletml.dsl.changeDirection;
        $changeSpeed = bulletml.dsl.changeSpeed;
        $accel = bulletml.dsl.accel;
        $wait = bulletml.dsl.wait;
        $vanish = bulletml.dsl.vanish;
        $repeat = bulletml.dsl.repeat;
        $bindVar = bulletml.dsl.bindVar;
        $notify = bulletml.dsl.notify;
        $direction = bulletml.dsl.direction;
        $speed = bulletml.dsl.speed;
        $horizontal = bulletml.dsl.horizontal;
        $vertical = bulletml.dsl.vertical;
        $fireOption = bulletml.dsl.fireOption;
        $offsetX = bulletml.dsl.offsetX;
        $offsetY = bulletml.dsl.offsetY;
        $autonomy = bulletml.dsl.autonomy;
    }

    var wait = bulletml.dsl.wait;
    var speed = bulletml.dsl.speed;

    bulletml.dsl.interval = function(v) {
        return wait("{0} * (0.3 + (1.0 - $densityRank) * 0.7)".format(v));
    };
    bulletml.dsl.spd = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v));
    };
    bulletml.dsl.spdSeq = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v), "sequence");
    };
});

