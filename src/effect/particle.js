/*
 *  patticle.js
 *  2016/04/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

var PARTICLE_VELOCITY_RANGE_X = 8;    // 速度の初期値の範囲 x
var PARTICLE_VELOCITY_RANGE_Y = 6;    // 速度の初期値の範囲 y
var PARTICLE_ACCELERATION_Y   = -0.5; // 加速度 y
var PARTICLE_SCALE            = 1;    // 初期スケール
var PARTICLE_SCALE_DOWN_SPEED = 0.025;// スケールダウンのスピード

phina.define("pbr.Effect.Particle", {
    superClass: 'phina.display.CircleShape',

    _static: {
        defaultColor: {
            start: 10, // color angle の開始値
            end: 30,   // color angle の終了値
        },
    },

    init: function(option) {
        this.superInit({
            stroke: false,
            radius: 64,
        });

        this.blendMode = 'lighter';

        var color = option.color || pbr.Effect.Particle.defaultColor;
        var grad = this.canvas.context.createRadialGradient(0, 0, 0, 0, 0, this.radius);
        grad.addColorStop(0, 'hsla({0}, 75%, 50%, 1.0)'.format(Math.randint(color.start, color.end)));
        grad.addColorStop(1, 'hsla({0}, 75%, 50%, 0.0)'.format(Math.randint(color.start, color.end)));

        this.fill = grad;
    
        this.beginPosition = Vector2();
        this.velocity = Vector2();
        this.reset(x, y);
    },

    reset: function(x, y) {
        this.beginPosition.set(x, y);
        this.position.set(this.beginPosition.x, this.beginPosition.y);
        this.velocity.set(
            Math.randint(-PARTICLE_VELOCITY_RANGE_X, PARTICLE_VELOCITY_RANGE_X),
            Math.randint(-PARTICLE_VELOCITY_RANGE_Y, PARTICLE_VELOCITY_RANGE_Y)
        );
        this.scaleX = this.scaleY = Math.randfloat(PARTICLE_SCALE*0.8, PARTICLE_SCALE*1.2);
    },

    update: function() {
        this.position.add(this.velocity);
        this.velocity.x += (this.beginPosition.x-this.x)/(this.radius/2);
        this.velocity.y += PARTICLE_ACCELERATION_Y;
        this.scaleX -= PARTICLE_SCALE_DOWN_SPEED;
        this.scaleY -= PARTICLE_SCALE_DOWN_SPEED;

        if (this.scaleX < 0) {
            this.flare('disappear');
        }
    },
});
