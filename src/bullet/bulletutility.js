/*
 *  BulletPattern.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

pbr.BulletUtility = pbr.BulletUtility || [];

pbr.BulletUtility.DEFAULT = {
    type: "RS",
    size: 1,

    //射出座標
    x: SC_W*0.5,
    y: SC_H*0.5,

    //射出角度
    angle: 180,
    velocity: 1,
};

pbr.BulletUtility.DEFAULT_AIM = {
    type: "RS",
    size: 1,

    //射出座標
    x: SC_W*0.5,
    y: SC_H*0.5,

    //目標
    target: {x: SC_W*0.5, y: SC_H},
};

pbr.BulletUtility.DEFAULT_NWAY = {
    type: "RS",
    size: 1,

    //射出座標
    x: SC_W*0.5,
    y: SC_H*0.5,

    //目標
    target: {x: SC_W*0.5, y: SC_H},

    //弾数
    n: 3,

    //弾間角
    theta: 30,
};

pbr.BulletUtility.DEFAULT_CIRCLE = {
    type: "RS",
    size: 1,

    //射出座標
    x: SC_W*0.5,
    y: SC_H*0.5,

    //目標
    target: {x: SC_W*0.5, y: SC_H},

    //弾数
    n: 3,
};

pbr.BulletUtility.enterBullet = function(param, layer) {
    param = param.$safe(pbr.BulletUtility.DEFAULT);
    var r = param.angle * toRad;
    var v = param.velocity;
    var vx = Math.sin(r)*v;
    var vy = Math.sin(r)*v;

    layer.enterBullet({
        id: param.id,
        type: param.type,
        x: param.x,
        y: param.y,
        vx: Math.sin(r)*v,
        vy: Math.sin(r)*v,
    });
}

pbr.BulletUtility.Aim = function(param, layer) {
    param = param.$safe(pbr.BulletUtility.DEFAULT_AIM);
    var x = param.x;
    var y = param.y;
    var tx = param.target.x;
    var ty = param.target.y;
    var v = param.velocity;

    var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y)) * v;
    param.vx = (tx-x)/d;
    param.vy = (ty-y)/d;
    pbr.BulletUtility.enterBullet(param, layer);
}

pbr.BulletUtility.NWay = function(param, layer){
    param = param.$safe(pbr.BulletUtility.DEFAULT_NWAY);
    var x = param.x;
    var y = param.y;
    var tx = param.target.x;
    var ty = param.target.y;
    var v = param.velocity;

    var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y)) * v;
    var vx0 = (tx-x) / d;
    var vy0 = (ty-y) / d;
    var rad_step = param.theta * toRad;
    var rad = ~~(n/2) * rad_step;
    if( n % 2 == 0 ){
        rad -= rad_step/2;	//偶数弾処理
    }
    rad *= -1;
    for (var i = 0; i < n; i++, rad += rad_step){
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        param.vx = vx0 * c - vy0 * s;
        param.vy = vx0 * s + vy0 * c;
        pbr.BulletUtility.enterBullet(param, layer);
    }
}

pbr.BulletUtility.Circle = function(param, layer){
    param = param.$safe(pbr.BulletUtility.DEFAULT_CIRCLE);
    var x = param.x;
    var y = param.y;
    var tx = param.target.x;
    var ty = param.target.y;
    var v = param.velocity;

	var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y)) * v;
	var vx0 = (tx-x) / d;
	var vy0 = (ty-y) / d;

	var theta = 360 / n;
	var rad_step = Math.PI / 180 * theta;
	var rad = ~~(n/2) * rad_step;
	if( n % 2 == 0 ){
		rad -= rad_step/2;	//偶数弾処理
	}
	rad *= -1;
	for( i = 0; i < n; i++, rad+=rad_step ){
		var c = Math.cos(rad), s = Math.sin(rad);
		param.vx = vx0 * c - vy0 * s;
		param.vy = vx0 * s + vy0 * c;
        pbr.BulletUtility.enterBullet(param, layer);
	}
}

});

