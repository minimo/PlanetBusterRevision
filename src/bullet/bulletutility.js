/*
 *  BulletPattern.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

pbr.BulletUtility = pbr.BulletUtility || [];

pbr.BulletUtility.DEFAULT_PARAM = {
    type: "RS",
    size: 1,
    x: SC_W*0.5,
    y: SC_H*0.5,
    target: null,
    tx: 0,
    ty: 0,
    theta: 30,
    n: 5,
    speed: 1,
    delay: 0,
};

pbr.BulletUtility.aim = function(param) {
    param = param.$safe(pbr.BulletUtility.DEFAULT_PARAM);
    var x = param.x;
    var y = param.y;
    var tx = param.tx;
    var ty = param.ty;

    param.d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
    param.vx = (tx-x)/d*speed;
    param.vy = (ty-y)/d*speed;
    this.enterBullet(param);
}

pbr.BulletUtility.NWay = function(param){
    param = param.$safe(pbr.BulletUtility.DEFAULT_PARAM);
    var x = param.x;
    var y = param.y;
    var tx = param.tx;
    var ty = param.ty;

    var d = Math.sqrt((tx-x)*(tx-x) + (ty-y)*(ty-y));
    var vx0 = (tx-x) / d * speed;
    var vy0 = (ty-y) / d * speed;
    var rad_step = Math.PI / 180 * theta;
    var rad = ~~(n/2) * rad_step;
    if( n % 2 == 0 ){
        rad -= rad_step/2;	//ãÙêîíeèàóù
    }
    rad *= -1;
    for (var i=0; i<n; i++, rad+=rad_step){
        var c = Math.cos(rad);
        var s = Math.sin(rad);
        var vx = vx0 * c - vy0 * s;
        var vy = vx0 * s + vy0 * c;
        this.enterBullet(parent,type,size,x,y,vx,vy,accel,delay);
    }
}

});

