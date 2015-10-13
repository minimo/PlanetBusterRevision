/*
 *  playerpointer.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//プレイヤー操作用ポインタ
phina.define("pbr.PlayerPointer", {
    superClass: "phina.display.Shape",
    layer: LAYER_OBJECT_LOWER,

    init: function() {
        this.superInit({width:32, height:32});
        this.canvas.lineWidth = 3;
        this.canvas.globalCompositeOperation = "lighter";
        this.canvas.strokeStyle = "rgb(255, 255, 255)";
        this.canvas.strokeArc(16, 16, 8, Math.PI*2, 0, true);
    },

    update: function(app) {
        var p = app.mouse;
        if (this.player.control && p.getPointing()) {
            if (~~(this.x) == ~~(this.player.x) && ~~(this.y) == ~~(this.player.y)) {
                this.alpha = 0;
            } else {
                this.alpha = 0.5;
            }
            this.x += (p.position.x - p.prevPosition.x);
            this.y += (p.position.y - p.prevPosition.y);
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);
        } else {
            this.x = this.player.x;
            this.y = this.player.y;
            this.alpha = 0;
        }
    },
});
