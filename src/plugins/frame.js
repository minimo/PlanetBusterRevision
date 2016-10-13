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
    },

    prerender: function(canvas) {
        var c = canvas.context;

        var x = this.width / 2;
        var y = this.height / 2;

        c.beginPath();
        c.moveTo(-x+10, -y   );
        c.lineTo( x- 5, -y   );
        c.lineTo( x   , -y+ 5);
        c.lineTo( x   ,  y-10);
        c.lineTo( x-10,  y   );
        c.lineTo(-x+35, y);
        c.lineTo(-x+30, y- 5);
        c.lineTo(-x   , y- 5);
        c.lineTo(-x   , 10-y);
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

        c.beginPath();
        c.moveTo(-this.width / 2 + 10 - 3, -this.height / 2 - 3);
        c.lineTo(this.width / 2 - 5 + 3, -this.height / 2 - 3);
        c.lineTo(this.width / 2 + 3, -this.height / 2 + 5 - 3);
        c.lineTo(this.width / 2 + 3, this.height / 2 - 10 + 3);
        c.lineTo(this.width / 2 - 10 + 3, this.height / 2 + 3);
        c.lineTo(-this.width / 2 + 35 - 3, this.height / 2 + 3);
        c.lineTo(-this.width / 2 + 30 - 3, this.height / 2 - 5 + 3);
        c.lineTo(-this.width / 2 - 3, this.height / 2 - 5 + 3);
        c.lineTo(-this.width / 2 - 3, -this.height / 2 + 10 - 3);
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
