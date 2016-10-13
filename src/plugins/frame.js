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

        c.beginPath();
        c.moveTo(-this.width / 2 + 10, -this.height / 2);
        c.lineTo(this.width / 2 - 5, -this.height / 2);
        c.lineTo(this.width / 2, -this.height / 2 + 5);
        c.lineTo(this.width / 2, this.height / 2 - 10);
        c.lineTo(this.width / 2 - 10, this.height / 2);

        c.lineTo(-this.width / 2 + 35, this.height / 2);
        c.lineTo(-this.width / 2 + 30, this.height / 2 - 5);
        c.lineTo(-this.width / 2, this.height / 2 - 5);
        c.lineTo(-this.width / 2, 10 - this.height / 2);
        c.closePath();

        var sg = c.createLinearGradient(this.height / 2, -this.width / 2, -this.height / 2, this.width / 2);
        sg.addColorStop(0.00, "hsla(190, 100%, 30%, 0.8)");
        sg.addColorStop(0.38, "hsla(190, 100%, 30%, 0.8)");
        sg.addColorStop(0.48, "hsla(190, 100%, 50%, 0.8)");
        sg.addColorStop(0.52, "hsla(190, 100%, 50%, 0.8)");
        sg.addColorStop(0.62, "hsla(190, 100%, 30%, 0.8)");
        sg.addColorStop(1.00, "hsla(190, 100%, 30%, 0.8)");
        this.stroke = sg;

        var fg = c.createLinearGradient(this.height / 2, -this.width / 2, -this.height / 2, this.width / 2);
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
