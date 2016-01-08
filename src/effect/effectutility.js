/*
 *  EffectUtility.js
 *  2014/08/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//爆発エフェクト投入（標準）
pbr.Effect.enterExplode = function(layer, x, y, vx, vy, delay) {
    vx = vx || 0;
    vy = vy || 0;
    delay = delay || 0;
    layer.enterExplode(x, y, vx, vy, delay);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri(size, x, y, vx2, vy2, delay2);
    }
}

//爆発エフェクト投入（小）
pbr.Effect.enterExplodeSmall = function(layer, x, y, vx, vy, delay) {
    vx = vx || 0;
    vy = vy || 0;
    delay = delay || 0;
    layer.enterExplode(x, y, vx, vy, delay);

    var val = rand(3, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri(size, x, y, vx2, vy2, delay2);
    }
}

//爆発エフェクト投入（大）
pbr.Effect.enterExplodeLarge = function(layer, x, y, vx, vy, delay) {
    vx = vx || 0;
    vy = vy || 0;
    delay = delay || 0;
    layer.enterExplodeLarge(x, y, vx, vy, delay);

    var val = rand(10, 20);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri(size, x, y, vx2, vy2, delay2);
    }
}

//爆発エフェクト投入（地上）
pbr.Effect.enterExplodeGround = function(layer, x, y, vx, vy, delay) {
    vx = vx || 0;
    vy = vy || 0;
    delay = delay || 0;
//    pbr.Effect.ExplodeGround(delay).addChildTo(parentScene).setPosition(x, y).setVelocity(vx, vy, 0).setScale(2.0);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri(size, x, y, vx2, vy2, delay2);
    }
}

//破片投入
pbr.Effect.enterDebrisSmall = function(layer, x, y, num, delay) {
    num = num || 5;
    delay = delay || 0;
    for (var i = 0; i < num; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = delay+rand(0, 10);
        var size = 0;
        layer.enterDebri(size, x, y, vx2, vy2, delay2);
    }
}

