/*
 *  EffectUtility.js
 *  2014/08/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

pbr.Effect.defaultOption = {
    position: {x: SC_W*0.5, y: SC_H*0.5},
    velocity: {x: 0, y: 0, decay: 0},
    rotation: 0,
    delay: 0
};

//爆発エフェクト投入（標準）
pbr.Effect.enterExplode = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    option.rotation = rand(0, 359);
    layer.enterExplode(option);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//爆発エフェクト投入（小）
pbr.Effect.enterExplodeSmall = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    option.rotation = rand(0, 359);
    layer.enterExplode(option);

    var val = rand(3, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = 0;
        if (i > val-2) size = rand(1, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//爆発エフェクト投入（大）
pbr.Effect.enterExplodeLarge = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    option.rotation = rand(0, 359);
    layer.enterExplodeLarge(option);

    var val = rand(10, 20);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//爆発エフェクト投入（地上）
pbr.Effect.enterExplodeGround = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    option.rotation = 0;
    layer.enterExplodeGround(option);

    var val = rand(5, 10);
    for (var i = 0; i < val; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        var size = rand(0, 3);
        layer.enterDebri({
            size: size,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//破片投入
pbr.Effect.enterDebris = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    num = option.num || 5;
    for (var i = 0; i < num; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(5, 10);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        layer.enterDebri({
            size: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//小破片投入
pbr.Effect.enterDebrisSmall = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);
    num = option.num || 5;
    for (var i = 0; i < num; i++) {
        var rad = rand(0, 359) * toRad;
        var v = rand(3, 5);
        var vx2 = Math.cos(rad) * v;
        var vy2 = Math.sin(rad) * v;
        var rot = rand(0, 359);
        var delay2 = option.delay+rand(0, 10);
        layer.enterDebri({
            size: 0,
            position: {x: option.position.x, y: option.position.y},
            velocity: {x: vx2, y: vy2, decay:0.9},
            rotation: rot,
            delay: delay2
        });
    }
}

//ボムエフェクト投入
pbr.Effect.enterBomb = function(layer, option) {
    option = (option || {}).$safe(pbr.Effect.defaultOption);

    var x = option.position.x;
    var y = option.position.y;
    layer.enterBomb({
        position: {x: x, y: y},
        velocity: {x: 0, y: 0, decay: 1},
    });
	var rad = 0;
	for( var i = 0; i < 40; i++ ){
		var rad2 = rad;
		var r = 5;
		var bx = Math.sin(rad2)*i*r;
		var by = Math.cos(rad2)*i*r;
		var delay = 10*i;
        pbr.Effect.enterExplodeSmall(layer, {x: x+bx, y: x+by, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        pbr.Effect.enterExplodeSmall(layer, {x: x+bx, y: x+by, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        pbr.Effect.enterExplodeSmall(layer, {x: x+bx, y: x+by, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        pbr.Effect.enterExplodeSmall(layer, {x: x+bx, y: x+by, delay: delay});
		rad+=0.3;
	}
}

