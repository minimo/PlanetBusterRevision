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

        //タイトル表示
        if (options.title) {
            phina.display.Label(options.title)
                .addChildTo(this)
                .setPosition(-x, -y)
                .setOrigin(0, 0);
        }

        //フレームの描画パス
        this.drawPath = [
            //上辺
            {x: -x+ 20, y: -y   , side: 0},
            {x: -x+150, y: -y   , side: 0},
            {x: -x+160, y: -y+20, side: 0},
            {x:  x-  5, y: -y+20, side: 0},
            {x:  x    , y: -y+25, side: 0},
/*
            {x: -x+10, y: -y   , side: 0},
            {x:  x- 5, y: -y   , side: 0},
            {x:  x   , y: -y+ 5, side: 0},
*/
            //右辺
            {x:  x   , y:  y-10, side: 1},
            {x:  x-10, y:  y   , side: 1},

            //下辺
            {x: -x+35, y:  y   , side: 2},
            {x: -x+30, y:  y- 5, side: 2},
            {x: -x   , y:  y- 5, side: 2},

            //左辺
            {x: -x   , y: -y+20, side: 3},
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
        sg.addColorStop(0.00, "hsla(230, 100%, 40%, 0.8)");
        sg.addColorStop(0.38, "hsla(230, 100%, 40%, 0.8)");
        sg.addColorStop(0.48, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.52, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.62, "hsla(230, 100%, 40%, 0.8)");
        sg.addColorStop(1.00, "hsla(230, 100%, 40%, 0.8)");
        this.stroke = sg;
        this.strokeWidth = 5;

        var fg = c.createLinearGradient(y, -x, -y, x);
        fg.addColorStop(0.00, "hsla(250, 100%, 40%, 0.2)");
        fg.addColorStop(0.38, "hsla(250, 100%, 40%, 0.2)");
        fg.addColorStop(0.48, "hsla(250, 100%, 60%, 0.2)");
        fg.addColorStop(0.52, "hsla(250, 100%, 60%, 0.2)");
        fg.addColorStop(0.62, "hsla(250, 100%, 40%, 0.2)");
        fg.addColorStop(1.00, "hsla(250, 100%, 40%, 0.2)");
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

        c.lineWidth = 2;
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
        var x = this.width / 2;
        var y = this.height / 2;

        var c = canvas.context;

        c.beginPath();
        c.moveTo(-x + 10, -y     );
        c.lineTo( x     , -y     );
        c.lineTo( x     ,  y - 10);
        c.lineTo( x - 10,  y     );
        c.lineTo(-x     ,  y     );
        c.lineTo(-x     , -y + 10);
        c.closePath();

        var sg = c.createLinearGradient(y, -x, -y, x);
        sg.addColorStop(0.00, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.38, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.48, "hsla(230, 100%, 95%, 0.8)");
        sg.addColorStop(0.52, "hsla(230, 100%, 95%, 0.8)");
        sg.addColorStop(0.62, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(1.00, "hsla(230, 100%, 60%, 0.8)");
        this.stroke = sg;
        this.strokeWidth = 2;

        var fg = c.createLinearGradient(0, -y, 0, y);
        fg.addColorStop(0.00, "hsla(230, 100%, 50%, 0.5)");
        fg.addColorStop(0.40, "hsla(230, 100%, 30%, 0.5)");
        fg.addColorStop(0.60, "hsla(230, 100%, 30%, 0.5)");
        fg.addColorStop(1.00, "hsla(230, 100%, 50%, 0.5)");
        this.fill = fg;
    },

    postrender: function(canvas) {
        var x = this.width / 2;
        var y = this.height / 2;

        var c = canvas.context;
        c.lineWidth = 3;

        c.moveTo(-x      - 3, -y + 10 - 5);
        c.lineTo(-x + 10 - 3, -y      - 5);
        c.lineTo(-x + 25 - 3, -y      - 5);

        c.moveTo( x      + 3, y - 10 + 5);
        c.lineTo( x - 10 + 3, y      + 5);
        c.lineTo( x - 25 + 3, y      + 5);

        this.renderStroke(canvas);
    },
});

phina.define("phina.extension.CircleButton", {
    superClass: "phina.display.Shape",

    init: function(options) {
        this.superInit({}.$extend(options, {
            width: options.radius * 2,
            height: options.radius * 2,
        }));

        this.interactive = true;
        this.boundingType = "circle";
        this.radius = options.radius;
        this.backgroundColor = "transparent";
        this.fill = "hsla(230, 100%, 60%, 0.4)";
        this.stroke = "hsla(230, 100%, 60%, 0.9)";
        this.strokeWidth = 2;

        this.on('enterframe', function() {
            this.inner.rotation+=0.5;
            this.outer.rotation-=0.5;
        });

        var that = this;
        var options = {
            width: options.radius * 2,
            height: options.radius * 2,
            backgroundColor: "transparent",
            fill: "hsla(230, 100%, 60%, 0.4)",
            stroke: "hsla(230, 100%, 60%, 0.9)",
            strokeWidth: 2
        };
        this.inner = phina.display.Shape(options).addChildTo(this);
        this.inner.postrender = function(canvas) {
            var c = canvas.context;
            c.strokeStyle = "hsla(230, 100%, 60%, 0.8)";
            for (var a = 0, b; a < Math.PI * 2;) {
                b = Math.randfloat(1.0, 2.0);
                c.beginPath();
                c.arc(0, 0, that.radius * 0.90, a, a + b, false);
                c.lineWidth = Math.floor(that.radius*0.2);
                c.stroke();
                a += b * 1.5;
            }
        }
        this.outer = phina.display.Shape(options).addChildTo(this);
        this.outer.postrender = function(canvas) {
            var c = canvas.context;
            c.strokeStyle = "hsla(230, 100%, 60%, 0.8)";
            for (var a = 0, b; a < Math.PI * 2;) {
                b = Math.randfloat(1.0, 2.0);
                c.beginPath();
                c.arc(0, 0, that.radius * 1.00, a, a + b, false);
                c.lineWidth = Math.floor(that.radius*0.2);
                c.stroke();
                a += b * 1.5;
            }
        }
    },

    postrender: function(canvas) {
        var c = canvas.context;

        c.strokeStyle = "hsla(230, 100%, 60%, 0.8)";

        //ボタン本体
        c.beginPath();
        c.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2, false);
        c.lineWidth = 1;
        c.fill();
        c.stroke();

        //ボタン外縁
        c.beginPath();
        c.arc(0, 0, this.radius * 0.75, 0, Math.PI * 2, false);
        c.lineWidth = Math.floor(this.radius*0.1);
        c.stroke();
    },

    onpointstart: function(e) {
        this.scaleX = 1.2;
        this.scaleY = 1.2;
    },

    onpointend: function(e) {
        this.scaleX = 1.0;
        this.scaleY = 1.0;
        if (this.hitTest(e.pointer.x, e.pointer.y)) {
            this.flare("clicked");
        }
    },
});
