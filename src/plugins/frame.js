/*
 *  frame.js
 *  2016/10/13
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("phina.extension.Frame", {
    superClass: "phina.display.Shape",

    init: function(options) {
        this.superInit(options);
        this.backgroundColor = "transparent";
        this.strokeWidth = 2;

        var x = this.width / 2;
        var y = this.height / 2;

        //フレームの描画パス
        this.drawPath = [
            //上辺
            {x: -x+10, y: -y   , side: 0},
            {x:  x- 5, y: -y   , side: 0},
            {x:  x   , y: -y+ 5, side: 0},

            //右辺
            {x:  x   , y:  y-10, side: 1},
            {x:  x-10, y:  y   , side: 1},

            //下辺
            {x: -x+35, y:  y   , side: 2},
            {x: -x+30, y:  y- 5, side: 2},
            {x: -x   , y:  y- 5, side: 2},

            //左辺
            {x: -x   , y: -y+10, side: 3},

        ];

        //外側フレームのオフセット幅
        this.drawPathOffset = 3;
    },

    prerender: function(canvas) {
        var c = canvas.context;

        var x = this.width / 2;
        var y = this.height / 2;

        var p = this.drawPath;
        c.beginPath();
        c.moveTo(p[0].x, p[0].y);
        for (var i = 1; i < p.length; i++) {
            c.lineTo(p[i].x, p[i].y);
        }
        c.closePath();

        var sg = c.createLinearGradient(y, -x, -y, x);
        sg.addColorStop(0.00, "hsla(190, 100%, 30%, 0.8)");
        sg.addColorStop(0.38, "hsla(190, 100%, 30%, 0.8)");
        sg.addColorStop(0.48, "hsla(190, 100%, 50%, 0.8)");
        sg.addColorStop(0.52, "hsla(190, 100%, 50%, 0.8)");
        sg.addColorStop(0.62, "hsla(190, 100%, 30%, 0.8)");
        sg.addColorStop(1.00, "hsla(190, 100%, 30%, 0.8)");
        this.stroke = sg;

        var fg = c.createLinearGradient(y, -x, -y, x);
        fg.addColorStop(0.00, "hsla(210, 100%, 30%, 0.2)");
        fg.addColorStop(0.38, "hsla(210, 100%, 30%, 0.2)");
        fg.addColorStop(0.48, "hsla(210, 100%, 50%, 0.2)");
        fg.addColorStop(0.52, "hsla(210, 100%, 50%, 0.2)");
        fg.addColorStop(0.62, "hsla(210, 100%, 30%, 0.2)");
        fg.addColorStop(1.00, "hsla(210, 100%, 30%, 0.2)");
        this.fill = fg;
    },

    postrender: function(canvas) {
        var c = canvas.context;

        var x = this.width / 2;
        var y = this.height / 2;

        var p = this.drawPath;
        var off = this.drawPathOffset;

        c.beginPath();
        c.moveTo(p[0].x-off, p[0].y-off);
        for (var i = 1; i < p.length; i++) {
            var px = p[i].x;
            var py = p[i].y;
            switch (p[i].side) {
                case 0:
                    px += off; py -= off;
                    break;
                case 1:
                    px += off; py += off;
                    break;
                case 2:
                    px -= off; py += off;
                    break;
                case 3:
                    px -= off; py -= off;
                    break;
            }
            c.lineTo(px, py);
        }
        c.closePath();

        c.lineWidth = 1;
        c.stroke();
    },
});

phina.define("phina.extension.CursolFrame", {
    superClass: "phina.display.Shape",

    init: function(options) {
        this.superInit(options);
        this.backgroundColor = "transparent";
        this.strokeWidth = 2;
    },

    prerender: function(canvas) {
        var c = canvas.context;

        c.beginPath();
        c.moveTo(-this.width / 2 + 10, -this.height / 2);
        c.lineTo(this.width / 2, -this.height / 2);
        c.lineTo(this.width / 2, this.height / 2 - 10);
        c.lineTo(this.width / 2 - 10, this.height / 2);
        c.lineTo(-this.width / 2, this.height / 2);
        c.lineTo(-this.width / 2, 10 - this.height / 2);
        c.closePath();

        var sg = c.createLinearGradient(this.height / 2, -this.width / 2, -this.height / 2, this.width / 2);
        sg.addColorStop(0.00, "hsla(190, 100%, 60%, 0.8)");
        sg.addColorStop(0.38, "hsla(190, 100%, 60%, 0.8)");
        sg.addColorStop(0.48, "hsla(190, 100%, 95%, 0.8)");
        sg.addColorStop(0.52, "hsla(190, 100%, 95%, 0.8)");
        sg.addColorStop(0.62, "hsla(190, 100%, 60%, 0.8)");
        sg.addColorStop(1.00, "hsla(190, 100%, 60%, 0.8)");
        this.stroke = sg;
        this.strokeWidth = 2;

        var fg = c.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        fg.addColorStop(0.00, "hsla(190, 100%, 50%, 0.5)");
        fg.addColorStop(0.40, "hsla(190, 100%, 30%, 0.5)");
        fg.addColorStop(0.60, "hsla(190, 100%, 30%, 0.5)");
        fg.addColorStop(1.00, "hsla(190, 100%, 50%, 0.5)");
        this.fill = fg;
    },

    postrender: function(canvas) {
        var c = canvas.context;

        c.moveTo(-this.width / 2 - 2, -this.height / 2 + 10 - 3);
        c.lineTo(-this.width / 2 + 10 - 2, -this.height / 2 - 3);
        c.lineTo(-this.width / 2 - 2 + 25, -this.height / 2 - 3);

        c.moveTo(this.width / 2 + 2, this.height / 2 - 10 + 3);
        c.lineTo(this.width / 2 - 10 + 2, this.height / 2 + 3);
        c.lineTo(this.width / 2 + 2 - 25, this.height / 2 + 3);

        this.renderStroke(canvas);
    },
});
