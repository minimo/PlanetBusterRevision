/*
 *  EffectUtility.js
 *  2014/08/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.Effect.defaultOption = {
    position: {x: SC_W*0.5, y: SC_H*0.5},
    velocity: {x: 0, y: 0, decay: 0},
    delay: 0
};

//爆発エフェクト投入（標準）
pbr.Effect.enterExplode = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    layer.enterExplode(option);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = option.delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.95},
            delay: delay2
        });
    }
}

//爆発エフェクト投入（小）
pbr.Effect.enterExplodeSmall = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    layer.enterExplode(option);

    var val = rand(3, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = option.delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.95},
            delay: delay2
        });
    }
}

//爆発エフェクト投入（大）
pbr.Effect.enterExplodeLarge = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    layer.enterExplodeLarge(option);

    var val = rand(10, 20);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = option.delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.95},
            delay: delay2
        });
    }
}

//爆発エフェクト投入（地上）
pbr.Effect.enterExplodeGround = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
//    pbr.Effect.ExplodeGround(delay).addChildTo(parentScene).setPosition(x, y).setVelocity(vx, vy, 0).setScale(2.0);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = option.delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.95},
            delay: delay2
        });
    }
}

//破片投入
pbr.Effect.enterDebrisSmall = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    num = num || 5;
    for (var i = 0; i < num; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var delay2 = option.delay+rand(0, 10);
        layer.enterDebri({
            size: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.95},
            delay: delay2
        });
    }
}

