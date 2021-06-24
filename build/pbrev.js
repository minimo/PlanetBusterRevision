/*
 *  Benri.js
 *  2014/12/18
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
var toRad = 3.14159/180;    //弧度法toラジアン変換
var toDeg = 180/3.14159;    //ラジアンto弧度法変換

//距離計算
var distance = function(from, to) {
    var x = from.x-to.x;
    var y = from.y-to.y;
    return Math.sqrt(x*x+y*y);
}

//距離計算（ルート無し版）
var distanceSq = function(from, to) {
    var x = from.x - to.x;
    var y = from.y - to.y;
    return x*x+y*y;
}

//数値の制限
var clamp = function(x, min, max) {
    return (x<min)?min:((x>max)?max:x);
};

//乱数生成
var prand = phina.util.Random();
var rand = function(min, max) {
    return prand.randint(min, max);
}

//タイトル無しダイアログ
var AdvanceAlert = function(str) {
    var tmpFrame = document.createElement('iframe');
    tmpFrame.setAttribute('src', 'data:text/plain,');
    document.documentElement.appendChild(tmpFrame);

    window.frames[0].window.alert(str);
    tmpFrame.parentNode.removeChild(tmpFrame);
};
var AdvanceConfirm = function(str) {
    var tmpFrame = document.createElement('iframe');
    tmpFrame.setAttribute('src', 'data:text/plain,');
    document.documentElement.appendChild(tmpFrame);

    var result = window.frames[0].window.confirm(str);
    tmpFrame.parentNode.removeChild(tmpFrame);

    return result;
};

//数値をカンマ編集して文字列として出力
Number.prototype.$method("comma",  function() {
    var str = this+'';
    var len = str.length;
    var out = '';
    for (var i = len-1; i > -1; i--) {
        out = str[i]+out;
        if (i != 0 && (len-i)%3 == 0) out = ','+out;
    }
    return out;
});

/*
 *  Button.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//通常のボタン
phina.define("phina.extension.Button", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        buttonColor: 'rgba(50, 150, 255, 0.8)',
        strokeColor: 'rgba(200, 200, 200, 0.5)',
        strokeWidth: 4,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: "UbuntuMono",
        fontSize: 50,
        flat: false,
    },

    DEFAULT_STYLE_FLAT: {
        buttonColor: 'rgba(150, 150, 250, 1.0)',
        strokeColor: 'rgba(0, 0, 0, 0.5)',
        strokeWidth: 3,
        fontFamily: "UbuntuMono",
        fontSize: 50,
        flat: true,
    },

    labelParam: {align: "center", baseline:"middle", outlineWidth:3},

    text: "",
    push: false,
    lock: false,

    //ボタン押下時の移動量
    downX: 0,
    downY: 10,

    //フラット時透明度
    alphaON: 0.9,
    alphaOFF: 0.4,

    init: function(options) {
        this.superInit();
        options = (options||{}).$safe({
            width: 200,
            height: 80,
            text: "undefined",
            style: null
        });

        this.width = options.width;
        this.height = options.height;
        this.text = options.text;

        //セットアップ
        this.setup(options.style);

        //判定処理設定
        this.interactive = true;
        this.boundingType = "rect";
    },

    setup: function(style) {
        style = style || {};
        if (style.flat) {
            style.$safe(this.DEFAULT_STYLE_FLAT);
        } else {
            style.$safe(this.DEFAULT_STYLE);
        }
        this.style = style;

        //登録済みの場合破棄する
        if (this.shadow) {
            if (!style.flat) this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var width = this.width, height = this.height;

        if (!style.flat) {
            //ボタン影
            var shadowStyle = {
                width: width,
                height: height,
                fill: style.shadowColor,
                stroke: style.shadowColor,
                strokeWidth: style.strokeWidth
            };
            this.shadow = phina.display.RectangleShape(shadowStyle)
                .addChildTo(this)
                .setPosition(this.downX, this.downY);
            this.shadow.blendMode = "source-over";
        }
        //ボタン本体
        var buttonStyle = {
            width: width,
            height: height,
            fill: style.buttonColor,
            stroke: style.strokeColor,
            strokeWidth: style.strokeWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);
        if (style.flat) this.button.setAlpha(this.alphaOFF);

        //ボタンラベル
        var parent = this.button;
        if (style.flat) parent = this;
        this.labelParam.fontFamily = style.fontFamily;
        this.label = phina.display.OutlineLabel(this.text, style.fontSize)
            .addChildTo(parent)
            .setParam(this.labelParam);
    },
    buttonPushStart: function(e) {
        if (this.style.flat) {
            this.button.setAlpha(this.alphaON);
        } else {
            this.button.x += this.downX;
            this.button.y += this.downY;
        }
    },
    buttonPushMove: function(e) {
        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            if (!this.push) {
                this.push = true;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaON);
                } else {
                    this.button.x += this.downX;
                    this.button.y += this.downY;
                }
            }
        } else {
            if (this.push) {
                this.push = false;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaOFF);
                } else {
                    this.button.x -= this.downX;
                    this.button.y -= this.downY;
                }
            }
        }
    },
    buttonPushEnd: function(e) {
        if (this.style.flat) {
            this.button.setAlpha(this.alphaOFF);
        } else {
            this.button.x -= this.downX;
            this.button.y -= this.downY;
        }
    },

    setVisible: function(b) {
        if (this.shadow) this.shadow.visible = b;
        this.button.visible = b;
        this.label.visible = b;
        return this;
    },

    setLock: function(b) {
        this.lock = b;
        return this;
    },

    ontouchstart: function(e) {
        if (this.lock) return;

        this.push = true;
        this.buttonPushStart(e);
        var e = phina.event.Event("push");
        this.dispatchEvent(e);
    },
    ontouchmove: function(e) {
        if (this.lock) return;
        this.buttonPushMove(e);
    },
    ontouchend: function(e) {
        if (this.lock) return;

        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            this.push = false;
            this.buttonPushEnd(e);

            var e = phina.event.Event("pushed");
            this.dispatchEvent(e);
        }
    },
});

//角丸ボタン
phina.define("phina.extension.RoundButton", {
    superClass: "phina.extension.Button",

    init: function(options) {
        this.superInit(options);
    },

    setup: function(style) {
        style = style || {};
        style.$safe(this.DEFAULT_STYLE);

        //登録済みの場合破棄する
        if (this.shadow) {
            this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var width = this.width, height = this.height;

        //ボタン影
        var shadowStyle = {
            width: width,
            height: height,
            fill: style.shadowColor,
            stroke: style.shadowColor,
            strokeWidth: style.strokeWidth,
            radius: style.radius,
        };
        this.shadow = phina.display.RoundRectangleShape(shadowStyle)
            .addChildTo(this)
            .setPosition(this.downX, this.downY);
        this.shadow.blendMode = "source-over";

        //ボタン本体
        var buttonStyle = {
            width: width,
            height: height,
            fill: style.buttonColor,
            stroke: style.strokeColor,
            strokeWidth: style.strokeWidth,
            radius: style.radius,
        };
        this.button = phina.display.RoundRectangleShape(buttonStyle)
            .addChildTo(this);

        //ボタンラベル
        this.labelParam.fontFamily = style.fontFamily;
        this.label = phina.display.OutlineLabel(this.text, style.fontSize)
            .addChildTo(this.button)
            .setParam(this.labelParam);
    },
});

//トグルボタン
phina.define("phina.extension.ToggleButton", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        buttonColor: 'rgba(50, 150, 255, 0.8)',
        lineColor: 'rgba(200, 200, 200, 0.5)',
        lineWidth: 4,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        fontFamily: "UbuntuMono",
        fontSize: 50,
        falt: false,
    },

    DEFAULT_STYLE_FLAT: {
        buttonColor: 'rgba(150, 150, 250, 1.0)',
        lineColor: 'rgba(0, 0, 0, 0.5)',
        lineWidth: 3,
        fontFamily: "UbuntuMono",
        fontSize: 50,
        flat: true,
    },

    labelParam: {align: "center", baseline:"middle", outlineWidth:3 },

    onText: "",
    offText: "",
    push: false,
    lock: false,
    _toggleON: false,

    //ボタン押下時の移動量
    downX: 0,
    downY: 10,

    //フラット時透明度
    alphaON: 0.9,
    alphaOFF: 0.4,

    init: function(options) {
        options = (options||{}).$safe({
            width: 200,
            height: 80,
            onText: "ON",
            offText: "OFF",
            style: null
        });
        this.superInit();
 
        this.width = options.width;
        this.height = options.height;
        this.onText = options.onText;
        this.offText = options.offText;

        //セットアップ
        this.setup(style);

        //判定処理設定
        this.interactive = true;
        this.boundingType = "rect";
    },

    setup: function(style) {
        style = style || {};
        if (style.flat) {
            style.$safe(this.DEFAULT_STYLE_FLAT);
        } else {
            style.$safe(this.DEFAULT_STYLE);
        }
        this.style = style;

        //登録済みの場合破棄する
        if (this.shadow) {
            if (!style.flat) this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var width = this.width, height = this.height;

        if (!style.flat) {
            //ボタン影
            var shadowStyle = {
                width: width,
                height: height,
                fill: style.shadowColor,
                stroke: style.shadowColor,
                strokeWidth: style.strokeWidth
            };
            this.shadow = phina.display.RectangleShape(shadowStyle)
                .addChildTo(this)
                .setPosition(this.downX, this.downY);
            this.shadow.blendMode = "source-over";
        }

        //ボタン本体
        var buttonStyle = {
            width: width,
            height: height,
            fill: style.buttonColor,
            stroke: style.lineColor,
            strokeWidth: style.strokeWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);
        if (style.flat) this.button.setAlpha(this.alphaOFF);

        //ボタンラベル
        var parent = this.button;
        if (style.flat) parent = this;
        this.labelParam.fontFamily = style.fontFamily;
        this.label = phina.display.OutlineLabel(this.text, style.fontSize)
            .addChildTo(parent)
            .setParam(this.labelParam);
    },
    setLock: function(b) {
        this.lock = b;
        return this;
    },

    buttonPushStart: function(e) {
        this.push = true;
        if (this._toggleON) {
            if (this.style.flat) {
                this.button.setAlpha(this.alphaON);
            } else {
                this.button.x += this.downX*0.5;
                this.button.y += this.downY*0.5;
            }
        } else {
            if (this.style.flat) {
                this.button.setAlpha(this.alphaOFF);
            } else {
                this.button.x += this.downX*1.5;
                this.button.y += this.downY*1.5;
            }
        }
    },
    buttonPushMove: function(e) {
        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            if (!this.push) {
                this.push = true;
                if (this._toggleON) {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaON);
                    } else {
                        this.button.x += this.downX*0.5;
                        this.button.y += this.downY*0.5;
                    }
                } else {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaOFF);
                    } else {
                        this.button.x += this.downX*1.5;
                        this.button.y += this.downY*1.5;
                    }
                }
            }
        } else {
            if (this.push) {
                this.push = false;
                if (this._toggleON) {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaON);
                    } else {
                        this.button.x -= this.downX*0.5;
                        this.button.y -= this.downY*0.5;
                    }
                } else {
                    if (this.style.flat) {
                        this.button.setAlpha(this.alphaOFF);
                    } else {
                        this.button.x -= this.downX*1.5;
                        this.button.y -= this.downY*1.5;
                    }
                }
            }
        }
    },
    buttonPushEnd: function(e) {
        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            this.push = false;
            this._toggleON = !this._toggleON;
            if (this._toggleON) {
                this.text = this.onText;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaON);
                } else {
                    this.button.x -= this.downX*0.5;
                    this.button.y -= this.downY*0.5;
                }
            } else {
                this.text = this.offText;
                if (this.style.flat) {
                    this.button.setAlpha(this.alphaOFF);
                } else {
                    this.button.x -= this.downX*1.5;
                    this.button.y -= this.downY*1.5;
                }
            }
            this.label.text = this.text;
            var e = phina.event.Event("pushed");
            this.dispatchEvent(e);
        }
    },

    ontouchstart: function(e) {
        if (this.lock) return;

        this.push = true;
        this.buttonPushStart(e);
        var e = phina.event.Event("push");
        this.dispatchEvent(e);
    },
    ontouchmove: function(e) {
        if (this.lock) return;
        this.buttonPushMove(e);
    },
    ontouchend: function(e) {
        if (this.lock) return;

        var pt = e.pointing;
        if (this.isHitPoint(pt.x, pt.y)) {
            this.push = false;
            this.buttonPushEnd(e);

            var e = phina.event.Event("pushed");
            this.dispatchEvent(e);
        }
    },
});
phina.extension.ToggleButton.prototype.accessor("toggleON", {
    "set": function(b) {
        this._toggleON = b;

        if (this._toggleON) {
            this.text = this.onText;
            if (this.style.flat) {
                this.button.setAlpha(this.alphaON);
            } else {
                this.button.x = this.downX;
                this.button.y = this.downY;
            }
        } else {
            this.text = this.offText;
            if (this.style.flat) {
                this.button.setAlpha(this.alphaOFF);
            } else {
                this.button.x = 0;
                this.button.y = 0;
            }
        }
        this.label.text = this.text;
    },

    "get": function() {
        return this._toggleON;
    },
});

//スライドボタン
phina.define("phina.extension.SlideButton", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        width: 160,
        height: 80,

        buttonWitdh: 80,
        buttonHeight: 80,

        //ボタン色
        buttonColor: 'rgba(255, 255, 255, 1.0)',
        buttonLine:  'rgba(200, 200, 200, 1.0)',
        lineWidth: 2,

        //ベース(on/off)色
        onColor: 'rgba(0, 255, 0, 1.0)',
        offColor: 'rgba(200, 200, 200, 1.0)',
    },

    _slideON: false,

    init: function(style) {
        this.superInit();

        this.style = style || {};
        this.style.$safe(this.DEFAULT_STYLE)

        this.width = style.width || 160;
        this.height = style.height || 80;

        this.text = this.offText;

        //セットアップ
        this.setup();

        //判定処理設定
        this.interactive = true;
        this.boundingType = "rect";
//        this.checkHierarchy = true;

        //イベントリスナ登録
        this.addEventListener("touchstart", function() {
            if (this._slideON) {
            } else {
            }
            var e = phina.event.Event("slide");
            this.dispatchEvent(e);
        });
    },

    setup: function() {
        //登録済みの場合破棄する
        if (this.shadow) {
            this.shadow.remove();
            this.label.remove();
            this.button.remove();
        }

        var style = this.style;
        var width = this.width, height = this.height;
        var buttonWidth = this.button, heightButton = this.heightButton;

        //ボタンベース
        var baseStyle = {
            width: width,
            height: height,
            fill: style.offColor,
            stroke: style.offColor,
            strokeWidth:  style.strokeWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);

        //ボタン本体
        var buttonStyle = {
            width: buttonWidth,
            height: buttonHeight,
            fill: style.buttonColor,
            stroke: style.lineColor,
            strokeWidth: style.strokeWidth
        };
        this.button = phina.display.RectangleShape(buttonStyle)
            .addChildTo(this);
    },
});

phina.extension.SlideButton.prototype.accessor("slideON", {
    "set": function(b) {
        this._slideON = b;

        if (this._slideON) {
        } else {
        }
    },

    "get": function() {
        return this._slideON;
    },
});

/*
 * collision.js
 */

phina.collision = phina.collision || {};
 
(function() {

    /**
     * @class phina.collision
     * 衝突判定
     */
    phina.collision;
    
    /**
     * @method testCircleCircle
     * 円同士の衝突判定
     */
    phina.collision.testCircleCircle = function(circle0, circle1) {
        var distanceSquared = phina.geom.Vector2.distanceSquared(circle0, circle1);
        return distanceSquared <= Math.pow(circle0.radius + circle1.radius, 2);
    };
    
    /**
     * @method testRectRect
     * 矩形同士の衝突判定
     */
    phina.collision.testRectRect = function(rect0, rect1) {
        return (rect0.left < rect1.right) && (rect0.right > rect1.left) &&
               (rect0.top < rect1.bottom) && (rect0.bottom > rect1.top);
    };

    phina.collision.testCircleRect = function(circle, rect) {
        // まずは大きな矩形で判定(高速化)
        var bigRect = phina.geom.Rect(rect.left-circle.radius, rect.top-circle.radius, rect.width+circle.radius*2, rect.height+circle.radius*2);
        if (bigRect.contains(circle.x, circle.y) == false) {
            return false;
        }
        
        // 2種類の矩形と衝突判定
        var r = phina.geom.Rect(rect.left-circle.radius, rect.top, rect.width+circle.radius*2, rect.height);
        if (r.contains(circle.x, circle.y)) {
            return true;
        }
        r.set(rect.left, rect.top-circle.radius, rect.width, rect.height+circle.radius*2);
        if (r.contains(circle.x, circle.y)) {
            return true;
        }
        
        // 円と矩形の４点の判定
        var c = phina.geom.Circle(circle.x, circle.y, circle.radius);
        // left top
        if (c.contains(rect.left, rect.top)) {
            return true;
        }
        // right top
        if (c.contains(rect.right, rect.top)) {
            return true;
        }
        // right bottom
        if (c.contains(rect.right, rect.bottom)) {
            return true;
        }
        // left bottom
        if (c.contains(rect.left, rect.bottom)) {
            return true;
        }
        
        return false;
    };

    phina.collision.testRectCircle = function(rect, circle) {
        return this.testCircleRect(circle, rect);
    };
 
})();














/*
 *  extension.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//エレメント同士の接触判定
phina.display.DisplayElement.prototype.isHitElement = function(elm) {
    if (this.boundingType == 'rect') {
        if (elm.boundingType == 'rect') {
            return phina.collision.testRectRect(this, elm);
        } else {
            return phina.collision.testRectCircle(this, elm);
        }
    } else {
        if (elm.boundingType == 'rect') {
            return phina.collision.testRectCircle(elm, this);
        } else {
            return phina.collision.testCircleCircle(this, elm);
        }
    }
}

//子要素全て切り離し
phina.app.Element.prototype.removeChildren = function(beginIndex) {
    beginIndex = beginIndex || 0;
    var tempChildren = this.children.slice();
    var len = tempChildren.length;
    for (var i = beginIndex; i < len; ++i) {
        tempChildren[i].remove();
    }
    this.children = [];
}

//ターゲット方向を向く
phina.display.DisplayElement.prototype.lookAt = function(target) {
    target = target || {x: 0, y: 0};

    var ax = this.x - target.x;
    var ay = this.y - target.y;
    var rad = Math.atan2(ay, ax);
    var deg = ~~(rad * toDeg);
    this.rotation = deg + 90;
    return this;
}


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
        this.boundingType = "rect";
        this.backgroundColor = "transparent";
        this.strokeWidth = 2;
    },

    prerender: function(canvas) {
        var x = this.width / 2;
        var y = this.height / 2;

        var c = canvas.context;

        c.beginPath();

        //上辺
        c.moveTo(-x + 10, -y     );
        c.lineTo( x - 10, -y     );

        //右辺
        c.lineTo( x     , -y + 10);
        c.lineTo( x     ,  y - 10);

        //下辺
        c.lineTo( x - 10,  y     );
        c.lineTo(-x + 10,  y     );

        //右辺
        c.lineTo(-x     ,  y - 10);
        c.lineTo(-x     , -y + 10);

        c.closePath();

        var sg = c.createLinearGradient(0, -y,  0, y);
        sg.addColorStop(0.00, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(0.38, "hsla(230, 100%, 95%, 0.8)");
        sg.addColorStop(0.48, "hsla(230, 100%, 90%, 0.8)");
        sg.addColorStop(0.52, "hsla(230, 100%, 70%, 0.8)");
        sg.addColorStop(0.62, "hsla(230, 100%, 60%, 0.8)");
        sg.addColorStop(1.00, "hsla(230, 100%, 60%, 0.8)");
        this.stroke = sg;
        this.strokeWidth = 3;

        var fg = c.createLinearGradient(0, -y, 0, y);
        fg.addColorStop(0.00, "hsla(230, 100%, 50%, 0.8)");
        fg.addColorStop(0.38, "hsla(230, 100%, 80%, 0.8)");
        fg.addColorStop(0.48, "hsla(230, 100%, 60%, 0.8)");
        fg.addColorStop(0.52, "hsla(230, 100%, 50%, 0.8)");
        fg.addColorStop(0.62, "hsla(230, 100%, 50%, 0.8)");
        fg.addColorStop(1.00, "hsla(230, 100%, 50%, 0.8)");
        this.fill = fg;
    },

    postrender: function(canvas) {
        var x = this.width / 2;
        var y = this.height / 2;

        var c = canvas.context;
        c.lineWidth = 3;

        c.moveTo(-x + 10 - 5, -y     );
        c.lineTo(-x      - 5, -y + 10);
        c.lineTo(-x      - 5,  y - 10);
        c.lineTo(-x + 10 - 5,  y     );

        c.moveTo( x - 10 + 5, -y     );
        c.lineTo( x      + 5, -y + 10);
        c.lineTo( x      + 5,  y - 10);
        c.lineTo( x - 10 + 5,  y     );

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

        this.active = true;

        this.on('enterframe', function() {
            if (this.active) {
                this.inner.rotation+=0.5;
                this.outer.rotation-=0.5;
            }
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

/*
 *  gauge.js
 *  2016/07/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

phina.define("phina.extension.Gauge", {
    superClass: "phina.display.DisplayElement",

    //描画スタイル設定
    DEFAULT_STYLE: {
        fill: 'rgba(0, 0, 200, 1.0)',
        empty: 'rgba(0, 0, 0, 0.0)',
        stroke: 'rgba(255, 255, 255, 1.0)',
        strokeWidth: 4,
    },

    min: 0,
    max: 100,
    value: 100,

    init: function(options) {
        this.superInit();
        options = (options||{}).$safe({
            width: 640,
            height: 10,
            style: null
        });

        this.width = options.width;
        this.height = options.height;

        //セットアップ
        this.setup(options.style);
    },

    setup: function(style) {
        style = style || {};
        style.$safe(this.DEFAULT_STYLE);
        this.style = style;

        var width = this.width;
        var height = this.height;

        var gaugeStyle = {
            width: width,
            height: height,
            fill: style.fill,
            stroke: style.fill,
            strokeWidth: 1
        }
        this.gauge = phina.display.RectangleShape(gaugeStyle)
            .setPosition(width*-0.5, 0)
            .addChildTo(this);
        this.gauge.originX = 0;

        var frameStyle = {
            width: width,
            height: height,
            fill: style.empty,
            stroke: style.stroke,
            strokeWidth: style.strokeWidth
        }
        this.gaugeFrame = phina.display.RectangleShape(frameStyle)
            .setPosition(width*-0.5, 0)
            .addChildTo(this);
        this.gaugeFrame.originX = 0;
        
//        this.tweener.clear().to({value: 0}, 2000).to({value: 100}, 2000).setLoop(true);
    },

    update: function() {
        this.gauge.width = this.width*(this.value/(this.max-this.min));
    },

    setValue: function(v) {
        this.value = v;
        return this;
    },
    setMax: function(v) {
        this.max = v;
        return this;
    },
    setMin: function(v) {
        this.min = v;
        return this;
    },
});


/*
 *  phina.extension.js
 *  2016/11/25
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//スプライト機能拡張
phina.display.Sprite.prototype.setFrameTrimming = function(x, y, width, height) {
  this._frameTrimX = x || 0;
  this._frameTrimY = y || 0;
  this._frameTrimWidth = width || this.image.domElement.width - this._frameTrimX;
  this._frameTrimHeight = height || this.image.domElement.height - this._frameTrimY;
  return this;
}

phina.display.Sprite.prototype.setFrameIndex = function(index, width, height) {
  var sx = this._frameTrimX || 0;
  var sy = this._frameTrimY || 0;
  var sw = this._frameTrimWidth  || (this.image.domElement.width-sx);
  var sh = this._frameTrimHeight || (this.image.domElement.height-sy);

  var tw  = width || this.width;      // tw
  var th  = height || this.height;    // th
  var row = ~~(sw / tw);
  var col = ~~(sh / th);
  var maxIndex = row*col;
  index = index%maxIndex;

  var x   = index%row;
  var y   = ~~(index/row);
  this.srcRect.x = sx+x*tw;
  this.srcRect.y = sy+y*th;
  this.srcRect.width  = tw;
  this.srcRect.height = th;

  this._frameIndex = index;

  return this;
}

/*
 *  SliceSprite.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("phina.display.SliceSprite", {
    superClass: "phina.display.CanvasElement",

    init: function(image, width, height, option) {
        this.superInit();
        this.option = option.$safe({
            sliceX: 2,  //��������
            sliceY: 2,  //�c������
            trimming: { //�g���~���O���
                x: 0,
                y: 0,
                width: width,
                height: height,
            },
        });

        this.image = image;
        this.width = width;
        this.height = height;

        this.sprites = [];
        var i = 0;
        var cw = ~(width/option.sliceX);
        var ch = ~(height/option.sliceY);
        for (var y = 0; y < option.sliceY; y++) {
            for (var x = 0; x < option.sliceX; x++) {
                var s = phina.display.Sprite(image, cw, ch).addChildTo(this);
                s.setFrameIndex(i).setPosition(x*cw-width/2, y*ch-height/2);
                this.sprites.push(s);
                i++;
            }
        }
    },

    //�o���o��
    fallApart: function(func) {
        func = func || function(e) {
            var sx = (e.x==0?0:(e.x>0?1:-1));
            var sy = (e.y==0?0:(e.y>0?1:-1));
            e.tweener.clear()
                .to({x: e.x*10, y:e.y*10, alpha: 0}, 1000, "easeOutSine");
        }
        this.sprites.each(func);
        return this;
    },

    //���ɖ߂�
    reinstate: function() {
        var i = 0;
        var cw = ~(this.width/this.option.sliceX);
        var ch = ~(this.height/this.option.sliceY);
        for (var y = 0; y < this.option.sliceY; y++) {
            for (var x = 0; x < this.option.sliceX; x++) {
                s.rotation = 0;
                s.setPosition(x*cw-this.width/2, y*ch-this.height/2);
                i++;
            }
        }
        return this;
    },
});


/*
 *  SoundSet.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.extension = phina.extension || {};

//サウンド管理
phina.define("phina.extension.SoundSet", {

    //サウンドが格納される配列
    elements: null,

    //再生中ＢＧＭ
    bgm: null,
    bgmIsPlay: false,

    //マスターボリューム
    volumeBGM: 0.5,
    volumeSE: 0.5,

    init: function() {
        this.elements = [];
    },

    //登録済みアセット読み込み
    readAsset: function() {
        for (var key in phina.asset.AssetManager.assets.sound) {
            var obj = phina.asset.AssetManager.get("sound", key);
            if (obj instanceof phina.asset.Sound) this.add(key);
        }
    },

    //サウンド追加
    add: function(name, url) {
        if (name === undefined) return null;
        url = url || null;
        if (this.find(name)) return true;

        var e = phina.extension.SoundElement(name);
        if (!e.media) return false;
        this.elements.push(e);
        return true;
    },

    //サウンド検索
    find: function(name) {
        if (!this.elements) return null;
        for (var i = 0; i < this.elements.length; i++) {
            if (this.elements[i].name == name) return this.elements[i];
        }
        return null;
    },

    //サウンドをＢＧＭとして再生
    playBGM: function(name, loop, callback) {
        if (loop === undefined) loop = true;
        if (this.bgm) {
            this.bgm.stop();
            this.bgmIsPlay = false;
        }
        var media = this.find(name);
        if (media) {
            var vol = this.volumeBGM * media.volume;
            media.setVolume(vol);
            media.play(loop, callback);
            this.bgm = media;
            this.bgmIsPlay = true;
        } else {
            if (this.add(name)) this.playBGM(name);
        }
        return this;
    },

    //ＢＧＭ停止
    stopBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.stop();
                this.bgmIsPlay = false;
            }
            this.bgm = null;
        }
        return this;
    },

    //ＢＧＭ一時停止
    pauseBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.pause();
                this.bgmIsPlay = false;
            }
        }
        return this;
    },

    //ＢＧＭ再開
    resumeBGM: function() {
        if (this.bgm) {
            if (!this.bgmIsPlay) {
                this.bgm.volume = this.volumeBGM;
                this.bgm.resume();
                this.bgmIsPlay = true;
            }
        }
        return this;
    },

    //ＢＧＭマスターボリューム設定
    setVolumeBGM: function(vol) {
        this.volumeBGM = vol;
        if (this.bgm) {
            this.bgm.pause();
            this.bgm.setVolume(this.volumeBGM);
            this.bgm.resume();
        }
        return this;
    },

    //サウンドをサウンドエフェクトとして再生
    playSE: function(name, loop, callback) {
        var media = this.find(name);
        if (media) {
            var vol = this.volumeSE;
            media.setVolume(vol);
            media.play(loop, callback);
        } else {
            if (this.add(name)) this.playSE(name);
        }
        return this;
    },

    //ループ再生しているSEを停止
    stopSE: function(name) {
        var media = this.find(name);
        if (media) {
            media.stop();
        }
        return this;
    },

    //ＢＧＭ一時停止
    pauseBGM: function() {
        if (this.bgm) {
            if (this.bgmIsPlay) {
                this.bgm.pause();
                this.bgmIsPlay = false;
            }
        }
        return this;
    },

    //ＳＥマスターボリューム設定
    setVolumeSE: function(vol) {
        this.volumeSE = vol;
        return this;
    },
});

//SoundElement Basic
phina.define("phina.extension.SoundElement", {
    //サウンド名
    name: null,

    //ＵＲＬ
    url: null,

    //サウンド本体
    media: null,

    //ボリューム
    _volume: 1,

    //再生終了時のコールバック関数
    callback: null,

    //再生中フラグ
    playing: false,

    init: function(name) {
        this.name = name;
        this.media = phina.asset.AssetManager.get("sound", name);
        if (this.media) {
            this.media.volume = 1;
            this.media.on('ended', function() {
                if (this.media.loop) this.playing = false;
                if (this.callback) this.callback();
            }.bind(this))
        } else {
            console.warn("asset not found. "+name);
        }
    },

    //サウンドの再生
    play: function(loop, callback) {
        if (loop === undefined) loop = false
        if (!this.media) return this;

        //ループ再生の場合多重再生を禁止
        if (loop && this.playing) return;

        this.media.loop = loop;
        this.media.play();
        this.callback = callback;
        this.playing = true;
        return this;
    },

    //サウンド再生再開
    resume: function() {
        if (!this.media) return this;
        this.media.resume();
        this.playing = true;
        return this;
    },

    //サウンド一時停止
    pause: function () {
        if (!this.media) return this;
        this.media.pause();
        this.playing = false;
    },

    //サウンド停止
    stop: function() {
        if (!this.media) return this;
        this.media.stop();
        this.playing = false;
        return this;
    },

    //ボリューム設定
    setVolume: function(vol) {
        if (!this.media) return this;
        if (vol === undefined) vol = 0;
        this._volume = vol;
        this.media.volume = this._volume;
        return this;
    },

    _accessor: {
        volume: {
            "get": function() { return this._volume; },
            "set": function(vol) { this.setVolume(vol); }
        },
        loop: {
            "get": function() { return this.media.loop; },
            "set": function(f) { this.media.loop = f; }
        },
    }
});

/*
 *  tiledmap.js
 *  2016/9/10
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("phina.asset.TiledMap", {
    superClass: "phina.asset.Asset",

    image: null,

    tilesets: null,
    layers: null,

    init: function() {
        this.superInit();
    },

    _load: function(resolve) {
        //パス抜き出し
        this.path = "";
        var last = this.src.lastIndexOf("/");
        if (last > 0) {
            this.path = this.src.substring(0, last+1);
        }

        //終了関数保存
        this._resolve = resolve;

        // load
        var self = this;
        var xml = new XMLHttpRequest();
        xml.open('GET', this.src);
        xml.onreadystatechange = function() {
            if (xml.readyState === 4) {
                if ([200, 201, 0].indexOf(xml.status) !== -1) {
                    var data = xml.responseText;
                    data = (new DOMParser()).parseFromString(data, "text/xml");
                    self.dataType = "xml";
                    self.data = data;
                    self._parse(data);
//                    resolve(self);
                }
            }
        };
        xml.send(null);
    },

    //マップイメージ取得
    getImage: function() {
        return this.image;
    },

    //オブジェクトグループを配列にして取得
    getObjectGroup: function(groupName) {
        groupName = groupName || null;
        var ls = [];
        var len = this.layers.length;
        for (var i = 0; i < len; i++) {
            if (this.layers[i].type == "objectgroup") {
                if (groupName == null || groupName == this.layers[i].name) {
                    //ディープコピー
                    var obj = {}.$safe(this.layers[i]);
                    obj.objects = [];
                    var len2 = this.layers[i].objects.length;
                    for (var r = 0; r < len2; r++) {
                        var obj2 = {
                            properties: {}.$safe(this.layers[i].objects[r].properties),
                            executed: false,
                        }.$safe(this.layers[i].objects[r]);
                        obj.objects[r] = obj2;
                    }
                }
                ls.push(obj);
            }
        }
        return ls;
    },

    _parse: function(data) {
        //タイル属性情報取得
        var map = data.getElementsByTagName('map')[0];
        var attr = this._attrToJSON(map);
        this.$extend(attr);

        //タイルセット取得
        this.tilesets = this._parseTilesets(data);

        //タイルセット情報補完
        var defaultAttr = {
            tilewidth: 32,
            tileheight: 32,
            spacing: 0,
            margin: 0,
        };
        this.tilesets.chips = [];
        for (var i = 0; i < this.tilesets.length; i++) {
            //タイルセット属性情報取得
            var attr = this._attrToJSON(data.getElementsByTagName('tileset')[i]);
            attr.$safe(defaultAttr);
            attr.firstgid--;
            this.tilesets[i].$extend(attr);

            //マップチップリスト作成
            var t = this.tilesets[i];
            this.tilesets[i].mapChip = [];
            for (var r = attr.firstgid; r < attr.firstgid+attr.tilecount; r++) {
                var chip = {
                    image: t.image,
                    x: ((r - attr.firstgid) % t.columns) * (t.tilewidth + t.spacing) + t.margin,
                    y: Math.floor((r - attr.firstgid) / t.columns) * (t.tileheight + t.spacing) + t.margin,
                }.$safe(attr);
                this.tilesets.chips[r] = chip;
            }
        }

        //レイヤー取得
        this.layers = this._parseLayers(data);

        //イメージデータ読み込み
        this._checkImage();
    },

    //アセットに無いイメージデータを読み込み
    _checkImage: function() {
        var that = this;
        var imageSource = [];
        var loadImage = [];

        //一覧作成
        for (var i = 0; i < this.tilesets.length; i++) {
            var obj = {
                image: this.tilesets[i].image,
                transR: this.tilesets[i].transR,
                transG: this.tilesets[i].transG,
                transB: this.tilesets[i].transB,
            };
            imageSource.push(obj);
        }
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].image) {
                var obj = {
                    image: this.layers[i].image.source
                };
                imageSource.push(obj);
            }
        }

        //アセットにあるか確認
        for (var i = 0; i < imageSource.length; i++) {
            var image = phina.asset.AssetManager.get('image', imageSource[i].image);
            if (image) {
                //アセットにある
            } else {
                //なかったのでロードリストに追加
                loadImage.push(imageSource[i]);
            }
        }

        //一括ロード
        //ロードリスト作成
        var assets = {
            image: []
        };
        for (var i = 0; i < loadImage.length; i++) {
            //イメージのパスをマップと同じにする
            assets.image[imageSource[i].image] = this.path+imageSource[i].image;
        }
        if (loadImage.length) {
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                //透過色設定反映
                loadImage.forEach(function(elm) {
                    var image = phina.asset.AssetManager.get('image', elm.image);
                    if (elm.transR !== undefined) {
                        var r = elm.transR, g = elm.transG, b = elm.transB;
                        image.filter(function(pixel, index, x, y, bitmap) {
                            var data = bitmap.data;
                            if (pixel[0] == r && pixel[1] == g && pixel[2] == b) {
                                data[index+3] = 0;
                            }
                        });
                    }
                });
                //マップイメージ生成
                that.image = that._generateImage();
                //読み込み終了
                that._resolve(that);
            }.bind(this));
        } else {
            //マップイメージ生成
            this.image = that._generateImage();
            //読み込み終了
            this._resolve(that);
        }
    },

    //マップイメージ作成
    _generateImage: function() {
        var numLayer = 0;
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].type == "layer" || this.layers[i].type == "imagelayer") numLayer++;
        }
        if (numLayer == 0) return null;

        var width = this.width * this.tilewidth;
        var height = this.height * this.tileheight;
        var canvas = phina.graphics.Canvas().setSize(width, height);

        for (var i = 0; i < this.layers.length; i++) {
            //マップレイヤー
            if (this.layers[i].type == "layer") {
                var layer = this.layers[i];
                var mapdata = layer.data;
                var width = layer.width;
                var height = layer.height;
                var count = 0;
                for (var y = 0; y < height; y++) {
                    for (var x = 0; x < width; x++) {
                        var index = mapdata[count];
                        if (index !== -1) {
                            //マップチップを配置
                            this._setMapChip(canvas, index, x * this.tilewidth, y * this.tileheight);
                        }
                        count++;
                    }
                }
            }
            //イメージレイヤー
            if (this.layers[i].type == "imagelayer") {
                var len = this.layers[i];
                var image = phina.asset.AssetManager.get('image', this.layers[i].image.source);
                canvas.context.drawImage(image.domElement, this.layers[i].x, this.layers[i].y);
            }
        }

        var texture = phina.asset.Texture();
        texture.domElement = canvas.domElement;
        return texture;
    },

    //キャンバスの指定した座標にマップチップのイメージをコピーする
    _setMapChip: function(canvas, index, x, y) {
        //タイルセットからマップチップを取得
        var chip = this.tilesets.chips[index];
        var image = phina.asset.AssetManager.get('image', chip.image);
        canvas.context.drawImage(
            image.domElement,
            chip.x + chip.margin, chip.y + chip.margin,
            chip.tilewidth, chip.tileheight,
            x, y,
            chip.tilewidth, chip.tileheight);
    },

    //XMLプロパティをJSONに変換
    _propertiesToJSON: function(elm) {
        var properties = elm.getElementsByTagName("properties")[0];
        var obj = {};
        if (properties === undefined) {
            return obj;
        }
        for (var k = 0; k < properties.childNodes.length; k++) {
            var p = properties.childNodes[k];
            if (p.tagName === "property") {
                //propertyにtype指定があったら変換
                var type = p.getAttribute('type');
                var value = p.getAttribute('value');
                if (type == "int") {
                    obj[p.getAttribute('name')] = parseInt(value, 10);
                } else if (type == "float") {
                    obj[p.getAttribute('name')] = parseFloat(value);
                } else {
                    obj[p.getAttribute('name')] = value;
                }
            }
        }
        return obj;
    },

    //XML属性をJSONに変換
    _attrToJSON: function(source) {
        var obj = {};
        for (var i = 0; i < source.attributes.length; i++) {
            var val = source.attributes[i].value;
            val = isNaN(parseFloat(val))? val: parseFloat(val);
            obj[source.attributes[i].name] = val;
        }
        return obj;
    },

    //タイルセットのパース
    _parseTilesets: function(xml) {
        var each = Array.prototype.forEach;
        var self = this;
        var data = [];
        var tilesets = xml.getElementsByTagName('tileset');
        each.call(tilesets, function(tileset) {
            var t = {};
            var props = self._propertiesToJSON(tileset);
            if (props.src) {
                t.image = props.src;
            } else {
                t.image = tileset.getElementsByTagName('image')[0].getAttribute('source');
            }
            //透過色設定取得
            t.trans = tileset.getElementsByTagName('image')[0].getAttribute('trans');
            t.transR = parseInt(t.trans.substring(0, 2), 16);
            t.transG = parseInt(t.trans.substring(2, 4), 16);
            t.transB = parseInt(t.trans.substring(4, 6), 16);

            data.push(t);
        });
        return data;
    },

    //レイヤー情報のパース
    _parseLayers: function(xml) {
        var each = Array.prototype.forEach;
        var data = [];

        var map = xml.getElementsByTagName("map")[0];
        var layers = [];
        each.call(map.childNodes, function(elm) {
            if (elm.tagName == "layer" || elm.tagName == "objectgroup" || elm.tagName == "imagelayer") {
                layers.push(elm);
            }
        });

        layers.each(function(layer) {
            switch (layer.tagName) {
                case "layer":
                    //通常レイヤー
                    var d = layer.getElementsByTagName('data')[0];
                    var encoding = d.getAttribute("encoding");
                    var l = {
                        type: "layer",
                        name: layer.getAttribute("name"),
                    };

                    if (encoding == "csv") {
                        l.data = this._parseCSV(d.textContent);
                    } else if (encoding == "base64") {
                        l.data = this._parseBase64(d.textContent);
                    }

                    var attr = this._attrToJSON(layer);
                    l.$extend(attr);

                    data.push(l);
                    break;

                //オブジェクトレイヤー
                case "objectgroup":
                    var l = {
                        type: "objectgroup",
                        objects: [],
                        name: layer.getAttribute("name"),
                    };
                    each.call(layer.childNodes, function(elm) {
                        if (elm.nodeType == 3) return;
                        var d = this._attrToJSON(elm);
                        d.properties = this._propertiesToJSON(elm);
                        l.objects.push(d);
                    }.bind(this));

                    data.push(l);
                    break;

                //イメージレイヤー
                case "imagelayer":
                    var l = {
                        type: "imagelayer",
                        name: layer.getAttribute("name"),
                        x: parseFloat(layer.getAttribute("offsetx")) || 0,
                        y: parseFloat(layer.getAttribute("offsety")) || 0,
                        alpha: layer.getAttribute("opacity") || 1,
                        visible: (layer.getAttribute("visible") === undefined || layer.getAttribute("visible") != 0),
                    };
                    var imageElm = layer.getElementsByTagName("image")[0];
                    l.image = {source: imageElm.getAttribute("source")};

                    data.push(l);
                    break;
            }
        }.bind(this));
        return data;
    },

    //CSVパース
    _parseCSV: function(data) {
        var dataList = data.split(',');
        var layer = [];

        dataList.each(function(elm, i) {
            var num = parseInt(elm, 10) - 1;
            layer.push(num);
        });

        return layer;
    },

    /**
     * BASE64パース
     * http://thekannon-server.appspot.com/herpity-derpity.appspot.com/pastebin.com/75Kks0WH
     * @private
     */
    _parseBase64: function(data) {
        var dataList = atob(data.trim());
        var rst = [];

        dataList = dataList.split('').map(function(e) {
            return e.charCodeAt(0);
        });

        for (var i=0,len=dataList.length/4; i<len; ++i) {
            var n = dataList[i*4];
            rst[i] = parseInt(n, 10) - 1;
        }

        return rst;
    },
});

//ローダーに追加
phina.asset.AssetLoader.assetLoadFunctions.tmx = function(key, path) {
    var tmx = phina.asset.TiledMap();
    return tmx.load(path);
};

/*
 *  Application.js
 *  2015/09/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//namespace pbr(PlanetBusterRevision)
let pbr = {};

phina.define("Application", {
    superClass: "phina.display.CanvasApp",

	_static: {
        version: "0.0.1",
        stageName: {
            1: "Operation PLANET_BUSTER",
            2: "Dance in the Sky",
        },
        assets: {
            "preload": {
                sound: {
                    "start":         "assets/sounds/soundlogo40.mp3",
                    "setting":       "assets/sounds/receipt05.mp3",
                    "warning":       "assets/sounds/bgm_warning.mp3",
                    "powerup":       "assets/sounds/ta_ta_suraido01.mp3",
                    "explodeSmall":  "assets/sounds/sen_ge_taihou03.mp3", 
                    "explodeLarge":  "assets/sounds/sen_ge_hasai01.mp3", 
                    "explodeBoss":   "assets/sounds/se_maoudamashii_explosion02.mp3",
                    "explodePlayer": "assets/sounds/ta_ta_zuban_d01.mp3", 
                    "bomb":          "assets/sounds/bomb.mp3",
                    "playermiss":    "assets/sounds/ta_ta_zuban_d01.mp3",
                    "stageclear":    "assets/sounds/bgm_stageclear.mp3",
                    "gameover":      "assets/sounds/soundlogo9.mp3",
                    "cancel":        "assets/sounds/se_maoudamashii_system20.mp3",
                    "select":        "assets/sounds/se_maoudamashii_system36.mp3",
                    "click":         "assets/sounds/se_maoudamashii_system26.mp3",
                    "click2":        "assets/sounds/click2.mp3",
                    "boss":          "assets/sounds/bgm_maoudamashii_neorock10.mp3",
                },
                font: {
                    "UbuntuMono":   "fonts/UbuntuMono-Bold.ttf",
                    "Orbitron":     "fonts/Orbitron-Regular.ttf",
                }
            },
            "common": {
                image: {
                    "tex1":     "assets/images/tex1.png",
                    "tex2":     "assets/images/tex2.png",
                    "tex_boss1":"assets/images/tex_boss1.png",
                    "bullet":   "assets/images/bullet.png",
                    "gunship":  "assets/images/gunship1.png",
                    "bit":      "assets/images/bit1.png",                    
                    "shot":     "assets/images/shot.png",
                    "effect":   "assets/images/effect.png",
                    "bomb":     "assets/images/bomb.png",
                    "particle": "assets/images/particle.png",
                    "map1g":    "assets/maps/map1.png",
                },
            },
            "stage1": {
                sound: {
                    "stage1":        "assets/sounds/expsy.mp3",
                },
            },
            "stage2": {
                sound: {
                    "stage2":        "assets/sounds/dance_in_the_sky.mp3",
                },
            },
            "stage9": {
                sound: {
                    "stage9":        "assets/sounds/departure.mp3",
                },
                tmx: {
                    "map1":          "assets/maps/map1.tmx",
                    "map1_enemy":    "assets/maps/map1_enemy.tmx",
                },
            },
        },
    },

    _member: {
        //ゲーム内情報
        difficulty: 1,  //難易度
        score: 0,       //スコア
        rank: 1,        //難易度ランク
        numContinue: 0, //コンティニュー回数

        //エクステンド設定
        extendScore: [500000, 2000000, 5000000],
        extendAdvance: 0,
        isExtendEvery: false,
        extendEveryScore: 500000,

        //プレイヤー設定
        setting: {
            zanki: 3,       //残機
            bombStock: 2,   //ボム残数
            bombStockMax: 2,//ボム最大数
            autoBomb: false,//オートボムフラグ
        },

        //デフォルト設定
        _defaultSetting: {
            difficulty: 1,
            zanki: 3,
            bombStock: 2,
            bombStockMax: 2,
            autoBomb: false,

            //エクステンド設定
            extendScore: [500000, 2000000, 5000000],
            isExtendEvery: false,
            extendEveryScore: 500000,
        },

        //現在設定
        currentrySetting: {
            difficulty: 1,
            zanki: 3,
            bombStock: 2,
            bombStockMax: 2,
            autoBomb: false,
        },

        //ＢＧＭ＆効果音
        soundset: null,

        //バックグラウンドカラー
        backgroundColor: 'rgba(0, 0, 0, 1)',
    },

    init: function() {
        this.superInit({
            query: '#world',
            width: SC_W,
            height: SC_H,
        });
        this.$extend(this._member);

        this.fps = 60;
/*
        this.canvas.context.imageSmoothingEnabled = true;
        this.domElement.style.imageRendering = "pixelated";
*/
        //設定情報の読み込み
        this.loadConfig();

        //ＢＧＭ＆ＳＥ
        this.soundset = phina.extension.SoundSet();

        //ゲームパッドを使用する
        this.gamepadManager = phina.input.GamepadManager();
        this.gamepad = this.gamepadManager.get(0);
        this.on('enterframe', function() {
            this.gamepadManager.update();
            this.updateController();
        });

        this.replaceScene(SceneFlow());
    },

    //コントローラー情報の更新
    updateController: function() {
        var gp = this.gamepad;
        var kb = this.keyboard;
        var angle1 = gp.getKeyAngle();
        var angle2 = kb.getKeyAngle();
        this.controller = {
            angle: angle1 !== null? angle1: angle2,

            up: gp.getKey("up") || kb.getKey("up"),
            down: gp.getKey("down") || kb.getKey("down"),
            left: gp.getKey("left") || kb.getKey("left"),
            right: gp.getKey("right") || kb.getKey("right"),

            shot: gp.getKey("A") || kb.getKey("Z"),
            bomb: gp.getKey("B") || kb.getKey("X"),
            special1: gp.getKey("X") || kb.getKey("C"),
            special2: gp.getKey("Y") || kb.getKey("V"),

            ok: gp.getKey("A") || kb.getKey("Z") || kb.getKey("space"),
            cancel: gp.getKey("B") || kb.getKey("X"),

            start: gp.getKey("start"),
            select: gp.getKey("select"),

            analog1: gp.getStickDirection(0),
            analog2: gp.getStickDirection(1),
        };
    },

    _onLoadAssets: function() {
        this.soundset.readAsset();

        //特殊効果用ビットマップ作成
        [
            "tex1",
            "tex2",
            "tex_boss1",
            "gunship",
            "bit",
        ].forEach(function(name) {
            //ダメージ用
            if (!phina.asset.AssetManager.get("image", name+"White")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = (pixel[0] == 0? 0: 128); //r
                    data[index+1] = (pixel[1] == 0? 0: 128); //g
                    data[index+2] = (pixel[2] == 0? 0: 128); //b
                });
                phina.asset.AssetManager.set("image", name+"White", tex);
            }
            //瀕死用
            if (!phina.asset.AssetManager.get("image", name+"Red")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = pixel[0];
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Red", tex);
            }
            //影用
            if (!phina.asset.AssetManager.get("image", name+"Black")) {
                var tex = phina.asset.AssetManager.get("image", name).clone();
                tex.filter( function(pixel, index, x, y, bitmap) {
                    var data = bitmap.data;
                    data[index+0] = 0;
                    data[index+1] = 0;
                    data[index+2] = 0;
                });
                phina.asset.AssetManager.set("image", name+"Black", tex);
            }
        });
    },

    //設定データの保存
    saveConfig: function() {
        return this;
    },

    //設定データの読み込み
    loadConfig: function() {
        return this;
    },

    playBGM: function(asset, loop, callback) {
        if (loop === undefined) loop = true;
        this.soundset.playBGM(asset, loop, callback);
    },

    stopBGM: function(asset) {
        this.soundset.stopBGM();
    },

    setVolumeBGM: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeBGM(vol);
    },

    playSE: function(asset, loop) {
        this.soundset.playSE(asset, loop);
    },

    setVolumeSE: function(vol) {
        if (vol > 1) vol = 1;
        if (vol < 0) vol = 0;
        this.soundset.setVolumeSE(vol);
    },

    _accessor: {
        volumeBGM: {
            "get": function() { return this.sounds.volumeBGM; },
            "set": function(vol) { this.setVolumeBGM(vol); }
        },
        volumeSE: {
            "get": function() { return this.sounds.volumeSE; },
            "set": function(vol) { this.setVolumeSE(vol); }
        }
    }
});

/*
 *  main.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//phina.globalize();

//定数
//バージョンナンバー
const _VERSION_ = "0.1.0";

//デバッグフラグ
const DEBUG = false;
const MUTEKI = false;
const VIEW_COLLISION = false;

//スクリーンサイズ
const SC_W = 320;
const SC_H = 480;
const SC_OFFSET_X = 0;
const SC_OFFSET_Y = 0;
const SC_W_C = SC_W*0.5;   //CENTER
const SC_H_C = SC_H*0.5;

//レイヤー区分
const LAYER_SYSTEM = 12;          //システム表示
const LAYER_FOREGROUND = 11;      //フォアグラウンド
const LAYER_EFFECT_UPPER = 10;    //エフェクト上位
const LAYER_PLAYER = 9;           //プレイヤー
const LAYER_BULLET = 8;           //弾
const LAYER_SHOT = 7;             //ショット
const LAYER_OBJECT_UPPER = 6;     //オブジェクト上位
const LAYER_OBJECT_MIDDLE = 5;    //オブジェクト中間
const LAYER_EFFECT_MIDDLE = 4;    //エフェクト中間
const LAYER_OBJECT_LOWER = 3;     //オブジェクト下位
const LAYER_EFFECT_LOWER = 2;     //エフェクト下位
const LAYER_SHADOW = 1;           //影
const LAYER_BACKGROUND = 0;       //バックグラウンド

//敵タイプ定数
const ENEMY_SMALL = 0;
const ENEMY_MIDDLE = 1;
const ENEMY_LARGE = 2;
const ENEMY_MBOSS = 3;
const ENEMY_BOSS = 4;
const ENEMY_BOSS_EQUIP = 5; //ボス装備
const ENEMY_ITEM = 9;

//爆発タイプ定数
const EXPLODE_NOTHING = -1;
const EXPLODE_SMALL = 0;
const EXPLODE_MIDDLE = 1;
const EXPLODE_LARGE = 2;
const EXPLODE_GROUND = 3;
const EXPLODE_MBOSS = 4;
const EXPLODE_BOSS = 5;

//アイテム種類
const ITEM_POWER = 0;
const ITEM_BOMB = 1;
const ITEM_1UP = 0;

var KEYBOARD_MOVE = {
      0: { x:  1.0, y:  0.0 },
     45: { x:  0.7, y: -0.7 },
     90: { x:  0.0, y: -1.0 },
    135: { x: -0.7, y: -0.7 },
    180: { x: -1.0, y:  0.0 },
    225: { x: -0.7, y:  0.7 },
    270: { x:  0.0, y:  1.0 },
    315: { x:  0.7, y:  0.7 },
};

//インスタンス
var app;

window.onload = function() {
    app = Application();
    app.domElement.addEventListener('click', function dummy() {
        var context = phina.asset.Sound.getAudioContext();
        context.resume();
    });
    app.run();
    app.enableStats();
};

/*
 *  danmaku.utility.js
 *  2015/12/01
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {
    var action = bulletml.dsl.action;
    var actionRef = bulletml.dsl.actionRef;
    var bullet = bulletml.dsl.bullet;
    var bulletRef = bulletml.dsl.bulletRef;
    var fire = bulletml.dsl.fire;
    var fireRef = bulletml.dsl.fireRef;
    var changeDirection = bulletml.dsl.changeDirection;
    var changeSpeed = bulletml.dsl.changeSpeed;
    var accel = bulletml.dsl.accel;
    var wait = bulletml.dsl.wait;
    var vanish = bulletml.dsl.vanish;
    var repeat = bulletml.dsl.repeat;
    var bindVar = bulletml.dsl.bindVar;
    var notify = bulletml.dsl.notify;
    var direction = bulletml.dsl.direction;
    var speed = bulletml.dsl.speed;
    var horizontal = bulletml.dsl.horizontal;
    var vertical = bulletml.dsl.vertical;
    var fireOption = bulletml.dsl.fireOption;
    var offsetX = bulletml.dsl.offsetX;
    var offsetY = bulletml.dsl.offsetY;
    var autonomy = bulletml.dsl.autonomy;

    //弾種
    var RS  = bullet({type: "normal", color: "red", size: 0.6});
    var RM  = bullet({type: "normal", color: "red", size: 0.8});
    var RL  = bullet({type: "normal", color: "red", size: 1.0});
    var RES = bullet({type: "roll", color: "red", size: 0.6});
    var REM = bullet({type: "roll", color: "red", size: 1.0});

    var BS  = bullet({type: "normal", color: "blue", size: 0.6});
    var BM  = bullet({type: "normal", color: "blue", size: 0.8});
    var BL  = bullet({type: "normal", color: "blue", size: 1.0});
    var BES = bullet({type: "roll", color: "blue", size: 0.6});
    var BEM = bullet({type: "roll", color: "blue", size: 1.0});

    var THIN = bullet({ type: "THIN" });

    var DM  = bullet({ dummy: true });

    var wait = bulletml.dsl.wait;
    var speed = bulletml.dsl.speed;

    bulletml.dsl.interval = function(v) {
        return wait("{0} * (0.3 + (1.0 - $densityRank) * 0.7)".format(v));
    };
    bulletml.dsl.spd = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v));
    };
    bulletml.dsl.spdSeq = function(v) {
        return speed("{0} * (1.0 + $speedRank * 2.0) * $speedBase".format(v), "sequence");
    };

    bulletml.dsl.rank = function() {
        return "$difficulty + ($rank*0.01)-1";
    };

    /*自機弾
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.bullet} bullet 弾種
     */
    bulletml.dsl.fireAim0 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(0)) };
    bulletml.dsl.fireAim1 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-2, 2))) };
    bulletml.dsl.fireAim2 = function(bullet, speed) { return fire(bullet || RS, speed || spd(0.8), direction(Math.randf(-4, 4))) };
    //ウィップ用
    bulletml.dsl.fireAim0Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim0(bullet, speed);
        };
    };
    bulletml.dsl.fireAim1Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim1(bullet, speed);
        };
    };
    bulletml.dsl.fireAim2Vs = function(bullet) {
        return function(speed) {
            return bulletml.dsl.fireAim2(bullet, speed);
        };
    };

    /*自機狙いNway弾
     * @param {number} way 一度に射出する弾数
     * @param {number} rangeFrom 自機を０とした開始角度
     * @param {number} rangeTo 自機を０とした終了角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.nway = function(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(rangeFrom), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("((" + rangeTo + ")-(" + rangeFrom + "))/($way-1)", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.nwayVs = function(way, rangeFrom, rangeTo, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.nway(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY, autonomy);
        };
    };

    /**
     * 絶対Nway弾
     * @param {number} way 一度に射出する弾数
     * @param {number} rangeFrom 真上を０とした開始角度
     * @param {number} rangeTo 真上を０とした終了角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.absoluteNway = function(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY) {
        return action([
            fire(bullet || RS, speed, $direction(rangeFrom, "absolute"), offsetX, offsetY),
            bindVar("way", "Math.max(2, " + way + ")"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("((" + rangeTo + ")-(" + rangeFrom + "))/($way-1)", "sequence"), offsetX, offsetY),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.absoluteNwayVs = function(way, rangeFrom, rangeTo, bullet, offsetX, offsetY) {
        return function(speed) {
            return bulletml.dsl.nway(way, rangeFrom, rangeTo, bullet, speed, offsetX, offsetY);
        };
    };

    /**
     * 自機狙いサークル弾
     * @param {number} way 一度に射出する弾数
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.circle = function(way, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(0), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            bindVar("dir", "Math.floor(360/$way)"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("$dir", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.circleVs = function(way, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.circle(way, bullet, speed, offsetX, offsetY, autonomy);
        }
    };

    /**
     * 絶対サークル弾
     * @param {number} way 一度に射出する弾数
     * @param {number} dir 真上を０とした基準角度
     * @param {bulletml.bullet} bullet 弾種
     * @param {bulletml.Speed} speed 弾速
     * @param {bulletml.offsetX} offsetX 射出X座標
     * @param {bulletml.offsetY} offsetY 射出Y座標
     */
    bulletml.dsl.absoluteCircle = function(way, dir, bullet, speed, offsetX, offsetY, autonomy) {
        return action([
            fire(bullet || RS, speed, direction(dir, "absolute"), offsetX, offsetY, autonomy),
            bindVar("way", "Math.max(2, " + way + ")"),
            bindVar("dir", "Math.floor(360/$way)"),
            repeat("$way-1", [
                fire(bullet || RS, speed, direction("$dir", "sequence"), offsetX, offsetY, autonomy),
            ]),
        ]);
    };
    //ウィップ用
    bulletml.dsl.absoluteCircleVs = function(way, bullet, offsetX, offsetY, autonomy) {
        return function(speed) {
            return bulletml.dsl.circle(way, bullet, speed, offsetX, offsetY, autonomy);
        }
    };

    /**
     * ウィップ
     * @param {bulletml.Speed} baseSpeed 初回のスピード
     * @param {number} delta 2回目以降のスピード増分
     * @param {number} count 回数
     * @param {function(bulletml.Speed):bulletml.Action} スピードを受け取りActionを返す関数
     */
    bulletml.dsl.whip = function(baseSpeed, delta, count, actionFunc) {
        return action([
            actionFunc(baseSpeed),
            repeat(count + "-1", [
                actionFunc(bulletml.dsl.spdSeq(delta)),
            ]),
        ]);
    };
});


/*
 *  dialog.js
 *  2015/10/19
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("ConfirmDialog", {
    superClass: phina.app.DisplayScene,

    answer: null,

    //ラベル用フォントパラメータ
    labelParam: {fontFamily:"Yasashisa", align: "center", baseline:"middle", outlineWidth:3 },

    init: function(caption, button, fontSize) {
        this.superInit();
        
        button = button || ["OK", "CANCEL"];
        fontSize = fontSize || 50;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        var that = this;
        var width = SC_W-28, height = 90;
        var param = {fillStyle:'rgba(0,80,0,1)', lineWidth:4};

        //キャプション
        if (caption instanceof Array) {
            phina.display.Label(caption[0], fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.39);
            phina.display.Label(caption[1], fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.43);
        } else {
            phina.display.Label(caption, fontSize)
                .addChildTo(this)
                .setParam(this.labelParam)
                .setPosition(SC_W*0.5, SC_H*0.42);
        }

        //ＹＥＳ
        phina.extension.Button(width, height, button[0], {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .addEventListener("pushed", function() {
                that.answer = true;
                appMain.popScene();
            });

        //ＮＯ
        phina.extension.Button(width, height, button[1], {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.58)
            .addEventListener("pushed", function() {
                that.answer = false;
                appMain.popScene();
            });
    },
});

var DEFALT_ALERTPARAM = {
    height: SC_H*0.35,
    text1: "text",
    text2: null,
    text3: null,
    fontSize: 32,
    button: "OK",
}

phina.define("shotgun.AlertDialog", {
    superClass: phina.app.DisplayScene,

    //ラベル用フォントパラメータ
    labelParam: {fontFamily:"Yasashisa", align: "center", baseline:"middle", outlineWidth:2 },

    init: function(param) {
        this.superInit();
        param = {}.$extend(DEFALT_ALERTPARAM, param);

        //バックグラウンド
        phina.display.RoundRectangleShape({width: SC_W-20, height: param.height, fillStyle: appMain.bgColor, lineWidth: 4})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        var that = this;
        var width = SC_W-28, height = 90;

        //キャプション
        var pos = SC_H*0.47;
        if (param.text2) pos -= SC_H*0.05;
        if (param.text3) pos -= SC_H*0.05;

        var lb = phina.display.Label(param.text1, param.fontSize).addChildTo(this);
        lb.setParam(this.labelParam);
        lb.setPosition(SC_W*0.5, pos);

        if (param.text2) {
            pos += SC_H*0.05;
            var lb = phina.display.Label(param.text2, param.fontSize).addChildTo(this);
            lb.setParam(this.labelParam);
            lb.setPosition(SC_W*0.5, pos);
        }
        if (param.text3) {
            pos += SC_H*0.05;
            var lb = phina.display.Label(param.text3, param.fontSize).addChildTo(this);
            lb.setParam(this.labelParam);
            lb.setPosition(SC_W*0.5, pos);
        }

        //ボタン
        phina.extension.Button(width, height, param.button, {flat: appMain.buttonFlat})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.55)
            .addEventListener("pushed", function() {
                that.answer = false;
                appMain.popScene();
            });
    },
});

/*
 *  Bullet.js
 *  2014/07/16
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Bullet", {
    superClass: "phina.display.DisplayElement",
    layer: LAYER_BULLET,

    //射出した敵のID
    id: -1,

    //BulletML Runnner
    runner: null,

    //移動係数
    vx: 0,
    vy: 1,

    //加速度
    accel: 1.0,

    //回転
    rollAngle: 5,
    rolling: true,

    //経過時間
    time: 0,

    DEFAULT_PARAM: {
        id: -1,
        type: "RS",
        x: SC_W*0.5,
        y: SC_H*0.5,
        vx: 0,
        vy: 1,
    },

    _static: {
        globalSpeedRate: 1.0,
    },

    init: function() {
        this.superInit();

        this.boundingType = "circle";
        this.radius = 2;

        //TweenerをFPSベースにする
        this.tweener.setUpdateType('fps');

        //弾画像
        this.sprite = phina.display.Sprite("bullet", 24, 24).addChildTo(this);

        this.on("enterframe", function(app){
            if (this.rolling) this.rotation += this.rollAngle;
            var runner = this.runner;
            if (runner) {
                var bx = this.x;
                var by = this.y;
                runner.x = bx;
                runner.y = by;
                runner.update();
                var acc = Bullet.globalSpeedRate * this.wait;
                this.vx = (runner.x - bx);
                this.vy = (runner.y - by);
                this.x += this.vx * acc;
                this.y += this.vy * acc;

                //画面範囲外
                if (this.x < -16 || this.x > SC_W+16 || this.y < -16 || this.y > SC_H+16) {
                    this.remove();
                    return;
                }

                //自機との当り判定チェック
                if (!this.dummy && this.time % 2) {
                    var player = this.bulletLayer.parentScene.player;
                    if (player.isCollision) {
                        if (this.isHitElement(player) ) {
                            if (player.damage()) this.remove();
                            return;
                        }
                    }
                }
                this.time++;
            }
        }.bind(this));

        //リムーブ時
        this.on("removed", function(){
            this.bulletLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(runner, spec) {
        this.id = 0;
        this.x = runner.x;
        this.y = runner.y;
        this.runner = runner;

        this.sprite.setOrigin(0.5, 0.5);

        if (spec.dummy) {
            this.dummy = true;
            this.sprite.visible = false;
        } else {
            //弾種別グラフィック
            var size = spec.size || 1.0, index = 0;
            switch (spec.type) {
                case "normal":
                    this.rolling = true;
                    index = 0;
                    if (spec.color == "blue") index = 1;
                    break;
                case "roll":
                    this.rolling = true;
                    index = 8;
                    if (spec.color == "blue") index = 24;
                    break;
                case "THIN":
                    this.rolling = false;
                    index = 3;
                    this.rotation = this.runner.direction*toDeg-90;
                    this.sprite.setOrigin(0.5, 0.0);
                    break;
            }
            this.sprite.setFrameIndex(index).setScale(size);
            this.dummy = false;
            this.sprite.visible = true;

            //弾に発射時ウェイトが掛るフレーム数
            var pauseFrame = 45;
            this.wait = 0.3;
            this.setScale(0.1);
            this.tweener.clear().to({scaleX: 1.0, scaleY:1.0, wait: 1.0}, pauseFrame, "easeInOutSine");

            this.time = 0;
        }
        return this;
    },

    erase: function() {
        if (!this.dummy) {
            var layer = this.bulletLayer.parentScene.effectLayerUpper;
            layer.enterBulletVanish({
                position: {x: this.x, y: this.y},
                velocity: {x: this.vx, y: this.vy, decay: 0.99},
            });
        }
    },
});


/*
 *  bulletconfig.js
 *  2015/11/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

    phina.define("BulletConfig", {
        init: function() {},
        _static: {
            speedRate: 3,
            target: null,
            bulletLayer: null,

            setup: function(target, bulletLayer) {
                this.target = target;
                this.bulletLayer = bulletLayer;

                //難易度(int)(0:easy 1:normal 2:hard 3:death)
                this.put("difficulty", 1);

                //ゲーム難易度ランク(int)
                this.put("rank", 1);

                //弾速(float)
                this.put("speedBase", 1.00);
                this.put("speedRank", 0.00);

                //弾密度(float 0.00-1.00)
                this.put("densityRank", 0.00);

                //弾数増加数(int)
                this.put("burst", 0);
            },

            createNewBullet: function(runner, spec) {
                if (spec.option) {
                    this.bulletLayer.enterBullet(runner, spec.option);
                } else {
                    this.bulletLayer.enterBullet(runner, spec);
                }
            },

            put: function(name, value) {
                bulletml.Walker.globalScope["$" + name] = value;
            },
        }
    });

});

/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("BulletLayer", {
    superClass: "phina.display.DisplayElement",

    _member: {
        max: 256,
        pool : null,
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var b = Bullet();
            b.bulletLayer = self;
            b.parentScene = app.currentScene;
            return b;
        });
    },

    //弾投入
    enterBullet: function(runner, spec) {
        //ボス以外の地上物の場合、プレイヤーに近接してたら弾を撃たない
        var host = runner.host;
        if (!host) return;
        if (host.isGround && !host.isBoss) {
            var dis = distanceSq(runner, this.parentScene.player);
            if (dis < 4096) return;
        }
        var b = this.pool.shift();
        if (!b) {
            console.warn("Bullet empty!!");
            return null;
        }
        b.setup(runner, spec).addChildTo(this);
        return b;
    },

    //射出IDに合致する弾を消去（未指定時全消去）
    erase: function(id) {
        var all = (id === undefined? true: false);
        var list = this.children.slice();
        var len = list.length;
        var b;
        if (all) {
            for (var i = 0; i < len; i++) {
                b = list[i];
                if (b instanceof Bullet) {
                    b.erase();
                    b.remove();
                }
            }
        } else {
            for (var i = 0; i < len; i++) {
                b = list[i];
                if (b instanceof Bullet && id == b.id) {
                    b.erase();
                    b.remove();
                }
            }
        }
    },
});

/*
 *  danmaku.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

const danmaku = {};

phina.namespace(function() {

var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;

//弾種
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN = bullet({ type: "THIN" });

var DM  = bullet({ dummy: true });

//攻撃ヘリ「ホーネット」
danmaku.Hornet1 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

//攻撃ヘリ「ホーネット」
danmaku.Hornet2 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

//攻撃ヘリ「ホーネット」
danmaku.Hornet3 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            notify('missile'),
            interval(240),
        ]),
    ]),
});

//中型攻撃ヘリ MudDauber
danmaku.MudDauber = new bulletml.Root({
    top0: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.6), direction(0), offsetY(30)),
            repeat("$burst + 3", [
                fire(THIN, spdSeq(0), direction(0, "sequence"), offsetY(30)),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
    top1: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.5), direction(180, "absolute"), offsetX(-32)),
            repeat("$burst + 3", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(-32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(-32)),
                fire(DM, spdSeq(0), direction(-40, "sequence")),
                interval(15),
            ]),
            interval(160),
        ]),
    ]),
    top2: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(0.5), direction(140, "absolute"), offsetX(32)),
            repeat("$burst + 3", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(32)),
                fire(RS, spdSeq(0), direction(20, "sequence"), offsetX(32)),
                fire(DM, spdSeq(0), direction(-40, "sequence")),
                interval(15),
            ]),
            interval(160),
        ]),
    ]),
});

//中型爆撃機「ビッグウィング」
danmaku.BigWing = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            repeat(4, [
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(200, "absolute")),
                    fire(RS, spdSeq(0), direction(  0, "sequence"), offsetX(-32), offsetY(16)),
                    fire(RS, spdSeq(0), direction( 20, "sequence"), offsetX(-32), offsetY(16)),
                    fire(RS, spdSeq(0), direction( 20, "sequence"), offsetX(-32), offsetY(16)),
                ]),
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(160, "absolute")),
                    fire(RS, spdSeq(0), direction(  0, "sequence"), offsetX(32), offsetY(16)),
                    fire(RS, spdSeq(0), direction(-20, "sequence"), offsetX(32), offsetY(16)),
                    fire(RS, spdSeq(0), direction(-20, "sequence"), offsetX(32), offsetY(16)),
                ]),
                interval(10),
            ]),
            repeat(3, [
                repeat("$burst + 1", [
                    fire(DM, spd(0.5),  direction(200, "absolute")),
                    fire(BS, spdSeq(0), direction(180, "absolute"), offsetX( 16), offsetY(16)),
                    fire(BS, spdSeq(0), direction(180, "absolute"), offsetX(-16), offsetY(16)),
                ]),
                interval(20),
            ]),
            interval(60),
        ]),
    ]),
});

//飛空艇「スカイブレード」
danmaku.SkyBlade = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.7), direction(0), offsetY(-32)),
            repeat("$burst + 1", [
                fire(RS, spdSeq(0), direction( 0, "sequence"), offsetY(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetY(-32)),
                fire(RS, spdSeq(0), direction(10, "sequence"), offsetY(-32)),
                fire(DM, spdSeq(0.05), direction(-20, "sequence")),
            ]),
            interval(90),
        ]),
    ]),
});


//中型戦車「フラガラッハ」
danmaku.Fragarach = new bulletml.Root({
    top: action([
        interval(60),
        repeat(Infinity, [
            fire(RS, spd(0.5), direction(0)),
            repeat("$burst", [
                fire(RS, spdSeq(0.15), direction(-5, "sequence")),
                fire(RS, spdSeq(0.15), direction(10, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置１）
danmaku.Brionac1_1 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(2), direction(0, "absolute")),
            repeat("$burst + 2", [
                fire(RM, spdSeq(0.15), direction( 0, "sequence")),
                fire(RM, spdSeq(0), direction( 1, "sequence")),
                fire(RM, spdSeq(0), direction(-2, "sequence")),
                interval(2),
                fire(RM, spdSeq(0.15), direction( 3, "sequence")),
                fire(RM, spdSeq(0), direction( 5, "sequence")),
                fire(RM, spdSeq(0), direction(-7, "sequence")),
                interval(2),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置２）
danmaku.Brionac1_2 = new bulletml.Root({
    top0: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(1), direction(0)),
            repeat("$burst + 2", [
                fire(RM, spdSeq(0), direction(0, "sequence")),
                fire(RM, spdSeq(0), direction(5, "sequence")),
                fire(RM, spdSeq(0), direction(5, "sequence")),
                fire(DM, spdSeq(0.05), direction(-10, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//浮遊砲台「ブリュナーク」（設置３）
danmaku.Brionac1_3 = new bulletml.Root({
    top1: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(0, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top2: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(90, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top3: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(180, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
    top3: action([
        interval(60),
        repeat(Infinity, [
            fire(DM, spd(0.8), direction(270, "absolute")),
            repeat("$burst + 1", [
                fire(BM, spdSeq(0), direction(0, "sequence")),
                repeat(30, [
                    fire(BM, spdSeq(0), direction(12, "sequence")),
                    interval(1),
                ]),
                fire(DM, spdSeq(0), direction(0, "sequence")),
            ]),
            interval(120),
        ]),
    ]),
});

//中型輸送機「トイボックス」
danmaku.ToyBox = new bulletml.Root({
    top: action([
        interval(120),
        repeat(Infinity, [
            fire(DM, spd(1), direction(0)),
            repeat("$burst + 1", [
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
                fire(THIN, spd(1), direction(0, "sequence")),
                interval(10),
            ]),
            interval(120),
        ]),
    ]),
});

});


/*
 *  danmakuBasic.js
 *  2016/04/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;

//�e��
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN = bullet({ type: "THIN" });

var DM  = bullet({ dummy: true });

//���@�_���e
var basic = function(s, dir) {
  return new bulletml.Root({
    top: action([
      interval(60),
      repeat(Infinity, [
        fire(DM, spd(s), direction(dir)),
        repeat("$burst + 1", [
          fire(RS, spdSeq(0.15), direction(0, "sequence")),
        ]),
        interval(60),
      ]),
    ]),
  });
};
danmaku.basic = basic(1, 0);
danmaku.basicR1 = basic(1, -5);
danmaku.basicL1 = basic(1, +5);
danmaku.basicR2 = basic(1, -15);
danmaku.basicL2 = basic(1, +15);
danmaku.basicF = basic(1.2, 0);
danmaku.basicFR1 = basic(1.2, -5);
danmaku.basicFL1 = basic(1.2, +5);
danmaku.basicFR2 = basic(1.2, -15);
danmaku.basicFL2 = basic(1.2, +15);

//N-Way(���@�_��)
var basicNway = function(n, dir, s) {
    var rn = (n-1)/2;
    return new bulletml.Root({
        top: action([
            interval(60),
            repeat(Infinity, [
                fire(DM, spd(s), direction(-dir*rn)),
                repeat("$burst + 1", [
                    fire(RS, spdSeq(0), direction(0, "sequence")),
                    repeat(n-1, [
                        fire(RS, spdSeq(0), direction(dir, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(-dir*n, "sequence")),
                ]),
                interval(60),
            ]),
        ]),
    });
};
danmaku.basic3way = basicNway(3, 10, 0.7);
danmaku.basic4way = basicNway(4, 10, 0.7);
danmaku.basic5way = basicNway(5, 10, 0.7);
danmaku.basic6way = basicNway(6, 10, 0.7);
danmaku.basic7way = basicNway(7, 10, 0.7);

//��e
var basicNwayCircle = function(n, s) {
    var dir = ~~(360/n);
    var rn = (n-1)/2;
    return new bulletml.Root({
        top: action([
            interval(60),
            repeat(Infinity, [
                fire(DM, spd(s), direction(0, "absolute")),
                repeat("$burst + 1", [
                    fire(RS, spdSeq(0), direction(0, "sequence")),
                    repeat(n-1, [
                        fire(RS, spdSeq(0), direction(dir, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(-dir*n, "sequence")),
                ]),
                interval(60),
            ]),
        ]),
    });
};
danmaku.basic8wayCircle = basicNwayCircle(8, 0.7);
danmaku.basic16wayCircle = basicNwayCircle(16, 0.7);

});


/*
 *  danmakuBoss_1.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

//ショートハンド
var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

//マクロ
var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;
var fireAim0 = bulletml.dsl.fireAim0;
var fireAim1 = bulletml.dsl.fireAim1;
var fireAim2 = bulletml.dsl.fireAim2;
var nway = bulletml.dsl.nway;
var nwayVs = bulletml.dsl.nwayVs;
var absoluteNway = bulletml.dsl.absoluteNway;
var absoluteNwayVs = bulletml.dsl.absoluteNwayVs;
var circle = bulletml.dsl.circle;
var absoluteCircle = bulletml.dsl.absoluteCircle;
var whip = bulletml.dsl.whip;

//弾種
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN = bullet({ type: "THIN" });

var DM = bullet({ dummy: true });

//１面中ボス
danmaku.ThorHammer = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(20, "absolute"), offsetX(-32), offsetY(16)),
                repeat(5, [
                    fire(RM, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(340, "absolute"), offsetX(32), offsetY(16)),
                repeat(5, [
                    fire(RM, spdSeq(0), direction(30, "sequence"), offsetX(32), offsetY(16)),
                ]),
            ]),
            interval(20),

            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(40, "absolute"), offsetX(-32), offsetY(16)),
                repeat(6, [
                    fire(RM, spdSeq(0), direction(-30, "sequence"), offsetX(-32), offsetY(16)),
                ]),
            ]),
            repeat("$burst + 1", [
                fire(RM, spd(0.5), direction(320, "absolute"), offsetX(32), offsetY(16)),
                repeat(6, [
                    fire(RM, spdSeq(0), direction(30, "sequence"), offsetX(32), offsetY(16)),
                ]),
            ]),
            interval(30),
        ]),
    ]),
});

//１面中ボス（砲台）
danmaku.ThorHammerTurret = new bulletml.Root({
    top0: action([
        interval(30),
        repeat(Infinity, [
            fire(DM, spd(1), direction(-15)),
            repeat("$burst + 2", [
                fire(BEM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(0)),
                fire(BEM, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(BEM, spdSeq(0), direction(15, "sequence"), offsetX(0), offsetY(0)),
                fire(DM, spdSeq(0.05), direction(-30, "sequence")),
                interval(10),
            ]),
            interval(30),
        ]),
    ]),
});

//１面ボス（パターン１）
danmaku.Golyat1_1 = new bulletml.Root({
    top0: action([
        wait(30),
        repeat(5, [
            notify("start"),
            interval(30),
            fire(DM, spd(0.5), direction(0, "absolute"), offsetY(-8)),
            repeat("$burst + 1", [
                fire(BEM, spdSeq(0), direction(0, "sequence"), offsetY(-8)),
                repeat(30, [
                    fire(BEM, spdSeq(0.01), direction(12, "sequence"), offsetY(-8)),
                    interval(1),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "sequence"), offsetY(-8)),
                interval(10),
            ]),
            interval(30),
            notify("end"),
            interval(120),
        ]),
        notify("finish"),
    ]),
});

//１面ボス（パターン２）
danmaku.Golyat1_2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(30),
        repeat(5, [
            fire(DM, spd(0.4), direction(0, "absolute")),
            repeat("$burst + 5", [
                repeat(10, [
                    fire(BEM, spdSeq(0), direction(38, "sequence")),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "absolute")),
            ]),
            interval(150),
        ]),
        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（パターン３）
danmaku.Golyat1_3 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(30),

        interval(30),
        notify("end"),
        interval(60),
        notify("finish"),
    ]),
});

//１面ボス（発狂パターン）
danmaku.Golyat2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(60),
        repeat(Infinity, [
            repeat(3, [
                fire(THIN, spd(0.6), direction(0)),
                repeat(3, [
                    fire(THIN, spdSeq(0.1), direction(0, "sequence")),
                ]),
                fire(THIN, spdSeq(0.1), direction(-20, "sequence")),
                repeat(4, [
                    fire(THIN, spdSeq(0), direction(10, "sequence")),
                ]),
                interval(60),
            ]),
            interval(120),
        ]),
    ]),

    top1: action([
        wait(60),
        repeat(Infinity, [
            interval(30),
            repeat(5, [
                fire(DM, spd(0.5), direction(0, "absolute")),
                repeat("$burst + 5", [
                    repeat(10, [
                        fire(REM, spdSeq(0), direction(36, "sequence")),
                    ]),
                    fire(DM, spdSeq(0.05), direction(0, "absolute")),
                ]),
                interval(120),
            ]),
            interval(30),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン１）
danmaku.GolyatArm1 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            wait(30),
            fire(DM, spd(1.0), direction(-10), offsetX(0), offsetY(-40)),
            repeat("$burst + 3", [
                fire(RM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(RM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(-40)),
                fire(DM, spdSeq(0.1), direction(-20, "sequence")),
                interval(10),
            ]),
            notify("end1"),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            fire(DM, spd(0.8), direction(-5), offsetX(0), offsetY(20)),
            repeat("$burst + 3", [
                fire(BM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                fire(BM, spdSeq(0), direction(10, "sequence"), offsetX(0), offsetY(20)),
                fire(DM, spdSeq(0.1), direction(-10, "sequence")),
                interval(10),
            ]),
            notify("end2"),
            interval(120),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン２）
danmaku.GolyatArm2 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            fire(DM, spd(1.0), direction(180, "absolute"), offsetX(0), offsetY(20)),
            repeat(10, [
                fire(RM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                interval(15),
            ]),
            interval(60),
            notify("end2"),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            fire(DM, spd(1.0), direction(180, "absolute"), offsetX(0), offsetY(20)),
            repeat(10, [
                fire(BM, spdSeq(0), direction( 0, "sequence"), offsetX(0), offsetY(20)),
                interval(15),
            ]),
            interval(60),
            notify("end2"),
            interval(120),
        ]),
    ]),
});

//１面ボス（アーム砲台パターン３）
danmaku.GolyatArm3 = new bulletml.Root({
    top1: action([
        repeat(Infinity, [
            notify("start1"),
            wait(30),
            notify("missile1"),
            interval(60),
            notify("missile1"),
            interval(60),
            notify("missile1"),
            interval(30),
            notify("end1"),
            interval(180),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            notify("start2"),
            wait(30),
            notify("missile2"),
            interval(60),
            notify("missile2"),
            interval(60),
            notify("missile2"),
            interval(30),
            notify("end2"),
            interval(180),
        ]),
    ]),
});

});


/*
 *  danmakuBoss_2.js
 *  2015/10/11
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

//ショートハンド
var action = bulletml.dsl.action;
var actionRef = bulletml.dsl.actionRef;
var bullet = bulletml.dsl.bullet;
var bulletRef = bulletml.dsl.bulletRef;
var fire = bulletml.dsl.fire;
var fireRef = bulletml.dsl.fireRef;
var changeDirection = bulletml.dsl.changeDirection;
var changeSpeed = bulletml.dsl.changeSpeed;
var accel = bulletml.dsl.accel;
var wait = bulletml.dsl.wait;
var vanish = bulletml.dsl.vanish;
var repeat = bulletml.dsl.repeat;
var bindVar = bulletml.dsl.bindVar;
var notify = bulletml.dsl.notify;
var direction = bulletml.dsl.direction;
var speed = bulletml.dsl.speed;
var horizontal = bulletml.dsl.horizontal;
var vertical = bulletml.dsl.vertical;
var fireOption = bulletml.dsl.fireOption;
var offsetX = bulletml.dsl.offsetX;
var offsetY = bulletml.dsl.offsetY;
var autonomy = bulletml.dsl.autonomy;

//マクロ
var interval = bulletml.dsl.interval;
var spd = bulletml.dsl.spd;
var spdSeq = bulletml.dsl.spdSeq;
var fireAim0 = bulletml.dsl.fireAim0;
var fireAim1 = bulletml.dsl.fireAim1;
var fireAim2 = bulletml.dsl.fireAim2;
var nway = bulletml.dsl.nway;
var nwayVs = bulletml.dsl.nwayVs;
var absoluteNway = bulletml.dsl.absoluteNway;
var absoluteNwayVs = bulletml.dsl.absoluteNwayVs;
var circle = bulletml.dsl.circle;
var absoluteCircle = bulletml.dsl.absoluteCircle;
var whip = bulletml.dsl.whip;

//弾種
var RS  = bullet({type: "normal", color: "red", size: 0.6});
var RM  = bullet({type: "normal", color: "red", size: 0.8});
var RL  = bullet({type: "normal", color: "red", size: 1.0});
var RES = bullet({type: "roll", color: "red", size: 0.6});
var REM = bullet({type: "roll", color: "red", size: 1.0});

var BS  = bullet({type: "normal", color: "blue", size: 0.6});
var BM  = bullet({type: "normal", color: "blue", size: 0.8});
var BL  = bullet({type: "normal", color: "blue", size: 1.0});
var BES = bullet({type: "roll", color: "blue", size: 0.6});
var BEM = bullet({type: "roll", color: "blue", size: 1.0});

var THIN   = bullet({type: "THIN", size: 1.0});
var THIN_L = bullet({type: "THIN", size: 1.5});

var DM = bullet({dummy: true});

//２面中ボス
danmaku.Raven = new bulletml.Root({
    top0: action([
        wait(120),
        repeat(Infinity, [
            fire(DM, spd(0.8)),
            repeat(3, [
                nway(3, -15, 15, THIN, spd(0.08)),
                interval(5),
            ]),
            interval(165),
        ]),
    ]),
    top1: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(DM, spd(0.5), direction(-20, "absolute")),
                repeat(6, [
                    fire(RM, spd(0.5), direction(-30, "sequence")),
                    repeat(5, [
                        fire(RM, spdSeq(0.08), direction(0, "sequence")),
                    ]),
                    interval(10),
                ]),
            ]),
            interval(120),
        ]),
    ]),
    top2: action([
        repeat(Infinity, [
            repeat("$burst + 1", [
                fire(DM, spd(0.5), direction(20, "absolute")),
                repeat(6, [
                    fire(RM, spd(0.5), direction(30, "sequence")),
                    repeat(5, [
                        fire(RM, spdSeq(0.08), direction(0, "sequence")),
                    ]),
                    interval(10),
                ]),
            ]),
            interval(120),
        ]),
    ]),
});


//２面ボス　パターン１
danmaku.Garuda_1 = new bulletml.Root({
    top0: action([
        interval(90),
        repeat(4, [
            repeat("$rank/10+3", [
                nway(5, -20, 20, RL, spd(0.8), offsetX(0), offsetY(0), autonomy(true)),
                interval(2),
            ]),
            interval(180),
        ]),
        notify("finish"),
    ]),
    top1: action([
        wait(120),
        repeat(4, [
            repeat("$rank/10", [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(-148), offsetY(0), autonomy(true)),
                interval(6),
            ]),
            interval(180),
        ]),
    ]),
    top2: action([
        wait(120),
        repeat(4, [
            repeat("$rank/10", [
                nway(5, -20, 20, BEM, spd(0.8), offsetX(148), offsetY(0), autonomy(true)),
                interval(6),
            ]),
            interval(180),
        ]),
    ]),
});

//２面ボス　パターン２
danmaku.Garuda_2 = new bulletml.Root({
    top0: action([
        wait(90),
        repeat(10, [
            notify('bomb'),
            interval(60),
        ]),
        notify("finish"),
    ]),
});

//２面ボス　パターン３
danmaku.Garuda_3 = new bulletml.Root({
    top0: action([
        interval(90),
        notify("finish"),
    ]),
});

//２面ボス　パターン４（発狂）
danmaku.Garuda_4 = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            fire(bullet(DM, actionRef("inv1")), spd(3), direction("$loop.index * 5", "absolute")),
            repeat(16, [
                fire(bullet(DM, actionRef("inv1")), spdSeq(0), direction(360 / 16, "sequence")),
                interval(1),
            ]),
            interval(10),
            fire(bullet(DM, actionRef("inv2")), spd(3), direction("$loop.index * -5", "absolute")),
            repeat(16, [
                fire(bullet(DM, actionRef("inv2")), spdSeq(0), direction(-360 / 16, "sequence")),
                interval(1),
            ]),
            interval(120),
        ]),
    ]),
    inv1: action([
        wait(1),
        fire(RL, spd(1.2), direction(90, "relative")),
        vanish(),
    ]),
    inv2: action([
        wait(1),
        fire(RL, spd(1.2), direction(-90, "relative")),
        vanish(),
    ]),
});

//２面ボス砲台
danmaku.Garuda_hatch_1 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        repeat(5, [
            fire(DM, spd(0.4), direction(0, "absolute")),
            repeat("$burst + 5", [
                repeat(10, [
                    fire(REM, spdSeq(0), direction(38, "sequence")),
                ]),
                fire(DM, spdSeq(0.05), direction(0, "absolute")),
            ]),
            interval(150),
        ]),
        notify("end"),
    ]),
});
danmaku.Garuda_hatch_2 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        notify("end"),
    ]),
});
danmaku.Garuda_hatch_3 = new bulletml.Root({
    top0: action([
        notify("start"),
        wait(120),
        notify("end"),
    ]),
});
danmaku.Garuda_hatch_4 = new bulletml.Root({
    top0: action([
        notify("start"),
        interval(120),
        repeat(Infinity, [
            interval(120),
        ]),
    ]),
});

//２面ボスオプション武器
danmaku.GarudaBomb = new bulletml.Root({
    top0: action([
        repeat(Infinity, [
            fire(THIN, spd(0.5), direction( 90, "absolute")),
            fire(THIN, spd(0.5), direction(270, "absolute")),
            interval(30),
        ]),
    ]),
});

});


/*
 *  Effect.js
 *  2014/07/10
 *  @auther minimo  
 *  This Program is MIT license.
 */
Effect = [];

//汎用エフェクト
phina.define("Effect.EffectBase", {
    superClass: "phina.display.Sprite",

    _member: {
        //インデックス更新間隔
        interval: 2,

        //開始インデックス
        startIndex: 0,

        //最大インデックス
        maxIndex: 8,

        //現在インデックス
        index: 0,

        //遅延表示フレーム数
        delay: 0,

        //ループフラグ
        loop: false,

        //シーンから削除フラグ
        isRemove: false,

        //加速度
        velocity: {},

        //地上エフェクトフラグ
        ifGround: false,

        time: 0,
    },

    defaultOption: {
        name: "noname",
        assetName: "effect",
        width: 64,
        height: 64,
        interval: 2,
        startIndex: 0,
        maxIndex: 17,
        sequence: null,
        delay: 0,
        loop: false,
        enterframe: null,
        isGround: false,
        trimming: null,
        position: {x: SC_W*0.5, y: SC_H*0.5},
        velocity: {x: 0, y: 0, decay: 0},
        rotation: 0,
        alpha: 1.0,
        scale: {x: 1.0, y: 1.0},
        blendMode: "source-over",
    },

    init: function() {
        this.superInit("effect");
        this.$extend(this._member);

        this.tweener.setUpdateType('fps');

        this.velocity = {
            x: 0,       //Ｘ座標方向
            y: 0,       //Ｙ座標方向
            decay: 1.0  //減衰率
        };

        this.on("enterframe", this.defaultEnterframe);

        //リムーブ時
        this.on("removed", function(){
            this.effectLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        if (this.assetName != option.assetName) {
            this.image = phina.asset.AssetManager.get('image', option.assetName);
            this.assetName = option.assetName;
        }
        this.width = option.width;
        this.height = option.height;

        //初期値セット
        this.name = option.name;
        this.interval = option.interval;
        this.startIndex = option.startIndex;
        this.maxIndex = option.maxIndex;
        this.sequence = option.sequence;
        this.seqIndex = 0;
        this.delay = option.delay;
        if (this.delay < 0) this.delay *= -1;
        this.loop = option.loop;
        this.time = -this.delay;

        //αブレンド設定
        this.alpha = option.alpha;
        this.blendMode = option.blendMode;

        //トリミング設定
        var tr = option.trimming || {x:0, y: 0, width: this.image.width, height: this.image.height};
        this.setFrameTrimming(tr.x, tr.y, tr.width, tr.height);

        this.index = this.startIndex;
        if (this.sequence) this.index = this.sequence[0];
        this.setFrameIndex(this.index);

        this.setPosition(option.position.x, option.position.y);
        this.setVelocity(option.velocity.x, option.velocity.y, option.velocity.decay);
        this.rotation = option.rotation;
        this.scaleX = option.scale.x;
        this.scaleY = option.scale.y;

        this.isRemove = false;
        this.visible = false;

        //Tweenerリセット
        this.tweener.clear();

        return this;
    },

    defaultEnterframe: function() {
        if (this.time < 0) {
            this.visible = false;
            this.time++;
            return;
        }
        if (this.time == 0) this.visible = true;

        //地上物現座標調整
        if (this.isGround) {
            var ground = this.parentScene.ground;
            this.x += ground.deltaX;
            this.y += ground.deltaY;
        }

        if (this.time % this.interval == 0) {
            this.setFrameIndex(this.index);
            if (this.sequence) {
                this.index = this.sequence[this.seqIndex];
                this.seqIndex++;
                if (this.seqIndex == this.sequence.length) {
                    if (this.loop) {
                        this.seqIndex = 0;
                    } else {
                        this.isRemove = true;
                    }
                }
            } else {
                this.index++;
                if (this.index > this.maxIndex) {
                    if (this.loop) {
                        this.index = this.startIndex;
                    } else {
                        this.isRemove = true;
                    }
                }
            }
        }
        //画面範囲外
        if (this.x < -32 || this.x > SC_W+32 || this.y < -32 || this.y > SC_H+32) {
            this.isRemove = true;
        }

        this.addVelocity();
        this.time++;
        if (this.isRemove) {
            this.removeChildren();
            this.remove();
        }
    },

    //現在の座標に加速度を加算
    addVelocity: function() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.x *= this.velocity.decay;
        this.velocity.y *= this.velocity.decay;
        return this;
    },

    //加速度の設定
    setVelocity: function(x, y, decay) {
        decay = decay || 1;
        this.velocity.x = x;
        this.velocity.y = y;
        this.velocity.decay = decay;
        return this;        
    },

    //ループ設定
    setLoop: function(b) {
        this.loop = b;
        return this;
    }
});

/*
 *  bulletlayer.js
 *  2015/11/12
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("EffectPool", {
    init: function(size, parentScene) {
        this.pool = null;
        this.max = size || 256;

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var e = Effect.EffectBase();
            e.effectLayer = self;
            e.parentScene = parentScene;
            return e;
        });
    },

    //取得
    shift: function() {
        var e = this.pool.shift();
        return e;
    },

    //戻し
    push: function(e) {
        this.pool.push(e);
        return this;
    },
});

phina.define("EffectLayer", {
    superClass: "phina.display.DisplayElement",

    //エフェクト投入時デフォルトオプション
    defaultOption: {
        position: {x: SC_W*0.5, y: SC_H*0.5},
        velocity: {x: 0, y: 0, decay: 0},
        delay: 0
    },

    init: function(pool) {
        this.superInit();
        this.pool = pool;
    },

    //エフェクト投入
    enter: function(option) {
        var e = this.pool.shift();
        if (!e) {
            console.warn("Effect empty!!");
            return null;
        }
        e.setup(option).addChildTo(this);
        return e;
    },

    //爆発（標準）
    enterExplode: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explode",
            assetName: "effect",
            width: 64,
            height: 64,
            interval: 2,
            startIndex: 0,
            maxIndex: 17,
            rotation: option.rotation
        }));
        return e;
    },

    //爆発（小）
    enterExplodeSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeSmall",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 8,
            maxIndex: 15,
            trimming: {x: 256, y: 256, width: 128, height: 32},
        }));
        return e;
    },

    //爆発（極小）
    enterExplodeSmall2: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeSmall2",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 256, width: 128, height: 32},
        }));
        return e;
    },

    //爆発（大）
    enterExplodeLarge: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeLarge",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 192, width: 192, height: 96},
        }));
        return e;
    },

    //爆発（地上）
    enterExplodeGround: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodeGround",
            assetName: "effect",
            width: 32,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 192, width: 256, height: 48},
        }));
        e.isGround = true;
        e.groundX = this.parentScene.ground.x;
        e.groundY = this.parentScene.ground.y;
        return e;
    },

    //破片
    enterDebri: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        size = option.size || 0;
        size = Math.clamp(size, 0, 3);
        if (size == 0) {
            var e = this.enter(option.$extend({
                name: "debri",
                assetName: "effect",
                width: 8,
                height: 8,
                interval: 2,
                startIndex: 0,
                maxIndex: 8,
                trimming: {x: 192, y: 128, width: 64, height: 48},
            }));
            return e;
        } else {
            size--;
            var e = this.enter(option.$extend({
                name: "debri",
                assetName: "effect",
                width: 16,
                height: 16,
                interval: 4,
                startIndex: size*8,
                maxIndex: (size+1)*8-1,
                trimming: {x: 384, y: 128, width: 128, height: 48},
            }));
            return e;
        }
    },

    //小破片
    enterDebriSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "debri",
            assetName: "effect",
            width: 8,
            height: 8,
            interval: 2,
            startIndex: 0,
            maxIndex: 8,
            trimming: {x: 192, y: 128, width: 64, height: 48},
        }));
        return e;
    },

    //ショット着弾
    enterShotImpact: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "shotImpact",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 256, y: 240, width: 128, height: 16},
        }));
        return e;
    },

    //敵弾消失
    enterBulletVanish: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "bulletVanish",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 336, width: 128, height: 48},
        }));
        return e;
    },

    //プレイヤー被弾
    enterExplodePlayer: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "explodePlayer",
            assetName: "effect",
            width: 48,
            height: 48,
            interval: 4,
            startIndex: 0,
            maxIndex: 7,
            trimming: {x: 0, y: 288, width: 384, height: 48},
        }));
        return e;
    },

    //アフターバーナー
    enterAfterburner: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "afterburner",
            assetName: "particle",
            width: 16,
            height: 16,
            interval: 2,
            sequence: [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 
        }));
        if (e) e.tweener.clear().to({alpha:0}, 60, "easeInOutSine");
        return e;
    },

    //スパーク
    enterSpark: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "spark",
            assetName: "effect",
            width: 32,
            height: 32,
            interval: 4,
            startIndex: 0,
            maxIndex: 2,
            trimming: {x: 0, y: 384, width: 64, height: 32},
        }));
        return e;
    },

    //ボム
    enterBomb: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "bomb",
            assetName: "bomb",
            width: 96,
            height: 96,
            interval: 3,
            startIndex: 0,
            maxIndex: 16,
        }));
        return e;
    },

    //スモーク(小）
    enterSmokeSmall: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 16,
            height: 16,
            interval: 5,
            startIndex: 0,
            maxIndex: 4,
            trimming: {x: 128, y: 128, width: 64, height: 16},
        }));
        return e;
    },

    //スモーク(中）
    enterSmoke: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 24,
            height: 24,
            interval: 5,
            startIndex: 0,
            maxIndex: 5,
            trimming: {x: 128, y: 160, width: 120, height: 24},
        }));
        return e;
    },

    //スモーク(大）
    enterSmokeLarge: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var e = this.enter(option.$extend({
            name: "smoke",
            assetName: "effect",
            width: 32,
            height: 32,
            interval: 5,
            startIndex: 0,
            maxIndex: 8,
            trimming: {x: 256, y: 128, width: 128, height: 64},
        }));
        return e;
    },

    //パーティクル
    enterParticle: function(option) {
        option = (option || {}).$safe(this.defaultOption);
        var trim = {x: 0, y: 0, width: 256, height: 16};
        switch (option.color) {
            case 'red':
                trim = {x: 0, y: 16, width: 256, height: 16};
                break;
            case 'green':
                trim = {x: 0, y: 32, width: 256, height: 16};
                break;
             default:
                trim = {x: 0, y: 0, width: 256, height: 16};
        }
        var e = this.enter(option.$extend({
            name: "particle",
            assetName: "particle",
            width: 16,
            height: 16,
            interval: 2,
            startIndex: 0,
            maxIndex: 16,
            trimming: trim,
        }));
        return e;
    },
});

/*
 *  EffectUtility.js
 *  2014/08/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

Effect.defaultOption = {
    position: {x: SC_W*0.5, y: SC_H*0.5},
    velocity: {x: 0, y: 0, decay: 0},
    rotation: 0,
    delay: 0
};

//爆発エフェクト投入（標準）
Effect.enterExplode = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
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
Effect.enterExplodeSmall = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
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
Effect.enterExplodeLarge = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
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
Effect.enterExplodeGround = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
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
Effect.enterDebris = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
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
Effect.enterDebrisSmall = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);
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
Effect.enterBomb = function(layer, option) {
    option = (option || {}).$safe(Effect.defaultOption);

    var x = option.position.x;
    var y = option.position.y;
    layer.enterBomb({
        position: {x: x, y: y},
        velocity: {x: 0, y: 0, decay: 1},
        scale: {x: 3.0, y: 3.0},
    });
    layer.enterBomb({
        position: {x: x, y: y},
        velocity: {x: 0, y: 0, decay: 1},
        scale: {x: 3.0, y: 3.0},
        delay: 40,
    });
	var rad = 0;
	for( var i = 0; i < 40; i++ ){
		var rad2 = rad;
		var r = 7;
		var bx = Math.sin(rad2)*i*r;
		var by = Math.cos(rad2)*i*r;
		var delay = 2*i;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad2+=1.57;
		bx = Math.sin(rad2)*i*r;
		by = Math.cos(rad2)*i*r;
        Effect.enterExplodeSmall(layer, {position: {x: x+bx, y: y+by}, delay: delay});
		rad+=0.3;
	}
}


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

phina.define("Effect.Particle", {
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

        var color = option.color || Effect.Particle.defaultColor;
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

/*
 *  Enemy.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Enemy", {
    superClass: "phina.display.DisplayElement",

    _member: {
        layer: LAYER_OBJECT_MIDDLE,    //所属レイヤー
        parentEnemy: null,      //親となる敵キャラ

        //各種フラグ
        isCollision: true,  //当り判定
        isDead: false,      //死亡
        isSelfCrash: false, //自爆
        isMuteki: false,    //無敵
        isBoss: false,      //ボス
        isOnScreen: false,  //画面内に入った
        isGround: false,    //地上フラグ
        isHover: false,     //マップスクロールの影響無視
        isEnemy: true,      //敵機判別
        isAttack: true,     //攻撃フラグ
        isCrashDown: false, //墜落フラグ

        //キャラクタ情報
        name: null,
        type: -1,
        def: 0,
        defMax: 0,
        danmakuName: null,
        id: -1,
        enterParam: null,
        altitude: 1,

        //機体用テクスチャ情報
        body: null,
        texName: null,
        texIndex: 0,
        texWidth: 32,
        texHeight: 32,
        texColor: "",

        //基本情報
        data: null,
        player: null,

        //前フレーム座標
        beforeX: 0,
        beforeY: 0,

        //実行タスクキュー
        task: null,
    },

    init: function(name, x, y, id, param) {
        this.superInit();
        this.$extend(this._member);

        //TweenerをFPSベースにする
        this.tweener.setUpdateType('fps');

        x = x || 0;
        y = y || 0;
        this.setPosition(x, y);
        this.id = id || -1;
        this.enterParam = param; //EnemyUnitからの投入時パラメータ

        this.name = name;
        var d = this.data = enemyData[name];
        if (!d) {
            console.warn("Enemy data not found.: '"+name+"'");
            return false;
        }

        //弾幕定義
        if (d.danmakuName) {
            this.danmakuName = d.danmakuName
            if (d.danmakuName instanceof Array) {
                this.startDanmaku(this.danmakuName[0]);
            } else {
                this.startDanmaku(this.danmakuName);
            }
        }

        //基本仕様コピー
        this.type = d.type || ENEMY_SMALL;
        this.def = this.defMax = d.def;
        this.width = d.width || 32;
        this.height = d.height || 32;
        this.layer = d.layer || LAYER_OBJECT_MIDDLE;
        this.point = d.point || 0;

        this.setup = d.setup || this.setup;
        this.equipment = d.epuipment || this.equipment;
        this.algorithm = d.algorithm || this.algorithm;
        this.deadChild = d.deadChild || this.deadChild;
        this.changeColor = d.changeColor || this.changeColor;

        //破壊パターン
        if (this.type == ENEMY_MBOSS || this.type == ENEMY_BOSS ){
            this.dead = d.dead || this.defaultDeadBoss;
        } else {
            this.dead = d.dead || this.defaultDead;
        }

        //機体用スプライト
        if (d.texName) {
            this.texName = d.texName;
            this.texIndex = d.texIndex || 0;
            this.texWidth = d.texWidth;
            this.texHeight = d.texHeight;
            this.body = phina.display.Sprite(d.texName, d.texWidth, d.texHeight).addChildTo(this);
            this.body.tweener.setUpdateType('fps');

            this.texTrimX = d.texTrimX || 0;
            this.texTrimY = d.texTrimY || 0;
            this.texTrimWidth = d.texTrimWidth || this.body.image.width;
            this.texTrimHeight = d.texTrimHeight || this.body.image.height;

            this.body.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
            this.body.setFrameIndex(this.texIndex);
        } else {
            //当り判定ダミー表示
            var that = this;
            this.texName = null;
            this.texWidth = this.width;
            this.texHeight = this.height;
            this.body = phina.display.Shape({width:this.width, height:this.height}).addChildTo(this);
            this.body.tweener.setUpdateType('fps');
            this.body.renderRectangle({fillStyle: "rgba(255,255,0,1.0)", strokeStyle: "rgba(255,255,0,1.0)"});
            this.body.update = function() {this.rotation = -that.rotation;};
        }
        this.body.alpha = 1.0;
        this.body.blendMode = "source-over";

        if (VIEW_COLLISION) {
            this.col = phina.display.Shape({width:this.width, height:this.height}).addChildTo(this);
            this.col.renderRectangle({fillStyle: "rgba(255,255,0,0.5)", strokeStyle: "rgba(255,255,0,0.5)"});
            this.col.update = function() {this.rotation = -that.rotation;};
        }

        if (DEBUG) {
            //耐久力表示
            var df = this.defDisp = phina.display.Label({text: "[0/0]"}).addChildTo(this);
            var that = this;
            df.update = function() {
                this.rotation = -that.rotation;
                this.text = "["+that.def+"/"+that.defMax+"]";
            }
        }

        //フラグセット
        this.isCollision = d.isCollision || this.isCollision;
        this.isDead      = d.isDead      || this.isDead;
        this.isSelfCrash = d.isSelfCrash || this.isSelfCrash;
        this.isMuteki    = d.isMuteki    || this.isMuteki
        this.isOnScreen  = d.isOnScreen  || this.isOnScreen;
        this.isGround    = d.isGround    || this.isGround;
        this.isHover     = d.isHover     || this.isHover;
        this.isEnemy     = d.isEnemy     || this.isEnemy;
        this.isAttack    = d.isAttack    || this.isAttack;
        this.isCrashDown = d.isCrashDown || this.isCrashDown;
        if (this.type == ENEMY_MBOSS
            || this.type == ENEMY_BOSS
            || this.type == ENEMY_BOSS_EQUIP) this.isBoss = true;

        //それ以外の固有変数をコピー
        this.$safe(d);

        //パラメータセットアップ
        this.parentScene = app.currentScene;
        this.player = this.parentScene.player;
        this.setup(param);

        //機影追加
        this.addShadow();

        //当り判定設定
        this.boundingType = "rect";

        //add時
        this.on('added', this.equipment);

        //remove時
        this.on('removed', this.release);

        this.time = 0;
    },

    setup: function(enterParam) {
    },

    equipment: function(enterParam) {
    },

    update: function(app) {
        //bulletML.runner更新処理
        if (!this.isDead && this.runner) {
            this.runner.x = this.position.x;
            this.runner.y = this.position.y;
            this.runner.update();
        }

        //地上物現座標調整
        if (this.isGround && !this.isHover) {
            var ground = this.parentScene.ground;
            this.x += ground.deltaX;
            this.y += ground.deltaY;
        }

        //ボス系破壊時弾消去
        if (this.isDead) {
            if (this.type == ENEMY_MBOSS || this.type == ENEMY_BOSS) this.parentScene.eraseBullet();
        }

        //タスク処理
        if (this.task) {
            this.execTask(this.time);
        }

        //行動アルゴリズム
        this.algorithm(app);

        //スクリーン内入った判定
        if (this.isOnScreen) {
            if (!this.isBoss) {
                var w = this.body.width/2;
                var h = this.body.height/2;
                if (this.x < -w || this.x > SC_W+w || this.y < -h || this.y > SC_H+h) {
                    this.remove();
                    this.isCollision = false;
                }
            }
        } else {
            //中心が画面内に入った時点を画面内と判定する
            if (0 < this.x && this.x < SC_W && 0 < this.y && this.y < SC_H) this.isOnScreen = true;
        }

        //自機との当り判定チェック
        var player = this.player;
        if (this.type == ENEMY_ITEM) {
            //アイテムの場合
            if (this.isHitElement(player)) {
                this.remove();
                player.getItem(this.kind);
            }
        } else {
            //アイテム以外の場合
            if (this.isCollision && !this.isGround && !this.isDead && player.isCollision && this.isHitElement(player)) {
                player.damage();
            }
        }

        //親機が破壊された場合、自分も破壊
        if (!this.isDead && this.parentEnemy && this.parentEnemy.isDead) {
            this.isSelfCrash = true;
            this.dead();
        }

        //瀕死
        if (this.def < this.defMax*0.2) this.nearDeath();

        //地上敵で自機に近い場合は弾を撃たない
        if (this.isGround && !this.isBoss) {
            if (distanceSq(this, this.parentScene.player) < 4096)
                this.isAttack = false;
            else
                this.isAttack = true;
        }

        this.body.frameIndex = this.texIndex;

        this.beforeX = this.x;
        this.beforeY = this.y;
        this.time++;
    },

    //アルゴリズム
    algorithm: function() {
    },

    damage: function(power, force) {
        if (this.isMuteki || this.isDead || !this.isCollision) return false;

        this.def -= power;
        if (force) this.def = -1;
        if (this.def < 1) {
            this.def = 0;

            //破壊パターン投入
            this.flare('dead');
            this.dead();

            //親機に破壊を通知
            if (this.parentEnemy) {
                this.parentEnemy.deadChild(this);
            }

            //スコア加算
            if (!this.isSelfCrash) app.score += this.point;

            //ボス撃破をシーンに通知
            if (this.data.type == ENEMY_BOSS || this.data.type == ENEMY_MBOSS) {
                this.parentScene.flare('end_boss');
            }

            this.parentScene.enemyKill++;
            return true;
        }

        //被ダメージ演出
        this.changeColor("White", true);
        this.body.tweener.clear().wait(1).call(function(){this.changeColor()}.bind(this));

        return false;
    },

    //瀕死状態
    nearDeath: function() {
        if (this.time % 30 == 0) {
            this.changeColor("Red");
        } else if (this.time % 30 == 5) {
            this.changeColor();
        }

        if (this.time % 35 == 0) {
            var ground = this.parentScene.ground;
            var w = this.width/2;
            var h = this.height/2;
            var num = this.type == ENEMY_BOSS || this.type == ENEMY_MBOSS? 3: 1;
            for (var i = 0; i < num; i++) {
                var x = this.x+rand(-w, w);
                var y = this.y+rand(-h, h);
                var layer = this.parentScene.effectLayerUpper;
                var delay = i == 0? 0: rand(0, 15);
                Effect.enterExplode(layer, {
                    position: {x: x, y: y},
                    velocity: {x: ground.deltaX, y: ground.deltaY, decay: 0.9},
                    delay: delay,
                });
            }
            app.playSE("explodeSmall");
        }
        return this;
    },

    //色を赤or白くする
    changeColor: function(color, reverse) {
        if (!this.texName) return;
 
        //指定色によって画像名が変わる
        if (reverse && this.texColor != "") {
            this.texColor = "";
        } else {
            if (color === undefined) {
                this.texColor = "";
            } else {
                if (color != "Red" && color != "White" && color != "Black") color = "Red";
                this.texColor = color;
            }
        }

        //画像の再設定
        this.body.setImage(this.texName+this.texColor, this.texWidth, this.texHeight);
        this.body.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
        this.body.setFrameIndex(this.texIndex);
    },

    //通常破壊パターン
    defaultDead: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode(width, height);        

        //弾消し
        if (this.data.type == ENEMY_MIDDLE) {
            this.parentScene.eraseBullet(this);
        } else if (this.data.type == ENEMY_LARGE) {
            this.parentScene.eraseBullet();
            this.parentScene.timeVanish = 60;
        }


        if (this.isCrashDown) {
            var grY = this.y + 80;
            this.tweener.clear()
                .to({y: grY, altitude: 0.1}, 120, "easeSineOut")
                .call(function(){
                    this.explode();
                    this.remove();
                }.bind(this));
        } else {
            //破壊時消去インターバル
            if (this.data.explodeType == EXPLODE_SMALL) {
                this.remove();
            } else {
                this.tweener.clear()
                    .to({alpha: 0}, 15)
                    .call(function(){
                        this.remove();
                    }.bind(this));
                if (this.shadow) {
                    this.shadow.tweener.clear()
                       .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }
        }

        return this;
    },

    defaultDeadBoss: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode(width, height);
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, 80, 300)
            .call(function() {
                this.explode(width, height);
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },

    explode: function(width, height) {
        width = width || this.width;
        height = height || this.height;

        //爆発無し
        if (this.data.explodeType == EXPLODE_NOTHING) return;

        var ground = this.parentScene.ground;
        var upper = this.parentScene.effectLayerUpper;
        var lower = this.parentScene.effectLayerLower;
        var vx = this.x-this.beforeX+ground.deltaX;
        var vy = this.y-this.beforeY+ground.deltaY;

        switch (this.data.explodeType) {
            case EXPLODE_SMALL:
                Effect.enterExplode(upper, {
                    position: {x: this.x, y: this.y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
                app.playSE("explodeSmall");
                break;
            case EXPLODE_MIDDLE:
            case EXPLODE_LARGE:
                var num = rand(20, 30)*this.data.explodeType;
                for (var i = 0; i < num; i++) {
                    var x = this.x+rand(-width, width);
                    var y = this.y+rand(-height, height);
                    var delay = rand(0, 30);
                    Effect.enterExplode(upper, {
                        position: {x: x, y: y},
                        velocity: {x: vx, y: vy, decay: 0.95},
                        delay: delay,
                    });
                }
                app.playSE("explodeLarge");
                break;
            case EXPLODE_GROUND:
                Effect.enterExplodeGround(lower, {
                    position: {x: this.x, y: this.y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
                app.playSE("explodeSmall");
                break;
            case EXPLODE_BOSS:
                var num = rand(100, 150);
                for (var i = 0; i < num; i++) {
                    var x = this.x+rand(-width*0.7, width*0.7);
                    var y = this.y+rand(-height*0.7, height*0.7);
                    var delay = rand(0, 15);
                    Effect.enterExplode(upper, {
                        position: {x: x, y: y},
                        velocity: {x: vx, y: vy, decay: 0.95},
                        delay: delay,
                    });
                }
                break;
        }
    },

    //BulletML起動
    startDanmaku: function(danmakuName) {
        if (this.runner) {
            this.runner.stop = true;
            this.runner = null;
        }
        this.runner = danmaku[danmakuName].createRunner(BulletConfig);
        this.runner.host = this;
        this.runner.onNotify = function(eventType, event) {
            this.flare("bullet" + eventType, event);
        }.bind(this);
        return this;
    },

    //BulletML停止
    stopDanmaku: function() {
        if (this.runner) {
            this.runner.stop = true;
        }
        return this;
    },

    //BulletML再開
    resumeDanmaku: function() {
        if (this.runner) {
            this.runner.stop = false;
        }
        return this;
    },

    //親機のセット
    setParentEnemy: function(parent) {
        this.parentEnemy = parent;
        return this;
    },

    //子機が破壊された場合に呼ばれるコールバック
    deadChild: function(child) {
    },

    //指定ターゲットの方向を向く
    lookAt: function(target) {
        target = target || this.player;

        //ターゲットの方向を向く
        var ax = this.x - target.x;
        var ay = this.y - target.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);
        this.rotation = deg + 90;
        return this;
    },

    //指定ターゲットの方向に進む
    moveTo: function(target, speed, look) {
        target = target || this.player;
        speed = speed || 5;

        //ターゲットの方向を計算
        var ax = this.x - target.x;
        var ay = this.y - target.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);

        if (look || look === undefined) this.rotation = deg + 90;

        this.vx = Math.cos(rad+Math.PI)*speed;
        this.vy = Math.sin(rad+Math.PI)*speed;
        this.x += this.vx;
        this.y += this.vy;
        return this;
    },

    release: function() {
        if (this.shadow) this.shadow.remove();
        this.removeChildren();
        return this;
    },

    //処理タスクの追加
    addTask: function(time, task) {
        if (!this.task) this.task = [];
        this.task[time] = task;
    },

    //処理タスクの実行
    execTask: function(time) {
        var t = this.task[time];
        if (t) {
            if (typeof(t) === 'function') {
                t.call(this, app);
            } else {
                this.fire(t);
            }
        }
    },

    //機影追加
    addShadow: function() {
        this.shadow = phina.display.Sprite(this.texName+"Black", this.texWidth, this.texHeight);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameTrimming(this.texTrimX, this.texTrimY, this.texTrimWidth, this.texTrimHeight);
        this.shadow.setFrameIndex(this.texIndex);

        var that = this;
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            this.visible = ground.isShadow;

            this.rotation = that.rotation;
            if (that.isGround) {
                this.x = that.x + 10;
                this.y = that.y + 10;
            } else {
                this.x = that.x + ground.shadowX * that.altitude;
                this.y = that.y + ground.shadowY * that.altitude;
                this.scaleX = ground.scaleX;
                this.scaleY = ground.scaleY;
            }
        }
    },

    //土煙追加
    addSmoke: function(volume, width, height) {
        if (this.isDead) return this;
        volume = volume || 5;
        if (width === undefined) width = this.width;
        if (height === undefined) height = this.width;

        var layer = this.parentScene.effectLayerLower;
        var ground = this.parentScene.ground;
        var vx = ground.deltaX;
        var vy = ground.deltaY;
        var w = width/2;
        var h = height/2;

        for (var i = 0; i < volume; i++) {
            var x = this.x+rand(-w, w);
            var y = this.y+rand(-h, h);
            layer.enterSmoke({
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 1},
            });
        }
    },
    //土煙追加（小）
    addSmokeSmall: function(volume, width, height) {
        if (this.isDead) return this;
        volume = volume || 5;
        if (width === undefined) width = this.width;
        if (height === undefined) height = this.width;

        var layer = this.parentScene.effectLayerLower;
        var ground = this.parentScene.ground;
        var vx = ground.deltaX;
        var vy = ground.deltaY;
        var w = width/2;
        var h = height/2;

        for (var i = 0; i < volume; i++) {
            var x = this.x+rand(-w, w);
            var y = this.y+rand(-h, h);
            layer.enterSmokeSmall({
                position: {x: x, y: y},
                velocity: {x: vx, y: vy, decay: 1},
            });
        }
    },
});

/*
 *  EnemyData.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

const enemyData = [];

/*
 *  攻撃ヘリ「ホーネット」
 */
enemyData['Hornet'] = {
    //使用弾幕名
    danmakuName: ["Hornet1", "Hornet2", "Hornet3"],

    //当り判定サイズ
    width:  16,
    height: 16,

    //耐久力
    def: 30,

    //得点
    point: 300,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 32,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.roter = phina.display.Sprite("tex1", 32, 32).addChildTo(this);
        this.roter.index = 32;
        this.roter.setFrameIndex(32);

        this.vx = 0;
        this.vy = 0;

        //行動パターン分岐
        this.pattern = enterParam.pattern;
        switch (this.pattern) {
            case 1:
                this.tweener.moveBy(0, 300, 120, "easeOutQuart")
                    .wait(60)
                    .moveBy(0, -300, 120)
                    .call(function(){this.remove();}.bind(this));
                break;
            case 2:
                this.moveTo(this.player, 5, true);
                break;
            case 3:
                this.tweener.moveBy(0, 200, 120, "easeOutQuart")
                    .wait(600)
                    .moveBy(0, -300, 120)
                    .call(function(){this.phase++;}.bind(this));
                this.startDanmaku(this.danmakuName[2]);
                break;
            case 4:
                this.tweener.clear().moveBy(0, SC_H*0.5, 300).wait(480).moveBy(0, -SC_H, 600);
                break;
            default:
                this.tweener.moveBy(0, 200, 120, "easeOutQuart")
                    .wait(60)
                    .moveBy(0, -250, 120)
                    .call(function(){this.remove();}.bind(this));
                break;
        }

        //ミサイル発射
        this.on('bulletmissile', function(e) {
            this.parentScene.enterEnemy("Medusa", this.x, this.y).setHoming(true).setVelocity(-0.5, -2.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y).setHoming(true).setVelocity( 0.5, -2.0);
        }.bind(this));
    },

    algorithm: function() {
        this.lookAt();
        if (this.time % 2 == 0) {
            this.roter.index = (this.roter.index+1)%4+32;
            this.roter.setFrameIndex(this.roter.index);
        }

        if (this.pattern == 2) {
            this.x += this.vx;
            this.y += this.vy;
        }

        if (this.pattern == 3) {
            if (this.phase == 1) {
                this.moveTo(this.parentScene.player, 5, true);
                this.phase++;
            }
            if (this.phase == 2) {
                this.x += this.vx;
                this.y += this.vy;
            }
        }

        //画面下部では弾を出さない
        if (this.y > SC_H*0.7) this.stopDanmaku();

    },
};

/*
 *  中型攻撃ヘリ「ジガバチ」
 */
enemyData['MudDauber'] = {
    //使用弾幕名
    danmakuName: "MudDauber",

    //当り判定サイズ
    width:  60,
    height: 26,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 128,
    texHeight: 64,
    texIndex: 6,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;

        this.roter = phina.display.Sprite("tex1", 114, 48).addChildTo(this);
        this.roter.setFrameTrimming(288, 128, 228, 96);
        this.roter.setFrameIndex(0);
        this.roter.index = 0;

        //行動設定
        this.vy = 5;
        this.tweener.to({vy: 0.5}, 120, "easeOutCubic").call(function(){this.phase++;}.bind(this));
    },

    algorithm: function() {
        if (this.time % 4 == 0) {
            this.roter.index = (this.roter.index+1)%4+32;
            this.roter.setFrameIndex(this.roter.index);
        }
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+6;
            this.body.setFrameIndex(this.index);
        }

        this.y+=this.vy;
        if (this.phase == 1) {
        }
    },
};

/*
 *  中型爆撃機「ビッグウィング」
 */
enemyData['BigWing'] = {
    //使用弾幕名
    danmakuName: "BigWing",

    //当り判定サイズ
    width:  80,
    height: 26,

    //耐久力
    def: 1000,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 128,
    texHeight: 48,
    texIndex: 2,

    setup: function() {
        this.index = this.texIndex;
        this.isCrashDown = true;
    },

    algorithm: function() {
        if (this.time % 2 == 0) this.y++;
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+2;
            this.body.setFrameIndex(this.index);
        }
    },
};

/*
 *  中型攻撃機「デルタ」
 */
enemyData['Delta'] = {
    //使用弾幕名
    danmakuName: "BigWing",

    //当り判定サイズ
    width:  80,
    height: 26,

    //耐久力
    def: 1000,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 256,
    texTrimWidth: 192,
    texTrimHeight: 96,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
    },

    algorithm: function() {
        if (this.time % 2 == 0) this.y++;
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2+2;
            this.body.setFrameIndex(this.index);
        }
    },
};

/*
 *  飛空挺「スカイブレード」
 */
enemyData['SkyBlade'] = {
    //使用弾幕名
    danmakuName: "SkyBlade",

    //当り判定サイズ
    width:  40,
    height: 96,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 128,
    texTrimWidth: 96,
    texTrimHeight: 104,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;

        this.roter = phina.display.Sprite("tex1", 48, 104).addChildTo(this);
        this.roter.setFrameTrimming(96, 128, 192, 104);
        this.roter.setFrameIndex(0);
        this.roter.index = 0;

        //行動設定
        if (this.x < SC_W*0.5) {
            this.px = 1;
            this.tweener.moveBy( SC_W*0.6, 0, 180, "easeOutCubic").call(function(){this.phase++;}.bind(this));
        } else {
            this.px = -1;
            this.tweener.moveBy(-SC_W*0.6, 0, 180, "easeOutCubic").call(function(){this.phase++;}.bind(this));
        }
    },

    algorithm: function() {
        if (this.time % 4 == 0) {
            this.roter.index = (this.roter.index+1)%4;
            this.roter.setFrameIndex(this.roter.index);
        }
        if (this.time % 4 == 0) {
            this.index = (this.index+1)%2;
            this.body.setFrameIndex(this.index);
        }
        if (this.phase == 1) {
            this.y--;
            this.x+=this.px;
        }
    },
};

/*
 *  中型戦車「フラガラッハ」
 */
enemyData['Fragarach'] = {
    //使用弾幕名
    danmakuName: "Fragarach",

    //当り判定サイズ
    width:  48,
    height: 48,

    //耐久力
    def: 100,

    //得点
    point: 500,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_GROUND,

    //各種フラグ
    isGround: true,

    //機体用テクスチャ情報
    texName: "tex2",
    texWidth: 48,
    texHeight: 48,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 48,
    texIndex: 0,

    setup: function(param) {
        this.index = this.texIndex;
        this.phase = 0;

        //パラメータにより進行方向を決定
        this.pattern = param.pattern;
        this.speed = 0.5;
        this.direction = 0;
        switch (this.pattern) {
            case "c":
                this.direction = 0;
                break;
            case "b":
                this.direction = 180;
                break;
            case "l":
                this.direction = 90;
                break;
            case "r":
                this.direction = 270;
                break;
        }

        this.turret = phina.display.Sprite("tex1", 24, 24).addChildTo(this);
        this.turret.setFrameTrimming(192, 32, 24, 24);
        this.turret.setFrameIndex(0);
    },

    algorithm: function() {
        //砲台をターゲットの方向に向ける
        var ax = this.x - this.parentScene.player.x;
        var ay = this.y - this.parentScene.player.y;
        var rad = Math.atan2(ay, ax);
        var deg = ~~(rad * toDeg);
        this.turret.rotation = deg + 90;

        if (this.time % 4 == 0) {
            this.index = (this.index+1)%4;
            this.body.setFrameIndex(this.index);
        }
        if (this.vx != 0 || this.vy != 0) {
            this.addSmokeSmall(1);
        }

        if (this.pattern == "l" && this.x > SC_W*0.4) {
            this.direction = 180;
        }
        if (this.pattern == "r" && this.x < SC_W*0.6) {
            this.direction = 180;
        }

        //移動処理
        this.rotation = this.direction;
        var rad = this.direction * toRad;
        this.vx = Math.sin(rad) * this.speed;
        this.vy = Math.cos(rad) * this.speed;
        this.x += this.vx;
        this.y += this.vy;
    },
};

/*
 *  浮遊砲台「ブリュナーク」（設置）
 */
enemyData['Brionac1'] = {
    //使用弾幕名
    danmakuName: ["Brionac1_1", "Brionac1_2", "Brionac_ground1_3"],

    //当り判定サイズ
    width:  40,
    height: 40,

    //耐久力
    def: 400,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex2",
    texWidth: 48,
    texHeight: 48,
    texTrimX: 0,
    texTrimY: 64,
    texTrimWidth: 48,
    texTrimHeight: 48,
    texIndex: 0,

    setup: function(param) {
        this.isGround = true;

        this.vx = 0;
        this.vy = 0;

        //パラメータにより行動パターンを決定
        switch (param.pos) {
            case "center":
                break;
            case "left":
                this.vx = 4;
                break;
            case "right":
                this.vx = -4;
                break;
        }

        this.turret = phina.display.Sprite("tex2", 24, 24)
            .addChildTo(this)
            .setFrameTrimming(64, 64, 24, 24)
            .setFrameIndex(0)
            .setPosition(0, 0);
    },

    algorithm: function() {
        this.x += this.vx;
        this.y += this.vy;

        this.turret.rotation++;

        this.addSmokeSmall(1);
    },
};

/*
 *  大型ミサイル「ミスティルテイン」
 */
enemyData['Mistilteinn'] = {
    //使用弾幕名
    danmakuName: "basic",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 800,

    //得点
    point: 3000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MIDDLE,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 48,
    texHeight: 104,
    texTrimX: 0,
    texTrimY: 128,
    texTrimWidth: 96,
    texTrimHeight: 104,
    texIndex: 0,

    setup: function() {
        this.index = this.texIndex;
        this.phase = 0;
        this.setFrameTrimming(0, 128, 96, 104);
    },

    algorithm: function() {
    },
};

/*
 *  中型輸送機「トイボックス」
 */
enemyData['ToyBox'] = {
    //使用弾幕名
    danmakuName: "ToyBox",

    //当り判定サイズ
    width:  30,
    height: 90,

    //耐久力
    def: 500,

    //得点
    point: 5000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 64,
    texHeight: 128,
    texIndex: 2,

    //投下アイテム種類
    kind: 0,

    setup: function(enterParam) {
        if (enterParam.drop == "power") this.kind = ITEM_POWER;
        if (enterParam.drop == "bomb") this.kind = ITEM_BOMB;
        if (enterParam.drop == "1UP") this.kind = ITEM_1UP;
        this.tweener.clear().moveBy(0, SC_H*0.5, 300).wait(480).moveBy(0, -SC_H, 600);

        var that = this;
        this.turret = phina.display.Sprite("tex1", 24, 24)
            .addChildTo(this)
            .setFrameTrimming(196, 32, 24, 24)
            .setFrameIndex(0)
            .setPosition(0, -36);
        this.turret.update = function() {
            this.lookAt({
                x: that.x-that.player.x,
                y: that.y-that.player.y,
            });
        }
    },

    epuipment: function() {
    },

    algorithm: function() {
    },

    dead: function() {
        //破壊時アイテムをシーンに投入
        this.turret = Enemy("Item", this.x, this.y, 0, {kind: 0}).addChildTo(this.parentScene);

        //通常の破壊処理
        this.defaultDead();
    },
}

/*
 *  アイテム
 */
enemyData['Item'] = {
    //使用弾幕名
    danmakuName: null,

    //当り判定サイズ
    width:  30,
    height: 90,

    //耐久力
    def: 1,

    //得点
    point: 10000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_ITEM,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 32,
    texIndex: 0,
    texTrimX: 0,
    texTrimY: 96,
    texTrimWidth: 96,
    texTrimHeight: 32,

    //投下アイテム区分
    kind: 0,

    setup: function(enterParam) {
        this.isCollision = false;
        this.reset = true;
        this.count = 0;

        this.kind = enterParam.kind;
        this.frameIndex = this.kind;

        this.setScale(1.5);
     },

    epuipment: function() {
    },

    algorithm: function() {
        if (this.reset) {
            this.reset = false;
            this.count++;
            if (this.count < 5) {
                var px = Math.randint(0, SC_W);
                var py = Math.randint(SC_H*0.3, SC_W*0.9);
                this.tweener.clear()
                    .to({x: px, y: py}, 180, "easeInOutSine")
                    .wait(30)
                    .call(function() {
                        this.reset = true;
                    }.bind(this));
            } else {
                this.tweener.clear().to({x: this.x, y: SC_H*1.1}, 180, "easeInOutSine");
            }
       }
    },
}

/*
 *  誘導弾「メドゥーサ」
 */
enemyData['Medusa'] = {
    //使用弾幕名
    danmakuName: null,

    //当り判定サイズ
    width:  8,
    height: 8,

    //耐久力
    def: 10,

    //得点
    point: 500,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 8,
    texHeight: 24,
    texIndex: 0,
    texTrimX: 192,
    texTrimY: 64,
    texTrimWidth: 8,
    texTrimHeight: 24,

    setup: function(enterParam) {
        this.body.setOrigin(0.5, 0.0);

        //一定時間ごとに煙だすよ
        this.tweener.clear()
            .wait(5)
            .call(function() {
                this.parentScene.effectLayerMiddle.enterSmokeSmall({
                    position: {x: this.x, y: this.y},
                    velocity: {x: 0, y: 0, decay: 1},
                    delay: 0
                });
            }.bind(this))
            .setLoop(true);

        //自動追尾設定
        this.isHoming = false;

        //移動情報
        this.vx = 0;
        this.vy = 3;
        this.spd = 0.05;
        this.maxSpeed = 3;
    },

    algorithm: function() {

        if (this.isHoming) {
            this.lookAt();
            var vx = this.player.x-this.x;
            var vy = this.player.y-this.y;
            var d = Math.sqrt(vx*vx+vy*vy);
            this.vx += vx/d*this.spd;
            this.vy += vy/d*this.spd;
            if (d < 16) this.isHoming = false;
        } else {
            this.lookAt({x: this.x+this.vx, y: this.y+this.vy});
        }
        this.x += this.vx;
        this.y += this.vy;
    },

    setHoming: function(f) {
        if (f && !this.isHoming) {
            this.vx = 0;
            this.vy = 0;
        }
        this.isHoming = f;
        return this;
    },

    setVelocity: function(x, y) {
        this.vx = x;
        this.vy = y;
        return this;
    },

    setAngle: function(degree, speed) {
        var rad = degree * toRad;
        this.vx = Math.cos(rad) * speed;
        this.vy = Math.sin(rad) * speed;
    },
}

/*
 *  EnemyDataBoss_1.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  １面中ボス
 *  装甲輸送列車「トールハンマー」
 *
 */
enemyData['ThorHammer'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammer",

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
        this.isGround = true;
        this.stopDanmaku();

        //初速
        this.vy = -8;
    },

    epuipment: function() {
        //砲台設置
        this.turret = Enemy("ThorHammerTurret")
            .addChildTo(this.parentScene)
            .setParentEnemy(this)
            .setPosition(0, 0);
    },

    algorithm: function() {
        if (this.phase == 0) {
            if (this.y < -SC_H*0.5) {
                this.phase++;
                this.vy = -5;
                this.isCollision = true;
                this.isMuteki = false;
                this.tweener.clear()
                    .to({vy: -10}, 240)
                    .call(function(){
                        this.phase++;
                        this.resumeDanmaku();
                    }.bind(this));
            }
        }
        if (this.phase == 2) {
            this.turret.flare('startfire');
            this.phase++;
        }

        //土煙出すよ
        if (!this.isDead) {
            var vy = this.parentScene.ground.deltaY;
            for (var i = 0; i < 3; i++) {
                var layer = this.parentScene.effectLayerLower;
                layer.enterSmoke({
                    position: {x: this.x-32+rand(0,64), y: this.y},
                    velocity: {x: 0, y: vy, decay: 1},
                    delay: rand(0, 2)
                });
            }
        }

        //タイムアップで逃走（１７秒）
        if (!this.isDead && this.time == 1020) {
            this.tweener.clear()
                .to({vy: -15}, 120, "easeInSine")
                .call(function(){
                    this.parentScene.flare('end_boss');
                }.bind(this))
                .wait(60)
                .call(function(){
                    this.remove();
                }.bind(this));
        }
        this.y += this.vy;
//        this.y -= this.parentScene.ground.deltaY;
    },

    dead: function() {
        this.turret.dead();
        this.turret.remove();
        this.texIndex++;

        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .to({vy: -8}, 180, "easeInSine")
            .call(function() {
                this.explode();
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
    },
};

//砲台
enemyData['ThorHammerTurret'] = {
    //使用弾幕パターン
    danmakuName: "ThorHammerTurret",

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 500,

    //得点
    point: 0,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 32,
    texHeight: 32,
    texTrimX: 416,
    texTrimY: 128,
    texTrimWidth: 32,
    texTrimHeight: 32,
    texIndex: 0,

    setup: function() {
        this.isCollision = false;
        this.isMuteki = true;
        this.stopDanmaku();

        this.on('startfire', function(e) {
            this.resumeDanmaku();
        }.bind(this))
    },

    algorithm: function() {
        this.x = this.parentEnemy.x;
        this.y = this.parentEnemy.y-40;
        this.lookAt();
    },
};

/*
 *
 *  １面ボス
 *  局地制圧型巨大戦車「ゴリアテ」
 *
 */
//本体
enemyData['Golyat'] = {
    //使用弾幕パターン
    danmakuName: ["Golyat1_1", "Golyat1_2", "Golyat1_3", "Golyat2"],

    //当り判定サイズ
    width:  52,
    height: 60,

    //耐久力
    def: 5000,

    //得点
    point: 300000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 52,
    texHeight: 184,
    texTrimX: 258,
    texTrimY: 0,
    texTrimWidth: 52,
    texTrimHeight: 184,
    texIndex: 0,

    setup: function() {
        this.phase = 0;
        this.isCollision = false;
        this.isGround = true;
        this.isHover = true;
        this.isSmoke = true;

        //発狂モードフラグ
        this.isStampede = false;

        this.stopDanmaku();

        var that = this;

        //ボディカバー
        this.cover = phina.display.Sprite("tex_boss1", 64, 80)
            .addChildTo(this)
            .setFrameTrimming(382, 0, 64, 80)
            .setFrameIndex(0)
            .setPosition(-2, -18);
        this.cover.texColor = "";
        this.cover.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 64, 80);
                this.setFrameTrimming(382, 0, 64, 80).setFrameIndex(0);
                this.texColor = that.texColor;
            }
        };

        //中心部
        this.core = phina.display.Sprite("tex_boss1", 16, 16)
            .addChildTo(this)
            .setFrameTrimming(384, 96, 64, 16)
            .setFrameIndex(0)
            .setPosition(0, -8);
        this.core.texColor = "";
        this.core.idx = 0;
        this.core.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 16, 16);
                this.setFrameTrimming(384, 96, 64, 16).setFrameIndex(0);
                this.texColor = that.texColor;
            }
            this.frameIndex = this.idx | 0;
        };
        this.core.tweener.clear().setUpdateType("fps");

        this.on('dead', function() {
            this.cover.remove();
            this.core.remove();
            this.phase++;
        }.bind(this));

        this.on('bulletstart', function(e) {
            this.core.tweener.clear().to({idx: 3}, 15);
        }.bind(this));
        this.on('bulletend', function(e) {
            this.core.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //発狂モード
        this.on('stampede', function(e) {
            this.isStampede = true;
            this.startDanmaku(this.danmakuName[3]);
        }.bind(this));

        //弾幕１セット終了
        this.danmakuNumber = 0;
        this.on('bulletfinish', function(e) {
            this.danmakuNumber = (this.danmakuNumber+1)%3;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);

            //アーム側弾幕設定切替
            this.armL.startDanmaku(this.armL.danmakuName[this.danmakuNumber]);
            this.armR.startDanmaku(this.armR.danmakuName[this.danmakuNumber]);
        }.bind(this));

        //アームベース左
        this.armbaseL = phina.display.Sprite("tex_boss1", 66, 184)
            .addChildTo(this)
            .setFrameTrimming(192, 0, 66, 184)
            .setFrameIndex(0)
            .setPosition(-59, 0);
        this.armbaseL.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 66, 184);
                this.setFrameTrimming(192, 0, 66, 184).setFrameIndex(0);
                this.texColor = that.texColor;
            }
        };
        //アームベース右
        this.armbaseR = phina.display.Sprite("tex_boss1", 66, 184)
            .addChildTo(this)
            .setFrameTrimming(310, 0, 66, 184)
            .setFrameIndex(0)
            .setPosition(59, 0);
        this.armbaseR.update = function(e) {
            if (this.texColor !== that.texColor) {
                this.setImage("tex_boss1"+that.texColor, 66, 184);
                this.setFrameTrimming(310, 0, 66, 184).setFrameIndex(0);
                this.texColor = that.texColor;
            }
        };

        //登場パターン
        this.tweener.clear()
            .moveTo(SC_W*0.5, SC_H*0.3, 300, "easeOutSine")
            .call(function(){
                this.phase++;
                this.resumeDanmaku();
            }.bind(this));
    },

    epuipment: function() {
        var ps = this.parentScene;
        //アーム左
        this.armL = ps.enterEnemy("GolyatArm", 0, 0).setParentEnemy(this);
        this.armL.$extend({
            offsetX: -52,
            offsetY: 8,
        });
        //アーム右
        this.armR = ps.enterEnemy("GolyatArm", 0, 0).setParentEnemy(this);
        this.armR.$extend({
            offsetX: 52,
            offsetY: 8,
        });

        //アーム差動用
        this.armL.vibX = 0;
        this.armL.vibY = 0
        this.armR.vibX = 0;
        this.armR.vibY = 0;

        //ウィング左
        this.wingL = ps.enterEnemy("GolyatWing", 0, 0).setParentEnemy(this.armL);
        this.wingL.$extend({
            offsetX: -31,
            offsetY: 3,
        });
        //ウィング右
        this.wingR = ps.enterEnemy("GolyatWing", 0, 0).setParentEnemy(this.armR);
        this.wingR.texIndex = 1;
        this.wingR.$extend({
            offsetX: 31,
            offsetY: 3,
        });

        this.rad = Math.PI*0.5;
    },

    algorithm: function() {
        //行動開始
        if (this.phase == 1) {
            this.isCollision = true;

            this.phase++;
            this.resumeDanmaku();

            this.armL.flare('startfire');
            this.armR.flare('startfire');
        }

        //左右に動く
        if (this.phase == 2) {
            this.x = Math.cos(this.rad)*SC_W*0.2+SC_W*0.5;
//            this.y = Math.sin(this.rad*2)/2;
            this.rad -= 0.01
        }

        //画面中央に戻る
        if (this.phase == 3) {
            this.tweener.to({x: SC_W*0.5}, 180, "easeInOutSine");
            this.phase++;
        }

        //土煙出すよ
        if (this.isSmoke) {
            var vy = this.parentScene.ground.deltaY;
            var rad = this.rotation*toRad;
            for (var i = 0; i < 5; i++) {
                var layer = this.parentScene.effectLayerLower;

                var x = -76+rand(0, 40);
                var y = 80-rand(0, 100);
                var rx = this.x + x;
                var ry = this.y + y;
                if (this.rotation != 0) {
                    rx = this.x + Math.cos(rad)*x - Math.sin(rad)*y;
                    ry = this.y + Math.sin(rad)*x + Math.cos(rad)*y;
                }
                layer.enterSmoke({
                    position: {x: rx, y: ry},
                    velocity: {x: rand(-1, 1), y: vy, decay: 1},
                    delay: rand(0, 2)
                });

                var x = 40+rand(0, 40);
                var y = 80-rand(0, 100);
                var rx = this.x + x;
                var ry = this.y + y;
                if (this.rotation != 0) {
                    rx = this.x + Math.cos(rad)*x - Math.sin(rad)*y;
                    ry = this.y + Math.sin(rad)*x + Math.cos(rad)*y;
                }
                layer.enterSmoke({
                    position: {x: rx, y: ry},
                    velocity: {x: rand(-1, 1), y: vy, decay: 1},
                    delay: rand(0, 2)
                });
            }
        }

        //アーム破壊時爆発
        if (this.time % 60 == 0) {
            var ground = this.parentScene.ground;
            var vx = this.x-this.beforeX+ground.deltaX;
            var vy = this.y-this.beforeY+ground.deltaY;
            if (this.armL.def == 0) {
                var x = this.x+rand(-33, 33)-64;
                var y = this.y+rand(-92, 92);
                var delay = rand(0, 30);
                Effect.enterExplode(this.parentScene.effectLayerUpper, {
                    position: {x: x, y: y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
            }
            if (this.armR.def == 0) {
                var x = this.x+rand(-33, 33)+64;
                var y = this.y+rand(-92, 92);
                var delay = rand(0, 30);
                Effect.enterExplode(this.parentScene.effectLayerUpper, {
                    position: {x: x, y: y},
                    velocity: {x: vx, y: vy, decay: 0.95},
                    delay: delay,
                });
            }
        }
    },

    //アーム破壊
    deadChild: function(child) {
        this.phase = 9;
        this.isCollision = false;

        this.stopDanmaku();
        this.armL.stopDanmaku();
        this.armR.stopDanmaku();

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 60;

        //アーム破壊時アクション
        var bx = Math.cos(this.rad)*SC_W*0.2+SC_W*0.5;
        var by = this.y;
        var rot = child == this.armL? 20: -20;
        var ax = child == this.armL? 30: -30;
        this.tweener.clear()
            .to({x: this.x+ax, rotation: rot}, 30, "easeInOutSine")
            .wait(60)
            .to({x: bx, y: by, rotation: 0}, 180, "easeInOutSine")
            .call(function() {
                this.phase = 2;
                this.isCollision = true;

                this.resumeDanmaku();
                this.armL.resumeDanmaku();
                this.armR.resumeDanmaku();
            }.bind(this));

        //背景スクロール制御
        this.parentScene.ground.tweener.clear()
            .to({speed: -1.0}, 30, "easeInOutCubic")
            .wait(90)
            .to({speed: -7.0}, 60, "easeInOutCubic");

        //両方のアームが破壊された場合、発狂モードへ移行
        if (!this.isStampede && this.armL.def == 0 && this.armR.def == 0) {
            this.flare('stampede');
        }
    },

    dead: function() {
        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, -50, 300)
            .call(function() {
                this.explode();
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },
};

//アーム
enemyData['GolyatArm'] = {
    //使用弾幕パターン
    danmakuName: ["GolyatArm1", "GolyatArm2", "GolyatArm3"],

    //当り判定サイズ
    width:  56,
    height: 200,

    //耐久力
    def: 1000,

    //得点
    point: 50000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 52,
    texHeight: 200,
    texTrimX: 450,
    texTrimY: 0,
    texTrimWidth: 52,
    texTrimHeight: 200,
    texIndex: 0,

    setup: function() {
        this.isCollision = false;
        this.isGround = true;
        this.stopDanmaku();

        //砲台１
        this.turret1 = phina.display.Sprite("tex_boss1", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 144, 48)
            .setFrameIndex(0)
            .setPosition(0, 32);
        this.turret1.idx = 0;
        this.turret1.update = function() {
            this.frameIndex = this.idx | 0;
        };
        this.turret1.tweener.clear().setUpdateType("fps");

        //砲台２
        this.turret2 = phina.display.Sprite("tex_boss1", 48, 48)
            .addChildTo(this)
            .setFrameTrimming(0, 192, 144, 48)
            .setFrameIndex(0)
            .setPosition(0, -32);
        this.turret2.idx = 0;
        this.turret2.update = function() {
            this.frameIndex = this.idx | 0;
        };
        this.turret2.tweener.clear().setUpdateType("fps");

        //砲台１開閉
        this.on('bulletstart1', function(e) {
            this.turret1.tweener.clear().to({idx: 2}, 15);
        }.bind(this));
        this.on('bulletend1', function(e) {
            this.turret1.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //砲台２開閉
        this.on('bulletstart2', function(e) {
            this.turret2.tweener.clear().to({idx: 2}, 15);
        }.bind(this));
        this.on('bulletend2', function(e) {
            this.turret2.tweener.clear().to({idx: 0}, 15);
        }.bind(this));

        //BulletML始動
        this.on('startfire', function() {
            this.resumeDanmaku();
        }.bind(this));

        //誘導弾発射
        this.on('bulletmissile1', function() {
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity(-0.5, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity( 0.0, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y-40).setHoming(true).setVelocity( 0.5, -1.0);
        }.bind(this));
        this.on('bulletmissile2', function() {
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity(-0.5, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity( 0.0, -1.0);
            this.parentScene.enterEnemy("Medusa", this.x, this.y+20).setHoming(true).setVelocity( 0.5, -1.0);
        }.bind(this));
    },

    algorithm: function() {
        //親オブジェクトの回転による位置補正
        this.rotation = this.parentEnemy.rotation;
        var offsetX = this.offsetX;
        var offsetY = this.offsetY;
        if (this.rotation != 0) {
            var rad = this.rotation*toRad;
            offsetX = Math.cos(rad)*this.offsetX-Math.sin(rad)*this.offsetY;
            offsetY = Math.sin(rad)*this.offsetX+Math.cos(rad)*this.offsetY;
        }
        this.x = this.parentEnemy.x+offsetX;
        this.y = this.parentEnemy.y+offsetY;

        //判定有無は親にあわせる
        if (this.def > 0) this.isCollision = this.parentEnemy.isCollision;
    },
};

//ウィング
enemyData['GolyatWing'] = {
    //使用弾幕パターン
    danmakuName: "",

    //当り判定サイズ
    width:  16,
    height: 112,

    //耐久力
    def: 500,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_LARGE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 16,
    texHeight: 112,
    texTrimX: 384,
    texTrimY: 128,
    texTrimWidth: 32,
    texTrimHeight: 112,
    texIndex: 0,

    setup: function() {
        this.offsetX = 0;
        this.offsetY = 0;
    },

    algorithm: function() {
        //親オブジェクトの回転による位置補正
        this.rotation = this.parentEnemy.rotation;
        var offsetX = this.offsetX;
        var offsetY = this.offsetY;
        if (this.rotation != 0) {
            var rad = this.rotation*toRad;
            offsetX = Math.cos(rad)*this.offsetX-Math.sin(rad)*this.offsetY;
            offsetY = Math.sin(rad)*this.offsetX+Math.cos(rad)*this.offsetY;
        }
        this.x = this.parentEnemy.x+offsetX;
        this.y = this.parentEnemy.y+offsetY;

        //親の耐久度が０で除去
        if (this.parentEnemy.def == 0) this.remove();

        //判定有無は親にあわせる
        this.isCollision = this.parentEnemy.isCollision;
    },
};


/*
 *  EnemyDataBoss_2.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  ２面中ボス  
 *  大型爆撃機「レイブン」
 *
 */
enemyData['Raven'] = {
    //使用弾幕パターン
    danmakuName: "Raven",

    //当り判定サイズ
    width:  96,
    height: 40,

    //耐久力
    def: 5000,

    //得点
    point: 200000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 144,
    texHeight: 64,
    texTrimX: 0,
    texTrimY: 256,
    texTrimWidth: 144,
    texTrimHeight: 64,
    texIndex: 0,

    setup: function() {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;

        this.stopDanmaku();

        var that = this;

        //砲台
        this.turret = phina.display.Sprite("tex_boss1", 32, 32)
            .addChildTo(this)
            .setFrameTrimming(160, 192, 32, 32)
            .setFrameIndex(0)
            .setPosition(0, 0);
        this.turret.update = function() {
            target = that.player;

            //ターゲットの方向を向く
            var ax = that.x - target.x;
            var ay = that.y - target.y;
            var rad = Math.atan2(ay, ax);
            var deg = ~~(rad * toDeg);
            this.rotation = deg-90;
        };

/*
        //アフターバーナー
        this.burner = phina.display.Sprite("tex_boss1", 112, 32)
            .addChildTo(this)
            .setFrameTrimming(0, 320, 112, 64)
            .setFrameIndex(0)
            .setPosition(0, 32);
        this.burner.update = function() {
            this.frameIndex++;
        };
*/
        this.phase = 0;
        this.tweener.clear()
            .to({x: SC_W*0.5, y: SC_H*0.25}, 120, "easeOutCubic")
            .call(function() {
                this.phase++;
            }.bind(this));
    },

    epuipment: function() {
        //翼
        this.wingL = Enemy("Raven_wing", -48, 0, 0, {frameIndex: 0})
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
        this.wingR = Enemy("Raven_wing", 48, 0, 0, {frameIndex: 1})
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.isCollision = true;
            this.isMuteki = false;
            this.phase++;
            this.startDanmaku(this.danmakuName);

            //移動パターン
            this.tweener.clear()
                .to({x: SC_W*0.8}, 240, "easeInOutSine")
                .to({x: SC_W*0.2}, 240, "easeInOutSine")
                .setLoop(true);
            this.tweener2 = phina.accessory.Tweener().clear().setUpdateType('fps')
                .to({y: SC_H*0.2}, 180, "easeInOutSine")
                .to({y: SC_H*0.3}, 180, "easeInOutSine")
                .setLoop(true)
                .attachTo(this);
        }
    },

    dead: function() {
        this.isCollision = false;
        this.isDead = true;
        this.tweener.clear();
        this.stopDanmaku();

        this.explode();
        app.playSE("explodeLarge");

        this.tweener2.remove();
        phina.accessory.Tweener().clear().setUpdateType('fps')
            .to({rotation: 30}, 300)
            .attachTo(this);
        phina.accessory.Tweener().clear().setUpdateType('fps')
            .by({x: 2}, 3)
            .by({x: -2}, 3)
            .setLoop(true)
            .attachTo(this);

        //弾消し
        this.parentScene.eraseBullet();
        this.parentScene.timeVanish = 180;

        //破壊時消去インターバル
        this.tweener.clear()
            .moveBy(0, 100, 300)
            .call(function() {
                this.explode();
                this.parentScene.maskWhite.tweener.clear().fadeIn(45).fadeOut(45);
                app.playSE("explodeBoss");
                if (this.shadow) {
                    this.shadow.tweener.clear()
                        .to({alpha: 0}, 15)
                        .call(function(){
                            this.remove();
                        }.bind(this.shadow));
                }
            }.bind(this))
            .to({alpha: 0}, 15)
            .call(function(){
                this.remove();
            }.bind(this));
        return this;
    },
};

enemyData['Raven_wing'] = {
    //使用弾幕パターン
    danmakuName: null,

    //当り判定サイズ
    width:  64,
    height: 64,

    //耐久力
    def: 1000,

    //得点
    point: 50000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 64,
    texHeight: 64,
    texTrimX: 160,
    texTrimY: 256,
    texTrimWidth: 128,
    texTrimHeight: 64,
    texIndex: 0,

    setup: function(param) {
        this.texIndex = param.frameIndex;
        this.offsetX = this.x;
        this.offsetY = this.y;
    },

    algorithm: function() {
        this.x = this.parentEnemy.x + this.offsetX;
        this.y = this.parentEnemy.y + this.offsetY;
    },
};

/*
 *
 *  ２面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */
enemyData['Garuda'] = {
    //使用弾幕パターン
    danmakuName: ["Garuda_1", "Garuda_2", "Garuda_3", "Garuda_4"],

    //当り判定サイズ
    width:  64,
    height: 70,

    //耐久力
    def: 8000,

    //得点
    point: 400000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_UPPER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 296,
    texHeight: 80,
    texTrimX: 128,
    texTrimY: 320,
    texTrimWidth: 296,
    texTrimHeight: 160,
    texIndex: 0,

    setup: function(enterParam) {
        this.phase = 0;
        this.isCollision = false;
        this.isMuteki = true;
        this.alpha = 0;
        this.tweener.clear()
            .fadeIn(60)
            .wait(120)
            .call(function() {
                this.phase++;
            }.bind(this));

        //発狂モードフラグ
        this.isStampede = false;

        this.stopDanmaku();

        //弾幕１セット終了
        this.danmakuNumber = 0;
        this.on('bulletfinish', function(e) {
            this.danmakuNumber = (this.danmakuNumber+1)%3;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);
        }.bind(this));

        //発狂モード
        this.on('stampede', function(e) {
            this.isStampede = true;
            this.startDanmaku(this.danmakuName[3]);
            //ハッチ側弾幕設定切替
            this.hatchL.startDanmaku(this.hatchL.danmakuName[this.danmakuNumber]);
            this.hatchR.startDanmaku(this.hatchR.danmakuName[this.danmakuNumber]);
        }.bind(this));

        //オプション武器投下
        this.on('bulletbomb', function(e) {
            this.parentScene.enterEnemy("GarudaBomb", this.x+100, this.y+32);
            this.parentScene.enterEnemy("GarudaBomb", this.x-100, this.y+32);
        }.bind(this));

        //弾幕１セット終了
        this.danmakuNumber = 0;
        this.on('bulletfinish', function(e) {
            this.danmakuNumber = (this.danmakuNumber+1)%3;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);

            //ハッチ側弾幕設定切替
            this.hatchL.startDanmaku(this.hatchL.danmakuName[this.danmakuNumber]);
            this.hatchR.startDanmaku(this.hatchR.danmakuName[this.danmakuNumber]);
        }.bind(this));
    },

    epuipment: function() {
        //ハッチ
        this.hatchL = Enemy("Garuda_hatch", -61, 2, 0)
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
        this.hatchR = Enemy("Garuda_hatch",  62, 2, 0)
            .addChildTo(this.parentScene)
            .setParentEnemy(this);
    },

    algorithm: function() {
        if (this.phase == 1) {
            this.isCollision = true;
            this.isMuteki = false;
            this.startDanmaku(this.danmakuName[this.danmakuNumber]);

            this.hatchL.isCollision = true;
            this.hatchR.isCollision = true;

            //移動パターン
            this.tweener.clear()
                .to({y: SC_H*0.2}, 120, "easeInOutSine")
                .to({y: SC_H*0.3}, 120, "easeInOutSine")
                .setLoop(true);

            this.phase++;
        }

        //耐久力残り２割切ったらテクスチャを切替
        if (this.texIndex == 0 && this.def < this.defMax*0.2) {
            this.texIndex = 1;
            this.shadow.frameIndex = 1;
            this.explode(296, 80);
            //発狂モード移行
            if (!this.stampede) {
                this.flare("stampede");
            }
        }
    },

    deadChild: function(child) {
        //砲台両方とも死んだら発狂モード移行
        if (!this.stampede && this.hatchL.def == 0 && this.hatchR.def == 0) {
            this.flare("stampede");
        }
    },

    dead: function() {
        this.defaultDeadBoss(296, 80);
    },
};

enemyData['Garuda_hatch'] = {
    //使用弾幕パターン
    danmakuName: ["Garuda_hatch_1", "Garuda_hatch_2", "Garuda_hatch_3", "Garuda_hatch_4"],

    //当り判定サイズ
    width:  16,
    height: 16,

    //耐久力
    def: 1500,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_UPPER,

    //敵タイプ
    type: ENEMY_BOSS_EQUIP,

    //爆発タイプ
    explodeType: EXPLODE_SMALL,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 16,
    texHeight: 16,
    texTrimX: 0,
    texTrimY: 384,
    texTrimWidth: 64,
    texTrimHeight: 16,
    texIndex: 0,

    setup: function(param) {
        this.texIndex = 0;
        this.offsetX = this.x;
        this.offsetY = this.y;

        this.isCollision = false;

        this.stopDanmaku();

        //開閉
        this.idx = 0;
        this.on('bulletstart', function(e) {
            this.tweener.clear().to({idx: 3}, 15);
        }.bind(this));
        this.on('bulletend', function(e) {
            this.tweener.clear().to({idx: 0}, 15);
        }.bind(this));
    },

    algorithm: function() {
        this.x = this.parentEnemy.x + this.offsetX;
        this.y = this.parentEnemy.y + this.offsetY;
        this.texIndex = Math.floor(this.idx);
    },
};

/*
 *  ボスオプション「GarudaBomb」
 */
enemyData['GarudaBomb'] = {
    //使用弾幕名
    danmakuName: "GarudaBomb",

    //当り判定サイズ
    width:  20,
    height: 30,

    //耐久力
    def: 300,

    //得点
    point: 2000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_MIDDLE,

    //敵タイプ
    type: ENEMY_SMALL,

    //爆発タイプ
    explodeType: EXPLODE_MIDDLE,

    //機体用テクスチャ情報
    texName: "tex1",
    texWidth: 32,
    texHeight: 48,
    texIndex: 0,
    texTrimX: 192,
    texTrimY: 256,
    texTrimWidth: 64,
    texTrimHeight: 48,

    setup: function(enterParam) {
        this.vy = 0;
        this.tweener.clear().to({vy: 3}, 180, "easeOutSine");
    },

    algorithm: function(e) {
        this.y += this.vy;
    },
};

/*
 *  EnemyDataBoss_3.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  ３面中ボス
 *  「モーンブレイド」
 *
 */
enemyData['MournBlade'] = {
    //使用弾幕パターン
    danmakuName: "MournBlade",

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_MBOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
    },

    epuipment: function() {
    },

    algorithm: function() {
    },
};

/*
 *
 *  ３面ボス
 *  空中空母「ストームブリンガー」
 *
 */
enemyData['StormBringer'] = {
    //使用弾幕パターン
    danmakuName: ["StormBringer1_1", "StormBringer1_2", "StormBringer1_3", "StormBringer2"],

    //当り判定サイズ
    width:  98,
    height: 196,

    //耐久力
    def: 3000,

    //得点
    point: 100000,

    //表示レイヤー番号
    layer: LAYER_OBJECT_LOWER,

    //敵タイプ
    type: ENEMY_BOSS,

    //爆発タイプ
    explodeType: EXPLODE_BOSS,

    //機体用テクスチャ情報
    texName: "tex_boss1",
    texWidth: 96,
    texHeight: 192,
    texTrimX: 0,
    texTrimY: 0,
    texTrimWidth: 192,
    texTrimHeight: 192,
    texIndex: 0,

    setup: function() {
    },

    epuipment: function() {
    },

    algorithm: function() {
    },
};

/*
 *  EnemyDataBoss_4.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

/*
 *
 *  ４面中ボス
 *
 */

/*
 *
 *  ４面ボス
 *
 */


/*
 *  EnemyData.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

//敵小隊単位定義
enemyUnit = {

/*
 * 突撃ヘリ「ホーネット」（パターン１）
 */
"Hornet1-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-150, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:1} },
],
"Hornet1-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-110, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-100, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-150, param:{pattern:1} },
],
"Hornet1-center": [
    { "name": "Hornet", "x":SC_W*0.25, "y":-160, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.35, "y":-120, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.40, "y":-100, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.50, "y":-110, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.70, "y":-130, param:{pattern:1} },
    { "name": "Hornet", "x":SC_W*0.85, "y":-120, param:{pattern:1} },
],

/*
 * 突撃ヘリ「ホーネット」（パターン２）
 */
"Hornet2-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-100, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:2} },
],
"Hornet2-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-100, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-130, param:{pattern:2} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-120, param:{pattern:2} },
],

/*
 * 突撃ヘリ「ホーネット」（パターン３）
 */
"Hornet3-left": [
    { "name": "Hornet", "x":SC_W*0.1, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.2, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.3, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.4, "y":-120, param:{pattern:3} },
],
"Hornet3-right": [
    { "name": "Hornet", "x":SC_W*0.6, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.7, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.8, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.9, "y":-120, param:{pattern:3} },
],
"Hornet3-center": [
    { "name": "Hornet", "x":SC_W*0.25, "y":-160, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.35, "y":-120, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.40, "y":-100, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.50, "y":-110, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.70, "y":-130, param:{pattern:3} },
    { "name": "Hornet", "x":SC_W*0.85, "y":-120, param:{pattern:3} },
],

/*
 *  中型攻撃ヘリ「ジガバチ」
 */
"MudDauber-left": [
    { "name": "MudDauber", "x": SC_W*0.3, "y":-SC_H*0.1 },
],

"MudDauber-center": [
    { "name": "MudDauber", "x": SC_W*0.5, "y":-SC_H*0.1 },
],

"MudDauber-right": [
    { "name": "MudDauber", "x": SC_W*0.7, "y":-SC_H*0.1 },
],

/*
 *  中型爆撃機「ビッグウィング」
 */
"BigWing-left": [
    { "name": "BigWing", "x":SC_W*0.2, "y":-SC_H*0.1 },
],

"BigWing-right": [
    { "name": "BigWing", "x":SC_W*0.8, "y":-SC_H*0.1 },
],

/*
 *  飛空艇「スカイブレード」
 */
"SkyBlade-left": [
    { "name": "SkyBlade", "x":-SC_W*0.2, "y": SC_H*0.4 },
],

"SkyBlade-right": [
    { "name": "SkyBlade", "x": SC_W*1.2, "y": SC_H*0.4 },
],

/*
 *  砲台「ブリュナーク」
 */
"Brionac1-left": [
    { "name": "Brionac1", "x": SC_W*0.3, "y":-SC_H*0.1, param:{pos:"left"}},
],

"Brionac1-center": [
    { "name": "Brionac1", "x": SC_W*0.5, "y":-SC_H*0.1, param:{pos:"center"}},
],

"Brionac1-right": [
    { "name": "Brionac1", "x": SC_W*0.7, "y":-SC_H*0.1, param:{pos:"right"}},
],

/*
 *  中型戦車「フラガラッハ」
 */
"Fragarach-center": [
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.3, param:{pattern:"c"} },

    { "name": "Fragarach", "x": SC_W*0.5, "y":-SC_H*0.35, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.5, "y":-SC_H*0.25, param:{pattern:"c"} },

    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.3, param:{pattern:"c"} },
],
"Fragarach-left": [
    { "name": "Fragarach", "x":-SC_W*0.05, "y": -SC_H*0.1, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.05, "y": -SC_H*0.2, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.1,  "y": -SC_H*0.3, param:{pattern:"l"} },
    { "name": "Fragarach", "x":-SC_W*0.1,  "y": -SC_H*0.4, param:{pattern:"l"} },
],
"Fragarach-right": [
    { "name": "Fragarach", "x": SC_W*1.05, "y": -SC_H*0.1, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.05, "y": -SC_H*0.2, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.1,  "y": -SC_H*0.3, param:{pattern:"r"} },
    { "name": "Fragarach", "x": SC_W*1.1,  "y": -SC_H*0.4, param:{pattern:"r"} },
],
"Fragarach-left2": [
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.2, "y":-SC_H*0.3, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.3, "y":-SC_H*0.4, param:{pattern:"c"} },
],
"Fragarach-right2": [
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.1, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.2, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.8, "y":-SC_H*0.3, param:{pattern:"c"} },
    { "name": "Fragarach", "x": SC_W*0.7, "y":-SC_H*0.4, param:{pattern:"c"} },
],


/*
 *  中型輸送機「トイボックス」
 */
//パワーアップ
"ToyBox-p-left":    [{ "name": "ToyBox", "x": SC_W*0.2, "y": -SC_H*0.3, param:{drop:"power"} },],
"ToyBox-p-center":  [{ "name": "ToyBox", "x": SC_W*0.5, "y": -SC_H*0.3, param:{drop:"power"} },],
"ToyBox-p-right":   [{ "name": "ToyBox", "x": SC_W*0.8, "y": -SC_H*0.3, param:{drop:"power"} },],

//ボム
"ToyBox-b-left":    [{ "name": "ToyBox", "x": SC_W*0.2, "y": -SC_H*0.3, param:{drop:"bomb"} },],
"ToyBox-b-center":  [{ "name": "ToyBox", "x": SC_W*0.5, "y": -SC_H*0.3, param:{drop:"bomb"} },],
"ToyBox-b-right":   [{ "name": "ToyBox", "x": SC_W*0.8, "y": -SC_H*0.3, param:{drop:"bomb"} },],

/*
 *
 *  １面中ボス
 *  装甲輸送列車「トールハンマー」
 *
 */
"ThorHammer": [
    { "name": "ThorHammer", "x":SC_W*0.5, "y": SC_H*1.3 },
],

/*
 *
 *  １面ボス
 *  局地制圧型巨大戦車「ゴリアテ」
 *
 */
"Golyat": [
    { "name": "Golyat", "x":SC_W*0.5, "y": SC_H*-0.2 },
],

/*
 *
 *  ２面中ボス  
 *  大型爆撃機「レイブン」
 *
 */
"Raven": [
    { "name": "Raven", "x": SC_W*1.2, "y": SC_H*0.7 },
],

/*
 *
 *  ２面ボス
 *  大型超高高度爆撃機「ガルーダ」
 *
 */
"Garuda": [
    { "name": "Garuda", "x": SC_W*0.5, "y": SC_H*0.2 },
],

}

/*
 *  Item.js
 *  2015/10/19
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アイテム
phina.define("Item", {
    superClass: "phina.display.Sprite",
    layer: LAYER_PLAYER,

    //アイテム種類
    //0: パワーアップ
    //1: ボム
    //2: １ＵＰ
    //3: 得点
    id: 0,

    //パワーアップタイプ
    type: 0,

    active: false,

    init: function(id) {
        this.superInit("tex1", 32, 32);
        this.id = id;
        this.setFrameTrimming(0, 97, 96, 32);
        this.setFrameIndex(id);
        this.setScale(2.0);

        //当り判定設定
        this.boundingType = "rect";

        this.phase = 0;
        this.count = 0;
        this.time = 1;
    },

    update: function(app) {
        //自機との当り判定チェック
        var player = app.currentScene.player;
        if (this.isHitElement(player)) {
            player.getItem(this.id, this.type);
            this.remove();
            return;
        }

        //移動パターン
        if (this.phase == 0) {
            this.y++;
            if (this.y > SC_H-32) {
                this.phase++;
            }
        } else if (this.phase == 1) {
            var x = rand(SC_W*0.2, SC_W*0.8);
            var y = rand(SC_H*0.2, SC_W*0.9);
            this.tweener.clear()
                .move(x, y, 3000, "easeInOutSine")
                .call(function() {
                    this.count++;
                    if (this.count < 3) {
                        this.phase = 1;
                    } else {
                        this.phase = 3;
                    }
                }.bind(this));
            this.phase++;
        } else if (this.phase == 3) {
            this.y += 2;
        }

        this.time++;
    },
});

/*
 *  player.js
 *  2014/09/05
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Player", {
    superClass: "phina.display.DisplayElement",
    _member: {
        layer: LAYER_PLAYER,

        //当り判定サイズ
        width: 2,
        height: 2,

        isControl: true,    //操作可能フラグ
        isShotOK: true,     //ショット可能フラグ
        isDead: false,      //死亡フラグ
        shotON: true,       //ショットフラグ
        mouseON: false,     //マウス操作中フラグ

        isCollision: false,     //当り判定有効フラグ
        isAfterburner: false,   //アフターバーナー中
        isAfterburnerBefore: false,

        timeMuteki: 0, //無敵フレーム残り時間

        speed: 4,       //移動係数
        touchSpeed: 4,  //タッチ操作時移動係数
        type: 0,        //自機タイプ(0:赤 1:緑 2:青)
        power: 0,       //パワーアップ段階
        powerMax: 5,    //パワーアップ最大

        shotPower: 10,      //ショット威力
        shotInterval: 6,    //ショット間隔

        rollcount: 50,
        pitchcount: 50,

        parentScene: null,
        indecies: [0,1,2,3,4,4,4,5,6,7,8],
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        this.tweener.setUpdateType('fps');

        this.sprite = phina.display.Sprite("gunship", 48, 48)
            .addChildTo(this)
            .setFrameIndex(4)
            .setScale(0.66);

        //ビット
        this.bits = [];
        for (var i = 0; i < 4; i++) {
            this.bits[i] = PlayerBit(i).addChildTo(this);
            this.bits[i].tweener.setUpdateType('fps');
        }
        this.openBit(0);

        //当り判定設定
        this.boundingType = "circle";
        this.radius = 2;

        this.on('removed', function() {
            if (this.shadow) this.shadow.remove();
        }.bind(this));

        this.time = 0;
        this.changeInterval = 0;
        return this;
    },

    update: function(app) {
        if (this.isControl) {
            //マウス操作
            var p = app.mouse;
            if (p.getPointing()) {
/*
                var pt = this.parentScene.pointer;
                this.x += (pt.x - this.x)/this.touchSpeed;
                this.y += (pt.y - this.y)/this.touchSpeed;
*/
                var pt = p.deltaPosition;
                this.x += ~~(pt.x*1.8);
                this.y += ~~(pt.y*1.8);

                this.mouseON = true;
                this.shotON = true;
            } else {
                this.mouseON = false;
                this.shotON = false;
            }

            //コントローラー操作
            var ct = app.controller;
            if (ct.angle !== null) {
                var m = KEYBOARD_MOVE[ct.angle];
                this.x += m.x*this.speed;
                this.y += m.y*this.speed;
            }
            if (ct.analog1.x > 0.3 || -0.3 > ct.analog1.x) this.x += ct.analog1.x * this.speed;
            if (ct.analog1.y > 0.3 || -0.3 > ct.analog1.y) this.y += ct.analog1.y * this.speed;
            if (!this.mouseON) this.shotON = app.controller.shot;

            //コントロール不可状態
            if (!this.isControl || !this.isShotOK || this.isDead) {
                this.shotON = false;
            }

            //コントロール可能状態
            if (this.isControl && this.isShotOK && !this.isDead) {
                //ボム投下
                if (ct.bomb) {
                    this.parentScene.enterBomb();
                }

                //ショットタイプ変更（テスト用）
                if (ct.special1 && this.time > this.changeInterval) {
                    this.type = (this.type+1)%3;
                    this.openBit(this.type);
                    this.changeInterval = this.time+30;
                }
            }

            //移動範囲の制限
            this.x = Math.clamp(this.x, 16, SC_W-16);
            this.y = Math.clamp(this.y, 16, SC_H-16);

            //ショット投入
            if (this.shotON && app.ticker.frame % this.shotInterval == 0) this.enterShot();
        }

        //機体ロール
        var x = ~~this.x;
        var bx = ~~this.bx;
        if (bx > x) {
            this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
        }
        if (bx < x) {
            this.rollcount+=2;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        var vx = Math.abs(bx - x);
        if (vx < 2) {
            if (this.rollcount < 50) this.rollcount+=2; else this.rollcount-=2;
            if (this.rollcount < 0) this.rollcount = 0;
            if (this.rollcount > 100) this.rollcount = 100;
        }
        this.sprite.setFrameIndex(this.indecies[Math.clamp(~~(this.rollcount/10),0, 9)]);

        //アフターバーナー描写
        if (this.isAfterburner) {
            var ground = this.parentScene.ground;
            var layer = this.parentScene.effectLayerUpper;
            //着火
            if (!this.isAfterburnerBefore) {
                for (var i = 0; i < 50; i++) {
                    var vx = Math.randint(-5, 5);
                    var vy = Math.randint(1, 5);
                    var d =  Math.randfloat(0.9, 0.99);
                    var e = layer.enterAfterburner({
                        position: {x: this.x, y: this.y+16},
                        velocity: {x: vx, y: vy+ground.deltaY, decay: d},
                        alpha: 0.7,
                        blendMode: "lighter",
                    });
                }
            }
            if (!this.isDead) {
                var e = layer.enterAfterburner({
                    position: {x: this.x, y: this.y+26},
                    velocity: {x: 0, y: ground.deltaY, decay: 0.99},
                    alpha: 0.7,
                    blendMode: "lighter",
                });
                if (e) e.setScale(1.0, 3.0);
            }
        } else {
            //消火
            if (this.isAfterburnerBefore) {
                var ground = this.parentScene.ground;
                var layer = this.parentScene.effectLayerUpper;
                for (var i = 0; i < 10; i++) {
                    var vx = Math.randint(-2, 2);
                    var vy = Math.randint(1, 5);
                    var d =  Math.randfloat(0.9, 0.99);
                    var e = layer.enterAfterburner({
                        position: {x: this.x, y: this.y+16},
                        velocity: {x: vx, y: vy+ground.deltaY, decay: d},
                        alpha: 0.7,
                        blendMode: "lighter",
                    });
                }
            }
        }

        this.bx = this.x;
        this.by = this.y;
        this.time++;
        this.timeMuteki--;
        this.isAfterburnerBefore = this.isAfterburner;
    },

    //被弾処理
    damage: function() {
        //無敵時間中はスルー
        if (this.timeMuteki > 0 || this.parentScene.bombTime > 0 || this.parentScene.timeVanish > 0) return false;

        //オートボム発動
        if (app.setting.autoBomb && app.setting.bombStock > 0) {
            this.parentScene.enterBomb();
            return true;
        }

        //被弾エフェクト表示
        var layer = this.parentScene.effectLayerUpper;
        layer.enterExplodePlayer({position: {x: this.x, y: this.y}});

        app.playSE("playermiss");
        this.parentScene.missCount++;
        this.parentScene.stageMissCount++;

        this.isDead = true;
        app.setting.zanki--;
        if (app.setting.zanki > 0) {
            this.startup();
        } else {
            this.shotON = false;
            this.visible = false;
            this.isCollision = false;
            this.isControl = false;
            this.parentScene.isGameOver = true;
        }

        return true;
    },

    //ショット発射
    enterShot: function() {
        //自機から
        var ly = this.parentScene.shotLayer;
        ly.enterShot(this.x+10, this.y-8, {type: 0, rotation: 1, power: this.shotPower});
        ly.enterShot(this.x   , this.y-16,{type: 0, rotation: 0, power: this.shotPower});
        ly.enterShot(this.x-10, this.y-8, {type: 0, rotation:-1, power: this.shotPower});
        return this;
    },

    //ビット展開
    openBit: function(type) {
        var color = 0;
        switch (type) {
            case 0:
                //赤（前方集中型）
                this.bits[0].tweener.clear().to({ x:  5, y:-32, rotation: 2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy(-30,0,30,"easeInOutSine").moveBy( 30,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[0]));
                this.bits[1].tweener.clear().to({ x: -5, y:-32, rotation:-2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy( 30,0,30,"easeInOutSine").moveBy(-30,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[1]));
                this.bits[2].tweener.clear().to({ x: 15, y:-24, rotation: 2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy(-40,0,30,"easeInOutSine").moveBy( 40,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[2]));
                this.bits[3].tweener.clear().to({ x:-15, y:-24, rotation:-2, alpha:1}, 15).call(function(){this.tweener.clear().moveBy( 40,0,30,"easeInOutSine").moveBy(-40,0,30,"easeInOutSine").setLoop(true);}.bind(this.bits[3]));
                color = 0;
                break;
            case 1:
                //緑（方向変更型）
                this.bits[0].tweener.clear().to({ x: 35, y:0, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-35, y:0, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 10, y:30, rotation:0, alpha:1}, 15).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-10, y:30, rotation:0, alpha:1}, 15).setLoop(false);
                color = 80;
                break;
            case 2:
                //青（広範囲型）
                this.bits[0].tweener.clear().to({ x: 30, y:16, rotation:  5, alpha:1}, 15).setLoop(false);
                this.bits[1].tweener.clear().to({ x:-30, y:16, rotation: -5, alpha:1}, 15).setLoop(false);
                this.bits[2].tweener.clear().to({ x: 50, y:24, rotation: 10, alpha:1}, 15).setLoop(false);
                this.bits[3].tweener.clear().to({ x:-50, y:24, rotation:-10, alpha:1}, 15).setLoop(false);
                color = 200;
                break;
            default:
                //クローズ
                this.bits[0].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[1].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[2].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                this.bits[3].tweener.clear().to({ x:0, y: 0, alpha:0}, 15);
                color = 60;
                break;
        }
        return this;
    },

    //プレイヤー投入時演出
    startup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .wait(120)
            .call(function(){
                this.parentScene.timeVanish = 180;
                app.setting.bombStock = app.setting.bombStockMax;
            }.bind(this))
            .to({x: SC_W*0.5, y: SC_H*0.8}, 120, "easeOutQuint")
            .call(function(){
                this.shotON = true;
                this.isControl = true;
                this.isShotOK = true;
                this.isCollision = true;
                this.timeMuteki = 120;
            }.bind(this));

        this.isDead = false;
        this.shotON = false;
        this.isControl = false;
        this.isCollision = false;
        return this;
    },

    //ステージ開始時演出
    stageStartup: function() {
        this.x = SC_W/2;
        this.y = SC_H+128;
        this.tweener.clear()
            .to({x: SC_W/2, y: SC_H/2+32}, 90, "easeOutCubic")
            .to({x: SC_W/2, y: SC_H-64  }, 120)
            .call(function(){
                this.shotON = true;
                this.isControl = true;
                this.isShotOK = true;
                this.isCollision = true;
                this.timeMuteki = 120;
            }.bind(this));

        this.isDead = false;
        this.shotON = false;
        this.isControl = false;
        this.isCollision = false;
        return this;
    },

    //機影追加
    addShadow: function() {
        var that = this;
        this.shadow = phina.display.Sprite("gunshipBlack", 48, 48);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameIndex(4).setScale(0.66);
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            if (!ground.isShadow) {
                this.visible = false;
                return;
            } else {
                this.visible = true;
            }

            this.rotation = that.rotation;
            this.x = that.x + ground.shadowX;
            this.y = that.y + ground.shadowY;
            this.scaleX = ground.scaleX*0.66;
            this.scaleY = ground.scaleY*0.66;
            this.frameIndex = that.sprite.frameIndex;
            this.visible = that.visible;
        }

        //ビットの影
        for (var i = 0; i < 4; i++) {
            var b = this.bits[i];
            b.parentScene = this.parentScene;
            b.addShadow();
        }
        return this;
    },

    //アイテム取得
    getItem: function(kind) {
        switch(kind) {
            case ITEM_POWER:
                app.playSE("powerup");
                break;
            case ITEM_BOMB:
                app.playSE("powerup");
                app.setting.bombStock++;
                if (app.setting.bombStock > app.setting.bombStockMax) app.setting.bombStockMax = app.setting.bombStock;
                break;
            case ITEM_1UP:
                app.playSE("powerup");
                app.setting.zanki++;
                if (app.setting.zanki > 9) app.setting.zanki = 9;
                break;
        }
    },
});

/*
 *  playerbit.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("PlayerBit", {
    superClass: "phina.display.Sprite",

    _member: {
        layer: LAYER_PLAYER,
        id: 0,
        active: false,
    },

    init: function(id) {
        this.superInit("bit", 32, 32);
        this.$extend(this._member);

        this.setScale(0.5);
        this.index = 0;
        this.id = id;

        this.alpha = 1;

        this.beforeX = 0;
        this.beforeY = 0;

        this.on('removed', function() {
            if (this.shadow) this.shadow.remove();
        }.bind(this));

        this.time = 0;
    },

    update: function(app) {
        if (this.time % 2 == 0) {
            if (this.id % 2 == 0) {
                this.index--;
                if (this.index < 0) this.index = 8;
            } else {
                this.index = (this.index+1)%9;
            }
            this.setFrameIndex(this.index);
        }
        var player = this.parent;
        if (player.shotON) {
            if (this.time % player.shotInterval == 0) {
                var x = this.x + player.x;
                var y = this.y + player.y;
                var sl = player.parentScene.shotLayer;
                sl.enterShot(x, y-4, {type: 1, rotation: this.rotation, power: player.shotPower});
            }
        }

        if (player.type == 1) {
            this.rotation = Math.clamp(player.rollcount-50, -25, 25);
            if (-4 < this.rotation && this.rotation < 4) this.rotation = 0;
        }
        this.time++;
    },

    addShadow: function() {
        var that = this;
        this.shadow = phina.display.Sprite("bitBlack", 32, 32);
        this.shadow.layer = LAYER_SHADOW;
        this.shadow.alpha = 0.5;
        this.shadow.addChildTo(this.parentScene);
        this.shadow.setFrameIndex(0).setScale(0.5);
        this.shadow.update = function(e) {
            var ground = that.parentScene.ground;
            if (!ground.isShadow) {
                this.visible = false;
                return;
            } else {
                this.visible = true;
            }

            this.rotation = that.rotation;
            this.x = that.x + that.parent.x + ground.shadowX;
            this.y = that.y + that.parent.y + ground.shadowY;
            this.scaleX = ground.scaleX*0.5;
            this.scaleY = ground.scaleY*0.5;
            this.frameIndex = that.frameIndex;
            this.visible = that.parent.visible;
        }
        return this;
    },
});

/*
 *  playerpointer.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

//プレイヤー操作用ポインタ
phina.define("PlayerPointer", {
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
        if (this.player.isControl && p.getPointing()) {
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

/*
 *  shot.js
 *  2015/10/09
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.namespace(function() {

var checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT_MIDDLE, LAYER_OBJECT_LOWER];

phina.define("Shot", {
    superClass: "phina.display.DisplayElement",

    DEFAULT_PARAM: {
        type: 0,
        rotation: 0,
        power: 10,
        velocity: 15,
    },

    time: 0,

    init: function() {
        this.superInit();
        this.boundingType = "circle";
        this.radius = 6

        this.sprite = phina.display.Sprite("shot", 16, 32).addChildTo(this);
        this.sprite.frameIndex = 0;
        this.sprite.alpha = 0.8;
        this.sprite.blendMode = "lighter";

        this.on("enterframe", function(){
            this.x += this.vx;
            this.y += this.vy;

            if (this.x<-16 || this.x>SC_W+16 || this.y<-16 || this.y>SC_H+16) {
                this.remove();
                return;
            }

            //敵との当り判定チェック
            if (this.time % 2) {
                var parentScene = this.shotLayer.parentScene;
                for (var i = 0; i < 3; i++) {
                    var layer = parentScene.layers[checkLayers[i]];
                    layer.children.each(function(a) {
                        if (a === app.player) return;
                        if (this.parent && a.isCollision && a.isHitElement(this)) {
                            a.damage(this.power);
                            this.vanish();
                            this.remove();
                            return;
                        }
                    }.bind(this));
                }
            }
            this.time++;
        });

        //リムーブ時
        this.on("removed", function(){
            this.shotLayer.pool.push(this);
        }.bind(this));
    },

    setup: function(param) {
        param.$safe(this.DEFAULT_PARAM);
        if (param.type == 0) {
            this.sprite.frameIndex = 0;
            this.sprite.setScale(2);
        } else {
            this.sprite.frameIndex = 1;
            this.sprite.setScale(1.5, 1.0);
        }

        this.rotation = param.rotation;
        this.velocity = param.velocity;
        this.power = param.power;

        var rot = param.rotation-90;
        this.vx = Math.cos(rot*toRad)*this.velocity;
        this.vy = Math.sin(rot*toRad)*this.velocity;

        //当り判定設定
        if (param.type == 0) {
            this.radius = 8;
        } else {
            this.radius = 16;
        }

        this.beforeX = this.x;
        this.beforeY = this.y;

        return this;
    },

    vanish: function() {
        var ground = this.shotLayer.parentScene.ground;
        var layer = this.shotLayer.parentScene.effectLayerUpper;
        layer.enterShotImpact({
            position:{x: this.x, y: this.y},
        });
        Effect.enterDebris(layer, {
            num: 2,
            position:{x: this.x, y: this.y},
            velocity: {x: ground.deltaX, y: ground.deltaY, decay: 0.9},
        });
    },
});

});

/*
 *  shotlayer.js
 *  2015/11/17
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("ShotLayer", {
    superClass: "phina.display.DisplayElement",

    _member: {
        max: 64,
        pool : null,
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        var self = this;
        this.pool = Array.range(0, this.max).map(function() {
            var b = Shot();
            b.shotLayer = self;
            return b;
        });
    },

    //弾投入
    enterShot: function(x, y, option) {
        var b = this.pool.shift();
        if (!b) {
            console.warn("Shot empty!!");
            return null;
        }
        b.setup(option).addChildTo(this).setPosition(x, y);
        return b;
    },

    //弾を消去
    erace: function() {
        for (var i = 0; i < len; i++) {
            b = list[i];
            b.erase();
            b.remove();
        }
    },
});

/*
 *  continuescene.js
 *  2016/03/29
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("ContinueScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        labelParam: {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "center",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        },
    },

    init: function(currentScene) {
        this.superInit();
        this.$extend(this._member);

        this.currentScene = currentScene;
        this.yes = true;

        //バックグラウンド
        var param = {
            width:SC_W*0.6,
            height:SC_H*0.3,
            fill: "rgba(0,0,0,0.7)",
            stroke: "rgba(0,0,0,0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //選択カーソル
        var param2 = {
            width:SC_W*0.15,
            height:SC_H*0.1,
            fill: "rgba(0,200,200,0.5)",
            stroke: "rgba(0,200,200,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55)

        //タッチ用カーソル
        var that = this;
        this.cursol1 = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55)
            .setInteractive(true);
        this.cursol1.alpha = 0;
        this.cursol1.onpointend = function() {
            if (that.yes) {
                that.gotoContinue();
            } else {
                that.cursol.tweener.clear().moveTo(SC_W*0.4, SC_H*0.55, 200, "easeOutCubic");
                that.yes = true;
                app.playSE("select");
            }
        }
        this.cursol2 = phina.display.RectangleShape(param2)
            .addChildTo(this)
            .setPosition(SC_W*0.6, SC_H*0.55)
            .setInteractive(true);
        this.cursol2.alpha = 0;
        this.cursol2.onpointend = function() {
            if (!that.yes) {
                that.gotoGameover();
            } else {
                that.cursol.tweener.clear().moveTo(SC_W*0.6, SC_H*0.55, 200, "easeOutCubic");
                that.yes = false;
                app.playSE("select");
            }
        }

        //コンティニュー表示
        phina.display.Label({text: "CONTINUE?"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.40);

        this.lyes = phina.display.Label({text: "YES"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.4, SC_H*0.55);
        this.lyes.blink = false;
        this.lyes.update = function(e) {
            if (this.blink && e.ticker.frame % 10 == 0) this.visible = !this.visible;
        }

        this.lno = phina.display.Label({text: "NO"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.6, SC_H*0.55);
        this.lno.blink = false;
        this.lno.update = function(e) {
            if (this.blink && e.ticker.frame % 10 == 0) this.visible = !this.visible;
        }

        //カウンタ表示
        this.counter = phina.display.Label({text: "9", fontSize: 30}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.45);
        this.counter.count = 9;
        this.counter.tweener.clear().wait(1000).call(function() {this.count--;}.bind(this.counter)).setLoop(true);
        this.counter.update = function() {
            this.text = ""+this.count;
            if (this.count < 0) {
                that.currentScene.flare("gameover");
                app.popScene();
            }
        }

        this.isSelected = false;
        this.time = 0;        
    },

    update: function() {
        if (this.isSelected) return;

        //キーボード操作
        var ct = app.controller;
        if (ct.left) {
            if (!this.yes) {
                this.cursol.tweener.clear()
                    .moveTo(SC_W*0.4, SC_H*0.55, 200, "easeOutCubic");
                this.yes = true;
                app.playSE("select");
            }
        }
        if (ct.right) {
            if (this.yes) {
                this.cursol.tweener.clear()
                    .moveTo(SC_W*0.6, SC_H*0.55, 200, "easeOutCubic");
                this.yes = false;
                app.playSE("select");
            }
        }
        if (this.time > 30) {
            if (ct.ok) {
                this.isSelected = true;
                app.playSE("click");
                if (this.yes) { 
                    this.gotoContinue();
                } else {
                    this.gotoGameover();
                }
            }
        }
        this.time++;
    },

    gotoContinue: function() {
        this.lyes.blink = true;
        this.currentScene.flare("continue");
        this.tweener.clear().wait(1000).call(function() {
            app.popScene();
        });
    },
    gotoGameover: function() {
        this.lno.blink = true;
        this.currentScene.flare("gameover");
        app.popScene();
    },
});


/*
 *  GameOverScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("GameOverScene", {
    superClass: "phina.display.DisplayScene",
    
    _member: {
        //ラベル用パラメータ
        titleParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: false,
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        phina.display.Label({text: "GAME OVER"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(30);

        //ＢＧＭ終了時にシーンを抜ける
        app.playBGM("gameover", false, function() {
            this.exit();
        }.bind(this));

        this.time = 0;
    },

    update: function(app) {
        //キーボード操作
        var ct = app.controller;
        if (this.time > 30) {
            if (ct.ok || ct.cancel) {
                app.stopBGM();
                this.exit();
            }
        }
        this.time++;
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
        if (this.time > 30) {
            app.stopBGM();
            this.exit();
        }
    },
});

/*
 *  LoadingScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

//アセットロード用シーン
phina.define("LoadingScene", {
    superClass: "phina.display.DisplayScene",

    init: function(options) {
        options.assetType = options.assetType || "common";
        options = (options||{}).$safe({
            asset: Application.assets[options.assetType],
            width: SC_W,
            height: SC_H,
            lie: false,
            exitType: "auto",
        });
        this.superInit(options);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //ロードする物が無い場合スキップ
        this.forceExit = false;
        var asset = options.asset;
        if (!asset.$has("sound") && !asset.$has("image") && !asset.$has("font") && !asset.$has("spritesheet") && !asset.$has("script")) {
            this.forceExit = true;
            return;
        }

        var labelParam = {
            text: "Loading",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 30
        };
        phina.display.Label(labelParam)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.fromJSON({
            children: {
                gauge: {
                    className: 'phina.ui.Gauge',
                    arguments: {
                        value: 0,
                        width: this.width*0.5,
                        height: 5,
                        color: 'black',
                        stroke: false,
                        gaugeColor: 'blue',
                        padding: 0,
                    },
                    x: this.gridX.center(),
                    y: SC_H*0.5+20,
                    originY: 0,
                }
            }
        });
        this.gauge.update = function(e) {
            this.gaugeColor = 'hsla({0}, 100%, 50%, 0.8)'.format(e.ticker.frame*3);
        }

        var loader = phina.asset.AssetLoader();
        if (options.lie) {
            this.gauge.animationTime = 10*1000;
            this.gauge.value = 90;
            loader.onload = function() {
                this.gauge.animationTime = 1*1000;
                this.gauge.value = 100;
            }.bind(this);
        } else {
            loader.onprogress = function(e) {
                this.gauge.value = e.progress*100;
            }.bind(this);
        }
        this.gauge.onfull = function() {
            if (options.exitType === 'auto') {
                this.app._onLoadAssets();
                this.exit();
            }
        }.bind(this);

        loader.load(options.asset);
    },
    update: function() {
        if (this.forceExit) this.exit();
    },    
});

/*
 *  MainScene.js
 *  2015/09/08
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("MainScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //シーン内設定
        bombTime: 0,    //ボム効果継続残りフレーム数
        timeVanish: 0,  //弾消し時間

        //現在ステージＩＤ
        stageId: 1,
        maxStageId: 2,

        //プラクティスモードフラグ
        isPractice: false,

        //ステージクリアフラグ
        isStageClear: false,

        //ゲームオーバーフラグ
        isGameOver: false,

        //ボス戦闘中フラグ
        isBossBattle: false,
        bossObject: null,

        //各種判定用
        missCount: 0,       //プレイヤー総ミス回数
        stageMissCount: 0,  //プレイヤーステージ内ミス回数

        //敵関連        
        enemyCount: 0,  //敵総数
        enemyKill: 0,   //敵破壊数
        enemyID: 0,     //敵識別子

        //ラベル用パラメータ
        labelParam: {
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 32,
            fontWeight: ''
        },
        scorelabelParam: {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "UbuntuMono",
            align: "left",
            baseline: "middle",
            fontSize: 20,
            fontWeight: ''
        },
    },

    init: function(option) {
        this.superInit();
        this.$extend(this._member);

        option = (option || {}).$safe({stageId: 1});
        this.stageId = option.stageId;
        this.isPractice = (option.isPractice == undefined)? false: option.isPractice;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //エフェクトプール
        var effectPool = EffectPool(2048, this);

        //プレイヤー情報初期化
        app.score = 0;
        app.rank = 1
        app.numContinue = 0;
        app.setting.$extend(app.currentrySetting);

        //レイヤー準備
        this.base = phina.display.DisplayElement().addChildTo(this).setPosition(SC_OFFSET_X, 0);
        this.layers = [];
        for (var i = 0; i < LAYER_SYSTEM+1; i++) {
            switch (i) {
                case LAYER_BULLET:
                    this.layers[i] = BulletLayer().addChildTo(this.base);
                    this.bulletLayer = this.layers[i];
                    break;
                case LAYER_SHOT:
                    this.layers[i] = ShotLayer().addChildTo(this.base);
                    this.shotLayer = this.layers[i];
                    break;
                case LAYER_EFFECT_UPPER:
                    this.layers[i] = EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerUpper = this.layers[i];
                    break;
                case LAYER_EFFECT_MIDDLE:
                    this.layers[i] = EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerMiddle = this.layers[i];
                    break;
                case LAYER_EFFECT_LOWER:
                    this.layers[i] = EffectLayer(effectPool).addChildTo(this.base);
                    this.effectLayerLower = this.layers[i];
                    break;
                case LAYER_SHADOW:
                    this.layers[i] = phina.display.DisplayElement().addChildTo(this.base);
                    //地形と影レイヤーのみ目隠し
                    this.groundMask = phina.display.RectangleShape(param)
                        .addChildTo(this.base)
                        .setPosition(SC_W*0.5, SC_H*0.5);
                    this.groundMask.tweener.setUpdateType('fps');
                    this.groundMask.tweener.clear().fadeOut(20);
                    break;
                default:
                    this.layers[i] = phina.display.DisplayElement().addChildTo(this.base);
            }
            this.layers[i].parentScene = this;
        }

        //プレイヤー準備
        var player = this.player = Player()
            .addChildTo(this)
            .addShadow()
            .setPosition(SC_W*0.5, SC_H*0.5)
            .stageStartup();
        player.shotLayer = this.shotLayer;
        app.player = this.player;

//        this.pointer = PlayerPointer().addChildTo(this);
//        this.pointer.player = this.player;

        //弾幕設定クラス
        BulletConfig.setup(player, this.bulletLayer);

        //システム表示ベース
        this.systemBase = phina.display.DisplayElement().addChildTo(this.base);

        //ボス耐久力ゲージ
        var gaugeStyle = {
            width: SC_W*0.9,
            height: 10,
            style: {
                fill: 'rgba(0, 0, 200, 1.0)',
                empty: 'rgba(0, 0, 0, 0.0)',
                stroke: 'rgba(255, 255, 255, 1.0)',
                strokeWidth: 1,
            },
        }
        this.bossGauge = phina.extension.Gauge(gaugeStyle)
            .setPosition(SC_W*0.5, -10)
            .addChildTo(this.systemBase);

        //スコア表示
        var that = this;
        this.scoreLabel = phina.display.Label({text:"SCORE:"}.$safe(this.scorelabelParam))
            .addChildTo(this.systemBase)
            .setPosition(10, 10);
        this.scoreLabel.score = 0;
        this.scoreLabel.s = 0;
        this.scoreLabel.update = function(e) {
            if (e.ticker.frame%10 == 0) {
                this.s = ~~((app.score-this.score)/7);
                if (this.s < 3) this.s = 3;
                if (this.s > 7777) this.s = 7777;
            }
            this.score += this.s;
            if (this.score > app.score) this.score = app.score;

            this.text = "SCORE "+this.score.comma();
        }

        //ランク表示
        this.rankLabel = phina.display.Label({text:"RANK:"}.$safe(this.scorelabelParam))
            .addChildTo(this.systemBase)
            .setPosition(10, 30);
        this.rankLabel.update = function() {
            this.text = "RANK "+app.rank;
        };

        //残機表示
        for (var i = 0; i < 9; i++) {
            var s = this.sprite = phina.display.Sprite("gunship", 48, 48)
                .addChildTo(this.systemBase)
                .setFrameIndex(4)
                .setScale(0.3)
                .setPosition(i*16+16, 48);
            s.num = i;
            s.visible = false;
            s.update = function() {
                if (app.setting.zanki-1 > this.num) this.visible = true; else this.visible = false;
            }
        }

        //残ボム表示
        for (var i = 0; i < 9; i++) {
            var s = this.sprite = phina.display.Sprite("bomb", 96, 96)
                .addChildTo(this.systemBase)
                .setFrameIndex(0)
                .setScale(0.16)
                .setPosition(i*16+16, 64);
            s.num = i;
            s.visible = false;
            s.update = function() {
                if (app.setting.bombStockMax > this.num) {
                    this.visible = true;
                    if (app.setting.bombStock > this.num) {
                        this.alpha = 1.0;
                    } else {
                        this.alpha = 0.4;
                    }
                } else {
                    this.visible = false;
                }
            }
            var lparam = {
                text: "B",
                fill: "blue",
                stroke: "black",
                strokeWidth: 2,
                fontFamily: "Orbitron",
                align: "center",
                baseline: "middle",
                fontSize: 32,
                fontWeight: ''
            };
            phina.display.Label(lparam).addChildTo(s).setScale(2.5);
        }

        //ボムボタン
        this.buttonBomb = phina.extension.CircleButton({radius: 16})
            .addChildTo(this.systemBase)
            .setPosition(20, SC_H*0.9);

        //目隠し（黒）
        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.mask.tweener.setUpdateType('fps');
        this.mask.tweener.clear().fadeOut(20);

        //目隠し（白）
        this.maskWhite = phina.display.RectangleShape(param.$extend({fill: "white"}))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);
        this.maskWhite.tweener.setUpdateType('fps');
        this.maskWhite.alpha = 0.0;

        //ステージ初期化
        this.initStage();

        //イベント処理
        //ボス戦開始
        this.on('start_boss', function() {
            this.isBossBattle = true;
            this.systemBase.tweener.clear().to({y: 20}, 1000);
        }.bind(this));

        //ボス撃破
        this.on('end_boss', function() {
            this.isBossBattle = false;
            this.systemBase.tweener.clear().to({y: 0}, 1000);

            //ボスタイプ判定
            if (this.bossObject.type == ENEMY_MBOSS) {
                //中ボスの場合早回し
                var time = this.stage.getNextEventTime(this.time);
                if (time > 0) this.time = time-1;
            } else {
                //ステージボスの場合ステージクリア
                this.flare('stageclear');
            }
            this.bossObject = null;
        }.bind(this));

        //ステージクリア
        this.on('stageclear', function() {
            //プレイヤショットオフ・当たり判定無し
            this.player.isShotOK  = false;
            this.player.isCollision  = false;

            //１０秒後にリザルト処理
            phina.app.Object2D().addChildTo(this)
                .tweener.clear()
                .wait(10000)
                .call(function() {
                    this.result();
                }.bind(this));
        }.bind(this));

        //コンティニュー時
        this.on("continue", function() {
            app.numContinue++;

            //初期状態へ戻す
            app.score = 0;
            app.rank = 1;
            app.setting.zanki = app.currentrySetting.zanki;
            app.setting.bombStock = app.setting.bombStockMax;

            this.player.visible = true;
            this.player.startup();
            this.scoreLabel.score = 0;
        }.bind(this));

        //ゲームオーバー時
        this.on("gameover", function() {
            app.stopBGM();
            if (this.isPractice) {
                this.exit("menu");
            } else {
                this.exit("gameover");
            }
        }.bind(this));
    },
    
    update: function(app) {
        //ステージ進行
        var event = this.stage.get(this.time);
        if (event) {
            if (typeof(event.value) === 'function') {
                event.value.call(this, event.option);
            } else {
                this.enterEnemyUnit(event.value);
            }
        }

        //マップオブジェクト判定
        if (this.mapObject) {
            var sx = SC_W*0.5;
            var sy = SC_H*0.2;
            var x = this.ground.mapBase.x;
            var y = this.ground.mapBase.y;
            var len = this.mapObject.objects.length;
            for (var i = 0; i < len; i++) {
                var obj = this.mapObject.objects[i];
                if (!obj.executed) {
                    //範囲内にあるか判定
                    var dx = x + obj.x;
                    var dy = y + obj.y;
                    if (-sx < dx && dx < SC_W+sx && -sy < dy && dy < SC_H+sy) {
                        //敵キャラクタ投入
                        if (obj.type == "enemy") {
                            if (enemyUnit[obj.name]) {
                                //小隊投入
                                this.enterEnemyUnit(obj.name, obj.properties);
                            } else {
                                //単体投入
                                if (obj.properties.$has("offsetx")) dx += obj.properties.offsetx;
                                if (obj.properties.$has("offsety")) dy += obj.properties.offsety;
                                this.enterEnemy(obj.name, dx, dy, obj.properties);
                            }
                        }
                        //イベント処理
                        if (obj.type == "event") {
                            var event = this.stage.getEvent(obj.name);
                            if (typeof(event.value) === 'function') {
                                event.value.call(this, obj.properties);
                            }
                        }
                        obj.executed = true;
                    }
                }
            }
        }

        //ボム効果
        if (this.bombTime > 0) {
            this.bombTime--;
            this.eraseBullet();
            this.addEnemyDamage(10);
        }

        //弾消し
        if (this.timeVanish > 0) {
            this.timeVanish--;
            this.eraseBullet();
        }

        //ゲームオーバー処理
        if (this.isGameOver) {
            this.isGameOver = false;
            this.player.isControl = false;
            var cos = ContinueScene(this);
            phina.app.Object2D().addChildTo(this).tweener.clear()
                .wait(2000)
                .call( function() {
                    app.pushScene(cos);
                });
        }

        //ボス体力ゲージ設定
        if (this.bossObject) {
            this.bossGauge.setValue(this.bossObject.def);
        }

        //エクステンドチェック
        var extendScore = app.extendScore[app.extendAdvance];
        if (app.isExtendEvery) {
            extendScore = app.extendEveryScore * (app.extendAdvance + 1);
        }
        if (extendScore != undefined) {
            if (app.score > extendScore) {
                app.extendAdvance++;
                app.setting.zanki++;
            }
        }

        var ct = app.controller;
        var kb = app.keyboard;
        if (app.keyboard.getKey("V")) {
            this.eraseBullet();
        }
        if (app.keyboard.getKey("D")) {
            this.bulletDomination();
        }

        if (app.keyboard.getKeyUp("P") || app.keyboard.getKey("escape") || ct.start) {
            app.pushScene(PauseScene());
        }

        this.time++;
    },

    //ステージ初期化
    initStage: function() {
        if (this.ground) {
            this.ground.remove();
            this.ground = null;
        }
        if (this.stage) this.stage = null;
        if (this.mapObject) this.mapObject = null;

        //ステージ進行と背景追加
        switch (this.stageId) {
            case 1:
                this.stage = Stage1(this, this.player);
                this.ground = Stage1Ground().addChildTo(this);
                break;
            case 2:
                this.stage = Stage2(this, this.player);
                this.ground = Stage2Ground().addChildTo(this);
                break;
            case 3:
                this.stage = Stage3(this, this.player);
                this.ground = Stage3Ground().addChildTo(this);
                break;
            case 9:
                //テスト用ステージ
                this.stage = Stage9(this, this.player);
//                this.mapObject = phina.asset.AssetManager.get('tmx', "map1_enemy").getObjectGroup("EnemyLayer")[0];
                this.ground = Stage9Ground().addChildTo(this);
                break;
        }

        this.time = 0;
        this.timeVanish = 0;
        this.enemyCount = 0;
        this.enemyKill = 0;
        this.enemyID = 0;
        this.stageMissCount = 0;

        //地形消去用マスク
        this.groundMask.tweener.clear().fadeOut(20);

        //ステージ番号表示
        var param = {text: "STAGE "+this.stageId, fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontWeight: 600, outlineWidth: 2};
        var m1 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        m1.alpha = 0;
        m1.tweener.setUpdateType('fps');
        m1.tweener.wait(30).fadeIn(15).wait(171).fadeOut(15).call(function(){this.remove()}.bind(m1));

        //ステージ名表示
        var name = Application.stageName[this.stageId] || "Practice";
        var param = {text: "_", fill:"white", fontFamily: "Orbitron", align: "center", baseline: "middle", fontSize: 16, fontWeight: 200, outlineWidth: 2};
        var m2 = phina.display.Label(param, 50)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.55)
        m2.alpha = 0;
        m2.col = 0;
        m2.max = name.length;
        m2.tweener.setUpdateType('fps');
        m2.tweener
            .wait(30)
            .fadeIn(6)
            .to({col: m2.max}, 60)
            .wait(120)
            .fadeOut(15)
            .call(function(){this.remove()}.bind(m2));
        m2.update = function() {
            this.text = name.substring(0, ~~this.col)+"_";
        }
    },

    result: function() {
        var endResult = false;
        var loadcomplete = false;
        var loadprogress = 0;

        //次ステージのアセットをバックグラウンドで読み込み
        if (!this.isPractice && this.stageId < this.maxStageId) {
            var assetName = "stage"+(this.stageId+1);
            var assets = Application.assets[assetName];
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                loadcomplete = true;
                app._onLoadAssets();
            }.bind(this));
            loader.onprogress = function(e) {
                loadprogress = e.progress;
            }.bind(this);
        } else {
            loadcomplete = true;
            loadprogress = 1;
        }

        var labelParam = {
            fill: "white",
            stroke: "black",
            strokeWidth: 1,

            fontFamily: "Orbitron",
            align: "left",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        };

        //クリア時ＢＧＭ
        app.playBGM("stageclear");

        //地形消去用マスク
        this.groundMask.tweener.clear().fadeIn(300);

        var that = this;

        var base = phina.display.DisplayElement()
            .addChildTo(this)
            .setPosition(SC_W*1.5, 0);
        base.update = function() {
        };
        base.tweener.clear()
            .to({x: 0}, 500,"easeOutSine")
            .wait(5000)
            .call(function() {
                endResult = true;
            }.bind(base));
        base.ok = false;
        base.update = function() {
            //入力を待って次ステージに移行
            if (endResult && loadcomplete) {
                var ct = app.controller;
                if (ct.ok || ct.cancel) this.ok = true;

                var p = app.mouse;
                if (p.getPointing()) this.ok = true;
            }

            if (this.ok) {
                that.stageClear();
                this.remove();
            }
        }

        //ステージ番号表示
        var text1 = "STAGE "+this.stageId+" CLEAR";
        var res1 = phina.display.Label({text: text1, align: "center", fontSize: 25}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.5, SC_H*0.25);

        //ステージクリアボーナス表示
        var bonusClear = this.stageId*100000;
        var res2 = phina.display.Label({text: ""}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.1, SC_H*0.4);
        res2.score = 0;
        res2.scorePlus = Math.floor(bonusClear/60);
        res2.time = 0;
        res2.update = function() {
            this.text = "CLEAR BONUS: "+this.score.comma();
            if (this.time == 60) app.score += bonusClear;
            if (this.time > 60) {
                this.score += this.scorePlus;
                if (this.score > bonusClear) this.score = bonusClear;
            }
            this.time++;
        }

        //ヒット数ボーナス表示
        var bonusHit = this.enemyKill*100;
        var res3 = phina.display.Label({text: ""}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.1, SC_H*0.5);
        res3.score = 0;
        res3.scorePlus = Math.floor(bonusHit/60);
        res3.time = 0;
        res3.update = function() {
            this.text = "HIT BONUS: "+this.score.comma();
            if (this.time == 90) app.score += bonusHit;
            if (this.time > 90) {
                this.score += this.scorePlus;
                if (this.score > bonusHit) this.score = bonusHit;
            }
            this.time++;
        }

        //ノーミスクリアボーナス表示
        if (this.stageMissCount == 0) {
            var bonusNomiss = 100000;
            var res4 = phina.display.Label({text: ""}.$safe(labelParam))
                .addChildTo(base)
                .setPosition(SC_W*0.1, SC_H*0.6);
            res4.score = 0;
            res4.scorePlus = Math.floor(bonusNomiss/60);
            res4.time = 0;
            res4.update = function() {
                this.text = "NO MISS BONUS: "+this.score.comma();
                if (this.time == 120) app.score += bonusNomiss;
                if (this.time > 120) {
                    this.score += this.scorePlus;
                    if (this.score > bonusNomiss) this.score = bonusNomiss;
                }
                this.time++;
            }
        }

        //ロード進捗表示
        var progress = phina.display.Label({text: "", align: "right", fontSize: 10}.$safe(labelParam))
            .addChildTo(base)
            .setPosition(SC_W*0.95, SC_H*0.95);
        progress.time = 0;
        progress.update = function() {
            this.text = "Loading... "+Math.floor(loadprogress*100)+"%";
            if (loadprogress == 1) {
                if (endResult) {
                    this.text = "TAP or TRIGGER to next stage";
                } else {
                    this.text = "Please wait...";
                }
            }
            if (this.time % 30 == 0) this.visible = !this.visible;
            this.time++;
        }
    },

    //ステージクリア処理
    stageClear: function() {
        //プラクティス時タイトルへ戻る
        if (this.isPractice) {
            app.stopBGM();
            this.exit("menu");
        }
        if (this.stageId < this.maxStageId) {
            //次のステージへ
            this.stageId++;
            this.initStage();
        } else {
            //オールクリア
            this.mask.tweener.clear()
                .fadeIn(60)
                .wait(60)
                .call(function() {
                    this.flare('gameover');
                }.bind(this));
        }
    },

    //敵ユニット単位の投入
    enterEnemyUnit: function(name, option) {
        var unit = enemyUnit[name];
        if (unit === undefined){
            console.warn("Undefined unit: "+name);
            return false;
        }

        var len = unit.length;
        for (var i = 0; i < len; i++) {
            var e = unit[i];
            var en = Enemy(e.name, e.x, e.y, this.enemyID, e.param).addChildTo(this);
            if (en.data.type == ENEMY_BOSS || en.data.type == ENEMY_MBOSS) {
                this.bossGauge.setMax(en.defMax).setValue(en.defMax);
                this.bossObject = en;
                this.flare('start_boss');
            }
            this.enemyID++;
            this.enemyCount++;
        }
        return true;
    },

    //敵単体の投入
    enterEnemy: function(name, x, y, param) {
        this.enemyID++;
        this.enemyCount++;
        return Enemy(name, x, y, this.enemyID-1, param).addChildTo(this);
    },

    //ボム投入
    enterBomb: function() {
        if (this.bombTime > 0 || app.setting.bombStock < 1) return;
        this.bombTime = 90;
        app.setting.bombStock--;

        this.eraseBullet();
        var layer = this.effectLayerMiddle;
        var x = this.player.x;
        var y = this.player.y;
        Effect.enterBomb(layer, {position: {x: x, y: y}});

        this.addEnemyDamage(1000);
        app.playSE("bomb");
    },

    //敵に一律ダメージ付加
    addEnemyDamage: function(power) {
        var checkLayers = [LAYER_OBJECT_UPPER, LAYER_OBJECT_MIDDLE, LAYER_OBJECT_LOWER];

        //敵との当り判定チェック
        for (var i = 0; i < 3; i++) {
            var layer = this.layers[checkLayers[i]];
            layer.children.each(function(a) {
                if (a instanceof Enemy && a.isOnScreen) a.damage(power);
            }.bind(this));
        }
    },

    //敵弾一括消去
    eraseBullet: function() {
        this.bulletLayer.erase();
    },

    //弾幕撃ち返し
    bulletDomination: function() {
        var sl = this.shotLayer;
        this.bulletLayer.children.each(function(a) {
            var rot = Math.atan2(-a.vy, -a.vx)*toDeg+90;
            sl.enterShot(a.x, a.y, {type: 1, rotation: rot, power: 20, velocity: 5});
        });
        this.bulletLayer.erase();
    },

    //Warning表示
    enterWarning: function() {

        //警告音
        app.playBGM("warning", false);

        var style = {
            width: SC_W,
            height: SC_H*0.1,
            fill: "red",
            stroke: "red",
            strokeWidth: 1
        }
        var belt = phina.display.RectangleShape(style)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .addChildTo(this);
        var text = phina.display.Label({text: "WARNING", align: "center", fontFamily: "Orbitron"})
            .setPosition(0, 3)
            .addChildTo(belt);

        var param = {
            fill: "red",
            stroke: "red",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            fontSize: 16,
            fontWeight: ''
        };
        var text = "CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION CAUTION";
        caution1 = phina.display.Label({text: text}.$safe(param))
            .setPosition(SC_W*0.5, SC_H*-0.05-8)
            .addChildTo(belt);
        caution1.update = function() {
            this.x -= 1;
        }
        caution2 = phina.display.Label({text: text}.$safe(param))
            .setPosition(SC_W*0.5, SC_H*0.05+12)
            .addChildTo(belt);
        caution2.update = function() {
            this.x += 1;
        }

        belt.tweener.setUpdateType('fps');
        belt.tweener.clear()
            .wait(90).fadeOut(5).wait(24).fadeIn(1)
            .wait(90).fadeOut(5).wait(24).fadeIn(1)
            .wait(90).fadeOut(5).wait(24)
            .call(function(){
                caution1.x = 0;
                caution2.x = 0;
            })
            .call(function(){
                app.playBGM("boss", true);
                this.remove();
            }.bind(belt));
    },

    //タッチorクリック開始処理
    onpointstart: function(e) {
    },

    //タッチorクリック移動処理
    onpointmove: function(e) {
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
    },

    //addChildオーバーライド
    addChild: function(child) {
        if (child.layer === undefined) {
            return this.superClass.prototype.addChild.apply(this, arguments);
        }
        child.parentScene = this;
        return this.layers[child.layer].addChild(child);
    },
});

/*
 *  MenuDialog.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("MenuDialog", {
    superClass: "phina.display.DisplayElement",

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },
    defaultMenu: {
        x: SC_W*0.5,
        y: SC_H*0.5,
        width: SC_W,
        height: SC_H,
        title: "SETTING",
        item: ["GAME", "SYSTEM", "test", "EXIT"],
        description: ["menu1", "menu2", "test", "exit"],
    },

    //フォーカス
    isFocus: true,

    //選択メニューアイテム番号
    select: 0,

    init: function(menu) {
        this.superInit();
        menu = (menu||{}).$safe(this.defaultMenu);

        //バックグラウンド
        var paramBG = {
            width: menu.width,
            height: menu.height,
            fill: "rgba(0, 0, 0, 1)",
            stroke: "rgba(0, 0, 0, 1)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(paramBG)
            .addChildTo(this)
            .setPosition(menu.x, menu.y);
        this.bg.alpha = 0;
        this.bg.tweener.clear().to({alpha: 0.8}, 500, "easeOutCubic");

        this.frameBase = phina.display.DisplayElement().addChildTo(this);

        this.cursolBase = phina.display.DisplayElement().addChildTo(this);
        this.cursolBase.alpha = 0;
        this.cursolBase.tweener.wait(300).fadeIn(100);

        this.base = phina.display.DisplayElement().addChildTo(this);
        this.base.alpha = 0;

        //選択カーソル
        var paramCursol = {
            width:SC_W*0.85-10,
            height:SC_H*0.08,
            fill: "rgba(100,100,100,0.5)",
            stroke: "rgba(100,100,100,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.display.RectangleShape(paramCursol)
            .addChildTo(this.cursolBase)
            .setPosition(SC_W*0.5, SC_H*0.6-3);

        this.time = 0;
        this.cursolTime = 0;

        this.openMenu(menu);
    },

    update: function() {
        if (!this.isFocus) {
            this.time++;
            return;
        }

        //キーボード操作
        var ct = app.controller;
        if (this.time > 30 && this.cursolTime > 10) {
            if (ct.up) {
                this.cursol.sel--;
                if (this.cursol.sel < 0) {
                    this.cursol.sel = 0;
                } else {
                    var sel = this.cursol.sel;
                    this.cursol.tweener.clear()
                        .moveTo(SC_W*0.5, this.item[sel].y, 200, "easeOutCubic");
                    this.cursolTime = 0;
                    app.playSE("select");
                }
            }
            if (ct.down) {
                this.cursol.sel++;
                if (this.cursol.sel > this.menu.item.length-1) {
                    this.cursol.sel = this.menu.item.length-1;
                } else {
                    var sel = this.cursol.sel;
                    this.cursol.tweener.clear()
                        .moveTo(SC_W*0.5, this.item[sel].y, 200, "easeOutCubic");
                    this.cursolTime = 0;
                    app.playSE("select");
                }
            }
            var sel = this.cursol.sel;
            if (this.item[sel] instanceof Selector) {
                var item = this.item[sel];
                if (ct.left) {
                    item.dec();
                    this.cursolTime = 0;
                }
                if (ct.right) {
                    item.inc();
                    this.cursolTime = 0;
                }
            }
        }
        if (this.time > 60) {
            if (ct.ok) {
                this.decision(this.cursol.sel);
            }
            if (ct.cancel) {
                this.cancel();
            }
        }
        this.time++;
        this.cursolTime++;
    },

    openMenu: function(menu) {
        menu = (menu||{}).$safe(this.defaultMenu);
        this.menu = menu;

        //既存メニュー項目クリア
        this.clearMenu();

        //メニュー項目数
        var numMenuItem = menu.item.length;

        //フレーム
        var paramFR = {
            width:SC_W*0.87,
            height:SC_H*(numMenuItem*0.15)+SC_H*0.1,
            fill: "rgba(0, 0, 0, 0.7)",
            stroke: "rgba(255, 255, 255, 0.7)",
            backgroundColor: 'transparent',
        };

        this.frame = phina.extension.Frame(paramFR)
            .addChildTo(this.frameBase)
            .setPosition(SC_W*0.5, SC_H*0.5)
            .setScale(1.0, 0);
        this.frame.tweener.to({scaleY: 1}, 250, "easeOutCubic");
        this.base.tweener.wait(150).fadeIn(100);

        //初期位置
        var posY = SC_H*0.5-SC_H*(numMenuItem*0.05);

        //メニュータイトル
        this.title = phina.display.Label({text: menu.title}.$safe(this.labelParam))
            .addChildTo(this.base)
            .setPosition(SC_W*0.5, posY);

        //クリック用
        var paramCL = {
            width:SC_W*0.8,
            height:SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };

        //メニュー項目
        var that = this;
        this.item = [];
        this.click = [];
        for (var i = 0; i < numMenuItem; i++) {
            var y = posY+SC_H*0.1*i+SC_H*0.1;
            var item = menu.item[i];

            //通常メニュー項目
            if (typeof item == 'string') {
                this.item[i] = phina.display.Label({text: menu.item[i]}.$safe(this.labelParam))
                    .addChildTo(this.base)
                    .setPosition(SC_W*0.5, y);
            }
            //セレクタの場合
            if (item instanceof Selector) {
                this.item[i] = item;
                item.addChildTo(this.base).setPosition(SC_W*0.5, y);
            }

            //クリック判定用矩形
            this.click[i] = phina.display.RectangleShape(paramCL)
                .addChildTo(this.base)
                .setPosition(SC_W*0.5, y)
                .setInteractive(true);
            this.click[i].$extend({alpha: 0, selY: y, sel: i});
            this.click[i].onpointstart = function() {
                if (that.cursol.sel == this.sel) {
                    if (that.item[this.sel] instanceof Selector) {
                    } else {
                        that.decision(that.cursol.sel);
                    }
                } else {
                    app.playSE("select");
                    that.cursol.tweener.clear().moveTo(SC_W*0.5, this.selY, 200, "easeOutCubic");
                    that.cursol.sel = this.sel;
                }
            }
        }
        this.cursol.y = this.item[0].y;
        this.cursol.sel = 0;
    },

    //既存メニュー項目クリア
    clearMenu: function() {
        if (this.frame) {
            this.frame.remove();
            delete this.frame;
        }
        if (this.title) {
            this.title.remove();
            delete this.title;
        }
        if (this.item) {
            for (var i = 0; i < this.item.length; i++) {
                this.item[i].remove();
                delete this.item[i];
                this.click[i].remove();
                delete this.click[i];
            }
            delete this.item;
            delete this.click;
        }
    },

    closeMenu: function() {
        this.base.tweener.clear().fadeOut(100);
        this.cursolBase.tweener.clear().fadeOut(100);
        this.frame.tweener.clear().wait(100).to({scaleY: 0}, 250, "easeOutCubic")
        this.bg.tweener.clear().to({alpha: 0.0}, 500, "easeOutCubic");
    },

    //メニュー項目選択決定
    decision: function(sel) {
        this.select = sel;
        this.flare('decision');
    },
    //メニューキャンセル
    cancel: function(sel) {
        this.flare('cancel');
    },
});

phina.define("Selector", {
    superClass: "phina.display.DisplayElement",

    //選択中アイテム
    selectItem: 0,

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },
    defaultOption: {
        title: {
            x: -60,
            text: "SELECT",
        },
        x: 60,
        width: 100,
        initial: 0,
        item: ["aaaaa", "2", "3", "4", "5"],
        description: ["1", "2", "3", "4", "5"],
        vertical: false,
    },

    init: function(option) {
        this.superInit();
        this.option = (option||{}).$safe(this.defaultOption);

        var width = this.option.width;

        //タイトル
        var titleParam = {text: this.option.title.text}.$safe(this.labelParam);
        this.title = phina.display.Label(titleParam)
            .addChildTo(this)
            .setPosition(this.option.title.x, 0);

        //選択初期位置
        this.selectItem = this.option.initial;
        if (this.selectItem < 0) this.selectItem = 0;

        //アイテムセット
        this.itemBase = phina.display.DisplayElement().addChildTo(this);
        this.items = [];
        for (var i = 0; i < this.option.item.length; i++) {
            this.items[i] = phina.display.Label({text: this.option.item[i]}.$safe(this.labelParam))
                .addChildTo(this.itemBase)
                .setPosition(this.option.x+i*100, 0);
            if (i != this.option.initial) this.items[i].alpha = 0;
        }

        var that = this;

        //選択操作用
        var paramC = {
            width: this.option.width*0.6,
            height: SC_H*0.05,
            fill: "rgba(255, 255, 255, 0.0)",
            stroke: null,
            backgroundColor: 'transparent',
        };
        this.btnC = phina.display.RectangleShape(paramC)
            .addChildTo(this)
            .setPosition(this.option.x, 0)
            .setInteractive(true);
        this.btnC.onpointstart = function() {
            //決定操作時、イベント発火
            that.flare('decision');
        }

        //操作ボタン
        //Shape用パラメータ
        var paramShp = {
            backgroundColor: 'transparent',
            fill: 'black',
            stroke: '#aaa',
            strokeWidth: 0,

            radius: 7,
            sides: 5,
            sideIndent: 0.38,
        };
        var paramBT = {
            width: 15,
            height:SC_H*0.05,
            fill: "rgba(255, 255, 255, 0.7)",
            stroke: null,
            backgroundColor: 'transparent',
        };
        this.btnL = phina.display.RectangleShape(paramBT)
            .addChildTo(this)
            .setPosition(-width*0.5+this.option.x, 0)
            .setInteractive(true);
        this.btnL.onpointstart = function() {
            this.tweener.clear().scaleTo(1.2, 100);
            that.dec();
        }
        this.btnL.onpointend = function() {
            this.tweener.clear().scaleTo(1.0, 100);
        }
        this.btnL2 = phina.display.TriangleShape(paramShp)
            .addChildTo(this.btnL)
            .setPosition(1, 0);
        this.btnL2.rotation = 30;
        
        this.btnR = phina.display.RectangleShape(paramBT)
            .addChildTo(this)
            .setPosition(width*0.5+this.option.x, 0)
            .setInteractive(true);
        this.btnR.onpointstart = function() {
            this.tweener.clear().scaleTo(1.2, 100);
            that.inc();
        }
        this.btnR.onpointend = function() {
            this.tweener.clear().scaleTo(1.0, 100);
        }
        this.btnR2 = phina.display.TriangleShape(paramShp)
            .addChildTo(this.btnR)
            .setPosition(-1, 0);
        this.btnR2.rotation = -30;
    },

    //項目インクリメント
    inc: function() {
        this.selectItem++;
        if (this.selectItem > this.option.item.length-1) {
            this.selectItem = this.option.item.length-1;
            return this;
        }
        this.items[this.selectItem-1].tweener.clear().to({alpha: 0}, 300, "easeOutSine");
        this.items[this.selectItem].tweener.clear().to({alpha: 1}, 300, "easeOutSine");
        this.itemBase.tweener.clear().to({x: -this.selectItem*100}, 800, "easeOutCubic");
        app.playSE("click");
        return this;
    },

    //項目デクリメント
    dec: function() {
        this.selectItem--;
        if (this.selectItem < 0) {
            this.selectItem = 0;
            return this;
        }
        this.items[this.selectItem+1].tweener.clear().to({alpha: 0}, 300, "easeOutSine");
        this.items[this.selectItem].tweener.clear().to({alpha: 1}, 300, "easeOutSine");
        this.itemBase.tweener.clear().to({x: -this.selectItem*100}, 800, "easeOutCubic");
        app.playSE("click");
        return this;
    },
});

phina.define("QueryDialog", {
    superClass: "phina.display.DisplayElement",

    //選択中アイテム
    selectItem: 0,

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },

    defaultOption: {
    },

    init: function(option) {
        this.superInit();
        option = (option||{}).$safe(this.defaultOption);
    },
});

/*
 *  pausescene.js
 *  2016/08/17
 *  @auther minimo  
 *  This Program is MIT license.
 */
 
phina.define("PauseScene", {
    superClass: "phina.display.DisplayScene",

    labelParam: {
        fill: "white",
        stroke: "black",
        strokeWidth: 1,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 35,
        fontWeight: ''
    },

    init: function(currentScene) {
        this.superInit();

        this.currentScene = currentScene;
        this.yes = true;

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: "rgba(0,0,0,0.7)",
            stroke: "rgba(0,0,0,0.7)",
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)

        //ポーズ表示
        this.pause1 = phina.display.Label({text: "PAUSE"}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5);

        this.pause2 = phina.display.Label({text: "Press ESC or Space or Tap to exit", fontSize: 15}.$safe(this.labelParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6);

        this.isExit = false;
        this.time = 0;        
    },

    update: function() {
        if (this.time > 30 && !this.isExit) {
            var ct = app.controller;
            var kb = app.keyboard;
            if (kb.getKey("escape") || kb.getKey("space") || ct.start) {
                this.pause1.tweener.clear()
                    .fadeOut(100)
                    .call(function() {
                        app.popScene();
                    });
                this.pause2.tweener.clear()
                    .fadeOut(100);
            }
        }
        this.time++;
    },

    //タッチorクリック終了処理
    onpointend: function(e) {
        if (this.time > 30) {
            app.popScene();
        }
    },
});


/*
 *  practicescene.js
 *  2016/08/31
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("PracticeScene", {
    superClass: "phina.display.DisplayScene",

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },

    init: function(option) {
        this.superInit();
        option = (option||{}).$safe({
            selectStage: 1,
        });

        if (option.selectStage > 5) option.selectStage = 1;

        var menuParam = {
            title: "STAGE SELECT",
            item: ["", "START", "TEST", "EXIT"],
            description: ["ステージ選択", "指定したステージを開始", "TEST MODE","EXIT"],
        };
        var selectorParam = {
            title: {
                x: -80,
                text: "",
            },
            x: 0,
            initial: option.selectStage-1,
            width: SC_W*0.3,
            item: ["1", "2", "3", "4", "5"],
            description: ["1", "2", "3", "4", "5"],
        };
        menuParam.item[0] = Selector(selectorParam);
        menuParam.item[0].on('decision', function() {
            this.menu.flare('decision');
        }.bind(this));

        this.menu = MenuDialog(menuParam).addChildTo(this);
        this.menu.on('decision', function(e) {
            var sel = e.target.select;
            switch (sel) {
                case 0:
                case 1:
                    {
                        var stage = e.target.menu.item[0].selectItem;
                        var next = "stage"+(stage+1)+"load";
                        this.exit(next);
                    }
                    break;
                case 2:
                    this.exit("stage9load");
                    break;
                case 3:
                    this.menu.closeMenu();
                    this.tweener.clear()
                        .wait(600)
                        .call(function(){
                            this.exit("toTitle");
                        }.bind(this));
                    break;
            }
        }.bind(this));
    },
});

/*
 *  resultscene.js
 *  2016/04/05
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("ResultScene", {
    superClass: "phina.display.DisplayScene",

    _member: {
        //ラベル用パラメータ
        labelParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: false,
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function(options) {
        this.superInit();
        this.$extend(this._member);
        options = (options||{}).$safe({
            stageId: 0,
        });

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        phina.display.Label({text: "STAGE "+options.stageId+" CLEAR"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.2);

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(20);

        this.time = 0;
    },
    
    update: function(app) {
        this.time++;
    },
});

/*
 *  SceneFlow.js
 *  2014/11/28
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

//��{�V�[���t���[
phina.define("SceneFlow", {
    superClass: "phina.game.ManagerScene",

    init: function(options) {
        options = options || {};
        this.superInit(options.$safe({
            scenes: [{
                label: "splash",
                className: "SplashScene",
                nextLabel: "load",
            },{
                label: "load",
                className: "LoadingScene",
                arguments: {
                    assetType: "common"
                },
                nextLabel: "title",
            },{
                label: "title",
                className: "TitleScene",
            },{
                label: "arcade",
                className: "ArcadeMode",
                nextLabel: "title",
            },{
                label: "practice",
                className: "PracticeMode",
                nextLabel: "title",
            }],
        }));
    }
});

//�A�[�P�[�h���[�h�V�[���t���[
phina.define("ArcadeMode", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "stage1load",
            scenes: [{
                label: "stage1load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage1"
                },
                nextLabel: "stage1",
            },{
                label: "stage1",
                className: "MainScene",
                arguments: {
                    stageId: 1,
                },
            },{
                label: "gameover",
                className: "GameOverScene",
                nextLabel: "toTitle",
            },{
                label: "toTitle",
                className: "SceneFlow",
                arguments: {
                    startLabel: "title",
                },
            }],
        });
    }
});

//�v���N�e�B�X���[�h�V�[���t���[
phina.define("PracticeMode", {
    superClass: "phina.game.ManagerScene",

    init: function() {
        this.superInit({
            startLabel: "menu",
            scenes: [{
                label: "menu",
                className: "PracticeScene",
            },

            //�X�e�[�W�P
            {
                label: "stage1load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage1"
                },
                nextLabel: "stage1",
            },{
                label: "stage1",
                className: "MainScene",
                arguments: {
                    stageId: 1,
                    isPractice: true,
                },
                nextLabel: "menu",
                nextArguments: {
                    selectStage: 1,
                },
            },

            //�X�e�[�W�Q
            {
                label: "stage2load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage2"
                },
                nextLabel: "stage2",
            },{
                label: "stage2",
                className: "MainScene",
                arguments: {
                    stageId: 2,
                    isPractice: true,
                },
                nextLabel: "menu",
                nextArguments: {
                    selectStage: 2,
                },
            },

            //�e�X�g�p�X�e�[�W
            {
                label: "stage9load",
                className: "LoadingScene",
                arguments: {
                    assetType: "stage9"
                },
                nextLabel: "stage9",
            },{
                label: "stage9",
                className: "MainScene",
                arguments: {
                    stageId: 9,
                    isPractice: true,
                },
                nextLabel: "menu",
                nextArguments: {
                    selectStage: 9,
                },
            },

            //�^�C�g���ɖ߂�
            {
                label: "toTitle",
                className: "SceneFlow",
                arguments: {
                    startLabel: "title",
                },
            }],
        });
    }
});

/*
 *  settingscene.js
 *  2016/04/06
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("SettingScene", {
    superClass: "phina.display.DisplayScene",

    //ラベル用パラメータ
    labelParam: {
        text: "",
        fill: "white",
        stroke: false,
        strokeWidth: 2,

        fontFamily: "Orbitron",
        align: "center",
        baseline: "middle",
        fontSize: 15,
        fontWeight: ''
    },

    init: function(menu) {
        this.superInit();

        var menuParam = {
            title: "SETTING",
            item: ["GAME", "SYSTEM", "test", "EXIT"],
            description: ["menu1", "menu2", "test", "exit"],
        };
        menuParam.item[2] = Selector();

        this.menu = MenuDialog(menuParam).addChildTo(this);
        this.menu.on('decision', function(e) {
            var sel = e.target.select;
            if (sel == 3) {
                this.menu.closeMenu();
                this.tweener.clear()
                    .wait(600)
                    .call(function(){
                        app.popScene();
                    });
            }
        }.bind(this));
        this.menu.on('cancel', function(e) {
            this.menu.closeMenu();
            this.tweener.clear()
                .wait(600)
                .call(function(){
                    app.popScene();
                });
        }.bind(this));
    },
});


/*
 *  splashscene.js
 *  2015/12/02
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.namespace(function() {
    phina.define('SplashScene', {
        superClass: 'phina.display.DisplayScene',

        init: function() {
            this.superInit({width: SC_W, height: SC_H});

            this.unlock = false;
            this.loadcomplete = false;

            //preload asset
            var assets = Application.assets["preload"];
            var loader = phina.asset.AssetLoader();
            loader.load(assets);
            loader.on('load', function(e) {
                this.loadcomplete = true;
            }.bind(this));

            //logo
            var texture = phina.asset.Texture();
            texture.load(SplashScene.logo).then(function() {
                this._init();
            }.bind(this));
            this.texture = texture;
        },

        _init: function() {
            this.sprite = phina.display.Sprite(this.texture)
                .addChildTo(this)
                .setPosition(this.gridX.center(), this.gridY.center())
                .setScale(0.3);
            this.sprite.alpha = 0;

            this.sprite.tweener
                .clear()
                .to({alpha:1}, 500, 'easeOutCubic')
                .call(function() {
                    this.unlock = true;
                }, this)
                .wait(1000)
                .to({alpha:0}, 500, 'easeOutCubic')
                .wait(250)
                .call(function() {
                    this.exit();
                }, this);
        },

        update: function() {
            var ct = app.controller;
            if (ct.ok || ct.cancel) {
                if (this.unlock && this.loadcomplete) this.exit();
            }
        },

        onpointstart: function() {
            if (this.unlock && this.loadcomplete) this.exit();
        },

        _static: {
            logo: "assets/images/logo.png",
        },
    });
});

/*
 *  TitileScene.js
 *  2014/06/04
 *  @auther minimo  
 *  This Program is MIT license.
 *
 */

phina.define("TitleScene", {
    superClass: "phina.display.DisplayScene",
    
    _member: {
        //ラベル用パラメータ
        titleParam: {
            text: "",
            fill: "white",
            stroke: "blue",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 36,
            fontWeight: ''
        },
        msgParam: {
            text: "",
            fill: "white",
            stroke: "black",
            strokeWidth: 2,

            fontFamily: "Orbitron",
            align: "center",
            baseline: "middle",
            fontSize: 15,
            fontWeight: ''
        },
    },

    init: function() {
        this.superInit();
        this.$extend(this._member);

        //バックグラウンド
        var param = {
            width:SC_W,
            height:SC_H,
            fill: 'black',
            stroke: false,
            backgroundColor: 'transparent',
        };
        this.bg = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.bg.tweener.setUpdateType('fps');

        //バージョン番号
        phina.display.Label({
            text: "ver "+_VERSION_,
            align: "left",
            baseline: "top",
            fontSize: 8,
            stroke: "black",
            fill: "white",
        }.$safe(this.titleParam)).addChildTo(this).setPosition(2, 2);

            //かっこよさげなオブジェ
        this.acc = phina.extension.CircleButton({radius: 64})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.3)
            .setScale(0.0, 0.0);
        this.acc.interactive = false;
        this.acc.tweener.clear().to({ scaleX: 2.0, scaleY: 1 }, 150);

        //タイトル
        phina.display.Label({text: "Planet"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.3-5, SC_H*0.3);
        phina.display.Label({text: "Buster"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.7+5, SC_H*0.3);
        phina.display.Label({text: "REVISION", fontSize:16, stroke: "red"}.$safe(this.titleParam))
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.35);

        var that = this;
        //選択カーソル
        var param2 = {
            width:SC_W,
            height:SC_H*0.08,
            fill: "rgba(0,100,200,0.5)",
            stroke: "rgba(0,100,200,0.5)",
            backgroundColor: 'transparent',
        };
        this.cursol = phina.extension.CursolFrame({width: SC_W*0.7, height: SC_H*0.06})
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.6-3)

        phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.6);
        phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.7);
        this.label3 = phina.display.Label({text: "SETTING"}.$safe(this.msgParam)).addChildTo(this).setPosition(SC_W*0.5, SC_H*0.8);
        this.label3.blink = false;
        this.label3.update = function(e) {
            if (this.blink && e.ticker.frame % 10 == 0) this.visible = !this.visible;
            if (!this.blink) this.visible = true;
        }

        //タッチ用
        for (var i = 0; i < 3; i++) {
            var c = phina.display.RectangleShape(param2)
                .addChildTo(this)
                .setPosition(SC_W*0.5, SC_H*0.6+i*SC_H*0.1)
                .setInteractive(true);
            c.alpha = 0;
            c.select = i;
            c.onpointstart = function() {
                if (that.isSelected) return;

                if (that.select != this.select) {
                    that.select = this.select;
                    that.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(that.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                } else {
                    that.menuSelect();
                }
            }
        }

        //選択中メニュー番号
        this.select = 0;
        this.isSelected = false;

        this.mask = phina.display.RectangleShape(param)
            .addChildTo(this)
            .setPosition(SC_W*0.5, SC_H*0.5)
        this.mask.tweener.setUpdateType('fps').fadeOut(20);

        //戻ってきた場合に選択状態を解除
        this.on('enter', function() {
            this.time = 0;
            this.isSelected = false;
        }.bind(this));

        this.time = 0;
    },
    
    update: function(app) {
        //キーボード操作
        if (this.time > 10 && !this.isSelected) {
            var ct = app.controller;
            if (ct.up) {
                this.select--;
                if (this.select < 0) {
                    this.select = 0;
                } else {
                    this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                }
                this.time = 0;
            }
            if (ct.down) {
                this.select++;
                if (this.select > 2) {
                    this.select = 2;
                } else {
                    this.cursol.tweener.clear().moveTo(SC_W*0.5, SC_H*0.6+(this.select*SC_H*0.1)-3, 200, "easeOutCubic");
                    app.playSE("select");
                }
                this.time = 0;
            }
            if (ct.ok) {
                this.menuSelect();
            }
        }
        this.time++;
    },

    menuSelect: function() {
        switch (this.select) {
            case 0:
            //ARCADE MODE
                app.playSE("start");
                app.score = 0;
                this.isSelected = true;
                this.tweener.clear().wait(2500).call(function() {
                    this.arcadeMode();
                }.bind(this));
                phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.6)
                    .tweener.clear().to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                phina.display.Label({text: "ARCADE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.6)
                    .tweener.clear().wait(100).to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                break;
            case 1:
            //PRACTICE MODE
                app.playSE("start");
                app.score = 0;
                this.isSelected = true;
                this.tweener.clear().wait(2500).call(function() {
                    this.practiceMode();
                    this.isSelected = false;
                }.bind(this));
                phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.7)
                    .tweener.clear().to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                phina.display.Label({text: "PRACTICE MODE"}.$safe(this.msgParam))
                    .addChildTo(this)
                    .setPosition(SC_W*0.5, SC_H*0.7)
                    .tweener.clear().wait(100).to({scaleX:1.5, scaleY: 1.5, alpha: 0}, 2000, "easeOutCubic");
                break;
            case 2:
            //SETTING
                app.playSE("setting");
                this.isSelected = true;
                this.tweener.clear().wait(700)
                    .call(function() {
                        this.label3.blink = false;
                        this.time = 0;
                        this.isSelected = false;
                        this.settingMode();
                    }.bind(this));
                this.label3.blink = true;
                break;
        }
    },

    arcadeMode: function() {
        this.exit("arcade");
    },

    practiceMode: function() {
        this.exit("practice");
    },

    settingMode: function() {
        app.pushScene(SettingScene(this));
    },
});

/*
 *  Ground.js
 *  2015/10/10
 *  @auther minimo  
 *  This Program is MIT license.
 */

phina.define("Ground", {
    superClass: "phina.display.DisplayElement",
    layer: LAYER_BACKGROUND,    //所属レイヤー

    _member: {
        map: null,
        belt: false,    //繰り返し地形フラグ

        direction: 0,   //スクロール方向
        speed: 1,       //スクロール速度

        altitudeBasic: 20,  //基本高度
        altitude: 1,        //現在高度（基本高度に対する割合：１を１００％とする)
        isShadow: true,     //影有りフラグ

        deltaX : 0,        
        deltaY : 0,        
    },

    init: function(option) {
        this.superInit();
        this.$safe(this._member);
        option = (option || {}).$safe({
            asset: null,
            type: "image",
            belt: false,
            x: SC_W*0.5,
            y: SC_H*0.5
        });
        this.asset = option.asset;
        this.type = option.type;
        this.belt = option.belt;

        this.position.x = option.x;
        this.position.y = option.y;

        this.tweener.setUpdateType('fps');

        this.mapBase = phina.display.DisplayElement().setPosition(0, 0).addChildTo(this);
        this.mapBase.tweener.setUpdateType('fps');

        if (this.asset) {
            this.setupMap();
        }

        this.on("enterframe", this.defaultEnterframe);
    },

    defaultEnterframe: function() {
        var rad = (this.direction+90)*toRad;
        this.deltaX = Math.cos(rad)*this.speed;
        this.deltaY = Math.sin(rad)*this.speed;

        this.mapBase.x += this.deltaX;
        this.mapBase.y += this.deltaY;

        if (this.belt) {
            for (var y = 0; y < 3; y++) {
                for (var x = 0; x < 3; x++) {
                    var m = this.map[x][y];
                    var sx = Math.floor((this.mapBase.x + m.x)/this.map.width);
                    if (sx >  0) m.x -= this.map.width*3;
                    if (sx < -2) m.x += this.map.width*3;
                    var sy = Math.floor((this.mapBase.y + m.y)/this.map.height);
                    if (sy >  0) m.y -= this.map.height*3;
                    if (sy < -2) m.y += this.map.height*3;
                }
            }
        }
    },

    setupMap: function() {
        if (!this.belt) {
            if (this.type == "image") {
                this.map = phina.display.Sprite(this.asset).addChildTo(this.mapBase);
            } else if (this.type == "tmx") {
                var tmx = phina.asset.AssetManager.get('tmx', this.asset);
                this.map = phina.display.Sprite(tmx.image).addChildTo(this.mapBase);
            }
            var w = this.map.width;
            var h = this.map.height;
            this.map.setPosition(0, 0);
            this.map.setOrigin(0, 0);
        } else {
            if (this.type == "image") {
                var image = phina.asset.AssetManager.get('image', this.asset);
            } else if (this.type == "tmx") {
                var tmx = phina.asset.AssetManager.get('tmx', this.asset);
                var image = tmx.image;
            }
            this.map = [];
            this.map.width = image.domElement.width;
            this.map.height = image.domElement.height;
            for (var x = 0; x < 3; x++) {
                this.map[x] = [];
                for (var y = 0; y < 3; y++) {
                    var mx = (x-1) * this.map.width;
                    var my = (y-1) * this.map.height;
                    this.map[x][y] = phina.display.Sprite(image)
                        .addChildTo(this.mapBase)
                        .setPosition(mx, my)
                        .setOrigin(0, 0);
                    this.map[x][y].mapX = Math.floor(mx / this.map.width);
                    this.map[x][y].mapY = Math.floor(my / this.map.height);
                }
            }
        }
    },

    addLayer: function(name) {
    },

    setDirection: function(dir) {
        this.direction = dir;
        return this;
    },

    setSpeed: function(speed) {
        this.speed = speed;
        return this;
    },

    setPosition: function(x, y) {
        this.mapBase.x = x;
        this.mapBase.y = y;
        return this;
    },

    _accessor: {
        x: {
            "get": function() { return this.mapBase.x; },
            "set": function(x) { this.mapBase.x = x;}
        },
        y: {
            "get": function() { return this.mapBase.y; },
            "set": function(y) { this.mapBase.x = y;}
        },

        shadowX: {
            "get": function() {
                return (this.altitudeBasic * this.altitude)*0.5;
            },
            "set": function(y) {}
        },
        shadowY: {
            "get": function() {
                return this.altitudeBasic * this.altitude;
            },
            "set": function(y) {}
        },
/*
        scaleX: {
            "get": function() { return this.mapBase.scaleX; },
            "set": function(x) { this.mapBase.scaleX = x;}
        },
        scaleY: {
            "get": function() { return this.mapBase.scaleY; },
            "set": function(y) { this.mapBase.scaleY = y;}
        },
*/
    }
});

/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ１
phina.define("Stage1", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            app.playBGM("stage1", true);
            this.player.isAfterburner = true;
        });
        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
            this.player.isAfterburner = false;
        });

        //Stage data
        this.add( 180, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "Hornet1-left");
        this.add(   1, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "MudDauber-left");
        this.add(  60, "MudDauber-right");

        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:1.0}, 300, "easeInOutCubic");
        });

        this.add(  90, "Hornet1-left");
        this.add(  20, "Hornet1-right");
        this.add( 120, "Hornet1-center");

        this.add( 120, "ToyBox-p-right");

        this.add( 120, "Fragarach-center");

        this.add( 120, "Hornet1-left");
        this.add(   1, "Hornet1-right");
        this.add( 180, "Hornet1-center");

        this.add( 120, "Fragarach-left");
        this.add(  60, "Fragarach-right");

        this.add( 120, "Hornet3-center");

        this.add( 120, "Fragarach-left2");
        this.add(   1, "Fragarach-right2");

        this.add(60, function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
        });

        this.add(  60, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");
        this.add( 120, "Hornet3-center");

        //中ボス
        this.add( 360, "ThorHammer", {boss: true});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:10.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = true;
        });
        this.add( 1800, function() {});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:5.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = false;
        });

        this.add( 180, "Hornet1-left");
        this.add(  60, "Hornet1-right");
        this.add(  60, "Hornet1-center");

        this.add( 120, "Hornet3-left");
        this.add(   1, "Hornet3-right");
        this.add(  60, "Hornet3-center");

        this.add(120, function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:2.0}, 600, "easeInOutSine");
        });

        this.add(  30, "BigWing-left");
        this.add( 180, "BigWing-right");

        this.add( 120, "Hornet2-left");
        this.add(  20, "Hornet2-right");
        this.add( 120, "Hornet2-center");

        this.add( 120, "Hornet3-left");
        this.add(   1, "Hornet3-right");
        this.add(  60, "Hornet3-center");

        this.add( 120, "MudDauber-left");
        this.add(  60, "MudDauber-right");

        this.add( 120, "ToyBox-p-center");

        //WARNING
        this.add( 360, function() {
            this.enterWarning();
        });

        //ステージボス
        this.add( 300, function() {
            this.ground.tweener.clear().to({speed:0.0}, 180, "easeInOutCubic");
        });
        this.add( 120, "Golyat", {boss: true});
        this.add( 120, function() {
            this.ground.tweener.clear().to({speed:-7.0}, 180, "easeInOutCubic");
        });
        this.add( 1800, function() {});


        //イベント登録
        this.addEvent("scroll_1", function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:1.0}, 300, "easeInOutCubic");
        });
        this.addEvent("scroll_2", function() {
            this.ground.tweener.clear().to({scaleX:1.0, scaleY:1.0, speed:3.0}, 300, "easeInOutCubic");
        });
        this.addEvent("scroll_3", function() {
            this.ground.tweener.clear().to({speed:10.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = true;
        });
        this.addEvent("scroll_4", function() {
            this.ground.tweener.clear().to({speed:5.0}, 180, "easeInOutCubic");
            this.player.isAfterburner = false;
        });
        this.addEvent("scroll_5", function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:2.0}, 600, "easeInOutSine");
        });
        this.addEvent("warning", function() {
            this.enterWarning();
        });

    },
});

//ステージ１地形管理
phina.define("Stage1Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1g",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
        this.mapBase.x = -w*0.5;
        this.mapBase.y = -h*0.5;

        this.setScale(0.2, 0.2);
        this.speed = 1.0;
    },
});

})();

/*
 *  Stage2.js
 *  2016/08/18
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ１
phina.define("Stage2", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            this.ground.tweener.clear().to({scaleX:0.5, scaleY:0.5, speed:1.0, alpha:1}, 1, "easeInOutQuad");
            app.playBGM("stage2", true);
        });

        this.add( 180, function() {
            this.event["boss_shadow"].value.call();
        }.bind(this));
        //WARNING
        this.add( 360, function() {
            this.enterWarning();
        });
        this.add( 240, function() {
            this.event["Garuda"].value.call();
        }.bind(this));

        //ガルーダ機影
        this.addEvent("boss_shadow", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80);
            shadow.layer = LAYER_FOREGROUND;
            shadow.alpha = 0.5;
            shadow.addChildTo(app.currentScene)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*1.1, SC_H*1.2)
                .setScale(2.0);
            shadow.update = function() {
                this.y -= 1;
                if (this.y < -80) this.remove();
            };
        });

        //ボス登場演出
        this.addEvent("Garuda", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*0.5, SC_H*0.4);
            shadow.layer = LAYER_SHADOW;
            shadow.alpha = 0.0;
            shadow.time = 0;
            shadow.addChildTo(app.currentScene);

            var that = this;
            shadow.tweener.setUpdateType('fps').clear()
                .to({alpha: 0.4, y: SC_H*0.2}, 300, "easeOutSine")
                .wait(120)
                .call(function() {
                    that.parentScene.enterEnemyUnit("Garuda");
                })
                .wait(120)
                .call(function() {
                    this.remove();
                }.bind(shadow));

            shadow.update = function() {
                this.time++;
                if (this.time < 300) return; 

                //煙もくもくー
                var x1 = this.x;
                var y1 = this.y-10;
                var x2 = this.x+148;
                var y2 = this.y+40;
                var vy = this.parentScene.ground.deltaY;
                for (var r = 0; r < 2; r++) {
                    if (r == 1) x2 = this.x-148;
                    for (var i = 0; i < 3; i++) {
                        var p = Math.randfloat(0, 1.0);
                        var px = Math.floor(x1*p+x2*(1-p));
                        var py = Math.floor(y1*p+y2*(1-p))-32;
                        var layer = this.parentScene.effectLayerUpper;
                        layer.enterSmokeLarge({
                            position: {x: px, y: py},
                            velocity: {x: 0, y: vy+Math.randint(0, 3), decay: 1.01},
                            delay: rand(0, 2)
                        });
                    }
                }
            }
        }.bind(this));
    },
});

//ステージ１地形管理
phina.define("Stage2Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1g",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
        this.mapBase.x = -w*0.5;
        this.mapBase.y = -h*0.5;
    },
});

})();

/*
 *  StageData.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//テスト用ステージ
phina.define("Stage9", {
    superClass: "StageController",

    altitudeBasic: 40,

    init: function(parent, player) {
        this.superInit(parent, player);

        //初期化処理
        this.add(1, function() {
            app.playBGM("stage9", true);
        });

//        this.add( 180, "Raven");
        this.add( 180, function() {
//            this.event["boss_shadow"].value.call();
           this.event["Garuda"].value.call();
        }.bind(this));


        //ガルーダ機影
        this.addEvent("boss_shadow", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80);
            shadow.layer = LAYER_FOREGROUND;
            shadow.alpha = 0.5;
            shadow.addChildTo(app.currentScene)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*1.1, SC_H*1.2)
                .setScale(2.0);
            shadow.update = function() {
                this.y -= 1;
                if (this.y < -80) this.remove();
            };
        });

        //ボス登場演出
        this.addEvent("Garuda", function() {
            var shadow = phina.display.Sprite("tex_boss1Black", 296, 80)
                .setFrameTrimming(128, 320, 296, 160)
                .setFrameIndex(0)
                .setPosition(SC_W*0.5, SC_H*0.4);
            shadow.layer = LAYER_SHADOW;
            shadow.alpha = 0.0;
            shadow.time = 0;
            shadow.addChildTo(app.currentScene);

            var that = this;
            shadow.tweener.setUpdateType('fps').clear()
                .to({alpha: 0.4, y: SC_H*0.2}, 300, "easeOutSine")
                .wait(120)
                .call(function() {
                    that.parentScene.enterEnemyUnit("Garuda");
                })
                .wait(120)
                .call(function() {
                    this.remove();
                }.bind(shadow));

            shadow.update = function() {
                this.time++;
                if (this.time < 300) return; 

                //煙もくもくー
                var x1 = this.x;
                var y1 = this.y-10;
                var x2 = this.x+148;
                var y2 = this.y+40;
                var vy = this.parentScene.ground.deltaY;
                for (var r = 0; r < 2; r++) {
                    if (r == 1) x2 = this.x-148;
                    for (var i = 0; i < 3; i++) {
                        var p = Math.randfloat(0, 1.0);
                        var px = Math.floor(x1*p+x2*(1-p));
                        var py = Math.floor(y1*p+y2*(1-p))-32;
                        var layer = this.parentScene.effectLayerUpper;
                        layer.enterSmokeLarge({
                            position: {x: px, y: py},
                            velocity: {x: 0, y: vy+Math.randint(0, 3), decay: 1.01},
                            delay: rand(0, 2)
                        });
                    }
                }
            }
        }.bind(this));

        //WARNING
        this.addEvent("warning", function() {
            this.enterWarning();
        });
    },
});

//ステージ１地形管理
phina.define("Stage9Ground", {
    superClass: "Ground",

    init: function() {
        this.superInit({
            asset: "map1",
            type: "tmx",
            belt: true
        });
        var w = this.map.width;
        var h = this.map.height;
//        this.mapBase.x = -w*0.5;
//        this.mapBase.y = -h*0.5;
        this.mapBase.x = 0;
        this.mapBase.y = -2000*32+SC_H;
    },
});

})();

/*
 *  StageController.js
 *  2014/08/06
 *  @auther minimo  
 *  This Program is MIT license.
 */
(function() {

//ステージ制御
phina.define("StageController", {
    superClass: "phina.app.Object2D",

    parentScene: null,
    player: null,
    time: 0,

    //経過時間トリガイベント
    seq: null,
    index: 0,

    //マップトリガイベント
    event: null,

    altitude: 100,

    init: function(scene, player, tmx, layer) {
        this.superInit();

        this.parentScene = scene;
        this.seq = [];

        this.event = [];

        this.player = player;
    },

    //時間イベント追加
    add: function(time, value, option) {
        this.index += time;
        this.seq[this.index] = {
            value: value,
            option: option,
        };
    },

    //時間イベント取得
    get: function(time) {
        var data = this.seq[time];
        if (data === undefined) return null;
        return data;
    },

    //マップイベント追加
    addEvent: function(id, value, option) {
        this.event[id] = {
            value: value,
            option: option,
            executed: false,
        };
    },

    //マップイベント取得
    getEvent: function(id) {
        var data = this.event[id];
        if (data === undefined) return null;
        return data;
    },

    //次にイベントが発生する時間を取得
    getNextEventTime: function(time) {
        var data = this.seq[time];
        if (data === undefined) {
            var t = time+1;
            var rt = -1;
            this.seq.some(function(val, index){
                if (index > t) {
                    rt = index;
                    return true;
                }
            },this.seq);
            return rt;
        } else {
            return time;
        }
    },

    clear: function() {
        this.seq = [];
        this.index = 0;
    },
});

})();

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjAwMF9wbHVnaW5zL2JlbnJpLmpzIiwiMDAwX3BsdWdpbnMvYnV0dG9uLmpzIiwiMDAwX3BsdWdpbnMvY29sbGlzaW9uLmpzIiwiMDAwX3BsdWdpbnMvZXh0ZW5zaW9uLmpzIiwiMDAwX3BsdWdpbnMvZnJhbWUuanMiLCIwMDBfcGx1Z2lucy9nYXVnZS5qcyIsIjAwMF9wbHVnaW5zL3BoaW5hLmV4dGVuc2lvbi5qcyIsIjAwMF9wbHVnaW5zL3NsaWNlc3ByaXRlLmpzIiwiMDAwX3BsdWdpbnMvc291bmRzZXQuanMiLCIwMDBfcGx1Z2lucy90aWxlZG1hcC5qcyIsIjAwMl9hcHAvYXBwbGljYXRpb24uanMiLCIwMDNfbWFpbi9tYWluLmpzIiwiMDA0X3V0aWwvZGFubWFrdS51dGlsaXR5LmpzIiwiMDA0X3V0aWwvZGlhbG9nLmpzIiwiMDA1X2J1bGxldC9idWxsZXQuanMiLCIwMDVfYnVsbGV0L2J1bGxldGNvbmZpZy5qcyIsIjAwNV9idWxsZXQvYnVsbGV0bGF5ZXIuanMiLCIwMDZfZGFubWFrdS9kYW5tYWt1LmpzIiwiMDA2X2Rhbm1ha3UvZGFubWFrdUJhc2ljLmpzIiwiMDA2X2Rhbm1ha3UvZGFubWFrdUJvc3NfMS5qcyIsIjAwNl9kYW5tYWt1L2Rhbm1ha3VCb3NzXzIuanMiLCIwMDdfZWZmZWN0L2VmZmVjdC5qcyIsIjAwN19lZmZlY3QvZWZmZWN0bGF5ZXIuanMiLCIwMDdfZWZmZWN0L2VmZmVjdHV0aWxpdHkuanMiLCIwMDdfZWZmZWN0L3BhcnRpY2xlLmpzIiwiMDA4X2VuZW15L2VuZW15LmpzIiwiMDA4X2VuZW15L2VuZW15ZGF0YS5qcyIsIjAwOF9lbmVteS9lbmVteWRhdGFib3NzXzEuanMiLCIwMDhfZW5lbXkvZW5lbXlkYXRhYm9zc18yLmpzIiwiMDA4X2VuZW15L2VuZW15ZGF0YWJvc3NfMy5qcyIsIjAwOF9lbmVteS9lbmVteWRhdGFib3NzXzQuanMiLCIwMDhfZW5lbXkvZW5lbXl1bml0LmpzIiwiMDA5X3BsYXllci9pdGVtLmpzIiwiMDA5X3BsYXllci9wbGF5ZXIuanMiLCIwMDlfcGxheWVyL3BsYXllcmJpdC5qcyIsIjAwOV9wbGF5ZXIvcGxheWVycG9pbnRlci5qcyIsIjAwOV9wbGF5ZXIvc2hvdC5qcyIsIjAwOV9wbGF5ZXIvc2hvdGxheWVyLmpzIiwiMDEwX3NjZW5lL2NvbnRpbnVlc2NlbmUuanMiLCIwMTBfc2NlbmUvZ2FtZW92ZXJzY2VuZS5qcyIsIjAxMF9zY2VuZS9sb2FkaW5nc2NlbmUuanMiLCIwMTBfc2NlbmUvbWFpbnNjZW5lLmpzIiwiMDEwX3NjZW5lL21lbnVkaWFsb2cuanMiLCIwMTBfc2NlbmUvcGF1c2VzY2VuZS5qcyIsIjAxMF9zY2VuZS9wcmFjdGljZXNjZW5lLmpzIiwiMDEwX3NjZW5lL3Jlc3VsdHNjZW5lLmpzIiwiMDEwX3NjZW5lL3NjZW5lZmxvdy5qcyIsIjAxMF9zY2VuZS9zZXR0aW5nc2NlbmUuanMiLCIwMTBfc2NlbmUvc3BsYXNoc2NlbmUuanMiLCIwMTBfc2NlbmUvdGl0bGVzY2VuZS5qcyIsIjAxMV9zdGFnZS9ncm91bmQuanMiLCIwMTFfc3RhZ2Uvc3RhZ2UxLmpzIiwiMDExX3N0YWdlL3N0YWdlMi5qcyIsIjAxMV9zdGFnZS9zdGFnZTkuanMiLCIwMTFfc3RhZ2Uvc3RhZ2Vjb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9hQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOVJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeFVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbnlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2x1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMVlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2MEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicGJyZXYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogIEJlbnJpLmpzXG4gKiAgMjAxNC8xMi8xOFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cbiBcbnZhciB0b1JhZCA9IDMuMTQxNTkvMTgwOyAgICAvL+W8p+W6puazlXRv44Op44K444Ki44Oz5aSJ5o+bXG52YXIgdG9EZWcgPSAxODAvMy4xNDE1OTsgICAgLy/jg6njgrjjgqLjg7N0b+W8p+W6puazleWkieaPm1xuXG4vL+i3nembouioiOeul1xudmFyIGRpc3RhbmNlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICB2YXIgeCA9IGZyb20ueC10by54O1xuICAgIHZhciB5ID0gZnJvbS55LXRvLnk7XG4gICAgcmV0dXJuIE1hdGguc3FydCh4KngreSp5KTtcbn1cblxuLy/ot53pm6LoqIjnrpfvvIjjg6vjg7zjg4jnhKHjgZfniYjvvIlcbnZhciBkaXN0YW5jZVNxID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgICB2YXIgeCA9IGZyb20ueCAtIHRvLng7XG4gICAgdmFyIHkgPSBmcm9tLnkgLSB0by55O1xuICAgIHJldHVybiB4KngreSp5O1xufVxuXG4vL+aVsOWApOOBruWItumZkFxudmFyIGNsYW1wID0gZnVuY3Rpb24oeCwgbWluLCBtYXgpIHtcbiAgICByZXR1cm4gKHg8bWluKT9taW46KCh4Pm1heCk/bWF4OngpO1xufTtcblxuLy/kubHmlbDnlJ/miJBcbnZhciBwcmFuZCA9IHBoaW5hLnV0aWwuUmFuZG9tKCk7XG52YXIgcmFuZCA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgcmV0dXJuIHByYW5kLnJhbmRpbnQobWluLCBtYXgpO1xufVxuXG4vL+OCv+OCpOODiOODq+eEoeOBl+ODgOOCpOOCouODreOCsFxudmFyIEFkdmFuY2VBbGVydCA9IGZ1bmN0aW9uKHN0cikge1xuICAgIHZhciB0bXBGcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIHRtcEZyYW1lLnNldEF0dHJpYnV0ZSgnc3JjJywgJ2RhdGE6dGV4dC9wbGFpbiwnKTtcbiAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuYXBwZW5kQ2hpbGQodG1wRnJhbWUpO1xuXG4gICAgd2luZG93LmZyYW1lc1swXS53aW5kb3cuYWxlcnQoc3RyKTtcbiAgICB0bXBGcmFtZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRtcEZyYW1lKTtcbn07XG52YXIgQWR2YW5jZUNvbmZpcm0gPSBmdW5jdGlvbihzdHIpIHtcbiAgICB2YXIgdG1wRnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgICB0bXBGcmFtZS5zZXRBdHRyaWJ1dGUoJ3NyYycsICdkYXRhOnRleHQvcGxhaW4sJyk7XG4gICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmFwcGVuZENoaWxkKHRtcEZyYW1lKTtcblxuICAgIHZhciByZXN1bHQgPSB3aW5kb3cuZnJhbWVzWzBdLndpbmRvdy5jb25maXJtKHN0cik7XG4gICAgdG1wRnJhbWUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0bXBGcmFtZSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuLy/mlbDlgKTjgpLjgqvjg7Pjg57nt6jpm4bjgZfjgabmloflrZfliJfjgajjgZfjgablh7rliptcbk51bWJlci5wcm90b3R5cGUuJG1ldGhvZChcImNvbW1hXCIsICBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyID0gdGhpcysnJztcbiAgICB2YXIgbGVuID0gc3RyLmxlbmd0aDtcbiAgICB2YXIgb3V0ID0gJyc7XG4gICAgZm9yICh2YXIgaSA9IGxlbi0xOyBpID4gLTE7IGktLSkge1xuICAgICAgICBvdXQgPSBzdHJbaV0rb3V0O1xuICAgICAgICBpZiAoaSAhPSAwICYmIChsZW4taSklMyA9PSAwKSBvdXQgPSAnLCcrb3V0O1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xufSk7XG4iLCIvKlxuICogIEJ1dHRvbi5qc1xuICogIDIwMTUvMTAvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5leHRlbnNpb24gPSBwaGluYS5leHRlbnNpb24gfHwge307XG5cbi8v6YCa5bi444Gu44Oc44K/44OzXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uQnV0dG9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcblxuICAgIC8v5o+P55S744K544K/44Kk44Or6Kit5a6aXG4gICAgREVGQVVMVF9TVFlMRToge1xuICAgICAgICBidXR0b25Db2xvcjogJ3JnYmEoNTAsIDE1MCwgMjU1LCAwLjgpJyxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDIwMCwgMjAwLCAyMDAsIDAuNSknLFxuICAgICAgICBzdHJva2VXaWR0aDogNCxcbiAgICAgICAgc2hhZG93Q29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNSknLFxuICAgICAgICBmb250RmFtaWx5OiBcIlVidW50dU1vbm9cIixcbiAgICAgICAgZm9udFNpemU6IDUwLFxuICAgICAgICBmbGF0OiBmYWxzZSxcbiAgICB9LFxuXG4gICAgREVGQVVMVF9TVFlMRV9GTEFUOiB7XG4gICAgICAgIGJ1dHRvbkNvbG9yOiAncmdiYSgxNTAsIDE1MCwgMjUwLCAxLjApJyxcbiAgICAgICAgc3Ryb2tlQ29sb3I6ICdyZ2JhKDAsIDAsIDAsIDAuNSknLFxuICAgICAgICBzdHJva2VXaWR0aDogMyxcbiAgICAgICAgZm9udEZhbWlseTogXCJVYnVudHVNb25vXCIsXG4gICAgICAgIGZvbnRTaXplOiA1MCxcbiAgICAgICAgZmxhdDogdHJ1ZSxcbiAgICB9LFxuXG4gICAgbGFiZWxQYXJhbToge2FsaWduOiBcImNlbnRlclwiLCBiYXNlbGluZTpcIm1pZGRsZVwiLCBvdXRsaW5lV2lkdGg6M30sXG5cbiAgICB0ZXh0OiBcIlwiLFxuICAgIHB1c2g6IGZhbHNlLFxuICAgIGxvY2s6IGZhbHNlLFxuXG4gICAgLy/jg5zjgr/jg7PmirzkuIvmmYLjga7np7vli5Xph49cbiAgICBkb3duWDogMCxcbiAgICBkb3duWTogMTAsXG5cbiAgICAvL+ODleODqeODg+ODiOaZgumAj+aYjuW6plxuICAgIGFscGhhT046IDAuOSxcbiAgICBhbHBoYU9GRjogMC40LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICBvcHRpb25zID0gKG9wdGlvbnN8fHt9KS4kc2FmZSh7XG4gICAgICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICAgICAgaGVpZ2h0OiA4MCxcbiAgICAgICAgICAgIHRleHQ6IFwidW5kZWZpbmVkXCIsXG4gICAgICAgICAgICBzdHlsZTogbnVsbFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLndpZHRoID0gb3B0aW9ucy53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb25zLmhlaWdodDtcbiAgICAgICAgdGhpcy50ZXh0ID0gb3B0aW9ucy50ZXh0O1xuXG4gICAgICAgIC8v44K744OD44OI44Ki44OD44OXXG4gICAgICAgIHRoaXMuc2V0dXAob3B0aW9ucy5zdHlsZSk7XG5cbiAgICAgICAgLy/liKTlrprlh6bnkIboqK3lrppcbiAgICAgICAgdGhpcy5pbnRlcmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuYm91bmRpbmdUeXBlID0gXCJyZWN0XCI7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbihzdHlsZSkge1xuICAgICAgICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xuICAgICAgICBpZiAoc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgc3R5bGUuJHNhZmUodGhpcy5ERUZBVUxUX1NUWUxFX0ZMQVQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3R5bGUuJHNhZmUodGhpcy5ERUZBVUxUX1NUWUxFKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnN0eWxlID0gc3R5bGU7XG5cbiAgICAgICAgLy/nmbvpjLLmuIjjgb/jga7loLTlkIjnoLTmo4TjgZnjgotcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICBpZiAoIXN0eWxlLmZsYXQpIHRoaXMuc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5sYWJlbC5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aCwgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKCFzdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAvL+ODnOOCv+ODs+W9sVxuICAgICAgICAgICAgdmFyIHNoYWRvd1N0eWxlID0ge1xuICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgICAgICBmaWxsOiBzdHlsZS5zaGFkb3dDb2xvcixcbiAgICAgICAgICAgICAgICBzdHJva2U6IHN0eWxlLnNoYWRvd0NvbG9yLFxuICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBzdHlsZS5zdHJva2VXaWR0aFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93ID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShzaGFkb3dTdHlsZSlcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLmRvd25YLCB0aGlzLmRvd25ZKTtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93LmJsZW5kTW9kZSA9IFwic291cmNlLW92ZXJcIjtcbiAgICAgICAgfVxuICAgICAgICAvL+ODnOOCv+ODs+acrOS9k1xuICAgICAgICB2YXIgYnV0dG9uU3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IHN0eWxlLmJ1dHRvbkNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5zdHJva2VDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBzdHlsZS5zdHJva2VXaWR0aFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJ1dHRvbiA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUoYnV0dG9uU3R5bGUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgaWYgKHN0eWxlLmZsYXQpIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPRkYpO1xuXG4gICAgICAgIC8v44Oc44K/44Oz44Op44OZ44OrXG4gICAgICAgIHZhciBwYXJlbnQgPSB0aGlzLmJ1dHRvbjtcbiAgICAgICAgaWYgKHN0eWxlLmZsYXQpIHBhcmVudCA9IHRoaXM7XG4gICAgICAgIHRoaXMubGFiZWxQYXJhbS5mb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseTtcbiAgICAgICAgdGhpcy5sYWJlbCA9IHBoaW5hLmRpc3BsYXkuT3V0bGluZUxhYmVsKHRoaXMudGV4dCwgc3R5bGUuZm9udFNpemUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhwYXJlbnQpXG4gICAgICAgICAgICAuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKTtcbiAgICB9LFxuICAgIGJ1dHRvblB1c2hTdGFydDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT04pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5idXR0b24ueCArPSB0aGlzLmRvd25YO1xuICAgICAgICAgICAgdGhpcy5idXR0b24ueSArPSB0aGlzLmRvd25ZO1xuICAgICAgICB9XG4gICAgfSxcbiAgICBidXR0b25QdXNoTW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcHQgPSBlLnBvaW50aW5nO1xuICAgICAgICBpZiAodGhpcy5pc0hpdFBvaW50KHB0LngsIHB0LnkpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHVzaCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHVzaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT04pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggKz0gdGhpcy5kb3duWDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSArPSB0aGlzLmRvd25ZO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnB1c2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2ggPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPRkYpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggLT0gdGhpcy5kb3duWDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSAtPSB0aGlzLmRvd25ZO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgYnV0dG9uUHVzaEVuZDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT0ZGKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggLT0gdGhpcy5kb3duWDtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgLT0gdGhpcy5kb3duWTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBzZXRWaXNpYmxlOiBmdW5jdGlvbihiKSB7XG4gICAgICAgIGlmICh0aGlzLnNoYWRvdykgdGhpcy5zaGFkb3cudmlzaWJsZSA9IGI7XG4gICAgICAgIHRoaXMuYnV0dG9uLnZpc2libGUgPSBiO1xuICAgICAgICB0aGlzLmxhYmVsLnZpc2libGUgPSBiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgc2V0TG9jazogZnVuY3Rpb24oYikge1xuICAgICAgICB0aGlzLmxvY2sgPSBiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgb250b3VjaHN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLmxvY2spIHJldHVybjtcblxuICAgICAgICB0aGlzLnB1c2ggPSB0cnVlO1xuICAgICAgICB0aGlzLmJ1dHRvblB1c2hTdGFydChlKTtcbiAgICAgICAgdmFyIGUgPSBwaGluYS5ldmVudC5FdmVudChcInB1c2hcIik7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICB9LFxuICAgIG9udG91Y2htb3ZlOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLmxvY2spIHJldHVybjtcbiAgICAgICAgdGhpcy5idXR0b25QdXNoTW92ZShlKTtcbiAgICB9LFxuICAgIG9udG91Y2hlbmQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMubG9jaykgcmV0dXJuO1xuXG4gICAgICAgIHZhciBwdCA9IGUucG9pbnRpbmc7XG4gICAgICAgIGlmICh0aGlzLmlzSGl0UG9pbnQocHQueCwgcHQueSkpIHtcbiAgICAgICAgICAgIHRoaXMucHVzaCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5idXR0b25QdXNoRW5kKGUpO1xuXG4gICAgICAgICAgICB2YXIgZSA9IHBoaW5hLmV2ZW50LkV2ZW50KFwicHVzaGVkXCIpO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuXG4vL+inkuS4uOODnOOCv+ODs1xucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLlJvdW5kQnV0dG9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmV4dGVuc2lvbi5CdXR0b25cIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbihzdHlsZSkge1xuICAgICAgICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xuICAgICAgICBzdHlsZS4kc2FmZSh0aGlzLkRFRkFVTFRfU1RZTEUpO1xuXG4gICAgICAgIC8v55m76Yyy5riI44G/44Gu5aC05ZCI56C05qOE44GZ44KLXG4gICAgICAgIGlmICh0aGlzLnNoYWRvdykge1xuICAgICAgICAgICAgdGhpcy5zaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmxhYmVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5idXR0b24ucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICAvL+ODnOOCv+ODs+W9sVxuICAgICAgICB2YXIgc2hhZG93U3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IHN0eWxlLnNoYWRvd0NvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5zaGFkb3dDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBzdHlsZS5zdHJva2VXaWR0aCxcbiAgICAgICAgICAgIHJhZGl1czogc3R5bGUucmFkaXVzLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuUm91bmRSZWN0YW5nbGVTaGFwZShzaGFkb3dTdHlsZSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5kb3duWCwgdGhpcy5kb3duWSk7XG4gICAgICAgIHRoaXMuc2hhZG93LmJsZW5kTW9kZSA9IFwic291cmNlLW92ZXJcIjtcblxuICAgICAgICAvL+ODnOOCv+ODs+acrOS9k1xuICAgICAgICB2YXIgYnV0dG9uU3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IHN0eWxlLmJ1dHRvbkNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5zdHJva2VDb2xvcixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBzdHlsZS5zdHJva2VXaWR0aCxcbiAgICAgICAgICAgIHJhZGl1czogc3R5bGUucmFkaXVzLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJ1dHRvbiA9IHBoaW5hLmRpc3BsYXkuUm91bmRSZWN0YW5nbGVTaGFwZShidXR0b25TdHlsZSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuXG4gICAgICAgIC8v44Oc44K/44Oz44Op44OZ44OrXG4gICAgICAgIHRoaXMubGFiZWxQYXJhbS5mb250RmFtaWx5ID0gc3R5bGUuZm9udEZhbWlseTtcbiAgICAgICAgdGhpcy5sYWJlbCA9IHBoaW5hLmRpc3BsYXkuT3V0bGluZUxhYmVsKHRoaXMudGV4dCwgc3R5bGUuZm9udFNpemUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLmJ1dHRvbilcbiAgICAgICAgICAgIC5zZXRQYXJhbSh0aGlzLmxhYmVsUGFyYW0pO1xuICAgIH0sXG59KTtcblxuLy/jg4jjgrDjg6vjg5zjgr/jg7NcbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5Ub2dnbGVCdXR0b25cIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgLy/mj4/nlLvjgrnjgr/jgqTjg6voqK3lrppcbiAgICBERUZBVUxUX1NUWUxFOiB7XG4gICAgICAgIGJ1dHRvbkNvbG9yOiAncmdiYSg1MCwgMTUwLCAyNTUsIDAuOCknLFxuICAgICAgICBsaW5lQ29sb3I6ICdyZ2JhKDIwMCwgMjAwLCAyMDAsIDAuNSknLFxuICAgICAgICBsaW5lV2lkdGg6IDQsXG4gICAgICAgIHNoYWRvd0NvbG9yOiAncmdiYSgwLCAwLCAwLCAwLjUpJyxcbiAgICAgICAgZm9udEZhbWlseTogXCJVYnVudHVNb25vXCIsXG4gICAgICAgIGZvbnRTaXplOiA1MCxcbiAgICAgICAgZmFsdDogZmFsc2UsXG4gICAgfSxcblxuICAgIERFRkFVTFRfU1RZTEVfRkxBVDoge1xuICAgICAgICBidXR0b25Db2xvcjogJ3JnYmEoMTUwLCAxNTAsIDI1MCwgMS4wKScsXG4gICAgICAgIGxpbmVDb2xvcjogJ3JnYmEoMCwgMCwgMCwgMC41KScsXG4gICAgICAgIGxpbmVXaWR0aDogMyxcbiAgICAgICAgZm9udEZhbWlseTogXCJVYnVudHVNb25vXCIsXG4gICAgICAgIGZvbnRTaXplOiA1MCxcbiAgICAgICAgZmxhdDogdHJ1ZSxcbiAgICB9LFxuXG4gICAgbGFiZWxQYXJhbToge2FsaWduOiBcImNlbnRlclwiLCBiYXNlbGluZTpcIm1pZGRsZVwiLCBvdXRsaW5lV2lkdGg6MyB9LFxuXG4gICAgb25UZXh0OiBcIlwiLFxuICAgIG9mZlRleHQ6IFwiXCIsXG4gICAgcHVzaDogZmFsc2UsXG4gICAgbG9jazogZmFsc2UsXG4gICAgX3RvZ2dsZU9OOiBmYWxzZSxcblxuICAgIC8v44Oc44K/44Oz5oq85LiL5pmC44Gu56e75YuV6YePXG4gICAgZG93blg6IDAsXG4gICAgZG93blk6IDEwLFxuXG4gICAgLy/jg5Xjg6njg4Pjg4jmmYLpgI/mmI7luqZcbiAgICBhbHBoYU9OOiAwLjksXG4gICAgYWxwaGFPRkY6IDAuNCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IChvcHRpb25zfHx7fSkuJHNhZmUoe1xuICAgICAgICAgICAgd2lkdGg6IDIwMCxcbiAgICAgICAgICAgIGhlaWdodDogODAsXG4gICAgICAgICAgICBvblRleHQ6IFwiT05cIixcbiAgICAgICAgICAgIG9mZlRleHQ6IFwiT0ZGXCIsXG4gICAgICAgICAgICBzdHlsZTogbnVsbFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiBcbiAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbnMud2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gb3B0aW9ucy5oZWlnaHQ7XG4gICAgICAgIHRoaXMub25UZXh0ID0gb3B0aW9ucy5vblRleHQ7XG4gICAgICAgIHRoaXMub2ZmVGV4dCA9IG9wdGlvbnMub2ZmVGV4dDtcblxuICAgICAgICAvL+OCu+ODg+ODiOOCouODg+ODl1xuICAgICAgICB0aGlzLnNldHVwKHN0eWxlKTtcblxuICAgICAgICAvL+WIpOWumuWHpueQhuioreWumlxuICAgICAgICB0aGlzLmludGVyYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ib3VuZGluZ1R5cGUgPSBcInJlY3RcIjtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKHN0eWxlKSB7XG4gICAgICAgIHN0eWxlID0gc3R5bGUgfHwge307XG4gICAgICAgIGlmIChzdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICBzdHlsZS4kc2FmZSh0aGlzLkRFRkFVTFRfU1RZTEVfRkxBVCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdHlsZS4kc2FmZSh0aGlzLkRFRkFVTFRfU1RZTEUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3R5bGUgPSBzdHlsZTtcblxuICAgICAgICAvL+eZu+mMsua4iOOBv+OBruWgtOWQiOegtOajhOOBmeOCi1xuICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHtcbiAgICAgICAgICAgIGlmICghc3R5bGUuZmxhdCkgdGhpcy5zaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmxhYmVsLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5idXR0b24ucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLndpZHRoLCBoZWlnaHQgPSB0aGlzLmhlaWdodDtcblxuICAgICAgICBpZiAoIXN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgIC8v44Oc44K/44Oz5b2xXG4gICAgICAgICAgICB2YXIgc2hhZG93U3R5bGUgPSB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgICAgIGZpbGw6IHN0eWxlLnNoYWRvd0NvbG9yLFxuICAgICAgICAgICAgICAgIHN0cm9rZTogc3R5bGUuc2hhZG93Q29sb3IsXG4gICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IHN0eWxlLnN0cm9rZVdpZHRoXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5zaGFkb3cgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHNoYWRvd1N0eWxlKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKHRoaXMuZG93blgsIHRoaXMuZG93blkpO1xuICAgICAgICAgICAgdGhpcy5zaGFkb3cuYmxlbmRNb2RlID0gXCJzb3VyY2Utb3ZlclwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5zjgr/jg7PmnKzkvZNcbiAgICAgICAgdmFyIGJ1dHRvblN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICBmaWxsOiBzdHlsZS5idXR0b25Db2xvcixcbiAgICAgICAgICAgIHN0cm9rZTogc3R5bGUubGluZUNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IHN0eWxlLnN0cm9rZVdpZHRoXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYnV0dG9uID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShidXR0b25TdHlsZSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICBpZiAoc3R5bGUuZmxhdCkgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9GRik7XG5cbiAgICAgICAgLy/jg5zjgr/jg7Pjg6njg5njg6tcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMuYnV0dG9uO1xuICAgICAgICBpZiAoc3R5bGUuZmxhdCkgcGFyZW50ID0gdGhpcztcbiAgICAgICAgdGhpcy5sYWJlbFBhcmFtLmZvbnRGYW1pbHkgPSBzdHlsZS5mb250RmFtaWx5O1xuICAgICAgICB0aGlzLmxhYmVsID0gcGhpbmEuZGlzcGxheS5PdXRsaW5lTGFiZWwodGhpcy50ZXh0LCBzdHlsZS5mb250U2l6ZSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHBhcmVudClcbiAgICAgICAgICAgIC5zZXRQYXJhbSh0aGlzLmxhYmVsUGFyYW0pO1xuICAgIH0sXG4gICAgc2V0TG9jazogZnVuY3Rpb24oYikge1xuICAgICAgICB0aGlzLmxvY2sgPSBiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgYnV0dG9uUHVzaFN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMucHVzaCA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLl90b2dnbGVPTikge1xuICAgICAgICAgICAgaWYgKHRoaXMuc3R5bGUuZmxhdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPTik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggKz0gdGhpcy5kb3duWCowLjU7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSArPSB0aGlzLmRvd25ZKjAuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi5zZXRBbHBoYSh0aGlzLmFscGhhT0ZGKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCArPSB0aGlzLmRvd25YKjEuNTtcbiAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi55ICs9IHRoaXMuZG93blkqMS41O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBidXR0b25QdXNoTW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcHQgPSBlLnBvaW50aW5nO1xuICAgICAgICBpZiAodGhpcy5pc0hpdFBvaW50KHB0LngsIHB0LnkpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucHVzaCkge1xuICAgICAgICAgICAgICAgIHRoaXMucHVzaCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3RvZ2dsZU9OKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPTik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi54ICs9IHRoaXMuZG93blgqMC41O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSArPSB0aGlzLmRvd25ZKjAuNTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPRkYpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCArPSB0aGlzLmRvd25YKjEuNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgKz0gdGhpcy5kb3duWSoxLjU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wdXNoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wdXNoID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX3RvZ2dsZU9OKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPTik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi54IC09IHRoaXMuZG93blgqMC41O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSAtPSB0aGlzLmRvd25ZKjAuNTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnNldEFscGhhKHRoaXMuYWxwaGFPRkYpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCAtPSB0aGlzLmRvd25YKjEuNTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgLT0gdGhpcy5kb3duWSoxLjU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGJ1dHRvblB1c2hFbmQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHB0ID0gZS5wb2ludGluZztcbiAgICAgICAgaWYgKHRoaXMuaXNIaXRQb2ludChwdC54LCBwdC55KSkge1xuICAgICAgICAgICAgdGhpcy5wdXNoID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLl90b2dnbGVPTiA9ICF0aGlzLl90b2dnbGVPTjtcbiAgICAgICAgICAgIGlmICh0aGlzLl90b2dnbGVPTikge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4dCA9IHRoaXMub25UZXh0O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9OKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi54IC09IHRoaXMuZG93blgqMC41O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmJ1dHRvbi55IC09IHRoaXMuZG93blkqMC41O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0ID0gdGhpcy5vZmZUZXh0O1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnN0eWxlLmZsYXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9GRik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCAtPSB0aGlzLmRvd25YKjEuNTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSAtPSB0aGlzLmRvd25ZKjEuNTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmxhYmVsLnRleHQgPSB0aGlzLnRleHQ7XG4gICAgICAgICAgICB2YXIgZSA9IHBoaW5hLmV2ZW50LkV2ZW50KFwicHVzaGVkXCIpO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIG9udG91Y2hzdGFydDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5sb2NrKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5wdXNoID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5idXR0b25QdXNoU3RhcnQoZSk7XG4gICAgICAgIHZhciBlID0gcGhpbmEuZXZlbnQuRXZlbnQoXCJwdXNoXCIpO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZSk7XG4gICAgfSxcbiAgICBvbnRvdWNobW92ZTogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy5sb2NrKSByZXR1cm47XG4gICAgICAgIHRoaXMuYnV0dG9uUHVzaE1vdmUoZSk7XG4gICAgfSxcbiAgICBvbnRvdWNoZW5kOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLmxvY2spIHJldHVybjtcblxuICAgICAgICB2YXIgcHQgPSBlLnBvaW50aW5nO1xuICAgICAgICBpZiAodGhpcy5pc0hpdFBvaW50KHB0LngsIHB0LnkpKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2ggPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuYnV0dG9uUHVzaEVuZChlKTtcblxuICAgICAgICAgICAgdmFyIGUgPSBwaGluYS5ldmVudC5FdmVudChcInB1c2hlZFwiKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbnBoaW5hLmV4dGVuc2lvbi5Ub2dnbGVCdXR0b24ucHJvdG90eXBlLmFjY2Vzc29yKFwidG9nZ2xlT05cIiwge1xuICAgIFwic2V0XCI6IGZ1bmN0aW9uKGIpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlT04gPSBiO1xuXG4gICAgICAgIGlmICh0aGlzLl90b2dnbGVPTikge1xuICAgICAgICAgICAgdGhpcy50ZXh0ID0gdGhpcy5vblRleHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9OKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueCA9IHRoaXMuZG93blg7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24ueSA9IHRoaXMuZG93blk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRleHQgPSB0aGlzLm9mZlRleHQ7XG4gICAgICAgICAgICBpZiAodGhpcy5zdHlsZS5mbGF0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5idXR0b24uc2V0QWxwaGEodGhpcy5hbHBoYU9GRik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnggPSAwO1xuICAgICAgICAgICAgICAgIHRoaXMuYnV0dG9uLnkgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMubGFiZWwudGV4dCA9IHRoaXMudGV4dDtcbiAgICB9LFxuXG4gICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl90b2dnbGVPTjtcbiAgICB9LFxufSk7XG5cbi8v44K544Op44Kk44OJ44Oc44K/44OzXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uU2xpZGVCdXR0b25cIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgLy/mj4/nlLvjgrnjgr/jgqTjg6voqK3lrppcbiAgICBERUZBVUxUX1NUWUxFOiB7XG4gICAgICAgIHdpZHRoOiAxNjAsXG4gICAgICAgIGhlaWdodDogODAsXG5cbiAgICAgICAgYnV0dG9uV2l0ZGg6IDgwLFxuICAgICAgICBidXR0b25IZWlnaHQ6IDgwLFxuXG4gICAgICAgIC8v44Oc44K/44Oz6ImyXG4gICAgICAgIGJ1dHRvbkNvbG9yOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAxLjApJyxcbiAgICAgICAgYnV0dG9uTGluZTogICdyZ2JhKDIwMCwgMjAwLCAyMDAsIDEuMCknLFxuICAgICAgICBsaW5lV2lkdGg6IDIsXG5cbiAgICAgICAgLy/jg5njg7zjgrkob24vb2ZmKeiJslxuICAgICAgICBvbkNvbG9yOiAncmdiYSgwLCAyNTUsIDAsIDEuMCknLFxuICAgICAgICBvZmZDb2xvcjogJ3JnYmEoMjAwLCAyMDAsIDIwMCwgMS4wKScsXG4gICAgfSxcblxuICAgIF9zbGlkZU9OOiBmYWxzZSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHN0eWxlKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgICAgdGhpcy5zdHlsZSA9IHN0eWxlIHx8IHt9O1xuICAgICAgICB0aGlzLnN0eWxlLiRzYWZlKHRoaXMuREVGQVVMVF9TVFlMRSlcblxuICAgICAgICB0aGlzLndpZHRoID0gc3R5bGUud2lkdGggfHwgMTYwO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHN0eWxlLmhlaWdodCB8fCA4MDtcblxuICAgICAgICB0aGlzLnRleHQgPSB0aGlzLm9mZlRleHQ7XG5cbiAgICAgICAgLy/jgrvjg4Pjg4jjgqLjg4Pjg5dcbiAgICAgICAgdGhpcy5zZXR1cCgpO1xuXG4gICAgICAgIC8v5Yik5a6a5Yem55CG6Kit5a6aXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmJvdW5kaW5nVHlwZSA9IFwicmVjdFwiO1xuLy8gICAgICAgIHRoaXMuY2hlY2tIaWVyYXJjaHkgPSB0cnVlO1xuXG4gICAgICAgIC8v44Kk44OZ44Oz44OI44Oq44K544OK55m76YyyXG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fc2xpZGVPTikge1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBlID0gcGhpbmEuZXZlbnQuRXZlbnQoXCJzbGlkZVwiKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/nmbvpjLLmuIjjgb/jga7loLTlkIjnoLTmo4TjgZnjgotcbiAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICB0aGlzLnNoYWRvdy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMubGFiZWwucmVtb3ZlKCk7XG4gICAgICAgICAgICB0aGlzLmJ1dHRvbi5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHlsZSA9IHRoaXMuc3R5bGU7XG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGgsIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICB2YXIgYnV0dG9uV2lkdGggPSB0aGlzLmJ1dHRvbiwgaGVpZ2h0QnV0dG9uID0gdGhpcy5oZWlnaHRCdXR0b247XG5cbiAgICAgICAgLy/jg5zjgr/jg7Pjg5njg7zjgrlcbiAgICAgICAgdmFyIGJhc2VTdHlsZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgZmlsbDogc3R5bGUub2ZmQ29sb3IsXG4gICAgICAgICAgICBzdHJva2U6IHN0eWxlLm9mZkNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6ICBzdHlsZS5zdHJva2VXaWR0aFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJ1dHRvbiA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUoYnV0dG9uU3R5bGUpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcblxuICAgICAgICAvL+ODnOOCv+ODs+acrOS9k1xuICAgICAgICB2YXIgYnV0dG9uU3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogYnV0dG9uV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGJ1dHRvbkhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IHN0eWxlLmJ1dHRvbkNvbG9yLFxuICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5saW5lQ29sb3IsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogc3R5bGUuc3Ryb2tlV2lkdGhcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKGJ1dHRvblN0eWxlKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgfSxcbn0pO1xuXG5waGluYS5leHRlbnNpb24uU2xpZGVCdXR0b24ucHJvdG90eXBlLmFjY2Vzc29yKFwic2xpZGVPTlwiLCB7XG4gICAgXCJzZXRcIjogZnVuY3Rpb24oYikge1xuICAgICAgICB0aGlzLl9zbGlkZU9OID0gYjtcblxuICAgICAgICBpZiAodGhpcy5fc2xpZGVPTikge1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2xpZGVPTjtcbiAgICB9LFxufSk7XG4iLCIvKlxuICogY29sbGlzaW9uLmpzXG4gKi9cblxucGhpbmEuY29sbGlzaW9uID0gcGhpbmEuY29sbGlzaW9uIHx8IHt9O1xuIFxuKGZ1bmN0aW9uKCkge1xuXG4gICAgLyoqXG4gICAgICogQGNsYXNzIHBoaW5hLmNvbGxpc2lvblxuICAgICAqIOihneeqgeWIpOWumlxuICAgICAqL1xuICAgIHBoaW5hLmNvbGxpc2lvbjtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRlc3RDaXJjbGVDaXJjbGVcbiAgICAgKiDlhoblkIzlo6vjga7ooZ3nqoHliKTlrppcbiAgICAgKi9cbiAgICBwaGluYS5jb2xsaXNpb24udGVzdENpcmNsZUNpcmNsZSA9IGZ1bmN0aW9uKGNpcmNsZTAsIGNpcmNsZTEpIHtcbiAgICAgICAgdmFyIGRpc3RhbmNlU3F1YXJlZCA9IHBoaW5hLmdlb20uVmVjdG9yMi5kaXN0YW5jZVNxdWFyZWQoY2lyY2xlMCwgY2lyY2xlMSk7XG4gICAgICAgIHJldHVybiBkaXN0YW5jZVNxdWFyZWQgPD0gTWF0aC5wb3coY2lyY2xlMC5yYWRpdXMgKyBjaXJjbGUxLnJhZGl1cywgMik7XG4gICAgfTtcbiAgICBcbiAgICAvKipcbiAgICAgKiBAbWV0aG9kIHRlc3RSZWN0UmVjdFxuICAgICAqIOefqeW9ouWQjOWjq+OBruihneeqgeWIpOWumlxuICAgICAqL1xuICAgIHBoaW5hLmNvbGxpc2lvbi50ZXN0UmVjdFJlY3QgPSBmdW5jdGlvbihyZWN0MCwgcmVjdDEpIHtcbiAgICAgICAgcmV0dXJuIChyZWN0MC5sZWZ0IDwgcmVjdDEucmlnaHQpICYmIChyZWN0MC5yaWdodCA+IHJlY3QxLmxlZnQpICYmXG4gICAgICAgICAgICAgICAocmVjdDAudG9wIDwgcmVjdDEuYm90dG9tKSAmJiAocmVjdDAuYm90dG9tID4gcmVjdDEudG9wKTtcbiAgICB9O1xuXG4gICAgcGhpbmEuY29sbGlzaW9uLnRlc3RDaXJjbGVSZWN0ID0gZnVuY3Rpb24oY2lyY2xlLCByZWN0KSB7XG4gICAgICAgIC8vIOOBvuOBmuOBr+Wkp+OBjeOBquefqeW9ouOBp+WIpOWumijpq5jpgJ/ljJYpXG4gICAgICAgIHZhciBiaWdSZWN0ID0gcGhpbmEuZ2VvbS5SZWN0KHJlY3QubGVmdC1jaXJjbGUucmFkaXVzLCByZWN0LnRvcC1jaXJjbGUucmFkaXVzLCByZWN0LndpZHRoK2NpcmNsZS5yYWRpdXMqMiwgcmVjdC5oZWlnaHQrY2lyY2xlLnJhZGl1cyoyKTtcbiAgICAgICAgaWYgKGJpZ1JlY3QuY29udGFpbnMoY2lyY2xlLngsIGNpcmNsZS55KSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICAvLyAy56iu6aGe44Gu55+p5b2i44Go6KGd56qB5Yik5a6aXG4gICAgICAgIHZhciByID0gcGhpbmEuZ2VvbS5SZWN0KHJlY3QubGVmdC1jaXJjbGUucmFkaXVzLCByZWN0LnRvcCwgcmVjdC53aWR0aCtjaXJjbGUucmFkaXVzKjIsIHJlY3QuaGVpZ2h0KTtcbiAgICAgICAgaWYgKHIuY29udGFpbnMoY2lyY2xlLngsIGNpcmNsZS55KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgci5zZXQocmVjdC5sZWZ0LCByZWN0LnRvcC1jaXJjbGUucmFkaXVzLCByZWN0LndpZHRoLCByZWN0LmhlaWdodCtjaXJjbGUucmFkaXVzKjIpO1xuICAgICAgICBpZiAoci5jb250YWlucyhjaXJjbGUueCwgY2lyY2xlLnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgLy8g5YaG44Go55+p5b2i44Gu77yU54K544Gu5Yik5a6aXG4gICAgICAgIHZhciBjID0gcGhpbmEuZ2VvbS5DaXJjbGUoY2lyY2xlLngsIGNpcmNsZS55LCBjaXJjbGUucmFkaXVzKTtcbiAgICAgICAgLy8gbGVmdCB0b3BcbiAgICAgICAgaWYgKGMuY29udGFpbnMocmVjdC5sZWZ0LCByZWN0LnRvcCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJpZ2h0IHRvcFxuICAgICAgICBpZiAoYy5jb250YWlucyhyZWN0LnJpZ2h0LCByZWN0LnRvcCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJpZ2h0IGJvdHRvbVxuICAgICAgICBpZiAoYy5jb250YWlucyhyZWN0LnJpZ2h0LCByZWN0LmJvdHRvbSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vIGxlZnQgYm90dG9tXG4gICAgICAgIGlmIChjLmNvbnRhaW5zKHJlY3QubGVmdCwgcmVjdC5ib3R0b20pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBwaGluYS5jb2xsaXNpb24udGVzdFJlY3RDaXJjbGUgPSBmdW5jdGlvbihyZWN0LCBjaXJjbGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGVzdENpcmNsZVJlY3QoY2lyY2xlLCByZWN0KTtcbiAgICB9O1xuIFxufSkoKTtcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuIiwiLypcbiAqICBleHRlbnNpb24uanNcbiAqICAyMDE1LzA5LzA4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vL+OCqOODrOODoeODs+ODiOWQjOWjq+OBruaOpeinpuWIpOWumlxucGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudC5wcm90b3R5cGUuaXNIaXRFbGVtZW50ID0gZnVuY3Rpb24oZWxtKSB7XG4gICAgaWYgKHRoaXMuYm91bmRpbmdUeXBlID09ICdyZWN0Jykge1xuICAgICAgICBpZiAoZWxtLmJvdW5kaW5nVHlwZSA9PSAncmVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwaGluYS5jb2xsaXNpb24udGVzdFJlY3RSZWN0KHRoaXMsIGVsbSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gcGhpbmEuY29sbGlzaW9uLnRlc3RSZWN0Q2lyY2xlKHRoaXMsIGVsbSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZWxtLmJvdW5kaW5nVHlwZSA9PSAncmVjdCcpIHtcbiAgICAgICAgICAgIHJldHVybiBwaGluYS5jb2xsaXNpb24udGVzdFJlY3RDaXJjbGUoZWxtLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwaGluYS5jb2xsaXNpb24udGVzdENpcmNsZUNpcmNsZSh0aGlzLCBlbG0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vL+WtkOimgee0oOWFqOOBpuWIh+OCiumbouOBl1xucGhpbmEuYXBwLkVsZW1lbnQucHJvdG90eXBlLnJlbW92ZUNoaWxkcmVuID0gZnVuY3Rpb24oYmVnaW5JbmRleCkge1xuICAgIGJlZ2luSW5kZXggPSBiZWdpbkluZGV4IHx8IDA7XG4gICAgdmFyIHRlbXBDaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW4uc2xpY2UoKTtcbiAgICB2YXIgbGVuID0gdGVtcENoaWxkcmVuLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gYmVnaW5JbmRleDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICAgIHRlbXBDaGlsZHJlbltpXS5yZW1vdmUoKTtcbiAgICB9XG4gICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xufVxuXG4vL+OCv+ODvOOCsuODg+ODiOaWueWQkeOCkuWQkeOBj1xucGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudC5wcm90b3R5cGUubG9va0F0ID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHt4OiAwLCB5OiAwfTtcblxuICAgIHZhciBheCA9IHRoaXMueCAtIHRhcmdldC54O1xuICAgIHZhciBheSA9IHRoaXMueSAtIHRhcmdldC55O1xuICAgIHZhciByYWQgPSBNYXRoLmF0YW4yKGF5LCBheCk7XG4gICAgdmFyIGRlZyA9IH5+KHJhZCAqIHRvRGVnKTtcbiAgICB0aGlzLnJvdGF0aW9uID0gZGVnICsgOTA7XG4gICAgcmV0dXJuIHRoaXM7XG59XG5cbiIsIi8qXG4gKiAgZnJhbWUuanNcbiAqICAyMDE2LzEwLzEzXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLkZyYW1lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuU2hhcGVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgICAgICB0aGlzLnN0cm9rZVdpZHRoID0gMjtcblxuICAgICAgICB2YXIgeCA9IHRoaXMud2lkdGggLyAyO1xuICAgICAgICB2YXIgeSA9IHRoaXMuaGVpZ2h0IC8gMjtcblxuICAgICAgICAvL+OCv+OCpOODiOODq+ihqOekulxuICAgICAgICBpZiAob3B0aW9ucy50aXRsZSkge1xuICAgICAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbChvcHRpb25zLnRpdGxlKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKC14LCAteSlcbiAgICAgICAgICAgICAgICAuc2V0T3JpZ2luKDAsIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5Xjg6zjg7zjg6Djga7mj4/nlLvjg5HjgrlcbiAgICAgICAgdGhpcy5kcmF3UGF0aCA9IFtcbiAgICAgICAgICAgIC8v5LiK6L66XG4gICAgICAgICAgICB7eDogLXgrIDIwLCB5OiAteSAgICwgc2lkZTogMH0sXG4gICAgICAgICAgICB7eDogLXgrMTUwLCB5OiAteSAgICwgc2lkZTogMH0sXG4gICAgICAgICAgICB7eDogLXgrMTYwLCB5OiAteSsyMCwgc2lkZTogMH0sXG4gICAgICAgICAgICB7eDogIHgtICA1LCB5OiAteSsyMCwgc2lkZTogMH0sXG4gICAgICAgICAgICB7eDogIHggICAgLCB5OiAteSsyNSwgc2lkZTogMH0sXG4vKlxuICAgICAgICAgICAge3g6IC14KzEwLCB5OiAteSAgICwgc2lkZTogMH0sXG4gICAgICAgICAgICB7eDogIHgtIDUsIHk6IC15ICAgLCBzaWRlOiAwfSxcbiAgICAgICAgICAgIHt4OiAgeCAgICwgeTogLXkrIDUsIHNpZGU6IDB9LFxuKi9cbiAgICAgICAgICAgIC8v5Y+z6L66XG4gICAgICAgICAgICB7eDogIHggICAsIHk6ICB5LTEwLCBzaWRlOiAxfSxcbiAgICAgICAgICAgIHt4OiAgeC0xMCwgeTogIHkgICAsIHNpZGU6IDF9LFxuXG4gICAgICAgICAgICAvL+S4i+i+ulxuICAgICAgICAgICAge3g6IC14KzM1LCB5OiAgeSAgICwgc2lkZTogMn0sXG4gICAgICAgICAgICB7eDogLXgrMzAsIHk6ICB5LSA1LCBzaWRlOiAyfSxcbiAgICAgICAgICAgIHt4OiAteCAgICwgeTogIHktIDUsIHNpZGU6IDJ9LFxuXG4gICAgICAgICAgICAvL+W3pui+ulxuICAgICAgICAgICAge3g6IC14ICAgLCB5OiAteSsyMCwgc2lkZTogM30sXG4gICAgICAgIF07XG5cbiAgICAgICAgLy/lpJblgbTjg5Xjg6zjg7zjg6Djga7jgqrjg5Xjgrvjg4Pjg4jluYVcbiAgICAgICAgdGhpcy5kcmF3UGF0aE9mZnNldCA9IDM7XG4gICAgfSxcblxuICAgIHByZXJlbmRlcjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgIHZhciBjID0gY2FudmFzLmNvbnRleHQ7XG5cbiAgICAgICAgdmFyIHggPSB0aGlzLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmhlaWdodCAvIDI7XG5cbiAgICAgICAgdmFyIHAgPSB0aGlzLmRyYXdQYXRoO1xuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICBjLm1vdmVUbyhwWzBdLngsIHBbMF0ueSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYy5saW5lVG8ocFtpXS54LCBwW2ldLnkpO1xuICAgICAgICB9XG4gICAgICAgIGMuY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgdmFyIHNnID0gYy5jcmVhdGVMaW5lYXJHcmFkaWVudCh5LCAteCwgLXksIHgpO1xuICAgICAgICBzZy5hZGRDb2xvclN0b3AoMC4wMCwgXCJoc2xhKDIzMCwgMTAwJSwgNDAlLCAwLjgpXCIpO1xuICAgICAgICBzZy5hZGRDb2xvclN0b3AoMC4zOCwgXCJoc2xhKDIzMCwgMTAwJSwgNDAlLCAwLjgpXCIpO1xuICAgICAgICBzZy5hZGRDb2xvclN0b3AoMC40OCwgXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjgpXCIpO1xuICAgICAgICBzZy5hZGRDb2xvclN0b3AoMC41MiwgXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjgpXCIpO1xuICAgICAgICBzZy5hZGRDb2xvclN0b3AoMC42MiwgXCJoc2xhKDIzMCwgMTAwJSwgNDAlLCAwLjgpXCIpO1xuICAgICAgICBzZy5hZGRDb2xvclN0b3AoMS4wMCwgXCJoc2xhKDIzMCwgMTAwJSwgNDAlLCAwLjgpXCIpO1xuICAgICAgICB0aGlzLnN0cm9rZSA9IHNnO1xuICAgICAgICB0aGlzLnN0cm9rZVdpZHRoID0gNTtcblxuICAgICAgICB2YXIgZmcgPSBjLmNyZWF0ZUxpbmVhckdyYWRpZW50KHksIC14LCAteSwgeCk7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjAwLCBcImhzbGEoMjUwLCAxMDAlLCA0MCUsIDAuMilcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjM4LCBcImhzbGEoMjUwLCAxMDAlLCA0MCUsIDAuMilcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjQ4LCBcImhzbGEoMjUwLCAxMDAlLCA2MCUsIDAuMilcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjUyLCBcImhzbGEoMjUwLCAxMDAlLCA2MCUsIDAuMilcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjYyLCBcImhzbGEoMjUwLCAxMDAlLCA0MCUsIDAuMilcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgxLjAwLCBcImhzbGEoMjUwLCAxMDAlLCA0MCUsIDAuMilcIik7XG4gICAgICAgIHRoaXMuZmlsbCA9IGZnO1xuICAgIH0sXG5cbiAgICBwb3N0cmVuZGVyOiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgICAgdmFyIGMgPSBjYW52YXMuY29udGV4dDtcblxuICAgICAgICB2YXIgeCA9IHRoaXMud2lkdGggLyAyO1xuICAgICAgICB2YXIgeSA9IHRoaXMuaGVpZ2h0IC8gMjtcblxuICAgICAgICB2YXIgcCA9IHRoaXMuZHJhd1BhdGg7XG4gICAgICAgIHZhciBvZmYgPSB0aGlzLmRyYXdQYXRoT2Zmc2V0O1xuXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgICAgIGMubW92ZVRvKHBbMF0ueC1vZmYsIHBbMF0ueS1vZmYpO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBweCA9IHBbaV0ueDtcbiAgICAgICAgICAgIHZhciBweSA9IHBbaV0ueTtcbiAgICAgICAgICAgIHN3aXRjaCAocFtpXS5zaWRlKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBweCArPSBvZmY7IHB5IC09IG9mZjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBweCArPSBvZmY7IHB5ICs9IG9mZjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICBweCAtPSBvZmY7IHB5ICs9IG9mZjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgICAgICBweCAtPSBvZmY7IHB5IC09IG9mZjtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjLmxpbmVUbyhweCwgcHkpO1xuICAgICAgICB9XG4gICAgICAgIGMuY2xvc2VQYXRoKCk7XG5cbiAgICAgICAgYy5saW5lV2lkdGggPSAyO1xuICAgICAgICBjLnN0cm9rZSgpO1xuICAgIH0sXG59KTtcblxucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLkN1cnNvbEZyYW1lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuU2hhcGVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYm91bmRpbmdUeXBlID0gXCJyZWN0XCI7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgICAgICB0aGlzLnN0cm9rZVdpZHRoID0gMjtcbiAgICB9LFxuXG4gICAgcHJlcmVuZGVyOiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmhlaWdodCAvIDI7XG5cbiAgICAgICAgdmFyIGMgPSBjYW52YXMuY29udGV4dDtcblxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuXG4gICAgICAgIC8v5LiK6L66XG4gICAgICAgIGMubW92ZVRvKC14ICsgMTAsIC15ICAgICApO1xuICAgICAgICBjLmxpbmVUbyggeCAtIDEwLCAteSAgICAgKTtcblxuICAgICAgICAvL+WPs+i+ulxuICAgICAgICBjLmxpbmVUbyggeCAgICAgLCAteSArIDEwKTtcbiAgICAgICAgYy5saW5lVG8oIHggICAgICwgIHkgLSAxMCk7XG5cbiAgICAgICAgLy/kuIvovrpcbiAgICAgICAgYy5saW5lVG8oIHggLSAxMCwgIHkgICAgICk7XG4gICAgICAgIGMubGluZVRvKC14ICsgMTAsICB5ICAgICApO1xuXG4gICAgICAgIC8v5Y+z6L66XG4gICAgICAgIGMubGluZVRvKC14ICAgICAsICB5IC0gMTApO1xuICAgICAgICBjLmxpbmVUbygteCAgICAgLCAteSArIDEwKTtcblxuICAgICAgICBjLmNsb3NlUGF0aCgpO1xuXG4gICAgICAgIHZhciBzZyA9IGMuY3JlYXRlTGluZWFyR3JhZGllbnQoMCwgLXksICAwLCB5KTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuMDAsIFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuMzgsIFwiaHNsYSgyMzAsIDEwMCUsIDk1JSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuNDgsIFwiaHNsYSgyMzAsIDEwMCUsIDkwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuNTIsIFwiaHNsYSgyMzAsIDEwMCUsIDcwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDAuNjIsIFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC44KVwiKTtcbiAgICAgICAgc2cuYWRkQ29sb3JTdG9wKDEuMDAsIFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC44KVwiKTtcbiAgICAgICAgdGhpcy5zdHJva2UgPSBzZztcbiAgICAgICAgdGhpcy5zdHJva2VXaWR0aCA9IDM7XG5cbiAgICAgICAgdmFyIGZnID0gYy5jcmVhdGVMaW5lYXJHcmFkaWVudCgwLCAteSwgMCwgeSk7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjAwLCBcImhzbGEoMjMwLCAxMDAlLCA1MCUsIDAuOClcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjM4LCBcImhzbGEoMjMwLCAxMDAlLCA4MCUsIDAuOClcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjQ4LCBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOClcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjUyLCBcImhzbGEoMjMwLCAxMDAlLCA1MCUsIDAuOClcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgwLjYyLCBcImhzbGEoMjMwLCAxMDAlLCA1MCUsIDAuOClcIik7XG4gICAgICAgIGZnLmFkZENvbG9yU3RvcCgxLjAwLCBcImhzbGEoMjMwLCAxMDAlLCA1MCUsIDAuOClcIik7XG4gICAgICAgIHRoaXMuZmlsbCA9IGZnO1xuICAgIH0sXG5cbiAgICBwb3N0cmVuZGVyOiBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgICAgdmFyIHggPSB0aGlzLndpZHRoIC8gMjtcbiAgICAgICAgdmFyIHkgPSB0aGlzLmhlaWdodCAvIDI7XG5cbiAgICAgICAgdmFyIGMgPSBjYW52YXMuY29udGV4dDtcbiAgICAgICAgYy5saW5lV2lkdGggPSAzO1xuXG4gICAgICAgIGMubW92ZVRvKC14ICsgMTAgLSA1LCAteSAgICAgKTtcbiAgICAgICAgYy5saW5lVG8oLXggICAgICAtIDUsIC15ICsgMTApO1xuICAgICAgICBjLmxpbmVUbygteCAgICAgIC0gNSwgIHkgLSAxMCk7XG4gICAgICAgIGMubGluZVRvKC14ICsgMTAgLSA1LCAgeSAgICAgKTtcblxuICAgICAgICBjLm1vdmVUbyggeCAtIDEwICsgNSwgLXkgICAgICk7XG4gICAgICAgIGMubGluZVRvKCB4ICAgICAgKyA1LCAteSArIDEwKTtcbiAgICAgICAgYy5saW5lVG8oIHggICAgICArIDUsICB5IC0gMTApO1xuICAgICAgICBjLmxpbmVUbyggeCAtIDEwICsgNSwgIHkgICAgICk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXJTdHJva2UoY2FudmFzKTtcbiAgICB9LFxufSk7XG5cbnBoaW5hLmRlZmluZShcInBoaW5hLmV4dGVuc2lvbi5DaXJjbGVCdXR0b25cIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5TaGFwZVwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7fS4kZXh0ZW5kKG9wdGlvbnMsIHtcbiAgICAgICAgICAgIHdpZHRoOiBvcHRpb25zLnJhZGl1cyAqIDIsXG4gICAgICAgICAgICBoZWlnaHQ6IG9wdGlvbnMucmFkaXVzICogMixcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuaW50ZXJhY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmJvdW5kaW5nVHlwZSA9IFwiY2lyY2xlXCI7XG4gICAgICAgIHRoaXMucmFkaXVzID0gb3B0aW9ucy5yYWRpdXM7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZENvbG9yID0gXCJ0cmFuc3BhcmVudFwiO1xuICAgICAgICB0aGlzLmZpbGwgPSBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuNClcIjtcbiAgICAgICAgdGhpcy5zdHJva2UgPSBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOSlcIjtcbiAgICAgICAgdGhpcy5zdHJva2VXaWR0aCA9IDI7XG5cbiAgICAgICAgdGhpcy5hY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMub24oJ2VudGVyZnJhbWUnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXIucm90YXRpb24rPTAuNTtcbiAgICAgICAgICAgICAgICB0aGlzLm91dGVyLnJvdGF0aW9uLT0wLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICB3aWR0aDogb3B0aW9ucy5yYWRpdXMgKiAyLFxuICAgICAgICAgICAgaGVpZ2h0OiBvcHRpb25zLnJhZGl1cyAqIDIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IFwidHJhbnNwYXJlbnRcIixcbiAgICAgICAgICAgIGZpbGw6IFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC40KVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOSlcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaW5uZXIgPSBwaGluYS5kaXNwbGF5LlNoYXBlKG9wdGlvbnMpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMuaW5uZXIucG9zdHJlbmRlciA9IGZ1bmN0aW9uKGNhbnZhcykge1xuICAgICAgICAgICAgdmFyIGMgPSBjYW52YXMuY29udGV4dDtcbiAgICAgICAgICAgIGMuc3Ryb2tlU3R5bGUgPSBcImhzbGEoMjMwLCAxMDAlLCA2MCUsIDAuOClcIjtcbiAgICAgICAgICAgIGZvciAodmFyIGEgPSAwLCBiOyBhIDwgTWF0aC5QSSAqIDI7KSB7XG4gICAgICAgICAgICAgICAgYiA9IE1hdGgucmFuZGZsb2F0KDEuMCwgMi4wKTtcbiAgICAgICAgICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIGMuYXJjKDAsIDAsIHRoYXQucmFkaXVzICogMC45MCwgYSwgYSArIGIsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjLmxpbmVXaWR0aCA9IE1hdGguZmxvb3IodGhhdC5yYWRpdXMqMC4yKTtcbiAgICAgICAgICAgICAgICBjLnN0cm9rZSgpO1xuICAgICAgICAgICAgICAgIGEgKz0gYiAqIDEuNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLm91dGVyID0gcGhpbmEuZGlzcGxheS5TaGFwZShvcHRpb25zKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLm91dGVyLnBvc3RyZW5kZXIgPSBmdW5jdGlvbihjYW52YXMpIHtcbiAgICAgICAgICAgIHZhciBjID0gY2FudmFzLmNvbnRleHQ7XG4gICAgICAgICAgICBjLnN0cm9rZVN0eWxlID0gXCJoc2xhKDIzMCwgMTAwJSwgNjAlLCAwLjgpXCI7XG4gICAgICAgICAgICBmb3IgKHZhciBhID0gMCwgYjsgYSA8IE1hdGguUEkgKiAyOykge1xuICAgICAgICAgICAgICAgIGIgPSBNYXRoLnJhbmRmbG9hdCgxLjAsIDIuMCk7XG4gICAgICAgICAgICAgICAgYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBjLmFyYygwLCAwLCB0aGF0LnJhZGl1cyAqIDEuMDAsIGEsIGEgKyBiLCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgYy5saW5lV2lkdGggPSBNYXRoLmZsb29yKHRoYXQucmFkaXVzKjAuMik7XG4gICAgICAgICAgICAgICAgYy5zdHJva2UoKTtcbiAgICAgICAgICAgICAgICBhICs9IGIgKiAxLjU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgcG9zdHJlbmRlcjogZnVuY3Rpb24oY2FudmFzKSB7XG4gICAgICAgIHZhciBjID0gY2FudmFzLmNvbnRleHQ7XG5cbiAgICAgICAgYy5zdHJva2VTdHlsZSA9IFwiaHNsYSgyMzAsIDEwMCUsIDYwJSwgMC44KVwiO1xuXG4gICAgICAgIC8v44Oc44K/44Oz5pys5L2TXG4gICAgICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgICAgIGMuYXJjKDAsIDAsIHRoaXMucmFkaXVzICogMC42NSwgMCwgTWF0aC5QSSAqIDIsIGZhbHNlKTtcbiAgICAgICAgYy5saW5lV2lkdGggPSAxO1xuICAgICAgICBjLmZpbGwoKTtcbiAgICAgICAgYy5zdHJva2UoKTtcblxuICAgICAgICAvL+ODnOOCv+ODs+Wklue4gVxuICAgICAgICBjLmJlZ2luUGF0aCgpO1xuICAgICAgICBjLmFyYygwLCAwLCB0aGlzLnJhZGl1cyAqIDAuNzUsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgICAgIGMubGluZVdpZHRoID0gTWF0aC5mbG9vcih0aGlzLnJhZGl1cyowLjEpO1xuICAgICAgICBjLnN0cm9rZSgpO1xuICAgIH0sXG5cbiAgICBvbnBvaW50c3RhcnQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5zY2FsZVggPSAxLjI7XG4gICAgICAgIHRoaXMuc2NhbGVZID0gMS4yO1xuICAgIH0sXG5cbiAgICBvbnBvaW50ZW5kOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMuc2NhbGVYID0gMS4wO1xuICAgICAgICB0aGlzLnNjYWxlWSA9IDEuMDtcbiAgICAgICAgaWYgKHRoaXMuaGl0VGVzdChlLnBvaW50ZXIueCwgZS5wb2ludGVyLnkpKSB7XG4gICAgICAgICAgICB0aGlzLmZsYXJlKFwiY2xpY2tlZFwiKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgZ2F1Z2UuanNcbiAqICAyMDE2LzA3LzE5XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZXh0ZW5zaW9uID0gcGhpbmEuZXh0ZW5zaW9uIHx8IHt9O1xuXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uR2F1Z2VcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgLy/mj4/nlLvjgrnjgr/jgqTjg6voqK3lrppcbiAgICBERUZBVUxUX1NUWUxFOiB7XG4gICAgICAgIGZpbGw6ICdyZ2JhKDAsIDAsIDIwMCwgMS4wKScsXG4gICAgICAgIGVtcHR5OiAncmdiYSgwLCAwLCAwLCAwLjApJyxcbiAgICAgICAgc3Ryb2tlOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAxLjApJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDQsXG4gICAgfSxcblxuICAgIG1pbjogMCxcbiAgICBtYXg6IDEwMCxcbiAgICB2YWx1ZTogMTAwLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICBvcHRpb25zID0gKG9wdGlvbnN8fHt9KS4kc2FmZSh7XG4gICAgICAgICAgICB3aWR0aDogNjQwLFxuICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgIHN0eWxlOiBudWxsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMud2lkdGggPSBvcHRpb25zLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IG9wdGlvbnMuaGVpZ2h0O1xuXG4gICAgICAgIC8v44K744OD44OI44Ki44OD44OXXG4gICAgICAgIHRoaXMuc2V0dXAob3B0aW9ucy5zdHlsZSk7XG4gICAgfSxcblxuICAgIHNldHVwOiBmdW5jdGlvbihzdHlsZSkge1xuICAgICAgICBzdHlsZSA9IHN0eWxlIHx8IHt9O1xuICAgICAgICBzdHlsZS4kc2FmZSh0aGlzLkRFRkFVTFRfU1RZTEUpO1xuICAgICAgICB0aGlzLnN0eWxlID0gc3R5bGU7XG5cbiAgICAgICAgdmFyIHdpZHRoID0gdGhpcy53aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIHZhciBnYXVnZVN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICBmaWxsOiBzdHlsZS5maWxsLFxuICAgICAgICAgICAgc3Ryb2tlOiBzdHlsZS5maWxsLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDFcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdhdWdlID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShnYXVnZVN0eWxlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKHdpZHRoKi0wLjUsIDApXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5nYXVnZS5vcmlnaW5YID0gMDtcblxuICAgICAgICB2YXIgZnJhbWVTdHlsZSA9IHtcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgZmlsbDogc3R5bGUuZW1wdHksXG4gICAgICAgICAgICBzdHJva2U6IHN0eWxlLnN0cm9rZSxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiBzdHlsZS5zdHJva2VXaWR0aFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ2F1Z2VGcmFtZSA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUoZnJhbWVTdHlsZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbih3aWR0aCotMC41LCAwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMuZ2F1Z2VGcmFtZS5vcmlnaW5YID0gMDtcbiAgICAgICAgXG4vLyAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkudG8oe3ZhbHVlOiAwfSwgMjAwMCkudG8oe3ZhbHVlOiAxMDB9LCAyMDAwKS5zZXRMb29wKHRydWUpO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmdhdWdlLndpZHRoID0gdGhpcy53aWR0aCoodGhpcy52YWx1ZS8odGhpcy5tYXgtdGhpcy5taW4pKTtcbiAgICB9LFxuXG4gICAgc2V0VmFsdWU6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHY7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG4gICAgc2V0TWF4OiBmdW5jdGlvbih2KSB7XG4gICAgICAgIHRoaXMubWF4ID0gdjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbiAgICBzZXRNaW46IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgdGhpcy5taW4gPSB2O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxufSk7XG5cbiIsIi8qXG4gKiAgcGhpbmEuZXh0ZW5zaW9uLmpzXG4gKiAgMjAxNi8xMS8yNVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmV4dGVuc2lvbiA9IHBoaW5hLmV4dGVuc2lvbiB8fCB7fTtcblxuLy/jgrnjg5fjg6njgqTjg4jmqZ/og73mi6HlvLVcbnBoaW5hLmRpc3BsYXkuU3ByaXRlLnByb3RvdHlwZS5zZXRGcmFtZVRyaW1taW5nID0gZnVuY3Rpb24oeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICB0aGlzLl9mcmFtZVRyaW1YID0geCB8fCAwO1xuICB0aGlzLl9mcmFtZVRyaW1ZID0geSB8fCAwO1xuICB0aGlzLl9mcmFtZVRyaW1XaWR0aCA9IHdpZHRoIHx8IHRoaXMuaW1hZ2UuZG9tRWxlbWVudC53aWR0aCAtIHRoaXMuX2ZyYW1lVHJpbVg7XG4gIHRoaXMuX2ZyYW1lVHJpbUhlaWdodCA9IGhlaWdodCB8fCB0aGlzLmltYWdlLmRvbUVsZW1lbnQuaGVpZ2h0IC0gdGhpcy5fZnJhbWVUcmltWTtcbiAgcmV0dXJuIHRoaXM7XG59XG5cbnBoaW5hLmRpc3BsYXkuU3ByaXRlLnByb3RvdHlwZS5zZXRGcmFtZUluZGV4ID0gZnVuY3Rpb24oaW5kZXgsIHdpZHRoLCBoZWlnaHQpIHtcbiAgdmFyIHN4ID0gdGhpcy5fZnJhbWVUcmltWCB8fCAwO1xuICB2YXIgc3kgPSB0aGlzLl9mcmFtZVRyaW1ZIHx8IDA7XG4gIHZhciBzdyA9IHRoaXMuX2ZyYW1lVHJpbVdpZHRoICB8fCAodGhpcy5pbWFnZS5kb21FbGVtZW50LndpZHRoLXN4KTtcbiAgdmFyIHNoID0gdGhpcy5fZnJhbWVUcmltSGVpZ2h0IHx8ICh0aGlzLmltYWdlLmRvbUVsZW1lbnQuaGVpZ2h0LXN5KTtcblxuICB2YXIgdHcgID0gd2lkdGggfHwgdGhpcy53aWR0aDsgICAgICAvLyB0d1xuICB2YXIgdGggID0gaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0OyAgICAvLyB0aFxuICB2YXIgcm93ID0gfn4oc3cgLyB0dyk7XG4gIHZhciBjb2wgPSB+fihzaCAvIHRoKTtcbiAgdmFyIG1heEluZGV4ID0gcm93KmNvbDtcbiAgaW5kZXggPSBpbmRleCVtYXhJbmRleDtcblxuICB2YXIgeCAgID0gaW5kZXglcm93O1xuICB2YXIgeSAgID0gfn4oaW5kZXgvcm93KTtcbiAgdGhpcy5zcmNSZWN0LnggPSBzeCt4KnR3O1xuICB0aGlzLnNyY1JlY3QueSA9IHN5K3kqdGg7XG4gIHRoaXMuc3JjUmVjdC53aWR0aCAgPSB0dztcbiAgdGhpcy5zcmNSZWN0LmhlaWdodCA9IHRoO1xuXG4gIHRoaXMuX2ZyYW1lSW5kZXggPSBpbmRleDtcblxuICByZXR1cm4gdGhpcztcbn1cbiIsIi8qXG4gKiAgU2xpY2VTcHJpdGUuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJwaGluYS5kaXNwbGF5LlNsaWNlU3ByaXRlXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuQ2FudmFzRWxlbWVudFwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oaW1hZ2UsIHdpZHRoLCBoZWlnaHQsIG9wdGlvbikge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLm9wdGlvbiA9IG9wdGlvbi4kc2FmZSh7XG4gICAgICAgICAgICBzbGljZVg6IDIsICAvL++/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vVxuICAgICAgICAgICAgc2xpY2VZOiAyLCAgLy/vv71j77+977+977+977+977+977+9XG4gICAgICAgICAgICB0cmltbWluZzogeyAvL++/vWfvv73vv73vv71+77+977+977+9T++/ve+/ve+/vVxuICAgICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5zcHJpdGVzID0gW107XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGN3ID0gfih3aWR0aC9vcHRpb24uc2xpY2VYKTtcbiAgICAgICAgdmFyIGNoID0gfihoZWlnaHQvb3B0aW9uLnNsaWNlWSk7XG4gICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgb3B0aW9uLnNsaWNlWTsgeSsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IG9wdGlvbi5zbGljZVg7IHgrKykge1xuICAgICAgICAgICAgICAgIHZhciBzID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoaW1hZ2UsIGN3LCBjaCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgICAgICBzLnNldEZyYW1lSW5kZXgoaSkuc2V0UG9zaXRpb24oeCpjdy13aWR0aC8yLCB5KmNoLWhlaWdodC8yKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZXMucHVzaChzKTtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/vv71v77+977+977+9b++/ve+/vVxuICAgIGZhbGxBcGFydDogZnVuY3Rpb24oZnVuYykge1xuICAgICAgICBmdW5jID0gZnVuYyB8fCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgc3ggPSAoZS54PT0wPzA6KGUueD4wPzE6LTEpKTtcbiAgICAgICAgICAgIHZhciBzeSA9IChlLnk9PTA/MDooZS55PjA/MTotMSkpO1xuICAgICAgICAgICAgZS50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAudG8oe3g6IGUueCoxMCwgeTplLnkqMTAsIGFscGhhOiAwfSwgMTAwMCwgXCJlYXNlT3V0U2luZVwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNwcml0ZXMuZWFjaChmdW5jKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v77+977+977+9yZbfgu+/vVxuICAgIHJlaW5zdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGN3ID0gfih0aGlzLndpZHRoL3RoaXMub3B0aW9uLnNsaWNlWCk7XG4gICAgICAgIHZhciBjaCA9IH4odGhpcy5oZWlnaHQvdGhpcy5vcHRpb24uc2xpY2VZKTtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLm9wdGlvbi5zbGljZVk7IHkrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLm9wdGlvbi5zbGljZVg7IHgrKykge1xuICAgICAgICAgICAgICAgIHMucm90YXRpb24gPSAwO1xuICAgICAgICAgICAgICAgIHMuc2V0UG9zaXRpb24oeCpjdy10aGlzLndpZHRoLzIsIHkqY2gtdGhpcy5oZWlnaHQvMik7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG59KTtcblxuIiwiLypcbiAqICBTb3VuZFNldC5qc1xuICogIDIwMTQvMTEvMjhcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5leHRlbnNpb24gPSBwaGluYS5leHRlbnNpb24gfHwge307XG5cbi8v44K144Km44Oz44OJ566h55CGXG5waGluYS5kZWZpbmUoXCJwaGluYS5leHRlbnNpb24uU291bmRTZXRcIiwge1xuXG4gICAgLy/jgrXjgqbjg7Pjg4njgYzmoLzntI3jgZXjgozjgovphY3liJdcbiAgICBlbGVtZW50czogbnVsbCxcblxuICAgIC8v5YaN55Sf5Lit77yi77yn77ytXG4gICAgYmdtOiBudWxsLFxuICAgIGJnbUlzUGxheTogZmFsc2UsXG5cbiAgICAvL+ODnuOCueOCv+ODvOODnOODquODpeODvOODoFxuICAgIHZvbHVtZUJHTTogMC41LFxuICAgIHZvbHVtZVNFOiAwLjUsXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5lbGVtZW50cyA9IFtdO1xuICAgIH0sXG5cbiAgICAvL+eZu+mMsua4iOOBv+OCouOCu+ODg+ODiOiqreOBv+i+vOOBv1xuICAgIHJlYWRBc3NldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuYXNzZXRzLnNvdW5kKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldChcInNvdW5kXCIsIGtleSk7XG4gICAgICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgcGhpbmEuYXNzZXQuU291bmQpIHRoaXMuYWRkKGtleSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/jgrXjgqbjg7Pjg4nov73liqBcbiAgICBhZGQ6IGZ1bmN0aW9uKG5hbWUsIHVybCkge1xuICAgICAgICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgdXJsID0gdXJsIHx8IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmZpbmQobmFtZSkpIHJldHVybiB0cnVlO1xuXG4gICAgICAgIHZhciBlID0gcGhpbmEuZXh0ZW5zaW9uLlNvdW5kRWxlbWVudChuYW1lKTtcbiAgICAgICAgaWYgKCFlLm1lZGlhKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIHRoaXMuZWxlbWVudHMucHVzaChlKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ5qSc57SiXG4gICAgZmluZDogZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBpZiAoIXRoaXMuZWxlbWVudHMpIHJldHVybiBudWxsO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVsZW1lbnRzW2ldLm5hbWUgPT0gbmFtZSkgcmV0dXJuIHRoaXMuZWxlbWVudHNbaV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ44KS77yi77yn77yt44Go44GX44Gm5YaN55SfXG4gICAgcGxheUJHTTogZnVuY3Rpb24obmFtZSwgbG9vcCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGxvb3AgPT09IHVuZGVmaW5lZCkgbG9vcCA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgdGhpcy5iZ20uc3RvcCgpO1xuICAgICAgICAgICAgdGhpcy5iZ21Jc1BsYXkgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWVkaWEgPSB0aGlzLmZpbmQobmFtZSk7XG4gICAgICAgIGlmIChtZWRpYSkge1xuICAgICAgICAgICAgdmFyIHZvbCA9IHRoaXMudm9sdW1lQkdNICogbWVkaWEudm9sdW1lO1xuICAgICAgICAgICAgbWVkaWEuc2V0Vm9sdW1lKHZvbCk7XG4gICAgICAgICAgICBtZWRpYS5wbGF5KGxvb3AsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHRoaXMuYmdtID0gbWVkaWE7XG4gICAgICAgICAgICB0aGlzLmJnbUlzUGxheSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5hZGQobmFtZSkpIHRoaXMucGxheUJHTShuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3lgZzmraJcbiAgICBzdG9wQkdNOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5iZ21Jc1BsYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbS5zdG9wKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ21Jc1BsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYmdtID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3kuIDmmYLlgZzmraJcbiAgICBwYXVzZUJHTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmdtSXNQbGF5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ20ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbUlzUGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL++8ou+8p++8reWGjemWi1xuICAgIHJlc3VtZUJHTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmJnbUlzUGxheSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtLnZvbHVtZSA9IHRoaXMudm9sdW1lQkdNO1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtLnJlc3VtZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYmdtSXNQbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3jg57jgrnjgr/jg7zjg5zjg6rjg6Xjg7zjg6DoqK3lrppcbiAgICBzZXRWb2x1bWVCR006IGZ1bmN0aW9uKHZvbCkge1xuICAgICAgICB0aGlzLnZvbHVtZUJHTSA9IHZvbDtcbiAgICAgICAgaWYgKHRoaXMuYmdtKSB7XG4gICAgICAgICAgICB0aGlzLmJnbS5wYXVzZSgpO1xuICAgICAgICAgICAgdGhpcy5iZ20uc2V0Vm9sdW1lKHRoaXMudm9sdW1lQkdNKTtcbiAgICAgICAgICAgIHRoaXMuYmdtLnJlc3VtZSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+OCteOCpuODs+ODieOCkuOCteOCpuODs+ODieOCqOODleOCp+OCr+ODiOOBqOOBl+OBpuWGjeeUn1xuICAgIHBsYXlTRTogZnVuY3Rpb24obmFtZSwgbG9vcCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG1lZGlhID0gdGhpcy5maW5kKG5hbWUpO1xuICAgICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgICAgIHZhciB2b2wgPSB0aGlzLnZvbHVtZVNFO1xuICAgICAgICAgICAgbWVkaWEuc2V0Vm9sdW1lKHZvbCk7XG4gICAgICAgICAgICBtZWRpYS5wbGF5KGxvb3AsIGNhbGxiYWNrKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmFkZChuYW1lKSkgdGhpcy5wbGF5U0UobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v44Or44O844OX5YaN55Sf44GX44Gm44GE44KLU0XjgpLlgZzmraJcbiAgICBzdG9wU0U6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdmFyIG1lZGlhID0gdGhpcy5maW5kKG5hbWUpO1xuICAgICAgICBpZiAobWVkaWEpIHtcbiAgICAgICAgICAgIG1lZGlhLnN0b3AoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/vvKLvvKfvvK3kuIDmmYLlgZzmraJcbiAgICBwYXVzZUJHTTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmJnbSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmdtSXNQbGF5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iZ20ucGF1c2UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJnbUlzUGxheSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL++8s++8peODnuOCueOCv+ODvOODnOODquODpeODvOODoOioreWumlxuICAgIHNldFZvbHVtZVNFOiBmdW5jdGlvbih2b2wpIHtcbiAgICAgICAgdGhpcy52b2x1bWVTRSA9IHZvbDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn0pO1xuXG4vL1NvdW5kRWxlbWVudCBCYXNpY1xucGhpbmEuZGVmaW5lKFwicGhpbmEuZXh0ZW5zaW9uLlNvdW5kRWxlbWVudFwiLCB7XG4gICAgLy/jgrXjgqbjg7Pjg4nlkI1cbiAgICBuYW1lOiBudWxsLFxuXG4gICAgLy/vvLXvvLLvvKxcbiAgICB1cmw6IG51bGwsXG5cbiAgICAvL+OCteOCpuODs+ODieacrOS9k1xuICAgIG1lZGlhOiBudWxsLFxuXG4gICAgLy/jg5zjg6rjg6Xjg7zjg6BcbiAgICBfdm9sdW1lOiAxLFxuXG4gICAgLy/lho3nlJ/ntYLkuobmmYLjga7jgrPjg7zjg6vjg5Djg4Pjgq/plqLmlbBcbiAgICBjYWxsYmFjazogbnVsbCxcblxuICAgIC8v5YaN55Sf5Lit44OV44Op44KwXG4gICAgcGxheWluZzogZmFsc2UsXG5cbiAgICBpbml0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMubWVkaWEgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KFwic291bmRcIiwgbmFtZSk7XG4gICAgICAgIGlmICh0aGlzLm1lZGlhKSB7XG4gICAgICAgICAgICB0aGlzLm1lZGlhLnZvbHVtZSA9IDE7XG4gICAgICAgICAgICB0aGlzLm1lZGlhLm9uKCdlbmRlZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLm1lZGlhLmxvb3ApIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNhbGxiYWNrKSB0aGlzLmNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJhc3NldCBub3QgZm91bmQuIFwiK25hbWUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ44Gu5YaN55SfXG4gICAgcGxheTogZnVuY3Rpb24obG9vcCwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGxvb3AgPT09IHVuZGVmaW5lZCkgbG9vcCA9IGZhbHNlXG4gICAgICAgIGlmICghdGhpcy5tZWRpYSkgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgLy/jg6vjg7zjg5flho3nlJ/jga7loLTlkIjlpJrph43lho3nlJ/jgpLnpoHmraJcbiAgICAgICAgaWYgKGxvb3AgJiYgdGhpcy5wbGF5aW5nKSByZXR1cm47XG5cbiAgICAgICAgdGhpcy5tZWRpYS5sb29wID0gbG9vcDtcbiAgICAgICAgdGhpcy5tZWRpYS5wbGF5KCk7XG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ5YaN55Sf5YaN6ZaLXG4gICAgcmVzdW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcbiAgICAgICAgdGhpcy5tZWRpYS5yZXN1bWUoKTtcbiAgICAgICAgdGhpcy5wbGF5aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v44K144Km44Oz44OJ5LiA5pmC5YGc5q2iXG4gICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcbiAgICAgICAgdGhpcy5tZWRpYS5wYXVzZSgpO1xuICAgICAgICB0aGlzLnBsYXlpbmcgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgLy/jgrXjgqbjg7Pjg4nlgZzmraJcbiAgICBzdG9wOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLm1lZGlhKSByZXR1cm4gdGhpcztcbiAgICAgICAgdGhpcy5tZWRpYS5zdG9wKCk7XG4gICAgICAgIHRoaXMucGxheWluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jg5zjg6rjg6Xjg7zjg6DoqK3lrppcbiAgICBzZXRWb2x1bWU6IGZ1bmN0aW9uKHZvbCkge1xuICAgICAgICBpZiAoIXRoaXMubWVkaWEpIHJldHVybiB0aGlzO1xuICAgICAgICBpZiAodm9sID09PSB1bmRlZmluZWQpIHZvbCA9IDA7XG4gICAgICAgIHRoaXMuX3ZvbHVtZSA9IHZvbDtcbiAgICAgICAgdGhpcy5tZWRpYS52b2x1bWUgPSB0aGlzLl92b2x1bWU7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBfYWNjZXNzb3I6IHtcbiAgICAgICAgdm9sdW1lOiB7XG4gICAgICAgICAgICBcImdldFwiOiBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXMuX3ZvbHVtZTsgfSxcbiAgICAgICAgICAgIFwic2V0XCI6IGZ1bmN0aW9uKHZvbCkgeyB0aGlzLnNldFZvbHVtZSh2b2wpOyB9XG4gICAgICAgIH0sXG4gICAgICAgIGxvb3A6IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5tZWRpYS5sb29wOyB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24oZikgeyB0aGlzLm1lZGlhLmxvb3AgPSBmOyB9XG4gICAgICAgIH0sXG4gICAgfVxufSk7XG4iLCIvKlxuICogIHRpbGVkbWFwLmpzXG4gKiAgMjAxNi85LzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxucGhpbmEuZGVmaW5lKFwicGhpbmEuYXNzZXQuVGlsZWRNYXBcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuYXNzZXQuQXNzZXRcIixcblxuICAgIGltYWdlOiBudWxsLFxuXG4gICAgdGlsZXNldHM6IG51bGwsXG4gICAgbGF5ZXJzOiBudWxsLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgfSxcblxuICAgIF9sb2FkOiBmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIC8v44OR44K55oqc44GN5Ye644GXXG4gICAgICAgIHRoaXMucGF0aCA9IFwiXCI7XG4gICAgICAgIHZhciBsYXN0ID0gdGhpcy5zcmMubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgICAgICBpZiAobGFzdCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMucGF0aCA9IHRoaXMuc3JjLnN1YnN0cmluZygwLCBsYXN0KzEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/ntYLkuobplqLmlbDkv53lrZhcbiAgICAgICAgdGhpcy5fcmVzb2x2ZSA9IHJlc29sdmU7XG5cbiAgICAgICAgLy8gbG9hZFxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB4bWwgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgeG1sLm9wZW4oJ0dFVCcsIHRoaXMuc3JjKTtcbiAgICAgICAgeG1sLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHhtbC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgaWYgKFsyMDAsIDIwMSwgMF0uaW5kZXhPZih4bWwuc3RhdHVzKSAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB4bWwucmVzcG9uc2VUZXh0O1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gKG5ldyBET01QYXJzZXIoKSkucGFyc2VGcm9tU3RyaW5nKGRhdGEsIFwidGV4dC94bWxcIik7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YVR5cGUgPSBcInhtbFwiO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9wYXJzZShkYXRhKTtcbi8vICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHNlbGYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgeG1sLnNlbmQobnVsbCk7XG4gICAgfSxcblxuICAgIC8v44Oe44OD44OX44Kk44Oh44O844K45Y+W5b6XXG4gICAgZ2V0SW1hZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbWFnZTtcbiAgICB9LFxuXG4gICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jjgrDjg6vjg7zjg5fjgpLphY3liJfjgavjgZfjgablj5blvpdcbiAgICBnZXRPYmplY3RHcm91cDogZnVuY3Rpb24oZ3JvdXBOYW1lKSB7XG4gICAgICAgIGdyb3VwTmFtZSA9IGdyb3VwTmFtZSB8fCBudWxsO1xuICAgICAgICB2YXIgbHMgPSBbXTtcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMubGF5ZXJzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJvYmplY3Rncm91cFwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwTmFtZSA9PSBudWxsIHx8IGdyb3VwTmFtZSA9PSB0aGlzLmxheWVyc1tpXS5uYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v44OH44Kj44O844OX44Kz44OU44O8XG4gICAgICAgICAgICAgICAgICAgIHZhciBvYmogPSB7fS4kc2FmZSh0aGlzLmxheWVyc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIG9iai5vYmplY3RzID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhciBsZW4yID0gdGhpcy5sYXllcnNbaV0ub2JqZWN0cy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHIgPSAwOyByIDwgbGVuMjsgcisrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2JqMiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiB7fS4kc2FmZSh0aGlzLmxheWVyc1tpXS5vYmplY3RzW3JdLnByb3BlcnRpZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4ZWN1dGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0uJHNhZmUodGhpcy5sYXllcnNbaV0ub2JqZWN0c1tyXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmoub2JqZWN0c1tyXSA9IG9iajI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbHMucHVzaChvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBscztcbiAgICB9LFxuXG4gICAgX3BhcnNlOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIC8v44K/44Kk44Or5bGe5oCn5oOF5aCx5Y+W5b6XXG4gICAgICAgIHZhciBtYXAgPSBkYXRhLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdtYXAnKVswXTtcbiAgICAgICAgdmFyIGF0dHIgPSB0aGlzLl9hdHRyVG9KU09OKG1hcCk7XG4gICAgICAgIHRoaXMuJGV4dGVuZChhdHRyKTtcblxuICAgICAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOWPluW+l1xuICAgICAgICB0aGlzLnRpbGVzZXRzID0gdGhpcy5fcGFyc2VUaWxlc2V0cyhkYXRhKTtcblxuICAgICAgICAvL+OCv+OCpOODq+OCu+ODg+ODiOaDheWgseijnOWujFxuICAgICAgICB2YXIgZGVmYXVsdEF0dHIgPSB7XG4gICAgICAgICAgICB0aWxld2lkdGg6IDMyLFxuICAgICAgICAgICAgdGlsZWhlaWdodDogMzIsXG4gICAgICAgICAgICBzcGFjaW5nOiAwLFxuICAgICAgICAgICAgbWFyZ2luOiAwLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnRpbGVzZXRzLmNoaXBzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy50aWxlc2V0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jlsZ7mgKfmg4XloLHlj5blvpdcbiAgICAgICAgICAgIHZhciBhdHRyID0gdGhpcy5fYXR0clRvSlNPTihkYXRhLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aWxlc2V0JylbaV0pO1xuICAgICAgICAgICAgYXR0ci4kc2FmZShkZWZhdWx0QXR0cik7XG4gICAgICAgICAgICBhdHRyLmZpcnN0Z2lkLS07XG4gICAgICAgICAgICB0aGlzLnRpbGVzZXRzW2ldLiRleHRlbmQoYXR0cik7XG5cbiAgICAgICAgICAgIC8v44Oe44OD44OX44OB44OD44OX44Oq44K544OI5L2c5oiQXG4gICAgICAgICAgICB2YXIgdCA9IHRoaXMudGlsZXNldHNbaV07XG4gICAgICAgICAgICB0aGlzLnRpbGVzZXRzW2ldLm1hcENoaXAgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIHIgPSBhdHRyLmZpcnN0Z2lkOyByIDwgYXR0ci5maXJzdGdpZCthdHRyLnRpbGVjb3VudDsgcisrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNoaXAgPSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiB0LmltYWdlLFxuICAgICAgICAgICAgICAgICAgICB4OiAoKHIgLSBhdHRyLmZpcnN0Z2lkKSAlIHQuY29sdW1ucykgKiAodC50aWxld2lkdGggKyB0LnNwYWNpbmcpICsgdC5tYXJnaW4sXG4gICAgICAgICAgICAgICAgICAgIHk6IE1hdGguZmxvb3IoKHIgLSBhdHRyLmZpcnN0Z2lkKSAvIHQuY29sdW1ucykgKiAodC50aWxlaGVpZ2h0ICsgdC5zcGFjaW5nKSArIHQubWFyZ2luLFxuICAgICAgICAgICAgICAgIH0uJHNhZmUoYXR0cik7XG4gICAgICAgICAgICAgICAgdGhpcy50aWxlc2V0cy5jaGlwc1tyXSA9IGNoaXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODrOOCpOODpOODvOWPluW+l1xuICAgICAgICB0aGlzLmxheWVycyA9IHRoaXMuX3BhcnNlTGF5ZXJzKGRhdGEpO1xuXG4gICAgICAgIC8v44Kk44Oh44O844K444OH44O844K/6Kqt44G/6L6844G/XG4gICAgICAgIHRoaXMuX2NoZWNrSW1hZ2UoKTtcbiAgICB9LFxuXG4gICAgLy/jgqLjgrvjg4Pjg4jjgavnhKHjgYTjgqTjg6Hjg7zjgrjjg4fjg7zjgr/jgpLoqq3jgb/ovrzjgb9cbiAgICBfY2hlY2tJbWFnZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdmFyIGltYWdlU291cmNlID0gW107XG4gICAgICAgIHZhciBsb2FkSW1hZ2UgPSBbXTtcblxuICAgICAgICAvL+S4gOimp+S9nOaIkFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMudGlsZXNldHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICAgICAgaW1hZ2U6IHRoaXMudGlsZXNldHNbaV0uaW1hZ2UsXG4gICAgICAgICAgICAgICAgdHJhbnNSOiB0aGlzLnRpbGVzZXRzW2ldLnRyYW5zUixcbiAgICAgICAgICAgICAgICB0cmFuc0c6IHRoaXMudGlsZXNldHNbaV0udHJhbnNHLFxuICAgICAgICAgICAgICAgIHRyYW5zQjogdGhpcy50aWxlc2V0c1tpXS50cmFuc0IsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgaW1hZ2VTb3VyY2UucHVzaChvYmopO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS5pbWFnZSkge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICAgICAgICAgIGltYWdlOiB0aGlzLmxheWVyc1tpXS5pbWFnZS5zb3VyY2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGltYWdlU291cmNlLnB1c2gob2JqKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Ki44K744OD44OI44Gr44GC44KL44GL56K66KqNXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW1hZ2VTb3VyY2UubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpbWFnZSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ2ltYWdlJywgaW1hZ2VTb3VyY2VbaV0uaW1hZ2UpO1xuICAgICAgICAgICAgaWYgKGltYWdlKSB7XG4gICAgICAgICAgICAgICAgLy/jgqLjgrvjg4Pjg4jjgavjgYLjgotcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy/jgarjgYvjgaPjgZ/jga7jgafjg63jg7zjg4njg6rjgrnjg4jjgavov73liqBcbiAgICAgICAgICAgICAgICBsb2FkSW1hZ2UucHVzaChpbWFnZVNvdXJjZVtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+S4gOaLrOODreODvOODiVxuICAgICAgICAvL+ODreODvOODieODquOCueODiOS9nOaIkFxuICAgICAgICB2YXIgYXNzZXRzID0ge1xuICAgICAgICAgICAgaW1hZ2U6IFtdXG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9hZEltYWdlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvL+OCpOODoeODvOOCuOOBruODkeOCueOCkuODnuODg+ODl+OBqOWQjOOBmOOBq+OBmeOCi1xuICAgICAgICAgICAgYXNzZXRzLmltYWdlW2ltYWdlU291cmNlW2ldLmltYWdlXSA9IHRoaXMucGF0aCtpbWFnZVNvdXJjZVtpXS5pbWFnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG9hZEltYWdlLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IHBoaW5hLmFzc2V0LkFzc2V0TG9hZGVyKCk7XG4gICAgICAgICAgICBsb2FkZXIubG9hZChhc3NldHMpO1xuICAgICAgICAgICAgbG9hZGVyLm9uKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIC8v6YCP6YGO6Imy6Kit5a6a5Y+N5pigXG4gICAgICAgICAgICAgICAgbG9hZEltYWdlLmZvckVhY2goZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ2ltYWdlJywgZWxtLmltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsbS50cmFuc1IgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHIgPSBlbG0udHJhbnNSLCBnID0gZWxtLnRyYW5zRywgYiA9IGVsbS50cmFuc0I7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZS5maWx0ZXIoZnVuY3Rpb24ocGl4ZWwsIGluZGV4LCB4LCB5LCBiaXRtYXApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGJpdG1hcC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwaXhlbFswXSA9PSByICYmIHBpeGVsWzFdID09IGcgJiYgcGl4ZWxbMl0gPT0gYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzNdID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIC8v44Oe44OD44OX44Kk44Oh44O844K455Sf5oiQXG4gICAgICAgICAgICAgICAgdGhhdC5pbWFnZSA9IHRoYXQuX2dlbmVyYXRlSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAvL+iqreOBv+i+vOOBv+e1guS6hlxuICAgICAgICAgICAgICAgIHRoYXQuX3Jlc29sdmUodGhhdCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/jg57jg4Pjg5fjgqTjg6Hjg7zjgrjnlJ/miJBcbiAgICAgICAgICAgIHRoaXMuaW1hZ2UgPSB0aGF0Ll9nZW5lcmF0ZUltYWdlKCk7XG4gICAgICAgICAgICAvL+iqreOBv+i+vOOBv+e1guS6hlxuICAgICAgICAgICAgdGhpcy5fcmVzb2x2ZSh0aGF0KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+ODnuODg+ODl+OCpOODoeODvOOCuOS9nOaIkFxuICAgIF9nZW5lcmF0ZUltYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIG51bUxheWVyID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJsYXllclwiIHx8IHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJpbWFnZWxheWVyXCIpIG51bUxheWVyKys7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG51bUxheWVyID09IDApIHJldHVybiBudWxsO1xuXG4gICAgICAgIHZhciB3aWR0aCA9IHRoaXMud2lkdGggKiB0aGlzLnRpbGV3aWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMuaGVpZ2h0ICogdGhpcy50aWxlaGVpZ2h0O1xuICAgICAgICB2YXIgY2FudmFzID0gcGhpbmEuZ3JhcGhpY3MuQ2FudmFzKCkuc2V0U2l6ZSh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvL+ODnuODg+ODl+ODrOOCpOODpOODvFxuICAgICAgICAgICAgaWYgKHRoaXMubGF5ZXJzW2ldLnR5cGUgPT0gXCJsYXllclwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgdmFyIG1hcGRhdGEgPSBsYXllci5kYXRhO1xuICAgICAgICAgICAgICAgIHZhciB3aWR0aCA9IGxheWVyLndpZHRoO1xuICAgICAgICAgICAgICAgIHZhciBoZWlnaHQgPSBsYXllci5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gbWFwZGF0YVtjb3VudF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy/jg57jg4Pjg5fjg4Hjg4Pjg5fjgpLphY3nva5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZXRNYXBDaGlwKGNhbnZhcywgaW5kZXgsIHggKiB0aGlzLnRpbGV3aWR0aCwgeSAqIHRoaXMudGlsZWhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/jgqTjg6Hjg7zjgrjjg6zjgqTjg6Tjg7xcbiAgICAgICAgICAgIGlmICh0aGlzLmxheWVyc1tpXS50eXBlID09IFwiaW1hZ2VsYXllclwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxlbiA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ2ltYWdlJywgdGhpcy5sYXllcnNbaV0uaW1hZ2Uuc291cmNlKTtcbiAgICAgICAgICAgICAgICBjYW52YXMuY29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UuZG9tRWxlbWVudCwgdGhpcy5sYXllcnNbaV0ueCwgdGhpcy5sYXllcnNbaV0ueSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGV4dHVyZSA9IHBoaW5hLmFzc2V0LlRleHR1cmUoKTtcbiAgICAgICAgdGV4dHVyZS5kb21FbGVtZW50ID0gY2FudmFzLmRvbUVsZW1lbnQ7XG4gICAgICAgIHJldHVybiB0ZXh0dXJlO1xuICAgIH0sXG5cbiAgICAvL+OCreODo+ODs+ODkOOCueOBruaMh+WumuOBl+OBn+W6p+aomeOBq+ODnuODg+ODl+ODgeODg+ODl+OBruOCpOODoeODvOOCuOOCkuOCs+ODlOODvOOBmeOCi1xuICAgIF9zZXRNYXBDaGlwOiBmdW5jdGlvbihjYW52YXMsIGluZGV4LCB4LCB5KSB7XG4gICAgICAgIC8v44K/44Kk44Or44K744OD44OI44GL44KJ44Oe44OD44OX44OB44OD44OX44KS5Y+W5b6XXG4gICAgICAgIHZhciBjaGlwID0gdGhpcy50aWxlc2V0cy5jaGlwc1tpbmRleF07XG4gICAgICAgIHZhciBpbWFnZSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ2ltYWdlJywgY2hpcC5pbWFnZSk7XG4gICAgICAgIGNhbnZhcy5jb250ZXh0LmRyYXdJbWFnZShcbiAgICAgICAgICAgIGltYWdlLmRvbUVsZW1lbnQsXG4gICAgICAgICAgICBjaGlwLnggKyBjaGlwLm1hcmdpbiwgY2hpcC55ICsgY2hpcC5tYXJnaW4sXG4gICAgICAgICAgICBjaGlwLnRpbGV3aWR0aCwgY2hpcC50aWxlaGVpZ2h0LFxuICAgICAgICAgICAgeCwgeSxcbiAgICAgICAgICAgIGNoaXAudGlsZXdpZHRoLCBjaGlwLnRpbGVoZWlnaHQpO1xuICAgIH0sXG5cbiAgICAvL1hNTOODl+ODreODkeODhuOCo+OCkkpTT07jgavlpInmj5tcbiAgICBfcHJvcGVydGllc1RvSlNPTjogZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgIHZhciBwcm9wZXJ0aWVzID0gZWxtLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwicHJvcGVydGllc1wiKVswXTtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBpZiAocHJvcGVydGllcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgPSAwOyBrIDwgcHJvcGVydGllcy5jaGlsZE5vZGVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICB2YXIgcCA9IHByb3BlcnRpZXMuY2hpbGROb2Rlc1trXTtcbiAgICAgICAgICAgIGlmIChwLnRhZ05hbWUgPT09IFwicHJvcGVydHlcIikge1xuICAgICAgICAgICAgICAgIC8vcHJvcGVydHnjgat0eXBl5oyH5a6a44GM44GC44Gj44Gf44KJ5aSJ5o+bXG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBwLmdldEF0dHJpYnV0ZSgndHlwZScpO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHAuZ2V0QXR0cmlidXRlKCd2YWx1ZScpO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IFwiaW50XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqW3AuZ2V0QXR0cmlidXRlKCduYW1lJyldID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gXCJmbG9hdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialtwLmdldEF0dHJpYnV0ZSgnbmFtZScpXSA9IHZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG5cbiAgICAvL1hNTOWxnuaAp+OCkkpTT07jgavlpInmj5tcbiAgICBfYXR0clRvSlNPTjogZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgIHZhciBvYmogPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzb3VyY2UuYXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHNvdXJjZS5hdHRyaWJ1dGVzW2ldLnZhbHVlO1xuICAgICAgICAgICAgdmFsID0gaXNOYU4ocGFyc2VGbG9hdCh2YWwpKT8gdmFsOiBwYXJzZUZsb2F0KHZhbCk7XG4gICAgICAgICAgICBvYmpbc291cmNlLmF0dHJpYnV0ZXNbaV0ubmFtZV0gPSB2YWw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuXG4gICAgLy/jgr/jgqTjg6vjgrvjg4Pjg4jjga7jg5Hjg7zjgrlcbiAgICBfcGFyc2VUaWxlc2V0czogZnVuY3Rpb24oeG1sKSB7XG4gICAgICAgIHZhciBlYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgdmFyIHRpbGVzZXRzID0geG1sLmdldEVsZW1lbnRzQnlUYWdOYW1lKCd0aWxlc2V0Jyk7XG4gICAgICAgIGVhY2guY2FsbCh0aWxlc2V0cywgZnVuY3Rpb24odGlsZXNldCkge1xuICAgICAgICAgICAgdmFyIHQgPSB7fTtcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHNlbGYuX3Byb3BlcnRpZXNUb0pTT04odGlsZXNldCk7XG4gICAgICAgICAgICBpZiAocHJvcHMuc3JjKSB7XG4gICAgICAgICAgICAgICAgdC5pbWFnZSA9IHByb3BzLnNyYztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdC5pbWFnZSA9IHRpbGVzZXQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltYWdlJylbMF0uZ2V0QXR0cmlidXRlKCdzb3VyY2UnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v6YCP6YGO6Imy6Kit5a6a5Y+W5b6XXG4gICAgICAgICAgICB0LnRyYW5zID0gdGlsZXNldC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1hZ2UnKVswXS5nZXRBdHRyaWJ1dGUoJ3RyYW5zJyk7XG4gICAgICAgICAgICB0LnRyYW5zUiA9IHBhcnNlSW50KHQudHJhbnMuc3Vic3RyaW5nKDAsIDIpLCAxNik7XG4gICAgICAgICAgICB0LnRyYW5zRyA9IHBhcnNlSW50KHQudHJhbnMuc3Vic3RyaW5nKDIsIDQpLCAxNik7XG4gICAgICAgICAgICB0LnRyYW5zQiA9IHBhcnNlSW50KHQudHJhbnMuc3Vic3RyaW5nKDQsIDYpLCAxNik7XG5cbiAgICAgICAgICAgIGRhdGEucHVzaCh0KTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICAvL+ODrOOCpOODpOODvOaDheWgseOBruODkeODvOOCuVxuICAgIF9wYXJzZUxheWVyczogZnVuY3Rpb24oeG1sKSB7XG4gICAgICAgIHZhciBlYWNoID0gQXJyYXkucHJvdG90eXBlLmZvckVhY2g7XG4gICAgICAgIHZhciBkYXRhID0gW107XG5cbiAgICAgICAgdmFyIG1hcCA9IHhtbC5nZXRFbGVtZW50c0J5VGFnTmFtZShcIm1hcFwiKVswXTtcbiAgICAgICAgdmFyIGxheWVycyA9IFtdO1xuICAgICAgICBlYWNoLmNhbGwobWFwLmNoaWxkTm9kZXMsIGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICAgICAgaWYgKGVsbS50YWdOYW1lID09IFwibGF5ZXJcIiB8fCBlbG0udGFnTmFtZSA9PSBcIm9iamVjdGdyb3VwXCIgfHwgZWxtLnRhZ05hbWUgPT0gXCJpbWFnZWxheWVyXCIpIHtcbiAgICAgICAgICAgICAgICBsYXllcnMucHVzaChlbG0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsYXllcnMuZWFjaChmdW5jdGlvbihsYXllcikge1xuICAgICAgICAgICAgc3dpdGNoIChsYXllci50YWdOYW1lKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcImxheWVyXCI6XG4gICAgICAgICAgICAgICAgICAgIC8v6YCa5bi444Os44Kk44Ok44O8XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gbGF5ZXIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2RhdGEnKVswXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVuY29kaW5nID0gZC5nZXRBdHRyaWJ1dGUoXCJlbmNvZGluZ1wiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcImxheWVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpLFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbmNvZGluZyA9PSBcImNzdlwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsLmRhdGEgPSB0aGlzLl9wYXJzZUNTVihkLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbmNvZGluZyA9PSBcImJhc2U2NFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsLmRhdGEgPSB0aGlzLl9wYXJzZUJhc2U2NChkLnRleHRDb250ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBhdHRyID0gdGhpcy5fYXR0clRvSlNPTihsYXllcik7XG4gICAgICAgICAgICAgICAgICAgIGwuJGV4dGVuZChhdHRyKTtcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jjg6zjgqTjg6Tjg7xcbiAgICAgICAgICAgICAgICBjYXNlIFwib2JqZWN0Z3JvdXBcIjpcbiAgICAgICAgICAgICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9iamVjdGdyb3VwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RzOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGxheWVyLmdldEF0dHJpYnV0ZShcIm5hbWVcIiksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGVhY2guY2FsbChsYXllci5jaGlsZE5vZGVzLCBmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlbG0ubm9kZVR5cGUgPT0gMykgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSB0aGlzLl9hdHRyVG9KU09OKGVsbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkLnByb3BlcnRpZXMgPSB0aGlzLl9wcm9wZXJ0aWVzVG9KU09OKGVsbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsLm9iamVjdHMucHVzaChkKTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgICAgICAgICBkYXRhLnB1c2gobCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgICAgICAgLy/jgqTjg6Hjg7zjgrjjg6zjgqTjg6Tjg7xcbiAgICAgICAgICAgICAgICBjYXNlIFwiaW1hZ2VsYXllclwiOlxuICAgICAgICAgICAgICAgICAgICB2YXIgbCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2VsYXllclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogbGF5ZXIuZ2V0QXR0cmlidXRlKFwibmFtZVwiKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHBhcnNlRmxvYXQobGF5ZXIuZ2V0QXR0cmlidXRlKFwib2Zmc2V0eFwiKSkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IHBhcnNlRmxvYXQobGF5ZXIuZ2V0QXR0cmlidXRlKFwib2Zmc2V0eVwiKSkgfHwgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGhhOiBsYXllci5nZXRBdHRyaWJ1dGUoXCJvcGFjaXR5XCIpIHx8IDEsXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiAobGF5ZXIuZ2V0QXR0cmlidXRlKFwidmlzaWJsZVwiKSA9PT0gdW5kZWZpbmVkIHx8IGxheWVyLmdldEF0dHJpYnV0ZShcInZpc2libGVcIikgIT0gMCksXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHZhciBpbWFnZUVsbSA9IGxheWVyLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaW1hZ2VcIilbMF07XG4gICAgICAgICAgICAgICAgICAgIGwuaW1hZ2UgPSB7c291cmNlOiBpbWFnZUVsbS5nZXRBdHRyaWJ1dGUoXCJzb3VyY2VcIil9O1xuXG4gICAgICAgICAgICAgICAgICAgIGRhdGEucHVzaChsKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH0sXG5cbiAgICAvL0NTVuODkeODvOOCuVxuICAgIF9wYXJzZUNTVjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSBkYXRhLnNwbGl0KCcsJyk7XG4gICAgICAgIHZhciBsYXllciA9IFtdO1xuXG4gICAgICAgIGRhdGFMaXN0LmVhY2goZnVuY3Rpb24oZWxtLCBpKSB7XG4gICAgICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQoZWxtLCAxMCkgLSAxO1xuICAgICAgICAgICAgbGF5ZXIucHVzaChudW0pO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gbGF5ZXI7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEJBU0U2NOODkeODvOOCuVxuICAgICAqIGh0dHA6Ly90aGVrYW5ub24tc2VydmVyLmFwcHNwb3QuY29tL2hlcnBpdHktZGVycGl0eS5hcHBzcG90LmNvbS9wYXN0ZWJpbi5jb20vNzVLa3MwV0hcbiAgICAgKiBAcHJpdmF0ZVxuICAgICAqL1xuICAgIF9wYXJzZUJhc2U2NDogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSBhdG9iKGRhdGEudHJpbSgpKTtcbiAgICAgICAgdmFyIHJzdCA9IFtdO1xuXG4gICAgICAgIGRhdGFMaXN0ID0gZGF0YUxpc3Quc3BsaXQoJycpLm1hcChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZS5jaGFyQ29kZUF0KDApO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKHZhciBpPTAsbGVuPWRhdGFMaXN0Lmxlbmd0aC80OyBpPGxlbjsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbiA9IGRhdGFMaXN0W2kqNF07XG4gICAgICAgICAgICByc3RbaV0gPSBwYXJzZUludChuLCAxMCkgLSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJzdDtcbiAgICB9LFxufSk7XG5cbi8v44Ot44O844OA44O844Gr6L+95YqgXG5waGluYS5hc3NldC5Bc3NldExvYWRlci5hc3NldExvYWRGdW5jdGlvbnMudG14ID0gZnVuY3Rpb24oa2V5LCBwYXRoKSB7XG4gICAgdmFyIHRteCA9IHBoaW5hLmFzc2V0LlRpbGVkTWFwKCk7XG4gICAgcmV0dXJuIHRteC5sb2FkKHBhdGgpO1xufTtcbiIsIi8qXG4gKiAgQXBwbGljYXRpb24uanNcbiAqICAyMDE1LzA5LzA5XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vL25hbWVzcGFjZSBwYnIoUGxhbmV0QnVzdGVyUmV2aXNpb24pXG5sZXQgcGJyID0ge307XG5cbnBoaW5hLmRlZmluZShcIkFwcGxpY2F0aW9uXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuQ2FudmFzQXBwXCIsXG5cblx0X3N0YXRpYzoge1xuICAgICAgICB2ZXJzaW9uOiBcIjAuMC4xXCIsXG4gICAgICAgIHN0YWdlTmFtZToge1xuICAgICAgICAgICAgMTogXCJPcGVyYXRpb24gUExBTkVUX0JVU1RFUlwiLFxuICAgICAgICAgICAgMjogXCJEYW5jZSBpbiB0aGUgU2t5XCIsXG4gICAgICAgIH0sXG4gICAgICAgIGFzc2V0czoge1xuICAgICAgICAgICAgXCJwcmVsb2FkXCI6IHtcbiAgICAgICAgICAgICAgICBzb3VuZDoge1xuICAgICAgICAgICAgICAgICAgICBcInN0YXJ0XCI6ICAgICAgICAgXCJhc3NldHMvc291bmRzL3NvdW5kbG9nbzQwLm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcInNldHRpbmdcIjogICAgICAgXCJhc3NldHMvc291bmRzL3JlY2VpcHQwNS5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJ3YXJuaW5nXCI6ICAgICAgIFwiYXNzZXRzL3NvdW5kcy9iZ21fd2FybmluZy5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwb3dlcnVwXCI6ICAgICAgIFwiYXNzZXRzL3NvdW5kcy90YV90YV9zdXJhaWRvMDEubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZXhwbG9kZVNtYWxsXCI6ICBcImFzc2V0cy9zb3VuZHMvc2VuX2dlX3RhaWhvdTAzLm1wM1wiLCBcbiAgICAgICAgICAgICAgICAgICAgXCJleHBsb2RlTGFyZ2VcIjogIFwiYXNzZXRzL3NvdW5kcy9zZW5fZ2VfaGFzYWkwMS5tcDNcIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiZXhwbG9kZUJvc3NcIjogICBcImFzc2V0cy9zb3VuZHMvc2VfbWFvdWRhbWFzaGlpX2V4cGxvc2lvbjAyLm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcImV4cGxvZGVQbGF5ZXJcIjogXCJhc3NldHMvc291bmRzL3RhX3RhX3p1YmFuX2QwMS5tcDNcIiwgXG4gICAgICAgICAgICAgICAgICAgIFwiYm9tYlwiOiAgICAgICAgICBcImFzc2V0cy9zb3VuZHMvYm9tYi5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJwbGF5ZXJtaXNzXCI6ICAgIFwiYXNzZXRzL3NvdW5kcy90YV90YV96dWJhbl9kMDEubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwic3RhZ2VjbGVhclwiOiAgICBcImFzc2V0cy9zb3VuZHMvYmdtX3N0YWdlY2xlYXIubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZ2FtZW92ZXJcIjogICAgICBcImFzc2V0cy9zb3VuZHMvc291bmRsb2dvOS5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjYW5jZWxcIjogICAgICAgIFwiYXNzZXRzL3NvdW5kcy9zZV9tYW91ZGFtYXNoaWlfc3lzdGVtMjAubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwic2VsZWN0XCI6ICAgICAgICBcImFzc2V0cy9zb3VuZHMvc2VfbWFvdWRhbWFzaGlpX3N5c3RlbTM2Lm1wM1wiLFxuICAgICAgICAgICAgICAgICAgICBcImNsaWNrXCI6ICAgICAgICAgXCJhc3NldHMvc291bmRzL3NlX21hb3VkYW1hc2hpaV9zeXN0ZW0yNi5tcDNcIixcbiAgICAgICAgICAgICAgICAgICAgXCJjbGljazJcIjogICAgICAgIFwiYXNzZXRzL3NvdW5kcy9jbGljazIubXAzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYm9zc1wiOiAgICAgICAgICBcImFzc2V0cy9zb3VuZHMvYmdtX21hb3VkYW1hc2hpaV9uZW9yb2NrMTAubXAzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBmb250OiB7XG4gICAgICAgICAgICAgICAgICAgIFwiVWJ1bnR1TW9ub1wiOiAgIFwiZm9udHMvVWJ1bnR1TW9uby1Cb2xkLnR0ZlwiLFxuICAgICAgICAgICAgICAgICAgICBcIk9yYml0cm9uXCI6ICAgICBcImZvbnRzL09yYml0cm9uLVJlZ3VsYXIudHRmXCIsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiY29tbW9uXCI6IHtcbiAgICAgICAgICAgICAgICBpbWFnZToge1xuICAgICAgICAgICAgICAgICAgICBcInRleDFcIjogICAgIFwiYXNzZXRzL2ltYWdlcy90ZXgxLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcInRleDJcIjogICAgIFwiYXNzZXRzL2ltYWdlcy90ZXgyLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcInRleF9ib3NzMVwiOlwiYXNzZXRzL2ltYWdlcy90ZXhfYm9zczEucG5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYnVsbGV0XCI6ICAgXCJhc3NldHMvaW1hZ2VzL2J1bGxldC5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJndW5zaGlwXCI6ICBcImFzc2V0cy9pbWFnZXMvZ3Vuc2hpcDEucG5nXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiYml0XCI6ICAgICAgXCJhc3NldHMvaW1hZ2VzL2JpdDEucG5nXCIsICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgXCJzaG90XCI6ICAgICBcImFzc2V0cy9pbWFnZXMvc2hvdC5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJlZmZlY3RcIjogICBcImFzc2V0cy9pbWFnZXMvZWZmZWN0LnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcImJvbWJcIjogICAgIFwiYXNzZXRzL2ltYWdlcy9ib21iLnBuZ1wiLFxuICAgICAgICAgICAgICAgICAgICBcInBhcnRpY2xlXCI6IFwiYXNzZXRzL2ltYWdlcy9wYXJ0aWNsZS5wbmdcIixcbiAgICAgICAgICAgICAgICAgICAgXCJtYXAxZ1wiOiAgICBcImFzc2V0cy9tYXBzL21hcDEucG5nXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInN0YWdlMVwiOiB7XG4gICAgICAgICAgICAgICAgc291bmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFnZTFcIjogICAgICAgIFwiYXNzZXRzL3NvdW5kcy9leHBzeS5tcDNcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic3RhZ2UyXCI6IHtcbiAgICAgICAgICAgICAgICBzb3VuZDoge1xuICAgICAgICAgICAgICAgICAgICBcInN0YWdlMlwiOiAgICAgICAgXCJhc3NldHMvc291bmRzL2RhbmNlX2luX3RoZV9za3kubXAzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcInN0YWdlOVwiOiB7XG4gICAgICAgICAgICAgICAgc291bmQ6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJzdGFnZTlcIjogICAgICAgIFwiYXNzZXRzL3NvdW5kcy9kZXBhcnR1cmUubXAzXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0bXg6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJtYXAxXCI6ICAgICAgICAgIFwiYXNzZXRzL21hcHMvbWFwMS50bXhcIixcbiAgICAgICAgICAgICAgICAgICAgXCJtYXAxX2VuZW15XCI6ICAgIFwiYXNzZXRzL21hcHMvbWFwMV9lbmVteS50bXhcIixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICAvL+OCsuODvOODoOWGheaDheWgsVxuICAgICAgICBkaWZmaWN1bHR5OiAxLCAgLy/pm6PmmJPluqZcbiAgICAgICAgc2NvcmU6IDAsICAgICAgIC8v44K544Kz44KiXG4gICAgICAgIHJhbms6IDEsICAgICAgICAvL+mbo+aYk+W6puODqeODs+OCr1xuICAgICAgICBudW1Db250aW51ZTogMCwgLy/jgrPjg7Pjg4bjgqPjg4vjg6Xjg7zlm57mlbBcblxuICAgICAgICAvL+OCqOOCr+OCueODhuODs+ODieioreWumlxuICAgICAgICBleHRlbmRTY29yZTogWzUwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMF0sXG4gICAgICAgIGV4dGVuZEFkdmFuY2U6IDAsXG4gICAgICAgIGlzRXh0ZW5kRXZlcnk6IGZhbHNlLFxuICAgICAgICBleHRlbmRFdmVyeVNjb3JlOiA1MDAwMDAsXG5cbiAgICAgICAgLy/jg5fjg6zjgqTjg6Tjg7zoqK3lrppcbiAgICAgICAgc2V0dGluZzoge1xuICAgICAgICAgICAgemFua2k6IDMsICAgICAgIC8v5q6L5qmfXG4gICAgICAgICAgICBib21iU3RvY2s6IDIsICAgLy/jg5zjg6DmrovmlbBcbiAgICAgICAgICAgIGJvbWJTdG9ja01heDogMiwvL+ODnOODoOacgOWkp+aVsFxuICAgICAgICAgICAgYXV0b0JvbWI6IGZhbHNlLC8v44Kq44O844OI44Oc44Og44OV44Op44KwXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy/jg4fjg5Xjgqnjg6vjg4joqK3lrppcbiAgICAgICAgX2RlZmF1bHRTZXR0aW5nOiB7XG4gICAgICAgICAgICBkaWZmaWN1bHR5OiAxLFxuICAgICAgICAgICAgemFua2k6IDMsXG4gICAgICAgICAgICBib21iU3RvY2s6IDIsXG4gICAgICAgICAgICBib21iU3RvY2tNYXg6IDIsXG4gICAgICAgICAgICBhdXRvQm9tYjogZmFsc2UsXG5cbiAgICAgICAgICAgIC8v44Ko44Kv44K544OG44Oz44OJ6Kit5a6aXG4gICAgICAgICAgICBleHRlbmRTY29yZTogWzUwMDAwMCwgMjAwMDAwMCwgNTAwMDAwMF0sXG4gICAgICAgICAgICBpc0V4dGVuZEV2ZXJ5OiBmYWxzZSxcbiAgICAgICAgICAgIGV4dGVuZEV2ZXJ5U2NvcmU6IDUwMDAwMCxcbiAgICAgICAgfSxcblxuICAgICAgICAvL+ePvuWcqOioreWumlxuICAgICAgICBjdXJyZW50cnlTZXR0aW5nOiB7XG4gICAgICAgICAgICBkaWZmaWN1bHR5OiAxLFxuICAgICAgICAgICAgemFua2k6IDMsXG4gICAgICAgICAgICBib21iU3RvY2s6IDIsXG4gICAgICAgICAgICBib21iU3RvY2tNYXg6IDIsXG4gICAgICAgICAgICBhdXRvQm9tYjogZmFsc2UsXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy/vvKLvvKfvvK3vvIblirnmnpzpn7NcbiAgICAgICAgc291bmRzZXQ6IG51bGwsXG5cbiAgICAgICAgLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4njgqvjg6njg7xcbiAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgwLCAwLCAwLCAxKScsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBxdWVyeTogJyN3b3JsZCcsXG4gICAgICAgICAgICB3aWR0aDogU0NfVyxcbiAgICAgICAgICAgIGhlaWdodDogU0NfSCxcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuXG4gICAgICAgIHRoaXMuZnBzID0gNjA7XG4vKlxuICAgICAgICB0aGlzLmNhbnZhcy5jb250ZXh0LmltYWdlU21vb3RoaW5nRW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZG9tRWxlbWVudC5zdHlsZS5pbWFnZVJlbmRlcmluZyA9IFwicGl4ZWxhdGVkXCI7XG4qL1xuICAgICAgICAvL+ioreWumuaDheWgseOBruiqreOBv+i+vOOBv1xuICAgICAgICB0aGlzLmxvYWRDb25maWcoKTtcblxuICAgICAgICAvL++8ou+8p++8re+8hu+8s++8pVxuICAgICAgICB0aGlzLnNvdW5kc2V0ID0gcGhpbmEuZXh0ZW5zaW9uLlNvdW5kU2V0KCk7XG5cbiAgICAgICAgLy/jgrLjg7zjg6Djg5Hjg4Pjg4njgpLkvb/nlKjjgZnjgotcbiAgICAgICAgdGhpcy5nYW1lcGFkTWFuYWdlciA9IHBoaW5hLmlucHV0LkdhbWVwYWRNYW5hZ2VyKCk7XG4gICAgICAgIHRoaXMuZ2FtZXBhZCA9IHRoaXMuZ2FtZXBhZE1hbmFnZXIuZ2V0KDApO1xuICAgICAgICB0aGlzLm9uKCdlbnRlcmZyYW1lJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWVwYWRNYW5hZ2VyLnVwZGF0ZSgpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVDb250cm9sbGVyKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVwbGFjZVNjZW5lKFNjZW5lRmxvdygpKTtcbiAgICB9LFxuXG4gICAgLy/jgrPjg7Pjg4jjg63jg7zjg6njg7zmg4XloLHjga7mm7TmlrBcbiAgICB1cGRhdGVDb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGdwID0gdGhpcy5nYW1lcGFkO1xuICAgICAgICB2YXIga2IgPSB0aGlzLmtleWJvYXJkO1xuICAgICAgICB2YXIgYW5nbGUxID0gZ3AuZ2V0S2V5QW5nbGUoKTtcbiAgICAgICAgdmFyIGFuZ2xlMiA9IGtiLmdldEtleUFuZ2xlKCk7XG4gICAgICAgIHRoaXMuY29udHJvbGxlciA9IHtcbiAgICAgICAgICAgIGFuZ2xlOiBhbmdsZTEgIT09IG51bGw/IGFuZ2xlMTogYW5nbGUyLFxuXG4gICAgICAgICAgICB1cDogZ3AuZ2V0S2V5KFwidXBcIikgfHwga2IuZ2V0S2V5KFwidXBcIiksXG4gICAgICAgICAgICBkb3duOiBncC5nZXRLZXkoXCJkb3duXCIpIHx8IGtiLmdldEtleShcImRvd25cIiksXG4gICAgICAgICAgICBsZWZ0OiBncC5nZXRLZXkoXCJsZWZ0XCIpIHx8IGtiLmdldEtleShcImxlZnRcIiksXG4gICAgICAgICAgICByaWdodDogZ3AuZ2V0S2V5KFwicmlnaHRcIikgfHwga2IuZ2V0S2V5KFwicmlnaHRcIiksXG5cbiAgICAgICAgICAgIHNob3Q6IGdwLmdldEtleShcIkFcIikgfHwga2IuZ2V0S2V5KFwiWlwiKSxcbiAgICAgICAgICAgIGJvbWI6IGdwLmdldEtleShcIkJcIikgfHwga2IuZ2V0S2V5KFwiWFwiKSxcbiAgICAgICAgICAgIHNwZWNpYWwxOiBncC5nZXRLZXkoXCJYXCIpIHx8IGtiLmdldEtleShcIkNcIiksXG4gICAgICAgICAgICBzcGVjaWFsMjogZ3AuZ2V0S2V5KFwiWVwiKSB8fCBrYi5nZXRLZXkoXCJWXCIpLFxuXG4gICAgICAgICAgICBvazogZ3AuZ2V0S2V5KFwiQVwiKSB8fCBrYi5nZXRLZXkoXCJaXCIpIHx8IGtiLmdldEtleShcInNwYWNlXCIpLFxuICAgICAgICAgICAgY2FuY2VsOiBncC5nZXRLZXkoXCJCXCIpIHx8IGtiLmdldEtleShcIlhcIiksXG5cbiAgICAgICAgICAgIHN0YXJ0OiBncC5nZXRLZXkoXCJzdGFydFwiKSxcbiAgICAgICAgICAgIHNlbGVjdDogZ3AuZ2V0S2V5KFwic2VsZWN0XCIpLFxuXG4gICAgICAgICAgICBhbmFsb2cxOiBncC5nZXRTdGlja0RpcmVjdGlvbigwKSxcbiAgICAgICAgICAgIGFuYWxvZzI6IGdwLmdldFN0aWNrRGlyZWN0aW9uKDEpLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBfb25Mb2FkQXNzZXRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zb3VuZHNldC5yZWFkQXNzZXQoKTtcblxuICAgICAgICAvL+eJueauiuWKueaenOeUqOODk+ODg+ODiOODnuODg+ODl+S9nOaIkFxuICAgICAgICBbXG4gICAgICAgICAgICBcInRleDFcIixcbiAgICAgICAgICAgIFwidGV4MlwiLFxuICAgICAgICAgICAgXCJ0ZXhfYm9zczFcIixcbiAgICAgICAgICAgIFwiZ3Vuc2hpcFwiLFxuICAgICAgICAgICAgXCJiaXRcIixcbiAgICAgICAgXS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgICAgIC8v44OA44Oh44O844K455SoXG4gICAgICAgICAgICBpZiAoIXBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoXCJpbWFnZVwiLCBuYW1lK1wiV2hpdGVcIikpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGV4ID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldChcImltYWdlXCIsIG5hbWUpLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgdGV4LmZpbHRlciggZnVuY3Rpb24ocGl4ZWwsIGluZGV4LCB4LCB5LCBiaXRtYXApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBiaXRtYXAuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCswXSA9IChwaXhlbFswXSA9PSAwPyAwOiAxMjgpOyAvL3JcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCsxXSA9IChwaXhlbFsxXSA9PSAwPyAwOiAxMjgpOyAvL2dcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCsyXSA9IChwaXhlbFsyXSA9PSAwPyAwOiAxMjgpOyAvL2JcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuc2V0KFwiaW1hZ2VcIiwgbmFtZStcIldoaXRlXCIsIHRleCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL+eAleatu+eUqFxuICAgICAgICAgICAgaWYgKCFwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KFwiaW1hZ2VcIiwgbmFtZStcIlJlZFwiKSkge1xuICAgICAgICAgICAgICAgIHZhciB0ZXggPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KFwiaW1hZ2VcIiwgbmFtZSkuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB0ZXguZmlsdGVyKCBmdW5jdGlvbihwaXhlbCwgaW5kZXgsIHgsIHksIGJpdG1hcCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGJpdG1hcC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzBdID0gcGl4ZWxbMF07XG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaW5kZXgrMV0gPSAwO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzJdID0gMDtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuc2V0KFwiaW1hZ2VcIiwgbmFtZStcIlJlZFwiLCB0ZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/lvbHnlKhcbiAgICAgICAgICAgIGlmICghcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldChcImltYWdlXCIsIG5hbWUrXCJCbGFja1wiKSkge1xuICAgICAgICAgICAgICAgIHZhciB0ZXggPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KFwiaW1hZ2VcIiwgbmFtZSkuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICB0ZXguZmlsdGVyKCBmdW5jdGlvbihwaXhlbCwgaW5kZXgsIHgsIHksIGJpdG1hcCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGJpdG1hcC5kYXRhO1xuICAgICAgICAgICAgICAgICAgICBkYXRhW2luZGV4KzBdID0gMDtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVtpbmRleCsxXSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFbaW5kZXgrMl0gPSAwO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5zZXQoXCJpbWFnZVwiLCBuYW1lK1wiQmxhY2tcIiwgdGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8v6Kit5a6a44OH44O844K/44Gu5L+d5a2YXG4gICAgc2F2ZUNvbmZpZzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+ioreWumuODh+ODvOOCv+OBruiqreOBv+i+vOOBv1xuICAgIGxvYWRDb25maWc6IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgcGxheUJHTTogZnVuY3Rpb24oYXNzZXQsIGxvb3AsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChsb29wID09PSB1bmRlZmluZWQpIGxvb3AgPSB0cnVlO1xuICAgICAgICB0aGlzLnNvdW5kc2V0LnBsYXlCR00oYXNzZXQsIGxvb3AsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgc3RvcEJHTTogZnVuY3Rpb24oYXNzZXQpIHtcbiAgICAgICAgdGhpcy5zb3VuZHNldC5zdG9wQkdNKCk7XG4gICAgfSxcblxuICAgIHNldFZvbHVtZUJHTTogZnVuY3Rpb24odm9sKSB7XG4gICAgICAgIGlmICh2b2wgPiAxKSB2b2wgPSAxO1xuICAgICAgICBpZiAodm9sIDwgMCkgdm9sID0gMDtcbiAgICAgICAgdGhpcy5zb3VuZHNldC5zZXRWb2x1bWVCR00odm9sKTtcbiAgICB9LFxuXG4gICAgcGxheVNFOiBmdW5jdGlvbihhc3NldCwgbG9vcCkge1xuICAgICAgICB0aGlzLnNvdW5kc2V0LnBsYXlTRShhc3NldCwgbG9vcCk7XG4gICAgfSxcblxuICAgIHNldFZvbHVtZVNFOiBmdW5jdGlvbih2b2wpIHtcbiAgICAgICAgaWYgKHZvbCA+IDEpIHZvbCA9IDE7XG4gICAgICAgIGlmICh2b2wgPCAwKSB2b2wgPSAwO1xuICAgICAgICB0aGlzLnNvdW5kc2V0LnNldFZvbHVtZVNFKHZvbCk7XG4gICAgfSxcblxuICAgIF9hY2Nlc3Nvcjoge1xuICAgICAgICB2b2x1bWVCR006IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5zb3VuZHMudm9sdW1lQkdNOyB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24odm9sKSB7IHRoaXMuc2V0Vm9sdW1lQkdNKHZvbCk7IH1cbiAgICAgICAgfSxcbiAgICAgICAgdm9sdW1lU0U6IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5zb3VuZHMudm9sdW1lU0U7IH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih2b2wpIHsgdGhpcy5zZXRWb2x1bWVTRSh2b2wpOyB9XG4gICAgICAgIH1cbiAgICB9XG59KTtcbiIsIi8qXG4gKiAgbWFpbi5qc1xuICogIDIwMTUvMDkvMDhcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbi8vcGhpbmEuZ2xvYmFsaXplKCk7XG5cbi8v5a6a5pWwXG4vL+ODkOODvOOCuOODp+ODs+ODiuODs+ODkOODvFxuY29uc3QgX1ZFUlNJT05fID0gXCIwLjEuMFwiO1xuXG4vL+ODh+ODkOODg+OCsOODleODqeOCsFxuY29uc3QgREVCVUcgPSBmYWxzZTtcbmNvbnN0IE1VVEVLSSA9IGZhbHNlO1xuY29uc3QgVklFV19DT0xMSVNJT04gPSBmYWxzZTtcblxuLy/jgrnjgq/jg6rjg7zjg7PjgrXjgqTjgrpcbmNvbnN0IFNDX1cgPSAzMjA7XG5jb25zdCBTQ19IID0gNDgwO1xuY29uc3QgU0NfT0ZGU0VUX1ggPSAwO1xuY29uc3QgU0NfT0ZGU0VUX1kgPSAwO1xuY29uc3QgU0NfV19DID0gU0NfVyowLjU7ICAgLy9DRU5URVJcbmNvbnN0IFNDX0hfQyA9IFNDX0gqMC41O1xuXG4vL+ODrOOCpOODpOODvOWMuuWIhlxuY29uc3QgTEFZRVJfU1lTVEVNID0gMTI7ICAgICAgICAgIC8v44K344K544OG44Og6KGo56S6XG5jb25zdCBMQVlFUl9GT1JFR1JPVU5EID0gMTE7ICAgICAgLy/jg5XjgqnjgqLjgrDjg6njgqbjg7Pjg4lcbmNvbnN0IExBWUVSX0VGRkVDVF9VUFBFUiA9IDEwOyAgICAvL+OCqOODleOCp+OCr+ODiOS4iuS9jVxuY29uc3QgTEFZRVJfUExBWUVSID0gOTsgICAgICAgICAgIC8v44OX44Os44Kk44Ok44O8XG5jb25zdCBMQVlFUl9CVUxMRVQgPSA4OyAgICAgICAgICAgLy/lvL5cbmNvbnN0IExBWUVSX1NIT1QgPSA3OyAgICAgICAgICAgICAvL+OCt+ODp+ODg+ODiFxuY29uc3QgTEFZRVJfT0JKRUNUX1VQUEVSID0gNjsgICAgIC8v44Kq44OW44K444Kn44Kv44OI5LiK5L2NXG5jb25zdCBMQVlFUl9PQkpFQ1RfTUlERExFID0gNTsgICAgLy/jgqrjg5bjgrjjgqfjgq/jg4jkuK3plpNcbmNvbnN0IExBWUVSX0VGRkVDVF9NSURETEUgPSA0OyAgICAvL+OCqOODleOCp+OCr+ODiOS4remWk1xuY29uc3QgTEFZRVJfT0JKRUNUX0xPV0VSID0gMzsgICAgIC8v44Kq44OW44K444Kn44Kv44OI5LiL5L2NXG5jb25zdCBMQVlFUl9FRkZFQ1RfTE9XRVIgPSAyOyAgICAgLy/jgqjjg5Xjgqfjgq/jg4jkuIvkvY1cbmNvbnN0IExBWUVSX1NIQURPVyA9IDE7ICAgICAgICAgICAvL+W9sVxuY29uc3QgTEFZRVJfQkFDS0dST1VORCA9IDA7ICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG5cbi8v5pW144K/44Kk44OX5a6a5pWwXG5jb25zdCBFTkVNWV9TTUFMTCA9IDA7XG5jb25zdCBFTkVNWV9NSURETEUgPSAxO1xuY29uc3QgRU5FTVlfTEFSR0UgPSAyO1xuY29uc3QgRU5FTVlfTUJPU1MgPSAzO1xuY29uc3QgRU5FTVlfQk9TUyA9IDQ7XG5jb25zdCBFTkVNWV9CT1NTX0VRVUlQID0gNTsgLy/jg5zjgrnoo4XlgplcbmNvbnN0IEVORU1ZX0lURU0gPSA5O1xuXG4vL+eIhueZuuOCv+OCpOODl+WumuaVsFxuY29uc3QgRVhQTE9ERV9OT1RISU5HID0gLTE7XG5jb25zdCBFWFBMT0RFX1NNQUxMID0gMDtcbmNvbnN0IEVYUExPREVfTUlERExFID0gMTtcbmNvbnN0IEVYUExPREVfTEFSR0UgPSAyO1xuY29uc3QgRVhQTE9ERV9HUk9VTkQgPSAzO1xuY29uc3QgRVhQTE9ERV9NQk9TUyA9IDQ7XG5jb25zdCBFWFBMT0RFX0JPU1MgPSA1O1xuXG4vL+OCouOCpOODhuODoOeorumhnlxuY29uc3QgSVRFTV9QT1dFUiA9IDA7XG5jb25zdCBJVEVNX0JPTUIgPSAxO1xuY29uc3QgSVRFTV8xVVAgPSAwO1xuXG52YXIgS0VZQk9BUkRfTU9WRSA9IHtcbiAgICAgIDA6IHsgeDogIDEuMCwgeTogIDAuMCB9LFxuICAgICA0NTogeyB4OiAgMC43LCB5OiAtMC43IH0sXG4gICAgIDkwOiB7IHg6ICAwLjAsIHk6IC0xLjAgfSxcbiAgICAxMzU6IHsgeDogLTAuNywgeTogLTAuNyB9LFxuICAgIDE4MDogeyB4OiAtMS4wLCB5OiAgMC4wIH0sXG4gICAgMjI1OiB7IHg6IC0wLjcsIHk6ICAwLjcgfSxcbiAgICAyNzA6IHsgeDogIDAuMCwgeTogIDEuMCB9LFxuICAgIDMxNTogeyB4OiAgMC43LCB5OiAgMC43IH0sXG59O1xuXG4vL+OCpOODs+OCueOCv+ODs+OCuVxudmFyIGFwcDtcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIGFwcCA9IEFwcGxpY2F0aW9uKCk7XG4gICAgYXBwLmRvbUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiBkdW1teSgpIHtcbiAgICAgICAgdmFyIGNvbnRleHQgPSBwaGluYS5hc3NldC5Tb3VuZC5nZXRBdWRpb0NvbnRleHQoKTtcbiAgICAgICAgY29udGV4dC5yZXN1bWUoKTtcbiAgICB9KTtcbiAgICBhcHAucnVuKCk7XG4gICAgYXBwLmVuYWJsZVN0YXRzKCk7XG59O1xuIiwiLypcbiAqICBkYW5tYWt1LnV0aWxpdHkuanNcbiAqICAyMDE1LzEyLzAxXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFjdGlvbiA9IGJ1bGxldG1sLmRzbC5hY3Rpb247XG4gICAgdmFyIGFjdGlvblJlZiA9IGJ1bGxldG1sLmRzbC5hY3Rpb25SZWY7XG4gICAgdmFyIGJ1bGxldCA9IGJ1bGxldG1sLmRzbC5idWxsZXQ7XG4gICAgdmFyIGJ1bGxldFJlZiA9IGJ1bGxldG1sLmRzbC5idWxsZXRSZWY7XG4gICAgdmFyIGZpcmUgPSBidWxsZXRtbC5kc2wuZmlyZTtcbiAgICB2YXIgZmlyZVJlZiA9IGJ1bGxldG1sLmRzbC5maXJlUmVmO1xuICAgIHZhciBjaGFuZ2VEaXJlY3Rpb24gPSBidWxsZXRtbC5kc2wuY2hhbmdlRGlyZWN0aW9uO1xuICAgIHZhciBjaGFuZ2VTcGVlZCA9IGJ1bGxldG1sLmRzbC5jaGFuZ2VTcGVlZDtcbiAgICB2YXIgYWNjZWwgPSBidWxsZXRtbC5kc2wuYWNjZWw7XG4gICAgdmFyIHdhaXQgPSBidWxsZXRtbC5kc2wud2FpdDtcbiAgICB2YXIgdmFuaXNoID0gYnVsbGV0bWwuZHNsLnZhbmlzaDtcbiAgICB2YXIgcmVwZWF0ID0gYnVsbGV0bWwuZHNsLnJlcGVhdDtcbiAgICB2YXIgYmluZFZhciA9IGJ1bGxldG1sLmRzbC5iaW5kVmFyO1xuICAgIHZhciBub3RpZnkgPSBidWxsZXRtbC5kc2wubm90aWZ5O1xuICAgIHZhciBkaXJlY3Rpb24gPSBidWxsZXRtbC5kc2wuZGlyZWN0aW9uO1xuICAgIHZhciBzcGVlZCA9IGJ1bGxldG1sLmRzbC5zcGVlZDtcbiAgICB2YXIgaG9yaXpvbnRhbCA9IGJ1bGxldG1sLmRzbC5ob3Jpem9udGFsO1xuICAgIHZhciB2ZXJ0aWNhbCA9IGJ1bGxldG1sLmRzbC52ZXJ0aWNhbDtcbiAgICB2YXIgZmlyZU9wdGlvbiA9IGJ1bGxldG1sLmRzbC5maXJlT3B0aW9uO1xuICAgIHZhciBvZmZzZXRYID0gYnVsbGV0bWwuZHNsLm9mZnNldFg7XG4gICAgdmFyIG9mZnNldFkgPSBidWxsZXRtbC5kc2wub2Zmc2V0WTtcbiAgICB2YXIgYXV0b25vbXkgPSBidWxsZXRtbC5kc2wuYXV0b25vbXk7XG5cbiAgICAvL+W8vueorlxuICAgIHZhciBSUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbiAgICB2YXIgUk0gID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC44fSk7XG4gICAgdmFyIFJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xuICAgIHZhciBSRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC42fSk7XG4gICAgdmFyIFJFTSA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAxLjB9KTtcblxuICAgIHZhciBCUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC42fSk7XG4gICAgdmFyIEJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjh9KTtcbiAgICB2YXIgQkwgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDEuMH0pO1xuICAgIHZhciBCRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xuICAgIHZhciBCRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDEuMH0pO1xuXG4gICAgdmFyIFRISU4gPSBidWxsZXQoeyB0eXBlOiBcIlRISU5cIiB9KTtcblxuICAgIHZhciBETSAgPSBidWxsZXQoeyBkdW1teTogdHJ1ZSB9KTtcblxuICAgIHZhciB3YWl0ID0gYnVsbGV0bWwuZHNsLndhaXQ7XG4gICAgdmFyIHNwZWVkID0gYnVsbGV0bWwuZHNsLnNwZWVkO1xuXG4gICAgYnVsbGV0bWwuZHNsLmludGVydmFsID0gZnVuY3Rpb24odikge1xuICAgICAgICByZXR1cm4gd2FpdChcInswfSAqICgwLjMgKyAoMS4wIC0gJGRlbnNpdHlSYW5rKSAqIDAuNylcIi5mb3JtYXQodikpO1xuICAgIH07XG4gICAgYnVsbGV0bWwuZHNsLnNwZCA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgcmV0dXJuIHNwZWVkKFwiezB9ICogKDEuMCArICRzcGVlZFJhbmsgKiAyLjApICogJHNwZWVkQmFzZVwiLmZvcm1hdCh2KSk7XG4gICAgfTtcbiAgICBidWxsZXRtbC5kc2wuc3BkU2VxID0gZnVuY3Rpb24odikge1xuICAgICAgICByZXR1cm4gc3BlZWQoXCJ7MH0gKiAoMS4wICsgJHNwZWVkUmFuayAqIDIuMCkgKiAkc3BlZWRCYXNlXCIuZm9ybWF0KHYpLCBcInNlcXVlbmNlXCIpO1xuICAgIH07XG5cbiAgICBidWxsZXRtbC5kc2wucmFuayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gXCIkZGlmZmljdWx0eSArICgkcmFuayowLjAxKS0xXCI7XG4gICAgfTtcblxuICAgIC8q6Ieq5qmf5by+XG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5TcGVlZH0gc3BlZWQg5by+6YCfXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5idWxsZXR9IGJ1bGxldCDlvL7nqK5cbiAgICAgKi9cbiAgICBidWxsZXRtbC5kc2wuZmlyZUFpbTAgPSBmdW5jdGlvbihidWxsZXQsIHNwZWVkKSB7IHJldHVybiBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQgfHwgc3BkKDAuOCksIGRpcmVjdGlvbigwKSkgfTtcbiAgICBidWxsZXRtbC5kc2wuZmlyZUFpbTEgPSBmdW5jdGlvbihidWxsZXQsIHNwZWVkKSB7IHJldHVybiBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQgfHwgc3BkKDAuOCksIGRpcmVjdGlvbihNYXRoLnJhbmRmKC0yLCAyKSkpIH07XG4gICAgYnVsbGV0bWwuZHNsLmZpcmVBaW0yID0gZnVuY3Rpb24oYnVsbGV0LCBzcGVlZCkgeyByZXR1cm4gZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkIHx8IHNwZCgwLjgpLCBkaXJlY3Rpb24oTWF0aC5yYW5kZigtNCwgNCkpKSB9O1xuICAgIC8v44Km44Kj44OD44OX55SoXG4gICAgYnVsbGV0bWwuZHNsLmZpcmVBaW0wVnMgPSBmdW5jdGlvbihidWxsZXQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVsbGV0bWwuZHNsLmZpcmVBaW0wKGJ1bGxldCwgc3BlZWQpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgYnVsbGV0bWwuZHNsLmZpcmVBaW0xVnMgPSBmdW5jdGlvbihidWxsZXQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVsbGV0bWwuZHNsLmZpcmVBaW0xKGJ1bGxldCwgc3BlZWQpO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgYnVsbGV0bWwuZHNsLmZpcmVBaW0yVnMgPSBmdW5jdGlvbihidWxsZXQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVsbGV0bWwuZHNsLmZpcmVBaW0yKGJ1bGxldCwgc3BlZWQpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKuiHquapn+eLmeOBhE53YXnlvL5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2F5IOS4gOW6puOBq+WwhOWHuuOBmeOCi+W8vuaVsFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYW5nZUZyb20g6Ieq5qmf44KS77yQ44Go44GX44Gf6ZaL5aeL6KeS5bqmXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHJhbmdlVG8g6Ieq5qmf44KS77yQ44Go44GX44Gf57WC5LqG6KeS5bqmXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5idWxsZXR9IGJ1bGxldCDlvL7nqK5cbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLlNwZWVkfSBzcGVlZCDlvL7pgJ9cbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLm9mZnNldFh9IG9mZnNldFgg5bCE5Ye6WOW6p+aomVxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwub2Zmc2V0WX0gb2Zmc2V0WSDlsITlh7pZ5bqn5qiZXG4gICAgICovXG4gICAgYnVsbGV0bWwuZHNsLm53YXkgPSBmdW5jdGlvbih3YXksIHJhbmdlRnJvbSwgcmFuZ2VUbywgYnVsbGV0LCBzcGVlZCwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbihbXG4gICAgICAgICAgICBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQsIGRpcmVjdGlvbihyYW5nZUZyb20pLCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSksXG4gICAgICAgICAgICBiaW5kVmFyKFwid2F5XCIsIFwiTWF0aC5tYXgoMiwgXCIgKyB3YXkgKyBcIilcIiksXG4gICAgICAgICAgICByZXBlYXQoXCIkd2F5LTFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoYnVsbGV0IHx8IFJTLCBzcGVlZCwgZGlyZWN0aW9uKFwiKChcIiArIHJhbmdlVG8gKyBcIiktKFwiICsgcmFuZ2VGcm9tICsgXCIpKS8oJHdheS0xKVwiLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSk7XG4gICAgfTtcbiAgICAvL+OCpuOCo+ODg+ODl+eUqFxuICAgIGJ1bGxldG1sLmRzbC5ud2F5VnMgPSBmdW5jdGlvbih3YXksIHJhbmdlRnJvbSwgcmFuZ2VUbywgYnVsbGV0LCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBidWxsZXRtbC5kc2wubndheSh3YXksIHJhbmdlRnJvbSwgcmFuZ2VUbywgYnVsbGV0LCBzcGVlZCwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDntbblr75Od2F55by+XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdheSDkuIDluqbjgavlsITlh7rjgZnjgovlvL7mlbBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gcmFuZ2VGcm9tIOecn+S4iuOCku+8kOOBqOOBl+OBn+mWi+Wni+inkuW6plxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSByYW5nZVRvIOecn+S4iuOCku+8kOOBqOOBl+OBn+e1guS6huinkuW6plxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuYnVsbGV0fSBidWxsZXQg5by+56iuXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5TcGVlZH0gc3BlZWQg5by+6YCfXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5vZmZzZXRYfSBvZmZzZXRYIOWwhOWHuljluqfmqJlcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLm9mZnNldFl9IG9mZnNldFkg5bCE5Ye6WeW6p+aomVxuICAgICAqL1xuICAgIGJ1bGxldG1sLmRzbC5hYnNvbHV0ZU53YXkgPSBmdW5jdGlvbih3YXksIHJhbmdlRnJvbSwgcmFuZ2VUbywgYnVsbGV0LCBzcGVlZCwgb2Zmc2V0WCwgb2Zmc2V0WSkge1xuICAgICAgICByZXR1cm4gYWN0aW9uKFtcbiAgICAgICAgICAgIGZpcmUoYnVsbGV0IHx8IFJTLCBzcGVlZCwgJGRpcmVjdGlvbihyYW5nZUZyb20sIFwiYWJzb2x1dGVcIiksIG9mZnNldFgsIG9mZnNldFkpLFxuICAgICAgICAgICAgYmluZFZhcihcIndheVwiLCBcIk1hdGgubWF4KDIsIFwiICsgd2F5ICsgXCIpXCIpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJHdheS0xXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQsIGRpcmVjdGlvbihcIigoXCIgKyByYW5nZVRvICsgXCIpLShcIiArIHJhbmdlRnJvbSArIFwiKSkvKCR3YXktMSlcIiwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCwgb2Zmc2V0WSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSk7XG4gICAgfTtcbiAgICAvL+OCpuOCo+ODg+ODl+eUqFxuICAgIGJ1bGxldG1sLmRzbC5hYnNvbHV0ZU53YXlWcyA9IGZ1bmN0aW9uKHdheSwgcmFuZ2VGcm9tLCByYW5nZVRvLCBidWxsZXQsIG9mZnNldFgsIG9mZnNldFkpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVsbGV0bWwuZHNsLm53YXkod2F5LCByYW5nZUZyb20sIHJhbmdlVG8sIGJ1bGxldCwgc3BlZWQsIG9mZnNldFgsIG9mZnNldFkpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDoh6rmqZ/ni5njgYTjgrXjg7zjgq/jg6vlvL5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gd2F5IOS4gOW6puOBq+WwhOWHuuOBmeOCi+W8vuaVsFxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuYnVsbGV0fSBidWxsZXQg5by+56iuXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5TcGVlZH0gc3BlZWQg5by+6YCfXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5vZmZzZXRYfSBvZmZzZXRYIOWwhOWHuljluqfmqJlcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLm9mZnNldFl9IG9mZnNldFkg5bCE5Ye6WeW6p+aomVxuICAgICAqL1xuICAgIGJ1bGxldG1sLmRzbC5jaXJjbGUgPSBmdW5jdGlvbih3YXksIGJ1bGxldCwgc3BlZWQsIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KSB7XG4gICAgICAgIHJldHVybiBhY3Rpb24oW1xuICAgICAgICAgICAgZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkLCBkaXJlY3Rpb24oMCksIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KSxcbiAgICAgICAgICAgIGJpbmRWYXIoXCJ3YXlcIiwgXCJNYXRoLm1heCgyLCBcIiArIHdheSArIFwiKVwiKSxcbiAgICAgICAgICAgIGJpbmRWYXIoXCJkaXJcIiwgXCJNYXRoLmZsb29yKDM2MC8kd2F5KVwiKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiR3YXktMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShidWxsZXQgfHwgUlMsIHNwZWVkLCBkaXJlY3Rpb24oXCIkZGlyXCIsIFwic2VxdWVuY2VcIiksIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICBdKTtcbiAgICB9O1xuICAgIC8v44Km44Kj44OD44OX55SoXG4gICAgYnVsbGV0bWwuZHNsLmNpcmNsZVZzID0gZnVuY3Rpb24od2F5LCBidWxsZXQsIG9mZnNldFgsIG9mZnNldFksIGF1dG9ub215KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzcGVlZCkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1bGxldG1sLmRzbC5jaXJjbGUod2F5LCBidWxsZXQsIHNwZWVkLCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog57W25a++44K144O844Kv44Or5by+XG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdheSDkuIDluqbjgavlsITlh7rjgZnjgovlvL7mlbBcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGlyIOecn+S4iuOCku+8kOOBqOOBl+OBn+Wfuua6luinkuW6plxuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuYnVsbGV0fSBidWxsZXQg5by+56iuXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5TcGVlZH0gc3BlZWQg5by+6YCfXG4gICAgICogQHBhcmFtIHtidWxsZXRtbC5vZmZzZXRYfSBvZmZzZXRYIOWwhOWHuljluqfmqJlcbiAgICAgKiBAcGFyYW0ge2J1bGxldG1sLm9mZnNldFl9IG9mZnNldFkg5bCE5Ye6WeW6p+aomVxuICAgICAqL1xuICAgIGJ1bGxldG1sLmRzbC5hYnNvbHV0ZUNpcmNsZSA9IGZ1bmN0aW9uKHdheSwgZGlyLCBidWxsZXQsIHNwZWVkLCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSkge1xuICAgICAgICByZXR1cm4gYWN0aW9uKFtcbiAgICAgICAgICAgIGZpcmUoYnVsbGV0IHx8IFJTLCBzcGVlZCwgZGlyZWN0aW9uKGRpciwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpLFxuICAgICAgICAgICAgYmluZFZhcihcIndheVwiLCBcIk1hdGgubWF4KDIsIFwiICsgd2F5ICsgXCIpXCIpLFxuICAgICAgICAgICAgYmluZFZhcihcImRpclwiLCBcIk1hdGguZmxvb3IoMzYwLyR3YXkpXCIpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJHdheS0xXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKGJ1bGxldCB8fCBSUywgc3BlZWQsIGRpcmVjdGlvbihcIiRkaXJcIiwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgIF0pO1xuICAgIH07XG4gICAgLy/jgqbjgqPjg4Pjg5fnlKhcbiAgICBidWxsZXRtbC5kc2wuYWJzb2x1dGVDaXJjbGVWcyA9IGZ1bmN0aW9uKHdheSwgYnVsbGV0LCBvZmZzZXRYLCBvZmZzZXRZLCBhdXRvbm9teSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc3BlZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBidWxsZXRtbC5kc2wuY2lyY2xlKHdheSwgYnVsbGV0LCBzcGVlZCwgb2Zmc2V0WCwgb2Zmc2V0WSwgYXV0b25vbXkpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOOCpuOCo+ODg+ODl1xuICAgICAqIEBwYXJhbSB7YnVsbGV0bWwuU3BlZWR9IGJhc2VTcGVlZCDliJ3lm57jga7jgrnjg5Tjg7zjg4lcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gZGVsdGEgMuWbnuebruS7pemZjeOBruOCueODlOODvOODieWil+WIhlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudCDlm57mlbBcbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKGJ1bGxldG1sLlNwZWVkKTpidWxsZXRtbC5BY3Rpb259IOOCueODlOODvOODieOCkuWPl+OBkeWPluOCikFjdGlvbuOCkui/lOOBmemWouaVsFxuICAgICAqL1xuICAgIGJ1bGxldG1sLmRzbC53aGlwID0gZnVuY3Rpb24oYmFzZVNwZWVkLCBkZWx0YSwgY291bnQsIGFjdGlvbkZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIGFjdGlvbihbXG4gICAgICAgICAgICBhY3Rpb25GdW5jKGJhc2VTcGVlZCksXG4gICAgICAgICAgICByZXBlYXQoY291bnQgKyBcIi0xXCIsIFtcbiAgICAgICAgICAgICAgICBhY3Rpb25GdW5jKGJ1bGxldG1sLmRzbC5zcGRTZXEoZGVsdGEpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICBdKTtcbiAgICB9O1xufSk7XG5cbiIsIi8qXG4gKiAgZGlhbG9nLmpzXG4gKiAgMjAxNS8xMC8xOVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcIkNvbmZpcm1EaWFsb2dcIiwge1xuICAgIHN1cGVyQ2xhc3M6IHBoaW5hLmFwcC5EaXNwbGF5U2NlbmUsXG5cbiAgICBhbnN3ZXI6IG51bGwsXG5cbiAgICAvL+ODqeODmeODq+eUqOODleOCqeODs+ODiOODkeODqeODoeODvOOCv1xuICAgIGxhYmVsUGFyYW06IHtmb250RmFtaWx5OlwiWWFzYXNoaXNhXCIsIGFsaWduOiBcImNlbnRlclwiLCBiYXNlbGluZTpcIm1pZGRsZVwiLCBvdXRsaW5lV2lkdGg6MyB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oY2FwdGlvbiwgYnV0dG9uLCBmb250U2l6ZSkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICBcbiAgICAgICAgYnV0dG9uID0gYnV0dG9uIHx8IFtcIk9LXCIsIFwiQ0FOQ0VMXCJdO1xuICAgICAgICBmb250U2l6ZSA9IGZvbnRTaXplIHx8IDUwO1xuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG4gICAgICAgIHZhciBwYXJhbSA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCxcbiAgICAgICAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJnID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdmFyIHdpZHRoID0gU0NfVy0yOCwgaGVpZ2h0ID0gOTA7XG4gICAgICAgIHZhciBwYXJhbSA9IHtmaWxsU3R5bGU6J3JnYmEoMCw4MCwwLDEpJywgbGluZVdpZHRoOjR9O1xuXG4gICAgICAgIC8v44Kt44Oj44OX44K344On44OzXG4gICAgICAgIGlmIChjYXB0aW9uIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoY2FwdGlvblswXSwgZm9udFNpemUpXG4gICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjM5KTtcbiAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoY2FwdGlvblsxXSwgZm9udFNpemUpXG4gICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjQzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoY2FwdGlvbiwgZm9udFNpemUpXG4gICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjQyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v77y577yl77yzXG4gICAgICAgIHBoaW5hLmV4dGVuc2lvbi5CdXR0b24od2lkdGgsIGhlaWdodCwgYnV0dG9uWzBdLCB7ZmxhdDogYXBwTWFpbi5idXR0b25GbGF0fSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJwdXNoZWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hbnN3ZXIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwcE1haW4ucG9wU2NlbmUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIC8v77yu77yvXG4gICAgICAgIHBoaW5hLmV4dGVuc2lvbi5CdXR0b24od2lkdGgsIGhlaWdodCwgYnV0dG9uWzFdLCB7ZmxhdDogYXBwTWFpbi5idXR0b25GbGF0fSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41OClcbiAgICAgICAgICAgIC5hZGRFdmVudExpc3RlbmVyKFwicHVzaGVkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYW5zd2VyID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYXBwTWFpbi5wb3BTY2VuZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcbn0pO1xuXG52YXIgREVGQUxUX0FMRVJUUEFSQU0gPSB7XG4gICAgaGVpZ2h0OiBTQ19IKjAuMzUsXG4gICAgdGV4dDE6IFwidGV4dFwiLFxuICAgIHRleHQyOiBudWxsLFxuICAgIHRleHQzOiBudWxsLFxuICAgIGZvbnRTaXplOiAzMixcbiAgICBidXR0b246IFwiT0tcIixcbn1cblxucGhpbmEuZGVmaW5lKFwic2hvdGd1bi5BbGVydERpYWxvZ1wiLCB7XG4gICAgc3VwZXJDbGFzczogcGhpbmEuYXBwLkRpc3BsYXlTY2VuZSxcblxuICAgIC8v44Op44OZ44Or55So44OV44Kp44Oz44OI44OR44Op44Oh44O844K/XG4gICAgbGFiZWxQYXJhbToge2ZvbnRGYW1pbHk6XCJZYXNhc2hpc2FcIiwgYWxpZ246IFwiY2VudGVyXCIsIGJhc2VsaW5lOlwibWlkZGxlXCIsIG91dGxpbmVXaWR0aDoyIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihwYXJhbSkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICBwYXJhbSA9IHt9LiRleHRlbmQoREVGQUxUX0FMRVJUUEFSQU0sIHBhcmFtKTtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICBwaGluYS5kaXNwbGF5LlJvdW5kUmVjdGFuZ2xlU2hhcGUoe3dpZHRoOiBTQ19XLTIwLCBoZWlnaHQ6IHBhcmFtLmhlaWdodCwgZmlsbFN0eWxlOiBhcHBNYWluLmJnQ29sb3IsIGxpbmVXaWR0aDogNH0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSk7XG5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICB2YXIgd2lkdGggPSBTQ19XLTI4LCBoZWlnaHQgPSA5MDtcblxuICAgICAgICAvL+OCreODo+ODl+OCt+ODp+ODs1xuICAgICAgICB2YXIgcG9zID0gU0NfSCowLjQ3O1xuICAgICAgICBpZiAocGFyYW0udGV4dDIpIHBvcyAtPSBTQ19IKjAuMDU7XG4gICAgICAgIGlmIChwYXJhbS50ZXh0MykgcG9zIC09IFNDX0gqMC4wNTtcblxuICAgICAgICB2YXIgbGIgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHBhcmFtLnRleHQxLCBwYXJhbS5mb250U2l6ZSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgbGIuc2V0UGFyYW0odGhpcy5sYWJlbFBhcmFtKTtcbiAgICAgICAgbGIuc2V0UG9zaXRpb24oU0NfVyowLjUsIHBvcyk7XG5cbiAgICAgICAgaWYgKHBhcmFtLnRleHQyKSB7XG4gICAgICAgICAgICBwb3MgKz0gU0NfSCowLjA1O1xuICAgICAgICAgICAgdmFyIGxiID0gcGhpbmEuZGlzcGxheS5MYWJlbChwYXJhbS50ZXh0MiwgcGFyYW0uZm9udFNpemUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICBsYi5zZXRQYXJhbSh0aGlzLmxhYmVsUGFyYW0pO1xuICAgICAgICAgICAgbGIuc2V0UG9zaXRpb24oU0NfVyowLjUsIHBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmFtLnRleHQzKSB7XG4gICAgICAgICAgICBwb3MgKz0gU0NfSCowLjA1O1xuICAgICAgICAgICAgdmFyIGxiID0gcGhpbmEuZGlzcGxheS5MYWJlbChwYXJhbS50ZXh0MywgcGFyYW0uZm9udFNpemUpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICBsYi5zZXRQYXJhbSh0aGlzLmxhYmVsUGFyYW0pO1xuICAgICAgICAgICAgbGIuc2V0UG9zaXRpb24oU0NfVyowLjUsIHBvcyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODnOOCv+ODs1xuICAgICAgICBwaGluYS5leHRlbnNpb24uQnV0dG9uKHdpZHRoLCBoZWlnaHQsIHBhcmFtLmJ1dHRvbiwge2ZsYXQ6IGFwcE1haW4uYnV0dG9uRmxhdH0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNTUpXG4gICAgICAgICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcInB1c2hlZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFuc3dlciA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGFwcE1haW4ucG9wU2NlbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgQnVsbGV0LmpzXG4gKiAgMjAxNC8wNy8xNlxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiQnVsbGV0XCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnRcIixcbiAgICBsYXllcjogTEFZRVJfQlVMTEVULFxuXG4gICAgLy/lsITlh7rjgZfjgZ/mlbXjga5JRFxuICAgIGlkOiAtMSxcblxuICAgIC8vQnVsbGV0TUwgUnVubm5lclxuICAgIHJ1bm5lcjogbnVsbCxcblxuICAgIC8v56e75YuV5L+C5pWwXG4gICAgdng6IDAsXG4gICAgdnk6IDEsXG5cbiAgICAvL+WKoOmAn+W6plxuICAgIGFjY2VsOiAxLjAsXG5cbiAgICAvL+Wbnui7olxuICAgIHJvbGxBbmdsZTogNSxcbiAgICByb2xsaW5nOiB0cnVlLFxuXG4gICAgLy/ntYzpgY7mmYLplpNcbiAgICB0aW1lOiAwLFxuXG4gICAgREVGQVVMVF9QQVJBTToge1xuICAgICAgICBpZDogLTEsXG4gICAgICAgIHR5cGU6IFwiUlNcIixcbiAgICAgICAgeDogU0NfVyowLjUsXG4gICAgICAgIHk6IFNDX0gqMC41LFxuICAgICAgICB2eDogMCxcbiAgICAgICAgdnk6IDEsXG4gICAgfSxcblxuICAgIF9zdGF0aWM6IHtcbiAgICAgICAgZ2xvYmFsU3BlZWRSYXRlOiAxLjAsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuXG4gICAgICAgIHRoaXMuYm91bmRpbmdUeXBlID0gXCJjaXJjbGVcIjtcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAyO1xuXG4gICAgICAgIC8vVHdlZW5lcuOCkkZQU+ODmeODvOOCueOBq+OBmeOCi1xuICAgICAgICB0aGlzLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgLy/lvL7nlLvlg49cbiAgICAgICAgdGhpcy5zcHJpdGUgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcImJ1bGxldFwiLCAyNCwgMjQpLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgICAgdGhpcy5vbihcImVudGVyZnJhbWVcIiwgZnVuY3Rpb24oYXBwKXtcbiAgICAgICAgICAgIGlmICh0aGlzLnJvbGxpbmcpIHRoaXMucm90YXRpb24gKz0gdGhpcy5yb2xsQW5nbGU7XG4gICAgICAgICAgICB2YXIgcnVubmVyID0gdGhpcy5ydW5uZXI7XG4gICAgICAgICAgICBpZiAocnVubmVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ4ID0gdGhpcy54O1xuICAgICAgICAgICAgICAgIHZhciBieSA9IHRoaXMueTtcbiAgICAgICAgICAgICAgICBydW5uZXIueCA9IGJ4O1xuICAgICAgICAgICAgICAgIHJ1bm5lci55ID0gYnk7XG4gICAgICAgICAgICAgICAgcnVubmVyLnVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIHZhciBhY2MgPSBCdWxsZXQuZ2xvYmFsU3BlZWRSYXRlICogdGhpcy53YWl0O1xuICAgICAgICAgICAgICAgIHRoaXMudnggPSAocnVubmVyLnggLSBieCk7XG4gICAgICAgICAgICAgICAgdGhpcy52eSA9IChydW5uZXIueSAtIGJ5KTtcbiAgICAgICAgICAgICAgICB0aGlzLnggKz0gdGhpcy52eCAqIGFjYztcbiAgICAgICAgICAgICAgICB0aGlzLnkgKz0gdGhpcy52eSAqIGFjYztcblxuICAgICAgICAgICAgICAgIC8v55S76Z2i56+E5Zuy5aSWXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMueCA8IC0xNiB8fCB0aGlzLnggPiBTQ19XKzE2IHx8IHRoaXMueSA8IC0xNiB8fCB0aGlzLnkgPiBTQ19IKzE2KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL+iHquapn+OBqOOBruW9k+OCiuWIpOWumuODgeOCp+ODg+OCr1xuICAgICAgICAgICAgICAgIGlmICghdGhpcy5kdW1teSAmJiB0aGlzLnRpbWUgJSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXIgPSB0aGlzLmJ1bGxldExheWVyLnBhcmVudFNjZW5lLnBsYXllcjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5pc0NvbGxpc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNIaXRFbGVtZW50KHBsYXllcikgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllci5kYW1hZ2UoKSkgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/jg6rjg6Djg7zjg5bmmYJcbiAgICAgICAgdGhpcy5vbihcInJlbW92ZWRcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMuYnVsbGV0TGF5ZXIucG9vbC5wdXNoKHRoaXMpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24ocnVubmVyLCBzcGVjKSB7XG4gICAgICAgIHRoaXMuaWQgPSAwO1xuICAgICAgICB0aGlzLnggPSBydW5uZXIueDtcbiAgICAgICAgdGhpcy55ID0gcnVubmVyLnk7XG4gICAgICAgIHRoaXMucnVubmVyID0gcnVubmVyO1xuXG4gICAgICAgIHRoaXMuc3ByaXRlLnNldE9yaWdpbigwLjUsIDAuNSk7XG5cbiAgICAgICAgaWYgKHNwZWMuZHVtbXkpIHtcbiAgICAgICAgICAgIHRoaXMuZHVtbXkgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5zcHJpdGUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/lvL7nqK7liKXjgrDjg6njg5XjgqPjg4Pjgq9cbiAgICAgICAgICAgIHZhciBzaXplID0gc3BlYy5zaXplIHx8IDEuMCwgaW5kZXggPSAwO1xuICAgICAgICAgICAgc3dpdGNoIChzcGVjLnR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFwibm9ybWFsXCI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucm9sbGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNwZWMuY29sb3IgPT0gXCJibHVlXCIpIGluZGV4ID0gMTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcInJvbGxcIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb2xsaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaW5kZXggPSA4O1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3BlYy5jb2xvciA9PSBcImJsdWVcIikgaW5kZXggPSAyNDtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcIlRISU5cIjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb2xsaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGluZGV4ID0gMztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMucnVubmVyLmRpcmVjdGlvbip0b0RlZy05MDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUuc2V0T3JpZ2luKDAuNSwgMC4wKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5zZXRGcmFtZUluZGV4KGluZGV4KS5zZXRTY2FsZShzaXplKTtcbiAgICAgICAgICAgIHRoaXMuZHVtbXkgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnZpc2libGUgPSB0cnVlO1xuXG4gICAgICAgICAgICAvL+W8vuOBq+eZuuWwhOaZguOCpuOCp+OCpOODiOOBjOaOm+OCi+ODleODrOODvOODoOaVsFxuICAgICAgICAgICAgdmFyIHBhdXNlRnJhbWUgPSA0NTtcbiAgICAgICAgICAgIHRoaXMud2FpdCA9IDAuMztcbiAgICAgICAgICAgIHRoaXMuc2V0U2NhbGUoMC4xKTtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6IDEuMCwgc2NhbGVZOjEuMCwgd2FpdDogMS4wfSwgcGF1c2VGcmFtZSwgXCJlYXNlSW5PdXRTaW5lXCIpO1xuXG4gICAgICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBlcmFzZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5kdW1teSkge1xuICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5idWxsZXRMYXllci5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyO1xuICAgICAgICAgICAgbGF5ZXIuZW50ZXJCdWxsZXRWYW5pc2goe1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogdGhpcy54LCB5OiB0aGlzLnl9LFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdGhpcy52eCwgeTogdGhpcy52eSwgZGVjYXk6IDAuOTl9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG5cbiIsIi8qXG4gKiAgYnVsbGV0Y29uZmlnLmpzXG4gKiAgMjAxNS8xMS8xOVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEubmFtZXNwYWNlKGZ1bmN0aW9uKCkge1xuXG4gICAgcGhpbmEuZGVmaW5lKFwiQnVsbGV0Q29uZmlnXCIsIHtcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oKSB7fSxcbiAgICAgICAgX3N0YXRpYzoge1xuICAgICAgICAgICAgc3BlZWRSYXRlOiAzLFxuICAgICAgICAgICAgdGFyZ2V0OiBudWxsLFxuICAgICAgICAgICAgYnVsbGV0TGF5ZXI6IG51bGwsXG5cbiAgICAgICAgICAgIHNldHVwOiBmdW5jdGlvbih0YXJnZXQsIGJ1bGxldExheWVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5idWxsZXRMYXllciA9IGJ1bGxldExheWVyO1xuXG4gICAgICAgICAgICAgICAgLy/pm6PmmJPluqYoaW50KSgwOmVhc3kgMTpub3JtYWwgMjpoYXJkIDM6ZGVhdGgpXG4gICAgICAgICAgICAgICAgdGhpcy5wdXQoXCJkaWZmaWN1bHR5XCIsIDEpO1xuXG4gICAgICAgICAgICAgICAgLy/jgrLjg7zjg6Dpm6PmmJPluqbjg6njg7Pjgq8oaW50KVxuICAgICAgICAgICAgICAgIHRoaXMucHV0KFwicmFua1wiLCAxKTtcblxuICAgICAgICAgICAgICAgIC8v5by+6YCfKGZsb2F0KVxuICAgICAgICAgICAgICAgIHRoaXMucHV0KFwic3BlZWRCYXNlXCIsIDEuMDApO1xuICAgICAgICAgICAgICAgIHRoaXMucHV0KFwic3BlZWRSYW5rXCIsIDAuMDApO1xuXG4gICAgICAgICAgICAgICAgLy/lvL7lr4bluqYoZmxvYXQgMC4wMC0xLjAwKVxuICAgICAgICAgICAgICAgIHRoaXMucHV0KFwiZGVuc2l0eVJhbmtcIiwgMC4wMCk7XG5cbiAgICAgICAgICAgICAgICAvL+W8vuaVsOWil+WKoOaVsChpbnQpXG4gICAgICAgICAgICAgICAgdGhpcy5wdXQoXCJidXJzdFwiLCAwKTtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNyZWF0ZU5ld0J1bGxldDogZnVuY3Rpb24ocnVubmVyLCBzcGVjKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNwZWMub3B0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnVsbGV0TGF5ZXIuZW50ZXJCdWxsZXQocnVubmVyLCBzcGVjLm9wdGlvbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWxsZXRMYXllci5lbnRlckJ1bGxldChydW5uZXIsIHNwZWMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHB1dDogZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgICAgICBidWxsZXRtbC5XYWxrZXIuZ2xvYmFsU2NvcGVbXCIkXCIgKyBuYW1lXSA9IHZhbHVlO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcbiIsIi8qXG4gKiAgYnVsbGV0bGF5ZXIuanNcbiAqICAyMDE1LzExLzEyXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJCdWxsZXRMYXllclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIG1heDogMjU2LFxuICAgICAgICBwb29sIDogbnVsbCxcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5wb29sID0gQXJyYXkucmFuZ2UoMCwgdGhpcy5tYXgpLm1hcChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBiID0gQnVsbGV0KCk7XG4gICAgICAgICAgICBiLmJ1bGxldExheWVyID0gc2VsZjtcbiAgICAgICAgICAgIGIucGFyZW50U2NlbmUgPSBhcHAuY3VycmVudFNjZW5lO1xuICAgICAgICAgICAgcmV0dXJuIGI7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvL+W8vuaKleWFpVxuICAgIGVudGVyQnVsbGV0OiBmdW5jdGlvbihydW5uZXIsIHNwZWMpIHtcbiAgICAgICAgLy/jg5zjgrnku6XlpJbjga7lnLDkuIrnianjga7loLTlkIjjgIHjg5fjg6zjgqTjg6Tjg7zjgavov5HmjqXjgZfjgabjgZ/jgonlvL7jgpLmkoPjgZ/jgarjgYRcbiAgICAgICAgdmFyIGhvc3QgPSBydW5uZXIuaG9zdDtcbiAgICAgICAgaWYgKCFob3N0KSByZXR1cm47XG4gICAgICAgIGlmIChob3N0LmlzR3JvdW5kICYmICFob3N0LmlzQm9zcykge1xuICAgICAgICAgICAgdmFyIGRpcyA9IGRpc3RhbmNlU3EocnVubmVyLCB0aGlzLnBhcmVudFNjZW5lLnBsYXllcik7XG4gICAgICAgICAgICBpZiAoZGlzIDwgNDA5NikgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBiID0gdGhpcy5wb29sLnNoaWZ0KCk7XG4gICAgICAgIGlmICghYikge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiQnVsbGV0IGVtcHR5ISFcIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBiLnNldHVwKHJ1bm5lciwgc3BlYykuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgfSxcblxuICAgIC8v5bCE5Ye6SUTjgavlkIjoh7TjgZnjgovlvL7jgpLmtojljrvvvIjmnKrmjIflrprmmYLlhajmtojljrvvvIlcbiAgICBlcmFzZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgdmFyIGFsbCA9IChpZCA9PT0gdW5kZWZpbmVkPyB0cnVlOiBmYWxzZSk7XG4gICAgICAgIHZhciBsaXN0ID0gdGhpcy5jaGlsZHJlbi5zbGljZSgpO1xuICAgICAgICB2YXIgbGVuID0gbGlzdC5sZW5ndGg7XG4gICAgICAgIHZhciBiO1xuICAgICAgICBpZiAoYWxsKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgYiA9IGxpc3RbaV07XG4gICAgICAgICAgICAgICAgaWYgKGIgaW5zdGFuY2VvZiBCdWxsZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgYi5lcmFzZSgpO1xuICAgICAgICAgICAgICAgICAgICBiLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBiID0gbGlzdFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoYiBpbnN0YW5jZW9mIEJ1bGxldCAmJiBpZCA9PSBiLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGIuZXJhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgYi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iLCIvKlxuICogIGRhbm1ha3UuanNcbiAqICAyMDE1LzEwLzExXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5jb25zdCBkYW5tYWt1ID0ge307XG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxudmFyIGFjdGlvbiA9IGJ1bGxldG1sLmRzbC5hY3Rpb247XG52YXIgYWN0aW9uUmVmID0gYnVsbGV0bWwuZHNsLmFjdGlvblJlZjtcbnZhciBidWxsZXQgPSBidWxsZXRtbC5kc2wuYnVsbGV0O1xudmFyIGJ1bGxldFJlZiA9IGJ1bGxldG1sLmRzbC5idWxsZXRSZWY7XG52YXIgZmlyZSA9IGJ1bGxldG1sLmRzbC5maXJlO1xudmFyIGZpcmVSZWYgPSBidWxsZXRtbC5kc2wuZmlyZVJlZjtcbnZhciBjaGFuZ2VEaXJlY3Rpb24gPSBidWxsZXRtbC5kc2wuY2hhbmdlRGlyZWN0aW9uO1xudmFyIGNoYW5nZVNwZWVkID0gYnVsbGV0bWwuZHNsLmNoYW5nZVNwZWVkO1xudmFyIGFjY2VsID0gYnVsbGV0bWwuZHNsLmFjY2VsO1xudmFyIHdhaXQgPSBidWxsZXRtbC5kc2wud2FpdDtcbnZhciB2YW5pc2ggPSBidWxsZXRtbC5kc2wudmFuaXNoO1xudmFyIHJlcGVhdCA9IGJ1bGxldG1sLmRzbC5yZXBlYXQ7XG52YXIgYmluZFZhciA9IGJ1bGxldG1sLmRzbC5iaW5kVmFyO1xudmFyIG5vdGlmeSA9IGJ1bGxldG1sLmRzbC5ub3RpZnk7XG52YXIgZGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmRpcmVjdGlvbjtcbnZhciBzcGVlZCA9IGJ1bGxldG1sLmRzbC5zcGVlZDtcbnZhciBob3Jpem9udGFsID0gYnVsbGV0bWwuZHNsLmhvcml6b250YWw7XG52YXIgdmVydGljYWwgPSBidWxsZXRtbC5kc2wudmVydGljYWw7XG52YXIgZmlyZU9wdGlvbiA9IGJ1bGxldG1sLmRzbC5maXJlT3B0aW9uO1xudmFyIG9mZnNldFggPSBidWxsZXRtbC5kc2wub2Zmc2V0WDtcbnZhciBvZmZzZXRZID0gYnVsbGV0bWwuZHNsLm9mZnNldFk7XG52YXIgYXV0b25vbXkgPSBidWxsZXRtbC5kc2wuYXV0b25vbXk7XG5cbnZhciBpbnRlcnZhbCA9IGJ1bGxldG1sLmRzbC5pbnRlcnZhbDtcbnZhciBzcGQgPSBidWxsZXRtbC5kc2wuc3BkO1xudmFyIHNwZFNlcSA9IGJ1bGxldG1sLmRzbC5zcGRTZXE7XG5cbi8v5by+56iuXG52YXIgUlMgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC42fSk7XG52YXIgUk0gID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMC44fSk7XG52YXIgUkwgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMS4wfSk7XG52YXIgUkVTID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuNn0pO1xudmFyIFJFTSA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAxLjB9KTtcblxudmFyIEJTICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAwLjZ9KTtcbnZhciBCTSAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC44fSk7XG52YXIgQkwgID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDEuMH0pO1xudmFyIEJFUyA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC42fSk7XG52YXIgQkVNID0gYnVsbGV0KHt0eXBlOiBcInJvbGxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAxLjB9KTtcblxudmFyIFRISU4gPSBidWxsZXQoeyB0eXBlOiBcIlRISU5cIiB9KTtcblxudmFyIERNICA9IGJ1bGxldCh7IGR1bW15OiB0cnVlIH0pO1xuXG4vL+aUu+aSg+ODmOODquOAjOODm+ODvOODjeODg+ODiOOAjVxuZGFubWFrdS5Ib3JuZXQxID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC44KSwgZGlyZWN0aW9uKDApKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDEwKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/mlLvmkoPjg5jjg6rjgIzjg5vjg7zjg43jg4Pjg4jjgI1cbmRhbm1ha3UuSG9ybmV0MiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuOCksIGRpcmVjdGlvbigwKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5pS75pKD44OY44Oq44CM44Ob44O844ON44OD44OI44CNXG5kYW5tYWt1Lkhvcm5ldDMgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIG5vdGlmeSgnbWlzc2lsZScpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMjQwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/kuK3lnovmlLvmkoPjg5jjg6ogTXVkRGF1YmVyXG5kYW5tYWt1Lk11ZERhdWJlciA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjYpLCBkaXJlY3Rpb24oMCksIG9mZnNldFkoMzApKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDNcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WSgzMCkpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDEwKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG4gICAgdG9wMTogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC41KSwgZGlyZWN0aW9uKDE4MCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCgtMzIpKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDNcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDIwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDIwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKC00MCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTUpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxNjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AyOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMTQwLCBcImFic29sdXRlXCIpLCBvZmZzZXRYKDMyKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAzXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbiggMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgzMikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDIwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDMyKSksXG4gICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oMjAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMzIpKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigtNDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDE1KSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTYwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/kuK3lnovniIbmkoPmqZ/jgIzjg5Pjg4PjgrDjgqbjgqPjg7PjgrDjgI1cbmRhbm1ha3UuQmlnV2luZyA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgcmVwZWF0KDQsIFtcbiAgICAgICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuNSksICBkaXJlY3Rpb24oMjAwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oICAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMiksIG9mZnNldFkoMTYpKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDIwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMiksIG9mZnNldFkoMTYpKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDIwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMiksIG9mZnNldFkoMTYpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuNSksICBkaXJlY3Rpb24oMTYwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oICAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDMyKSwgb2Zmc2V0WSgxNikpLFxuICAgICAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbigtMjAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKC0yMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgzMiksIG9mZnNldFkoMTYpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIHJlcGVhdCgzLCBbXG4gICAgICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCAgZGlyZWN0aW9uKDIwMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoQlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDE4MCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCggMTYpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoQlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDE4MCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCgtMTYpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMjApLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v6aOb56m66ImH44CM44K544Kr44Kk44OW44Os44O844OJ44CNXG5kYW5tYWt1LlNreUJsYWRlID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC43KSwgZGlyZWN0aW9uKDApLCBvZmZzZXRZKC0zMikpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFkoLTMyKSksXG4gICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTAsIFwic2VxdWVuY2VcIiksIG9mZnNldFkoLTMyKSksXG4gICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTAsIFwic2VxdWVuY2VcIiksIG9mZnNldFkoLTMyKSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMDUpLCBkaXJlY3Rpb24oLTIwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoOTApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG5cbi8v5Lit5Z6L5oim6LuK44CM44OV44Op44Ks44Op44OD44OP44CNXG5kYW5tYWt1LkZyYWdhcmFjaCA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3A6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBmaXJlKFJTLCBzcGQoMC41KSwgZGlyZWN0aW9uKDApKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdFwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDAuMTUpLCBkaXJlY3Rpb24oLTUsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwLjE1KSwgZGlyZWN0aW9uKDEwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/mta7pgYrnoLLlj7DjgIzjg5bjg6rjg6Xjg4rjg7zjgq/jgI3vvIjoqK3nva7vvJHvvIlcbmRhbm1ha3UuQnJpb25hYzFfMSA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDIpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAyXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKFJNLCBzcGRTZXEoMC4xNSksIGRpcmVjdGlvbiggMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDEsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKC0yLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgyKSxcbiAgICAgICAgICAgICAgICBmaXJlKFJNLCBzcGRTZXEoMC4xNSksIGRpcmVjdGlvbiggMywgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDUsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKC03LCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgyKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/mta7pgYrnoLLlj7DjgIzjg5bjg6rjg6Xjg4rjg7zjgq/jgI3vvIjoqK3nva7vvJLvvIlcbmRhbm1ha3UuQnJpb25hYzFfMiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDEpLCBkaXJlY3Rpb24oMCkpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMlwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oNSwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oNSwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMDUpLCBkaXJlY3Rpb24oLTEwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/mta7pgYrnoLLlj7DjgIzjg5bjg6rjg6Xjg4rjg7zjgq/jgI3vvIjoqK3nva7vvJPvvIlcbmRhbm1ha3UuQnJpb25hYzFfMyA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AxOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuOCksIGRpcmVjdGlvbigwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoQk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCgzMCwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxMiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsKDEpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AyOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuOCksIGRpcmVjdGlvbig5MCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoMzAsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShCTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTIsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCgxKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG4gICAgdG9wMzogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjgpLCBkaXJlY3Rpb24oMTgwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoQk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCgzMCwgW1xuICAgICAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxMiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsKDEpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AzOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuOCksIGRpcmVjdGlvbigyNzAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShCTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDMwLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoQk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDEyLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwoMSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbi8v5Lit5Z6L6Ly46YCB5qmf44CM44OI44Kk44Oc44OD44Kv44K544CNXG5kYW5tYWt1LlRveUJveCA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3A6IGFjdGlvbihbXG4gICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDEpLCBkaXJlY3Rpb24oMCkpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShUSElOLCBzcGQoMSksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICAgICAgZmlyZShUSElOLCBzcGQoMSksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICAgICAgZmlyZShUSElOLCBzcGQoMSksIGRpcmVjdGlvbigwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cbn0pO1xuXG4iLCIvKlxuICogIGRhbm1ha3VCYXNpYy5qc1xuICogIDIwMTYvMDQvMTFcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxudmFyIGFjdGlvbiA9IGJ1bGxldG1sLmRzbC5hY3Rpb247XG52YXIgYWN0aW9uUmVmID0gYnVsbGV0bWwuZHNsLmFjdGlvblJlZjtcbnZhciBidWxsZXQgPSBidWxsZXRtbC5kc2wuYnVsbGV0O1xudmFyIGJ1bGxldFJlZiA9IGJ1bGxldG1sLmRzbC5idWxsZXRSZWY7XG52YXIgZmlyZSA9IGJ1bGxldG1sLmRzbC5maXJlO1xudmFyIGZpcmVSZWYgPSBidWxsZXRtbC5kc2wuZmlyZVJlZjtcbnZhciBjaGFuZ2VEaXJlY3Rpb24gPSBidWxsZXRtbC5kc2wuY2hhbmdlRGlyZWN0aW9uO1xudmFyIGNoYW5nZVNwZWVkID0gYnVsbGV0bWwuZHNsLmNoYW5nZVNwZWVkO1xudmFyIGFjY2VsID0gYnVsbGV0bWwuZHNsLmFjY2VsO1xudmFyIHdhaXQgPSBidWxsZXRtbC5kc2wud2FpdDtcbnZhciB2YW5pc2ggPSBidWxsZXRtbC5kc2wudmFuaXNoO1xudmFyIHJlcGVhdCA9IGJ1bGxldG1sLmRzbC5yZXBlYXQ7XG52YXIgYmluZFZhciA9IGJ1bGxldG1sLmRzbC5iaW5kVmFyO1xudmFyIG5vdGlmeSA9IGJ1bGxldG1sLmRzbC5ub3RpZnk7XG52YXIgZGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmRpcmVjdGlvbjtcbnZhciBzcGVlZCA9IGJ1bGxldG1sLmRzbC5zcGVlZDtcbnZhciBob3Jpem9udGFsID0gYnVsbGV0bWwuZHNsLmhvcml6b250YWw7XG52YXIgdmVydGljYWwgPSBidWxsZXRtbC5kc2wudmVydGljYWw7XG52YXIgZmlyZU9wdGlvbiA9IGJ1bGxldG1sLmRzbC5maXJlT3B0aW9uO1xudmFyIG9mZnNldFggPSBidWxsZXRtbC5kc2wub2Zmc2V0WDtcbnZhciBvZmZzZXRZID0gYnVsbGV0bWwuZHNsLm9mZnNldFk7XG52YXIgYXV0b25vbXkgPSBidWxsZXRtbC5kc2wuYXV0b25vbXk7XG5cbnZhciBpbnRlcnZhbCA9IGJ1bGxldG1sLmRzbC5pbnRlcnZhbDtcbnZhciBzcGQgPSBidWxsZXRtbC5kc2wuc3BkO1xudmFyIHNwZFNlcSA9IGJ1bGxldG1sLmRzbC5zcGRTZXE7XG5cbi8v77+9Ze+/ve+/vVxudmFyIFJTICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuNn0pO1xudmFyIFJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuOH0pO1xudmFyIFJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xudmFyIFJFUyA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbnZhciBSRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBCUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC42fSk7XG52YXIgQk0gID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuOH0pO1xudmFyIEJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAxLjB9KTtcbnZhciBCRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xudmFyIEJFTSA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBUSElOID0gYnVsbGV0KHsgdHlwZTogXCJUSElOXCIgfSk7XG5cbnZhciBETSAgPSBidWxsZXQoeyBkdW1teTogdHJ1ZSB9KTtcblxuLy/vv73vv73vv71A77+9X++/ve+/ve+/vWVcbnZhciBiYXNpYyA9IGZ1bmN0aW9uKHMsIGRpcikge1xuICByZXR1cm4gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDogYWN0aW9uKFtcbiAgICAgIGludGVydmFsKDYwKSxcbiAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICBmaXJlKERNLCBzcGQocyksIGRpcmVjdGlvbihkaXIpKSxcbiAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgZmlyZShSUywgc3BkU2VxKDAuMTUpLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgIF0pLFxuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICBdKSxcbiAgICBdKSxcbiAgfSk7XG59O1xuZGFubWFrdS5iYXNpYyA9IGJhc2ljKDEsIDApO1xuZGFubWFrdS5iYXNpY1IxID0gYmFzaWMoMSwgLTUpO1xuZGFubWFrdS5iYXNpY0wxID0gYmFzaWMoMSwgKzUpO1xuZGFubWFrdS5iYXNpY1IyID0gYmFzaWMoMSwgLTE1KTtcbmRhbm1ha3UuYmFzaWNMMiA9IGJhc2ljKDEsICsxNSk7XG5kYW5tYWt1LmJhc2ljRiA9IGJhc2ljKDEuMiwgMCk7XG5kYW5tYWt1LmJhc2ljRlIxID0gYmFzaWMoMS4yLCAtNSk7XG5kYW5tYWt1LmJhc2ljRkwxID0gYmFzaWMoMS4yLCArNSk7XG5kYW5tYWt1LmJhc2ljRlIyID0gYmFzaWMoMS4yLCAtMTUpO1xuZGFubWFrdS5iYXNpY0ZMMiA9IGJhc2ljKDEuMiwgKzE1KTtcblxuLy9OLVdheSjvv73vv73vv71A77+9X++/ve+/vSlcbnZhciBiYXNpY053YXkgPSBmdW5jdGlvbihuLCBkaXIsIHMpIHtcbiAgICB2YXIgcm4gPSAobi0xKS8yO1xuICAgIHJldHVybiBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgICAgIHRvcDogYWN0aW9uKFtcbiAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZChzKSwgZGlyZWN0aW9uKC1kaXIqcm4pKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAxXCIsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSUywgc3BkU2VxKDApLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdChuLTEsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKGRpciwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMC4wNSksIGRpcmVjdGlvbigtZGlyKm4sIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICBdKSxcbiAgICB9KTtcbn07XG5kYW5tYWt1LmJhc2ljM3dheSA9IGJhc2ljTndheSgzLCAxMCwgMC43KTtcbmRhbm1ha3UuYmFzaWM0d2F5ID0gYmFzaWNOd2F5KDQsIDEwLCAwLjcpO1xuZGFubWFrdS5iYXNpYzV3YXkgPSBiYXNpY053YXkoNSwgMTAsIDAuNyk7XG5kYW5tYWt1LmJhc2ljNndheSA9IGJhc2ljTndheSg2LCAxMCwgMC43KTtcbmRhbm1ha3UuYmFzaWM3d2F5ID0gYmFzaWNOd2F5KDcsIDEwLCAwLjcpO1xuXG4vL++/vcKP77+9ZVxudmFyIGJhc2ljTndheUNpcmNsZSA9IGZ1bmN0aW9uKG4sIHMpIHtcbiAgICB2YXIgZGlyID0gfn4oMzYwL24pO1xuICAgIHZhciBybiA9IChuLTEpLzI7XG4gICAgcmV0dXJuIG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICAgICAgdG9wOiBhY3Rpb24oW1xuICAgICAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkKHMpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUlMsIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICByZXBlYXQobi0xLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlKFJTLCBzcGRTZXEoMCksIGRpcmVjdGlvbihkaXIsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMDUpLCBkaXJlY3Rpb24oLWRpcipuLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgXSksXG4gICAgfSk7XG59O1xuZGFubWFrdS5iYXNpYzh3YXlDaXJjbGUgPSBiYXNpY053YXlDaXJjbGUoOCwgMC43KTtcbmRhbm1ha3UuYmFzaWMxNndheUNpcmNsZSA9IGJhc2ljTndheUNpcmNsZSgxNiwgMC43KTtcblxufSk7XG5cbiIsIi8qXG4gKiAgZGFubWFrdUJvc3NfMS5qc1xuICogIDIwMTUvMTAvMTFcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuLy/jgrfjg6fjg7zjg4jjg4/jg7Pjg4lcbnZhciBhY3Rpb24gPSBidWxsZXRtbC5kc2wuYWN0aW9uO1xudmFyIGFjdGlvblJlZiA9IGJ1bGxldG1sLmRzbC5hY3Rpb25SZWY7XG52YXIgYnVsbGV0ID0gYnVsbGV0bWwuZHNsLmJ1bGxldDtcbnZhciBidWxsZXRSZWYgPSBidWxsZXRtbC5kc2wuYnVsbGV0UmVmO1xudmFyIGZpcmUgPSBidWxsZXRtbC5kc2wuZmlyZTtcbnZhciBmaXJlUmVmID0gYnVsbGV0bWwuZHNsLmZpcmVSZWY7XG52YXIgY2hhbmdlRGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmNoYW5nZURpcmVjdGlvbjtcbnZhciBjaGFuZ2VTcGVlZCA9IGJ1bGxldG1sLmRzbC5jaGFuZ2VTcGVlZDtcbnZhciBhY2NlbCA9IGJ1bGxldG1sLmRzbC5hY2NlbDtcbnZhciB3YWl0ID0gYnVsbGV0bWwuZHNsLndhaXQ7XG52YXIgdmFuaXNoID0gYnVsbGV0bWwuZHNsLnZhbmlzaDtcbnZhciByZXBlYXQgPSBidWxsZXRtbC5kc2wucmVwZWF0O1xudmFyIGJpbmRWYXIgPSBidWxsZXRtbC5kc2wuYmluZFZhcjtcbnZhciBub3RpZnkgPSBidWxsZXRtbC5kc2wubm90aWZ5O1xudmFyIGRpcmVjdGlvbiA9IGJ1bGxldG1sLmRzbC5kaXJlY3Rpb247XG52YXIgc3BlZWQgPSBidWxsZXRtbC5kc2wuc3BlZWQ7XG52YXIgaG9yaXpvbnRhbCA9IGJ1bGxldG1sLmRzbC5ob3Jpem9udGFsO1xudmFyIHZlcnRpY2FsID0gYnVsbGV0bWwuZHNsLnZlcnRpY2FsO1xudmFyIGZpcmVPcHRpb24gPSBidWxsZXRtbC5kc2wuZmlyZU9wdGlvbjtcbnZhciBvZmZzZXRYID0gYnVsbGV0bWwuZHNsLm9mZnNldFg7XG52YXIgb2Zmc2V0WSA9IGJ1bGxldG1sLmRzbC5vZmZzZXRZO1xudmFyIGF1dG9ub215ID0gYnVsbGV0bWwuZHNsLmF1dG9ub215O1xuXG4vL+ODnuOCr+ODrVxudmFyIGludGVydmFsID0gYnVsbGV0bWwuZHNsLmludGVydmFsO1xudmFyIHNwZCA9IGJ1bGxldG1sLmRzbC5zcGQ7XG52YXIgc3BkU2VxID0gYnVsbGV0bWwuZHNsLnNwZFNlcTtcbnZhciBmaXJlQWltMCA9IGJ1bGxldG1sLmRzbC5maXJlQWltMDtcbnZhciBmaXJlQWltMSA9IGJ1bGxldG1sLmRzbC5maXJlQWltMTtcbnZhciBmaXJlQWltMiA9IGJ1bGxldG1sLmRzbC5maXJlQWltMjtcbnZhciBud2F5ID0gYnVsbGV0bWwuZHNsLm53YXk7XG52YXIgbndheVZzID0gYnVsbGV0bWwuZHNsLm53YXlWcztcbnZhciBhYnNvbHV0ZU53YXkgPSBidWxsZXRtbC5kc2wuYWJzb2x1dGVOd2F5O1xudmFyIGFic29sdXRlTndheVZzID0gYnVsbGV0bWwuZHNsLmFic29sdXRlTndheVZzO1xudmFyIGNpcmNsZSA9IGJ1bGxldG1sLmRzbC5jaXJjbGU7XG52YXIgYWJzb2x1dGVDaXJjbGUgPSBidWxsZXRtbC5kc2wuYWJzb2x1dGVDaXJjbGU7XG52YXIgd2hpcCA9IGJ1bGxldG1sLmRzbC53aGlwO1xuXG4vL+W8vueorlxudmFyIFJTICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuNn0pO1xudmFyIFJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuOH0pO1xudmFyIFJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xudmFyIFJFUyA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbnZhciBSRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBCUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC42fSk7XG52YXIgQk0gID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuOH0pO1xudmFyIEJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAxLjB9KTtcbnZhciBCRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xudmFyIEJFTSA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBUSElOID0gYnVsbGV0KHsgdHlwZTogXCJUSElOXCIgfSk7XG5cbnZhciBETSA9IGJ1bGxldCh7IGR1bW15OiB0cnVlIH0pO1xuXG4vL++8kemdouS4reODnOOCuVxuZGFubWFrdS5UaG9ySGFtbWVyID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkKDAuNSksIGRpcmVjdGlvbigyMCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCgtMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDUsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oLTMwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMiksIG9mZnNldFkoMTYpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkKDAuNSksIGRpcmVjdGlvbigzNDAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDUsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMzAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDIwKSxcblxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkKDAuNSksIGRpcmVjdGlvbig0MCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCgtMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDYsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oLTMwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKC0zMiksIG9mZnNldFkoMTYpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkKDAuNSksIGRpcmVjdGlvbigzMjAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDYsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMzAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMzIpLCBvZmZzZXRZKDE2KSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLkuK3jg5zjgrnvvIjnoLLlj7DvvIlcbmRhbm1ha3UuVGhvckhhbW1lclR1cnJldCA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDEpLCBkaXJlY3Rpb24oLTE1KSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyAyXCIsIFtcbiAgICAgICAgICAgICAgICBmaXJlKEJFTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoMCkpLFxuICAgICAgICAgICAgICAgIGZpcmUoQkVNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxNSwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgwKSwgb2Zmc2V0WSgwKSksXG4gICAgICAgICAgICAgICAgZmlyZShCRU0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDE1LCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKDApKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMC4wNSksIGRpcmVjdGlvbigtMzAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDEwKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMzApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kemdouODnOOCue+8iOODkeOCv+ODvOODs++8ke+8iVxuZGFubWFrdS5Hb2x5YXQxXzEgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgd2FpdCgzMCksXG4gICAgICAgIHJlcGVhdCg1LCBbXG4gICAgICAgICAgICBub3RpZnkoXCJzdGFydFwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WSgtOCkpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShCRU0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFkoLTgpKSxcbiAgICAgICAgICAgICAgICByZXBlYXQoMzAsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShCRU0sIHNwZFNlcSgwLjAxKSwgZGlyZWN0aW9uKDEyLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRZKC04KSksXG4gICAgICAgICAgICAgICAgICAgIGludGVydmFsKDEpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjA1KSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFkoLTgpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgICAgIG5vdGlmeShcImVuZFwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgICAgICBub3RpZnkoXCJmaW5pc2hcIiksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLjg5zjgrnvvIjjg5Hjgr/jg7zjg7PvvJLvvIlcbmRhbm1ha3UuR29seWF0MV8yID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIG5vdGlmeShcInN0YXJ0XCIpLFxuICAgICAgICB3YWl0KDMwKSxcbiAgICAgICAgcmVwZWF0KDUsIFtcbiAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjQpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICByZXBlYXQoXCIkYnVyc3QgKyA1XCIsIFtcbiAgICAgICAgICAgICAgICByZXBlYXQoMTAsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShCRU0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDM4LCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICBmaXJlKERNLCBzcGRTZXEoMC4wNSksIGRpcmVjdGlvbigwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTUwKSxcbiAgICAgICAgXSksXG4gICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgbm90aWZ5KFwiZW5kXCIpLFxuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIG5vdGlmeShcImZpbmlzaFwiKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kemdouODnOOCue+8iOODkeOCv+ODvOODs++8k++8iVxuZGFubWFrdS5Hb2x5YXQxXzMgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgbm90aWZ5KFwic3RhcnRcIiksXG4gICAgICAgIHdhaXQoMzApLFxuXG4gICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgbm90aWZ5KFwiZW5kXCIpLFxuICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgIG5vdGlmeShcImZpbmlzaFwiKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kemdouODnOOCue+8iOeZuueLguODkeOCv+ODvOODs++8iVxuZGFubWFrdS5Hb2x5YXQyID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIG5vdGlmeShcInN0YXJ0XCIpLFxuICAgICAgICB3YWl0KDYwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICByZXBlYXQoMywgW1xuICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkKDAuNiksIGRpcmVjdGlvbigwKSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KDMsIFtcbiAgICAgICAgICAgICAgICAgICAgZmlyZShUSElOLCBzcGRTZXEoMC4xKSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkU2VxKDAuMSksIGRpcmVjdGlvbigtMjAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCg0LCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoVEhJTiwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG5cbiAgICB0b3AxOiBhY3Rpb24oW1xuICAgICAgICB3YWl0KDYwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgICAgICByZXBlYXQoNSwgW1xuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgNVwiLCBbXG4gICAgICAgICAgICAgICAgICAgIHJlcGVhdCgxMCwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyZShSRU0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDM2LCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjA1KSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLjg5zjgrnvvIjjgqLjg7zjg6DnoLLlj7Djg5Hjgr/jg7zjg7PvvJHvvIlcbmRhbm1ha3UuR29seWF0QXJtMSA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AxOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIG5vdGlmeShcInN0YXJ0MVwiKSxcbiAgICAgICAgICAgIHdhaXQoMzApLFxuICAgICAgICAgICAgZmlyZShETSwgc3BkKDEuMCksIGRpcmVjdGlvbigtMTApLCBvZmZzZXRYKDApLCBvZmZzZXRZKC00MCkpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgM1wiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoLTQwKSksXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoLTQwKSksXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oMTAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoLTQwKSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMSksIGRpcmVjdGlvbigtMjAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDEwKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgbm90aWZ5KFwiZW5kMVwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuICAgIHRvcDI6IGFjdGlvbihbXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgbm90aWZ5KFwic3RhcnQyXCIpLFxuICAgICAgICAgICAgd2FpdCgzMCksXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC44KSwgZGlyZWN0aW9uKC01KSwgb2Zmc2V0WCgwKSwgb2Zmc2V0WSgyMCkpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgM1wiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShCTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoMjApKSxcbiAgICAgICAgICAgICAgICBmaXJlKEJNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigxMCwgXCJzZXF1ZW5jZVwiKSwgb2Zmc2V0WCgwKSwgb2Zmc2V0WSgyMCkpLFxuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZFNlcSgwLjEpLCBkaXJlY3Rpb24oLTEwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIG5vdGlmeShcImVuZDJcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kemdouODnOOCue+8iOOCouODvOODoOegsuWPsOODkeOCv+ODvOODs++8ku+8iVxuZGFubWFrdS5Hb2x5YXRBcm0yID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDE6IGFjdGlvbihbXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgbm90aWZ5KFwic3RhcnQyXCIpLFxuICAgICAgICAgICAgd2FpdCgzMCksXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMS4wKSwgZGlyZWN0aW9uKDE4MCwgXCJhYnNvbHV0ZVwiKSwgb2Zmc2V0WCgwKSwgb2Zmc2V0WSgyMCkpLFxuICAgICAgICAgICAgcmVwZWF0KDEwLCBbXG4gICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDApLCBkaXJlY3Rpb24oIDAsIFwic2VxdWVuY2VcIiksIG9mZnNldFgoMCksIG9mZnNldFkoMjApKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxNSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIG5vdGlmeShcImVuZDJcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AyOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIG5vdGlmeShcInN0YXJ0MlwiKSxcbiAgICAgICAgICAgIHdhaXQoMzApLFxuICAgICAgICAgICAgZmlyZShETSwgc3BkKDEuMCksIGRpcmVjdGlvbigxODAsIFwiYWJzb2x1dGVcIiksIG9mZnNldFgoMCksIG9mZnNldFkoMjApKSxcbiAgICAgICAgICAgIHJlcGVhdCgxMCwgW1xuICAgICAgICAgICAgICAgIGZpcmUoQk0sIHNwZFNlcSgwKSwgZGlyZWN0aW9uKCAwLCBcInNlcXVlbmNlXCIpLCBvZmZzZXRYKDApLCBvZmZzZXRZKDIwKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTUpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBub3RpZnkoXCJlbmQyXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxuLy/vvJHpnaLjg5zjgrnvvIjjgqLjg7zjg6DnoLLlj7Djg5Hjgr/jg7zjg7PvvJPvvIlcbmRhbm1ha3UuR29seWF0QXJtMyA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AxOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIG5vdGlmeShcInN0YXJ0MVwiKSxcbiAgICAgICAgICAgIHdhaXQoMzApLFxuICAgICAgICAgICAgbm90aWZ5KFwibWlzc2lsZTFcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCg2MCksXG4gICAgICAgICAgICBub3RpZnkoXCJtaXNzaWxlMVwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIG5vdGlmeShcIm1pc3NpbGUxXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMzApLFxuICAgICAgICAgICAgbm90aWZ5KFwiZW5kMVwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDE4MCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuICAgIHRvcDI6IGFjdGlvbihbXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgbm90aWZ5KFwic3RhcnQyXCIpLFxuICAgICAgICAgICAgd2FpdCgzMCksXG4gICAgICAgICAgICBub3RpZnkoXCJtaXNzaWxlMlwiKSxcbiAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgICAgIG5vdGlmeShcIm1pc3NpbGUyXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoNjApLFxuICAgICAgICAgICAgbm90aWZ5KFwibWlzc2lsZTJcIiksXG4gICAgICAgICAgICBpbnRlcnZhbCgzMCksXG4gICAgICAgICAgICBub3RpZnkoXCJlbmQyXCIpLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTgwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxufSk7XG5cbiIsIi8qXG4gKiAgZGFubWFrdUJvc3NfMi5qc1xuICogIDIwMTUvMTAvMTFcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLm5hbWVzcGFjZShmdW5jdGlvbigpIHtcblxuLy/jgrfjg6fjg7zjg4jjg4/jg7Pjg4lcbnZhciBhY3Rpb24gPSBidWxsZXRtbC5kc2wuYWN0aW9uO1xudmFyIGFjdGlvblJlZiA9IGJ1bGxldG1sLmRzbC5hY3Rpb25SZWY7XG52YXIgYnVsbGV0ID0gYnVsbGV0bWwuZHNsLmJ1bGxldDtcbnZhciBidWxsZXRSZWYgPSBidWxsZXRtbC5kc2wuYnVsbGV0UmVmO1xudmFyIGZpcmUgPSBidWxsZXRtbC5kc2wuZmlyZTtcbnZhciBmaXJlUmVmID0gYnVsbGV0bWwuZHNsLmZpcmVSZWY7XG52YXIgY2hhbmdlRGlyZWN0aW9uID0gYnVsbGV0bWwuZHNsLmNoYW5nZURpcmVjdGlvbjtcbnZhciBjaGFuZ2VTcGVlZCA9IGJ1bGxldG1sLmRzbC5jaGFuZ2VTcGVlZDtcbnZhciBhY2NlbCA9IGJ1bGxldG1sLmRzbC5hY2NlbDtcbnZhciB3YWl0ID0gYnVsbGV0bWwuZHNsLndhaXQ7XG52YXIgdmFuaXNoID0gYnVsbGV0bWwuZHNsLnZhbmlzaDtcbnZhciByZXBlYXQgPSBidWxsZXRtbC5kc2wucmVwZWF0O1xudmFyIGJpbmRWYXIgPSBidWxsZXRtbC5kc2wuYmluZFZhcjtcbnZhciBub3RpZnkgPSBidWxsZXRtbC5kc2wubm90aWZ5O1xudmFyIGRpcmVjdGlvbiA9IGJ1bGxldG1sLmRzbC5kaXJlY3Rpb247XG52YXIgc3BlZWQgPSBidWxsZXRtbC5kc2wuc3BlZWQ7XG52YXIgaG9yaXpvbnRhbCA9IGJ1bGxldG1sLmRzbC5ob3Jpem9udGFsO1xudmFyIHZlcnRpY2FsID0gYnVsbGV0bWwuZHNsLnZlcnRpY2FsO1xudmFyIGZpcmVPcHRpb24gPSBidWxsZXRtbC5kc2wuZmlyZU9wdGlvbjtcbnZhciBvZmZzZXRYID0gYnVsbGV0bWwuZHNsLm9mZnNldFg7XG52YXIgb2Zmc2V0WSA9IGJ1bGxldG1sLmRzbC5vZmZzZXRZO1xudmFyIGF1dG9ub215ID0gYnVsbGV0bWwuZHNsLmF1dG9ub215O1xuXG4vL+ODnuOCr+ODrVxudmFyIGludGVydmFsID0gYnVsbGV0bWwuZHNsLmludGVydmFsO1xudmFyIHNwZCA9IGJ1bGxldG1sLmRzbC5zcGQ7XG52YXIgc3BkU2VxID0gYnVsbGV0bWwuZHNsLnNwZFNlcTtcbnZhciBmaXJlQWltMCA9IGJ1bGxldG1sLmRzbC5maXJlQWltMDtcbnZhciBmaXJlQWltMSA9IGJ1bGxldG1sLmRzbC5maXJlQWltMTtcbnZhciBmaXJlQWltMiA9IGJ1bGxldG1sLmRzbC5maXJlQWltMjtcbnZhciBud2F5ID0gYnVsbGV0bWwuZHNsLm53YXk7XG52YXIgbndheVZzID0gYnVsbGV0bWwuZHNsLm53YXlWcztcbnZhciBhYnNvbHV0ZU53YXkgPSBidWxsZXRtbC5kc2wuYWJzb2x1dGVOd2F5O1xudmFyIGFic29sdXRlTndheVZzID0gYnVsbGV0bWwuZHNsLmFic29sdXRlTndheVZzO1xudmFyIGNpcmNsZSA9IGJ1bGxldG1sLmRzbC5jaXJjbGU7XG52YXIgYWJzb2x1dGVDaXJjbGUgPSBidWxsZXRtbC5kc2wuYWJzb2x1dGVDaXJjbGU7XG52YXIgd2hpcCA9IGJ1bGxldG1sLmRzbC53aGlwO1xuXG4vL+W8vueorlxudmFyIFJTICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuNn0pO1xudmFyIFJNICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDAuOH0pO1xudmFyIFJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwicmVkXCIsIHNpemU6IDEuMH0pO1xudmFyIFJFUyA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcInJlZFwiLCBzaXplOiAwLjZ9KTtcbnZhciBSRU0gPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJyZWRcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBCUyAgPSBidWxsZXQoe3R5cGU6IFwibm9ybWFsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMC42fSk7XG52YXIgQk0gID0gYnVsbGV0KHt0eXBlOiBcIm5vcm1hbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuOH0pO1xudmFyIEJMICA9IGJ1bGxldCh7dHlwZTogXCJub3JtYWxcIiwgY29sb3I6IFwiYmx1ZVwiLCBzaXplOiAxLjB9KTtcbnZhciBCRVMgPSBidWxsZXQoe3R5cGU6IFwicm9sbFwiLCBjb2xvcjogXCJibHVlXCIsIHNpemU6IDAuNn0pO1xudmFyIEJFTSA9IGJ1bGxldCh7dHlwZTogXCJyb2xsXCIsIGNvbG9yOiBcImJsdWVcIiwgc2l6ZTogMS4wfSk7XG5cbnZhciBUSElOICAgPSBidWxsZXQoe3R5cGU6IFwiVEhJTlwiLCBzaXplOiAxLjB9KTtcbnZhciBUSElOX0wgPSBidWxsZXQoe3R5cGU6IFwiVEhJTlwiLCBzaXplOiAxLjV9KTtcblxudmFyIERNID0gYnVsbGV0KHtkdW1teTogdHJ1ZX0pO1xuXG4vL++8kumdouS4reODnOOCuVxuZGFubWFrdS5SYXZlbiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICB3YWl0KDEyMCksXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuOCkpLFxuICAgICAgICAgICAgcmVwZWF0KDMsIFtcbiAgICAgICAgICAgICAgICBud2F5KDMsIC0xNSwgMTUsIFRISU4sIHNwZCgwLjA4KSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoNSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDE2NSksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuICAgIHRvcDE6IGFjdGlvbihbXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgMVwiLCBbXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkKDAuNSksIGRpcmVjdGlvbigtMjAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCg2LCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oLTMwLCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICAgICAgcmVwZWF0KDUsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZFNlcSgwLjA4KSwgZGlyZWN0aW9uKDAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICBdKSxcbiAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbiAgICB0b3AyOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIHJlcGVhdChcIiRidXJzdCArIDFcIiwgW1xuICAgICAgICAgICAgICAgIGZpcmUoRE0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMjAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgICAgIHJlcGVhdCg2LCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUk0sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMzAsIFwic2VxdWVuY2VcIikpLFxuICAgICAgICAgICAgICAgICAgICByZXBlYXQoNSwgW1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyZShSTSwgc3BkU2VxKDAuMDgpLCBkaXJlY3Rpb24oMCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgICAgICAgICBpbnRlcnZhbCgxMCksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxufSk7XG5cblxuLy/vvJLpnaLjg5zjgrnjgIDjg5Hjgr/jg7zjg7PvvJFcbmRhbm1ha3UuR2FydWRhXzEgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgaW50ZXJ2YWwoOTApLFxuICAgICAgICByZXBlYXQoNCwgW1xuICAgICAgICAgICAgcmVwZWF0KFwiJHJhbmsvMTArM1wiLCBbXG4gICAgICAgICAgICAgICAgbndheSg1LCAtMjAsIDIwLCBSTCwgc3BkKDAuOCksIG9mZnNldFgoMCksIG9mZnNldFkoMCksIGF1dG9ub215KHRydWUpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgyKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTgwKSxcbiAgICAgICAgXSksXG4gICAgICAgIG5vdGlmeShcImZpbmlzaFwiKSxcbiAgICBdKSxcbiAgICB0b3AxOiBhY3Rpb24oW1xuICAgICAgICB3YWl0KDEyMCksXG4gICAgICAgIHJlcGVhdCg0LCBbXG4gICAgICAgICAgICByZXBlYXQoXCIkcmFuay8xMFwiLCBbXG4gICAgICAgICAgICAgICAgbndheSg1LCAtMjAsIDIwLCBCRU0sIHNwZCgwLjgpLCBvZmZzZXRYKC0xNDgpLCBvZmZzZXRZKDApLCBhdXRvbm9teSh0cnVlKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoNiksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDE4MCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuICAgIHRvcDI6IGFjdGlvbihbXG4gICAgICAgIHdhaXQoMTIwKSxcbiAgICAgICAgcmVwZWF0KDQsIFtcbiAgICAgICAgICAgIHJlcGVhdChcIiRyYW5rLzEwXCIsIFtcbiAgICAgICAgICAgICAgICBud2F5KDUsIC0yMCwgMjAsIEJFTSwgc3BkKDAuOCksIG9mZnNldFgoMTQ4KSwgb2Zmc2V0WSgwKSwgYXV0b25vbXkodHJ1ZSkpLFxuICAgICAgICAgICAgICAgIGludGVydmFsKDYpLFxuICAgICAgICAgICAgXSksXG4gICAgICAgICAgICBpbnRlcnZhbCgxODApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kumdouODnOOCueOAgOODkeOCv+ODvOODs++8klxuZGFubWFrdS5HYXJ1ZGFfMiA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICB3YWl0KDkwKSxcbiAgICAgICAgcmVwZWF0KDEwLCBbXG4gICAgICAgICAgICBub3RpZnkoJ2JvbWInKSxcbiAgICAgICAgICAgIGludGVydmFsKDYwKSxcbiAgICAgICAgXSksXG4gICAgICAgIG5vdGlmeShcImZpbmlzaFwiKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kumdouODnOOCueOAgOODkeOCv+ODvOODs++8k1xuZGFubWFrdS5HYXJ1ZGFfMyA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBpbnRlcnZhbCg5MCksXG4gICAgICAgIG5vdGlmeShcImZpbmlzaFwiKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kumdouODnOOCueOAgOODkeOCv+ODvOODs++8lO+8iOeZuueLgu+8iVxuZGFubWFrdS5HYXJ1ZGFfNCA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICByZXBlYXQoSW5maW5pdHksIFtcbiAgICAgICAgICAgIGZpcmUoYnVsbGV0KERNLCBhY3Rpb25SZWYoXCJpbnYxXCIpKSwgc3BkKDMpLCBkaXJlY3Rpb24oXCIkbG9vcC5pbmRleCAqIDVcIiwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICByZXBlYXQoMTYsIFtcbiAgICAgICAgICAgICAgICBmaXJlKGJ1bGxldChETSwgYWN0aW9uUmVmKFwiaW52MVwiKSksIHNwZFNlcSgwKSwgZGlyZWN0aW9uKDM2MCAvIDE2LCBcInNlcXVlbmNlXCIpKSxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbCgxKSxcbiAgICAgICAgICAgIF0pLFxuICAgICAgICAgICAgaW50ZXJ2YWwoMTApLFxuICAgICAgICAgICAgZmlyZShidWxsZXQoRE0sIGFjdGlvblJlZihcImludjJcIikpLCBzcGQoMyksIGRpcmVjdGlvbihcIiRsb29wLmluZGV4ICogLTVcIiwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICByZXBlYXQoMTYsIFtcbiAgICAgICAgICAgICAgICBmaXJlKGJ1bGxldChETSwgYWN0aW9uUmVmKFwiaW52MlwiKSksIHNwZFNlcSgwKSwgZGlyZWN0aW9uKC0zNjAgLyAxNiwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgaW50ZXJ2YWwoMSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDEyMCksXG4gICAgICAgIF0pLFxuICAgIF0pLFxuICAgIGludjE6IGFjdGlvbihbXG4gICAgICAgIHdhaXQoMSksXG4gICAgICAgIGZpcmUoUkwsIHNwZCgxLjIpLCBkaXJlY3Rpb24oOTAsIFwicmVsYXRpdmVcIikpLFxuICAgICAgICB2YW5pc2goKSxcbiAgICBdKSxcbiAgICBpbnYyOiBhY3Rpb24oW1xuICAgICAgICB3YWl0KDEpLFxuICAgICAgICBmaXJlKFJMLCBzcGQoMS4yKSwgZGlyZWN0aW9uKC05MCwgXCJyZWxhdGl2ZVwiKSksXG4gICAgICAgIHZhbmlzaCgpLFxuICAgIF0pLFxufSk7XG5cbi8v77yS6Z2i44Oc44K556Cy5Y+wXG5kYW5tYWt1LkdhcnVkYV9oYXRjaF8xID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIG5vdGlmeShcInN0YXJ0XCIpLFxuICAgICAgICB3YWl0KDEyMCksXG4gICAgICAgIHJlcGVhdCg1LCBbXG4gICAgICAgICAgICBmaXJlKERNLCBzcGQoMC40KSwgZGlyZWN0aW9uKDAsIFwiYWJzb2x1dGVcIikpLFxuICAgICAgICAgICAgcmVwZWF0KFwiJGJ1cnN0ICsgNVwiLCBbXG4gICAgICAgICAgICAgICAgcmVwZWF0KDEwLCBbXG4gICAgICAgICAgICAgICAgICAgIGZpcmUoUkVNLCBzcGRTZXEoMCksIGRpcmVjdGlvbigzOCwgXCJzZXF1ZW5jZVwiKSksXG4gICAgICAgICAgICAgICAgXSksXG4gICAgICAgICAgICAgICAgZmlyZShETSwgc3BkU2VxKDAuMDUpLCBkaXJlY3Rpb24oMCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICBdKSxcbiAgICAgICAgICAgIGludGVydmFsKDE1MCksXG4gICAgICAgIF0pLFxuICAgICAgICBub3RpZnkoXCJlbmRcIiksXG4gICAgXSksXG59KTtcbmRhbm1ha3UuR2FydWRhX2hhdGNoXzIgPSBuZXcgYnVsbGV0bWwuUm9vdCh7XG4gICAgdG9wMDogYWN0aW9uKFtcbiAgICAgICAgbm90aWZ5KFwic3RhcnRcIiksXG4gICAgICAgIHdhaXQoMTIwKSxcbiAgICAgICAgbm90aWZ5KFwiZW5kXCIpLFxuICAgIF0pLFxufSk7XG5kYW5tYWt1LkdhcnVkYV9oYXRjaF8zID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIG5vdGlmeShcInN0YXJ0XCIpLFxuICAgICAgICB3YWl0KDEyMCksXG4gICAgICAgIG5vdGlmeShcImVuZFwiKSxcbiAgICBdKSxcbn0pO1xuZGFubWFrdS5HYXJ1ZGFfaGF0Y2hfNCA9IG5ldyBidWxsZXRtbC5Sb290KHtcbiAgICB0b3AwOiBhY3Rpb24oW1xuICAgICAgICBub3RpZnkoXCJzdGFydFwiKSxcbiAgICAgICAgaW50ZXJ2YWwoMTIwKSxcbiAgICAgICAgcmVwZWF0KEluZmluaXR5LCBbXG4gICAgICAgICAgICBpbnRlcnZhbCgxMjApLFxuICAgICAgICBdKSxcbiAgICBdKSxcbn0pO1xuXG4vL++8kumdouODnOOCueOCquODl+OCt+ODp+ODs+atpuWZqFxuZGFubWFrdS5HYXJ1ZGFCb21iID0gbmV3IGJ1bGxldG1sLlJvb3Qoe1xuICAgIHRvcDA6IGFjdGlvbihbXG4gICAgICAgIHJlcGVhdChJbmZpbml0eSwgW1xuICAgICAgICAgICAgZmlyZShUSElOLCBzcGQoMC41KSwgZGlyZWN0aW9uKCA5MCwgXCJhYnNvbHV0ZVwiKSksXG4gICAgICAgICAgICBmaXJlKFRISU4sIHNwZCgwLjUpLCBkaXJlY3Rpb24oMjcwLCBcImFic29sdXRlXCIpKSxcbiAgICAgICAgICAgIGludGVydmFsKDMwKSxcbiAgICAgICAgXSksXG4gICAgXSksXG59KTtcblxufSk7XG5cbiIsIi8qXG4gKiAgRWZmZWN0LmpzXG4gKiAgMjAxNC8wNy8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cbkVmZmVjdCA9IFtdO1xuXG4vL+axjueUqOOCqOODleOCp+OCr+ODiFxucGhpbmEuZGVmaW5lKFwiRWZmZWN0LkVmZmVjdEJhc2VcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5TcHJpdGVcIixcblxuICAgIF9tZW1iZXI6IHtcbiAgICAgICAgLy/jgqTjg7Pjg4fjg4Pjgq/jgrnmm7TmlrDplpPpmpRcbiAgICAgICAgaW50ZXJ2YWw6IDIsXG5cbiAgICAgICAgLy/plovlp4vjgqTjg7Pjg4fjg4Pjgq/jgrlcbiAgICAgICAgc3RhcnRJbmRleDogMCxcblxuICAgICAgICAvL+acgOWkp+OCpOODs+ODh+ODg+OCr+OCuVxuICAgICAgICBtYXhJbmRleDogOCxcblxuICAgICAgICAvL+ePvuWcqOOCpOODs+ODh+ODg+OCr+OCuVxuICAgICAgICBpbmRleDogMCxcblxuICAgICAgICAvL+mBheW7tuihqOekuuODleODrOODvOODoOaVsFxuICAgICAgICBkZWxheTogMCxcblxuICAgICAgICAvL+ODq+ODvOODl+ODleODqeOCsFxuICAgICAgICBsb29wOiBmYWxzZSxcblxuICAgICAgICAvL+OCt+ODvOODs+OBi+OCieWJiumZpOODleODqeOCsFxuICAgICAgICBpc1JlbW92ZTogZmFsc2UsXG5cbiAgICAgICAgLy/liqDpgJ/luqZcbiAgICAgICAgdmVsb2NpdHk6IHt9LFxuXG4gICAgICAgIC8v5Zyw5LiK44Ko44OV44Kn44Kv44OI44OV44Op44KwXG4gICAgICAgIGlmR3JvdW5kOiBmYWxzZSxcblxuICAgICAgICB0aW1lOiAwLFxuICAgIH0sXG5cbiAgICBkZWZhdWx0T3B0aW9uOiB7XG4gICAgICAgIG5hbWU6IFwibm9uYW1lXCIsXG4gICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgd2lkdGg6IDY0LFxuICAgICAgICBoZWlnaHQ6IDY0LFxuICAgICAgICBpbnRlcnZhbDogMixcbiAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgbWF4SW5kZXg6IDE3LFxuICAgICAgICBzZXF1ZW5jZTogbnVsbCxcbiAgICAgICAgZGVsYXk6IDAsXG4gICAgICAgIGxvb3A6IGZhbHNlLFxuICAgICAgICBlbnRlcmZyYW1lOiBudWxsLFxuICAgICAgICBpc0dyb3VuZDogZmFsc2UsXG4gICAgICAgIHRyaW1taW5nOiBudWxsLFxuICAgICAgICBwb3NpdGlvbjoge3g6IFNDX1cqMC41LCB5OiBTQ19IKjAuNX0sXG4gICAgICAgIHZlbG9jaXR5OiB7eDogMCwgeTogMCwgZGVjYXk6IDB9LFxuICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgYWxwaGE6IDEuMCxcbiAgICAgICAgc2NhbGU6IHt4OiAxLjAsIHk6IDEuMH0sXG4gICAgICAgIGJsZW5kTW9kZTogXCJzb3VyY2Utb3ZlclwiLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoXCJlZmZlY3RcIik7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuXG4gICAgICAgIHRoaXMudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcblxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0ge1xuICAgICAgICAgICAgeDogMCwgICAgICAgLy/vvLjluqfmqJnmlrnlkJFcbiAgICAgICAgICAgIHk6IDAsICAgICAgIC8v77y55bqn5qiZ5pa55ZCRXG4gICAgICAgICAgICBkZWNheTogMS4wICAvL+a4m+ihsOeOh1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMub24oXCJlbnRlcmZyYW1lXCIsIHRoaXMuZGVmYXVsdEVudGVyZnJhbWUpO1xuXG4gICAgICAgIC8v44Oq44Og44O844OW5pmCXG4gICAgICAgIHRoaXMub24oXCJyZW1vdmVkXCIsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICB0aGlzLmVmZmVjdExheWVyLnBvb2wucHVzaCh0aGlzKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICBpZiAodGhpcy5hc3NldE5hbWUgIT0gb3B0aW9uLmFzc2V0TmFtZSkge1xuICAgICAgICAgICAgdGhpcy5pbWFnZSA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ2ltYWdlJywgb3B0aW9uLmFzc2V0TmFtZSk7XG4gICAgICAgICAgICB0aGlzLmFzc2V0TmFtZSA9IG9wdGlvbi5hc3NldE5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy53aWR0aCA9IG9wdGlvbi53aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBvcHRpb24uaGVpZ2h0O1xuXG4gICAgICAgIC8v5Yid5pyf5YCk44K744OD44OIXG4gICAgICAgIHRoaXMubmFtZSA9IG9wdGlvbi5uYW1lO1xuICAgICAgICB0aGlzLmludGVydmFsID0gb3B0aW9uLmludGVydmFsO1xuICAgICAgICB0aGlzLnN0YXJ0SW5kZXggPSBvcHRpb24uc3RhcnRJbmRleDtcbiAgICAgICAgdGhpcy5tYXhJbmRleCA9IG9wdGlvbi5tYXhJbmRleDtcbiAgICAgICAgdGhpcy5zZXF1ZW5jZSA9IG9wdGlvbi5zZXF1ZW5jZTtcbiAgICAgICAgdGhpcy5zZXFJbmRleCA9IDA7XG4gICAgICAgIHRoaXMuZGVsYXkgPSBvcHRpb24uZGVsYXk7XG4gICAgICAgIGlmICh0aGlzLmRlbGF5IDwgMCkgdGhpcy5kZWxheSAqPSAtMTtcbiAgICAgICAgdGhpcy5sb29wID0gb3B0aW9uLmxvb3A7XG4gICAgICAgIHRoaXMudGltZSA9IC10aGlzLmRlbGF5O1xuXG4gICAgICAgIC8vzrHjg5bjg6zjg7Pjg4noqK3lrppcbiAgICAgICAgdGhpcy5hbHBoYSA9IG9wdGlvbi5hbHBoYTtcbiAgICAgICAgdGhpcy5ibGVuZE1vZGUgPSBvcHRpb24uYmxlbmRNb2RlO1xuXG4gICAgICAgIC8v44OI44Oq44Of44Oz44Kw6Kit5a6aXG4gICAgICAgIHZhciB0ciA9IG9wdGlvbi50cmltbWluZyB8fCB7eDowLCB5OiAwLCB3aWR0aDogdGhpcy5pbWFnZS53aWR0aCwgaGVpZ2h0OiB0aGlzLmltYWdlLmhlaWdodH07XG4gICAgICAgIHRoaXMuc2V0RnJhbWVUcmltbWluZyh0ci54LCB0ci55LCB0ci53aWR0aCwgdHIuaGVpZ2h0KTtcblxuICAgICAgICB0aGlzLmluZGV4ID0gdGhpcy5zdGFydEluZGV4O1xuICAgICAgICBpZiAodGhpcy5zZXF1ZW5jZSkgdGhpcy5pbmRleCA9IHRoaXMuc2VxdWVuY2VbMF07XG4gICAgICAgIHRoaXMuc2V0RnJhbWVJbmRleCh0aGlzLmluZGV4KTtcblxuICAgICAgICB0aGlzLnNldFBvc2l0aW9uKG9wdGlvbi5wb3NpdGlvbi54LCBvcHRpb24ucG9zaXRpb24ueSk7XG4gICAgICAgIHRoaXMuc2V0VmVsb2NpdHkob3B0aW9uLnZlbG9jaXR5LngsIG9wdGlvbi52ZWxvY2l0eS55LCBvcHRpb24udmVsb2NpdHkuZGVjYXkpO1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gb3B0aW9uLnJvdGF0aW9uO1xuICAgICAgICB0aGlzLnNjYWxlWCA9IG9wdGlvbi5zY2FsZS54O1xuICAgICAgICB0aGlzLnNjYWxlWSA9IG9wdGlvbi5zY2FsZS55O1xuXG4gICAgICAgIHRoaXMuaXNSZW1vdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgLy9Ud2VlbmVy44Oq44K744OD44OIXG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICBkZWZhdWx0RW50ZXJmcmFtZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPCAwKSB7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPT0gMCkgdGhpcy52aXNpYmxlID0gdHJ1ZTtcblxuICAgICAgICAvL+WcsOS4iueJqeePvuW6p+aomeiqv+aVtFxuICAgICAgICBpZiAodGhpcy5pc0dyb3VuZCkge1xuICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgdGhpcy54ICs9IGdyb3VuZC5kZWx0YVg7XG4gICAgICAgICAgICB0aGlzLnkgKz0gZ3JvdW5kLmRlbHRhWTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSB0aGlzLmludGVydmFsID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVJbmRleCh0aGlzLmluZGV4KTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNlcXVlbmNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMuc2VxdWVuY2VbdGhpcy5zZXFJbmRleF07XG4gICAgICAgICAgICAgICAgdGhpcy5zZXFJbmRleCsrO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlcUluZGV4ID09IHRoaXMuc2VxdWVuY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2VxSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1JlbW92ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pbmRleCA+IHRoaXMubWF4SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMubG9vcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMuc3RhcnRJbmRleDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNSZW1vdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8v55S76Z2i56+E5Zuy5aSWXG4gICAgICAgIGlmICh0aGlzLnggPCAtMzIgfHwgdGhpcy54ID4gU0NfVyszMiB8fCB0aGlzLnkgPCAtMzIgfHwgdGhpcy55ID4gU0NfSCszMikge1xuICAgICAgICAgICAgdGhpcy5pc1JlbW92ZSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZFZlbG9jaXR5KCk7XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICBpZiAodGhpcy5pc1JlbW92ZSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZHJlbigpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+ePvuWcqOOBruW6p+aomeOBq+WKoOmAn+W6puOCkuWKoOeul1xuICAgIGFkZFZlbG9jaXR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ICs9IHRoaXMudmVsb2NpdHkueDtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMudmVsb2NpdHkueTtcbiAgICAgICAgdGhpcy52ZWxvY2l0eS54ICo9IHRoaXMudmVsb2NpdHkuZGVjYXk7XG4gICAgICAgIHRoaXMudmVsb2NpdHkueSAqPSB0aGlzLnZlbG9jaXR5LmRlY2F5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/liqDpgJ/luqbjga7oqK3lrppcbiAgICBzZXRWZWxvY2l0eTogZnVuY3Rpb24oeCwgeSwgZGVjYXkpIHtcbiAgICAgICAgZGVjYXkgPSBkZWNheSB8fCAxO1xuICAgICAgICB0aGlzLnZlbG9jaXR5LnggPSB4O1xuICAgICAgICB0aGlzLnZlbG9jaXR5LnkgPSB5O1xuICAgICAgICB0aGlzLnZlbG9jaXR5LmRlY2F5ID0gZGVjYXk7XG4gICAgICAgIHJldHVybiB0aGlzOyAgICAgICAgXG4gICAgfSxcblxuICAgIC8v44Or44O844OX6Kit5a6aXG4gICAgc2V0TG9vcDogZnVuY3Rpb24oYikge1xuICAgICAgICB0aGlzLmxvb3AgPSBiO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG59KTtcbiIsIi8qXG4gKiAgYnVsbGV0bGF5ZXIuanNcbiAqICAyMDE1LzExLzEyXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJFZmZlY3RQb29sXCIsIHtcbiAgICBpbml0OiBmdW5jdGlvbihzaXplLCBwYXJlbnRTY2VuZSkge1xuICAgICAgICB0aGlzLnBvb2wgPSBudWxsO1xuICAgICAgICB0aGlzLm1heCA9IHNpemUgfHwgMjU2O1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5wb29sID0gQXJyYXkucmFuZ2UoMCwgdGhpcy5tYXgpLm1hcChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBlID0gRWZmZWN0LkVmZmVjdEJhc2UoKTtcbiAgICAgICAgICAgIGUuZWZmZWN0TGF5ZXIgPSBzZWxmO1xuICAgICAgICAgICAgZS5wYXJlbnRTY2VuZSA9IHBhcmVudFNjZW5lO1xuICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICAvL+WPluW+l1xuICAgIHNoaWZ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnBvb2wuc2hpZnQoKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v5oi744GXXG4gICAgcHVzaDogZnVuY3Rpb24oZSkge1xuICAgICAgICB0aGlzLnBvb2wucHVzaChlKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn0pO1xuXG5waGluYS5kZWZpbmUoXCJFZmZlY3RMYXllclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICAvL+OCqOODleOCp+OCr+ODiOaKleWFpeaZguODh+ODleOCqeODq+ODiOOCquODl+OCt+ODp+ODs1xuICAgIGRlZmF1bHRPcHRpb246IHtcbiAgICAgICAgcG9zaXRpb246IHt4OiBTQ19XKjAuNSwgeTogU0NfSCowLjV9LFxuICAgICAgICB2ZWxvY2l0eToge3g6IDAsIHk6IDAsIGRlY2F5OiAwfSxcbiAgICAgICAgZGVsYXk6IDBcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ocG9vbCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLnBvb2wgPSBwb29sO1xuICAgIH0sXG5cbiAgICAvL+OCqOODleOCp+OCr+ODiOaKleWFpVxuICAgIGVudGVyOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdmFyIGUgPSB0aGlzLnBvb2wuc2hpZnQoKTtcbiAgICAgICAgaWYgKCFlKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJFZmZlY3QgZW1wdHkhIVwiKTtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGUuc2V0dXAob3B0aW9uKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/niIbnmbrvvIjmqJnmupbvvIlcbiAgICBlbnRlckV4cGxvZGU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJleHBsb2RlXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogNjQsXG4gICAgICAgICAgICBoZWlnaHQ6IDY0LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDIsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDE3LFxuICAgICAgICAgICAgcm90YXRpb246IG9wdGlvbi5yb3RhdGlvblxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+eIhueZuu+8iOWwj++8iVxuICAgIGVudGVyRXhwbG9kZVNtYWxsOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiZXhwbG9kZVNtYWxsXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogMTYsXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDQsXG4gICAgICAgICAgICBzdGFydEluZGV4OiA4LFxuICAgICAgICAgICAgbWF4SW5kZXg6IDE1LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAyNTYsIHk6IDI1Niwgd2lkdGg6IDEyOCwgaGVpZ2h0OiAzMn0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v54iG55m677yI5qW15bCP77yJXG4gICAgZW50ZXJFeHBsb2RlU21hbGwyOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiZXhwbG9kZVNtYWxsMlwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDE2LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgIGludGVydmFsOiA0LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiA3LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAyNTYsIHk6IDI1Niwgd2lkdGg6IDEyOCwgaGVpZ2h0OiAzMn0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v54iG55m677yI5aSn77yJXG4gICAgZW50ZXJFeHBsb2RlTGFyZ2U6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJleHBsb2RlTGFyZ2VcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiA0OCxcbiAgICAgICAgICAgIGhlaWdodDogNDgsXG4gICAgICAgICAgICBpbnRlcnZhbDogNCxcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogNyxcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMCwgeTogMTkyLCB3aWR0aDogMTkyLCBoZWlnaHQ6IDk2fSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/niIbnmbrvvIjlnLDkuIrvvIlcbiAgICBlbnRlckV4cGxvZGVHcm91bmQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJleHBsb2RlR3JvdW5kXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogMzIsXG4gICAgICAgICAgICBoZWlnaHQ6IDQ4LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDQsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDcsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDI1NiwgeTogMTkyLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDQ4fSxcbiAgICAgICAgfSkpO1xuICAgICAgICBlLmlzR3JvdW5kID0gdHJ1ZTtcbiAgICAgICAgZS5ncm91bmRYID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQueDtcbiAgICAgICAgZS5ncm91bmRZID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQueTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v56C054mHXG4gICAgZW50ZXJEZWJyaTogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHNpemUgPSBvcHRpb24uc2l6ZSB8fCAwO1xuICAgICAgICBzaXplID0gTWF0aC5jbGFtcChzaXplLCAwLCAzKTtcbiAgICAgICAgaWYgKHNpemUgPT0gMCkge1xuICAgICAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgICAgICBuYW1lOiBcImRlYnJpXCIsXG4gICAgICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgICAgIGhlaWdodDogOCxcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogMixcbiAgICAgICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgICAgIG1heEluZGV4OiA4LFxuICAgICAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMTkyLCB5OiAxMjgsIHdpZHRoOiA2NCwgaGVpZ2h0OiA0OH0sXG4gICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICByZXR1cm4gZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNpemUtLTtcbiAgICAgICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICAgICAgbmFtZTogXCJkZWJyaVwiLFxuICAgICAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgICAgICB3aWR0aDogMTYsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgICAgICBpbnRlcnZhbDogNCxcbiAgICAgICAgICAgICAgICBzdGFydEluZGV4OiBzaXplKjgsXG4gICAgICAgICAgICAgICAgbWF4SW5kZXg6IChzaXplKzEpKjgtMSxcbiAgICAgICAgICAgICAgICB0cmltbWluZzoge3g6IDM4NCwgeTogMTI4LCB3aWR0aDogMTI4LCBoZWlnaHQ6IDQ4fSxcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v5bCP56C054mHXG4gICAgZW50ZXJEZWJyaVNtYWxsOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiZGVicmlcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiA4LFxuICAgICAgICAgICAgaGVpZ2h0OiA4LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDIsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDgsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDE5MiwgeTogMTI4LCB3aWR0aDogNjQsIGhlaWdodDogNDh9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+OCt+ODp+ODg+ODiOedgOW8vlxuICAgIGVudGVyU2hvdEltcGFjdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcInNob3RJbXBhY3RcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiAxNixcbiAgICAgICAgICAgIGhlaWdodDogMTYsXG4gICAgICAgICAgICBpbnRlcnZhbDogMixcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogNyxcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMjU2LCB5OiAyNDAsIHdpZHRoOiAxMjgsIGhlaWdodDogMTZ9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+aVteW8vua2iOWksVxuICAgIGVudGVyQnVsbGV0VmFuaXNoOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiYnVsbGV0VmFuaXNoXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogMTYsXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDQsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDcsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDAsIHk6IDMzNiwgd2lkdGg6IDEyOCwgaGVpZ2h0OiA0OH0sXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGU7XG4gICAgfSxcblxuICAgIC8v44OX44Os44Kk44Ok44O86KKr5by+XG4gICAgZW50ZXJFeHBsb2RlUGxheWVyOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwiZXhwbG9kZVBsYXllclwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDQ4LFxuICAgICAgICAgICAgaGVpZ2h0OiA0OCxcbiAgICAgICAgICAgIGludGVydmFsOiA0LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiA3LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAwLCB5OiAyODgsIHdpZHRoOiAzODQsIGhlaWdodDogNDh9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+OCouODleOCv+ODvOODkOODvOODiuODvFxuICAgIGVudGVyQWZ0ZXJidXJuZXI6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJhZnRlcmJ1cm5lclwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcInBhcnRpY2xlXCIsXG4gICAgICAgICAgICB3aWR0aDogMTYsXG4gICAgICAgICAgICBoZWlnaHQ6IDE2LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDIsXG4gICAgICAgICAgICBzZXF1ZW5jZTogWzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTVdLCBcbiAgICAgICAgfSkpO1xuICAgICAgICBpZiAoZSkgZS50d2VlbmVyLmNsZWFyKCkudG8oe2FscGhhOjB9LCA2MCwgXCJlYXNlSW5PdXRTaW5lXCIpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jgrnjg5Hjg7zjgq9cbiAgICBlbnRlclNwYXJrOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwic3BhcmtcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiAzMixcbiAgICAgICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgICAgICBpbnRlcnZhbDogNCxcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogMixcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMCwgeTogMzg0LCB3aWR0aDogNjQsIGhlaWdodDogMzJ9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+ODnOODoFxuICAgIGVudGVyQm9tYjogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcImJvbWJcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJib21iXCIsXG4gICAgICAgICAgICB3aWR0aDogOTYsXG4gICAgICAgICAgICBoZWlnaHQ6IDk2LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDMsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDE2LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+OCueODouODvOOCryjlsI/vvIlcbiAgICBlbnRlclNtb2tlU21hbGw6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgZSA9IHRoaXMuZW50ZXIob3B0aW9uLiRleHRlbmQoe1xuICAgICAgICAgICAgbmFtZTogXCJzbW9rZVwiLFxuICAgICAgICAgICAgYXNzZXROYW1lOiBcImVmZmVjdFwiLFxuICAgICAgICAgICAgd2lkdGg6IDE2LFxuICAgICAgICAgICAgaGVpZ2h0OiAxNixcbiAgICAgICAgICAgIGludGVydmFsOiA1LFxuICAgICAgICAgICAgc3RhcnRJbmRleDogMCxcbiAgICAgICAgICAgIG1heEluZGV4OiA0LFxuICAgICAgICAgICAgdHJpbW1pbmc6IHt4OiAxMjgsIHk6IDEyOCwgd2lkdGg6IDY0LCBoZWlnaHQ6IDE2fSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jgrnjg6Ljg7zjgq8o5Lit77yJXG4gICAgZW50ZXJTbW9rZTogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKHRoaXMuZGVmYXVsdE9wdGlvbik7XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcInNtb2tlXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwiZWZmZWN0XCIsXG4gICAgICAgICAgICB3aWR0aDogMjQsXG4gICAgICAgICAgICBoZWlnaHQ6IDI0LFxuICAgICAgICAgICAgaW50ZXJ2YWw6IDUsXG4gICAgICAgICAgICBzdGFydEluZGV4OiAwLFxuICAgICAgICAgICAgbWF4SW5kZXg6IDUsXG4gICAgICAgICAgICB0cmltbWluZzoge3g6IDEyOCwgeTogMTYwLCB3aWR0aDogMTIwLCBoZWlnaHQ6IDI0fSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxuXG4gICAgLy/jgrnjg6Ljg7zjgq8o5aSn77yJXG4gICAgZW50ZXJTbW9rZUxhcmdlOiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICAgICAgdmFyIGUgPSB0aGlzLmVudGVyKG9wdGlvbi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG5hbWU6IFwic21va2VcIixcbiAgICAgICAgICAgIGFzc2V0TmFtZTogXCJlZmZlY3RcIixcbiAgICAgICAgICAgIHdpZHRoOiAzMixcbiAgICAgICAgICAgIGhlaWdodDogMzIsXG4gICAgICAgICAgICBpbnRlcnZhbDogNSxcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogOCxcbiAgICAgICAgICAgIHRyaW1taW5nOiB7eDogMjU2LCB5OiAxMjgsIHdpZHRoOiAxMjgsIGhlaWdodDogNjR9LFxuICAgICAgICB9KSk7XG4gICAgICAgIHJldHVybiBlO1xuICAgIH0sXG5cbiAgICAvL+ODkeODvOODhuOCo+OCr+ODq1xuICAgIGVudGVyUGFydGljbGU6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICBvcHRpb24gPSAob3B0aW9uIHx8IHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRPcHRpb24pO1xuICAgICAgICB2YXIgdHJpbSA9IHt4OiAwLCB5OiAwLCB3aWR0aDogMjU2LCBoZWlnaHQ6IDE2fTtcbiAgICAgICAgc3dpdGNoIChvcHRpb24uY29sb3IpIHtcbiAgICAgICAgICAgIGNhc2UgJ3JlZCc6XG4gICAgICAgICAgICAgICAgdHJpbSA9IHt4OiAwLCB5OiAxNiwgd2lkdGg6IDI1NiwgaGVpZ2h0OiAxNn07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdncmVlbic6XG4gICAgICAgICAgICAgICAgdHJpbSA9IHt4OiAwLCB5OiAzMiwgd2lkdGg6IDI1NiwgaGVpZ2h0OiAxNn07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0cmltID0ge3g6IDAsIHk6IDAsIHdpZHRoOiAyNTYsIGhlaWdodDogMTZ9O1xuICAgICAgICB9XG4gICAgICAgIHZhciBlID0gdGhpcy5lbnRlcihvcHRpb24uJGV4dGVuZCh7XG4gICAgICAgICAgICBuYW1lOiBcInBhcnRpY2xlXCIsXG4gICAgICAgICAgICBhc3NldE5hbWU6IFwicGFydGljbGVcIixcbiAgICAgICAgICAgIHdpZHRoOiAxNixcbiAgICAgICAgICAgIGhlaWdodDogMTYsXG4gICAgICAgICAgICBpbnRlcnZhbDogMixcbiAgICAgICAgICAgIHN0YXJ0SW5kZXg6IDAsXG4gICAgICAgICAgICBtYXhJbmRleDogMTYsXG4gICAgICAgICAgICB0cmltbWluZzogdHJpbSxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm4gZTtcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIEVmZmVjdFV0aWxpdHkuanNcbiAqICAyMDE0LzA4LzA4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5FZmZlY3QuZGVmYXVsdE9wdGlvbiA9IHtcbiAgICBwb3NpdGlvbjoge3g6IFNDX1cqMC41LCB5OiBTQ19IKjAuNX0sXG4gICAgdmVsb2NpdHk6IHt4OiAwLCB5OiAwLCBkZWNheTogMH0sXG4gICAgcm90YXRpb246IDAsXG4gICAgZGVsYXk6IDBcbn07XG5cbi8v54iG55m644Ko44OV44Kn44Kv44OI5oqV5YWl77yI5qiZ5rqW77yJXG5FZmZlY3QuZW50ZXJFeHBsb2RlID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbikge1xuICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKEVmZmVjdC5kZWZhdWx0T3B0aW9uKTtcbiAgICBvcHRpb24ucm90YXRpb24gPSByYW5kKDAsIDM1OSk7XG4gICAgbGF5ZXIuZW50ZXJFeHBsb2RlKG9wdGlvbik7XG5cbiAgICB2YXIgdmFsID0gcmFuZCg1LCAxMCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWw7IGkrKykge1xuICAgICAgICB2YXIgcmFkID0gcmFuZCgwLCAzNTkpICogdG9SYWQ7XG4gICAgICAgIHZhciB2ID0gcmFuZCg1LCAxMCk7XG4gICAgICAgIHZhciB2eDIgPSBNYXRoLmNvcyhyYWQpICogdjtcbiAgICAgICAgdmFyIHZ5MiA9IE1hdGguc2luKHJhZCkgKiB2O1xuICAgICAgICB2YXIgcm90ID0gcmFuZCgwLCAzNTkpO1xuICAgICAgICB2YXIgZGVsYXkyID0gb3B0aW9uLmRlbGF5K3JhbmQoMCwgMTApO1xuICAgICAgICB2YXIgc2l6ZSA9IDA7XG4gICAgICAgIGlmIChpID4gdmFsLTIpIHNpemUgPSByYW5kKDEsIDMpO1xuICAgICAgICBsYXllci5lbnRlckRlYnJpKHtcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBwb3NpdGlvbjoge3g6IG9wdGlvbi5wb3NpdGlvbi54LCB5OiBvcHRpb24ucG9zaXRpb24ueX0sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4MiwgeTogdnkyLCBkZWNheTowLjl9LFxuICAgICAgICAgICAgcm90YXRpb246IHJvdCxcbiAgICAgICAgICAgIGRlbGF5OiBkZWxheTJcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL+eIhueZuuOCqOODleOCp+OCr+ODiOaKleWFpe+8iOWwj++8iVxuRWZmZWN0LmVudGVyRXhwbG9kZVNtYWxsID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbikge1xuICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKEVmZmVjdC5kZWZhdWx0T3B0aW9uKTtcbiAgICBvcHRpb24ucm90YXRpb24gPSByYW5kKDAsIDM1OSk7XG4gICAgbGF5ZXIuZW50ZXJFeHBsb2RlKG9wdGlvbik7XG5cbiAgICB2YXIgdmFsID0gcmFuZCgzLCAxMCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWw7IGkrKykge1xuICAgICAgICB2YXIgcmFkID0gcmFuZCgwLCAzNTkpICogdG9SYWQ7XG4gICAgICAgIHZhciB2ID0gcmFuZCg1LCAxMCk7XG4gICAgICAgIHZhciB2eDIgPSBNYXRoLmNvcyhyYWQpICogdjtcbiAgICAgICAgdmFyIHZ5MiA9IE1hdGguc2luKHJhZCkgKiB2O1xuICAgICAgICB2YXIgcm90ID0gcmFuZCgwLCAzNTkpO1xuICAgICAgICB2YXIgZGVsYXkyID0gb3B0aW9uLmRlbGF5K3JhbmQoMCwgMTApO1xuICAgICAgICB2YXIgc2l6ZSA9IDA7XG4gICAgICAgIGlmIChpID4gdmFsLTIpIHNpemUgPSByYW5kKDEsIDMpO1xuICAgICAgICBsYXllci5lbnRlckRlYnJpKHtcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBwb3NpdGlvbjoge3g6IG9wdGlvbi5wb3NpdGlvbi54LCB5OiBvcHRpb24ucG9zaXRpb24ueX0sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4MiwgeTogdnkyLCBkZWNheTowLjl9LFxuICAgICAgICAgICAgcm90YXRpb246IHJvdCxcbiAgICAgICAgICAgIGRlbGF5OiBkZWxheTJcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL+eIhueZuuOCqOODleOCp+OCr+ODiOaKleWFpe+8iOWkp++8iVxuRWZmZWN0LmVudGVyRXhwbG9kZUxhcmdlID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbikge1xuICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKEVmZmVjdC5kZWZhdWx0T3B0aW9uKTtcbiAgICBvcHRpb24ucm90YXRpb24gPSByYW5kKDAsIDM1OSk7XG4gICAgbGF5ZXIuZW50ZXJFeHBsb2RlTGFyZ2Uob3B0aW9uKTtcblxuICAgIHZhciB2YWwgPSByYW5kKDEwLCAyMCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB2YWw7IGkrKykge1xuICAgICAgICB2YXIgcmFkID0gcmFuZCgwLCAzNTkpICogdG9SYWQ7XG4gICAgICAgIHZhciB2ID0gcmFuZCg1LCAxMCk7XG4gICAgICAgIHZhciB2eDIgPSBNYXRoLmNvcyhyYWQpICogdjtcbiAgICAgICAgdmFyIHZ5MiA9IE1hdGguc2luKHJhZCkgKiB2O1xuICAgICAgICB2YXIgcm90ID0gcmFuZCgwLCAzNTkpO1xuICAgICAgICB2YXIgZGVsYXkyID0gb3B0aW9uLmRlbGF5K3JhbmQoMCwgMTApO1xuICAgICAgICB2YXIgc2l6ZSA9IHJhbmQoMCwgMyk7XG4gICAgICAgIGxheWVyLmVudGVyRGVicmkoe1xuICAgICAgICAgICAgc2l6ZTogc2l6ZSxcbiAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogb3B0aW9uLnBvc2l0aW9uLngsIHk6IG9wdGlvbi5wb3NpdGlvbi55fSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngyLCB5OiB2eTIsIGRlY2F5OjAuOX0sXG4gICAgICAgICAgICByb3RhdGlvbjogcm90LFxuICAgICAgICAgICAgZGVsYXk6IGRlbGF5MlxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8v54iG55m644Ko44OV44Kn44Kv44OI5oqV5YWl77yI5Zyw5LiK77yJXG5FZmZlY3QuZW50ZXJFeHBsb2RlR3JvdW5kID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbikge1xuICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKEVmZmVjdC5kZWZhdWx0T3B0aW9uKTtcbiAgICBvcHRpb24ucm90YXRpb24gPSAwO1xuICAgIGxheWVyLmVudGVyRXhwbG9kZUdyb3VuZChvcHRpb24pO1xuXG4gICAgdmFyIHZhbCA9IHJhbmQoNSwgMTApO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsOyBpKyspIHtcbiAgICAgICAgdmFyIHJhZCA9IHJhbmQoMCwgMzU5KSAqIHRvUmFkO1xuICAgICAgICB2YXIgdiA9IHJhbmQoNSwgMTApO1xuICAgICAgICB2YXIgdngyID0gTWF0aC5jb3MocmFkKSAqIHY7XG4gICAgICAgIHZhciB2eTIgPSBNYXRoLnNpbihyYWQpICogdjtcbiAgICAgICAgdmFyIHJvdCA9IHJhbmQoMCwgMzU5KTtcbiAgICAgICAgdmFyIGRlbGF5MiA9IG9wdGlvbi5kZWxheStyYW5kKDAsIDEwKTtcbiAgICAgICAgdmFyIHNpemUgPSByYW5kKDAsIDMpO1xuICAgICAgICBsYXllci5lbnRlckRlYnJpKHtcbiAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICBwb3NpdGlvbjoge3g6IG9wdGlvbi5wb3NpdGlvbi54LCB5OiBvcHRpb24ucG9zaXRpb24ueX0sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4MiwgeTogdnkyLCBkZWNheTowLjl9LFxuICAgICAgICAgICAgcm90YXRpb246IHJvdCxcbiAgICAgICAgICAgIGRlbGF5OiBkZWxheTJcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL+egtOeJh+aKleWFpVxuRWZmZWN0LmVudGVyRGVicmlzID0gZnVuY3Rpb24obGF5ZXIsIG9wdGlvbikge1xuICAgIG9wdGlvbiA9IChvcHRpb24gfHwge30pLiRzYWZlKEVmZmVjdC5kZWZhdWx0T3B0aW9uKTtcbiAgICBudW0gPSBvcHRpb24ubnVtIHx8IDU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW07IGkrKykge1xuICAgICAgICB2YXIgcmFkID0gcmFuZCgwLCAzNTkpICogdG9SYWQ7XG4gICAgICAgIHZhciB2ID0gcmFuZCg1LCAxMCk7XG4gICAgICAgIHZhciB2eDIgPSBNYXRoLmNvcyhyYWQpICogdjtcbiAgICAgICAgdmFyIHZ5MiA9IE1hdGguc2luKHJhZCkgKiB2O1xuICAgICAgICB2YXIgcm90ID0gcmFuZCgwLCAzNTkpO1xuICAgICAgICB2YXIgZGVsYXkyID0gb3B0aW9uLmRlbGF5K3JhbmQoMCwgMTApO1xuICAgICAgICBsYXllci5lbnRlckRlYnJpKHtcbiAgICAgICAgICAgIHNpemU6IDAsXG4gICAgICAgICAgICBwb3NpdGlvbjoge3g6IG9wdGlvbi5wb3NpdGlvbi54LCB5OiBvcHRpb24ucG9zaXRpb24ueX0sXG4gICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4MiwgeTogdnkyLCBkZWNheTowLjl9LFxuICAgICAgICAgICAgcm90YXRpb246IHJvdCxcbiAgICAgICAgICAgIGRlbGF5OiBkZWxheTJcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL+Wwj+egtOeJh+aKleWFpVxuRWZmZWN0LmVudGVyRGVicmlzU21hbGwgPSBmdW5jdGlvbihsYXllciwgb3B0aW9uKSB7XG4gICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUoRWZmZWN0LmRlZmF1bHRPcHRpb24pO1xuICAgIG51bSA9IG9wdGlvbi5udW0gfHwgNTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgIHZhciByYWQgPSByYW5kKDAsIDM1OSkgKiB0b1JhZDtcbiAgICAgICAgdmFyIHYgPSByYW5kKDMsIDUpO1xuICAgICAgICB2YXIgdngyID0gTWF0aC5jb3MocmFkKSAqIHY7XG4gICAgICAgIHZhciB2eTIgPSBNYXRoLnNpbihyYWQpICogdjtcbiAgICAgICAgdmFyIHJvdCA9IHJhbmQoMCwgMzU5KTtcbiAgICAgICAgdmFyIGRlbGF5MiA9IG9wdGlvbi5kZWxheStyYW5kKDAsIDEwKTtcbiAgICAgICAgbGF5ZXIuZW50ZXJEZWJyaSh7XG4gICAgICAgICAgICBzaXplOiAwLFxuICAgICAgICAgICAgcG9zaXRpb246IHt4OiBvcHRpb24ucG9zaXRpb24ueCwgeTogb3B0aW9uLnBvc2l0aW9uLnl9LFxuICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eDIsIHk6IHZ5MiwgZGVjYXk6MC45fSxcbiAgICAgICAgICAgIHJvdGF0aW9uOiByb3QsXG4gICAgICAgICAgICBkZWxheTogZGVsYXkyXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy/jg5zjg6Djgqjjg5Xjgqfjgq/jg4jmipXlhaVcbkVmZmVjdC5lbnRlckJvbWIgPSBmdW5jdGlvbihsYXllciwgb3B0aW9uKSB7XG4gICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUoRWZmZWN0LmRlZmF1bHRPcHRpb24pO1xuXG4gICAgdmFyIHggPSBvcHRpb24ucG9zaXRpb24ueDtcbiAgICB2YXIgeSA9IG9wdGlvbi5wb3NpdGlvbi55O1xuICAgIGxheWVyLmVudGVyQm9tYih7XG4gICAgICAgIHBvc2l0aW9uOiB7eDogeCwgeTogeX0sXG4gICAgICAgIHZlbG9jaXR5OiB7eDogMCwgeTogMCwgZGVjYXk6IDF9LFxuICAgICAgICBzY2FsZToge3g6IDMuMCwgeTogMy4wfSxcbiAgICB9KTtcbiAgICBsYXllci5lbnRlckJvbWIoe1xuICAgICAgICBwb3NpdGlvbjoge3g6IHgsIHk6IHl9LFxuICAgICAgICB2ZWxvY2l0eToge3g6IDAsIHk6IDAsIGRlY2F5OiAxfSxcbiAgICAgICAgc2NhbGU6IHt4OiAzLjAsIHk6IDMuMH0sXG4gICAgICAgIGRlbGF5OiA0MCxcbiAgICB9KTtcblx0dmFyIHJhZCA9IDA7XG5cdGZvciggdmFyIGkgPSAwOyBpIDwgNDA7IGkrKyApe1xuXHRcdHZhciByYWQyID0gcmFkO1xuXHRcdHZhciByID0gNztcblx0XHR2YXIgYnggPSBNYXRoLnNpbihyYWQyKSppKnI7XG5cdFx0dmFyIGJ5ID0gTWF0aC5jb3MocmFkMikqaSpyO1xuXHRcdHZhciBkZWxheSA9IDIqaTtcbiAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZVNtYWxsKGxheWVyLCB7cG9zaXRpb246IHt4OiB4K2J4LCB5OiB5K2J5fSwgZGVsYXk6IGRlbGF5fSk7XG5cdFx0cmFkMis9MS41Nztcblx0XHRieCA9IE1hdGguc2luKHJhZDIpKmkqcjtcblx0XHRieSA9IE1hdGguY29zKHJhZDIpKmkqcjtcbiAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZVNtYWxsKGxheWVyLCB7cG9zaXRpb246IHt4OiB4K2J4LCB5OiB5K2J5fSwgZGVsYXk6IGRlbGF5fSk7XG5cdFx0cmFkMis9MS41Nztcblx0XHRieCA9IE1hdGguc2luKHJhZDIpKmkqcjtcblx0XHRieSA9IE1hdGguY29zKHJhZDIpKmkqcjtcbiAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZVNtYWxsKGxheWVyLCB7cG9zaXRpb246IHt4OiB4K2J4LCB5OiB5K2J5fSwgZGVsYXk6IGRlbGF5fSk7XG5cdFx0cmFkMis9MS41Nztcblx0XHRieCA9IE1hdGguc2luKHJhZDIpKmkqcjtcblx0XHRieSA9IE1hdGguY29zKHJhZDIpKmkqcjtcbiAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZVNtYWxsKGxheWVyLCB7cG9zaXRpb246IHt4OiB4K2J4LCB5OiB5K2J5fSwgZGVsYXk6IGRlbGF5fSk7XG5cdFx0cmFkKz0wLjM7XG5cdH1cbn1cblxuIiwiLypcbiAqICBwYXR0aWNsZS5qc1xuICogIDIwMTYvMDQvMTlcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnZhciBQQVJUSUNMRV9WRUxPQ0lUWV9SQU5HRV9YID0gODsgICAgLy8g6YCf5bqm44Gu5Yid5pyf5YCk44Gu56+E5ZuyIHhcbnZhciBQQVJUSUNMRV9WRUxPQ0lUWV9SQU5HRV9ZID0gNjsgICAgLy8g6YCf5bqm44Gu5Yid5pyf5YCk44Gu56+E5ZuyIHlcbnZhciBQQVJUSUNMRV9BQ0NFTEVSQVRJT05fWSAgID0gLTAuNTsgLy8g5Yqg6YCf5bqmIHlcbnZhciBQQVJUSUNMRV9TQ0FMRSAgICAgICAgICAgID0gMTsgICAgLy8g5Yid5pyf44K544Kx44O844OrXG52YXIgUEFSVElDTEVfU0NBTEVfRE9XTl9TUEVFRCA9IDAuMDI1Oy8vIOOCueOCseODvOODq+ODgOOCpuODs+OBruOCueODlOODvOODiVxuXG5waGluYS5kZWZpbmUoXCJFZmZlY3QuUGFydGljbGVcIiwge1xuICAgIHN1cGVyQ2xhc3M6ICdwaGluYS5kaXNwbGF5LkNpcmNsZVNoYXBlJyxcblxuICAgIF9zdGF0aWM6IHtcbiAgICAgICAgZGVmYXVsdENvbG9yOiB7XG4gICAgICAgICAgICBzdGFydDogMTAsIC8vIGNvbG9yIGFuZ2xlIOOBrumWi+Wni+WApFxuICAgICAgICAgICAgZW5kOiAzMCwgICAvLyBjb2xvciBhbmdsZSDjga7ntYLkuoblgKRcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHtcbiAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICByYWRpdXM6IDY0LFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmJsZW5kTW9kZSA9ICdsaWdodGVyJztcblxuICAgICAgICB2YXIgY29sb3IgPSBvcHRpb24uY29sb3IgfHwgRWZmZWN0LlBhcnRpY2xlLmRlZmF1bHRDb2xvcjtcbiAgICAgICAgdmFyIGdyYWQgPSB0aGlzLmNhbnZhcy5jb250ZXh0LmNyZWF0ZVJhZGlhbEdyYWRpZW50KDAsIDAsIDAsIDAsIDAsIHRoaXMucmFkaXVzKTtcbiAgICAgICAgZ3JhZC5hZGRDb2xvclN0b3AoMCwgJ2hzbGEoezB9LCA3NSUsIDUwJSwgMS4wKScuZm9ybWF0KE1hdGgucmFuZGludChjb2xvci5zdGFydCwgY29sb3IuZW5kKSkpO1xuICAgICAgICBncmFkLmFkZENvbG9yU3RvcCgxLCAnaHNsYSh7MH0sIDc1JSwgNTAlLCAwLjApJy5mb3JtYXQoTWF0aC5yYW5kaW50KGNvbG9yLnN0YXJ0LCBjb2xvci5lbmQpKSk7XG5cbiAgICAgICAgdGhpcy5maWxsID0gZ3JhZDtcbiAgICBcbiAgICAgICAgdGhpcy5iZWdpblBvc2l0aW9uID0gVmVjdG9yMigpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gVmVjdG9yMigpO1xuICAgICAgICB0aGlzLnJlc2V0KHgsIHkpO1xuICAgIH0sXG5cbiAgICByZXNldDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICB0aGlzLmJlZ2luUG9zaXRpb24uc2V0KHgsIHkpO1xuICAgICAgICB0aGlzLnBvc2l0aW9uLnNldCh0aGlzLmJlZ2luUG9zaXRpb24ueCwgdGhpcy5iZWdpblBvc2l0aW9uLnkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5LnNldChcbiAgICAgICAgICAgIE1hdGgucmFuZGludCgtUEFSVElDTEVfVkVMT0NJVFlfUkFOR0VfWCwgUEFSVElDTEVfVkVMT0NJVFlfUkFOR0VfWCksXG4gICAgICAgICAgICBNYXRoLnJhbmRpbnQoLVBBUlRJQ0xFX1ZFTE9DSVRZX1JBTkdFX1ksIFBBUlRJQ0xFX1ZFTE9DSVRZX1JBTkdFX1kpXG4gICAgICAgICk7XG4gICAgICAgIHRoaXMuc2NhbGVYID0gdGhpcy5zY2FsZVkgPSBNYXRoLnJhbmRmbG9hdChQQVJUSUNMRV9TQ0FMRSowLjgsIFBBUlRJQ0xFX1NDQUxFKjEuMik7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucG9zaXRpb24uYWRkKHRoaXMudmVsb2NpdHkpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5LnggKz0gKHRoaXMuYmVnaW5Qb3NpdGlvbi54LXRoaXMueCkvKHRoaXMucmFkaXVzLzIpO1xuICAgICAgICB0aGlzLnZlbG9jaXR5LnkgKz0gUEFSVElDTEVfQUNDRUxFUkFUSU9OX1k7XG4gICAgICAgIHRoaXMuc2NhbGVYIC09IFBBUlRJQ0xFX1NDQUxFX0RPV05fU1BFRUQ7XG4gICAgICAgIHRoaXMuc2NhbGVZIC09IFBBUlRJQ0xFX1NDQUxFX0RPV05fU1BFRUQ7XG5cbiAgICAgICAgaWYgKHRoaXMuc2NhbGVYIDwgMCkge1xuICAgICAgICAgICAgdGhpcy5mbGFyZSgnZGlzYXBwZWFyJyk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iLCIvKlxuICogIEVuZW15LmpzXG4gKiAgMjAxNS8xMC8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiRW5lbXlcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSwgICAgLy/miYDlsZ7jg6zjgqTjg6Tjg7xcbiAgICAgICAgcGFyZW50RW5lbXk6IG51bGwsICAgICAgLy/opqrjgajjgarjgovmlbXjgq3jg6Pjg6lcblxuICAgICAgICAvL+WQhOeoruODleODqeOCsFxuICAgICAgICBpc0NvbGxpc2lvbjogdHJ1ZSwgIC8v5b2T44KK5Yik5a6aXG4gICAgICAgIGlzRGVhZDogZmFsc2UsICAgICAgLy/mrbvkuqFcbiAgICAgICAgaXNTZWxmQ3Jhc2g6IGZhbHNlLCAvL+iHqueIhlxuICAgICAgICBpc011dGVraTogZmFsc2UsICAgIC8v54Sh5pW1XG4gICAgICAgIGlzQm9zczogZmFsc2UsICAgICAgLy/jg5zjgrlcbiAgICAgICAgaXNPblNjcmVlbjogZmFsc2UsICAvL+eUu+mdouWGheOBq+WFpeOBo+OBn1xuICAgICAgICBpc0dyb3VuZDogZmFsc2UsICAgIC8v5Zyw5LiK44OV44Op44KwXG4gICAgICAgIGlzSG92ZXI6IGZhbHNlLCAgICAgLy/jg57jg4Pjg5fjgrnjgq/jg63jg7zjg6vjga7lvbHpn7/nhKHoppZcbiAgICAgICAgaXNFbmVteTogdHJ1ZSwgICAgICAvL+aVteapn+WIpOWIpVxuICAgICAgICBpc0F0dGFjazogdHJ1ZSwgICAgIC8v5pS75pKD44OV44Op44KwXG4gICAgICAgIGlzQ3Jhc2hEb3duOiBmYWxzZSwgLy/lopzokL3jg5Xjg6njgrBcblxuICAgICAgICAvL+OCreODo+ODqeOCr+OCv+aDheWgsVxuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICB0eXBlOiAtMSxcbiAgICAgICAgZGVmOiAwLFxuICAgICAgICBkZWZNYXg6IDAsXG4gICAgICAgIGRhbm1ha3VOYW1lOiBudWxsLFxuICAgICAgICBpZDogLTEsXG4gICAgICAgIGVudGVyUGFyYW06IG51bGwsXG4gICAgICAgIGFsdGl0dWRlOiAxLFxuXG4gICAgICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgICAgIGJvZHk6IG51bGwsXG4gICAgICAgIHRleE5hbWU6IG51bGwsXG4gICAgICAgIHRleEluZGV4OiAwLFxuICAgICAgICB0ZXhXaWR0aDogMzIsXG4gICAgICAgIHRleEhlaWdodDogMzIsXG4gICAgICAgIHRleENvbG9yOiBcIlwiLFxuXG4gICAgICAgIC8v5Z+65pys5oOF5aCxXG4gICAgICAgIGRhdGE6IG51bGwsXG4gICAgICAgIHBsYXllcjogbnVsbCxcblxuICAgICAgICAvL+WJjeODleODrOODvOODoOW6p+aomVxuICAgICAgICBiZWZvcmVYOiAwLFxuICAgICAgICBiZWZvcmVZOiAwLFxuXG4gICAgICAgIC8v5a6f6KGM44K/44K544Kv44Kt44Ol44O8XG4gICAgICAgIHRhc2s6IG51bGwsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG5hbWUsIHgsIHksIGlkLCBwYXJhbSkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICAvL1R3ZWVuZXLjgpJGUFPjg5njg7zjgrnjgavjgZnjgotcbiAgICAgICAgdGhpcy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIHggPSB4IHx8IDA7XG4gICAgICAgIHkgPSB5IHx8IDA7XG4gICAgICAgIHRoaXMuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHRoaXMuaWQgPSBpZCB8fCAtMTtcbiAgICAgICAgdGhpcy5lbnRlclBhcmFtID0gcGFyYW07IC8vRW5lbXlVbml044GL44KJ44Gu5oqV5YWl5pmC44OR44Op44Oh44O844K/XG5cbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmRhdGEgPSBlbmVteURhdGFbbmFtZV07XG4gICAgICAgIGlmICghZCkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKFwiRW5lbXkgZGF0YSBub3QgZm91bmQuOiAnXCIrbmFtZStcIidcIik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvL+W8vuW5leWumue+qVxuICAgICAgICBpZiAoZC5kYW5tYWt1TmFtZSkge1xuICAgICAgICAgICAgdGhpcy5kYW5tYWt1TmFtZSA9IGQuZGFubWFrdU5hbWVcbiAgICAgICAgICAgIGlmIChkLmRhbm1ha3VOYW1lIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0RGFubWFrdSh0aGlzLmRhbm1ha3VOYW1lWzBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+WfuuacrOS7leanmOOCs+ODlOODvFxuICAgICAgICB0aGlzLnR5cGUgPSBkLnR5cGUgfHwgRU5FTVlfU01BTEw7XG4gICAgICAgIHRoaXMuZGVmID0gdGhpcy5kZWZNYXggPSBkLmRlZjtcbiAgICAgICAgdGhpcy53aWR0aCA9IGQud2lkdGggfHwgMzI7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gZC5oZWlnaHQgfHwgMzI7XG4gICAgICAgIHRoaXMubGF5ZXIgPSBkLmxheWVyIHx8IExBWUVSX09CSkVDVF9NSURETEU7XG4gICAgICAgIHRoaXMucG9pbnQgPSBkLnBvaW50IHx8IDA7XG5cbiAgICAgICAgdGhpcy5zZXR1cCA9IGQuc2V0dXAgfHwgdGhpcy5zZXR1cDtcbiAgICAgICAgdGhpcy5lcXVpcG1lbnQgPSBkLmVwdWlwbWVudCB8fCB0aGlzLmVxdWlwbWVudDtcbiAgICAgICAgdGhpcy5hbGdvcml0aG0gPSBkLmFsZ29yaXRobSB8fCB0aGlzLmFsZ29yaXRobTtcbiAgICAgICAgdGhpcy5kZWFkQ2hpbGQgPSBkLmRlYWRDaGlsZCB8fCB0aGlzLmRlYWRDaGlsZDtcbiAgICAgICAgdGhpcy5jaGFuZ2VDb2xvciA9IGQuY2hhbmdlQ29sb3IgfHwgdGhpcy5jaGFuZ2VDb2xvcjtcblxuICAgICAgICAvL+egtOWjiuODkeOCv+ODvOODs1xuICAgICAgICBpZiAodGhpcy50eXBlID09IEVORU1ZX01CT1NTIHx8IHRoaXMudHlwZSA9PSBFTkVNWV9CT1NTICl7XG4gICAgICAgICAgICB0aGlzLmRlYWQgPSBkLmRlYWQgfHwgdGhpcy5kZWZhdWx0RGVhZEJvc3M7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRlYWQgPSBkLmRlYWQgfHwgdGhpcy5kZWZhdWx0RGVhZDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5qmf5L2T55So44K544OX44Op44Kk44OIXG4gICAgICAgIGlmIChkLnRleE5hbWUpIHtcbiAgICAgICAgICAgIHRoaXMudGV4TmFtZSA9IGQudGV4TmFtZTtcbiAgICAgICAgICAgIHRoaXMudGV4SW5kZXggPSBkLnRleEluZGV4IHx8IDA7XG4gICAgICAgICAgICB0aGlzLnRleFdpZHRoID0gZC50ZXhXaWR0aDtcbiAgICAgICAgICAgIHRoaXMudGV4SGVpZ2h0ID0gZC50ZXhIZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLmJvZHkgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShkLnRleE5hbWUsIGQudGV4V2lkdGgsIGQudGV4SGVpZ2h0KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgICAgIHRoaXMudGV4VHJpbVggPSBkLnRleFRyaW1YIHx8IDA7XG4gICAgICAgICAgICB0aGlzLnRleFRyaW1ZID0gZC50ZXhUcmltWSB8fCAwO1xuICAgICAgICAgICAgdGhpcy50ZXhUcmltV2lkdGggPSBkLnRleFRyaW1XaWR0aCB8fCB0aGlzLmJvZHkuaW1hZ2Uud2lkdGg7XG4gICAgICAgICAgICB0aGlzLnRleFRyaW1IZWlnaHQgPSBkLnRleFRyaW1IZWlnaHQgfHwgdGhpcy5ib2R5LmltYWdlLmhlaWdodDtcblxuICAgICAgICAgICAgdGhpcy5ib2R5LnNldEZyYW1lVHJpbW1pbmcodGhpcy50ZXhUcmltWCwgdGhpcy50ZXhUcmltWSwgdGhpcy50ZXhUcmltV2lkdGgsIHRoaXMudGV4VHJpbUhlaWdodCk7XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0RnJhbWVJbmRleCh0aGlzLnRleEluZGV4KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5b2T44KK5Yik5a6a44OA44Of44O86KGo56S6XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLnRleE5hbWUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy50ZXhXaWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgICAgICB0aGlzLnRleEhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICAgICAgdGhpcy5ib2R5ID0gcGhpbmEuZGlzcGxheS5TaGFwZSh7d2lkdGg6dGhpcy53aWR0aCwgaGVpZ2h0OnRoaXMuaGVpZ2h0fSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuYm9keS50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnJlbmRlclJlY3RhbmdsZSh7ZmlsbFN0eWxlOiBcInJnYmEoMjU1LDI1NSwwLDEuMClcIiwgc3Ryb2tlU3R5bGU6IFwicmdiYSgyNTUsMjU1LDAsMS4wKVwifSk7XG4gICAgICAgICAgICB0aGlzLmJvZHkudXBkYXRlID0gZnVuY3Rpb24oKSB7dGhpcy5yb3RhdGlvbiA9IC10aGF0LnJvdGF0aW9uO307XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib2R5LmFscGhhID0gMS4wO1xuICAgICAgICB0aGlzLmJvZHkuYmxlbmRNb2RlID0gXCJzb3VyY2Utb3ZlclwiO1xuXG4gICAgICAgIGlmIChWSUVXX0NPTExJU0lPTikge1xuICAgICAgICAgICAgdGhpcy5jb2wgPSBwaGluYS5kaXNwbGF5LlNoYXBlKHt3aWR0aDp0aGlzLndpZHRoLCBoZWlnaHQ6dGhpcy5oZWlnaHR9KS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5jb2wucmVuZGVyUmVjdGFuZ2xlKHtmaWxsU3R5bGU6IFwicmdiYSgyNTUsMjU1LDAsMC41KVwiLCBzdHJva2VTdHlsZTogXCJyZ2JhKDI1NSwyNTUsMCwwLjUpXCJ9KTtcbiAgICAgICAgICAgIHRoaXMuY29sLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge3RoaXMucm90YXRpb24gPSAtdGhhdC5yb3RhdGlvbjt9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKERFQlVHKSB7XG4gICAgICAgICAgICAvL+iAkOS5heWKm+ihqOekulxuICAgICAgICAgICAgdmFyIGRmID0gdGhpcy5kZWZEaXNwID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJbMC8wXVwifSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGRmLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSAtdGhhdC5yb3RhdGlvbjtcbiAgICAgICAgICAgICAgICB0aGlzLnRleHQgPSBcIltcIit0aGF0LmRlZitcIi9cIit0aGF0LmRlZk1heCtcIl1cIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44OV44Op44Kw44K744OD44OIXG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBkLmlzQ29sbGlzaW9uIHx8IHRoaXMuaXNDb2xsaXNpb247XG4gICAgICAgIHRoaXMuaXNEZWFkICAgICAgPSBkLmlzRGVhZCAgICAgIHx8IHRoaXMuaXNEZWFkO1xuICAgICAgICB0aGlzLmlzU2VsZkNyYXNoID0gZC5pc1NlbGZDcmFzaCB8fCB0aGlzLmlzU2VsZkNyYXNoO1xuICAgICAgICB0aGlzLmlzTXV0ZWtpICAgID0gZC5pc011dGVraSAgICB8fCB0aGlzLmlzTXV0ZWtpXG4gICAgICAgIHRoaXMuaXNPblNjcmVlbiAgPSBkLmlzT25TY3JlZW4gIHx8IHRoaXMuaXNPblNjcmVlbjtcbiAgICAgICAgdGhpcy5pc0dyb3VuZCAgICA9IGQuaXNHcm91bmQgICAgfHwgdGhpcy5pc0dyb3VuZDtcbiAgICAgICAgdGhpcy5pc0hvdmVyICAgICA9IGQuaXNIb3ZlciAgICAgfHwgdGhpcy5pc0hvdmVyO1xuICAgICAgICB0aGlzLmlzRW5lbXkgICAgID0gZC5pc0VuZW15ICAgICB8fCB0aGlzLmlzRW5lbXk7XG4gICAgICAgIHRoaXMuaXNBdHRhY2sgICAgPSBkLmlzQXR0YWNrICAgIHx8IHRoaXMuaXNBdHRhY2s7XG4gICAgICAgIHRoaXMuaXNDcmFzaERvd24gPSBkLmlzQ3Jhc2hEb3duIHx8IHRoaXMuaXNDcmFzaERvd247XG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRU5FTVlfTUJPU1NcbiAgICAgICAgICAgIHx8IHRoaXMudHlwZSA9PSBFTkVNWV9CT1NTXG4gICAgICAgICAgICB8fCB0aGlzLnR5cGUgPT0gRU5FTVlfQk9TU19FUVVJUCkgdGhpcy5pc0Jvc3MgPSB0cnVlO1xuXG4gICAgICAgIC8v44Gd44KM5Lul5aSW44Gu5Zu65pyJ5aSJ5pWw44KS44Kz44OU44O8XG4gICAgICAgIHRoaXMuJHNhZmUoZCk7XG5cbiAgICAgICAgLy/jg5Hjg6njg6Hjg7zjgr/jgrvjg4Pjg4jjgqLjg4Pjg5dcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZSA9IGFwcC5jdXJyZW50U2NlbmU7XG4gICAgICAgIHRoaXMucGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5wbGF5ZXI7XG4gICAgICAgIHRoaXMuc2V0dXAocGFyYW0pO1xuXG4gICAgICAgIC8v5qmf5b2x6L+95YqgXG4gICAgICAgIHRoaXMuYWRkU2hhZG93KCk7XG5cbiAgICAgICAgLy/lvZPjgorliKTlrproqK3lrppcbiAgICAgICAgdGhpcy5ib3VuZGluZ1R5cGUgPSBcInJlY3RcIjtcblxuICAgICAgICAvL2FkZOaZglxuICAgICAgICB0aGlzLm9uKCdhZGRlZCcsIHRoaXMuZXF1aXBtZW50KTtcblxuICAgICAgICAvL3JlbW92ZeaZglxuICAgICAgICB0aGlzLm9uKCdyZW1vdmVkJywgdGhpcy5yZWxlYXNlKTtcblxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oZW50ZXJQYXJhbSkge1xuICAgIH0sXG5cbiAgICBlcXVpcG1lbnQ6IGZ1bmN0aW9uKGVudGVyUGFyYW0pIHtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgLy9idWxsZXRNTC5ydW5uZXLmm7TmlrDlh6bnkIZcbiAgICAgICAgaWYgKCF0aGlzLmlzRGVhZCAmJiB0aGlzLnJ1bm5lcikge1xuICAgICAgICAgICAgdGhpcy5ydW5uZXIueCA9IHRoaXMucG9zaXRpb24ueDtcbiAgICAgICAgICAgIHRoaXMucnVubmVyLnkgPSB0aGlzLnBvc2l0aW9uLnk7XG4gICAgICAgICAgICB0aGlzLnJ1bm5lci51cGRhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5Zyw5LiK54mp54++5bqn5qiZ6Kq/5pW0XG4gICAgICAgIGlmICh0aGlzLmlzR3JvdW5kICYmICF0aGlzLmlzSG92ZXIpIHtcbiAgICAgICAgICAgIHZhciBncm91bmQgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgICAgIHRoaXMueCArPSBncm91bmQuZGVsdGFYO1xuICAgICAgICAgICAgdGhpcy55ICs9IGdyb3VuZC5kZWx0YVk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODnOOCueezu+egtOWjiuaZguW8vua2iOWOu1xuICAgICAgICBpZiAodGhpcy5pc0RlYWQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT0gRU5FTVlfTUJPU1MgfHwgdGhpcy50eXBlID09IEVORU1ZX0JPU1MpIHRoaXMucGFyZW50U2NlbmUuZXJhc2VCdWxsZXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44K/44K544Kv5Yem55CGXG4gICAgICAgIGlmICh0aGlzLnRhc2spIHtcbiAgICAgICAgICAgIHRoaXMuZXhlY1Rhc2sodGhpcy50aW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v6KGM5YuV44Ki44Or44K044Oq44K644OgXG4gICAgICAgIHRoaXMuYWxnb3JpdGhtKGFwcCk7XG5cbiAgICAgICAgLy/jgrnjgq/jg6rjg7zjg7PlhoXlhaXjgaPjgZ/liKTlrppcbiAgICAgICAgaWYgKHRoaXMuaXNPblNjcmVlbikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQm9zcykge1xuICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5ib2R5LndpZHRoLzI7XG4gICAgICAgICAgICAgICAgdmFyIGggPSB0aGlzLmJvZHkuaGVpZ2h0LzI7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMueCA8IC13IHx8IHRoaXMueCA+IFNDX1crdyB8fCB0aGlzLnkgPCAtaCB8fCB0aGlzLnkgPiBTQ19IK2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5Lit5b+D44GM55S76Z2i5YaF44Gr5YWl44Gj44Gf5pmC54K544KS55S76Z2i5YaF44Go5Yik5a6a44GZ44KLXG4gICAgICAgICAgICBpZiAoMCA8IHRoaXMueCAmJiB0aGlzLnggPCBTQ19XICYmIDAgPCB0aGlzLnkgJiYgdGhpcy55IDwgU0NfSCkgdGhpcy5pc09uU2NyZWVuID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v6Ieq5qmf44Go44Gu5b2T44KK5Yik5a6a44OB44Kn44OD44KvXG4gICAgICAgIHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllcjtcbiAgICAgICAgaWYgKHRoaXMudHlwZSA9PSBFTkVNWV9JVEVNKSB7XG4gICAgICAgICAgICAvL+OCouOCpOODhuODoOOBruWgtOWQiFxuICAgICAgICAgICAgaWYgKHRoaXMuaXNIaXRFbGVtZW50KHBsYXllcikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHBsYXllci5nZXRJdGVtKHRoaXMua2luZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL+OCouOCpOODhuODoOS7peWkluOBruWgtOWQiFxuICAgICAgICAgICAgaWYgKHRoaXMuaXNDb2xsaXNpb24gJiYgIXRoaXMuaXNHcm91bmQgJiYgIXRoaXMuaXNEZWFkICYmIHBsYXllci5pc0NvbGxpc2lvbiAmJiB0aGlzLmlzSGl0RWxlbWVudChwbGF5ZXIpKSB7XG4gICAgICAgICAgICAgICAgcGxheWVyLmRhbWFnZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/opqrmqZ/jgYznoLTlo4rjgZXjgozjgZ/loLTlkIjjgIHoh6rliIbjgoLnoLTlo4pcbiAgICAgICAgaWYgKCF0aGlzLmlzRGVhZCAmJiB0aGlzLnBhcmVudEVuZW15ICYmIHRoaXMucGFyZW50RW5lbXkuaXNEZWFkKSB7XG4gICAgICAgICAgICB0aGlzLmlzU2VsZkNyYXNoID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZGVhZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/ngJXmrbtcbiAgICAgICAgaWYgKHRoaXMuZGVmIDwgdGhpcy5kZWZNYXgqMC4yKSB0aGlzLm5lYXJEZWF0aCgpO1xuXG4gICAgICAgIC8v5Zyw5LiK5pW144Gn6Ieq5qmf44Gr6L+R44GE5aC05ZCI44Gv5by+44KS5pKD44Gf44Gq44GEXG4gICAgICAgIGlmICh0aGlzLmlzR3JvdW5kICYmICF0aGlzLmlzQm9zcykge1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlU3EodGhpcywgdGhpcy5wYXJlbnRTY2VuZS5wbGF5ZXIpIDwgNDA5NilcbiAgICAgICAgICAgICAgICB0aGlzLmlzQXR0YWNrID0gZmFsc2U7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdGhpcy5pc0F0dGFjayA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJvZHkuZnJhbWVJbmRleCA9IHRoaXMudGV4SW5kZXg7XG5cbiAgICAgICAgdGhpcy5iZWZvcmVYID0gdGhpcy54O1xuICAgICAgICB0aGlzLmJlZm9yZVkgPSB0aGlzLnk7XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG5cbiAgICAvL+OCouODq+OCtOODquOCuuODoFxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIGRhbWFnZTogZnVuY3Rpb24ocG93ZXIsIGZvcmNlKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTXV0ZWtpIHx8IHRoaXMuaXNEZWFkIHx8ICF0aGlzLmlzQ29sbGlzaW9uKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5kZWYgLT0gcG93ZXI7XG4gICAgICAgIGlmIChmb3JjZSkgdGhpcy5kZWYgPSAtMTtcbiAgICAgICAgaWYgKHRoaXMuZGVmIDwgMSkge1xuICAgICAgICAgICAgdGhpcy5kZWYgPSAwO1xuXG4gICAgICAgICAgICAvL+egtOWjiuODkeOCv+ODvOODs+aKleWFpVxuICAgICAgICAgICAgdGhpcy5mbGFyZSgnZGVhZCcpO1xuICAgICAgICAgICAgdGhpcy5kZWFkKCk7XG5cbiAgICAgICAgICAgIC8v6Kaq5qmf44Gr56C05aOK44KS6YCa55+lXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJlbnRFbmVteSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50RW5lbXkuZGVhZENoaWxkKHRoaXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+OCueOCs+OCouWKoOeul1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2VsZkNyYXNoKSBhcHAuc2NvcmUgKz0gdGhpcy5wb2ludDtcblxuICAgICAgICAgICAgLy/jg5zjgrnmkoPnoLTjgpLjgrfjg7zjg7PjgavpgJrnn6VcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGEudHlwZSA9PSBFTkVNWV9CT1NTIHx8IHRoaXMuZGF0YS50eXBlID09IEVORU1ZX01CT1NTKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5mbGFyZSgnZW5kX2Jvc3MnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbmVteUtpbGwrKztcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/ooqvjg4Djg6Hjg7zjgrjmvJTlh7pcbiAgICAgICAgdGhpcy5jaGFuZ2VDb2xvcihcIldoaXRlXCIsIHRydWUpO1xuICAgICAgICB0aGlzLmJvZHkudHdlZW5lci5jbGVhcigpLndhaXQoMSkuY2FsbChmdW5jdGlvbigpe3RoaXMuY2hhbmdlQ29sb3IoKX0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvL+eAleatu+eKtuaFi1xuICAgIG5lYXJEZWF0aDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSAzMCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmNoYW5nZUNvbG9yKFwiUmVkXCIpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMudGltZSAlIDMwID09IDUpIHtcbiAgICAgICAgICAgIHRoaXMuY2hhbmdlQ29sb3IoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSAzNSA9PSAwKSB7XG4gICAgICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMud2lkdGgvMjtcbiAgICAgICAgICAgIHZhciBoID0gdGhpcy5oZWlnaHQvMjtcbiAgICAgICAgICAgIHZhciBudW0gPSB0aGlzLnR5cGUgPT0gRU5FTVlfQk9TUyB8fCB0aGlzLnR5cGUgPT0gRU5FTVlfTUJPU1M/IDM6IDE7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLngrcmFuZCgtdywgdyk7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnkrcmFuZCgtaCwgaCk7XG4gICAgICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyO1xuICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IGkgPT0gMD8gMDogcmFuZCgwLCAxNSk7XG4gICAgICAgICAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZShsYXllciwge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHgsIHk6IHl9LFxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IGdyb3VuZC5kZWx0YVgsIHk6IGdyb3VuZC5kZWx0YVksIGRlY2F5OiAwLjl9LFxuICAgICAgICAgICAgICAgICAgICBkZWxheTogZGVsYXksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZVNtYWxsXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+iJsuOCkui1pG9y55m944GP44GZ44KLXG4gICAgY2hhbmdlQ29sb3I6IGZ1bmN0aW9uKGNvbG9yLCByZXZlcnNlKSB7XG4gICAgICAgIGlmICghdGhpcy50ZXhOYW1lKSByZXR1cm47XG4gXG4gICAgICAgIC8v5oyH5a6a6Imy44Gr44KI44Gj44Gm55S75YOP5ZCN44GM5aSJ44KP44KLXG4gICAgICAgIGlmIChyZXZlcnNlICYmIHRoaXMudGV4Q29sb3IgIT0gXCJcIikge1xuICAgICAgICAgICAgdGhpcy50ZXhDb2xvciA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoY29sb3IgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGV4Q29sb3IgPSBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoY29sb3IgIT0gXCJSZWRcIiAmJiBjb2xvciAhPSBcIldoaXRlXCIgJiYgY29sb3IgIT0gXCJCbGFja1wiKSBjb2xvciA9IFwiUmVkXCI7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXhDb2xvciA9IGNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/nlLvlg4/jga7lho3oqK3lrppcbiAgICAgICAgdGhpcy5ib2R5LnNldEltYWdlKHRoaXMudGV4TmFtZSt0aGlzLnRleENvbG9yLCB0aGlzLnRleFdpZHRoLCB0aGlzLnRleEhlaWdodCk7XG4gICAgICAgIHRoaXMuYm9keS5zZXRGcmFtZVRyaW1taW5nKHRoaXMudGV4VHJpbVgsIHRoaXMudGV4VHJpbVksIHRoaXMudGV4VHJpbVdpZHRoLCB0aGlzLnRleFRyaW1IZWlnaHQpO1xuICAgICAgICB0aGlzLmJvZHkuc2V0RnJhbWVJbmRleCh0aGlzLnRleEluZGV4KTtcbiAgICB9LFxuXG4gICAgLy/pgJrluLjnoLTlo4rjg5Hjgr/jg7zjg7NcbiAgICBkZWZhdWx0RGVhZDogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLmhlaWdodDtcblxuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICB0aGlzLmV4cGxvZGUod2lkdGgsIGhlaWdodCk7ICAgICAgICBcblxuICAgICAgICAvL+W8vua2iOOBl1xuICAgICAgICBpZiAodGhpcy5kYXRhLnR5cGUgPT0gRU5FTVlfTUlERExFKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVyYXNlQnVsbGV0KHRoaXMpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZGF0YS50eXBlID09IEVORU1ZX0xBUkdFKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLnRpbWVWYW5pc2ggPSA2MDtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKHRoaXMuaXNDcmFzaERvd24pIHtcbiAgICAgICAgICAgIHZhciBnclkgPSB0aGlzLnkgKyA4MDtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgLnRvKHt5OiBnclksIGFsdGl0dWRlOiAwLjF9LCAxMjAsIFwiZWFzZVNpbmVPdXRcIilcbiAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/noLTlo4rmmYLmtojljrvjgqTjg7Pjgr/jg7zjg5Djg6tcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGEuZXhwbG9kZVR5cGUgPT0gRVhQTE9ERV9TTUFMTCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIC50byh7YWxwaGE6IDB9LCAxNSlcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93LnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcy5zaGFkb3cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZGVmYXVsdERlYWRCb3NzOiBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHdpZHRoID0gd2lkdGggfHwgdGhpcy53aWR0aDtcbiAgICAgICAgaGVpZ2h0ID0gaGVpZ2h0IHx8IHRoaXMuaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0RlYWQgPSB0cnVlO1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKTtcbiAgICAgICAgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIHRoaXMuZXhwbG9kZSh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgYXBwLnBsYXlTRShcImV4cGxvZGVMYXJnZVwiKTtcblxuICAgICAgICAvL+W8vua2iOOBl1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUudGltZVZhbmlzaCA9IDE4MDtcblxuICAgICAgICAvL+egtOWjiuaZgua2iOWOu+OCpOODs+OCv+ODvOODkOODq1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLm1vdmVCeSgwLCA4MCwgMzAwKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leHBsb2RlKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUubWFza1doaXRlLnR3ZWVuZXIuY2xlYXIoKS5mYWRlSW4oNDUpLmZhZGVPdXQoNDUpO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlQm9zc1wiKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGFkb3cudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcy5zaGFkb3cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgZXhwbG9kZTogZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgICAgICB3aWR0aCA9IHdpZHRoIHx8IHRoaXMud2lkdGg7XG4gICAgICAgIGhlaWdodCA9IGhlaWdodCB8fCB0aGlzLmhlaWdodDtcblxuICAgICAgICAvL+eIhueZuueEoeOBl1xuICAgICAgICBpZiAodGhpcy5kYXRhLmV4cGxvZGVUeXBlID09IEVYUExPREVfTk9USElORykgcmV0dXJuO1xuXG4gICAgICAgIHZhciBncm91bmQgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgdmFyIHVwcGVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyO1xuICAgICAgICB2YXIgbG93ZXIgPSB0aGlzLnBhcmVudFNjZW5lLmVmZmVjdExheWVyTG93ZXI7XG4gICAgICAgIHZhciB2eCA9IHRoaXMueC10aGlzLmJlZm9yZVgrZ3JvdW5kLmRlbHRhWDtcbiAgICAgICAgdmFyIHZ5ID0gdGhpcy55LXRoaXMuYmVmb3JlWStncm91bmQuZGVsdGFZO1xuXG4gICAgICAgIHN3aXRjaCAodGhpcy5kYXRhLmV4cGxvZGVUeXBlKSB7XG4gICAgICAgICAgICBjYXNlIEVYUExPREVfU01BTEw6XG4gICAgICAgICAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZSh1cHBlciwge1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eCwgeTogdnksIGRlY2F5OiAwLjk1fSxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlU21hbGxcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIEVYUExPREVfTUlERExFOlxuICAgICAgICAgICAgY2FzZSBFWFBMT0RFX0xBUkdFOlxuICAgICAgICAgICAgICAgIHZhciBudW0gPSByYW5kKDIwLCAzMCkqdGhpcy5kYXRhLmV4cGxvZGVUeXBlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLngrcmFuZCgtd2lkdGgsIHdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnkrcmFuZCgtaGVpZ2h0LCBoZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGVsYXkgPSByYW5kKDAsIDMwKTtcbiAgICAgICAgICAgICAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZSh1cHBlciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB4LCB5OiB5fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5LCBkZWNheTogMC45NX0sXG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxheTogZGVsYXksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZUxhcmdlXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBFWFBMT0RFX0dST1VORDpcbiAgICAgICAgICAgICAgICBFZmZlY3QuZW50ZXJFeHBsb2RlR3JvdW5kKGxvd2VyLCB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogdGhpcy54LCB5OiB0aGlzLnl9LFxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4LCB5OiB2eSwgZGVjYXk6IDAuOTV9LFxuICAgICAgICAgICAgICAgICAgICBkZWxheTogZGVsYXksXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcImV4cGxvZGVTbWFsbFwiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRVhQTE9ERV9CT1NTOlxuICAgICAgICAgICAgICAgIHZhciBudW0gPSByYW5kKDEwMCwgMTUwKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bTsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy54K3JhbmQoLXdpZHRoKjAuNywgd2lkdGgqMC43KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnkrcmFuZCgtaGVpZ2h0KjAuNywgaGVpZ2h0KjAuNyk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IHJhbmQoMCwgMTUpO1xuICAgICAgICAgICAgICAgICAgICBFZmZlY3QuZW50ZXJFeHBsb2RlKHVwcGVyLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHgsIHk6IHl9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eCwgeTogdnksIGRlY2F5OiAwLjk1fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGF5OiBkZWxheSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8vQnVsbGV0TUzotbfli5VcbiAgICBzdGFydERhbm1ha3U6IGZ1bmN0aW9uKGRhbm1ha3VOYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5lcikge1xuICAgICAgICAgICAgdGhpcy5ydW5uZXIuc3RvcCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnJ1bm5lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ydW5uZXIgPSBkYW5tYWt1W2Rhbm1ha3VOYW1lXS5jcmVhdGVSdW5uZXIoQnVsbGV0Q29uZmlnKTtcbiAgICAgICAgdGhpcy5ydW5uZXIuaG9zdCA9IHRoaXM7XG4gICAgICAgIHRoaXMucnVubmVyLm9uTm90aWZ5ID0gZnVuY3Rpb24oZXZlbnRUeXBlLCBldmVudCkge1xuICAgICAgICAgICAgdGhpcy5mbGFyZShcImJ1bGxldFwiICsgZXZlbnRUeXBlLCBldmVudCk7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vQnVsbGV0TUzlgZzmraJcbiAgICBzdG9wRGFubWFrdTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnJ1bm5lcikge1xuICAgICAgICAgICAgdGhpcy5ydW5uZXIuc3RvcCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8vQnVsbGV0TUzlho3plotcbiAgICByZXN1bWVEYW5tYWt1OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMucnVubmVyKSB7XG4gICAgICAgICAgICB0aGlzLnJ1bm5lci5zdG9wID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v6Kaq5qmf44Gu44K744OD44OIXG4gICAgc2V0UGFyZW50RW5lbXk6IGZ1bmN0aW9uKHBhcmVudCkge1xuICAgICAgICB0aGlzLnBhcmVudEVuZW15ID0gcGFyZW50O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/lrZDmqZ/jgYznoLTlo4rjgZXjgozjgZ/loLTlkIjjgavlkbzjgbDjgozjgovjgrPjg7zjg6vjg5Djg4Pjgq9cbiAgICBkZWFkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgfSxcblxuICAgIC8v5oyH5a6a44K/44O844Ky44OD44OI44Gu5pa55ZCR44KS5ZCR44GPXG4gICAgbG9va0F0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHRoaXMucGxheWVyO1xuXG4gICAgICAgIC8v44K/44O844Ky44OD44OI44Gu5pa55ZCR44KS5ZCR44GPXG4gICAgICAgIHZhciBheCA9IHRoaXMueCAtIHRhcmdldC54O1xuICAgICAgICB2YXIgYXkgPSB0aGlzLnkgLSB0YXJnZXQueTtcbiAgICAgICAgdmFyIHJhZCA9IE1hdGguYXRhbjIoYXksIGF4KTtcbiAgICAgICAgdmFyIGRlZyA9IH5+KHJhZCAqIHRvRGVnKTtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGRlZyArIDkwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/mjIflrprjgr/jg7zjgrLjg4Pjg4jjga7mlrnlkJHjgavpgLLjgoBcbiAgICBtb3ZlVG86IGZ1bmN0aW9uKHRhcmdldCwgc3BlZWQsIGxvb2spIHtcbiAgICAgICAgdGFyZ2V0ID0gdGFyZ2V0IHx8IHRoaXMucGxheWVyO1xuICAgICAgICBzcGVlZCA9IHNwZWVkIHx8IDU7XG5cbiAgICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7mlrnlkJHjgpLoqIjnrpdcbiAgICAgICAgdmFyIGF4ID0gdGhpcy54IC0gdGFyZ2V0Lng7XG4gICAgICAgIHZhciBheSA9IHRoaXMueSAtIHRhcmdldC55O1xuICAgICAgICB2YXIgcmFkID0gTWF0aC5hdGFuMihheSwgYXgpO1xuICAgICAgICB2YXIgZGVnID0gfn4ocmFkICogdG9EZWcpO1xuXG4gICAgICAgIGlmIChsb29rIHx8IGxvb2sgPT09IHVuZGVmaW5lZCkgdGhpcy5yb3RhdGlvbiA9IGRlZyArIDkwO1xuXG4gICAgICAgIHRoaXMudnggPSBNYXRoLmNvcyhyYWQrTWF0aC5QSSkqc3BlZWQ7XG4gICAgICAgIHRoaXMudnkgPSBNYXRoLnNpbihyYWQrTWF0aC5QSSkqc3BlZWQ7XG4gICAgICAgIHRoaXMueCArPSB0aGlzLnZ4O1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy52eTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHJlbGVhc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHRoaXMuc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnJlbW92ZUNoaWxkcmVuKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+WHpueQhuOCv+OCueOCr+OBrui/veWKoFxuICAgIGFkZFRhc2s6IGZ1bmN0aW9uKHRpbWUsIHRhc2spIHtcbiAgICAgICAgaWYgKCF0aGlzLnRhc2spIHRoaXMudGFzayA9IFtdO1xuICAgICAgICB0aGlzLnRhc2tbdGltZV0gPSB0YXNrO1xuICAgIH0sXG5cbiAgICAvL+WHpueQhuOCv+OCueOCr+OBruWun+ihjFxuICAgIGV4ZWNUYXNrOiBmdW5jdGlvbih0aW1lKSB7XG4gICAgICAgIHZhciB0ID0gdGhpcy50YXNrW3RpbWVdO1xuICAgICAgICBpZiAodCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZih0KSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHQuY2FsbCh0aGlzLCBhcHApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpcmUodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/mqZ/lvbHov73liqBcbiAgICBhZGRTaGFkb3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKHRoaXMudGV4TmFtZStcIkJsYWNrXCIsIHRoaXMudGV4V2lkdGgsIHRoaXMudGV4SGVpZ2h0KTtcbiAgICAgICAgdGhpcy5zaGFkb3cubGF5ZXIgPSBMQVlFUl9TSEFET1c7XG4gICAgICAgIHRoaXMuc2hhZG93LmFscGhhID0gMC41O1xuICAgICAgICB0aGlzLnNoYWRvdy5hZGRDaGlsZFRvKHRoaXMucGFyZW50U2NlbmUpO1xuICAgICAgICB0aGlzLnNoYWRvdy5zZXRGcmFtZVRyaW1taW5nKHRoaXMudGV4VHJpbVgsIHRoaXMudGV4VHJpbVksIHRoaXMudGV4VHJpbVdpZHRoLCB0aGlzLnRleFRyaW1IZWlnaHQpO1xuICAgICAgICB0aGlzLnNoYWRvdy5zZXRGcmFtZUluZGV4KHRoaXMudGV4SW5kZXgpO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy5zaGFkb3cudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoYXQucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZ3JvdW5kLmlzU2hhZG93O1xuXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhhdC5yb3RhdGlvbjtcbiAgICAgICAgICAgIGlmICh0aGF0LmlzR3JvdW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54ID0gdGhhdC54ICsgMTA7XG4gICAgICAgICAgICAgICAgdGhpcy55ID0gdGhhdC55ICsgMTA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMueCA9IHRoYXQueCArIGdyb3VuZC5zaGFkb3dYICogdGhhdC5hbHRpdHVkZTtcbiAgICAgICAgICAgICAgICB0aGlzLnkgPSB0aGF0LnkgKyBncm91bmQuc2hhZG93WSAqIHRoYXQuYWx0aXR1ZGU7XG4gICAgICAgICAgICAgICAgdGhpcy5zY2FsZVggPSBncm91bmQuc2NhbGVYO1xuICAgICAgICAgICAgICAgIHRoaXMuc2NhbGVZID0gZ3JvdW5kLnNjYWxlWTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+Wcn+eFmei/veWKoFxuICAgIGFkZFNtb2tlOiBmdW5jdGlvbih2b2x1bWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEZWFkKSByZXR1cm4gdGhpcztcbiAgICAgICAgdm9sdW1lID0gdm9sdW1lIHx8IDU7XG4gICAgICAgIGlmICh3aWR0aCA9PT0gdW5kZWZpbmVkKSB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGlmIChoZWlnaHQgPT09IHVuZGVmaW5lZCkgaGVpZ2h0ID0gdGhpcy53aWR0aDtcblxuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLnBhcmVudFNjZW5lLmVmZmVjdExheWVyTG93ZXI7XG4gICAgICAgIHZhciBncm91bmQgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgdmFyIHZ4ID0gZ3JvdW5kLmRlbHRhWDtcbiAgICAgICAgdmFyIHZ5ID0gZ3JvdW5kLmRlbHRhWTtcbiAgICAgICAgdmFyIHcgPSB3aWR0aC8yO1xuICAgICAgICB2YXIgaCA9IGhlaWdodC8yO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdm9sdW1lOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy54K3JhbmQoLXcsIHcpO1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnkrcmFuZCgtaCwgaCk7XG4gICAgICAgICAgICBsYXllci5lbnRlclNtb2tlKHtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHgsIHk6IHl9LFxuICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5LCBkZWNheTogMX0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy/lnJ/nhZnov73liqDvvIjlsI/vvIlcbiAgICBhZGRTbW9rZVNtYWxsOiBmdW5jdGlvbih2b2x1bWUsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgaWYgKHRoaXMuaXNEZWFkKSByZXR1cm4gdGhpcztcbiAgICAgICAgdm9sdW1lID0gdm9sdW1lIHx8IDU7XG4gICAgICAgIGlmICh3aWR0aCA9PT0gdW5kZWZpbmVkKSB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgIGlmIChoZWlnaHQgPT09IHVuZGVmaW5lZCkgaGVpZ2h0ID0gdGhpcy53aWR0aDtcblxuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLnBhcmVudFNjZW5lLmVmZmVjdExheWVyTG93ZXI7XG4gICAgICAgIHZhciBncm91bmQgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgdmFyIHZ4ID0gZ3JvdW5kLmRlbHRhWDtcbiAgICAgICAgdmFyIHZ5ID0gZ3JvdW5kLmRlbHRhWTtcbiAgICAgICAgdmFyIHcgPSB3aWR0aC8yO1xuICAgICAgICB2YXIgaCA9IGhlaWdodC8yO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdm9sdW1lOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB4ID0gdGhpcy54K3JhbmQoLXcsIHcpO1xuICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnkrcmFuZCgtaCwgaCk7XG4gICAgICAgICAgICBsYXllci5lbnRlclNtb2tlU21hbGwoe1xuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogeCwgeTogeX0sXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eCwgeTogdnksIGRlY2F5OiAxfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBFbmVteURhdGEuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5jb25zdCBlbmVteURhdGEgPSBbXTtcblxuLypcbiAqICDmlLvmkoPjg5jjg6rjgIzjg5vjg7zjg43jg4Pjg4jjgI1cbiAqL1xuZW5lbXlEYXRhWydIb3JuZXQnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBbXCJIb3JuZXQxXCIsIFwiSG9ybmV0MlwiLCBcIkhvcm5ldDNcIl0sXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgMTYsXG4gICAgaGVpZ2h0OiAxNixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAzMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDMwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX1NNQUxMLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9TTUFMTCxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXgxXCIsXG4gICAgdGV4V2lkdGg6IDMyLFxuICAgIHRleEhlaWdodDogMzIsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oZW50ZXJQYXJhbSkge1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5yb3RlciA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4MVwiLCAzMiwgMzIpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMucm90ZXIuaW5kZXggPSAzMjtcbiAgICAgICAgdGhpcy5yb3Rlci5zZXRGcmFtZUluZGV4KDMyKTtcblxuICAgICAgICB0aGlzLnZ4ID0gMDtcbiAgICAgICAgdGhpcy52eSA9IDA7XG5cbiAgICAgICAgLy/ooYzli5Xjg5Hjgr/jg7zjg7PliIblspBcbiAgICAgICAgdGhpcy5wYXR0ZXJuID0gZW50ZXJQYXJhbS5wYXR0ZXJuO1xuICAgICAgICBzd2l0Y2ggKHRoaXMucGF0dGVybikge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5tb3ZlQnkoMCwgMzAwLCAxMjAsIFwiZWFzZU91dFF1YXJ0XCIpXG4gICAgICAgICAgICAgICAgICAgIC53YWl0KDYwKVxuICAgICAgICAgICAgICAgICAgICAubW92ZUJ5KDAsIC0zMDAsIDEyMClcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnJlbW92ZSgpO30uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgdGhpcy5tb3ZlVG8odGhpcy5wbGF5ZXIsIDUsIHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5tb3ZlQnkoMCwgMjAwLCAxMjAsIFwiZWFzZU91dFF1YXJ0XCIpXG4gICAgICAgICAgICAgICAgICAgIC53YWl0KDYwMClcbiAgICAgICAgICAgICAgICAgICAgLm1vdmVCeSgwLCAtMzAwLCAxMjApXG4gICAgICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7dGhpcy5waGFzZSsrO30uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZVsyXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkubW92ZUJ5KDAsIFNDX0gqMC41LCAzMDApLndhaXQoNDgwKS5tb3ZlQnkoMCwgLVNDX0gsIDYwMCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5tb3ZlQnkoMCwgMjAwLCAxMjAsIFwiZWFzZU91dFF1YXJ0XCIpXG4gICAgICAgICAgICAgICAgICAgIC53YWl0KDYwKVxuICAgICAgICAgICAgICAgICAgICAubW92ZUJ5KDAsIC0yNTAsIDEyMClcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnJlbW92ZSgpO30uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODn+OCteOCpOODq+eZuuWwhFxuICAgICAgICB0aGlzLm9uKCdidWxsZXRtaXNzaWxlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbnRlckVuZW15KFwiTWVkdXNhXCIsIHRoaXMueCwgdGhpcy55KS5zZXRIb21pbmcodHJ1ZSkuc2V0VmVsb2NpdHkoLTAuNSwgLTIuMCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyRW5lbXkoXCJNZWR1c2FcIiwgdGhpcy54LCB0aGlzLnkpLnNldEhvbWluZyh0cnVlKS5zZXRWZWxvY2l0eSggMC41LCAtMi4wKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5sb29rQXQoKTtcbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDIgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5yb3Rlci5pbmRleCA9ICh0aGlzLnJvdGVyLmluZGV4KzEpJTQrMzI7XG4gICAgICAgICAgICB0aGlzLnJvdGVyLnNldEZyYW1lSW5kZXgodGhpcy5yb3Rlci5pbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXR0ZXJuID09IDIpIHtcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLnZ4O1xuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMudnk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXR0ZXJuID09IDMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnBoYXNlID09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmVUbyh0aGlzLnBhcmVudFNjZW5lLnBsYXllciwgNSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5waGFzZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMucGhhc2UgPT0gMikge1xuICAgICAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLnZ4O1xuICAgICAgICAgICAgICAgIHRoaXMueSArPSB0aGlzLnZ5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/nlLvpnaLkuIvpg6jjgafjga/lvL7jgpLlh7rjgZXjgarjgYRcbiAgICAgICAgaWYgKHRoaXMueSA+IFNDX0gqMC43KSB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICB9LFxufTtcblxuLypcbiAqICDkuK3lnovmlLvmkoPjg5jjg6rjgIzjgrjjgqzjg5Djg4HjgI1cbiAqL1xuZW5lbXlEYXRhWydNdWREYXViZXInXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBcIk11ZERhdWJlclwiLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDYwLFxuICAgIGhlaWdodDogMjYsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogODAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMzAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX01JRERMRSxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTUlERExFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogMTI4LFxuICAgIHRleEhlaWdodDogNjQsXG4gICAgdGV4SW5kZXg6IDYsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLnRleEluZGV4O1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcblxuICAgICAgICB0aGlzLnJvdGVyID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXgxXCIsIDExNCwgNDgpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMucm90ZXIuc2V0RnJhbWVUcmltbWluZygyODgsIDEyOCwgMjI4LCA5Nik7XG4gICAgICAgIHRoaXMucm90ZXIuc2V0RnJhbWVJbmRleCgwKTtcbiAgICAgICAgdGhpcy5yb3Rlci5pbmRleCA9IDA7XG5cbiAgICAgICAgLy/ooYzli5XoqK3lrppcbiAgICAgICAgdGhpcy52eSA9IDU7XG4gICAgICAgIHRoaXMudHdlZW5lci50byh7dnk6IDAuNX0sIDEyMCwgXCJlYXNlT3V0Q3ViaWNcIikuY2FsbChmdW5jdGlvbigpe3RoaXMucGhhc2UrKzt9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy50aW1lICUgNCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnJvdGVyLmluZGV4ID0gKHRoaXMucm90ZXIuaW5kZXgrMSklNCszMjtcbiAgICAgICAgICAgIHRoaXMucm90ZXIuc2V0RnJhbWVJbmRleCh0aGlzLnJvdGVyLmluZGV4KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aW1lICUgNCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXgrMSklMis2O1xuICAgICAgICAgICAgdGhpcy5ib2R5LnNldEZyYW1lSW5kZXgodGhpcy5pbmRleCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnkrPXRoaXMudnk7XG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDEpIHtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG4vKlxuICogIOS4reWei+eIhuaSg+apn+OAjOODk+ODg+OCsOOCpuOCo+ODs+OCsOOAjVxuICovXG5lbmVteURhdGFbJ0JpZ1dpbmcnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBcIkJpZ1dpbmdcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA4MCxcbiAgICBoZWlnaHQ6IDI2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDEwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAzMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSxcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfTUlERExFLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9NSURETEUsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MVwiLFxuICAgIHRleFdpZHRoOiAxMjgsXG4gICAgdGV4SGVpZ2h0OiA0OCxcbiAgICB0ZXhJbmRleDogMixcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMudGV4SW5kZXg7XG4gICAgICAgIHRoaXMuaXNDcmFzaERvd24gPSB0cnVlO1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy50aW1lICUgMiA9PSAwKSB0aGlzLnkrKztcbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDQgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5pbmRleCA9ICh0aGlzLmluZGV4KzEpJTIrMjtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRGcmFtZUluZGV4KHRoaXMuaW5kZXgpO1xuICAgICAgICB9XG4gICAgfSxcbn07XG5cbi8qXG4gKiAg5Lit5Z6L5pS75pKD5qmf44CM44OH44Or44K/44CNXG4gKi9cbmVuZW15RGF0YVsnRGVsdGEnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBcIkJpZ1dpbmdcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA4MCxcbiAgICBoZWlnaHQ6IDI2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDEwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAzMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSxcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfTUlERExFLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9NSURETEUsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MVwiLFxuICAgIHRleFdpZHRoOiA0OCxcbiAgICB0ZXhIZWlnaHQ6IDEwNCxcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogMjU2LFxuICAgIHRleFRyaW1XaWR0aDogMTkyLFxuICAgIHRleFRyaW1IZWlnaHQ6IDk2LFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmluZGV4ID0gdGhpcy50ZXhJbmRleDtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDIgPT0gMCkgdGhpcy55Kys7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSA0ID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAodGhpcy5pbmRleCsxKSUyKzI7XG4gICAgICAgICAgICB0aGlzLmJvZHkuc2V0RnJhbWVJbmRleCh0aGlzLmluZGV4KTtcbiAgICAgICAgfVxuICAgIH0sXG59O1xuXG4vKlxuICogIOmjm+epuuaMuuOAjOOCueOCq+OCpOODluODrOODvOODieOAjVxuICovXG5lbmVteURhdGFbJ1NreUJsYWRlJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogXCJTa3lCbGFkZVwiLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDQwLFxuICAgIGhlaWdodDogOTYsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogODAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMzAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX01JRERMRSxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTUlERExFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogNDgsXG4gICAgdGV4SGVpZ2h0OiAxMDQsXG4gICAgdGV4VHJpbVg6IDAsXG4gICAgdGV4VHJpbVk6IDEyOCxcbiAgICB0ZXhUcmltV2lkdGg6IDk2LFxuICAgIHRleFRyaW1IZWlnaHQ6IDEwNCxcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMudGV4SW5kZXg7XG4gICAgICAgIHRoaXMucGhhc2UgPSAwO1xuXG4gICAgICAgIHRoaXMucm90ZXIgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleDFcIiwgNDgsIDEwNCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5yb3Rlci5zZXRGcmFtZVRyaW1taW5nKDk2LCAxMjgsIDE5MiwgMTA0KTtcbiAgICAgICAgdGhpcy5yb3Rlci5zZXRGcmFtZUluZGV4KDApO1xuICAgICAgICB0aGlzLnJvdGVyLmluZGV4ID0gMDtcblxuICAgICAgICAvL+ihjOWLleioreWumlxuICAgICAgICBpZiAodGhpcy54IDwgU0NfVyowLjUpIHtcbiAgICAgICAgICAgIHRoaXMucHggPSAxO1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLm1vdmVCeSggU0NfVyowLjYsIDAsIDE4MCwgXCJlYXNlT3V0Q3ViaWNcIikuY2FsbChmdW5jdGlvbigpe3RoaXMucGhhc2UrKzt9LmJpbmQodGhpcykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5weCA9IC0xO1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLm1vdmVCeSgtU0NfVyowLjYsIDAsIDE4MCwgXCJlYXNlT3V0Q3ViaWNcIikuY2FsbChmdW5jdGlvbigpe3RoaXMucGhhc2UrKzt9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSA0ID09IDApIHtcbiAgICAgICAgICAgIHRoaXMucm90ZXIuaW5kZXggPSAodGhpcy5yb3Rlci5pbmRleCsxKSU0O1xuICAgICAgICAgICAgdGhpcy5yb3Rlci5zZXRGcmFtZUluZGV4KHRoaXMucm90ZXIuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSA0ID09IDApIHtcbiAgICAgICAgICAgIHRoaXMuaW5kZXggPSAodGhpcy5pbmRleCsxKSUyO1xuICAgICAgICAgICAgdGhpcy5ib2R5LnNldEZyYW1lSW5kZXgodGhpcy5pbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucGhhc2UgPT0gMSkge1xuICAgICAgICAgICAgdGhpcy55LS07XG4gICAgICAgICAgICB0aGlzLngrPXRoaXMucHg7XG4gICAgICAgIH1cbiAgICB9LFxufTtcblxuLypcbiAqICDkuK3lnovmiKbou4rjgIzjg5Xjg6njgqzjg6njg4Pjg4/jgI1cbiAqL1xuZW5lbXlEYXRhWydGcmFnYXJhY2gnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBcIkZyYWdhcmFjaFwiLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDQ4LFxuICAgIGhlaWdodDogNDgsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogMTAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogNTAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9TTUFMTCxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfR1JPVU5ELFxuXG4gICAgLy/lkITnqK7jg5Xjg6njgrBcbiAgICBpc0dyb3VuZDogdHJ1ZSxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXgyXCIsXG4gICAgdGV4V2lkdGg6IDQ4LFxuICAgIHRleEhlaWdodDogNDgsXG4gICAgdGV4VHJpbVg6IDAsXG4gICAgdGV4VHJpbVk6IDAsXG4gICAgdGV4VHJpbVdpZHRoOiAxOTIsXG4gICAgdGV4VHJpbUhlaWdodDogNDgsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgICAgdGhpcy5pbmRleCA9IHRoaXMudGV4SW5kZXg7XG4gICAgICAgIHRoaXMucGhhc2UgPSAwO1xuXG4gICAgICAgIC8v44OR44Op44Oh44O844K/44Gr44KI44KK6YCy6KGM5pa55ZCR44KS5rG65a6aXG4gICAgICAgIHRoaXMucGF0dGVybiA9IHBhcmFtLnBhdHRlcm47XG4gICAgICAgIHRoaXMuc3BlZWQgPSAwLjU7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gMDtcbiAgICAgICAgc3dpdGNoICh0aGlzLnBhdHRlcm4pIHtcbiAgICAgICAgICAgIGNhc2UgXCJjXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImJcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDE4MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJsXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSA5MDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJyXCI6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb24gPSAyNzA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnR1cnJldCA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4MVwiLCAyNCwgMjQpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMudHVycmV0LnNldEZyYW1lVHJpbW1pbmcoMTkyLCAzMiwgMjQsIDI0KTtcbiAgICAgICAgdGhpcy50dXJyZXQuc2V0RnJhbWVJbmRleCgwKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/noLLlj7DjgpLjgr/jg7zjgrLjg4Pjg4jjga7mlrnlkJHjgavlkJHjgZHjgotcbiAgICAgICAgdmFyIGF4ID0gdGhpcy54IC0gdGhpcy5wYXJlbnRTY2VuZS5wbGF5ZXIueDtcbiAgICAgICAgdmFyIGF5ID0gdGhpcy55IC0gdGhpcy5wYXJlbnRTY2VuZS5wbGF5ZXIueTtcbiAgICAgICAgdmFyIHJhZCA9IE1hdGguYXRhbjIoYXksIGF4KTtcbiAgICAgICAgdmFyIGRlZyA9IH5+KHJhZCAqIHRvRGVnKTtcbiAgICAgICAgdGhpcy50dXJyZXQucm90YXRpb24gPSBkZWcgKyA5MDtcblxuICAgICAgICBpZiAodGhpcy50aW1lICUgNCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmluZGV4ID0gKHRoaXMuaW5kZXgrMSklNDtcbiAgICAgICAgICAgIHRoaXMuYm9keS5zZXRGcmFtZUluZGV4KHRoaXMuaW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnZ4ICE9IDAgfHwgdGhpcy52eSAhPSAwKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFNtb2tlU21hbGwoMSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXR0ZXJuID09IFwibFwiICYmIHRoaXMueCA+IFNDX1cqMC40KSB7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDE4MDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wYXR0ZXJuID09IFwiclwiICYmIHRoaXMueCA8IFNDX1cqMC42KSB7XG4gICAgICAgICAgICB0aGlzLmRpcmVjdGlvbiA9IDE4MDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v56e75YuV5Yem55CGXG4gICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLmRpcmVjdGlvbjtcbiAgICAgICAgdmFyIHJhZCA9IHRoaXMuZGlyZWN0aW9uICogdG9SYWQ7XG4gICAgICAgIHRoaXMudnggPSBNYXRoLnNpbihyYWQpICogdGhpcy5zcGVlZDtcbiAgICAgICAgdGhpcy52eSA9IE1hdGguY29zKHJhZCkgKiB0aGlzLnNwZWVkO1xuICAgICAgICB0aGlzLnggKz0gdGhpcy52eDtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMudnk7XG4gICAgfSxcbn07XG5cbi8qXG4gKiAg5rWu6YGK56Cy5Y+w44CM44OW44Oq44Ol44OK44O844Kv44CN77yI6Kit572u77yJXG4gKi9cbmVuZW15RGF0YVsnQnJpb25hYzEnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBbXCJCcmlvbmFjMV8xXCIsIFwiQnJpb25hYzFfMlwiLCBcIkJyaW9uYWNfZ3JvdW5kMV8zXCJdLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDQwLFxuICAgIGhlaWdodDogNDAsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogNDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMzAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9MT1dFUixcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfTUlERExFLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9NSURETEUsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MlwiLFxuICAgIHRleFdpZHRoOiA0OCxcbiAgICB0ZXhIZWlnaHQ6IDQ4LFxuICAgIHRleFRyaW1YOiAwLFxuICAgIHRleFRyaW1ZOiA2NCxcbiAgICB0ZXhUcmltV2lkdGg6IDQ4LFxuICAgIHRleFRyaW1IZWlnaHQ6IDQ4LFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICAgIHRoaXMuaXNHcm91bmQgPSB0cnVlO1xuXG4gICAgICAgIHRoaXMudnggPSAwO1xuICAgICAgICB0aGlzLnZ5ID0gMDtcblxuICAgICAgICAvL+ODkeODqeODoeODvOOCv+OBq+OCiOOCiuihjOWLleODkeOCv+ODvOODs+OCkuaxuuWumlxuICAgICAgICBzd2l0Y2ggKHBhcmFtLnBvcykge1xuICAgICAgICAgICAgY2FzZSBcImNlbnRlclwiOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBcImxlZnRcIjpcbiAgICAgICAgICAgICAgICB0aGlzLnZ4ID0gNDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgXCJyaWdodFwiOlxuICAgICAgICAgICAgICAgIHRoaXMudnggPSAtNDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudHVycmV0ID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXgyXCIsIDI0LCAyNClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZyg2NCwgNjQsIDI0LCAyNClcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgMCk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCArPSB0aGlzLnZ4O1xuICAgICAgICB0aGlzLnkgKz0gdGhpcy52eTtcblxuICAgICAgICB0aGlzLnR1cnJldC5yb3RhdGlvbisrO1xuXG4gICAgICAgIHRoaXMuYWRkU21va2VTbWFsbCgxKTtcbiAgICB9LFxufTtcblxuLypcbiAqICDlpKflnovjg5/jgrXjgqTjg6vjgIzjg5/jgrnjg4bjgqPjg6vjg4bjgqTjg7PjgI1cbiAqL1xuZW5lbXlEYXRhWydNaXN0aWx0ZWlubiddID0ge1xuICAgIC8v5L2/55So5by+5bmV5ZCNXG4gICAgZGFubWFrdU5hbWU6IFwiYmFzaWNcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA2NCxcbiAgICBoZWlnaHQ6IDY0LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDgwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDMwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9NSURETEUsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX01JRERMRSxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXgxXCIsXG4gICAgdGV4V2lkdGg6IDQ4LFxuICAgIHRleEhlaWdodDogMTA0LFxuICAgIHRleFRyaW1YOiAwLFxuICAgIHRleFRyaW1ZOiAxMjgsXG4gICAgdGV4VHJpbVdpZHRoOiA5NixcbiAgICB0ZXhUcmltSGVpZ2h0OiAxMDQsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaW5kZXggPSB0aGlzLnRleEluZGV4O1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5zZXRGcmFtZVRyaW1taW5nKDAsIDEyOCwgOTYsIDEwNCk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgfSxcbn07XG5cbi8qXG4gKiAg5Lit5Z6L6Ly46YCB5qmf44CM44OI44Kk44Oc44OD44Kv44K544CNXG4gKi9cbmVuZW15RGF0YVsnVG95Qm94J10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogXCJUb3lCb3hcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICAzMCxcbiAgICBoZWlnaHQ6IDkwLFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDUwMCxcblxuICAgIC8v5b6X54K5XG4gICAgcG9pbnQ6IDUwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9TTUFMTCxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTEFSR0UsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MVwiLFxuICAgIHRleFdpZHRoOiA2NCxcbiAgICB0ZXhIZWlnaHQ6IDEyOCxcbiAgICB0ZXhJbmRleDogMixcblxuICAgIC8v5oqV5LiL44Ki44Kk44OG44Og56iu6aGeXG4gICAga2luZDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbihlbnRlclBhcmFtKSB7XG4gICAgICAgIGlmIChlbnRlclBhcmFtLmRyb3AgPT0gXCJwb3dlclwiKSB0aGlzLmtpbmQgPSBJVEVNX1BPV0VSO1xuICAgICAgICBpZiAoZW50ZXJQYXJhbS5kcm9wID09IFwiYm9tYlwiKSB0aGlzLmtpbmQgPSBJVEVNX0JPTUI7XG4gICAgICAgIGlmIChlbnRlclBhcmFtLmRyb3AgPT0gXCIxVVBcIikgdGhpcy5raW5kID0gSVRFTV8xVVA7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLm1vdmVCeSgwLCBTQ19IKjAuNSwgMzAwKS53YWl0KDQ4MCkubW92ZUJ5KDAsIC1TQ19ILCA2MDApO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy50dXJyZXQgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleDFcIiwgMjQsIDI0KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDE5NiwgMzIsIDI0LCAyNClcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMCwgLTM2KTtcbiAgICAgICAgdGhpcy50dXJyZXQudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmxvb2tBdCh7XG4gICAgICAgICAgICAgICAgeDogdGhhdC54LXRoYXQucGxheWVyLngsXG4gICAgICAgICAgICAgICAgeTogdGhhdC55LXRoYXQucGxheWVyLnksXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBlcHVpcG1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuICAgIH0sXG5cbiAgICBkZWFkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/noLTlo4rmmYLjgqLjgqTjg4bjg6DjgpLjgrfjg7zjg7PjgavmipXlhaVcbiAgICAgICAgdGhpcy50dXJyZXQgPSBFbmVteShcIkl0ZW1cIiwgdGhpcy54LCB0aGlzLnksIDAsIHtraW5kOiAwfSkuYWRkQ2hpbGRUbyh0aGlzLnBhcmVudFNjZW5lKTtcblxuICAgICAgICAvL+mAmuW4uOOBruegtOWjiuWHpueQhlxuICAgICAgICB0aGlzLmRlZmF1bHREZWFkKCk7XG4gICAgfSxcbn1cblxuLypcbiAqICDjgqLjgqTjg4bjg6BcbiAqL1xuZW5lbXlEYXRhWydJdGVtJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXlkI1cbiAgICBkYW5tYWt1TmFtZTogbnVsbCxcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICAzMCxcbiAgICBoZWlnaHQ6IDkwLFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDEsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAxMDAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX0lURU0sXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX1NNQUxMLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogMzIsXG4gICAgdGV4SGVpZ2h0OiAzMixcbiAgICB0ZXhJbmRleDogMCxcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogOTYsXG4gICAgdGV4VHJpbVdpZHRoOiA5NixcbiAgICB0ZXhUcmltSGVpZ2h0OiAzMixcblxuICAgIC8v5oqV5LiL44Ki44Kk44OG44Og5Yy65YiGXG4gICAga2luZDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbihlbnRlclBhcmFtKSB7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNldCA9IHRydWU7XG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xuXG4gICAgICAgIHRoaXMua2luZCA9IGVudGVyUGFyYW0ua2luZDtcbiAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gdGhpcy5raW5kO1xuXG4gICAgICAgIHRoaXMuc2V0U2NhbGUoMS41KTtcbiAgICAgfSxcblxuICAgIGVwdWlwbWVudDogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnJlc2V0KSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmNvdW50Kys7XG4gICAgICAgICAgICBpZiAodGhpcy5jb3VudCA8IDUpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHggPSBNYXRoLnJhbmRpbnQoMCwgU0NfVyk7XG4gICAgICAgICAgICAgICAgdmFyIHB5ID0gTWF0aC5yYW5kaW50KFNDX0gqMC4zLCBTQ19XKjAuOSk7XG4gICAgICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgLnRvKHt4OiBweCwgeTogcHl9LCAxODAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgICAgICAud2FpdCgzMClcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc2V0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkudG8oe3g6IHRoaXMueCwgeTogU0NfSCoxLjF9LCAxODAsIFwiZWFzZUluT3V0U2luZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgfSxcbn1cblxuLypcbiAqICDoqpjlsI7lvL7jgIzjg6Hjg4njgqXjg7zjgrXjgI1cbiAqL1xuZW5lbXlEYXRhWydNZWR1c2EnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leWQjVxuICAgIGRhbm1ha3VOYW1lOiBudWxsLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDgsXG4gICAgaGVpZ2h0OiA4LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDEwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogNTAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX01JRERMRSxcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfU01BTEwsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX1NNQUxMLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleDFcIixcbiAgICB0ZXhXaWR0aDogOCxcbiAgICB0ZXhIZWlnaHQ6IDI0LFxuICAgIHRleEluZGV4OiAwLFxuICAgIHRleFRyaW1YOiAxOTIsXG4gICAgdGV4VHJpbVk6IDY0LFxuICAgIHRleFRyaW1XaWR0aDogOCxcbiAgICB0ZXhUcmltSGVpZ2h0OiAyNCxcblxuICAgIHNldHVwOiBmdW5jdGlvbihlbnRlclBhcmFtKSB7XG4gICAgICAgIHRoaXMuYm9keS5zZXRPcmlnaW4oMC41LCAwLjApO1xuXG4gICAgICAgIC8v5LiA5a6a5pmC6ZaT44GU44Go44Gr54WZ44Gg44GZ44KIXG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAud2FpdCg1KVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllck1pZGRsZS5lbnRlclNtb2tlU21hbGwoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiAwLCB5OiAwLCBkZWNheTogMX0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAuc2V0TG9vcCh0cnVlKTtcblxuICAgICAgICAvL+iHquWLlei/veWwvuioreWumlxuICAgICAgICB0aGlzLmlzSG9taW5nID0gZmFsc2U7XG5cbiAgICAgICAgLy/np7vli5Xmg4XloLFcbiAgICAgICAgdGhpcy52eCA9IDA7XG4gICAgICAgIHRoaXMudnkgPSAzO1xuICAgICAgICB0aGlzLnNwZCA9IDAuMDU7XG4gICAgICAgIHRoaXMubWF4U3BlZWQgPSAzO1xuICAgIH0sXG5cbiAgICBhbGdvcml0aG06IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmICh0aGlzLmlzSG9taW5nKSB7XG4gICAgICAgICAgICB0aGlzLmxvb2tBdCgpO1xuICAgICAgICAgICAgdmFyIHZ4ID0gdGhpcy5wbGF5ZXIueC10aGlzLng7XG4gICAgICAgICAgICB2YXIgdnkgPSB0aGlzLnBsYXllci55LXRoaXMueTtcbiAgICAgICAgICAgIHZhciBkID0gTWF0aC5zcXJ0KHZ4KnZ4K3Z5KnZ5KTtcbiAgICAgICAgICAgIHRoaXMudnggKz0gdngvZCp0aGlzLnNwZDtcbiAgICAgICAgICAgIHRoaXMudnkgKz0gdnkvZCp0aGlzLnNwZDtcbiAgICAgICAgICAgIGlmIChkIDwgMTYpIHRoaXMuaXNIb21pbmcgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubG9va0F0KHt4OiB0aGlzLngrdGhpcy52eCwgeTogdGhpcy55K3RoaXMudnl9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnggKz0gdGhpcy52eDtcbiAgICAgICAgdGhpcy55ICs9IHRoaXMudnk7XG4gICAgfSxcblxuICAgIHNldEhvbWluZzogZnVuY3Rpb24oZikge1xuICAgICAgICBpZiAoZiAmJiAhdGhpcy5pc0hvbWluZykge1xuICAgICAgICAgICAgdGhpcy52eCA9IDA7XG4gICAgICAgICAgICB0aGlzLnZ5ID0gMDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmlzSG9taW5nID0gZjtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHNldFZlbG9jaXR5OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHRoaXMudnggPSB4O1xuICAgICAgICB0aGlzLnZ5ID0geTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHNldEFuZ2xlOiBmdW5jdGlvbihkZWdyZWUsIHNwZWVkKSB7XG4gICAgICAgIHZhciByYWQgPSBkZWdyZWUgKiB0b1JhZDtcbiAgICAgICAgdGhpcy52eCA9IE1hdGguY29zKHJhZCkgKiBzcGVlZDtcbiAgICAgICAgdGhpcy52eSA9IE1hdGguc2luKHJhZCkgKiBzcGVlZDtcbiAgICB9LFxufVxuIiwiLypcbiAqICBFbmVteURhdGFCb3NzXzEuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vKlxuICpcbiAqICDvvJHpnaLkuK3jg5zjgrlcbiAqICDoo4XnlLLovLjpgIHliJfou4rjgIzjg4jjg7zjg6vjg4/jg7Pjg57jg7zjgI1cbiAqXG4gKi9cbmVuZW15RGF0YVsnVGhvckhhbW1lciddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IFwiVGhvckhhbW1lclwiLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDk4LFxuICAgIGhlaWdodDogMTk2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDMwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAxMDAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTE9XRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX01CT1NTLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9CT1NTLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiA5NixcbiAgICB0ZXhIZWlnaHQ6IDE5MixcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogMCxcbiAgICB0ZXhUcmltV2lkdGg6IDE5MixcbiAgICB0ZXhUcmltSGVpZ2h0OiAxOTIsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMucGhhc2UgPSAwO1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNNdXRla2kgPSB0cnVlO1xuICAgICAgICB0aGlzLmlzR3JvdW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIC8v5Yid6YCfXG4gICAgICAgIHRoaXMudnkgPSAtODtcbiAgICB9LFxuXG4gICAgZXB1aXBtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/noLLlj7DoqK3nva5cbiAgICAgICAgdGhpcy50dXJyZXQgPSBFbmVteShcIlRob3JIYW1tZXJUdXJyZXRcIilcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMucGFyZW50U2NlbmUpXG4gICAgICAgICAgICAuc2V0UGFyZW50RW5lbXkodGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMucGhhc2UgPT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMueSA8IC1TQ19IKjAuNSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgICAgICB0aGlzLnZ5ID0gLTU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc011dGVraSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIC50byh7dnk6IC0xMH0sIDI0MClcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdW1lRGFubWFrdSgpO1xuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDIpIHtcbiAgICAgICAgICAgIHRoaXMudHVycmV0LmZsYXJlKCdzdGFydGZpcmUnKTtcbiAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5Zyf54WZ5Ye644GZ44KIXG4gICAgICAgIGlmICghdGhpcy5pc0RlYWQpIHtcbiAgICAgICAgICAgIHZhciB2eSA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kLmRlbHRhWTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxheWVyID0gdGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllckxvd2VyO1xuICAgICAgICAgICAgICAgIGxheWVyLmVudGVyU21va2Uoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueC0zMityYW5kKDAsNjQpLCB5OiB0aGlzLnl9LFxuICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IDAsIHk6IHZ5LCBkZWNheTogMX0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiByYW5kKDAsIDIpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+OCv+OCpOODoOOCouODg+ODl+OBp+mAg+i1sO+8iO+8ke+8l+enku+8iVxuICAgICAgICBpZiAoIXRoaXMuaXNEZWFkICYmIHRoaXMudGltZSA9PSAxMDIwKSB7XG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC50byh7dnk6IC0xNX0sIDEyMCwgXCJlYXNlSW5TaW5lXCIpXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5mbGFyZSgnZW5kX2Jvc3MnKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAgICAgLndhaXQoNjApXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueSArPSB0aGlzLnZ5O1xuLy8gICAgICAgIHRoaXMueSAtPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZC5kZWx0YVk7XG4gICAgfSxcblxuICAgIGRlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnR1cnJldC5kZWFkKCk7XG4gICAgICAgIHRoaXMudHVycmV0LnJlbW92ZSgpO1xuICAgICAgICB0aGlzLnRleEluZGV4Kys7XG5cbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzRGVhZCA9IHRydWU7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpO1xuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgdGhpcy5leHBsb2RlKCk7XG4gICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlTGFyZ2VcIik7XG5cbiAgICAgICAgLy/lvL7mtojjgZdcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lcmFzZUJ1bGxldCgpO1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLnRpbWVWYW5pc2ggPSAxODA7XG5cbiAgICAgICAgLy/noLTlo4rmmYLmtojljrvjgqTjg7Pjgr/jg7zjg5Djg6tcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC50byh7dnk6IC04fSwgMTgwLCBcImVhc2VJblNpbmVcIilcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9kZSgpO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlQm9zc1wiKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGFkb3cudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcy5zaGFkb3cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG59O1xuXG4vL+egsuWPsFxuZW5lbXlEYXRhWydUaG9ySGFtbWVyVHVycmV0J10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXjg5Hjgr/jg7zjg7NcbiAgICBkYW5tYWt1TmFtZTogXCJUaG9ySGFtbWVyVHVycmV0XCIsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgNjQsXG4gICAgaGVpZ2h0OiA2NCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiA1MDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9CT1NTX0VRVUlQLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9TTUFMTCxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXhfYm9zczFcIixcbiAgICB0ZXhXaWR0aDogMzIsXG4gICAgdGV4SGVpZ2h0OiAzMixcbiAgICB0ZXhUcmltWDogNDE2LFxuICAgIHRleFRyaW1ZOiAxMjgsXG4gICAgdGV4VHJpbVdpZHRoOiAzMixcbiAgICB0ZXhUcmltSGVpZ2h0OiAzMixcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzTXV0ZWtpID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIHRoaXMub24oJ3N0YXJ0ZmlyZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMucmVzdW1lRGFubWFrdSgpO1xuICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCA9IHRoaXMucGFyZW50RW5lbXkueDtcbiAgICAgICAgdGhpcy55ID0gdGhpcy5wYXJlbnRFbmVteS55LTQwO1xuICAgICAgICB0aGlzLmxvb2tBdCgpO1xuICAgIH0sXG59O1xuXG4vKlxuICpcbiAqICDvvJHpnaLjg5zjgrlcbiAqICDlsYDlnLDliLblnKflnovlt6jlpKfmiKbou4rjgIzjgrTjg6rjgqLjg4bjgI1cbiAqXG4gKi9cbi8v5pys5L2TXG5lbmVteURhdGFbJ0dvbHlhdCddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IFtcIkdvbHlhdDFfMVwiLCBcIkdvbHlhdDFfMlwiLCBcIkdvbHlhdDFfM1wiLCBcIkdvbHlhdDJcIl0sXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgNTIsXG4gICAgaGVpZ2h0OiA2MCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiA1MDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMzAwMDAwLFxuXG4gICAgLy/ooajnpLrjg6zjgqTjg6Tjg7znlarlj7dcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9CT1NTLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9CT1NTLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiA1MixcbiAgICB0ZXhIZWlnaHQ6IDE4NCxcbiAgICB0ZXhUcmltWDogMjU4LFxuICAgIHRleFRyaW1ZOiAwLFxuICAgIHRleFRyaW1XaWR0aDogNTIsXG4gICAgdGV4VHJpbUhlaWdodDogMTg0LFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzR3JvdW5kID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc0hvdmVyID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pc1Ntb2tlID0gdHJ1ZTtcblxuICAgICAgICAvL+eZuueLguODouODvOODieODleODqeOCsFxuICAgICAgICB0aGlzLmlzU3RhbXBlZGUgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIC8v44Oc44OH44Kj44Kr44OQ44O8XG4gICAgICAgIHRoaXMuY292ZXIgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMVwiLCA2NCwgODApXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMzgyLCAwLCA2NCwgODApXG4gICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKC0yLCAtMTgpO1xuICAgICAgICB0aGlzLmNvdmVyLnRleENvbG9yID0gXCJcIjtcbiAgICAgICAgdGhpcy5jb3Zlci51cGRhdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXhDb2xvciAhPT0gdGhhdC50ZXhDb2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW1hZ2UoXCJ0ZXhfYm9zczFcIit0aGF0LnRleENvbG9yLCA2NCwgODApO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RnJhbWVUcmltbWluZygzODIsIDAsIDY0LCA4MCkuc2V0RnJhbWVJbmRleCgwKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRleENvbG9yID0gdGhhdC50ZXhDb2xvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAvL+S4reW/g+mDqFxuICAgICAgICB0aGlzLmNvcmUgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMVwiLCAxNiwgMTYpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMzg0LCA5NiwgNjQsIDE2KVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigwLCAtOCk7XG4gICAgICAgIHRoaXMuY29yZS50ZXhDb2xvciA9IFwiXCI7XG4gICAgICAgIHRoaXMuY29yZS5pZHggPSAwO1xuICAgICAgICB0aGlzLmNvcmUudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMudGV4Q29sb3IgIT09IHRoYXQudGV4Q29sb3IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEltYWdlKFwidGV4X2Jvc3MxXCIrdGhhdC50ZXhDb2xvciwgMTYsIDE2KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZyYW1lVHJpbW1pbmcoMzg0LCA5NiwgNjQsIDE2KS5zZXRGcmFtZUluZGV4KDApO1xuICAgICAgICAgICAgICAgIHRoaXMudGV4Q29sb3IgPSB0aGF0LnRleENvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gdGhpcy5pZHggfCAwO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmNvcmUudHdlZW5lci5jbGVhcigpLnNldFVwZGF0ZVR5cGUoXCJmcHNcIik7XG5cbiAgICAgICAgdGhpcy5vbignZGVhZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5jb3Zlci5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMuY29yZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLm9uKCdidWxsZXRzdGFydCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuY29yZS50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogM30sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignYnVsbGV0ZW5kJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5jb3JlLnR3ZWVuZXIuY2xlYXIoKS50byh7aWR4OiAwfSwgMTUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v55m654uC44Oi44O844OJXG4gICAgICAgIHRoaXMub24oJ3N0YW1wZWRlJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5pc1N0YW1wZWRlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYW5tYWt1KHRoaXMuZGFubWFrdU5hbWVbM10pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v5by+5bmV77yR44K744OD44OI57WC5LqGXG4gICAgICAgIHRoaXMuZGFubWFrdU51bWJlciA9IDA7XG4gICAgICAgIHRoaXMub24oJ2J1bGxldGZpbmlzaCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGFubWFrdU51bWJlciA9ICh0aGlzLmRhbm1ha3VOdW1iZXIrMSklMztcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYW5tYWt1KHRoaXMuZGFubWFrdU5hbWVbdGhpcy5kYW5tYWt1TnVtYmVyXSk7XG5cbiAgICAgICAgICAgIC8v44Ki44O844Og5YG05by+5bmV6Kit5a6a5YiH5pu/XG4gICAgICAgICAgICB0aGlzLmFybUwuc3RhcnREYW5tYWt1KHRoaXMuYXJtTC5kYW5tYWt1TmFtZVt0aGlzLmRhbm1ha3VOdW1iZXJdKTtcbiAgICAgICAgICAgIHRoaXMuYXJtUi5zdGFydERhbm1ha3UodGhpcy5hcm1SLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v44Ki44O844Og44OZ44O844K55bemXG4gICAgICAgIHRoaXMuYXJtYmFzZUwgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMVwiLCA2NiwgMTg0KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRGcmFtZVRyaW1taW5nKDE5MiwgMCwgNjYsIDE4NClcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oLTU5LCAwKTtcbiAgICAgICAgdGhpcy5hcm1iYXNlTC51cGRhdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXhDb2xvciAhPT0gdGhhdC50ZXhDb2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW1hZ2UoXCJ0ZXhfYm9zczFcIit0aGF0LnRleENvbG9yLCA2NiwgMTg0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZyYW1lVHJpbW1pbmcoMTkyLCAwLCA2NiwgMTg0KS5zZXRGcmFtZUluZGV4KDApO1xuICAgICAgICAgICAgICAgIHRoaXMudGV4Q29sb3IgPSB0aGF0LnRleENvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvL+OCouODvOODoOODmeODvOOCueWPs1xuICAgICAgICB0aGlzLmFybWJhc2VSID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFcIiwgNjYsIDE4NClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygzMTAsIDAsIDY2LCAxODQpXG4gICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDU5LCAwKTtcbiAgICAgICAgdGhpcy5hcm1iYXNlUi51cGRhdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50ZXhDb2xvciAhPT0gdGhhdC50ZXhDb2xvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW1hZ2UoXCJ0ZXhfYm9zczFcIit0aGF0LnRleENvbG9yLCA2NiwgMTg0KTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldEZyYW1lVHJpbW1pbmcoMzEwLCAwLCA2NiwgMTg0KS5zZXRGcmFtZUluZGV4KDApO1xuICAgICAgICAgICAgICAgIHRoaXMudGV4Q29sb3IgPSB0aGF0LnRleENvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIC8v55m75aC044OR44K/44O844OzXG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAubW92ZVRvKFNDX1cqMC41LCBTQ19IKjAuMywgMzAwLCBcImVhc2VPdXRTaW5lXCIpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VtZURhbm1ha3UoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcblxuICAgIGVwdWlwbWVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcyA9IHRoaXMucGFyZW50U2NlbmU7XG4gICAgICAgIC8v44Ki44O844Og5bemXG4gICAgICAgIHRoaXMuYXJtTCA9IHBzLmVudGVyRW5lbXkoXCJHb2x5YXRBcm1cIiwgMCwgMCkuc2V0UGFyZW50RW5lbXkodGhpcyk7XG4gICAgICAgIHRoaXMuYXJtTC4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG9mZnNldFg6IC01MixcbiAgICAgICAgICAgIG9mZnNldFk6IDgsXG4gICAgICAgIH0pO1xuICAgICAgICAvL+OCouODvOODoOWPs1xuICAgICAgICB0aGlzLmFybVIgPSBwcy5lbnRlckVuZW15KFwiR29seWF0QXJtXCIsIDAsIDApLnNldFBhcmVudEVuZW15KHRoaXMpO1xuICAgICAgICB0aGlzLmFybVIuJGV4dGVuZCh7XG4gICAgICAgICAgICBvZmZzZXRYOiA1MixcbiAgICAgICAgICAgIG9mZnNldFk6IDgsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8v44Ki44O844Og5beu5YuV55SoXG4gICAgICAgIHRoaXMuYXJtTC52aWJYID0gMDtcbiAgICAgICAgdGhpcy5hcm1MLnZpYlkgPSAwXG4gICAgICAgIHRoaXMuYXJtUi52aWJYID0gMDtcbiAgICAgICAgdGhpcy5hcm1SLnZpYlkgPSAwO1xuXG4gICAgICAgIC8v44Km44Kj44Oz44Kw5bemXG4gICAgICAgIHRoaXMud2luZ0wgPSBwcy5lbnRlckVuZW15KFwiR29seWF0V2luZ1wiLCAwLCAwKS5zZXRQYXJlbnRFbmVteSh0aGlzLmFybUwpO1xuICAgICAgICB0aGlzLndpbmdMLiRleHRlbmQoe1xuICAgICAgICAgICAgb2Zmc2V0WDogLTMxLFxuICAgICAgICAgICAgb2Zmc2V0WTogMyxcbiAgICAgICAgfSk7XG4gICAgICAgIC8v44Km44Kj44Oz44Kw5Y+zXG4gICAgICAgIHRoaXMud2luZ1IgPSBwcy5lbnRlckVuZW15KFwiR29seWF0V2luZ1wiLCAwLCAwKS5zZXRQYXJlbnRFbmVteSh0aGlzLmFybVIpO1xuICAgICAgICB0aGlzLndpbmdSLnRleEluZGV4ID0gMTtcbiAgICAgICAgdGhpcy53aW5nUi4kZXh0ZW5kKHtcbiAgICAgICAgICAgIG9mZnNldFg6IDMxLFxuICAgICAgICAgICAgb2Zmc2V0WTogMyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5yYWQgPSBNYXRoLlBJKjAuNTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/ooYzli5Xplovlp4tcbiAgICAgICAgaWYgKHRoaXMucGhhc2UgPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IHRydWU7XG5cbiAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgICAgIHRoaXMucmVzdW1lRGFubWFrdSgpO1xuXG4gICAgICAgICAgICB0aGlzLmFybUwuZmxhcmUoJ3N0YXJ0ZmlyZScpO1xuICAgICAgICAgICAgdGhpcy5hcm1SLmZsYXJlKCdzdGFydGZpcmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5bem5Y+z44Gr5YuV44GPXG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDIpIHtcbiAgICAgICAgICAgIHRoaXMueCA9IE1hdGguY29zKHRoaXMucmFkKSpTQ19XKjAuMitTQ19XKjAuNTtcbi8vICAgICAgICAgICAgdGhpcy55ID0gTWF0aC5zaW4odGhpcy5yYWQqMikvMjtcbiAgICAgICAgICAgIHRoaXMucmFkIC09IDAuMDFcbiAgICAgICAgfVxuXG4gICAgICAgIC8v55S76Z2i5Lit5aSu44Gr5oi744KLXG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDMpIHtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci50byh7eDogU0NfVyowLjV9LCAxODAsIFwiZWFzZUluT3V0U2luZVwiKTtcbiAgICAgICAgICAgIHRoaXMucGhhc2UrKztcbiAgICAgICAgfVxuXG4gICAgICAgIC8v5Zyf54WZ5Ye644GZ44KIXG4gICAgICAgIGlmICh0aGlzLmlzU21va2UpIHtcbiAgICAgICAgICAgIHZhciB2eSA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kLmRlbHRhWTtcbiAgICAgICAgICAgIHZhciByYWQgPSB0aGlzLnJvdGF0aW9uKnRvUmFkO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLnBhcmVudFNjZW5lLmVmZmVjdExheWVyTG93ZXI7XG5cbiAgICAgICAgICAgICAgICB2YXIgeCA9IC03NityYW5kKDAsIDQwKTtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IDgwLXJhbmQoMCwgMTAwKTtcbiAgICAgICAgICAgICAgICB2YXIgcnggPSB0aGlzLnggKyB4O1xuICAgICAgICAgICAgICAgIHZhciByeSA9IHRoaXMueSArIHk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucm90YXRpb24gIT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByeCA9IHRoaXMueCArIE1hdGguY29zKHJhZCkqeCAtIE1hdGguc2luKHJhZCkqeTtcbiAgICAgICAgICAgICAgICAgICAgcnkgPSB0aGlzLnkgKyBNYXRoLnNpbihyYWQpKnggKyBNYXRoLmNvcyhyYWQpKnk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGxheWVyLmVudGVyU21va2Uoe1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHJ4LCB5OiByeX0sXG4gICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogcmFuZCgtMSwgMSksIHk6IHZ5LCBkZWNheTogMX0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiByYW5kKDAsIDIpXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgeCA9IDQwK3JhbmQoMCwgNDApO1xuICAgICAgICAgICAgICAgIHZhciB5ID0gODAtcmFuZCgwLCAxMDApO1xuICAgICAgICAgICAgICAgIHZhciByeCA9IHRoaXMueCArIHg7XG4gICAgICAgICAgICAgICAgdmFyIHJ5ID0gdGhpcy55ICsgeTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yb3RhdGlvbiAhPSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ4ID0gdGhpcy54ICsgTWF0aC5jb3MocmFkKSp4IC0gTWF0aC5zaW4ocmFkKSp5O1xuICAgICAgICAgICAgICAgICAgICByeSA9IHRoaXMueSArIE1hdGguc2luKHJhZCkqeCArIE1hdGguY29zKHJhZCkqeTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbGF5ZXIuZW50ZXJTbW9rZSh7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogcngsIHk6IHJ5fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiByYW5kKC0xLCAxKSwgeTogdnksIGRlY2F5OiAxfSxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IHJhbmQoMCwgMilcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Ki44O844Og56C05aOK5pmC54iG55m6XG4gICAgICAgIGlmICh0aGlzLnRpbWUgJSA2MCA9PSAwKSB7XG4gICAgICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5wYXJlbnRTY2VuZS5ncm91bmQ7XG4gICAgICAgICAgICB2YXIgdnggPSB0aGlzLngtdGhpcy5iZWZvcmVYK2dyb3VuZC5kZWx0YVg7XG4gICAgICAgICAgICB2YXIgdnkgPSB0aGlzLnktdGhpcy5iZWZvcmVZK2dyb3VuZC5kZWx0YVk7XG4gICAgICAgICAgICBpZiAodGhpcy5hcm1MLmRlZiA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHggPSB0aGlzLngrcmFuZCgtMzMsIDMzKS02NDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMueStyYW5kKC05MiwgOTIpO1xuICAgICAgICAgICAgICAgIHZhciBkZWxheSA9IHJhbmQoMCwgMzApO1xuICAgICAgICAgICAgICAgIEVmZmVjdC5lbnRlckV4cGxvZGUodGhpcy5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyLCB7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogeCwgeTogeX0sXG4gICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5LCBkZWNheTogMC45NX0sXG4gICAgICAgICAgICAgICAgICAgIGRlbGF5OiBkZWxheSxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmFybVIuZGVmID09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMueCtyYW5kKC0zMywgMzMpKzY0O1xuICAgICAgICAgICAgICAgIHZhciB5ID0gdGhpcy55K3JhbmQoLTkyLCA5Mik7XG4gICAgICAgICAgICAgICAgdmFyIGRlbGF5ID0gcmFuZCgwLCAzMCk7XG4gICAgICAgICAgICAgICAgRWZmZWN0LmVudGVyRXhwbG9kZSh0aGlzLnBhcmVudFNjZW5lLmVmZmVjdExheWVyVXBwZXIsIHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB4LCB5OiB5fSxcbiAgICAgICAgICAgICAgICAgICAgdmVsb2NpdHk6IHt4OiB2eCwgeTogdnksIGRlY2F5OiAwLjk1fSxcbiAgICAgICAgICAgICAgICAgICAgZGVsYXk6IGRlbGF5LFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8v44Ki44O844Og56C05aOKXG4gICAgZGVhZENoaWxkOiBmdW5jdGlvbihjaGlsZCkge1xuICAgICAgICB0aGlzLnBoYXNlID0gOTtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcbiAgICAgICAgdGhpcy5hcm1MLnN0b3BEYW5tYWt1KCk7XG4gICAgICAgIHRoaXMuYXJtUi5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIC8v5by+5raI44GXXG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUuZXJhc2VCdWxsZXQoKTtcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS50aW1lVmFuaXNoID0gNjA7XG5cbiAgICAgICAgLy/jgqLjg7zjg6DnoLTlo4rmmYLjgqLjgq/jgrfjg6fjg7NcbiAgICAgICAgdmFyIGJ4ID0gTWF0aC5jb3ModGhpcy5yYWQpKlNDX1cqMC4yK1NDX1cqMC41O1xuICAgICAgICB2YXIgYnkgPSB0aGlzLnk7XG4gICAgICAgIHZhciByb3QgPSBjaGlsZCA9PSB0aGlzLmFybUw/IDIwOiAtMjA7XG4gICAgICAgIHZhciBheCA9IGNoaWxkID09IHRoaXMuYXJtTD8gMzA6IC0zMDtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC50byh7eDogdGhpcy54K2F4LCByb3RhdGlvbjogcm90fSwgMzAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgLndhaXQoNjApXG4gICAgICAgICAgICAudG8oe3g6IGJ4LCB5OiBieSwgcm90YXRpb246IDB9LCAxODAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5waGFzZSA9IDI7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJlc3VtZURhbm1ha3UoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFybUwucmVzdW1lRGFubWFrdSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXJtUi5yZXN1bWVEYW5tYWt1KCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v6IOM5pmv44K544Kv44Ot44O844Or5Yi25b6hXG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLnRvKHtzcGVlZDogLTEuMH0sIDMwLCBcImVhc2VJbk91dEN1YmljXCIpXG4gICAgICAgICAgICAud2FpdCg5MClcbiAgICAgICAgICAgIC50byh7c3BlZWQ6IC03LjB9LCA2MCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcblxuICAgICAgICAvL+S4oeaWueOBruOCouODvOODoOOBjOegtOWjiuOBleOCjOOBn+WgtOWQiOOAgeeZuueLguODouODvOODieOBuOenu+ihjFxuICAgICAgICBpZiAoIXRoaXMuaXNTdGFtcGVkZSAmJiB0aGlzLmFybUwuZGVmID09IDAgJiYgdGhpcy5hcm1SLmRlZiA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmZsYXJlKCdzdGFtcGVkZScpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICAgICAgYXBwLnBsYXlTRShcImV4cGxvZGVMYXJnZVwiKTtcblxuICAgICAgICAvL+W8vua2iOOBl1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgIHRoaXMucGFyZW50U2NlbmUudGltZVZhbmlzaCA9IDE4MDtcblxuICAgICAgICAvL+egtOWjiuaZgua2iOWOu+OCpOODs+OCv+ODvOODkOODq1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLm1vdmVCeSgwLCAtNTAsIDMwMClcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwbG9kZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUubWFza1doaXRlLnR3ZWVuZXIuY2xlYXIoKS5mYWRlSW4oNDUpLmZhZGVPdXQoNDUpO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJleHBsb2RlQm9zc1wiKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaGFkb3cudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcy5zaGFkb3cpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudG8oe2FscGhhOiAwfSwgMTUpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxufTtcblxuLy/jgqLjg7zjg6BcbmVuZW15RGF0YVsnR29seWF0QXJtJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXjg5Hjgr/jg7zjg7NcbiAgICBkYW5tYWt1TmFtZTogW1wiR29seWF0QXJtMVwiLCBcIkdvbHlhdEFybTJcIiwgXCJHb2x5YXRBcm0zXCJdLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDU2LFxuICAgIGhlaWdodDogMjAwLFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDEwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiA1MDAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9MT1dFUixcblxuICAgIC8v5pW144K/44Kk44OXXG4gICAgdHlwZTogRU5FTVlfQk9TU19FUVVJUCxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfTEFSR0UsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4X2Jvc3MxXCIsXG4gICAgdGV4V2lkdGg6IDUyLFxuICAgIHRleEhlaWdodDogMjAwLFxuICAgIHRleFRyaW1YOiA0NTAsXG4gICAgdGV4VHJpbVk6IDAsXG4gICAgdGV4VHJpbVdpZHRoOiA1MixcbiAgICB0ZXhUcmltSGVpZ2h0OiAyMDAsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0dyb3VuZCA9IHRydWU7XG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICAvL+egsuWPsO+8kVxuICAgICAgICB0aGlzLnR1cnJldDEgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMVwiLCA0OCwgNDgpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMCwgMTkyLCAxNDQsIDQ4KVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigwLCAzMik7XG4gICAgICAgIHRoaXMudHVycmV0MS5pZHggPSAwO1xuICAgICAgICB0aGlzLnR1cnJldDEudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lSW5kZXggPSB0aGlzLmlkeCB8IDA7XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMudHVycmV0MS50d2VlbmVyLmNsZWFyKCkuc2V0VXBkYXRlVHlwZShcImZwc1wiKTtcblxuICAgICAgICAvL+egsuWPsO+8klxuICAgICAgICB0aGlzLnR1cnJldDIgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMVwiLCA0OCwgNDgpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMCwgMTkyLCAxNDQsIDQ4KVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigwLCAtMzIpO1xuICAgICAgICB0aGlzLnR1cnJldDIuaWR4ID0gMDtcbiAgICAgICAgdGhpcy50dXJyZXQyLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gdGhpcy5pZHggfCAwO1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLnR1cnJldDIudHdlZW5lci5jbGVhcigpLnNldFVwZGF0ZVR5cGUoXCJmcHNcIik7XG5cbiAgICAgICAgLy/noLLlj7DvvJHplovplolcbiAgICAgICAgdGhpcy5vbignYnVsbGV0c3RhcnQxJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy50dXJyZXQxLnR3ZWVuZXIuY2xlYXIoKS50byh7aWR4OiAyfSwgMTUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm9uKCdidWxsZXRlbmQxJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy50dXJyZXQxLnR3ZWVuZXIuY2xlYXIoKS50byh7aWR4OiAwfSwgMTUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIC8v56Cy5Y+w77yS6ZaL6ZaJXG4gICAgICAgIHRoaXMub24oJ2J1bGxldHN0YXJ0MicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMudHVycmV0Mi50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogMn0sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignYnVsbGV0ZW5kMicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMudHVycmV0Mi50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogMH0sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL0J1bGxldE1M5aeL5YuVXG4gICAgICAgIHRoaXMub24oJ3N0YXJ0ZmlyZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5yZXN1bWVEYW5tYWt1KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/oqpjlsI7lvL7nmbrlsIRcbiAgICAgICAgdGhpcy5vbignYnVsbGV0bWlzc2lsZTEnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJFbmVteShcIk1lZHVzYVwiLCB0aGlzLngsIHRoaXMueS00MCkuc2V0SG9taW5nKHRydWUpLnNldFZlbG9jaXR5KC0wLjUsIC0xLjApO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbnRlckVuZW15KFwiTWVkdXNhXCIsIHRoaXMueCwgdGhpcy55LTQwKS5zZXRIb21pbmcodHJ1ZSkuc2V0VmVsb2NpdHkoIDAuMCwgLTEuMCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyRW5lbXkoXCJNZWR1c2FcIiwgdGhpcy54LCB0aGlzLnktNDApLnNldEhvbWluZyh0cnVlKS5zZXRWZWxvY2l0eSggMC41LCAtMS4wKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignYnVsbGV0bWlzc2lsZTInLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJFbmVteShcIk1lZHVzYVwiLCB0aGlzLngsIHRoaXMueSsyMCkuc2V0SG9taW5nKHRydWUpLnNldFZlbG9jaXR5KC0wLjUsIC0xLjApO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbnRlckVuZW15KFwiTWVkdXNhXCIsIHRoaXMueCwgdGhpcy55KzIwKS5zZXRIb21pbmcodHJ1ZSkuc2V0VmVsb2NpdHkoIDAuMCwgLTEuMCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyRW5lbXkoXCJNZWR1c2FcIiwgdGhpcy54LCB0aGlzLnkrMjApLnNldEhvbWluZyh0cnVlKS5zZXRWZWxvY2l0eSggMC41LCAtMS4wKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/opqrjgqrjg5bjgrjjgqfjgq/jg4jjga7lm57ou6LjgavjgojjgovkvY3nva7oo5zmraNcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHRoaXMucGFyZW50RW5lbXkucm90YXRpb247XG4gICAgICAgIHZhciBvZmZzZXRYID0gdGhpcy5vZmZzZXRYO1xuICAgICAgICB2YXIgb2Zmc2V0WSA9IHRoaXMub2Zmc2V0WTtcbiAgICAgICAgaWYgKHRoaXMucm90YXRpb24gIT0gMCkge1xuICAgICAgICAgICAgdmFyIHJhZCA9IHRoaXMucm90YXRpb24qdG9SYWQ7XG4gICAgICAgICAgICBvZmZzZXRYID0gTWF0aC5jb3MocmFkKSp0aGlzLm9mZnNldFgtTWF0aC5zaW4ocmFkKSp0aGlzLm9mZnNldFk7XG4gICAgICAgICAgICBvZmZzZXRZID0gTWF0aC5zaW4ocmFkKSp0aGlzLm9mZnNldFgrTWF0aC5jb3MocmFkKSp0aGlzLm9mZnNldFk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy54ID0gdGhpcy5wYXJlbnRFbmVteS54K29mZnNldFg7XG4gICAgICAgIHRoaXMueSA9IHRoaXMucGFyZW50RW5lbXkueStvZmZzZXRZO1xuXG4gICAgICAgIC8v5Yik5a6a5pyJ54Sh44Gv6Kaq44Gr44GC44KP44Gb44KLXG4gICAgICAgIGlmICh0aGlzLmRlZiA+IDApIHRoaXMuaXNDb2xsaXNpb24gPSB0aGlzLnBhcmVudEVuZW15LmlzQ29sbGlzaW9uO1xuICAgIH0sXG59O1xuXG4vL+OCpuOCo+ODs+OCsFxuZW5lbXlEYXRhWydHb2x5YXRXaW5nJ10gPSB7XG4gICAgLy/kvb/nlKjlvL7luZXjg5Hjgr/jg7zjg7NcbiAgICBkYW5tYWt1TmFtZTogXCJcIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICAxNixcbiAgICBoZWlnaHQ6IDExMixcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiA1MDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAxMDAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTE9XRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX0JPU1NfRVFVSVAsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX0xBUkdFLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiAxNixcbiAgICB0ZXhIZWlnaHQ6IDExMixcbiAgICB0ZXhUcmltWDogMzg0LFxuICAgIHRleFRyaW1ZOiAxMjgsXG4gICAgdGV4VHJpbVdpZHRoOiAzMixcbiAgICB0ZXhUcmltSGVpZ2h0OiAxMTIsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMub2Zmc2V0WCA9IDA7XG4gICAgICAgIHRoaXMub2Zmc2V0WSA9IDA7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v6Kaq44Kq44OW44K444Kn44Kv44OI44Gu5Zue6Lui44Gr44KI44KL5L2N572u6KOc5q2jXG4gICAgICAgIHRoaXMucm90YXRpb24gPSB0aGlzLnBhcmVudEVuZW15LnJvdGF0aW9uO1xuICAgICAgICB2YXIgb2Zmc2V0WCA9IHRoaXMub2Zmc2V0WDtcbiAgICAgICAgdmFyIG9mZnNldFkgPSB0aGlzLm9mZnNldFk7XG4gICAgICAgIGlmICh0aGlzLnJvdGF0aW9uICE9IDApIHtcbiAgICAgICAgICAgIHZhciByYWQgPSB0aGlzLnJvdGF0aW9uKnRvUmFkO1xuICAgICAgICAgICAgb2Zmc2V0WCA9IE1hdGguY29zKHJhZCkqdGhpcy5vZmZzZXRYLU1hdGguc2luKHJhZCkqdGhpcy5vZmZzZXRZO1xuICAgICAgICAgICAgb2Zmc2V0WSA9IE1hdGguc2luKHJhZCkqdGhpcy5vZmZzZXRYK01hdGguY29zKHJhZCkqdGhpcy5vZmZzZXRZO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMueCA9IHRoaXMucGFyZW50RW5lbXkueCtvZmZzZXRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnBhcmVudEVuZW15Lnkrb2Zmc2V0WTtcblxuICAgICAgICAvL+imquOBruiAkOS5heW6puOBjO+8kOOBp+mZpOWOu1xuICAgICAgICBpZiAodGhpcy5wYXJlbnRFbmVteS5kZWYgPT0gMCkgdGhpcy5yZW1vdmUoKTtcblxuICAgICAgICAvL+WIpOWumuacieeEoeOBr+imquOBq+OBguOCj+OBm+OCi1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gdGhpcy5wYXJlbnRFbmVteS5pc0NvbGxpc2lvbjtcbiAgICB9LFxufTtcblxuIiwiLypcbiAqICBFbmVteURhdGFCb3NzXzIuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vKlxuICpcbiAqICDvvJLpnaLkuK3jg5zjgrkgIFxuICogIOWkp+Wei+eIhuaSg+apn+OAjOODrOOCpOODluODs+OAjVxuICpcbiAqL1xuZW5lbXlEYXRhWydSYXZlbiddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IFwiUmF2ZW5cIixcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA5NixcbiAgICBoZWlnaHQ6IDQwLFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDUwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAyMDAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9NQk9TUyxcblxuICAgIC8v54iG55m644K/44Kk44OXXG4gICAgZXhwbG9kZVR5cGU6IEVYUExPREVfQk9TUyxcblxuICAgIC8v5qmf5L2T55So44OG44Kv44K544OB44Oj5oOF5aCxXG4gICAgdGV4TmFtZTogXCJ0ZXhfYm9zczFcIixcbiAgICB0ZXhXaWR0aDogMTQ0LFxuICAgIHRleEhlaWdodDogNjQsXG4gICAgdGV4VHJpbVg6IDAsXG4gICAgdGV4VHJpbVk6IDI1NixcbiAgICB0ZXhUcmltV2lkdGg6IDE0NCxcbiAgICB0ZXhUcmltSGVpZ2h0OiA2NCxcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5waGFzZSA9IDA7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc011dGVraSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5zdG9wRGFubWFrdSgpO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAvL+egsuWPsFxuICAgICAgICB0aGlzLnR1cnJldCA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4X2Jvc3MxXCIsIDMyLCAzMilcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygxNjAsIDE5MiwgMzIsIDMyKVxuICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgdGhpcy50dXJyZXQudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0YXJnZXQgPSB0aGF0LnBsYXllcjtcblxuICAgICAgICAgICAgLy/jgr/jg7zjgrLjg4Pjg4jjga7mlrnlkJHjgpLlkJHjgY9cbiAgICAgICAgICAgIHZhciBheCA9IHRoYXQueCAtIHRhcmdldC54O1xuICAgICAgICAgICAgdmFyIGF5ID0gdGhhdC55IC0gdGFyZ2V0Lnk7XG4gICAgICAgICAgICB2YXIgcmFkID0gTWF0aC5hdGFuMihheSwgYXgpO1xuICAgICAgICAgICAgdmFyIGRlZyA9IH5+KHJhZCAqIHRvRGVnKTtcbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSBkZWctOTA7XG4gICAgICAgIH07XG5cbi8qXG4gICAgICAgIC8v44Ki44OV44K/44O844OQ44O844OK44O8XG4gICAgICAgIHRoaXMuYnVybmVyID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJ0ZXhfYm9zczFcIiwgMTEyLCAzMilcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygwLCAzMjAsIDExMiwgNjQpXG4gICAgICAgICAgICAuc2V0RnJhbWVJbmRleCgwKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDAsIDMyKTtcbiAgICAgICAgdGhpcy5idXJuZXIudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lSW5kZXgrKztcbiAgICAgICAgfTtcbiovXG4gICAgICAgIHRoaXMucGhhc2UgPSAwO1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLnRvKHt4OiBTQ19XKjAuNSwgeTogU0NfSCowLjI1fSwgMTIwLCBcImVhc2VPdXRDdWJpY1wiKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5waGFzZSsrO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgZXB1aXBtZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/nv7xcbiAgICAgICAgdGhpcy53aW5nTCA9IEVuZW15KFwiUmF2ZW5fd2luZ1wiLCAtNDgsIDAsIDAsIHtmcmFtZUluZGV4OiAwfSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMucGFyZW50U2NlbmUpXG4gICAgICAgICAgICAuc2V0UGFyZW50RW5lbXkodGhpcyk7XG4gICAgICAgIHRoaXMud2luZ1IgPSBFbmVteShcIlJhdmVuX3dpbmdcIiwgNDgsIDAsIDAsIHtmcmFtZUluZGV4OiAxfSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMucGFyZW50U2NlbmUpXG4gICAgICAgICAgICAuc2V0UGFyZW50RW5lbXkodGhpcyk7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDEpIHtcbiAgICAgICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pc011dGVraSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5waGFzZSsrO1xuICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZSk7XG5cbiAgICAgICAgICAgIC8v56e75YuV44OR44K/44O844OzXG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC50byh7eDogU0NfVyowLjh9LCAyNDAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC50byh7eDogU0NfVyowLjJ9LCAyNDAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC5zZXRMb29wKHRydWUpO1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyMiA9IHBoaW5hLmFjY2Vzc29yeS5Ud2VlbmVyKCkuY2xlYXIoKS5zZXRVcGRhdGVUeXBlKCdmcHMnKVxuICAgICAgICAgICAgICAgIC50byh7eTogU0NfSCowLjJ9LCAxODAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC50byh7eTogU0NfSCowLjN9LCAxODAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC5zZXRMb29wKHRydWUpXG4gICAgICAgICAgICAgICAgLmF0dGFjaFRvKHRoaXMpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCk7XG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICAgICAgYXBwLnBsYXlTRShcImV4cGxvZGVMYXJnZVwiKTtcblxuICAgICAgICB0aGlzLnR3ZWVuZXIyLnJlbW92ZSgpO1xuICAgICAgICBwaGluYS5hY2Nlc3NvcnkuVHdlZW5lcigpLmNsZWFyKCkuc2V0VXBkYXRlVHlwZSgnZnBzJylcbiAgICAgICAgICAgIC50byh7cm90YXRpb246IDMwfSwgMzAwKVxuICAgICAgICAgICAgLmF0dGFjaFRvKHRoaXMpO1xuICAgICAgICBwaGluYS5hY2Nlc3NvcnkuVHdlZW5lcigpLmNsZWFyKCkuc2V0VXBkYXRlVHlwZSgnZnBzJylcbiAgICAgICAgICAgIC5ieSh7eDogMn0sIDMpXG4gICAgICAgICAgICAuYnkoe3g6IC0yfSwgMylcbiAgICAgICAgICAgIC5zZXRMb29wKHRydWUpXG4gICAgICAgICAgICAuYXR0YWNoVG8odGhpcyk7XG5cbiAgICAgICAgLy/lvL7mtojjgZdcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lcmFzZUJ1bGxldCgpO1xuICAgICAgICB0aGlzLnBhcmVudFNjZW5lLnRpbWVWYW5pc2ggPSAxODA7XG5cbiAgICAgICAgLy/noLTlo4rmmYLmtojljrvjgqTjg7Pjgr/jg7zjg5Djg6tcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC5tb3ZlQnkoMCwgMTAwLCAzMDApXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGxvZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLm1hc2tXaGl0ZS50d2VlbmVyLmNsZWFyKCkuZmFkZUluKDQ1KS5mYWRlT3V0KDQ1KTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwiZXhwbG9kZUJvc3NcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhZG93KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hhZG93LnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMuc2hhZG93KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnRvKHthbHBoYTogMH0sIDE1KVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn07XG5cbmVuZW15RGF0YVsnUmF2ZW5fd2luZyddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IG51bGwsXG5cbiAgICAvL+W9k+OCiuWIpOWumuOCteOCpOOCulxuICAgIHdpZHRoOiAgNjQsXG4gICAgaGVpZ2h0OiA2NCxcblxuICAgIC8v6ICQ5LmF5YqbXG4gICAgZGVmOiAxMDAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogNTAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTUlERExFLFxuXG4gICAgLy/mlbXjgr/jgqTjg5dcbiAgICB0eXBlOiBFTkVNWV9CT1NTX0VRVUlQLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9NSURETEUsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4X2Jvc3MxXCIsXG4gICAgdGV4V2lkdGg6IDY0LFxuICAgIHRleEhlaWdodDogNjQsXG4gICAgdGV4VHJpbVg6IDE2MCxcbiAgICB0ZXhUcmltWTogMjU2LFxuICAgIHRleFRyaW1XaWR0aDogMTI4LFxuICAgIHRleFRyaW1IZWlnaHQ6IDY0LFxuICAgIHRleEluZGV4OiAwLFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKHBhcmFtKSB7XG4gICAgICAgIHRoaXMudGV4SW5kZXggPSBwYXJhbS5mcmFtZUluZGV4O1xuICAgICAgICB0aGlzLm9mZnNldFggPSB0aGlzLng7XG4gICAgICAgIHRoaXMub2Zmc2V0WSA9IHRoaXMueTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ID0gdGhpcy5wYXJlbnRFbmVteS54ICsgdGhpcy5vZmZzZXRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnBhcmVudEVuZW15LnkgKyB0aGlzLm9mZnNldFk7XG4gICAgfSxcbn07XG5cbi8qXG4gKlxuICogIO+8kumdouODnOOCuVxuICogIOWkp+Wei+i2hemrmOmrmOW6pueIhuaSg+apn+OAjOOCrOODq+ODvOODgOOAjVxuICpcbiAqL1xuZW5lbXlEYXRhWydHYXJ1ZGEnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBbXCJHYXJ1ZGFfMVwiLCBcIkdhcnVkYV8yXCIsIFwiR2FydWRhXzNcIiwgXCJHYXJ1ZGFfNFwiXSxcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICA2NCxcbiAgICBoZWlnaHQ6IDcwLFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDgwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiA0MDAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfVVBQRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX0JPU1MsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX0JPU1MsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4X2Jvc3MxXCIsXG4gICAgdGV4V2lkdGg6IDI5NixcbiAgICB0ZXhIZWlnaHQ6IDgwLFxuICAgIHRleFRyaW1YOiAxMjgsXG4gICAgdGV4VHJpbVk6IDMyMCxcbiAgICB0ZXhUcmltV2lkdGg6IDI5NixcbiAgICB0ZXhUcmltSGVpZ2h0OiAxNjAsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oZW50ZXJQYXJhbSkge1xuICAgICAgICB0aGlzLnBoYXNlID0gMDtcbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzTXV0ZWtpID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hbHBoYSA9IDA7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAuZmFkZUluKDYwKVxuICAgICAgICAgICAgLndhaXQoMTIwKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5waGFzZSsrO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+eZuueLguODouODvOODieODleODqeOCsFxuICAgICAgICB0aGlzLmlzU3RhbXBlZGUgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLnN0b3BEYW5tYWt1KCk7XG5cbiAgICAgICAgLy/lvL7luZXvvJHjgrvjg4Pjg4jntYLkuoZcbiAgICAgICAgdGhpcy5kYW5tYWt1TnVtYmVyID0gMDtcbiAgICAgICAgdGhpcy5vbignYnVsbGV0ZmluaXNoJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5kYW5tYWt1TnVtYmVyID0gKHRoaXMuZGFubWFrdU51bWJlcisxKSUzO1xuICAgICAgICAgICAgdGhpcy5zdGFydERhbm1ha3UodGhpcy5kYW5tYWt1TmFtZVt0aGlzLmRhbm1ha3VOdW1iZXJdKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+eZuueLguODouODvOODiVxuICAgICAgICB0aGlzLm9uKCdzdGFtcGVkZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdGFtcGVkZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGFubWFrdSh0aGlzLmRhbm1ha3VOYW1lWzNdKTtcbiAgICAgICAgICAgIC8v44OP44OD44OB5YG05by+5bmV6Kit5a6a5YiH5pu/XG4gICAgICAgICAgICB0aGlzLmhhdGNoTC5zdGFydERhbm1ha3UodGhpcy5oYXRjaEwuZGFubWFrdU5hbWVbdGhpcy5kYW5tYWt1TnVtYmVyXSk7XG4gICAgICAgICAgICB0aGlzLmhhdGNoUi5zdGFydERhbm1ha3UodGhpcy5oYXRjaFIuZGFubWFrdU5hbWVbdGhpcy5kYW5tYWt1TnVtYmVyXSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/jgqrjg5fjgrfjg6fjg7PmrablmajmipXkuItcbiAgICAgICAgdGhpcy5vbignYnVsbGV0Ym9tYicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJFbmVteShcIkdhcnVkYUJvbWJcIiwgdGhpcy54KzEwMCwgdGhpcy55KzMyKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUuZW50ZXJFbmVteShcIkdhcnVkYUJvbWJcIiwgdGhpcy54LTEwMCwgdGhpcy55KzMyKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+W8vuW5le+8keOCu+ODg+ODiOe1guS6hlxuICAgICAgICB0aGlzLmRhbm1ha3VOdW1iZXIgPSAwO1xuICAgICAgICB0aGlzLm9uKCdidWxsZXRmaW5pc2gnLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLmRhbm1ha3VOdW1iZXIgPSAodGhpcy5kYW5tYWt1TnVtYmVyKzEpJTM7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGFubWFrdSh0aGlzLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuXG4gICAgICAgICAgICAvL+ODj+ODg+ODgeWBtOW8vuW5leioreWumuWIh+abv1xuICAgICAgICAgICAgdGhpcy5oYXRjaEwuc3RhcnREYW5tYWt1KHRoaXMuaGF0Y2hMLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuICAgICAgICAgICAgdGhpcy5oYXRjaFIuc3RhcnREYW5tYWt1KHRoaXMuaGF0Y2hSLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBlcHVpcG1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL+ODj+ODg+ODgVxuICAgICAgICB0aGlzLmhhdGNoTCA9IEVuZW15KFwiR2FydWRhX2hhdGNoXCIsIC02MSwgMiwgMClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMucGFyZW50U2NlbmUpXG4gICAgICAgICAgICAuc2V0UGFyZW50RW5lbXkodGhpcyk7XG4gICAgICAgIHRoaXMuaGF0Y2hSID0gRW5lbXkoXCJHYXJ1ZGFfaGF0Y2hcIiwgIDYyLCAyLCAwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5wYXJlbnRTY2VuZSlcbiAgICAgICAgICAgIC5zZXRQYXJlbnRFbmVteSh0aGlzKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMucGhhc2UgPT0gMSkge1xuICAgICAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmlzTXV0ZWtpID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGFubWFrdSh0aGlzLmRhbm1ha3VOYW1lW3RoaXMuZGFubWFrdU51bWJlcl0pO1xuXG4gICAgICAgICAgICB0aGlzLmhhdGNoTC5pc0NvbGxpc2lvbiA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmhhdGNoUi5pc0NvbGxpc2lvbiA9IHRydWU7XG5cbiAgICAgICAgICAgIC8v56e75YuV44OR44K/44O844OzXG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC50byh7eTogU0NfSCowLjJ9LCAxMjAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC50byh7eTogU0NfSCowLjN9LCAxMjAsIFwiZWFzZUluT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC5zZXRMb29wKHRydWUpO1xuXG4gICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgIH1cblxuICAgICAgICAvL+iAkOS5heWKm+aui+OCiu+8kuWJsuWIh+OBo+OBn+OCieODhuOCr+OCueODgeODo+OCkuWIh+abv1xuICAgICAgICBpZiAodGhpcy50ZXhJbmRleCA9PSAwICYmIHRoaXMuZGVmIDwgdGhpcy5kZWZNYXgqMC4yKSB7XG4gICAgICAgICAgICB0aGlzLnRleEluZGV4ID0gMTtcbiAgICAgICAgICAgIHRoaXMuc2hhZG93LmZyYW1lSW5kZXggPSAxO1xuICAgICAgICAgICAgdGhpcy5leHBsb2RlKDI5NiwgODApO1xuICAgICAgICAgICAgLy/nmbrni4Ljg6Ljg7zjg4nnp7vooYxcbiAgICAgICAgICAgIGlmICghdGhpcy5zdGFtcGVkZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmxhcmUoXCJzdGFtcGVkZVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBkZWFkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIC8v56Cy5Y+w5Lih5pa544Go44KC5q2744KT44Gg44KJ55m654uC44Oi44O844OJ56e76KGMXG4gICAgICAgIGlmICghdGhpcy5zdGFtcGVkZSAmJiB0aGlzLmhhdGNoTC5kZWYgPT0gMCAmJiB0aGlzLmhhdGNoUi5kZWYgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5mbGFyZShcInN0YW1wZWRlXCIpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGRlYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmRlZmF1bHREZWFkQm9zcygyOTYsIDgwKTtcbiAgICB9LFxufTtcblxuZW5lbXlEYXRhWydHYXJ1ZGFfaGF0Y2gnXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBbXCJHYXJ1ZGFfaGF0Y2hfMVwiLCBcIkdhcnVkYV9oYXRjaF8yXCIsIFwiR2FydWRhX2hhdGNoXzNcIiwgXCJHYXJ1ZGFfaGF0Y2hfNFwiXSxcblxuICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgd2lkdGg6ICAxNixcbiAgICBoZWlnaHQ6IDE2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDE1MDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAxMDAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfVVBQRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX0JPU1NfRVFVSVAsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX1NNQUxMLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiAxNixcbiAgICB0ZXhIZWlnaHQ6IDE2LFxuICAgIHRleFRyaW1YOiAwLFxuICAgIHRleFRyaW1ZOiAzODQsXG4gICAgdGV4VHJpbVdpZHRoOiA2NCxcbiAgICB0ZXhUcmltSGVpZ2h0OiAxNixcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbihwYXJhbSkge1xuICAgICAgICB0aGlzLnRleEluZGV4ID0gMDtcbiAgICAgICAgdGhpcy5vZmZzZXRYID0gdGhpcy54O1xuICAgICAgICB0aGlzLm9mZnNldFkgPSB0aGlzLnk7XG5cbiAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMuc3RvcERhbm1ha3UoKTtcblxuICAgICAgICAvL+mWi+mWiVxuICAgICAgICB0aGlzLmlkeCA9IDA7XG4gICAgICAgIHRoaXMub24oJ2J1bGxldHN0YXJ0JywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogM30sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5vbignYnVsbGV0ZW5kJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkudG8oe2lkeDogMH0sIDE1KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ID0gdGhpcy5wYXJlbnRFbmVteS54ICsgdGhpcy5vZmZzZXRYO1xuICAgICAgICB0aGlzLnkgPSB0aGlzLnBhcmVudEVuZW15LnkgKyB0aGlzLm9mZnNldFk7XG4gICAgICAgIHRoaXMudGV4SW5kZXggPSBNYXRoLmZsb29yKHRoaXMuaWR4KTtcbiAgICB9LFxufTtcblxuLypcbiAqICDjg5zjgrnjgqrjg5fjgrfjg6fjg7PjgIxHYXJ1ZGFCb21i44CNXG4gKi9cbmVuZW15RGF0YVsnR2FydWRhQm9tYiddID0ge1xuICAgIC8v5L2/55So5by+5bmV5ZCNXG4gICAgZGFubWFrdU5hbWU6IFwiR2FydWRhQm9tYlwiLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDIwLFxuICAgIGhlaWdodDogMzAsXG5cbiAgICAvL+iAkOS5heWKm1xuICAgIGRlZjogMzAwLFxuXG4gICAgLy/lvpfngrlcbiAgICBwb2ludDogMjAwMCxcblxuICAgIC8v6KGo56S644Os44Kk44Ok44O855Wq5Y+3XG4gICAgbGF5ZXI6IExBWUVSX09CSkVDVF9NSURETEUsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX1NNQUxMLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9NSURETEUsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4MVwiLFxuICAgIHRleFdpZHRoOiAzMixcbiAgICB0ZXhIZWlnaHQ6IDQ4LFxuICAgIHRleEluZGV4OiAwLFxuICAgIHRleFRyaW1YOiAxOTIsXG4gICAgdGV4VHJpbVk6IDI1NixcbiAgICB0ZXhUcmltV2lkdGg6IDY0LFxuICAgIHRleFRyaW1IZWlnaHQ6IDQ4LFxuXG4gICAgc2V0dXA6IGZ1bmN0aW9uKGVudGVyUGFyYW0pIHtcbiAgICAgICAgdGhpcy52eSA9IDA7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnRvKHt2eTogM30sIDE4MCwgXCJlYXNlT3V0U2luZVwiKTtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbihlKSB7XG4gICAgICAgIHRoaXMueSArPSB0aGlzLnZ5O1xuICAgIH0sXG59O1xuIiwiLypcbiAqICBFbmVteURhdGFCb3NzXzMuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG4vKlxuICpcbiAqICDvvJPpnaLkuK3jg5zjgrlcbiAqICDjgIzjg6Ljg7zjg7Pjg5bjg6zjgqTjg4njgI1cbiAqXG4gKi9cbmVuZW15RGF0YVsnTW91cm5CbGFkZSddID0ge1xuICAgIC8v5L2/55So5by+5bmV44OR44K/44O844OzXG4gICAgZGFubWFrdU5hbWU6IFwiTW91cm5CbGFkZVwiLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDk4LFxuICAgIGhlaWdodDogMTk2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDMwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAxMDAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTE9XRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX01CT1NTLFxuXG4gICAgLy/niIbnmbrjgr/jgqTjg5dcbiAgICBleHBsb2RlVHlwZTogRVhQTE9ERV9CT1NTLFxuXG4gICAgLy/mqZ/kvZPnlKjjg4bjgq/jgrnjg4Hjg6Pmg4XloLFcbiAgICB0ZXhOYW1lOiBcInRleF9ib3NzMVwiLFxuICAgIHRleFdpZHRoOiA5NixcbiAgICB0ZXhIZWlnaHQ6IDE5MixcbiAgICB0ZXhUcmltWDogMCxcbiAgICB0ZXhUcmltWTogMCxcbiAgICB0ZXhUcmltV2lkdGg6IDE5MixcbiAgICB0ZXhUcmltSGVpZ2h0OiAxOTIsXG4gICAgdGV4SW5kZXg6IDAsXG5cbiAgICBzZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIGVwdWlwbWVudDogZnVuY3Rpb24oKSB7XG4gICAgfSxcblxuICAgIGFsZ29yaXRobTogZnVuY3Rpb24oKSB7XG4gICAgfSxcbn07XG5cbi8qXG4gKlxuICogIO+8k+mdouODnOOCuVxuICogIOepuuS4reepuuavjeOAjOOCueODiOODvOODoOODluODquODs+OCrOODvOOAjVxuICpcbiAqL1xuZW5lbXlEYXRhWydTdG9ybUJyaW5nZXInXSA9IHtcbiAgICAvL+S9v+eUqOW8vuW5leODkeOCv+ODvOODs1xuICAgIGRhbm1ha3VOYW1lOiBbXCJTdG9ybUJyaW5nZXIxXzFcIiwgXCJTdG9ybUJyaW5nZXIxXzJcIiwgXCJTdG9ybUJyaW5nZXIxXzNcIiwgXCJTdG9ybUJyaW5nZXIyXCJdLFxuXG4gICAgLy/lvZPjgorliKTlrprjgrXjgqTjgrpcbiAgICB3aWR0aDogIDk4LFxuICAgIGhlaWdodDogMTk2LFxuXG4gICAgLy/ogJDkuYXliptcbiAgICBkZWY6IDMwMDAsXG5cbiAgICAvL+W+l+eCuVxuICAgIHBvaW50OiAxMDAwMDAsXG5cbiAgICAvL+ihqOekuuODrOOCpOODpOODvOeVquWPt1xuICAgIGxheWVyOiBMQVlFUl9PQkpFQ1RfTE9XRVIsXG5cbiAgICAvL+aVteOCv+OCpOODl1xuICAgIHR5cGU6IEVORU1ZX0JPU1MsXG5cbiAgICAvL+eIhueZuuOCv+OCpOODl1xuICAgIGV4cGxvZGVUeXBlOiBFWFBMT0RFX0JPU1MsXG5cbiAgICAvL+apn+S9k+eUqOODhuOCr+OCueODgeODo+aDheWgsVxuICAgIHRleE5hbWU6IFwidGV4X2Jvc3MxXCIsXG4gICAgdGV4V2lkdGg6IDk2LFxuICAgIHRleEhlaWdodDogMTkyLFxuICAgIHRleFRyaW1YOiAwLFxuICAgIHRleFRyaW1ZOiAwLFxuICAgIHRleFRyaW1XaWR0aDogMTkyLFxuICAgIHRleFRyaW1IZWlnaHQ6IDE5MixcbiAgICB0ZXhJbmRleDogMCxcblxuICAgIHNldHVwOiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgZXB1aXBtZW50OiBmdW5jdGlvbigpIHtcbiAgICB9LFxuXG4gICAgYWxnb3JpdGhtOiBmdW5jdGlvbigpIHtcbiAgICB9LFxufTtcbiIsIi8qXG4gKiAgRW5lbXlEYXRhQm9zc180LmpzXG4gKiAgMjAxNS8xMC8xMFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLypcbiAqXG4gKiAg77yU6Z2i5Lit44Oc44K5XG4gKlxuICovXG5cbi8qXG4gKlxuICogIO+8lOmdouODnOOCuVxuICpcbiAqL1xuXG4iLCIvKlxuICogIEVuZW15RGF0YS5qc1xuICogIDIwMTUvMTAvMTBcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbi8v5pW15bCP6ZqK5Y2Y5L2N5a6a576pXG5lbmVteVVuaXQgPSB7XG5cbi8qXG4gKiDnqoHmkoPjg5jjg6rjgIzjg5vjg7zjg43jg4Pjg4jjgI3vvIjjg5Hjgr/jg7zjg7PvvJHvvIlcbiAqL1xuXCJIb3JuZXQxLWxlZnRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4xLCBcInlcIjotMTUwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4yLCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4zLCBcInlcIjotMTMwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC40LCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuXSxcblwiSG9ybmV0MS1yaWdodFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjYsIFwieVwiOi0xMTAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjcsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjgsIFwieVwiOi0xMDAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjksIFwieVwiOi0xNTAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG5dLFxuXCJIb3JuZXQxLWNlbnRlclwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjI1LCBcInlcIjotMTYwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC4zNSwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNDAsIFwieVwiOi0xMDAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjUwLCBcInlcIjotMTEwLCBwYXJhbTp7cGF0dGVybjoxfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC43MCwgXCJ5XCI6LTEzMCwgcGFyYW06e3BhdHRlcm46MX0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuODUsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjF9IH0sXG5dLFxuXG4vKlxuICog56qB5pKD44OY44Oq44CM44Ob44O844ON44OD44OI44CN77yI44OR44K/44O844Oz77yS77yJXG4gKi9cblwiSG9ybmV0Mi1sZWZ0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMSwgXCJ5XCI6LTEwMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMiwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMywgXCJ5XCI6LTEzMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNCwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46Mn0gfSxcbl0sXG5cIkhvcm5ldDItcmlnaHRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC42LCBcInlcIjotMTAwLCBwYXJhbTp7cGF0dGVybjoyfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC43LCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjoyfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC44LCBcInlcIjotMTMwLCBwYXJhbTp7cGF0dGVybjoyfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC45LCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjoyfSB9LFxuXSxcblxuLypcbiAqIOeqgeaSg+ODmOODquOAjOODm+ODvOODjeODg+ODiOOAje+8iOODkeOCv+ODvOODs++8k++8iVxuICovXG5cIkhvcm5ldDMtbGVmdFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjEsIFwieVwiOi0xMDAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjIsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjMsIFwieVwiOi0xMzAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjQsIFwieVwiOi0xMjAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG5dLFxuXCJIb3JuZXQzLXJpZ2h0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNiwgXCJ5XCI6LTEwMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNywgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuOCwgXCJ5XCI6LTEzMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuOSwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbl0sXG5cIkhvcm5ldDMtY2VudGVyXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuMjUsIFwieVwiOi0xNjAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjM1LCBcInlcIjotMTIwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC40MCwgXCJ5XCI6LTEwMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbiAgICB7IFwibmFtZVwiOiBcIkhvcm5ldFwiLCBcInhcIjpTQ19XKjAuNTAsIFwieVwiOi0xMTAsIHBhcmFtOntwYXR0ZXJuOjN9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJIb3JuZXRcIiwgXCJ4XCI6U0NfVyowLjcwLCBcInlcIjotMTMwLCBwYXJhbTp7cGF0dGVybjozfSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiSG9ybmV0XCIsIFwieFwiOlNDX1cqMC44NSwgXCJ5XCI6LTEyMCwgcGFyYW06e3BhdHRlcm46M30gfSxcbl0sXG5cbi8qXG4gKiAg5Lit5Z6L5pS75pKD44OY44Oq44CM44K444Ks44OQ44OB44CNXG4gKi9cblwiTXVkRGF1YmVyLWxlZnRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiTXVkRGF1YmVyXCIsIFwieFwiOiBTQ19XKjAuMywgXCJ5XCI6LVNDX0gqMC4xIH0sXG5dLFxuXG5cIk11ZERhdWJlci1jZW50ZXJcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiTXVkRGF1YmVyXCIsIFwieFwiOiBTQ19XKjAuNSwgXCJ5XCI6LVNDX0gqMC4xIH0sXG5dLFxuXG5cIk11ZERhdWJlci1yaWdodFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJNdWREYXViZXJcIiwgXCJ4XCI6IFNDX1cqMC43LCBcInlcIjotU0NfSCowLjEgfSxcbl0sXG5cbi8qXG4gKiAg5Lit5Z6L54iG5pKD5qmf44CM44OT44OD44Kw44Km44Kj44Oz44Kw44CNXG4gKi9cblwiQmlnV2luZy1sZWZ0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkJpZ1dpbmdcIiwgXCJ4XCI6U0NfVyowLjIsIFwieVwiOi1TQ19IKjAuMSB9LFxuXSxcblxuXCJCaWdXaW5nLXJpZ2h0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkJpZ1dpbmdcIiwgXCJ4XCI6U0NfVyowLjgsIFwieVwiOi1TQ19IKjAuMSB9LFxuXSxcblxuLypcbiAqICDpo5vnqbroiYfjgIzjgrnjgqvjgqTjg5bjg6zjg7zjg4njgI1cbiAqL1xuXCJTa3lCbGFkZS1sZWZ0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIlNreUJsYWRlXCIsIFwieFwiOi1TQ19XKjAuMiwgXCJ5XCI6IFNDX0gqMC40IH0sXG5dLFxuXG5cIlNreUJsYWRlLXJpZ2h0XCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIlNreUJsYWRlXCIsIFwieFwiOiBTQ19XKjEuMiwgXCJ5XCI6IFNDX0gqMC40IH0sXG5dLFxuXG4vKlxuICogIOegsuWPsOOAjOODluODquODpeODiuODvOOCr+OAjVxuICovXG5cIkJyaW9uYWMxLWxlZnRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiQnJpb25hYzFcIiwgXCJ4XCI6IFNDX1cqMC4zLCBcInlcIjotU0NfSCowLjEsIHBhcmFtOntwb3M6XCJsZWZ0XCJ9fSxcbl0sXG5cblwiQnJpb25hYzEtY2VudGVyXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkJyaW9uYWMxXCIsIFwieFwiOiBTQ19XKjAuNSwgXCJ5XCI6LVNDX0gqMC4xLCBwYXJhbTp7cG9zOlwiY2VudGVyXCJ9fSxcbl0sXG5cblwiQnJpb25hYzEtcmlnaHRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiQnJpb25hYzFcIiwgXCJ4XCI6IFNDX1cqMC43LCBcInlcIjotU0NfSCowLjEsIHBhcmFtOntwb3M6XCJyaWdodFwifX0sXG5dLFxuXG4vKlxuICogIOS4reWei+aIpui7iuOAjOODleODqeOCrOODqeODg+ODj+OAjVxuICovXG5cIkZyYWdhcmFjaC1jZW50ZXJcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuMiwgXCJ5XCI6LVNDX0gqMC4xLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjMsIFwieVwiOi1TQ19IKjAuMiwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC4yLCBcInlcIjotU0NfSCowLjMsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC41LCBcInlcIjotU0NfSCowLjM1LCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjUsIFwieVwiOi1TQ19IKjAuMjUsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC44LCBcInlcIjotU0NfSCowLjEsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuNywgXCJ5XCI6LVNDX0gqMC4yLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjgsIFwieVwiOi1TQ19IKjAuMywgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG5dLFxuXCJGcmFnYXJhY2gtbGVmdFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6LVNDX1cqMC4wNSwgXCJ5XCI6IC1TQ19IKjAuMSwgcGFyYW06e3BhdHRlcm46XCJsXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6LVNDX1cqMC4wNSwgXCJ5XCI6IC1TQ19IKjAuMiwgcGFyYW06e3BhdHRlcm46XCJsXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6LVNDX1cqMC4xLCAgXCJ5XCI6IC1TQ19IKjAuMywgcGFyYW06e3BhdHRlcm46XCJsXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6LVNDX1cqMC4xLCAgXCJ5XCI6IC1TQ19IKjAuNCwgcGFyYW06e3BhdHRlcm46XCJsXCJ9IH0sXG5dLFxuXCJGcmFnYXJhY2gtcmlnaHRcIjogW1xuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjEuMDUsIFwieVwiOiAtU0NfSCowLjEsIHBhcmFtOntwYXR0ZXJuOlwiclwifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjEuMDUsIFwieVwiOiAtU0NfSCowLjIsIHBhcmFtOntwYXR0ZXJuOlwiclwifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjEuMSwgIFwieVwiOiAtU0NfSCowLjMsIHBhcmFtOntwYXR0ZXJuOlwiclwifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjEuMSwgIFwieVwiOiAtU0NfSCowLjQsIHBhcmFtOntwYXR0ZXJuOlwiclwifSB9LFxuXSxcblwiRnJhZ2FyYWNoLWxlZnQyXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjIsIFwieVwiOi1TQ19IKjAuMSwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC4zLCBcInlcIjotU0NfSCowLjIsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuMiwgXCJ5XCI6LVNDX0gqMC4zLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjMsIFwieVwiOi1TQ19IKjAuNCwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG5dLFxuXCJGcmFnYXJhY2gtcmlnaHQyXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjgsIFwieVwiOi1TQ19IKjAuMSwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG4gICAgeyBcIm5hbWVcIjogXCJGcmFnYXJhY2hcIiwgXCJ4XCI6IFNDX1cqMC43LCBcInlcIjotU0NfSCowLjIsIHBhcmFtOntwYXR0ZXJuOlwiY1wifSB9LFxuICAgIHsgXCJuYW1lXCI6IFwiRnJhZ2FyYWNoXCIsIFwieFwiOiBTQ19XKjAuOCwgXCJ5XCI6LVNDX0gqMC4zLCBwYXJhbTp7cGF0dGVybjpcImNcIn0gfSxcbiAgICB7IFwibmFtZVwiOiBcIkZyYWdhcmFjaFwiLCBcInhcIjogU0NfVyowLjcsIFwieVwiOi1TQ19IKjAuNCwgcGFyYW06e3BhdHRlcm46XCJjXCJ9IH0sXG5dLFxuXG5cbi8qXG4gKiAg5Lit5Z6L6Ly46YCB5qmf44CM44OI44Kk44Oc44OD44Kv44K544CNXG4gKi9cbi8v44OR44Ov44O844Ki44OD44OXXG5cIlRveUJveC1wLWxlZnRcIjogICAgW3sgXCJuYW1lXCI6IFwiVG95Qm94XCIsIFwieFwiOiBTQ19XKjAuMiwgXCJ5XCI6IC1TQ19IKjAuMywgcGFyYW06e2Ryb3A6XCJwb3dlclwifSB9LF0sXG5cIlRveUJveC1wLWNlbnRlclwiOiAgW3sgXCJuYW1lXCI6IFwiVG95Qm94XCIsIFwieFwiOiBTQ19XKjAuNSwgXCJ5XCI6IC1TQ19IKjAuMywgcGFyYW06e2Ryb3A6XCJwb3dlclwifSB9LF0sXG5cIlRveUJveC1wLXJpZ2h0XCI6ICAgW3sgXCJuYW1lXCI6IFwiVG95Qm94XCIsIFwieFwiOiBTQ19XKjAuOCwgXCJ5XCI6IC1TQ19IKjAuMywgcGFyYW06e2Ryb3A6XCJwb3dlclwifSB9LF0sXG5cbi8v44Oc44OgXG5cIlRveUJveC1iLWxlZnRcIjogICAgW3sgXCJuYW1lXCI6IFwiVG95Qm94XCIsIFwieFwiOiBTQ19XKjAuMiwgXCJ5XCI6IC1TQ19IKjAuMywgcGFyYW06e2Ryb3A6XCJib21iXCJ9IH0sXSxcblwiVG95Qm94LWItY2VudGVyXCI6ICBbeyBcIm5hbWVcIjogXCJUb3lCb3hcIiwgXCJ4XCI6IFNDX1cqMC41LCBcInlcIjogLVNDX0gqMC4zLCBwYXJhbTp7ZHJvcDpcImJvbWJcIn0gfSxdLFxuXCJUb3lCb3gtYi1yaWdodFwiOiAgIFt7IFwibmFtZVwiOiBcIlRveUJveFwiLCBcInhcIjogU0NfVyowLjgsIFwieVwiOiAtU0NfSCowLjMsIHBhcmFtOntkcm9wOlwiYm9tYlwifSB9LF0sXG5cbi8qXG4gKlxuICogIO+8kemdouS4reODnOOCuVxuICogIOijheeUsui8uOmAgeWIl+i7iuOAjOODiOODvOODq+ODj+ODs+ODnuODvOOAjVxuICpcbiAqL1xuXCJUaG9ySGFtbWVyXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIlRob3JIYW1tZXJcIiwgXCJ4XCI6U0NfVyowLjUsIFwieVwiOiBTQ19IKjEuMyB9LFxuXSxcblxuLypcbiAqXG4gKiAg77yR6Z2i44Oc44K5XG4gKiAg5bGA5Zyw5Yi25Zyn5Z6L5beo5aSn5oim6LuK44CM44K044Oq44Ki44OG44CNXG4gKlxuICovXG5cIkdvbHlhdFwiOiBbXG4gICAgeyBcIm5hbWVcIjogXCJHb2x5YXRcIiwgXCJ4XCI6U0NfVyowLjUsIFwieVwiOiBTQ19IKi0wLjIgfSxcbl0sXG5cbi8qXG4gKlxuICogIO+8kumdouS4reODnOOCuSAgXG4gKiAg5aSn5Z6L54iG5pKD5qmf44CM44Os44Kk44OW44Oz44CNXG4gKlxuICovXG5cIlJhdmVuXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIlJhdmVuXCIsIFwieFwiOiBTQ19XKjEuMiwgXCJ5XCI6IFNDX0gqMC43IH0sXG5dLFxuXG4vKlxuICpcbiAqICDvvJLpnaLjg5zjgrlcbiAqICDlpKflnovotoXpq5jpq5jluqbniIbmkoPmqZ/jgIzjgqzjg6vjg7zjg4DjgI1cbiAqXG4gKi9cblwiR2FydWRhXCI6IFtcbiAgICB7IFwibmFtZVwiOiBcIkdhcnVkYVwiLCBcInhcIjogU0NfVyowLjUsIFwieVwiOiBTQ19IKjAuMiB9LFxuXSxcblxufVxuIiwiLypcbiAqICBJdGVtLmpzXG4gKiAgMjAxNS8xMC8xOVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLy/jgqLjgqTjg4bjg6BcbnBoaW5hLmRlZmluZShcIkl0ZW1cIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5TcHJpdGVcIixcbiAgICBsYXllcjogTEFZRVJfUExBWUVSLFxuXG4gICAgLy/jgqLjgqTjg4bjg6DnqK7poZ5cbiAgICAvLzA6IOODkeODr+ODvOOCouODg+ODl1xuICAgIC8vMTog44Oc44OgXG4gICAgLy8yOiDvvJHvvLXvvLBcbiAgICAvLzM6IOW+l+eCuVxuICAgIGlkOiAwLFxuXG4gICAgLy/jg5Hjg6/jg7zjgqLjg4Pjg5fjgr/jgqTjg5dcbiAgICB0eXBlOiAwLFxuXG4gICAgYWN0aXZlOiBmYWxzZSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KFwidGV4MVwiLCAzMiwgMzIpO1xuICAgICAgICB0aGlzLmlkID0gaWQ7XG4gICAgICAgIHRoaXMuc2V0RnJhbWVUcmltbWluZygwLCA5NywgOTYsIDMyKTtcbiAgICAgICAgdGhpcy5zZXRGcmFtZUluZGV4KGlkKTtcbiAgICAgICAgdGhpcy5zZXRTY2FsZSgyLjApO1xuXG4gICAgICAgIC8v5b2T44KK5Yik5a6a6Kit5a6aXG4gICAgICAgIHRoaXMuYm91bmRpbmdUeXBlID0gXCJyZWN0XCI7XG5cbiAgICAgICAgdGhpcy5waGFzZSA9IDA7XG4gICAgICAgIHRoaXMuY291bnQgPSAwO1xuICAgICAgICB0aGlzLnRpbWUgPSAxO1xuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICAvL+iHquapn+OBqOOBruW9k+OCiuWIpOWumuODgeOCp+ODg+OCr1xuICAgICAgICB2YXIgcGxheWVyID0gYXBwLmN1cnJlbnRTY2VuZS5wbGF5ZXI7XG4gICAgICAgIGlmICh0aGlzLmlzSGl0RWxlbWVudChwbGF5ZXIpKSB7XG4gICAgICAgICAgICBwbGF5ZXIuZ2V0SXRlbSh0aGlzLmlkLCB0aGlzLnR5cGUpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v56e75YuV44OR44K/44O844OzXG4gICAgICAgIGlmICh0aGlzLnBoYXNlID09IDApIHtcbiAgICAgICAgICAgIHRoaXMueSsrO1xuICAgICAgICAgICAgaWYgKHRoaXMueSA+IFNDX0gtMzIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBoYXNlKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5waGFzZSA9PSAxKSB7XG4gICAgICAgICAgICB2YXIgeCA9IHJhbmQoU0NfVyowLjIsIFNDX1cqMC44KTtcbiAgICAgICAgICAgIHZhciB5ID0gcmFuZChTQ19IKjAuMiwgU0NfVyowLjkpO1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAubW92ZSh4LCB5LCAzMDAwLCBcImVhc2VJbk91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb3VudCA8IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGhhc2UgPSAxO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5waGFzZSA9IDM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy5waGFzZSsrO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGhhc2UgPT0gMykge1xuICAgICAgICAgICAgdGhpcy55ICs9IDI7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIHBsYXllci5qc1xuICogIDIwMTQvMDkvMDVcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLmRlZmluZShcIlBsYXllclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG4gICAgX21lbWJlcjoge1xuICAgICAgICBsYXllcjogTEFZRVJfUExBWUVSLFxuXG4gICAgICAgIC8v5b2T44KK5Yik5a6a44K144Kk44K6XG4gICAgICAgIHdpZHRoOiAyLFxuICAgICAgICBoZWlnaHQ6IDIsXG5cbiAgICAgICAgaXNDb250cm9sOiB0cnVlLCAgICAvL+aTjeS9nOWPr+iDveODleODqeOCsFxuICAgICAgICBpc1Nob3RPSzogdHJ1ZSwgICAgIC8v44K344On44OD44OI5Y+v6IO944OV44Op44KwXG4gICAgICAgIGlzRGVhZDogZmFsc2UsICAgICAgLy/mrbvkuqHjg5Xjg6njgrBcbiAgICAgICAgc2hvdE9OOiB0cnVlLCAgICAgICAvL+OCt+ODp+ODg+ODiOODleODqeOCsFxuICAgICAgICBtb3VzZU9OOiBmYWxzZSwgICAgIC8v44Oe44Km44K55pON5L2c5Lit44OV44Op44KwXG5cbiAgICAgICAgaXNDb2xsaXNpb246IGZhbHNlLCAgICAgLy/lvZPjgorliKTlrprmnInlirnjg5Xjg6njgrBcbiAgICAgICAgaXNBZnRlcmJ1cm5lcjogZmFsc2UsICAgLy/jgqLjg5Xjgr/jg7zjg5Djg7zjg4rjg7zkuK1cbiAgICAgICAgaXNBZnRlcmJ1cm5lckJlZm9yZTogZmFsc2UsXG5cbiAgICAgICAgdGltZU11dGVraTogMCwgLy/nhKHmlbXjg5Xjg6zjg7zjg6DmrovjgormmYLplpNcblxuICAgICAgICBzcGVlZDogNCwgICAgICAgLy/np7vli5Xkv4LmlbBcbiAgICAgICAgdG91Y2hTcGVlZDogNCwgIC8v44K/44OD44OB5pON5L2c5pmC56e75YuV5L+C5pWwXG4gICAgICAgIHR5cGU6IDAsICAgICAgICAvL+iHquapn+OCv+OCpOODlygwOui1pCAxOue3kSAyOumdkilcbiAgICAgICAgcG93ZXI6IDAsICAgICAgIC8v44OR44Ov44O844Ki44OD44OX5q616ZqOXG4gICAgICAgIHBvd2VyTWF4OiA1LCAgICAvL+ODkeODr+ODvOOCouODg+ODl+acgOWkp1xuXG4gICAgICAgIHNob3RQb3dlcjogMTAsICAgICAgLy/jgrfjg6fjg4Pjg4jlqIHliptcbiAgICAgICAgc2hvdEludGVydmFsOiA2LCAgICAvL+OCt+ODp+ODg+ODiOmWk+malFxuXG4gICAgICAgIHJvbGxjb3VudDogNTAsXG4gICAgICAgIHBpdGNoY291bnQ6IDUwLFxuXG4gICAgICAgIHBhcmVudFNjZW5lOiBudWxsLFxuICAgICAgICBpbmRlY2llczogWzAsMSwyLDMsNCw0LDQsNSw2LDcsOF0sXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICB0aGlzLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgdGhpcy5zcHJpdGUgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcImd1bnNoaXBcIiwgNDgsIDQ4KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDQpXG4gICAgICAgICAgICAuc2V0U2NhbGUoMC42Nik7XG5cbiAgICAgICAgLy/jg5Pjg4Pjg4hcbiAgICAgICAgdGhpcy5iaXRzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJpdHNbaV0gPSBQbGF5ZXJCaXQoaSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuYml0c1tpXS50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub3BlbkJpdCgwKTtcblxuICAgICAgICAvL+W9k+OCiuWIpOWumuioreWumlxuICAgICAgICB0aGlzLmJvdW5kaW5nVHlwZSA9IFwiY2lyY2xlXCI7XG4gICAgICAgIHRoaXMucmFkaXVzID0gMjtcblxuICAgICAgICB0aGlzLm9uKCdyZW1vdmVkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaGFkb3cpIHRoaXMuc2hhZG93LnJlbW92ZSgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMuY2hhbmdlSW50ZXJ2YWwgPSAwO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgaWYgKHRoaXMuaXNDb250cm9sKSB7XG4gICAgICAgICAgICAvL+ODnuOCpuOCueaTjeS9nFxuICAgICAgICAgICAgdmFyIHAgPSBhcHAubW91c2U7XG4gICAgICAgICAgICBpZiAocC5nZXRQb2ludGluZygpKSB7XG4vKlxuICAgICAgICAgICAgICAgIHZhciBwdCA9IHRoaXMucGFyZW50U2NlbmUucG9pbnRlcjtcbiAgICAgICAgICAgICAgICB0aGlzLnggKz0gKHB0LnggLSB0aGlzLngpL3RoaXMudG91Y2hTcGVlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnkgKz0gKHB0LnkgLSB0aGlzLnkpL3RoaXMudG91Y2hTcGVlZDtcbiovXG4gICAgICAgICAgICAgICAgdmFyIHB0ID0gcC5kZWx0YVBvc2l0aW9uO1xuICAgICAgICAgICAgICAgIHRoaXMueCArPSB+fihwdC54KjEuOCk7XG4gICAgICAgICAgICAgICAgdGhpcy55ICs9IH5+KHB0LnkqMS44KTtcblxuICAgICAgICAgICAgICAgIHRoaXMubW91c2VPTiA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG90T04gPSB0cnVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlT04gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNob3RPTiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+OCs+ODs+ODiOODreODvOODqeODvOaTjeS9nFxuICAgICAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgICAgICBpZiAoY3QuYW5nbGUgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2YXIgbSA9IEtFWUJPQVJEX01PVkVbY3QuYW5nbGVdO1xuICAgICAgICAgICAgICAgIHRoaXMueCArPSBtLngqdGhpcy5zcGVlZDtcbiAgICAgICAgICAgICAgICB0aGlzLnkgKz0gbS55KnRoaXMuc3BlZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3QuYW5hbG9nMS54ID4gMC4zIHx8IC0wLjMgPiBjdC5hbmFsb2cxLngpIHRoaXMueCArPSBjdC5hbmFsb2cxLnggKiB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgaWYgKGN0LmFuYWxvZzEueSA+IDAuMyB8fCAtMC4zID4gY3QuYW5hbG9nMS55KSB0aGlzLnkgKz0gY3QuYW5hbG9nMS55ICogdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tb3VzZU9OKSB0aGlzLnNob3RPTiA9IGFwcC5jb250cm9sbGVyLnNob3Q7XG5cbiAgICAgICAgICAgIC8v44Kz44Oz44OI44Ot44O844Or5LiN5Y+v54q25oWLXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNDb250cm9sIHx8ICF0aGlzLmlzU2hvdE9LIHx8IHRoaXMuaXNEZWFkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG90T04gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/jgrPjg7Pjg4jjg63jg7zjg6vlj6/og73nirbmhYtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ29udHJvbCAmJiB0aGlzLmlzU2hvdE9LICYmICF0aGlzLmlzRGVhZCkge1xuICAgICAgICAgICAgICAgIC8v44Oc44Og5oqV5LiLXG4gICAgICAgICAgICAgICAgaWYgKGN0LmJvbWIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5lbnRlckJvbWIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvL+OCt+ODp+ODg+ODiOOCv+OCpOODl+WkieabtO+8iOODhuOCueODiOeUqO+8iVxuICAgICAgICAgICAgICAgIGlmIChjdC5zcGVjaWFsMSAmJiB0aGlzLnRpbWUgPiB0aGlzLmNoYW5nZUludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHlwZSA9ICh0aGlzLnR5cGUrMSklMztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vcGVuQml0KHRoaXMudHlwZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hhbmdlSW50ZXJ2YWwgPSB0aGlzLnRpbWUrMzA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvL+enu+WLleevhOWbsuOBruWItumZkFxuICAgICAgICAgICAgdGhpcy54ID0gTWF0aC5jbGFtcCh0aGlzLngsIDE2LCBTQ19XLTE2KTtcbiAgICAgICAgICAgIHRoaXMueSA9IE1hdGguY2xhbXAodGhpcy55LCAxNiwgU0NfSC0xNik7XG5cbiAgICAgICAgICAgIC8v44K344On44OD44OI5oqV5YWlXG4gICAgICAgICAgICBpZiAodGhpcy5zaG90T04gJiYgYXBwLnRpY2tlci5mcmFtZSAlIHRoaXMuc2hvdEludGVydmFsID09IDApIHRoaXMuZW50ZXJTaG90KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+apn+S9k+ODreODvOODq1xuICAgICAgICB2YXIgeCA9IH5+dGhpcy54O1xuICAgICAgICB2YXIgYnggPSB+fnRoaXMuYng7XG4gICAgICAgIGlmIChieCA+IHgpIHtcbiAgICAgICAgICAgIHRoaXMucm9sbGNvdW50LT0yO1xuICAgICAgICAgICAgaWYgKHRoaXMucm9sbGNvdW50IDwgMCkgdGhpcy5yb2xsY291bnQgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGlmIChieCA8IHgpIHtcbiAgICAgICAgICAgIHRoaXMucm9sbGNvdW50Kz0yO1xuICAgICAgICAgICAgaWYgKHRoaXMucm9sbGNvdW50ID4gMTAwKSB0aGlzLnJvbGxjb3VudCA9IDEwMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdnggPSBNYXRoLmFicyhieCAtIHgpO1xuICAgICAgICBpZiAodnggPCAyKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yb2xsY291bnQgPCA1MCkgdGhpcy5yb2xsY291bnQrPTI7IGVsc2UgdGhpcy5yb2xsY291bnQtPTI7XG4gICAgICAgICAgICBpZiAodGhpcy5yb2xsY291bnQgPCAwKSB0aGlzLnJvbGxjb3VudCA9IDA7XG4gICAgICAgICAgICBpZiAodGhpcy5yb2xsY291bnQgPiAxMDApIHRoaXMucm9sbGNvdW50ID0gMTAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc3ByaXRlLnNldEZyYW1lSW5kZXgodGhpcy5pbmRlY2llc1tNYXRoLmNsYW1wKH5+KHRoaXMucm9sbGNvdW50LzEwKSwwLCA5KV0pO1xuXG4gICAgICAgIC8v44Ki44OV44K/44O844OQ44O844OK44O85o+P5YaZXG4gICAgICAgIGlmICh0aGlzLmlzQWZ0ZXJidXJuZXIpIHtcbiAgICAgICAgICAgIHZhciBncm91bmQgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgICAgIC8v552A54GrXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNBZnRlcmJ1cm5lckJlZm9yZSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNTA7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdnggPSBNYXRoLnJhbmRpbnQoLTUsIDUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdnkgPSBNYXRoLnJhbmRpbnQoMSwgNSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gIE1hdGgucmFuZGZsb2F0KDAuOSwgMC45OSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlID0gbGF5ZXIuZW50ZXJBZnRlcmJ1cm5lcih7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbjoge3g6IHRoaXMueCwgeTogdGhpcy55KzE2fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogdngsIHk6IHZ5K2dyb3VuZC5kZWx0YVksIGRlY2F5OiBkfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFscGhhOiAwLjcsXG4gICAgICAgICAgICAgICAgICAgICAgICBibGVuZE1vZGU6IFwibGlnaHRlclwiLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNEZWFkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGUgPSBsYXllci5lbnRlckFmdGVyYnVybmVyKHtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB0aGlzLngsIHk6IHRoaXMueSsyNn0sXG4gICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogMCwgeTogZ3JvdW5kLmRlbHRhWSwgZGVjYXk6IDAuOTl9LFxuICAgICAgICAgICAgICAgICAgICBhbHBoYTogMC43LFxuICAgICAgICAgICAgICAgICAgICBibGVuZE1vZGU6IFwibGlnaHRlclwiLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChlKSBlLnNldFNjYWxlKDEuMCwgMy4wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8v5raI54GrXG4gICAgICAgICAgICBpZiAodGhpcy5pc0FmdGVyYnVybmVyQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ4ID0gTWF0aC5yYW5kaW50KC0yLCAyKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZ5ID0gTWF0aC5yYW5kaW50KDEsIDUpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9ICBNYXRoLnJhbmRmbG9hdCgwLjksIDAuOTkpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZSA9IGxheWVyLmVudGVyQWZ0ZXJidXJuZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiB0aGlzLngsIHk6IHRoaXMueSsxNn0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IHZ4LCB5OiB2eStncm91bmQuZGVsdGFZLCBkZWNheTogZH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhbHBoYTogMC43LFxuICAgICAgICAgICAgICAgICAgICAgICAgYmxlbmRNb2RlOiBcImxpZ2h0ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5ieCA9IHRoaXMueDtcbiAgICAgICAgdGhpcy5ieSA9IHRoaXMueTtcbiAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgIHRoaXMudGltZU11dGVraS0tO1xuICAgICAgICB0aGlzLmlzQWZ0ZXJidXJuZXJCZWZvcmUgPSB0aGlzLmlzQWZ0ZXJidXJuZXI7XG4gICAgfSxcblxuICAgIC8v6KKr5by+5Yem55CGXG4gICAgZGFtYWdlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgLy/nhKHmlbXmmYLplpPkuK3jga/jgrnjg6vjg7xcbiAgICAgICAgaWYgKHRoaXMudGltZU11dGVraSA+IDAgfHwgdGhpcy5wYXJlbnRTY2VuZS5ib21iVGltZSA+IDAgfHwgdGhpcy5wYXJlbnRTY2VuZS50aW1lVmFuaXNoID4gMCkgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIC8v44Kq44O844OI44Oc44Og55m65YuVXG4gICAgICAgIGlmIChhcHAuc2V0dGluZy5hdXRvQm9tYiAmJiBhcHAuc2V0dGluZy5ib21iU3RvY2sgPiAwKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudFNjZW5lLmVudGVyQm9tYigpO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvL+iiq+W8vuOCqOODleOCp+OCr+ODiOihqOekulxuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLnBhcmVudFNjZW5lLmVmZmVjdExheWVyVXBwZXI7XG4gICAgICAgIGxheWVyLmVudGVyRXhwbG9kZVBsYXllcih7cG9zaXRpb246IHt4OiB0aGlzLngsIHk6IHRoaXMueX19KTtcblxuICAgICAgICBhcHAucGxheVNFKFwicGxheWVybWlzc1wiKTtcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5taXNzQ291bnQrKztcbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5zdGFnZU1pc3NDb3VudCsrO1xuXG4gICAgICAgIHRoaXMuaXNEZWFkID0gdHJ1ZTtcbiAgICAgICAgYXBwLnNldHRpbmcuemFua2ktLTtcbiAgICAgICAgaWYgKGFwcC5zZXR0aW5nLnphbmtpID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydHVwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNob3RPTiA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmlzQ29udHJvbCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnRTY2VuZS5pc0dhbWVPdmVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvL+OCt+ODp+ODg+ODiOeZuuWwhFxuICAgIGVudGVyU2hvdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIC8v6Ieq5qmf44GL44KJXG4gICAgICAgIHZhciBseSA9IHRoaXMucGFyZW50U2NlbmUuc2hvdExheWVyO1xuICAgICAgICBseS5lbnRlclNob3QodGhpcy54KzEwLCB0aGlzLnktOCwge3R5cGU6IDAsIHJvdGF0aW9uOiAxLCBwb3dlcjogdGhpcy5zaG90UG93ZXJ9KTtcbiAgICAgICAgbHkuZW50ZXJTaG90KHRoaXMueCAgICwgdGhpcy55LTE2LHt0eXBlOiAwLCByb3RhdGlvbjogMCwgcG93ZXI6IHRoaXMuc2hvdFBvd2VyfSk7XG4gICAgICAgIGx5LmVudGVyU2hvdCh0aGlzLngtMTAsIHRoaXMueS04LCB7dHlwZTogMCwgcm90YXRpb246LTEsIHBvd2VyOiB0aGlzLnNob3RQb3dlcn0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jg5Pjg4Pjg4jlsZXplotcbiAgICBvcGVuQml0OiBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHZhciBjb2xvciA9IDA7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIC8v6LWk77yI5YmN5pa56ZuG5Lit5Z6L77yJXG4gICAgICAgICAgICAgICAgdGhpcy5iaXRzWzBdLnR3ZWVuZXIuY2xlYXIoKS50byh7IHg6ICA1LCB5Oi0zMiwgcm90YXRpb246IDIsIGFscGhhOjF9LCAxNSkuY2FsbChmdW5jdGlvbigpe3RoaXMudHdlZW5lci5jbGVhcigpLm1vdmVCeSgtMzAsMCwzMCxcImVhc2VJbk91dFNpbmVcIikubW92ZUJ5KCAzMCwwLDMwLFwiZWFzZUluT3V0U2luZVwiKS5zZXRMb29wKHRydWUpO30uYmluZCh0aGlzLmJpdHNbMF0pKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMV0udHdlZW5lci5jbGVhcigpLnRvKHsgeDogLTUsIHk6LTMyLCByb3RhdGlvbjotMiwgYWxwaGE6MX0sIDE1KS5jYWxsKGZ1bmN0aW9uKCl7dGhpcy50d2VlbmVyLmNsZWFyKCkubW92ZUJ5KCAzMCwwLDMwLFwiZWFzZUluT3V0U2luZVwiKS5tb3ZlQnkoLTMwLDAsMzAsXCJlYXNlSW5PdXRTaW5lXCIpLnNldExvb3AodHJ1ZSk7fS5iaW5kKHRoaXMuYml0c1sxXSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1syXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OiAxNSwgeTotMjQsIHJvdGF0aW9uOiAyLCBhbHBoYToxfSwgMTUpLmNhbGwoZnVuY3Rpb24oKXt0aGlzLnR3ZWVuZXIuY2xlYXIoKS5tb3ZlQnkoLTQwLDAsMzAsXCJlYXNlSW5PdXRTaW5lXCIpLm1vdmVCeSggNDAsMCwzMCxcImVhc2VJbk91dFNpbmVcIikuc2V0TG9vcCh0cnVlKTt9LmJpbmQodGhpcy5iaXRzWzJdKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iaXRzWzNdLnR3ZWVuZXIuY2xlYXIoKS50byh7IHg6LTE1LCB5Oi0yNCwgcm90YXRpb246LTIsIGFscGhhOjF9LCAxNSkuY2FsbChmdW5jdGlvbigpe3RoaXMudHdlZW5lci5jbGVhcigpLm1vdmVCeSggNDAsMCwzMCxcImVhc2VJbk91dFNpbmVcIikubW92ZUJ5KC00MCwwLDMwLFwiZWFzZUluT3V0U2luZVwiKS5zZXRMb29wKHRydWUpO30uYmluZCh0aGlzLmJpdHNbM10pKTtcbiAgICAgICAgICAgICAgICBjb2xvciA9IDA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgLy/nt5HvvIjmlrnlkJHlpInmm7TlnovvvIlcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMF0udHdlZW5lci5jbGVhcigpLnRvKHsgeDogMzUsIHk6MCwgcm90YXRpb246MCwgYWxwaGE6MX0sIDE1KS5zZXRMb29wKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMV0udHdlZW5lci5jbGVhcigpLnRvKHsgeDotMzUsIHk6MCwgcm90YXRpb246MCwgYWxwaGE6MX0sIDE1KS5zZXRMb29wKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMl0udHdlZW5lci5jbGVhcigpLnRvKHsgeDogMTAsIHk6MzAsIHJvdGF0aW9uOjAsIGFscGhhOjF9LCAxNSkuc2V0TG9vcChmYWxzZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iaXRzWzNdLnR3ZWVuZXIuY2xlYXIoKS50byh7IHg6LTEwLCB5OjMwLCByb3RhdGlvbjowLCBhbHBoYToxfSwgMTUpLnNldExvb3AoZmFsc2UpO1xuICAgICAgICAgICAgICAgIGNvbG9yID0gODA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgLy/pnZLvvIjluoPnr4Tlm7LlnovvvIlcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMF0udHdlZW5lci5jbGVhcigpLnRvKHsgeDogMzAsIHk6MTYsIHJvdGF0aW9uOiAgNSwgYWxwaGE6MX0sIDE1KS5zZXRMb29wKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMV0udHdlZW5lci5jbGVhcigpLnRvKHsgeDotMzAsIHk6MTYsIHJvdGF0aW9uOiAtNSwgYWxwaGE6MX0sIDE1KS5zZXRMb29wKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMl0udHdlZW5lci5jbGVhcigpLnRvKHsgeDogNTAsIHk6MjQsIHJvdGF0aW9uOiAxMCwgYWxwaGE6MX0sIDE1KS5zZXRMb29wKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbM10udHdlZW5lci5jbGVhcigpLnRvKHsgeDotNTAsIHk6MjQsIHJvdGF0aW9uOi0xMCwgYWxwaGE6MX0sIDE1KS5zZXRMb29wKGZhbHNlKTtcbiAgICAgICAgICAgICAgICBjb2xvciA9IDIwMDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgLy/jgq/jg63jg7zjgrpcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbMF0udHdlZW5lci5jbGVhcigpLnRvKHsgeDowLCB5OiAwLCBhbHBoYTowfSwgMTUpO1xuICAgICAgICAgICAgICAgIHRoaXMuYml0c1sxXS50d2VlbmVyLmNsZWFyKCkudG8oeyB4OjAsIHk6IDAsIGFscGhhOjB9LCAxNSk7XG4gICAgICAgICAgICAgICAgdGhpcy5iaXRzWzJdLnR3ZWVuZXIuY2xlYXIoKS50byh7IHg6MCwgeTogMCwgYWxwaGE6MH0sIDE1KTtcbiAgICAgICAgICAgICAgICB0aGlzLmJpdHNbM10udHdlZW5lci5jbGVhcigpLnRvKHsgeDowLCB5OiAwLCBhbHBoYTowfSwgMTUpO1xuICAgICAgICAgICAgICAgIGNvbG9yID0gNjA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v44OX44Os44Kk44Ok44O85oqV5YWl5pmC5ryU5Ye6XG4gICAgc3RhcnR1cDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMueCA9IFNDX1cvMjtcbiAgICAgICAgdGhpcy55ID0gU0NfSCsxMjg7XG4gICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAud2FpdCgxMjApXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50U2NlbmUudGltZVZhbmlzaCA9IDE4MDtcbiAgICAgICAgICAgICAgICBhcHAuc2V0dGluZy5ib21iU3RvY2sgPSBhcHAuc2V0dGluZy5ib21iU3RvY2tNYXg7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudG8oe3g6IFNDX1cqMC41LCB5OiBTQ19IKjAuOH0sIDEyMCwgXCJlYXNlT3V0UXVpbnRcIilcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG90T04gPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuaXNDb250cm9sID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hvdE9LID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVNdXRla2kgPSAxMjA7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMuaXNEZWFkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuc2hvdE9OID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNDb250cm9sID0gZmFsc2U7XG4gICAgICAgIHRoaXMuaXNDb2xsaXNpb24gPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v44K544OG44O844K46ZaL5aeL5pmC5ryU5Ye6XG4gICAgc3RhZ2VTdGFydHVwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy54ID0gU0NfVy8yO1xuICAgICAgICB0aGlzLnkgPSBTQ19IKzEyODtcbiAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC50byh7eDogU0NfVy8yLCB5OiBTQ19ILzIrMzJ9LCA5MCwgXCJlYXNlT3V0Q3ViaWNcIilcbiAgICAgICAgICAgIC50byh7eDogU0NfVy8yLCB5OiBTQ19ILTY0ICB9LCAxMjApXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvdE9OID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLmlzQ29udHJvbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1Nob3RPSyA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0NvbGxpc2lvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lTXV0ZWtpID0gMTIwO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB0aGlzLmlzRGVhZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNob3RPTiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzQ29udHJvbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmlzQ29sbGlzaW9uID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvL+apn+W9sei/veWKoFxuICAgIGFkZFNoYWRvdzogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgdGhpcy5zaGFkb3cgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcImd1bnNoaXBCbGFja1wiLCA0OCwgNDgpO1xuICAgICAgICB0aGlzLnNoYWRvdy5sYXllciA9IExBWUVSX1NIQURPVztcbiAgICAgICAgdGhpcy5zaGFkb3cuYWxwaGEgPSAwLjU7XG4gICAgICAgIHRoaXMuc2hhZG93LmFkZENoaWxkVG8odGhpcy5wYXJlbnRTY2VuZSk7XG4gICAgICAgIHRoaXMuc2hhZG93LnNldEZyYW1lSW5kZXgoNCkuc2V0U2NhbGUoMC42Nik7XG4gICAgICAgIHRoaXMuc2hhZG93LnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBncm91bmQgPSB0aGF0LnBhcmVudFNjZW5lLmdyb3VuZDtcbiAgICAgICAgICAgIGlmICghZ3JvdW5kLmlzU2hhZG93KSB7XG4gICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gdGhhdC5yb3RhdGlvbjtcbiAgICAgICAgICAgIHRoaXMueCA9IHRoYXQueCArIGdyb3VuZC5zaGFkb3dYO1xuICAgICAgICAgICAgdGhpcy55ID0gdGhhdC55ICsgZ3JvdW5kLnNoYWRvd1k7XG4gICAgICAgICAgICB0aGlzLnNjYWxlWCA9IGdyb3VuZC5zY2FsZVgqMC42NjtcbiAgICAgICAgICAgIHRoaXMuc2NhbGVZID0gZ3JvdW5kLnNjYWxlWSowLjY2O1xuICAgICAgICAgICAgdGhpcy5mcmFtZUluZGV4ID0gdGhhdC5zcHJpdGUuZnJhbWVJbmRleDtcbiAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRoYXQudmlzaWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44OT44OD44OI44Gu5b2xXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYiA9IHRoaXMuYml0c1tpXTtcbiAgICAgICAgICAgIGIucGFyZW50U2NlbmUgPSB0aGlzLnBhcmVudFNjZW5lO1xuICAgICAgICAgICAgYi5hZGRTaGFkb3coKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLy/jgqLjgqTjg4bjg6Dlj5blvpdcbiAgICBnZXRJdGVtOiBmdW5jdGlvbihraW5kKSB7XG4gICAgICAgIHN3aXRjaChraW5kKSB7XG4gICAgICAgICAgICBjYXNlIElURU1fUE9XRVI6XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInBvd2VydXBcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIElURU1fQk9NQjpcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwicG93ZXJ1cFwiKTtcbiAgICAgICAgICAgICAgICBhcHAuc2V0dGluZy5ib21iU3RvY2srKztcbiAgICAgICAgICAgICAgICBpZiAoYXBwLnNldHRpbmcuYm9tYlN0b2NrID4gYXBwLnNldHRpbmcuYm9tYlN0b2NrTWF4KSBhcHAuc2V0dGluZy5ib21iU3RvY2tNYXggPSBhcHAuc2V0dGluZy5ib21iU3RvY2s7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIElURU1fMVVQOlxuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJwb3dlcnVwXCIpO1xuICAgICAgICAgICAgICAgIGFwcC5zZXR0aW5nLnphbmtpKys7XG4gICAgICAgICAgICAgICAgaWYgKGFwcC5zZXR0aW5nLnphbmtpID4gOSkgYXBwLnNldHRpbmcuemFua2kgPSA5O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBwbGF5ZXJiaXQuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJQbGF5ZXJCaXRcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5TcHJpdGVcIixcblxuICAgIF9tZW1iZXI6IHtcbiAgICAgICAgbGF5ZXI6IExBWUVSX1BMQVlFUixcbiAgICAgICAgaWQ6IDAsXG4gICAgICAgIGFjdGl2ZTogZmFsc2UsXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KFwiYml0XCIsIDMyLCAzMik7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuXG4gICAgICAgIHRoaXMuc2V0U2NhbGUoMC41KTtcbiAgICAgICAgdGhpcy5pbmRleCA9IDA7XG4gICAgICAgIHRoaXMuaWQgPSBpZDtcblxuICAgICAgICB0aGlzLmFscGhhID0gMTtcblxuICAgICAgICB0aGlzLmJlZm9yZVggPSAwO1xuICAgICAgICB0aGlzLmJlZm9yZVkgPSAwO1xuXG4gICAgICAgIHRoaXMub24oJ3JlbW92ZWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNoYWRvdykgdGhpcy5zaGFkb3cucmVtb3ZlKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICB9LFxuXG4gICAgdXBkYXRlOiBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgaWYgKHRoaXMudGltZSAlIDIgPT0gMCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaWQgJSAyID09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4LS07XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5kZXggPCAwKSB0aGlzLmluZGV4ID0gODtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmRleCA9ICh0aGlzLmluZGV4KzEpJTk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldEZyYW1lSW5kZXgodGhpcy5pbmRleCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHBsYXllciA9IHRoaXMucGFyZW50O1xuICAgICAgICBpZiAocGxheWVyLnNob3RPTikge1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZSAlIHBsYXllci5zaG90SW50ZXJ2YWwgPT0gMCkge1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy54ICsgcGxheWVyLng7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnkgKyBwbGF5ZXIueTtcbiAgICAgICAgICAgICAgICB2YXIgc2wgPSBwbGF5ZXIucGFyZW50U2NlbmUuc2hvdExheWVyO1xuICAgICAgICAgICAgICAgIHNsLmVudGVyU2hvdCh4LCB5LTQsIHt0eXBlOiAxLCByb3RhdGlvbjogdGhpcy5yb3RhdGlvbiwgcG93ZXI6IHBsYXllci5zaG90UG93ZXJ9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwbGF5ZXIudHlwZSA9PSAxKSB7XG4gICAgICAgICAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5jbGFtcChwbGF5ZXIucm9sbGNvdW50LTUwLCAtMjUsIDI1KTtcbiAgICAgICAgICAgIGlmICgtNCA8IHRoaXMucm90YXRpb24gJiYgdGhpcy5yb3RhdGlvbiA8IDQpIHRoaXMucm90YXRpb24gPSAwO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG5cbiAgICBhZGRTaGFkb3c6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMuc2hhZG93ID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJiaXRCbGFja1wiLCAzMiwgMzIpO1xuICAgICAgICB0aGlzLnNoYWRvdy5sYXllciA9IExBWUVSX1NIQURPVztcbiAgICAgICAgdGhpcy5zaGFkb3cuYWxwaGEgPSAwLjU7XG4gICAgICAgIHRoaXMuc2hhZG93LmFkZENoaWxkVG8odGhpcy5wYXJlbnRTY2VuZSk7XG4gICAgICAgIHRoaXMuc2hhZG93LnNldEZyYW1lSW5kZXgoMCkuc2V0U2NhbGUoMC41KTtcbiAgICAgICAgdGhpcy5zaGFkb3cudXBkYXRlID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdmFyIGdyb3VuZCA9IHRoYXQucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICAgICAgaWYgKCFncm91bmQuaXNTaGFkb3cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMucm90YXRpb24gPSB0aGF0LnJvdGF0aW9uO1xuICAgICAgICAgICAgdGhpcy54ID0gdGhhdC54ICsgdGhhdC5wYXJlbnQueCArIGdyb3VuZC5zaGFkb3dYO1xuICAgICAgICAgICAgdGhpcy55ID0gdGhhdC55ICsgdGhhdC5wYXJlbnQueSArIGdyb3VuZC5zaGFkb3dZO1xuICAgICAgICAgICAgdGhpcy5zY2FsZVggPSBncm91bmQuc2NhbGVYKjAuNTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGVZID0gZ3JvdW5kLnNjYWxlWSowLjU7XG4gICAgICAgICAgICB0aGlzLmZyYW1lSW5kZXggPSB0aGF0LmZyYW1lSW5kZXg7XG4gICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0aGF0LnBhcmVudC52aXNpYmxlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgcGxheWVycG9pbnRlci5qc1xuICogIDIwMTUvMTAvMDlcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbi8v44OX44Os44Kk44Ok44O85pON5L2c55So44Od44Kk44Oz44K/XG5waGluYS5kZWZpbmUoXCJQbGF5ZXJQb2ludGVyXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuU2hhcGVcIixcbiAgICBsYXllcjogTEFZRVJfT0JKRUNUX0xPV0VSLFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHt3aWR0aDozMiwgaGVpZ2h0OjMyfSk7XG4gICAgICAgIHRoaXMuY2FudmFzLmxpbmVXaWR0aCA9IDM7XG4gICAgICAgIHRoaXMuY2FudmFzLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9IFwibGlnaHRlclwiO1xuICAgICAgICB0aGlzLmNhbnZhcy5zdHJva2VTdHlsZSA9IFwicmdiKDI1NSwgMjU1LCAyNTUpXCI7XG4gICAgICAgIHRoaXMuY2FudmFzLnN0cm9rZUFyYygxNiwgMTYsIDgsIE1hdGguUEkqMiwgMCwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oYXBwKSB7XG4gICAgICAgIHZhciBwID0gYXBwLm1vdXNlO1xuICAgICAgICBpZiAodGhpcy5wbGF5ZXIuaXNDb250cm9sICYmIHAuZ2V0UG9pbnRpbmcoKSkge1xuICAgICAgICAgICAgaWYgKH5+KHRoaXMueCkgPT0gfn4odGhpcy5wbGF5ZXIueCkgJiYgfn4odGhpcy55KSA9PSB+fih0aGlzLnBsYXllci55KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFscGhhID0gMC41O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy54ICs9IChwLnBvc2l0aW9uLnggLSBwLnByZXZQb3NpdGlvbi54KTtcbiAgICAgICAgICAgIHRoaXMueSArPSAocC5wb3NpdGlvbi55IC0gcC5wcmV2UG9zaXRpb24ueSk7XG4gICAgICAgICAgICB0aGlzLnggPSBNYXRoLmNsYW1wKHRoaXMueCwgMTYsIFNDX1ctMTYpO1xuICAgICAgICAgICAgdGhpcy55ID0gTWF0aC5jbGFtcCh0aGlzLnksIDE2LCBTQ19ILTE2KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMueCA9IHRoaXMucGxheWVyLng7XG4gICAgICAgICAgICB0aGlzLnkgPSB0aGlzLnBsYXllci55O1xuICAgICAgICAgICAgdGhpcy5hbHBoYSA9IDA7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iLCIvKlxuICogIHNob3QuanNcbiAqICAyMDE1LzEwLzA5XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG5cbnZhciBjaGVja0xheWVycyA9IFtMQVlFUl9PQkpFQ1RfVVBQRVIsIExBWUVSX09CSkVDVF9NSURETEUsIExBWUVSX09CSkVDVF9MT1dFUl07XG5cbnBoaW5hLmRlZmluZShcIlNob3RcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgREVGQVVMVF9QQVJBTToge1xuICAgICAgICB0eXBlOiAwLFxuICAgICAgICByb3RhdGlvbjogMCxcbiAgICAgICAgcG93ZXI6IDEwLFxuICAgICAgICB2ZWxvY2l0eTogMTUsXG4gICAgfSxcblxuICAgIHRpbWU6IDAsXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy5ib3VuZGluZ1R5cGUgPSBcImNpcmNsZVwiO1xuICAgICAgICB0aGlzLnJhZGl1cyA9IDZcblxuICAgICAgICB0aGlzLnNwcml0ZSA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwic2hvdFwiLCAxNiwgMzIpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lSW5kZXggPSAwO1xuICAgICAgICB0aGlzLnNwcml0ZS5hbHBoYSA9IDAuODtcbiAgICAgICAgdGhpcy5zcHJpdGUuYmxlbmRNb2RlID0gXCJsaWdodGVyXCI7XG5cbiAgICAgICAgdGhpcy5vbihcImVudGVyZnJhbWVcIiwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLnZ4O1xuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMudnk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLng8LTE2IHx8IHRoaXMueD5TQ19XKzE2IHx8IHRoaXMueTwtMTYgfHwgdGhpcy55PlNDX0grMTYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/mlbXjgajjga7lvZPjgorliKTlrprjg4Hjgqfjg4Pjgq9cbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWUgJSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBhcmVudFNjZW5lID0gdGhpcy5zaG90TGF5ZXIucGFyZW50U2NlbmU7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxheWVyID0gcGFyZW50U2NlbmUubGF5ZXJzW2NoZWNrTGF5ZXJzW2ldXTtcbiAgICAgICAgICAgICAgICAgICAgbGF5ZXIuY2hpbGRyZW4uZWFjaChmdW5jdGlvbihhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYSA9PT0gYXBwLnBsYXllcikgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucGFyZW50ICYmIGEuaXNDb2xsaXNpb24gJiYgYS5pc0hpdEVsZW1lbnQodGhpcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhLmRhbWFnZSh0aGlzLnBvd2VyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZhbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL+ODquODoOODvOODluaZglxuICAgICAgICB0aGlzLm9uKFwicmVtb3ZlZFwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy5zaG90TGF5ZXIucG9vbC5wdXNoKHRoaXMpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG5cbiAgICBzZXR1cDogZnVuY3Rpb24ocGFyYW0pIHtcbiAgICAgICAgcGFyYW0uJHNhZmUodGhpcy5ERUZBVUxUX1BBUkFNKTtcbiAgICAgICAgaWYgKHBhcmFtLnR5cGUgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zcHJpdGUuZnJhbWVJbmRleCA9IDA7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZS5zZXRTY2FsZSgyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLmZyYW1lSW5kZXggPSAxO1xuICAgICAgICAgICAgdGhpcy5zcHJpdGUuc2V0U2NhbGUoMS41LCAxLjApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IHBhcmFtLnJvdGF0aW9uO1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gcGFyYW0udmVsb2NpdHk7XG4gICAgICAgIHRoaXMucG93ZXIgPSBwYXJhbS5wb3dlcjtcblxuICAgICAgICB2YXIgcm90ID0gcGFyYW0ucm90YXRpb24tOTA7XG4gICAgICAgIHRoaXMudnggPSBNYXRoLmNvcyhyb3QqdG9SYWQpKnRoaXMudmVsb2NpdHk7XG4gICAgICAgIHRoaXMudnkgPSBNYXRoLnNpbihyb3QqdG9SYWQpKnRoaXMudmVsb2NpdHk7XG5cbiAgICAgICAgLy/lvZPjgorliKTlrproqK3lrppcbiAgICAgICAgaWYgKHBhcmFtLnR5cGUgPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5yYWRpdXMgPSA4O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yYWRpdXMgPSAxNjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYmVmb3JlWCA9IHRoaXMueDtcbiAgICAgICAgdGhpcy5iZWZvcmVZID0gdGhpcy55O1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICB2YW5pc2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZ3JvdW5kID0gdGhpcy5zaG90TGF5ZXIucGFyZW50U2NlbmUuZ3JvdW5kO1xuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLnNob3RMYXllci5wYXJlbnRTY2VuZS5lZmZlY3RMYXllclVwcGVyO1xuICAgICAgICBsYXllci5lbnRlclNob3RJbXBhY3Qoe1xuICAgICAgICAgICAgcG9zaXRpb246e3g6IHRoaXMueCwgeTogdGhpcy55fSxcbiAgICAgICAgfSk7XG4gICAgICAgIEVmZmVjdC5lbnRlckRlYnJpcyhsYXllciwge1xuICAgICAgICAgICAgbnVtOiAyLFxuICAgICAgICAgICAgcG9zaXRpb246e3g6IHRoaXMueCwgeTogdGhpcy55fSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogZ3JvdW5kLmRlbHRhWCwgeTogZ3JvdW5kLmRlbHRhWSwgZGVjYXk6IDAuOX0sXG4gICAgICAgIH0pO1xuICAgIH0sXG59KTtcblxufSk7XG4iLCIvKlxuICogIHNob3RsYXllci5qc1xuICogIDIwMTUvMTEvMTdcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG5cbnBoaW5hLmRlZmluZShcIlNob3RMYXllclwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIG1heDogNjQsXG4gICAgICAgIHBvb2wgOiBudWxsLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy4kZXh0ZW5kKHRoaXMuX21lbWJlcik7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB0aGlzLnBvb2wgPSBBcnJheS5yYW5nZSgwLCB0aGlzLm1heCkubWFwKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGIgPSBTaG90KCk7XG4gICAgICAgICAgICBiLnNob3RMYXllciA9IHNlbGY7XG4gICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIC8v5by+5oqV5YWlXG4gICAgZW50ZXJTaG90OiBmdW5jdGlvbih4LCB5LCBvcHRpb24pIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLnBvb2wuc2hpZnQoKTtcbiAgICAgICAgaWYgKCFiKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJTaG90IGVtcHR5ISFcIik7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBiLnNldHVwKG9wdGlvbikuYWRkQ2hpbGRUbyh0aGlzKS5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgfSxcblxuICAgIC8v5by+44KS5raI5Y67XG4gICAgZXJhY2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICBiID0gbGlzdFtpXTtcbiAgICAgICAgICAgIGIuZXJhc2UoKTtcbiAgICAgICAgICAgIGIucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG4iLCIvKlxuICogIGNvbnRpbnVlc2NlbmUuanNcbiAqICAyMDE2LzAzLzI5XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuIFxucGhpbmEuZGVmaW5lKFwiQ29udGludWVTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZVwiLFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICBsYWJlbFBhcmFtOiB7XG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmxhY2tcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIlVidW50dU1vbm9cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihjdXJyZW50U2NlbmUpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy4kZXh0ZW5kKHRoaXMuX21lbWJlcik7XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U2NlbmUgPSBjdXJyZW50U2NlbmU7XG4gICAgICAgIHRoaXMueWVzID0gdHJ1ZTtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICB2YXIgcGFyYW0gPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XKjAuNixcbiAgICAgICAgICAgIGhlaWdodDpTQ19IKjAuMyxcbiAgICAgICAgICAgIGZpbGw6IFwicmdiYSgwLDAsMCwwLjcpXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwicmdiYSgwLDAsMCwwLjcpXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmcgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG5cbiAgICAgICAgLy/pgbjmip7jgqvjg7zjgr3jg6tcbiAgICAgICAgdmFyIHBhcmFtMiA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1cqMC4xNSxcbiAgICAgICAgICAgIGhlaWdodDpTQ19IKjAuMSxcbiAgICAgICAgICAgIGZpbGw6IFwicmdiYSgwLDIwMCwyMDAsMC41KVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcInJnYmEoMCwyMDAsMjAwLDAuNSlcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jdXJzb2wgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtMilcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjQsIFNDX0gqMC41NSlcblxuICAgICAgICAvL+OCv+ODg+ODgeeUqOOCq+ODvOOCveODq1xuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMuY3Vyc29sMSA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0yKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNCwgU0NfSCowLjU1KVxuICAgICAgICAgICAgLnNldEludGVyYWN0aXZlKHRydWUpO1xuICAgICAgICB0aGlzLmN1cnNvbDEuYWxwaGEgPSAwO1xuICAgICAgICB0aGlzLmN1cnNvbDEub25wb2ludGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoYXQueWVzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5nb3RvQ29udGludWUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJzb2wudHdlZW5lci5jbGVhcigpLm1vdmVUbyhTQ19XKjAuNCwgU0NfSCowLjU1LCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgIHRoYXQueWVzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3Vyc29sMiA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0yKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNiwgU0NfSCowLjU1KVxuICAgICAgICAgICAgLnNldEludGVyYWN0aXZlKHRydWUpO1xuICAgICAgICB0aGlzLmN1cnNvbDIuYWxwaGEgPSAwO1xuICAgICAgICB0aGlzLmN1cnNvbDIub25wb2ludGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKCF0aGF0Lnllcykge1xuICAgICAgICAgICAgICAgIHRoYXQuZ290b0dhbWVvdmVyKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoYXQuY3Vyc29sLnR3ZWVuZXIuY2xlYXIoKS5tb3ZlVG8oU0NfVyowLjYsIFNDX0gqMC41NSwgMjAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICB0aGF0LnllcyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzZWxlY3RcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+OCs+ODs+ODhuOCo+ODi+ODpeODvOihqOekulxuICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIkNPTlRJTlVFP1wifS4kc2FmZSh0aGlzLmxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjQwKTtcblxuICAgICAgICB0aGlzLmx5ZXMgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIllFU1wifS4kc2FmZSh0aGlzLmxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNCwgU0NfSCowLjU1KTtcbiAgICAgICAgdGhpcy5seWVzLmJsaW5rID0gZmFsc2U7XG4gICAgICAgIHRoaXMubHllcy51cGRhdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibGluayAmJiBlLnRpY2tlci5mcmFtZSAlIDEwID09IDApIHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxubyA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiTk9cIn0uJHNhZmUodGhpcy5sYWJlbFBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjYsIFNDX0gqMC41NSk7XG4gICAgICAgIHRoaXMubG5vLmJsaW5rID0gZmFsc2U7XG4gICAgICAgIHRoaXMubG5vLnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsaW5rICYmIGUudGlja2VyLmZyYW1lICUgMTAgPT0gMCkgdGhpcy52aXNpYmxlID0gIXRoaXMudmlzaWJsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Kr44Km44Oz44K/6KGo56S6XG4gICAgICAgIHRoaXMuY291bnRlciA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiOVwiLCBmb250U2l6ZTogMzB9LiRzYWZlKHRoaXMubGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNDUpO1xuICAgICAgICB0aGlzLmNvdW50ZXIuY291bnQgPSA5O1xuICAgICAgICB0aGlzLmNvdW50ZXIudHdlZW5lci5jbGVhcigpLndhaXQoMTAwMCkuY2FsbChmdW5jdGlvbigpIHt0aGlzLmNvdW50LS07fS5iaW5kKHRoaXMuY291bnRlcikpLnNldExvb3AodHJ1ZSk7XG4gICAgICAgIHRoaXMuY291bnRlci51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IFwiXCIrdGhpcy5jb3VudDtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvdW50IDwgMCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFNjZW5lLmZsYXJlKFwiZ2FtZW92ZXJcIik7XG4gICAgICAgICAgICAgICAgYXBwLnBvcFNjZW5lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lID0gMDsgICAgICAgIFxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5pc1NlbGVjdGVkKSByZXR1cm47XG5cbiAgICAgICAgLy/jgq3jg7zjg5zjg7zjg4nmk43kvZxcbiAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgIGlmIChjdC5sZWZ0KSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMueWVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgIC5tb3ZlVG8oU0NfVyowLjQsIFNDX0gqMC41NSwgMjAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICB0aGlzLnllcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInNlbGVjdFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY3QucmlnaHQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnllcykge1xuICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAubW92ZVRvKFNDX1cqMC42LCBTQ19IKjAuNTUsIDIwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgdGhpcy55ZXMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRpbWUgPiAzMCkge1xuICAgICAgICAgICAgaWYgKGN0Lm9rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwiY2xpY2tcIik7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMueWVzKSB7IFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmdvdG9Db250aW51ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ290b0dhbWVvdmVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG5cbiAgICBnb3RvQ29udGludWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmx5ZXMuYmxpbmsgPSB0cnVlO1xuICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZS5mbGFyZShcImNvbnRpbnVlXCIpO1xuICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKS53YWl0KDEwMDApLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcHAucG9wU2NlbmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnb3RvR2FtZW92ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmxuby5ibGluayA9IHRydWU7XG4gICAgICAgIHRoaXMuY3VycmVudFNjZW5lLmZsYXJlKFwiZ2FtZW92ZXJcIik7XG4gICAgICAgIGFwcC5wb3BTY2VuZSgpO1xuICAgIH0sXG59KTtcblxuIiwiLypcbiAqICBHYW1lT3ZlclNjZW5lLmpzXG4gKiAgMjAxNC8wNi8wNFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcIkdhbWVPdmVyU2NlbmVcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmVcIixcbiAgICBcbiAgICBfbWVtYmVyOiB7XG4gICAgICAgIC8v44Op44OZ44Or55So44OR44Op44Oh44O844K/XG4gICAgICAgIHRpdGxlUGFyYW06IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmx1ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMzIsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgICAgICBtc2dQYXJhbToge1xuICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH0sXG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICB0aGlzLiRleHRlbmQodGhpcy5fbWVtYmVyKTtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICB2YXIgcGFyYW0gPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XLFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gsXG4gICAgICAgICAgICBmaWxsOiAnYmxhY2snLFxuICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcbiAgICAgICAgdGhpcy5iZy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiR0FNRSBPVkVSXCJ9LiRzYWZlKHRoaXMudGl0bGVQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSk7XG5cbiAgICAgICAgdGhpcy5tYXNrID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICB0aGlzLm1hc2sudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKS5mYWRlT3V0KDMwKTtcblxuICAgICAgICAvL++8ou+8p++8ree1guS6huaZguOBq+OCt+ODvOODs+OCkuaKnOOBkeOCi1xuICAgICAgICBhcHAucGxheUJHTShcImdhbWVvdmVyXCIsIGZhbHNlLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oYXBwKSB7XG4gICAgICAgIC8v44Kt44O844Oc44O844OJ5pON5L2cXG4gICAgICAgIHZhciBjdCA9IGFwcC5jb250cm9sbGVyO1xuICAgICAgICBpZiAodGhpcy50aW1lID4gMzApIHtcbiAgICAgICAgICAgIGlmIChjdC5vayB8fCBjdC5jYW5jZWwpIHtcbiAgICAgICAgICAgICAgICBhcHAuc3RvcEJHTSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZXhpdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgIH0sXG5cbiAgICAvL+OCv+ODg+ODgW9y44Kv44Oq44OD44Kv6ZaL5aeL5Yem55CGXG4gICAgb25wb2ludHN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgfSxcblxuICAgIC8v44K/44OD44OBb3Ljgq/jg6rjg4Pjgq/np7vli5Xlh6bnkIZcbiAgICBvbnBvaW50bW92ZTogZnVuY3Rpb24oZSkge1xuICAgIH0sXG5cbiAgICAvL+OCv+ODg+ODgW9y44Kv44Oq44OD44Kv57WC5LqG5Yem55CGXG4gICAgb25wb2ludGVuZDogZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy50aW1lID4gMzApIHtcbiAgICAgICAgICAgIGFwcC5zdG9wQkdNKCk7XG4gICAgICAgICAgICB0aGlzLmV4aXQoKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcbiIsIi8qXG4gKiAgTG9hZGluZ1NjZW5lLmpzXG4gKiAgMjAxNS8wOS8wOFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxuLy/jgqLjgrvjg4Pjg4jjg63jg7zjg4nnlKjjgrfjg7zjg7NcbnBoaW5hLmRlZmluZShcIkxvYWRpbmdTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZVwiLFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9ucykge1xuICAgICAgICBvcHRpb25zLmFzc2V0VHlwZSA9IG9wdGlvbnMuYXNzZXRUeXBlIHx8IFwiY29tbW9uXCI7XG4gICAgICAgIG9wdGlvbnMgPSAob3B0aW9uc3x8e30pLiRzYWZlKHtcbiAgICAgICAgICAgIGFzc2V0OiBBcHBsaWNhdGlvbi5hc3NldHNbb3B0aW9ucy5hc3NldFR5cGVdLFxuICAgICAgICAgICAgd2lkdGg6IFNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6IFNDX0gsXG4gICAgICAgICAgICBsaWU6IGZhbHNlLFxuICAgICAgICAgICAgZXhpdFR5cGU6IFwiYXV0b1wiLFxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zdXBlckluaXQob3B0aW9ucyk7XG5cbiAgICAgICAgLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4lcbiAgICAgICAgdmFyIHBhcmFtID0ge1xuICAgICAgICAgICAgd2lkdGg6U0NfVyxcbiAgICAgICAgICAgIGhlaWdodDpTQ19ILFxuICAgICAgICAgICAgZmlsbDogJ2JsYWNrJyxcbiAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmcgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgIHRoaXMuYmcudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcblxuICAgICAgICAvL+ODreODvOODieOBmeOCi+eJqeOBjOeEoeOBhOWgtOWQiOOCueOCreODg+ODl1xuICAgICAgICB0aGlzLmZvcmNlRXhpdCA9IGZhbHNlO1xuICAgICAgICB2YXIgYXNzZXQgPSBvcHRpb25zLmFzc2V0O1xuICAgICAgICBpZiAoIWFzc2V0LiRoYXMoXCJzb3VuZFwiKSAmJiAhYXNzZXQuJGhhcyhcImltYWdlXCIpICYmICFhc3NldC4kaGFzKFwiZm9udFwiKSAmJiAhYXNzZXQuJGhhcyhcInNwcml0ZXNoZWV0XCIpICYmICFhc3NldC4kaGFzKFwic2NyaXB0XCIpKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlRXhpdCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGFiZWxQYXJhbSA9IHtcbiAgICAgICAgICAgIHRleHQ6IFwiTG9hZGluZ1wiLFxuICAgICAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcImJsdWVcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDMwXG4gICAgICAgIH07XG4gICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwobGFiZWxQYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KTtcblxuICAgICAgICB0aGlzLmZyb21KU09OKHtcbiAgICAgICAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgICAgICAgICAgZ2F1Z2U6IHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiAncGhpbmEudWkuR2F1Z2UnLFxuICAgICAgICAgICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgqMC41LFxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiA1LFxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3I6ICdibGFjaycsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2F1Z2VDb2xvcjogJ2JsdWUnLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFkZGluZzogMCxcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgeDogdGhpcy5ncmlkWC5jZW50ZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgeTogU0NfSCowLjUrMjAsXG4gICAgICAgICAgICAgICAgICAgIG9yaWdpblk6IDAsXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5nYXVnZS51cGRhdGUgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLmdhdWdlQ29sb3IgPSAnaHNsYSh7MH0sIDEwMCUsIDUwJSwgMC44KScuZm9ybWF0KGUudGlja2VyLmZyYW1lKjMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvYWRlciA9IHBoaW5hLmFzc2V0LkFzc2V0TG9hZGVyKCk7XG4gICAgICAgIGlmIChvcHRpb25zLmxpZSkge1xuICAgICAgICAgICAgdGhpcy5nYXVnZS5hbmltYXRpb25UaW1lID0gMTAqMTAwMDtcbiAgICAgICAgICAgIHRoaXMuZ2F1Z2UudmFsdWUgPSA5MDtcbiAgICAgICAgICAgIGxvYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdhdWdlLmFuaW1hdGlvblRpbWUgPSAxKjEwMDA7XG4gICAgICAgICAgICAgICAgdGhpcy5nYXVnZS52YWx1ZSA9IDEwMDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvYWRlci5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ2F1Z2UudmFsdWUgPSBlLnByb2dyZXNzKjEwMDtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmdhdWdlLm9uZnVsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZXhpdFR5cGUgPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLl9vbkxvYWRBc3NldHMoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIGxvYWRlci5sb2FkKG9wdGlvbnMuYXNzZXQpO1xuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZm9yY2VFeGl0KSB0aGlzLmV4aXQoKTtcbiAgICB9LCAgICBcbn0pO1xuIiwiLypcbiAqICBNYWluU2NlbmUuanNcbiAqICAyMDE1LzA5LzA4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJNYWluU2NlbmVcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5U2NlbmVcIixcblxuICAgIF9tZW1iZXI6IHtcbiAgICAgICAgLy/jgrfjg7zjg7PlhoXoqK3lrppcbiAgICAgICAgYm9tYlRpbWU6IDAsICAgIC8v44Oc44Og5Yq55p6c57aZ57aa5q6L44KK44OV44Os44O844Og5pWwXG4gICAgICAgIHRpbWVWYW5pc2g6IDAsICAvL+W8vua2iOOBl+aZgumWk1xuXG4gICAgICAgIC8v54++5Zyo44K544OG44O844K477yp77ykXG4gICAgICAgIHN0YWdlSWQ6IDEsXG4gICAgICAgIG1heFN0YWdlSWQ6IDIsXG5cbiAgICAgICAgLy/jg5fjg6njgq/jg4bjgqPjgrnjg6Ljg7zjg4njg5Xjg6njgrBcbiAgICAgICAgaXNQcmFjdGljZTogZmFsc2UsXG5cbiAgICAgICAgLy/jgrnjg4bjg7zjgrjjgq/jg6rjgqLjg5Xjg6njgrBcbiAgICAgICAgaXNTdGFnZUNsZWFyOiBmYWxzZSxcblxuICAgICAgICAvL+OCsuODvOODoOOCquODvOODkOODvOODleODqeOCsFxuICAgICAgICBpc0dhbWVPdmVyOiBmYWxzZSxcblxuICAgICAgICAvL+ODnOOCueaIpumXmOS4reODleODqeOCsFxuICAgICAgICBpc0Jvc3NCYXR0bGU6IGZhbHNlLFxuICAgICAgICBib3NzT2JqZWN0OiBudWxsLFxuXG4gICAgICAgIC8v5ZCE56iu5Yik5a6a55SoXG4gICAgICAgIG1pc3NDb3VudDogMCwgICAgICAgLy/jg5fjg6zjgqTjg6Tjg7znt4/jg5/jgrnlm57mlbBcbiAgICAgICAgc3RhZ2VNaXNzQ291bnQ6IDAsICAvL+ODl+ODrOOCpOODpOODvOOCueODhuODvOOCuOWGheODn+OCueWbnuaVsFxuXG4gICAgICAgIC8v5pW16Zai6YCjICAgICAgICBcbiAgICAgICAgZW5lbXlDb3VudDogMCwgIC8v5pW157eP5pWwXG4gICAgICAgIGVuZW15S2lsbDogMCwgICAvL+aVteegtOWjiuaVsFxuICAgICAgICBlbmVteUlEOiAwLCAgICAgLy/mlbXorZjliKXlrZBcblxuICAgICAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgICAgICBsYWJlbFBhcmFtOiB7XG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmx1ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMzIsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgICAgICBzY29yZWxhYmVsUGFyYW06IHtcbiAgICAgICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJibGFja1wiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDEsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiVWJ1bnR1TW9ub1wiLFxuICAgICAgICAgICAgYWxpZ246IFwibGVmdFwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMjAsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy4kZXh0ZW5kKHRoaXMuX21lbWJlcik7XG5cbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUoe3N0YWdlSWQ6IDF9KTtcbiAgICAgICAgdGhpcy5zdGFnZUlkID0gb3B0aW9uLnN0YWdlSWQ7XG4gICAgICAgIHRoaXMuaXNQcmFjdGljZSA9IChvcHRpb24uaXNQcmFjdGljZSA9PSB1bmRlZmluZWQpPyBmYWxzZTogb3B0aW9uLmlzUHJhY3RpY2U7XG5cbiAgICAgICAgLy/jg5Djg4Pjgq/jgrDjg6njgqbjg7Pjg4lcbiAgICAgICAgdmFyIHBhcmFtID0ge1xuICAgICAgICAgICAgd2lkdGg6U0NfVyxcbiAgICAgICAgICAgIGhlaWdodDpTQ19ILFxuICAgICAgICAgICAgZmlsbDogJ2JsYWNrJyxcbiAgICAgICAgICAgIHN0cm9rZTogZmFsc2UsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmcgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgIHRoaXMuYmcudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcblxuICAgICAgICAvL+OCqOODleOCp+OCr+ODiOODl+ODvOODq1xuICAgICAgICB2YXIgZWZmZWN0UG9vbCA9IEVmZmVjdFBvb2woMjA0OCwgdGhpcyk7XG5cbiAgICAgICAgLy/jg5fjg6zjgqTjg6Tjg7zmg4XloLHliJ3mnJ/ljJZcbiAgICAgICAgYXBwLnNjb3JlID0gMDtcbiAgICAgICAgYXBwLnJhbmsgPSAxXG4gICAgICAgIGFwcC5udW1Db250aW51ZSA9IDA7XG4gICAgICAgIGFwcC5zZXR0aW5nLiRleHRlbmQoYXBwLmN1cnJlbnRyeVNldHRpbmcpO1xuXG4gICAgICAgIC8v44Os44Kk44Ok44O85rqW5YKZXG4gICAgICAgIHRoaXMuYmFzZSA9IHBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQoKS5hZGRDaGlsZFRvKHRoaXMpLnNldFBvc2l0aW9uKFNDX09GRlNFVF9YLCAwKTtcbiAgICAgICAgdGhpcy5sYXllcnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBMQVlFUl9TWVNURU0rMTsgaSsrKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIExBWUVSX0JVTExFVDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNbaV0gPSBCdWxsZXRMYXllcigpLmFkZENoaWxkVG8odGhpcy5iYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5idWxsZXRMYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExBWUVSX1NIT1Q6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzW2ldID0gU2hvdExheWVyKCkuYWRkQ2hpbGRUbyh0aGlzLmJhc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3RMYXllciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExBWUVSX0VGRkVDVF9VUFBFUjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXllcnNbaV0gPSBFZmZlY3RMYXllcihlZmZlY3RQb29sKS5hZGRDaGlsZFRvKHRoaXMuYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWZmZWN0TGF5ZXJVcHBlciA9IHRoaXMubGF5ZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIExBWUVSX0VGRkVDVF9NSURETEU6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzW2ldID0gRWZmZWN0TGF5ZXIoZWZmZWN0UG9vbCkuYWRkQ2hpbGRUbyh0aGlzLmJhc2UpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVmZmVjdExheWVyTWlkZGxlID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTEFZRVJfRUZGRUNUX0xPV0VSOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVyc1tpXSA9IEVmZmVjdExheWVyKGVmZmVjdFBvb2wpLmFkZENoaWxkVG8odGhpcy5iYXNlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZmZlY3RMYXllckxvd2VyID0gdGhpcy5sYXllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgTEFZRVJfU0hBRE9XOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxheWVyc1tpXSA9IHBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQoKS5hZGRDaGlsZFRvKHRoaXMuYmFzZSk7XG4gICAgICAgICAgICAgICAgICAgIC8v5Zyw5b2i44Go5b2x44Os44Kk44Ok44O844Gu44G/55uu6Zqg44GXXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdW5kTWFzayA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLmJhc2UpXG4gICAgICAgICAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ncm91bmRNYXNrLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ3JvdW5kTWFzay50d2VlbmVyLmNsZWFyKCkuZmFkZU91dCgyMCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGF5ZXJzW2ldID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpLmFkZENoaWxkVG8odGhpcy5iYXNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubGF5ZXJzW2ldLnBhcmVudFNjZW5lID0gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44OX44Os44Kk44Ok44O85rqW5YKZXG4gICAgICAgIHZhciBwbGF5ZXIgPSB0aGlzLnBsYXllciA9IFBsYXllcigpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLmFkZFNoYWRvdygpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICAgICAgLnN0YWdlU3RhcnR1cCgpO1xuICAgICAgICBwbGF5ZXIuc2hvdExheWVyID0gdGhpcy5zaG90TGF5ZXI7XG4gICAgICAgIGFwcC5wbGF5ZXIgPSB0aGlzLnBsYXllcjtcblxuLy8gICAgICAgIHRoaXMucG9pbnRlciA9IFBsYXllclBvaW50ZXIoKS5hZGRDaGlsZFRvKHRoaXMpO1xuLy8gICAgICAgIHRoaXMucG9pbnRlci5wbGF5ZXIgPSB0aGlzLnBsYXllcjtcblxuICAgICAgICAvL+W8vuW5leioreWumuOCr+ODqeOCuVxuICAgICAgICBCdWxsZXRDb25maWcuc2V0dXAocGxheWVyLCB0aGlzLmJ1bGxldExheWVyKTtcblxuICAgICAgICAvL+OCt+OCueODhuODoOihqOekuuODmeODvOOCuVxuICAgICAgICB0aGlzLnN5c3RlbUJhc2UgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KCkuYWRkQ2hpbGRUbyh0aGlzLmJhc2UpO1xuXG4gICAgICAgIC8v44Oc44K56ICQ5LmF5Yqb44Ky44O844K4XG4gICAgICAgIHZhciBnYXVnZVN0eWxlID0ge1xuICAgICAgICAgICAgd2lkdGg6IFNDX1cqMC45LFxuICAgICAgICAgICAgaGVpZ2h0OiAxMCxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgICAgZmlsbDogJ3JnYmEoMCwgMCwgMjAwLCAxLjApJyxcbiAgICAgICAgICAgICAgICBlbXB0eTogJ3JnYmEoMCwgMCwgMCwgMC4wKScsXG4gICAgICAgICAgICAgICAgc3Ryb2tlOiAncmdiYSgyNTUsIDI1NSwgMjU1LCAxLjApJyxcbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aDogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ib3NzR2F1Z2UgPSBwaGluYS5leHRlbnNpb24uR2F1Z2UoZ2F1Z2VTdHlsZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgLTEwKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5zeXN0ZW1CYXNlKTtcblxuICAgICAgICAvL+OCueOCs+OCouihqOekulxuICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbCA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6XCJTQ09SRTpcIn0uJHNhZmUodGhpcy5zY29yZWxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5zeXN0ZW1CYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDEwLCAxMCk7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbC5zY29yZSA9IDA7XG4gICAgICAgIHRoaXMuc2NvcmVMYWJlbC5zID0gMDtcbiAgICAgICAgdGhpcy5zY29yZUxhYmVsLnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmIChlLnRpY2tlci5mcmFtZSUxMCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zID0gfn4oKGFwcC5zY29yZS10aGlzLnNjb3JlKS83KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zIDwgMykgdGhpcy5zID0gMztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zID4gNzc3NykgdGhpcy5zID0gNzc3NztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gdGhpcy5zO1xuICAgICAgICAgICAgaWYgKHRoaXMuc2NvcmUgPiBhcHAuc2NvcmUpIHRoaXMuc2NvcmUgPSBhcHAuc2NvcmU7XG5cbiAgICAgICAgICAgIHRoaXMudGV4dCA9IFwiU0NPUkUgXCIrdGhpcy5zY29yZS5jb21tYSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg6njg7Pjgq/ooajnpLpcbiAgICAgICAgdGhpcy5yYW5rTGFiZWwgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OlwiUkFOSzpcIn0uJHNhZmUodGhpcy5zY29yZWxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5zeXN0ZW1CYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDEwLCAzMCk7XG4gICAgICAgIHRoaXMucmFua0xhYmVsLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50ZXh0ID0gXCJSQU5LIFwiK2FwcC5yYW5rO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8v5q6L5qmf6KGo56S6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMuc3ByaXRlID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJndW5zaGlwXCIsIDQ4LCA0OClcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnN5c3RlbUJhc2UpXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoNClcbiAgICAgICAgICAgICAgICAuc2V0U2NhbGUoMC4zKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihpKjE2KzE2LCA0OCk7XG4gICAgICAgICAgICBzLm51bSA9IGk7XG4gICAgICAgICAgICBzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIHMudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgaWYgKGFwcC5zZXR0aW5nLnphbmtpLTEgPiB0aGlzLm51bSkgdGhpcy52aXNpYmxlID0gdHJ1ZTsgZWxzZSB0aGlzLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v5q6L44Oc44Og6KGo56S6XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgOTsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcyA9IHRoaXMuc3ByaXRlID0gcGhpbmEuZGlzcGxheS5TcHJpdGUoXCJib21iXCIsIDk2LCA5NilcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLnN5c3RlbUJhc2UpXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgICAgICAuc2V0U2NhbGUoMC4xNilcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oaSoxNisxNiwgNjQpO1xuICAgICAgICAgICAgcy5udW0gPSBpO1xuICAgICAgICAgICAgcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICBzLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmIChhcHAuc2V0dGluZy5ib21iU3RvY2tNYXggPiB0aGlzLm51bSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXBwLnNldHRpbmcuYm9tYlN0b2NrID4gdGhpcy5udW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWxwaGEgPSAxLjA7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFscGhhID0gMC40O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGxwYXJhbSA9IHtcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIkJcIixcbiAgICAgICAgICAgICAgICBmaWxsOiBcImJsdWVcIixcbiAgICAgICAgICAgICAgICBzdHJva2U6IFwiYmxhY2tcIixcbiAgICAgICAgICAgICAgICBzdHJva2VXaWR0aDogMixcbiAgICAgICAgICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgICAgICAgICAgYWxpZ246IFwiY2VudGVyXCIsXG4gICAgICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDMyLFxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbChscGFyYW0pLmFkZENoaWxkVG8ocykuc2V0U2NhbGUoMi41KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Oc44Og44Oc44K/44OzXG4gICAgICAgIHRoaXMuYnV0dG9uQm9tYiA9IHBoaW5hLmV4dGVuc2lvbi5DaXJjbGVCdXR0b24oe3JhZGl1czogMTZ9KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5zeXN0ZW1CYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDIwLCBTQ19IKjAuOSk7XG5cbiAgICAgICAgLy/nm67pmqDjgZfvvIjpu5LvvIlcbiAgICAgICAgdGhpcy5tYXNrID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KTtcbiAgICAgICAgdGhpcy5tYXNrLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG4gICAgICAgIHRoaXMubWFzay50d2VlbmVyLmNsZWFyKCkuZmFkZU91dCgyMCk7XG5cbiAgICAgICAgLy/nm67pmqDjgZfvvIjnmb3vvIlcbiAgICAgICAgdGhpcy5tYXNrV2hpdGUgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtLiRleHRlbmQoe2ZpbGw6IFwid2hpdGVcIn0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpO1xuICAgICAgICB0aGlzLm1hc2tXaGl0ZS50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuICAgICAgICB0aGlzLm1hc2tXaGl0ZS5hbHBoYSA9IDAuMDtcblxuICAgICAgICAvL+OCueODhuODvOOCuOWIneacn+WMllxuICAgICAgICB0aGlzLmluaXRTdGFnZSgpO1xuXG4gICAgICAgIC8v44Kk44OZ44Oz44OI5Yem55CGXG4gICAgICAgIC8v44Oc44K55oim6ZaL5aeLXG4gICAgICAgIHRoaXMub24oJ3N0YXJ0X2Jvc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaXNCb3NzQmF0dGxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuc3lzdGVtQmFzZS50d2VlbmVyLmNsZWFyKCkudG8oe3k6IDIwfSwgMTAwMCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/jg5zjgrnmkoPnoLRcbiAgICAgICAgdGhpcy5vbignZW5kX2Jvc3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaXNCb3NzQmF0dGxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnN5c3RlbUJhc2UudHdlZW5lci5jbGVhcigpLnRvKHt5OiAwfSwgMTAwMCk7XG5cbiAgICAgICAgICAgIC8v44Oc44K544K/44Kk44OX5Yik5a6aXG4gICAgICAgICAgICBpZiAodGhpcy5ib3NzT2JqZWN0LnR5cGUgPT0gRU5FTVlfTUJPU1MpIHtcbiAgICAgICAgICAgICAgICAvL+S4reODnOOCueOBruWgtOWQiOaXqeWbnuOBl1xuICAgICAgICAgICAgICAgIHZhciB0aW1lID0gdGhpcy5zdGFnZS5nZXROZXh0RXZlbnRUaW1lKHRoaXMudGltZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRpbWUgPiAwKSB0aGlzLnRpbWUgPSB0aW1lLTE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v44K544OG44O844K444Oc44K544Gu5aC05ZCI44K544OG44O844K444Kv44Oq44KiXG4gICAgICAgICAgICAgICAgdGhpcy5mbGFyZSgnc3RhZ2VjbGVhcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5ib3NzT2JqZWN0ID0gbnVsbDtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+OCueODhuODvOOCuOOCr+ODquOColxuICAgICAgICB0aGlzLm9uKCdzdGFnZWNsZWFyJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL+ODl+ODrOOCpOODpOOCt+ODp+ODg+ODiOOCquODleODu+W9k+OBn+OCiuWIpOWumueEoeOBl1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuaXNTaG90T0sgID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5pc0NvbGxpc2lvbiAgPSBmYWxzZTtcblxuICAgICAgICAgICAgLy/vvJHvvJDnp5Llvozjgavjg6rjgrbjg6vjg4jlh6bnkIZcbiAgICAgICAgICAgIHBoaW5hLmFwcC5PYmplY3QyRCgpLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgLndhaXQoMTAwMDApXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVzdWx0KCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL+OCs+ODs+ODhuOCo+ODi+ODpeODvOaZglxuICAgICAgICB0aGlzLm9uKFwiY29udGludWVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcHAubnVtQ29udGludWUrKztcblxuICAgICAgICAgICAgLy/liJ3mnJ/nirbmhYvjgbjmiLvjgZlcbiAgICAgICAgICAgIGFwcC5zY29yZSA9IDA7XG4gICAgICAgICAgICBhcHAucmFuayA9IDE7XG4gICAgICAgICAgICBhcHAuc2V0dGluZy56YW5raSA9IGFwcC5jdXJyZW50cnlTZXR0aW5nLnphbmtpO1xuICAgICAgICAgICAgYXBwLnNldHRpbmcuYm9tYlN0b2NrID0gYXBwLnNldHRpbmcuYm9tYlN0b2NrTWF4O1xuXG4gICAgICAgICAgICB0aGlzLnBsYXllci52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLnN0YXJ0dXAoKTtcbiAgICAgICAgICAgIHRoaXMuc2NvcmVMYWJlbC5zY29yZSA9IDA7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/jgrLjg7zjg6Djgqrjg7zjg5Djg7zmmYJcbiAgICAgICAgdGhpcy5vbihcImdhbWVvdmVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgYXBwLnN0b3BCR00oKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzUHJhY3RpY2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXQoXCJtZW51XCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4aXQoXCJnYW1lb3ZlclwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIFxuICAgIHVwZGF0ZTogZnVuY3Rpb24oYXBwKSB7XG4gICAgICAgIC8v44K544OG44O844K46YCy6KGMXG4gICAgICAgIHZhciBldmVudCA9IHRoaXMuc3RhZ2UuZ2V0KHRoaXMudGltZSk7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZihldmVudC52YWx1ZSkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBldmVudC52YWx1ZS5jYWxsKHRoaXMsIGV2ZW50Lm9wdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZW50ZXJFbmVteVVuaXQoZXZlbnQudmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy/jg57jg4Pjg5fjgqrjg5bjgrjjgqfjgq/jg4jliKTlrppcbiAgICAgICAgaWYgKHRoaXMubWFwT2JqZWN0KSB7XG4gICAgICAgICAgICB2YXIgc3ggPSBTQ19XKjAuNTtcbiAgICAgICAgICAgIHZhciBzeSA9IFNDX0gqMC4yO1xuICAgICAgICAgICAgdmFyIHggPSB0aGlzLmdyb3VuZC5tYXBCYXNlLng7XG4gICAgICAgICAgICB2YXIgeSA9IHRoaXMuZ3JvdW5kLm1hcEJhc2UueTtcbiAgICAgICAgICAgIHZhciBsZW4gPSB0aGlzLm1hcE9iamVjdC5vYmplY3RzLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgb2JqID0gdGhpcy5tYXBPYmplY3Qub2JqZWN0c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoIW9iai5leGVjdXRlZCkge1xuICAgICAgICAgICAgICAgICAgICAvL+evhOWbsuWGheOBq+OBguOCi+OBi+WIpOWumlxuICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSB4ICsgb2JqLng7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkeSA9IHkgKyBvYmoueTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKC1zeCA8IGR4ICYmIGR4IDwgU0NfVytzeCAmJiAtc3kgPCBkeSAmJiBkeSA8IFNDX0grc3kpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5pW144Kt44Oj44Op44Kv44K/5oqV5YWlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqLnR5cGUgPT0gXCJlbmVteVwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVuZW15VW5pdFtvYmoubmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy/lsI/pmormipXlhaVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRlckVuZW15VW5pdChvYmoubmFtZSwgb2JqLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8v5Y2Y5L2T5oqV5YWlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmoucHJvcGVydGllcy4kaGFzKFwib2Zmc2V0eFwiKSkgZHggKz0gb2JqLnByb3BlcnRpZXMub2Zmc2V0eDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5wcm9wZXJ0aWVzLiRoYXMoXCJvZmZzZXR5XCIpKSBkeSArPSBvYmoucHJvcGVydGllcy5vZmZzZXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGVyRW5lbXkob2JqLm5hbWUsIGR4LCBkeSwgb2JqLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8v44Kk44OZ44Oz44OI5Yem55CGXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAob2JqLnR5cGUgPT0gXCJldmVudFwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gdGhpcy5zdGFnZS5nZXRFdmVudChvYmoubmFtZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZihldmVudC52YWx1ZSkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQudmFsdWUuY2FsbCh0aGlzLCBvYmoucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqLmV4ZWN1dGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Oc44Og5Yq55p6cXG4gICAgICAgIGlmICh0aGlzLmJvbWJUaW1lID4gMCkge1xuICAgICAgICAgICAgdGhpcy5ib21iVGltZS0tO1xuICAgICAgICAgICAgdGhpcy5lcmFzZUJ1bGxldCgpO1xuICAgICAgICAgICAgdGhpcy5hZGRFbmVteURhbWFnZSgxMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+W8vua2iOOBl1xuICAgICAgICBpZiAodGhpcy50aW1lVmFuaXNoID4gMCkge1xuICAgICAgICAgICAgdGhpcy50aW1lVmFuaXNoLS07XG4gICAgICAgICAgICB0aGlzLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+OCsuODvOODoOOCquODvOODkOODvOWHpueQhlxuICAgICAgICBpZiAodGhpcy5pc0dhbWVPdmVyKSB7XG4gICAgICAgICAgICB0aGlzLmlzR2FtZU92ZXIgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmlzQ29udHJvbCA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIGNvcyA9IENvbnRpbnVlU2NlbmUodGhpcyk7XG4gICAgICAgICAgICBwaGluYS5hcHAuT2JqZWN0MkQoKS5hZGRDaGlsZFRvKHRoaXMpLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC53YWl0KDIwMDApXG4gICAgICAgICAgICAgICAgLmNhbGwoIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBhcHAucHVzaFNjZW5lKGNvcyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODnOOCueS9k+WKm+OCsuODvOOCuOioreWumlxuICAgICAgICBpZiAodGhpcy5ib3NzT2JqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLmJvc3NHYXVnZS5zZXRWYWx1ZSh0aGlzLmJvc3NPYmplY3QuZGVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Ko44Kv44K544OG44Oz44OJ44OB44Kn44OD44KvXG4gICAgICAgIHZhciBleHRlbmRTY29yZSA9IGFwcC5leHRlbmRTY29yZVthcHAuZXh0ZW5kQWR2YW5jZV07XG4gICAgICAgIGlmIChhcHAuaXNFeHRlbmRFdmVyeSkge1xuICAgICAgICAgICAgZXh0ZW5kU2NvcmUgPSBhcHAuZXh0ZW5kRXZlcnlTY29yZSAqIChhcHAuZXh0ZW5kQWR2YW5jZSArIDEpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHRlbmRTY29yZSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGlmIChhcHAuc2NvcmUgPiBleHRlbmRTY29yZSkge1xuICAgICAgICAgICAgICAgIGFwcC5leHRlbmRBZHZhbmNlKys7XG4gICAgICAgICAgICAgICAgYXBwLnNldHRpbmcuemFua2krKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjdCA9IGFwcC5jb250cm9sbGVyO1xuICAgICAgICB2YXIga2IgPSBhcHAua2V5Ym9hcmQ7XG4gICAgICAgIGlmIChhcHAua2V5Ym9hcmQuZ2V0S2V5KFwiVlwiKSkge1xuICAgICAgICAgICAgdGhpcy5lcmFzZUJ1bGxldCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcHAua2V5Ym9hcmQuZ2V0S2V5KFwiRFwiKSkge1xuICAgICAgICAgICAgdGhpcy5idWxsZXREb21pbmF0aW9uKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXBwLmtleWJvYXJkLmdldEtleVVwKFwiUFwiKSB8fCBhcHAua2V5Ym9hcmQuZ2V0S2V5KFwiZXNjYXBlXCIpIHx8IGN0LnN0YXJ0KSB7XG4gICAgICAgICAgICBhcHAucHVzaFNjZW5lKFBhdXNlU2NlbmUoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICB9LFxuXG4gICAgLy/jgrnjg4bjg7zjgrjliJ3mnJ/ljJZcbiAgICBpbml0U3RhZ2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5ncm91bmQpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kLnJlbW92ZSgpO1xuICAgICAgICAgICAgdGhpcy5ncm91bmQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN0YWdlKSB0aGlzLnN0YWdlID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMubWFwT2JqZWN0KSB0aGlzLm1hcE9iamVjdCA9IG51bGw7XG5cbiAgICAgICAgLy/jgrnjg4bjg7zjgrjpgLLooYzjgajog4zmma/ov73liqBcbiAgICAgICAgc3dpdGNoICh0aGlzLnN0YWdlSWQpIHtcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0aGlzLnN0YWdlID0gU3RhZ2UxKHRoaXMsIHRoaXMucGxheWVyKTtcbiAgICAgICAgICAgICAgICB0aGlzLmdyb3VuZCA9IFN0YWdlMUdyb3VuZCgpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFnZSA9IFN0YWdlMih0aGlzLCB0aGlzLnBsYXllcik7XG4gICAgICAgICAgICAgICAgdGhpcy5ncm91bmQgPSBTdGFnZTJHcm91bmQoKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2UgPSBTdGFnZTModGhpcywgdGhpcy5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdW5kID0gU3RhZ2UzR3JvdW5kKCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgOTpcbiAgICAgICAgICAgICAgICAvL+ODhuOCueODiOeUqOOCueODhuODvOOCuFxuICAgICAgICAgICAgICAgIHRoaXMuc3RhZ2UgPSBTdGFnZTkodGhpcywgdGhpcy5wbGF5ZXIpO1xuLy8gICAgICAgICAgICAgICAgdGhpcy5tYXBPYmplY3QgPSBwaGluYS5hc3NldC5Bc3NldE1hbmFnZXIuZ2V0KCd0bXgnLCBcIm1hcDFfZW5lbXlcIikuZ2V0T2JqZWN0R3JvdXAoXCJFbmVteUxheWVyXCIpWzBdO1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JvdW5kID0gU3RhZ2U5R3JvdW5kKCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgIHRoaXMudGltZVZhbmlzaCA9IDA7XG4gICAgICAgIHRoaXMuZW5lbXlDb3VudCA9IDA7XG4gICAgICAgIHRoaXMuZW5lbXlLaWxsID0gMDtcbiAgICAgICAgdGhpcy5lbmVteUlEID0gMDtcbiAgICAgICAgdGhpcy5zdGFnZU1pc3NDb3VudCA9IDA7XG5cbiAgICAgICAgLy/lnLDlvaLmtojljrvnlKjjg57jgrnjgq9cbiAgICAgICAgdGhpcy5ncm91bmRNYXNrLnR3ZWVuZXIuY2xlYXIoKS5mYWRlT3V0KDIwKTtcblxuICAgICAgICAvL+OCueODhuODvOOCuOeVquWPt+ihqOekulxuICAgICAgICB2YXIgcGFyYW0gPSB7dGV4dDogXCJTVEFHRSBcIit0aGlzLnN0YWdlSWQsIGZpbGw6XCJ3aGl0ZVwiLCBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsIGFsaWduOiBcImNlbnRlclwiLCBiYXNlbGluZTogXCJtaWRkbGVcIiwgZm9udFdlaWdodDogNjAwLCBvdXRsaW5lV2lkdGg6IDJ9O1xuICAgICAgICB2YXIgbTEgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHBhcmFtLCA1MClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICBtMS5hbHBoYSA9IDA7XG4gICAgICAgIG0xLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG4gICAgICAgIG0xLnR3ZWVuZXIud2FpdCgzMCkuZmFkZUluKDE1KS53YWl0KDE3MSkuZmFkZU91dCgxNSkuY2FsbChmdW5jdGlvbigpe3RoaXMucmVtb3ZlKCl9LmJpbmQobTEpKTtcblxuICAgICAgICAvL+OCueODhuODvOOCuOWQjeihqOekulxuICAgICAgICB2YXIgbmFtZSA9IEFwcGxpY2F0aW9uLnN0YWdlTmFtZVt0aGlzLnN0YWdlSWRdIHx8IFwiUHJhY3RpY2VcIjtcbiAgICAgICAgdmFyIHBhcmFtID0ge3RleHQ6IFwiX1wiLCBmaWxsOlwid2hpdGVcIiwgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLCBhbGlnbjogXCJjZW50ZXJcIiwgYmFzZWxpbmU6IFwibWlkZGxlXCIsIGZvbnRTaXplOiAxNiwgZm9udFdlaWdodDogMjAwLCBvdXRsaW5lV2lkdGg6IDJ9O1xuICAgICAgICB2YXIgbTIgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHBhcmFtLCA1MClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41NSlcbiAgICAgICAgbTIuYWxwaGEgPSAwO1xuICAgICAgICBtMi5jb2wgPSAwO1xuICAgICAgICBtMi5tYXggPSBuYW1lLmxlbmd0aDtcbiAgICAgICAgbTIudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcbiAgICAgICAgbTIudHdlZW5lclxuICAgICAgICAgICAgLndhaXQoMzApXG4gICAgICAgICAgICAuZmFkZUluKDYpXG4gICAgICAgICAgICAudG8oe2NvbDogbTIubWF4fSwgNjApXG4gICAgICAgICAgICAud2FpdCgxMjApXG4gICAgICAgICAgICAuZmFkZU91dCgxNSlcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7dGhpcy5yZW1vdmUoKX0uYmluZChtMikpO1xuICAgICAgICBtMi51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IG5hbWUuc3Vic3RyaW5nKDAsIH5+dGhpcy5jb2wpK1wiX1wiO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIHJlc3VsdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbmRSZXN1bHQgPSBmYWxzZTtcbiAgICAgICAgdmFyIGxvYWRjb21wbGV0ZSA9IGZhbHNlO1xuICAgICAgICB2YXIgbG9hZHByb2dyZXNzID0gMDtcblxuICAgICAgICAvL+asoeOCueODhuODvOOCuOOBruOCouOCu+ODg+ODiOOCkuODkOODg+OCr+OCsOODqeOCpuODs+ODieOBp+iqreOBv+i+vOOBv1xuICAgICAgICBpZiAoIXRoaXMuaXNQcmFjdGljZSAmJiB0aGlzLnN0YWdlSWQgPCB0aGlzLm1heFN0YWdlSWQpIHtcbiAgICAgICAgICAgIHZhciBhc3NldE5hbWUgPSBcInN0YWdlXCIrKHRoaXMuc3RhZ2VJZCsxKTtcbiAgICAgICAgICAgIHZhciBhc3NldHMgPSBBcHBsaWNhdGlvbi5hc3NldHNbYXNzZXROYW1lXTtcbiAgICAgICAgICAgIHZhciBsb2FkZXIgPSBwaGluYS5hc3NldC5Bc3NldExvYWRlcigpO1xuICAgICAgICAgICAgbG9hZGVyLmxvYWQoYXNzZXRzKTtcbiAgICAgICAgICAgIGxvYWRlci5vbignbG9hZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICBsb2FkY29tcGxldGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGFwcC5fb25Mb2FkQXNzZXRzKCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgbG9hZGVyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgbG9hZHByb2dyZXNzID0gZS5wcm9ncmVzcztcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvYWRjb21wbGV0ZSA9IHRydWU7XG4gICAgICAgICAgICBsb2FkcHJvZ3Jlc3MgPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxhYmVsUGFyYW0gPSB7XG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmxhY2tcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH07XG5cbiAgICAgICAgLy/jgq/jg6rjgqLmmYLvvKLvvKfvvK1cbiAgICAgICAgYXBwLnBsYXlCR00oXCJzdGFnZWNsZWFyXCIpO1xuXG4gICAgICAgIC8v5Zyw5b2i5raI5Y6755So44Oe44K544KvXG4gICAgICAgIHRoaXMuZ3JvdW5kTWFzay50d2VlbmVyLmNsZWFyKCkuZmFkZUluKDMwMCk7XG5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIHZhciBiYXNlID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMS41LCAwKTtcbiAgICAgICAgYmFzZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgfTtcbiAgICAgICAgYmFzZS50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgIC50byh7eDogMH0sIDUwMCxcImVhc2VPdXRTaW5lXCIpXG4gICAgICAgICAgICAud2FpdCg1MDAwKVxuICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgZW5kUmVzdWx0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0uYmluZChiYXNlKSk7XG4gICAgICAgIGJhc2Uub2sgPSBmYWxzZTtcbiAgICAgICAgYmFzZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8v5YWl5Yqb44KS5b6F44Gj44Gm5qyh44K544OG44O844K444Gr56e76KGMXG4gICAgICAgICAgICBpZiAoZW5kUmVzdWx0ICYmIGxvYWRjb21wbGV0ZSkge1xuICAgICAgICAgICAgICAgIHZhciBjdCA9IGFwcC5jb250cm9sbGVyO1xuICAgICAgICAgICAgICAgIGlmIChjdC5vayB8fCBjdC5jYW5jZWwpIHRoaXMub2sgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBhcHAubW91c2U7XG4gICAgICAgICAgICAgICAgaWYgKHAuZ2V0UG9pbnRpbmcoKSkgdGhpcy5vayA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9rKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdGFnZUNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v44K544OG44O844K455Wq5Y+36KGo56S6XG4gICAgICAgIHZhciB0ZXh0MSA9IFwiU1RBR0UgXCIrdGhpcy5zdGFnZUlkK1wiIENMRUFSXCI7XG4gICAgICAgIHZhciByZXMxID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogdGV4dDEsIGFsaWduOiBcImNlbnRlclwiLCBmb250U2l6ZTogMjV9LiRzYWZlKGxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8oYmFzZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjI1KTtcblxuICAgICAgICAvL+OCueODhuODvOOCuOOCr+ODquOCouODnOODvOODiuOCueihqOekulxuICAgICAgICB2YXIgYm9udXNDbGVhciA9IHRoaXMuc3RhZ2VJZCoxMDAwMDA7XG4gICAgICAgIHZhciByZXMyID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJcIn0uJHNhZmUobGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhiYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC4xLCBTQ19IKjAuNCk7XG4gICAgICAgIHJlczIuc2NvcmUgPSAwO1xuICAgICAgICByZXMyLnNjb3JlUGx1cyA9IE1hdGguZmxvb3IoYm9udXNDbGVhci82MCk7XG4gICAgICAgIHJlczIudGltZSA9IDA7XG4gICAgICAgIHJlczIudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnRleHQgPSBcIkNMRUFSIEJPTlVTOiBcIit0aGlzLnNjb3JlLmNvbW1hKCk7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lID09IDYwKSBhcHAuc2NvcmUgKz0gYm9udXNDbGVhcjtcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWUgPiA2MCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gdGhpcy5zY29yZVBsdXM7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2NvcmUgPiBib251c0NsZWFyKSB0aGlzLnNjb3JlID0gYm9udXNDbGVhcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg5Ljg4Pjg4jmlbDjg5zjg7zjg4rjgrnooajnpLpcbiAgICAgICAgdmFyIGJvbnVzSGl0ID0gdGhpcy5lbmVteUtpbGwqMTAwO1xuICAgICAgICB2YXIgcmVzMyA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiXCJ9LiRzYWZlKGxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8oYmFzZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuMSwgU0NfSCowLjUpO1xuICAgICAgICByZXMzLnNjb3JlID0gMDtcbiAgICAgICAgcmVzMy5zY29yZVBsdXMgPSBNYXRoLmZsb29yKGJvbnVzSGl0LzYwKTtcbiAgICAgICAgcmVzMy50aW1lID0gMDtcbiAgICAgICAgcmVzMy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IFwiSElUIEJPTlVTOiBcIit0aGlzLnNjb3JlLmNvbW1hKCk7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lID09IDkwKSBhcHAuc2NvcmUgKz0gYm9udXNIaXQ7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lID4gOTApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNjb3JlICs9IHRoaXMuc2NvcmVQbHVzO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3JlID4gYm9udXNIaXQpIHRoaXMuc2NvcmUgPSBib251c0hpdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/jg47jg7zjg5/jgrnjgq/jg6rjgqLjg5zjg7zjg4rjgrnooajnpLpcbiAgICAgICAgaWYgKHRoaXMuc3RhZ2VNaXNzQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgdmFyIGJvbnVzTm9taXNzID0gMTAwMDAwO1xuICAgICAgICAgICAgdmFyIHJlczQgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlwifS4kc2FmZShsYWJlbFBhcmFtKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyhiYXNlKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuMSwgU0NfSCowLjYpO1xuICAgICAgICAgICAgcmVzNC5zY29yZSA9IDA7XG4gICAgICAgICAgICByZXM0LnNjb3JlUGx1cyA9IE1hdGguZmxvb3IoYm9udXNOb21pc3MvNjApO1xuICAgICAgICAgICAgcmVzNC50aW1lID0gMDtcbiAgICAgICAgICAgIHJlczQudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50ZXh0ID0gXCJOTyBNSVNTIEJPTlVTOiBcIit0aGlzLnNjb3JlLmNvbW1hKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZSA9PSAxMjApIGFwcC5zY29yZSArPSBib251c05vbWlzcztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lID4gMTIwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2NvcmUgKz0gdGhpcy5zY29yZVBsdXM7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnNjb3JlID4gYm9udXNOb21pc3MpIHRoaXMuc2NvcmUgPSBib251c05vbWlzcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL+ODreODvOODiemAsuaNl+ihqOekulxuICAgICAgICB2YXIgcHJvZ3Jlc3MgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlwiLCBhbGlnbjogXCJyaWdodFwiLCBmb250U2l6ZTogMTB9LiRzYWZlKGxhYmVsUGFyYW0pKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8oYmFzZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuOTUsIFNDX0gqMC45NSk7XG4gICAgICAgIHByb2dyZXNzLnRpbWUgPSAwO1xuICAgICAgICBwcm9ncmVzcy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudGV4dCA9IFwiTG9hZGluZy4uLiBcIitNYXRoLmZsb29yKGxvYWRwcm9ncmVzcyoxMDApK1wiJVwiO1xuICAgICAgICAgICAgaWYgKGxvYWRwcm9ncmVzcyA9PSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVuZFJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRleHQgPSBcIlRBUCBvciBUUklHR0VSIHRvIG5leHQgc3RhZ2VcIjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRleHQgPSBcIlBsZWFzZSB3YWl0Li4uXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMudGltZSAlIDMwID09IDApIHRoaXMudmlzaWJsZSA9ICF0aGlzLnZpc2libGU7XG4gICAgICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+OCueODhuODvOOCuOOCr+ODquOCouWHpueQhlxuICAgIHN0YWdlQ2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAvL+ODl+ODqeOCr+ODhuOCo+OCueaZguOCv+OCpOODiOODq+OBuOaIu+OCi1xuICAgICAgICBpZiAodGhpcy5pc1ByYWN0aWNlKSB7XG4gICAgICAgICAgICBhcHAuc3RvcEJHTSgpO1xuICAgICAgICAgICAgdGhpcy5leGl0KFwibWVudVwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5zdGFnZUlkIDwgdGhpcy5tYXhTdGFnZUlkKSB7XG4gICAgICAgICAgICAvL+asoeOBruOCueODhuODvOOCuOOBuFxuICAgICAgICAgICAgdGhpcy5zdGFnZUlkKys7XG4gICAgICAgICAgICB0aGlzLmluaXRTdGFnZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/jgqrjg7zjg6vjgq/jg6rjgqJcbiAgICAgICAgICAgIHRoaXMubWFzay50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAuZmFkZUluKDYwKVxuICAgICAgICAgICAgICAgIC53YWl0KDYwKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZsYXJlKCdnYW1lb3ZlcicpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy/mlbXjg6bjg4vjg4Pjg4jljZjkvY3jga7mipXlhaVcbiAgICBlbnRlckVuZW15VW5pdDogZnVuY3Rpb24obmFtZSwgb3B0aW9uKSB7XG4gICAgICAgIHZhciB1bml0ID0gZW5lbXlVbml0W25hbWVdO1xuICAgICAgICBpZiAodW5pdCA9PT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIlVuZGVmaW5lZCB1bml0OiBcIituYW1lKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsZW4gPSB1bml0Lmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgdmFyIGUgPSB1bml0W2ldO1xuICAgICAgICAgICAgdmFyIGVuID0gRW5lbXkoZS5uYW1lLCBlLngsIGUueSwgdGhpcy5lbmVteUlELCBlLnBhcmFtKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICAgICAgaWYgKGVuLmRhdGEudHlwZSA9PSBFTkVNWV9CT1NTIHx8IGVuLmRhdGEudHlwZSA9PSBFTkVNWV9NQk9TUykge1xuICAgICAgICAgICAgICAgIHRoaXMuYm9zc0dhdWdlLnNldE1heChlbi5kZWZNYXgpLnNldFZhbHVlKGVuLmRlZk1heCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ib3NzT2JqZWN0ID0gZW47XG4gICAgICAgICAgICAgICAgdGhpcy5mbGFyZSgnc3RhcnRfYm9zcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbmVteUlEKys7XG4gICAgICAgICAgICB0aGlzLmVuZW15Q291bnQrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgLy/mlbXljZjkvZPjga7mipXlhaVcbiAgICBlbnRlckVuZW15OiBmdW5jdGlvbihuYW1lLCB4LCB5LCBwYXJhbSkge1xuICAgICAgICB0aGlzLmVuZW15SUQrKztcbiAgICAgICAgdGhpcy5lbmVteUNvdW50Kys7XG4gICAgICAgIHJldHVybiBFbmVteShuYW1lLCB4LCB5LCB0aGlzLmVuZW15SUQtMSwgcGFyYW0pLmFkZENoaWxkVG8odGhpcyk7XG4gICAgfSxcblxuICAgIC8v44Oc44Og5oqV5YWlXG4gICAgZW50ZXJCb21iOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuYm9tYlRpbWUgPiAwIHx8IGFwcC5zZXR0aW5nLmJvbWJTdG9jayA8IDEpIHJldHVybjtcbiAgICAgICAgdGhpcy5ib21iVGltZSA9IDkwO1xuICAgICAgICBhcHAuc2V0dGluZy5ib21iU3RvY2stLTtcblxuICAgICAgICB0aGlzLmVyYXNlQnVsbGV0KCk7XG4gICAgICAgIHZhciBsYXllciA9IHRoaXMuZWZmZWN0TGF5ZXJNaWRkbGU7XG4gICAgICAgIHZhciB4ID0gdGhpcy5wbGF5ZXIueDtcbiAgICAgICAgdmFyIHkgPSB0aGlzLnBsYXllci55O1xuICAgICAgICBFZmZlY3QuZW50ZXJCb21iKGxheWVyLCB7cG9zaXRpb246IHt4OiB4LCB5OiB5fX0pO1xuXG4gICAgICAgIHRoaXMuYWRkRW5lbXlEYW1hZ2UoMTAwMCk7XG4gICAgICAgIGFwcC5wbGF5U0UoXCJib21iXCIpO1xuICAgIH0sXG5cbiAgICAvL+aVteOBq+S4gOW+i+ODgOODoeODvOOCuOS7mOWKoFxuICAgIGFkZEVuZW15RGFtYWdlOiBmdW5jdGlvbihwb3dlcikge1xuICAgICAgICB2YXIgY2hlY2tMYXllcnMgPSBbTEFZRVJfT0JKRUNUX1VQUEVSLCBMQVlFUl9PQkpFQ1RfTUlERExFLCBMQVlFUl9PQkpFQ1RfTE9XRVJdO1xuXG4gICAgICAgIC8v5pW144Go44Gu5b2T44KK5Yik5a6a44OB44Kn44OD44KvXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLmxheWVyc1tjaGVja0xheWVyc1tpXV07XG4gICAgICAgICAgICBsYXllci5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoYSBpbnN0YW5jZW9mIEVuZW15ICYmIGEuaXNPblNjcmVlbikgYS5kYW1hZ2UocG93ZXIpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvL+aVteW8vuS4gOaLrOa2iOWOu1xuICAgIGVyYXNlQnVsbGV0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5idWxsZXRMYXllci5lcmFzZSgpO1xuICAgIH0sXG5cbiAgICAvL+W8vuW5leaSg+OBoei/lOOBl1xuICAgIGJ1bGxldERvbWluYXRpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc2wgPSB0aGlzLnNob3RMYXllcjtcbiAgICAgICAgdGhpcy5idWxsZXRMYXllci5jaGlsZHJlbi5lYWNoKGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgICAgIHZhciByb3QgPSBNYXRoLmF0YW4yKC1hLnZ5LCAtYS52eCkqdG9EZWcrOTA7XG4gICAgICAgICAgICBzbC5lbnRlclNob3QoYS54LCBhLnksIHt0eXBlOiAxLCByb3RhdGlvbjogcm90LCBwb3dlcjogMjAsIHZlbG9jaXR5OiA1fSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmJ1bGxldExheWVyLmVyYXNlKCk7XG4gICAgfSxcblxuICAgIC8vV2FybmluZ+ihqOekulxuICAgIGVudGVyV2FybmluZzogZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgLy/orablkYrpn7NcbiAgICAgICAgYXBwLnBsYXlCR00oXCJ3YXJuaW5nXCIsIGZhbHNlKTtcblxuICAgICAgICB2YXIgc3R5bGUgPSB7XG4gICAgICAgICAgICB3aWR0aDogU0NfVyxcbiAgICAgICAgICAgIGhlaWdodDogU0NfSCowLjEsXG4gICAgICAgICAgICBmaWxsOiBcInJlZFwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcInJlZFwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDFcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmVsdCA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUoc3R5bGUpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHZhciB0ZXh0ID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJXQVJOSU5HXCIsIGFsaWduOiBcImNlbnRlclwiLCBmb250RmFtaWx5OiBcIk9yYml0cm9uXCJ9KVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKDAsIDMpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyhiZWx0KTtcblxuICAgICAgICB2YXIgcGFyYW0gPSB7XG4gICAgICAgICAgICBmaWxsOiBcInJlZFwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcInJlZFwiLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGZvbnRTaXplOiAxNixcbiAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICcnXG4gICAgICAgIH07XG4gICAgICAgIHZhciB0ZXh0ID0gXCJDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTiBDQVVUSU9OIENBVVRJT04gQ0FVVElPTlwiO1xuICAgICAgICBjYXV0aW9uMSA9IHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IHRleHR9LiRzYWZlKHBhcmFtKSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCotMC4wNS04KVxuICAgICAgICAgICAgLmFkZENoaWxkVG8oYmVsdCk7XG4gICAgICAgIGNhdXRpb24xLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy54IC09IDE7XG4gICAgICAgIH1cbiAgICAgICAgY2F1dGlvbjIgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiB0ZXh0fS4kc2FmZShwYXJhbSkpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC4wNSsxMilcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKGJlbHQpO1xuICAgICAgICBjYXV0aW9uMi51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMueCArPSAxO1xuICAgICAgICB9XG5cbiAgICAgICAgYmVsdC50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuICAgICAgICBiZWx0LnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgLndhaXQoOTApLmZhZGVPdXQoNSkud2FpdCgyNCkuZmFkZUluKDEpXG4gICAgICAgICAgICAud2FpdCg5MCkuZmFkZU91dCg1KS53YWl0KDI0KS5mYWRlSW4oMSlcbiAgICAgICAgICAgIC53YWl0KDkwKS5mYWRlT3V0KDUpLndhaXQoMjQpXG4gICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGNhdXRpb24xLnggPSAwO1xuICAgICAgICAgICAgICAgIGNhdXRpb24yLnggPSAwO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgYXBwLnBsYXlCR00oXCJib3NzXCIsIHRydWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LmJpbmQoYmVsdCkpO1xuICAgIH0sXG5cbiAgICAvL+OCv+ODg+ODgW9y44Kv44Oq44OD44Kv6ZaL5aeL5Yem55CGXG4gICAgb25wb2ludHN0YXJ0OiBmdW5jdGlvbihlKSB7XG4gICAgfSxcblxuICAgIC8v44K/44OD44OBb3Ljgq/jg6rjg4Pjgq/np7vli5Xlh6bnkIZcbiAgICBvbnBvaW50bW92ZTogZnVuY3Rpb24oZSkge1xuICAgIH0sXG5cbiAgICAvL+OCv+ODg+ODgW9y44Kv44Oq44OD44Kv57WC5LqG5Yem55CGXG4gICAgb25wb2ludGVuZDogZnVuY3Rpb24oZSkge1xuICAgIH0sXG5cbiAgICAvL2FkZENoaWxk44Kq44O844OQ44O844Op44Kk44OJXG4gICAgYWRkQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7XG4gICAgICAgIGlmIChjaGlsZC5sYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdXBlckNsYXNzLnByb3RvdHlwZS5hZGRDaGlsZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkLnBhcmVudFNjZW5lID0gdGhpcztcbiAgICAgICAgcmV0dXJuIHRoaXMubGF5ZXJzW2NoaWxkLmxheWVyXS5hZGRDaGlsZChjaGlsZCk7XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBNZW51RGlhbG9nLmpzXG4gKiAgMjAxNC8wNi8wNFxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKlxuICovXG5cbnBoaW5hLmRlZmluZShcIk1lbnVEaWFsb2dcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgLy/jg6njg5njg6vnlKjjg5Hjg6njg6Hjg7zjgr9cbiAgICBsYWJlbFBhcmFtOiB7XG4gICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgZm9udFdlaWdodDogJydcbiAgICB9LFxuICAgIGRlZmF1bHRNZW51OiB7XG4gICAgICAgIHg6IFNDX1cqMC41LFxuICAgICAgICB5OiBTQ19IKjAuNSxcbiAgICAgICAgd2lkdGg6IFNDX1csXG4gICAgICAgIGhlaWdodDogU0NfSCxcbiAgICAgICAgdGl0bGU6IFwiU0VUVElOR1wiLFxuICAgICAgICBpdGVtOiBbXCJHQU1FXCIsIFwiU1lTVEVNXCIsIFwidGVzdFwiLCBcIkVYSVRcIl0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiBbXCJtZW51MVwiLCBcIm1lbnUyXCIsIFwidGVzdFwiLCBcImV4aXRcIl0sXG4gICAgfSxcblxuICAgIC8v44OV44Kp44O844Kr44K5XG4gICAgaXNGb2N1czogdHJ1ZSxcblxuICAgIC8v6YG45oqe44Oh44OL44Ol44O844Ki44Kk44OG44Og55Wq5Y+3XG4gICAgc2VsZWN0OiAwLFxuXG4gICAgaW5pdDogZnVuY3Rpb24obWVudSkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICBtZW51ID0gKG1lbnV8fHt9KS4kc2FmZSh0aGlzLmRlZmF1bHRNZW51KTtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICB2YXIgcGFyYW1CRyA9IHtcbiAgICAgICAgICAgIHdpZHRoOiBtZW51LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBtZW51LmhlaWdodCxcbiAgICAgICAgICAgIGZpbGw6IFwicmdiYSgwLCAwLCAwLCAxKVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcInJnYmEoMCwgMCwgMCwgMSlcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW1CRylcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24obWVudS54LCBtZW51LnkpO1xuICAgICAgICB0aGlzLmJnLmFscGhhID0gMDtcbiAgICAgICAgdGhpcy5iZy50d2VlbmVyLmNsZWFyKCkudG8oe2FscGhhOiAwLjh9LCA1MDAsIFwiZWFzZU91dEN1YmljXCIpO1xuXG4gICAgICAgIHRoaXMuZnJhbWVCYXNlID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpLmFkZENoaWxkVG8odGhpcyk7XG5cbiAgICAgICAgdGhpcy5jdXJzb2xCYXNlID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMuY3Vyc29sQmFzZS5hbHBoYSA9IDA7XG4gICAgICAgIHRoaXMuY3Vyc29sQmFzZS50d2VlbmVyLndhaXQoMzAwKS5mYWRlSW4oMTAwKTtcblxuICAgICAgICB0aGlzLmJhc2UgPSBwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50KCkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5iYXNlLmFscGhhID0gMDtcblxuICAgICAgICAvL+mBuOaKnuOCq+ODvOOCveODq1xuICAgICAgICB2YXIgcGFyYW1DdXJzb2wgPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XKjAuODUtMTAsXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCowLjA4LFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDEwMCwxMDAsMTAwLDAuNSlcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJyZ2JhKDEwMCwxMDAsMTAwLDAuNSlcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5jdXJzb2wgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtQ3Vyc29sKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5jdXJzb2xCYXNlKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNi0zKTtcblxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgICAgICB0aGlzLmN1cnNvbFRpbWUgPSAwO1xuXG4gICAgICAgIHRoaXMub3Blbk1lbnUobWVudSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghdGhpcy5pc0ZvY3VzKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44Kt44O844Oc44O844OJ5pON5L2cXG4gICAgICAgIHZhciBjdCA9IGFwcC5jb250cm9sbGVyO1xuICAgICAgICBpZiAodGhpcy50aW1lID4gMzAgJiYgdGhpcy5jdXJzb2xUaW1lID4gMTApIHtcbiAgICAgICAgICAgIGlmIChjdC51cCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sLnNlbC0tO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmN1cnNvbC5zZWwgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sLnNlbCA9IDA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbCA9IHRoaXMuY3Vyc29sLnNlbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgICAgICAgICAubW92ZVRvKFNDX1cqMC41LCB0aGlzLml0ZW1bc2VsXS55LCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvbFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdC5kb3duKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJzb2wuc2VsKys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY3Vyc29sLnNlbCA+IHRoaXMubWVudS5pdGVtLmxlbmd0aC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sLnNlbCA9IHRoaXMubWVudS5pdGVtLmxlbmd0aC0xO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZWwgPSB0aGlzLmN1cnNvbC5zZWw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLm1vdmVUbyhTQ19XKjAuNSwgdGhpcy5pdGVtW3NlbF0ueSwgMjAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jdXJzb2xUaW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInNlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2VsID0gdGhpcy5jdXJzb2wuc2VsO1xuICAgICAgICAgICAgaWYgKHRoaXMuaXRlbVtzZWxdIGluc3RhbmNlb2YgU2VsZWN0b3IpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbVtzZWxdO1xuICAgICAgICAgICAgICAgIGlmIChjdC5sZWZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZGVjKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sVGltZSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjdC5yaWdodCkge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLmluYygpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvbFRpbWUgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy50aW1lID4gNjApIHtcbiAgICAgICAgICAgIGlmIChjdC5vaykge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVjaXNpb24odGhpcy5jdXJzb2wuc2VsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdC5jYW5jZWwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbmNlbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZSsrO1xuICAgICAgICB0aGlzLmN1cnNvbFRpbWUrKztcbiAgICB9LFxuXG4gICAgb3Blbk1lbnU6IGZ1bmN0aW9uKG1lbnUpIHtcbiAgICAgICAgbWVudSA9IChtZW51fHx7fSkuJHNhZmUodGhpcy5kZWZhdWx0TWVudSk7XG4gICAgICAgIHRoaXMubWVudSA9IG1lbnU7XG5cbiAgICAgICAgLy/ml6LlrZjjg6Hjg4vjg6Xjg7zpoIXnm67jgq/jg6rjgqJcbiAgICAgICAgdGhpcy5jbGVhck1lbnUoKTtcblxuICAgICAgICAvL+ODoeODi+ODpeODvOmgheebruaVsFxuICAgICAgICB2YXIgbnVtTWVudUl0ZW0gPSBtZW51Lml0ZW0ubGVuZ3RoO1xuXG4gICAgICAgIC8v44OV44Os44O844OgXG4gICAgICAgIHZhciBwYXJhbUZSID0ge1xuICAgICAgICAgICAgd2lkdGg6U0NfVyowLjg3LFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gqKG51bU1lbnVJdGVtKjAuMTUpK1NDX0gqMC4xLFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDAsIDAsIDAsIDAuNylcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNylcIixcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmZyYW1lID0gcGhpbmEuZXh0ZW5zaW9uLkZyYW1lKHBhcmFtRlIpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLmZyYW1lQmFzZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG4gICAgICAgICAgICAuc2V0U2NhbGUoMS4wLCAwKTtcbiAgICAgICAgdGhpcy5mcmFtZS50d2VlbmVyLnRvKHtzY2FsZVk6IDF9LCAyNTAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICB0aGlzLmJhc2UudHdlZW5lci53YWl0KDE1MCkuZmFkZUluKDEwMCk7XG5cbiAgICAgICAgLy/liJ3mnJ/kvY3nva5cbiAgICAgICAgdmFyIHBvc1kgPSBTQ19IKjAuNS1TQ19IKihudW1NZW51SXRlbSowLjA1KTtcblxuICAgICAgICAvL+ODoeODi+ODpeODvOOCv+OCpOODiOODq1xuICAgICAgICB0aGlzLnRpdGxlID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogbWVudS50aXRsZX0uJHNhZmUodGhpcy5sYWJlbFBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuYmFzZSlcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgcG9zWSk7XG5cbiAgICAgICAgLy/jgq/jg6rjg4Pjgq/nlKhcbiAgICAgICAgdmFyIHBhcmFtQ0wgPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XKjAuOCxcbiAgICAgICAgICAgIGhlaWdodDpTQ19IKjAuMDgsXG4gICAgICAgICAgICBmaWxsOiBcInJnYmEoMCwxMDAsMjAwLDAuNSlcIixcbiAgICAgICAgICAgIHN0cm9rZTogXCJyZ2JhKDAsMTAwLDIwMCwwLjUpXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG5cbiAgICAgICAgLy/jg6Hjg4vjg6Xjg7zpoIXnm65cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICB0aGlzLml0ZW0gPSBbXTtcbiAgICAgICAgdGhpcy5jbGljayA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG51bU1lbnVJdGVtOyBpKyspIHtcbiAgICAgICAgICAgIHZhciB5ID0gcG9zWStTQ19IKjAuMSppK1NDX0gqMC4xO1xuICAgICAgICAgICAgdmFyIGl0ZW0gPSBtZW51Lml0ZW1baV07XG5cbiAgICAgICAgICAgIC8v6YCa5bi444Oh44OL44Ol44O86aCF55uuXG4gICAgICAgICAgICBpZiAodHlwZW9mIGl0ZW0gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLml0ZW1baV0gPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBtZW51Lml0ZW1baV19LiRzYWZlKHRoaXMubGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuYmFzZSlcbiAgICAgICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v44K744Os44Kv44K/44Gu5aC05ZCIXG4gICAgICAgICAgICBpZiAoaXRlbSBpbnN0YW5jZW9mIFNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtW2ldID0gaXRlbTtcbiAgICAgICAgICAgICAgICBpdGVtLmFkZENoaWxkVG8odGhpcy5iYXNlKS5zZXRQb3NpdGlvbihTQ19XKjAuNSwgeSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v44Kv44Oq44OD44Kv5Yik5a6a55So55+p5b2iXG4gICAgICAgICAgICB0aGlzLmNsaWNrW2ldID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbUNMKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuYmFzZSlcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIHkpXG4gICAgICAgICAgICAgICAgLnNldEludGVyYWN0aXZlKHRydWUpO1xuICAgICAgICAgICAgdGhpcy5jbGlja1tpXS4kZXh0ZW5kKHthbHBoYTogMCwgc2VsWTogeSwgc2VsOiBpfSk7XG4gICAgICAgICAgICB0aGlzLmNsaWNrW2ldLm9ucG9pbnRzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LmN1cnNvbC5zZWwgPT0gdGhpcy5zZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaXRlbVt0aGlzLnNlbF0gaW5zdGFuY2VvZiBTZWxlY3Rvcikge1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5kZWNpc2lvbih0aGF0LmN1cnNvbC5zZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInNlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJzb2wudHdlZW5lci5jbGVhcigpLm1vdmVUbyhTQ19XKjAuNSwgdGhpcy5zZWxZLCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnNvbC5zZWwgPSB0aGlzLnNlbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJzb2wueSA9IHRoaXMuaXRlbVswXS55O1xuICAgICAgICB0aGlzLmN1cnNvbC5zZWwgPSAwO1xuICAgIH0sXG5cbiAgICAvL+aXouWtmOODoeODi+ODpeODvOmgheebruOCr+ODquOColxuICAgIGNsZWFyTWVudTogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmZyYW1lKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lLnJlbW92ZSgpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuZnJhbWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGl0bGUpIHtcbiAgICAgICAgICAgIHRoaXMudGl0bGUucmVtb3ZlKCk7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy50aXRsZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pdGVtKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaXRlbS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbVtpXS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5pdGVtW2ldO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tbaV0ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuY2xpY2tbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5pdGVtO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY2xpY2s7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgY2xvc2VNZW51OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5iYXNlLnR3ZWVuZXIuY2xlYXIoKS5mYWRlT3V0KDEwMCk7XG4gICAgICAgIHRoaXMuY3Vyc29sQmFzZS50d2VlbmVyLmNsZWFyKCkuZmFkZU91dCgxMDApO1xuICAgICAgICB0aGlzLmZyYW1lLnR3ZWVuZXIuY2xlYXIoKS53YWl0KDEwMCkudG8oe3NjYWxlWTogMH0sIDI1MCwgXCJlYXNlT3V0Q3ViaWNcIilcbiAgICAgICAgdGhpcy5iZy50d2VlbmVyLmNsZWFyKCkudG8oe2FscGhhOiAwLjB9LCA1MDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgIH0sXG5cbiAgICAvL+ODoeODi+ODpeODvOmgheebrumBuOaKnuaxuuWumlxuICAgIGRlY2lzaW9uOiBmdW5jdGlvbihzZWwpIHtcbiAgICAgICAgdGhpcy5zZWxlY3QgPSBzZWw7XG4gICAgICAgIHRoaXMuZmxhcmUoJ2RlY2lzaW9uJyk7XG4gICAgfSxcbiAgICAvL+ODoeODi+ODpeODvOOCreODo+ODs+OCu+ODq1xuICAgIGNhbmNlbDogZnVuY3Rpb24oc2VsKSB7XG4gICAgICAgIHRoaXMuZmxhcmUoJ2NhbmNlbCcpO1xuICAgIH0sXG59KTtcblxucGhpbmEuZGVmaW5lKFwiU2VsZWN0b3JcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuXG4gICAgLy/pgbjmip7kuK3jgqLjgqTjg4bjg6BcbiAgICBzZWxlY3RJdGVtOiAwLFxuXG4gICAgLy/jg6njg5njg6vnlKjjg5Hjg6njg6Hjg7zjgr9cbiAgICBsYWJlbFBhcmFtOiB7XG4gICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgZm9udFdlaWdodDogJydcbiAgICB9LFxuICAgIGRlZmF1bHRPcHRpb246IHtcbiAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgIHg6IC02MCxcbiAgICAgICAgICAgIHRleHQ6IFwiU0VMRUNUXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHg6IDYwLFxuICAgICAgICB3aWR0aDogMTAwLFxuICAgICAgICBpbml0aWFsOiAwLFxuICAgICAgICBpdGVtOiBbXCJhYWFhYVwiLCBcIjJcIiwgXCIzXCIsIFwiNFwiLCBcIjVcIl0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiBbXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiXSxcbiAgICAgICAgdmVydGljYWw6IGZhbHNlLFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb24pIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcbiAgICAgICAgdGhpcy5vcHRpb24gPSAob3B0aW9ufHx7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcblxuICAgICAgICB2YXIgd2lkdGggPSB0aGlzLm9wdGlvbi53aWR0aDtcblxuICAgICAgICAvL+OCv+OCpOODiOODq1xuICAgICAgICB2YXIgdGl0bGVQYXJhbSA9IHt0ZXh0OiB0aGlzLm9wdGlvbi50aXRsZS50ZXh0fS4kc2FmZSh0aGlzLmxhYmVsUGFyYW0pO1xuICAgICAgICB0aGlzLnRpdGxlID0gcGhpbmEuZGlzcGxheS5MYWJlbCh0aXRsZVBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLm9wdGlvbi50aXRsZS54LCAwKTtcblxuICAgICAgICAvL+mBuOaKnuWIneacn+S9jee9rlxuICAgICAgICB0aGlzLnNlbGVjdEl0ZW0gPSB0aGlzLm9wdGlvbi5pbml0aWFsO1xuICAgICAgICBpZiAodGhpcy5zZWxlY3RJdGVtIDwgMCkgdGhpcy5zZWxlY3RJdGVtID0gMDtcblxuICAgICAgICAvL+OCouOCpOODhuODoOOCu+ODg+ODiFxuICAgICAgICB0aGlzLml0ZW1CYXNlID0gcGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudCgpLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMuaXRlbXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9wdGlvbi5pdGVtLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1zW2ldID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogdGhpcy5vcHRpb24uaXRlbVtpXX0uJHNhZmUodGhpcy5sYWJlbFBhcmFtKSlcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLml0ZW1CYXNlKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLm9wdGlvbi54K2kqMTAwLCAwKTtcbiAgICAgICAgICAgIGlmIChpICE9IHRoaXMub3B0aW9uLmluaXRpYWwpIHRoaXMuaXRlbXNbaV0uYWxwaGEgPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgIC8v6YG45oqe5pON5L2c55SoXG4gICAgICAgIHZhciBwYXJhbUMgPSB7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5vcHRpb24ud2lkdGgqMC42LFxuICAgICAgICAgICAgaGVpZ2h0OiBTQ19IKjAuMDUsXG4gICAgICAgICAgICBmaWxsOiBcInJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wKVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBudWxsLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJ0bkMgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtQylcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24odGhpcy5vcHRpb24ueCwgMClcbiAgICAgICAgICAgIC5zZXRJbnRlcmFjdGl2ZSh0cnVlKTtcbiAgICAgICAgdGhpcy5idG5DLm9ucG9pbnRzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy/msbrlrprmk43kvZzmmYLjgIHjgqTjg5njg7Pjg4jnmbrngatcbiAgICAgICAgICAgIHRoYXQuZmxhcmUoJ2RlY2lzaW9uJyk7XG4gICAgICAgIH1cblxuICAgICAgICAvL+aTjeS9nOODnOOCv+ODs1xuICAgICAgICAvL1NoYXBl55So44OR44Op44Oh44O844K/XG4gICAgICAgIHZhciBwYXJhbVNocCA9IHtcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICAgICAgICBzdHJva2U6ICcjYWFhJyxcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAwLFxuXG4gICAgICAgICAgICByYWRpdXM6IDcsXG4gICAgICAgICAgICBzaWRlczogNSxcbiAgICAgICAgICAgIHNpZGVJbmRlbnQ6IDAuMzgsXG4gICAgICAgIH07XG4gICAgICAgIHZhciBwYXJhbUJUID0ge1xuICAgICAgICAgICAgd2lkdGg6IDE1LFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gqMC4wNSxcbiAgICAgICAgICAgIGZpbGw6IFwicmdiYSgyNTUsIDI1NSwgMjU1LCAwLjcpXCIsXG4gICAgICAgICAgICBzdHJva2U6IG51bGwsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYnRuTCA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW1CVClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oLXdpZHRoKjAuNSt0aGlzLm9wdGlvbi54LCAwKVxuICAgICAgICAgICAgLnNldEludGVyYWN0aXZlKHRydWUpO1xuICAgICAgICB0aGlzLmJ0bkwub25wb2ludHN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKS5zY2FsZVRvKDEuMiwgMTAwKTtcbiAgICAgICAgICAgIHRoYXQuZGVjKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idG5MLm9ucG9pbnRlbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnNjYWxlVG8oMS4wLCAxMDApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnRuTDIgPSBwaGluYS5kaXNwbGF5LlRyaWFuZ2xlU2hhcGUocGFyYW1TaHApXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzLmJ0bkwpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oMSwgMCk7XG4gICAgICAgIHRoaXMuYnRuTDIucm90YXRpb24gPSAzMDtcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYnRuUiA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW1CVClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24od2lkdGgqMC41K3RoaXMub3B0aW9uLngsIDApXG4gICAgICAgICAgICAuc2V0SW50ZXJhY3RpdmUodHJ1ZSk7XG4gICAgICAgIHRoaXMuYnRuUi5vbnBvaW50c3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLnNjYWxlVG8oMS4yLCAxMDApO1xuICAgICAgICAgICAgdGhhdC5pbmMoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ0blIub25wb2ludGVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKCkuc2NhbGVUbygxLjAsIDEwMCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idG5SMiA9IHBoaW5hLmRpc3BsYXkuVHJpYW5nbGVTaGFwZShwYXJhbVNocClcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMuYnRuUilcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbigtMSwgMCk7XG4gICAgICAgIHRoaXMuYnRuUjIucm90YXRpb24gPSAtMzA7XG4gICAgfSxcblxuICAgIC8v6aCF55uu44Kk44Oz44Kv44Oq44Oh44Oz44OIXG4gICAgaW5jOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RJdGVtKys7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdEl0ZW0gPiB0aGlzLm9wdGlvbi5pdGVtLmxlbmd0aC0xKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdEl0ZW0gPSB0aGlzLm9wdGlvbi5pdGVtLmxlbmd0aC0xO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pdGVtc1t0aGlzLnNlbGVjdEl0ZW0tMV0udHdlZW5lci5jbGVhcigpLnRvKHthbHBoYTogMH0sIDMwMCwgXCJlYXNlT3V0U2luZVwiKTtcbiAgICAgICAgdGhpcy5pdGVtc1t0aGlzLnNlbGVjdEl0ZW1dLnR3ZWVuZXIuY2xlYXIoKS50byh7YWxwaGE6IDF9LCAzMDAsIFwiZWFzZU91dFNpbmVcIik7XG4gICAgICAgIHRoaXMuaXRlbUJhc2UudHdlZW5lci5jbGVhcigpLnRvKHt4OiAtdGhpcy5zZWxlY3RJdGVtKjEwMH0sIDgwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgIGFwcC5wbGF5U0UoXCJjbGlja1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8v6aCF55uu44OH44Kv44Oq44Oh44Oz44OIXG4gICAgZGVjOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RJdGVtLS07XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdEl0ZW0gPCAwKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdEl0ZW0gPSAwO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pdGVtc1t0aGlzLnNlbGVjdEl0ZW0rMV0udHdlZW5lci5jbGVhcigpLnRvKHthbHBoYTogMH0sIDMwMCwgXCJlYXNlT3V0U2luZVwiKTtcbiAgICAgICAgdGhpcy5pdGVtc1t0aGlzLnNlbGVjdEl0ZW1dLnR3ZWVuZXIuY2xlYXIoKS50byh7YWxwaGE6IDF9LCAzMDAsIFwiZWFzZU91dFNpbmVcIik7XG4gICAgICAgIHRoaXMuaXRlbUJhc2UudHdlZW5lci5jbGVhcigpLnRvKHt4OiAtdGhpcy5zZWxlY3RJdGVtKjEwMH0sIDgwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgIGFwcC5wbGF5U0UoXCJjbGlja1wiKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcbn0pO1xuXG5waGluYS5kZWZpbmUoXCJRdWVyeURpYWxvZ1wiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlFbGVtZW50XCIsXG5cbiAgICAvL+mBuOaKnuS4reOCouOCpOODhuODoFxuICAgIHNlbGVjdEl0ZW06IDAsXG5cbiAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgIH0sXG5cbiAgICBkZWZhdWx0T3B0aW9uOiB7XG4gICAgfSxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKG9wdGlvbikge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCgpO1xuICAgICAgICBvcHRpb24gPSAob3B0aW9ufHx7fSkuJHNhZmUodGhpcy5kZWZhdWx0T3B0aW9uKTtcbiAgICB9LFxufSk7XG4iLCIvKlxuICogIHBhdXNlc2NlbmUuanNcbiAqICAyMDE2LzA4LzE3XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuIFxucGhpbmEuZGVmaW5lKFwiUGF1c2VTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZVwiLFxuXG4gICAgbGFiZWxQYXJhbToge1xuICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgIHN0cm9rZTogXCJibGFja1wiLFxuICAgICAgICBzdHJva2VXaWR0aDogMSxcblxuICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgZm9udFNpemU6IDM1LFxuICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihjdXJyZW50U2NlbmUpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoKTtcblxuICAgICAgICB0aGlzLmN1cnJlbnRTY2VuZSA9IGN1cnJlbnRTY2VuZTtcbiAgICAgICAgdGhpcy55ZXMgPSB0cnVlO1xuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG4gICAgICAgIHZhciBwYXJhbSA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCxcbiAgICAgICAgICAgIGZpbGw6IFwicmdiYSgwLDAsMCwwLjcpXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwicmdiYSgwLDAsMCwwLjcpXCIsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmcgPSBwaGluYS5kaXNwbGF5LlJlY3RhbmdsZVNoYXBlKHBhcmFtKVxuICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjUpXG5cbiAgICAgICAgLy/jg53jg7zjgrrooajnpLpcbiAgICAgICAgdGhpcy5wYXVzZTEgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlBBVVNFXCJ9LiRzYWZlKHRoaXMubGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSk7XG5cbiAgICAgICAgdGhpcy5wYXVzZTIgPSBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlByZXNzIEVTQyBvciBTcGFjZSBvciBUYXAgdG8gZXhpdFwiLCBmb250U2l6ZTogMTV9LiRzYWZlKHRoaXMubGFiZWxQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNik7XG5cbiAgICAgICAgdGhpcy5pc0V4aXQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50aW1lID0gMDsgICAgICAgIFxuICAgIH0sXG5cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy50aW1lID4gMzAgJiYgIXRoaXMuaXNFeGl0KSB7XG4gICAgICAgICAgICB2YXIgY3QgPSBhcHAuY29udHJvbGxlcjtcbiAgICAgICAgICAgIHZhciBrYiA9IGFwcC5rZXlib2FyZDtcbiAgICAgICAgICAgIGlmIChrYi5nZXRLZXkoXCJlc2NhcGVcIikgfHwga2IuZ2V0S2V5KFwic3BhY2VcIikgfHwgY3Quc3RhcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlMS50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgLmZhZGVPdXQoMTAwKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFwcC5wb3BTY2VuZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhdXNlMi50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgLmZhZGVPdXQoMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICB9LFxuXG4gICAgLy/jgr/jg4Pjg4FvcuOCr+ODquODg+OCr+e1guS6huWHpueQhlxuICAgIG9ucG9pbnRlbmQ6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZSA+IDMwKSB7XG4gICAgICAgICAgICBhcHAucG9wU2NlbmUoKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcblxuIiwiLypcbiAqICBwcmFjdGljZXNjZW5lLmpzXG4gKiAgMjAxNi8wOC8zMVxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiUHJhY3RpY2VTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZVwiLFxuXG4gICAgLy/jg6njg5njg6vnlKjjg5Hjg6njg6Hjg7zjgr9cbiAgICBsYWJlbFBhcmFtOiB7XG4gICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgIGZpbGw6IFwid2hpdGVcIixcbiAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgZm9udEZhbWlseTogXCJPcmJpdHJvblwiLFxuICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgIGZvbnRTaXplOiAxNSxcbiAgICAgICAgZm9udFdlaWdodDogJydcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIG9wdGlvbiA9IChvcHRpb258fHt9KS4kc2FmZSh7XG4gICAgICAgICAgICBzZWxlY3RTdGFnZTogMSxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKG9wdGlvbi5zZWxlY3RTdGFnZSA+IDUpIG9wdGlvbi5zZWxlY3RTdGFnZSA9IDE7XG5cbiAgICAgICAgdmFyIG1lbnVQYXJhbSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBcIlNUQUdFIFNFTEVDVFwiLFxuICAgICAgICAgICAgaXRlbTogW1wiXCIsIFwiU1RBUlRcIiwgXCJURVNUXCIsIFwiRVhJVFwiXSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbXCLjgrnjg4bjg7zjgrjpgbjmip5cIiwgXCLmjIflrprjgZfjgZ/jgrnjg4bjg7zjgrjjgpLplovlp4tcIiwgXCJURVNUIE1PREVcIixcIkVYSVRcIl0sXG4gICAgICAgIH07XG4gICAgICAgIHZhciBzZWxlY3RvclBhcmFtID0ge1xuICAgICAgICAgICAgdGl0bGU6IHtcbiAgICAgICAgICAgICAgICB4OiAtODAsXG4gICAgICAgICAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgaW5pdGlhbDogb3B0aW9uLnNlbGVjdFN0YWdlLTEsXG4gICAgICAgICAgICB3aWR0aDogU0NfVyowLjMsXG4gICAgICAgICAgICBpdGVtOiBbXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiXSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbXCIxXCIsIFwiMlwiLCBcIjNcIiwgXCI0XCIsIFwiNVwiXSxcbiAgICAgICAgfTtcbiAgICAgICAgbWVudVBhcmFtLml0ZW1bMF0gPSBTZWxlY3RvcihzZWxlY3RvclBhcmFtKTtcbiAgICAgICAgbWVudVBhcmFtLml0ZW1bMF0ub24oJ2RlY2lzaW9uJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm1lbnUuZmxhcmUoJ2RlY2lzaW9uJyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5tZW51ID0gTWVudURpYWxvZyhtZW51UGFyYW0pLmFkZENoaWxkVG8odGhpcyk7XG4gICAgICAgIHRoaXMubWVudS5vbignZGVjaXNpb24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgc2VsID0gZS50YXJnZXQuc2VsZWN0O1xuICAgICAgICAgICAgc3dpdGNoIChzZWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RhZ2UgPSBlLnRhcmdldC5tZW51Lml0ZW1bMF0uc2VsZWN0SXRlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXh0ID0gXCJzdGFnZVwiKyhzdGFnZSsxKStcImxvYWRcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhpdChuZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhpdChcInN0YWdlOWxvYWRcIik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51LmNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKVxuICAgICAgICAgICAgICAgICAgICAgICAgLndhaXQoNjAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4aXQoXCJ0b1RpdGxlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICByZXN1bHRzY2VuZS5qc1xuICogIDIwMTYvMDQvMDVcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5kZWZpbmUoXCJSZXN1bHRTY2VuZVwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJwaGluYS5kaXNwbGF5LkRpc3BsYXlTY2VuZVwiLFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgICAgICBsYWJlbFBhcmFtOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcImJsdWVcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDM2LFxuICAgICAgICAgICAgZm9udFdlaWdodDogJydcbiAgICAgICAgfSxcbiAgICAgICAgbXNnUGFyYW06IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICAgICAgc3Ryb2tlV2lkdGg6IDIsXG5cbiAgICAgICAgICAgIGZvbnRGYW1pbHk6IFwiT3JiaXRyb25cIixcbiAgICAgICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICAgICAgYmFzZWxpbmU6IFwibWlkZGxlXCIsXG4gICAgICAgICAgICBmb250U2l6ZTogMTUsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgICAgICB9LFxuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuICAgICAgICBvcHRpb25zID0gKG9wdGlvbnN8fHt9KS4kc2FmZSh7XG4gICAgICAgICAgICBzdGFnZUlkOiAwLFxuICAgICAgICB9KTtcblxuICAgICAgICAvL+ODkOODg+OCr+OCsOODqeOCpuODs+ODiVxuICAgICAgICB2YXIgcGFyYW0gPSB7XG4gICAgICAgICAgICB3aWR0aDpTQ19XLFxuICAgICAgICAgICAgaGVpZ2h0OlNDX0gsXG4gICAgICAgICAgICBmaWxsOiAnYmxhY2snLFxuICAgICAgICAgICAgc3Ryb2tlOiBmYWxzZSxcbiAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3RyYW5zcGFyZW50JyxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iZyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNSlcbiAgICAgICAgdGhpcy5iZy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiU1RBR0UgXCIrb3B0aW9ucy5zdGFnZUlkK1wiIENMRUFSXCJ9LiRzYWZlKHRoaXMudGl0bGVQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuMik7XG5cbiAgICAgICAgdGhpcy5tYXNrID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICB0aGlzLm1hc2sudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKS5mYWRlT3V0KDIwKTtcblxuICAgICAgICB0aGlzLnRpbWUgPSAwO1xuICAgIH0sXG4gICAgXG4gICAgdXBkYXRlOiBmdW5jdGlvbihhcHApIHtcbiAgICAgICAgdGhpcy50aW1lKys7XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBTY2VuZUZsb3cuanNcbiAqICAyMDE0LzExLzI4XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqXG4gKi9cblxuLy/vv73vv71777+9Vu+/vVvvv73vv73vv71077+977+977+9W1xucGhpbmEuZGVmaW5lKFwiU2NlbmVGbG93XCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmdhbWUuTWFuYWdlclNjZW5lXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICB0aGlzLnN1cGVySW5pdChvcHRpb25zLiRzYWZlKHtcbiAgICAgICAgICAgIHNjZW5lczogW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJzcGxhc2hcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiU3BsYXNoU2NlbmVcIixcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwibG9hZFwiLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwibG9hZFwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJMb2FkaW5nU2NlbmVcIixcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlOiBcImNvbW1vblwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInRpdGxlXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlRpdGxlU2NlbmVcIixcbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcImFyY2FkZVwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJBcmNhZGVNb2RlXCIsXG4gICAgICAgICAgICAgICAgbmV4dExhYmVsOiBcInRpdGxlXCIsXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJwcmFjdGljZVwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJQcmFjdGljZU1vZGVcIixcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwidGl0bGVcIixcbiAgICAgICAgICAgIH1dLFxuICAgICAgICB9KSk7XG4gICAgfVxufSk7XG5cbi8v77+9Qe+/vVvvv71Q77+9W++/vWjvv73vv73vv71b77+9aO+/vVbvv71b77+977+977+9dO+/ve+/ve+/vVtcbnBoaW5hLmRlZmluZShcIkFyY2FkZU1vZGVcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZ2FtZS5NYW5hZ2VyU2NlbmVcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBzdGFydExhYmVsOiBcInN0YWdlMWxvYWRcIixcbiAgICAgICAgICAgIHNjZW5lczogW3tcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJzdGFnZTFsb2FkXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIkxvYWRpbmdTY2VuZVwiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGU6IFwic3RhZ2UxXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJzdGFnZTFcIixcbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInN0YWdlMVwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJNYWluU2NlbmVcIixcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhZ2VJZDogMSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwiZ2FtZW92ZXJcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiR2FtZU92ZXJTY2VuZVwiLFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJ0b1RpdGxlXCIsXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJ0b1RpdGxlXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlNjZW5lRmxvd1wiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBzdGFydExhYmVsOiBcInRpdGxlXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuLy/vv71277+977+977+9Tu+/vWXvv71C77+9WO+/ve+/ve+/vVvvv71o77+9Vu+/vVvvv73vv73vv71077+977+977+9W1xucGhpbmEuZGVmaW5lKFwiUHJhY3RpY2VNb2RlXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmdhbWUuTWFuYWdlclNjZW5lXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICAgICAgc3RhcnRMYWJlbDogXCJtZW51XCIsXG4gICAgICAgICAgICBzY2VuZXM6IFt7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwibWVudVwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJQcmFjdGljZVNjZW5lXCIsXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvL++/vVjvv71l77+9W++/vVfvv71QXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwic3RhZ2UxbG9hZFwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJMb2FkaW5nU2NlbmVcIixcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgYXNzZXRUeXBlOiBcInN0YWdlMVwiXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwic3RhZ2UxXCIsXG4gICAgICAgICAgICB9LHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJzdGFnZTFcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiTWFpblNjZW5lXCIsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0YWdlSWQ6IDEsXG4gICAgICAgICAgICAgICAgICAgIGlzUHJhY3RpY2U6IHRydWUsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBuZXh0TGFiZWw6IFwibWVudVwiLFxuICAgICAgICAgICAgICAgIG5leHRBcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0U3RhZ2U6IDEsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIC8v77+9WO+/vWXvv71b77+9V++/vVFcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJzdGFnZTJsb2FkXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIkxvYWRpbmdTY2VuZVwiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBhc3NldFR5cGU6IFwic3RhZ2UyXCJcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJzdGFnZTJcIixcbiAgICAgICAgICAgIH0se1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInN0YWdlMlwiLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJNYWluU2NlbmVcIixcbiAgICAgICAgICAgICAgICBhcmd1bWVudHM6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RhZ2VJZDogMixcbiAgICAgICAgICAgICAgICAgICAgaXNQcmFjdGljZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIG5leHRMYWJlbDogXCJtZW51XCIsXG4gICAgICAgICAgICAgICAgbmV4dEFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBzZWxlY3RTdGFnZTogMixcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgLy/vv71l77+9WO+/vWfvv71w77+9WO+/vWXvv71b77+9V1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcInN0YWdlOWxvYWRcIixcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU6IFwiTG9hZGluZ1NjZW5lXCIsXG4gICAgICAgICAgICAgICAgYXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0VHlwZTogXCJzdGFnZTlcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbmV4dExhYmVsOiBcInN0YWdlOVwiLFxuICAgICAgICAgICAgfSx7XG4gICAgICAgICAgICAgICAgbGFiZWw6IFwic3RhZ2U5XCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIk1haW5TY2VuZVwiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBzdGFnZUlkOiA5LFxuICAgICAgICAgICAgICAgICAgICBpc1ByYWN0aWNlOiB0cnVlLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbmV4dExhYmVsOiBcIm1lbnVcIixcbiAgICAgICAgICAgICAgICBuZXh0QXJndW1lbnRzOiB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdFN0YWdlOiA5LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICAvL++/vV7vv71D77+9Z++/ve+/ve+/vcmW34Lvv71cbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBsYWJlbDogXCJ0b1RpdGxlXCIsXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlNjZW5lRmxvd1wiLFxuICAgICAgICAgICAgICAgIGFyZ3VtZW50czoge1xuICAgICAgICAgICAgICAgICAgICBzdGFydExhYmVsOiBcInRpdGxlXCIsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1dLFxuICAgICAgICB9KTtcbiAgICB9XG59KTtcbiIsIi8qXG4gKiAgc2V0dGluZ3NjZW5lLmpzXG4gKiAgMjAxNi8wNC8wNlxuICogIEBhdXRoZXIgbWluaW1vICBcbiAqICBUaGlzIFByb2dyYW0gaXMgTUlUIGxpY2Vuc2UuXG4gKi9cblxucGhpbmEuZGVmaW5lKFwiU2V0dGluZ1NjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lXCIsXG5cbiAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgIGxhYmVsUGFyYW06IHtcbiAgICAgICAgdGV4dDogXCJcIixcbiAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICBzdHJva2VXaWR0aDogMixcblxuICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgIGFsaWduOiBcImNlbnRlclwiLFxuICAgICAgICBiYXNlbGluZTogXCJtaWRkbGVcIixcbiAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICBmb250V2VpZ2h0OiAnJ1xuICAgIH0sXG5cbiAgICBpbml0OiBmdW5jdGlvbihtZW51KSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgICAgdmFyIG1lbnVQYXJhbSA9IHtcbiAgICAgICAgICAgIHRpdGxlOiBcIlNFVFRJTkdcIixcbiAgICAgICAgICAgIGl0ZW06IFtcIkdBTUVcIiwgXCJTWVNURU1cIiwgXCJ0ZXN0XCIsIFwiRVhJVFwiXSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBbXCJtZW51MVwiLCBcIm1lbnUyXCIsIFwidGVzdFwiLCBcImV4aXRcIl0sXG4gICAgICAgIH07XG4gICAgICAgIG1lbnVQYXJhbS5pdGVtWzJdID0gU2VsZWN0b3IoKTtcblxuICAgICAgICB0aGlzLm1lbnUgPSBNZW51RGlhbG9nKG1lbnVQYXJhbSkuYWRkQ2hpbGRUbyh0aGlzKTtcbiAgICAgICAgdGhpcy5tZW51Lm9uKCdkZWNpc2lvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHZhciBzZWwgPSBlLnRhcmdldC5zZWxlY3Q7XG4gICAgICAgICAgICBpZiAoc2VsID09IDMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnUuY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgdGhpcy50d2VlbmVyLmNsZWFyKClcbiAgICAgICAgICAgICAgICAgICAgLndhaXQoNjAwKVxuICAgICAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwLnBvcFNjZW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLm1lbnUub24oJ2NhbmNlbCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMubWVudS5jbG9zZU1lbnUoKTtcbiAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpXG4gICAgICAgICAgICAgICAgLndhaXQoNjAwKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5wb3BTY2VuZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG59KTtcblxuIiwiLypcbiAqICBzcGxhc2hzY2VuZS5qc1xuICogIDIwMTUvMTIvMDJcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5uYW1lc3BhY2UoZnVuY3Rpb24oKSB7XG4gICAgcGhpbmEuZGVmaW5lKCdTcGxhc2hTY2VuZScsIHtcbiAgICAgICAgc3VwZXJDbGFzczogJ3BoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lJyxcblxuICAgICAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3VwZXJJbml0KHt3aWR0aDogU0NfVywgaGVpZ2h0OiBTQ19IfSk7XG5cbiAgICAgICAgICAgIHRoaXMudW5sb2NrID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxvYWRjb21wbGV0ZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvL3ByZWxvYWQgYXNzZXRcbiAgICAgICAgICAgIHZhciBhc3NldHMgPSBBcHBsaWNhdGlvbi5hc3NldHNbXCJwcmVsb2FkXCJdO1xuICAgICAgICAgICAgdmFyIGxvYWRlciA9IHBoaW5hLmFzc2V0LkFzc2V0TG9hZGVyKCk7XG4gICAgICAgICAgICBsb2FkZXIubG9hZChhc3NldHMpO1xuICAgICAgICAgICAgbG9hZGVyLm9uKCdsb2FkJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZGNvbXBsZXRlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIC8vbG9nb1xuICAgICAgICAgICAgdmFyIHRleHR1cmUgPSBwaGluYS5hc3NldC5UZXh0dXJlKCk7XG4gICAgICAgICAgICB0ZXh0dXJlLmxvYWQoU3BsYXNoU2NlbmUubG9nbykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0KCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgdGhpcy50ZXh0dXJlID0gdGV4dHVyZTtcbiAgICAgICAgfSxcblxuICAgICAgICBfaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnNwcml0ZSA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKHRoaXMudGV4dHVyZSlcbiAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbih0aGlzLmdyaWRYLmNlbnRlcigpLCB0aGlzLmdyaWRZLmNlbnRlcigpKVxuICAgICAgICAgICAgICAgIC5zZXRTY2FsZSgwLjMpO1xuICAgICAgICAgICAgdGhpcy5zcHJpdGUuYWxwaGEgPSAwO1xuXG4gICAgICAgICAgICB0aGlzLnNwcml0ZS50d2VlbmVyXG4gICAgICAgICAgICAgICAgLmNsZWFyKClcbiAgICAgICAgICAgICAgICAudG8oe2FscGhhOjF9LCA1MDAsICdlYXNlT3V0Q3ViaWMnKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVubG9jayA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSwgdGhpcylcbiAgICAgICAgICAgICAgICAud2FpdCgxMDAwKVxuICAgICAgICAgICAgICAgIC50byh7YWxwaGE6MH0sIDUwMCwgJ2Vhc2VPdXRDdWJpYycpXG4gICAgICAgICAgICAgICAgLndhaXQoMjUwKVxuICAgICAgICAgICAgICAgIC5jYWxsKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9LCB0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgICAgICBpZiAoY3Qub2sgfHwgY3QuY2FuY2VsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudW5sb2NrICYmIHRoaXMubG9hZGNvbXBsZXRlKSB0aGlzLmV4aXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBvbnBvaW50c3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMudW5sb2NrICYmIHRoaXMubG9hZGNvbXBsZXRlKSB0aGlzLmV4aXQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBfc3RhdGljOiB7XG4gICAgICAgICAgICBsb2dvOiBcImFzc2V0cy9pbWFnZXMvbG9nby5wbmdcIixcbiAgICAgICAgfSxcbiAgICB9KTtcbn0pO1xuIiwiLypcbiAqICBUaXRpbGVTY2VuZS5qc1xuICogIDIwMTQvMDYvMDRcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICpcbiAqL1xuXG5waGluYS5kZWZpbmUoXCJUaXRsZVNjZW5lXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcInBoaW5hLmRpc3BsYXkuRGlzcGxheVNjZW5lXCIsXG4gICAgXG4gICAgX21lbWJlcjoge1xuICAgICAgICAvL+ODqeODmeODq+eUqOODkeODqeODoeODvOOCv1xuICAgICAgICB0aXRsZVBhcmFtOiB7XG4gICAgICAgICAgICB0ZXh0OiBcIlwiLFxuICAgICAgICAgICAgZmlsbDogXCJ3aGl0ZVwiLFxuICAgICAgICAgICAgc3Ryb2tlOiBcImJsdWVcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDM2LFxuICAgICAgICAgICAgZm9udFdlaWdodDogJydcbiAgICAgICAgfSxcbiAgICAgICAgbXNnUGFyYW06IHtcbiAgICAgICAgICAgIHRleHQ6IFwiXCIsXG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwiYmxhY2tcIixcbiAgICAgICAgICAgIHN0cm9rZVdpZHRoOiAyLFxuXG4gICAgICAgICAgICBmb250RmFtaWx5OiBcIk9yYml0cm9uXCIsXG4gICAgICAgICAgICBhbGlnbjogXCJjZW50ZXJcIixcbiAgICAgICAgICAgIGJhc2VsaW5lOiBcIm1pZGRsZVwiLFxuICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgZm9udFdlaWdodDogJydcbiAgICAgICAgfSxcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIHRoaXMuJGV4dGVuZCh0aGlzLl9tZW1iZXIpO1xuXG4gICAgICAgIC8v44OQ44OD44Kv44Kw44Op44Km44Oz44OJXG4gICAgICAgIHZhciBwYXJhbSA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCxcbiAgICAgICAgICAgIGZpbGw6ICdibGFjaycsXG4gICAgICAgICAgICBzdHJva2U6IGZhbHNlLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJnID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICB0aGlzLmJnLnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJyk7XG5cbiAgICAgICAgLy/jg5Djg7zjgrjjg6fjg7Pnlarlj7dcbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7XG4gICAgICAgICAgICB0ZXh0OiBcInZlciBcIitfVkVSU0lPTl8sXG4gICAgICAgICAgICBhbGlnbjogXCJsZWZ0XCIsXG4gICAgICAgICAgICBiYXNlbGluZTogXCJ0b3BcIixcbiAgICAgICAgICAgIGZvbnRTaXplOiA4LFxuICAgICAgICAgICAgc3Ryb2tlOiBcImJsYWNrXCIsXG4gICAgICAgICAgICBmaWxsOiBcIndoaXRlXCIsXG4gICAgICAgIH0uJHNhZmUodGhpcy50aXRsZVBhcmFtKSkuYWRkQ2hpbGRUbyh0aGlzKS5zZXRQb3NpdGlvbigyLCAyKTtcblxuICAgICAgICAgICAgLy/jgYvjgaPjgZPjgojjgZXjgZLjgarjgqrjg5bjgrjjgqdcbiAgICAgICAgdGhpcy5hY2MgPSBwaGluYS5leHRlbnNpb24uQ2lyY2xlQnV0dG9uKHtyYWRpdXM6IDY0fSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC4zKVxuICAgICAgICAgICAgLnNldFNjYWxlKDAuMCwgMC4wKTtcbiAgICAgICAgdGhpcy5hY2MuaW50ZXJhY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hY2MudHdlZW5lci5jbGVhcigpLnRvKHsgc2NhbGVYOiAyLjAsIHNjYWxlWTogMSB9LCAxNTApO1xuXG4gICAgICAgIC8v44K/44Kk44OI44OrXG4gICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiUGxhbmV0XCJ9LiRzYWZlKHRoaXMudGl0bGVQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC4zLTUsIFNDX0gqMC4zKTtcbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJCdXN0ZXJcIn0uJHNhZmUodGhpcy50aXRsZVBhcmFtKSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjcrNSwgU0NfSCowLjMpO1xuICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlJFVklTSU9OXCIsIGZvbnRTaXplOjE2LCBzdHJva2U6IFwicmVkXCJ9LiRzYWZlKHRoaXMudGl0bGVQYXJhbSkpXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuMzUpO1xuXG4gICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgLy/pgbjmip7jgqvjg7zjgr3jg6tcbiAgICAgICAgdmFyIHBhcmFtMiA9IHtcbiAgICAgICAgICAgIHdpZHRoOlNDX1csXG4gICAgICAgICAgICBoZWlnaHQ6U0NfSCowLjA4LFxuICAgICAgICAgICAgZmlsbDogXCJyZ2JhKDAsMTAwLDIwMCwwLjUpXCIsXG4gICAgICAgICAgICBzdHJva2U6IFwicmdiYSgwLDEwMCwyMDAsMC41KVwiLFxuICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAndHJhbnNwYXJlbnQnLFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmN1cnNvbCA9IHBoaW5hLmV4dGVuc2lvbi5DdXJzb2xGcmFtZSh7d2lkdGg6IFNDX1cqMC43LCBoZWlnaHQ6IFNDX0gqMC4wNn0pXG4gICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNi0zKVxuXG4gICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiQVJDQURFIE1PREVcIn0uJHNhZmUodGhpcy5tc2dQYXJhbSkpLmFkZENoaWxkVG8odGhpcykuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC42KTtcbiAgICAgICAgcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJQUkFDVElDRSBNT0RFXCJ9LiRzYWZlKHRoaXMubXNnUGFyYW0pKS5hZGRDaGlsZFRvKHRoaXMpLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNyk7XG4gICAgICAgIHRoaXMubGFiZWwzID0gcGhpbmEuZGlzcGxheS5MYWJlbCh7dGV4dDogXCJTRVRUSU5HXCJ9LiRzYWZlKHRoaXMubXNnUGFyYW0pKS5hZGRDaGlsZFRvKHRoaXMpLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuOCk7XG4gICAgICAgIHRoaXMubGFiZWwzLmJsaW5rID0gZmFsc2U7XG4gICAgICAgIHRoaXMubGFiZWwzLnVwZGF0ZSA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsaW5rICYmIGUudGlja2VyLmZyYW1lICUgMTAgPT0gMCkgdGhpcy52aXNpYmxlID0gIXRoaXMudmlzaWJsZTtcbiAgICAgICAgICAgIGlmICghdGhpcy5ibGluaykgdGhpcy52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8v44K/44OD44OB55SoXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYyA9IHBoaW5hLmRpc3BsYXkuUmVjdGFuZ2xlU2hhcGUocGFyYW0yKVxuICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNitpKlNDX0gqMC4xKVxuICAgICAgICAgICAgICAgIC5zZXRJbnRlcmFjdGl2ZSh0cnVlKTtcbiAgICAgICAgICAgIGMuYWxwaGEgPSAwO1xuICAgICAgICAgICAgYy5zZWxlY3QgPSBpO1xuICAgICAgICAgICAgYy5vbnBvaW50c3RhcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5pc1NlbGVjdGVkKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3QgIT0gdGhpcy5zZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QgPSB0aGlzLnNlbGVjdDtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJzb2wudHdlZW5lci5jbGVhcigpLm1vdmVUbyhTQ19XKjAuNSwgU0NfSCowLjYrKHRoYXQuc2VsZWN0KlNDX0gqMC4xKS0zLCAyMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic2VsZWN0XCIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubWVudVNlbGVjdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8v6YG45oqe5Lit44Oh44OL44Ol44O855Wq5Y+3XG4gICAgICAgIHRoaXMuc2VsZWN0ID0gMDtcbiAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5tYXNrID0gcGhpbmEuZGlzcGxheS5SZWN0YW5nbGVTaGFwZShwYXJhbSlcbiAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC41KVxuICAgICAgICB0aGlzLm1hc2sudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKS5mYWRlT3V0KDIwKTtcblxuICAgICAgICAvL+aIu+OBo+OBpuOBjeOBn+WgtOWQiOOBq+mBuOaKnueKtuaFi+OCkuino+mZpFxuICAgICAgICB0aGlzLm9uKCdlbnRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgfSxcbiAgICBcbiAgICB1cGRhdGU6IGZ1bmN0aW9uKGFwcCkge1xuICAgICAgICAvL+OCreODvOODnOODvOODieaTjeS9nFxuICAgICAgICBpZiAodGhpcy50aW1lID4gMTAgJiYgIXRoaXMuaXNTZWxlY3RlZCkge1xuICAgICAgICAgICAgdmFyIGN0ID0gYXBwLmNvbnRyb2xsZXI7XG4gICAgICAgICAgICBpZiAoY3QudXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdC0tO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWxlY3QgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3Vyc29sLnR3ZWVuZXIuY2xlYXIoKS5tb3ZlVG8oU0NfVyowLjUsIFNDX0gqMC42Kyh0aGlzLnNlbGVjdCpTQ19IKjAuMSktMywgMjAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInNlbGVjdFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdC5kb3duKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3QrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zZWxlY3QgPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ID0gMjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1cnNvbC50d2VlbmVyLmNsZWFyKCkubW92ZVRvKFNDX1cqMC41LCBTQ19IKjAuNisodGhpcy5zZWxlY3QqU0NfSCowLjEpLTMsIDIwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgICAgIGFwcC5wbGF5U0UoXCJzZWxlY3RcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMudGltZSA9IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3Qub2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVTZWxlY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRpbWUrKztcbiAgICB9LFxuXG4gICAgbWVudVNlbGVjdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5zZWxlY3QpIHtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgIC8vQVJDQURFIE1PREVcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic3RhcnRcIik7XG4gICAgICAgICAgICAgICAgYXBwLnNjb3JlID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLndhaXQoMjUwMCkuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hcmNhZGVNb2RlKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIkFSQ0FERSBNT0RFXCJ9LiRzYWZlKHRoaXMubXNnUGFyYW0pKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC42KVxuICAgICAgICAgICAgICAgICAgICAudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6MS41LCBzY2FsZVk6IDEuNSwgYWxwaGE6IDB9LCAyMDAwLCBcImVhc2VPdXRDdWJpY1wiKTtcbiAgICAgICAgICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIkFSQ0FERSBNT0RFXCJ9LiRzYWZlKHRoaXMubXNnUGFyYW0pKVxuICAgICAgICAgICAgICAgICAgICAuYWRkQ2hpbGRUbyh0aGlzKVxuICAgICAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC42KVxuICAgICAgICAgICAgICAgICAgICAudHdlZW5lci5jbGVhcigpLndhaXQoMTAwKS50byh7c2NhbGVYOjEuNSwgc2NhbGVZOiAxLjUsIGFscGhhOiAwfSwgMjAwMCwgXCJlYXNlT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAvL1BSQUNUSUNFIE1PREVcbiAgICAgICAgICAgICAgICBhcHAucGxheVNFKFwic3RhcnRcIik7XG4gICAgICAgICAgICAgICAgYXBwLnNjb3JlID0gMDtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMudHdlZW5lci5jbGVhcigpLndhaXQoMjUwMCkuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wcmFjdGljZU1vZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICBwaGluYS5kaXNwbGF5LkxhYmVsKHt0ZXh0OiBcIlBSQUNUSUNFIE1PREVcIn0uJHNhZmUodGhpcy5tc2dQYXJhbSkpXG4gICAgICAgICAgICAgICAgICAgIC5hZGRDaGlsZFRvKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgIC5zZXRQb3NpdGlvbihTQ19XKjAuNSwgU0NfSCowLjcpXG4gICAgICAgICAgICAgICAgICAgIC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDoxLjUsIHNjYWxlWTogMS41LCBhbHBoYTogMH0sIDIwMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgIHBoaW5hLmRpc3BsYXkuTGFiZWwoe3RleHQ6IFwiUFJBQ1RJQ0UgTU9ERVwifS4kc2FmZSh0aGlzLm1zZ1BhcmFtKSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcylcbiAgICAgICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNylcbiAgICAgICAgICAgICAgICAgICAgLnR3ZWVuZXIuY2xlYXIoKS53YWl0KDEwMCkudG8oe3NjYWxlWDoxLjUsIHNjYWxlWTogMS41LCBhbHBoYTogMH0sIDIwMDAsIFwiZWFzZU91dEN1YmljXCIpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgLy9TRVRUSU5HXG4gICAgICAgICAgICAgICAgYXBwLnBsYXlTRShcInNldHRpbmdcIik7XG4gICAgICAgICAgICAgICAgdGhpcy5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLnR3ZWVuZXIuY2xlYXIoKS53YWl0KDcwMClcbiAgICAgICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxhYmVsMy5ibGluayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNTZWxlY3RlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5nTW9kZSgpO1xuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMubGFiZWwzLmJsaW5rID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBhcmNhZGVNb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5leGl0KFwiYXJjYWRlXCIpO1xuICAgIH0sXG5cbiAgICBwcmFjdGljZU1vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV4aXQoXCJwcmFjdGljZVwiKTtcbiAgICB9LFxuXG4gICAgc2V0dGluZ01vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHAucHVzaFNjZW5lKFNldHRpbmdTY2VuZSh0aGlzKSk7XG4gICAgfSxcbn0pO1xuIiwiLypcbiAqICBHcm91bmQuanNcbiAqICAyMDE1LzEwLzEwXG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuXG5waGluYS5kZWZpbmUoXCJHcm91bmRcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuZGlzcGxheS5EaXNwbGF5RWxlbWVudFwiLFxuICAgIGxheWVyOiBMQVlFUl9CQUNLR1JPVU5ELCAgICAvL+aJgOWxnuODrOOCpOODpOODvFxuXG4gICAgX21lbWJlcjoge1xuICAgICAgICBtYXA6IG51bGwsXG4gICAgICAgIGJlbHQ6IGZhbHNlLCAgICAvL+e5sOOCiui/lOOBl+WcsOW9ouODleODqeOCsFxuXG4gICAgICAgIGRpcmVjdGlvbjogMCwgICAvL+OCueOCr+ODreODvOODq+aWueWQkVxuICAgICAgICBzcGVlZDogMSwgICAgICAgLy/jgrnjgq/jg63jg7zjg6vpgJ/luqZcblxuICAgICAgICBhbHRpdHVkZUJhc2ljOiAyMCwgIC8v5Z+65pys6auY5bqmXG4gICAgICAgIGFsdGl0dWRlOiAxLCAgICAgICAgLy/nj77lnKjpq5jluqbvvIjln7rmnKzpq5jluqbjgavlr77jgZnjgovlibLlkIjvvJrvvJHjgpLvvJHvvJDvvJDvvIXjgajjgZnjgospXG4gICAgICAgIGlzU2hhZG93OiB0cnVlLCAgICAgLy/lvbHmnInjgorjg5Xjg6njgrBcblxuICAgICAgICBkZWx0YVggOiAwLCAgICAgICAgXG4gICAgICAgIGRlbHRhWSA6IDAsICAgICAgICBcbiAgICB9LFxuXG4gICAgaW5pdDogZnVuY3Rpb24ob3B0aW9uKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG4gICAgICAgIHRoaXMuJHNhZmUodGhpcy5fbWVtYmVyKTtcbiAgICAgICAgb3B0aW9uID0gKG9wdGlvbiB8fCB7fSkuJHNhZmUoe1xuICAgICAgICAgICAgYXNzZXQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlXCIsXG4gICAgICAgICAgICBiZWx0OiBmYWxzZSxcbiAgICAgICAgICAgIHg6IFNDX1cqMC41LFxuICAgICAgICAgICAgeTogU0NfSCowLjVcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXNzZXQgPSBvcHRpb24uYXNzZXQ7XG4gICAgICAgIHRoaXMudHlwZSA9IG9wdGlvbi50eXBlO1xuICAgICAgICB0aGlzLmJlbHQgPSBvcHRpb24uYmVsdDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9uLnggPSBvcHRpb24ueDtcbiAgICAgICAgdGhpcy5wb3NpdGlvbi55ID0gb3B0aW9uLnk7XG5cbiAgICAgICAgdGhpcy50d2VlbmVyLnNldFVwZGF0ZVR5cGUoJ2ZwcycpO1xuXG4gICAgICAgIHRoaXMubWFwQmFzZSA9IHBoaW5hLmRpc3BsYXkuRGlzcGxheUVsZW1lbnQoKS5zZXRQb3NpdGlvbigwLCAwKS5hZGRDaGlsZFRvKHRoaXMpO1xuICAgICAgICB0aGlzLm1hcEJhc2UudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKTtcblxuICAgICAgICBpZiAodGhpcy5hc3NldCkge1xuICAgICAgICAgICAgdGhpcy5zZXR1cE1hcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vbihcImVudGVyZnJhbWVcIiwgdGhpcy5kZWZhdWx0RW50ZXJmcmFtZSk7XG4gICAgfSxcblxuICAgIGRlZmF1bHRFbnRlcmZyYW1lOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJhZCA9ICh0aGlzLmRpcmVjdGlvbis5MCkqdG9SYWQ7XG4gICAgICAgIHRoaXMuZGVsdGFYID0gTWF0aC5jb3MocmFkKSp0aGlzLnNwZWVkO1xuICAgICAgICB0aGlzLmRlbHRhWSA9IE1hdGguc2luKHJhZCkqdGhpcy5zcGVlZDtcblxuICAgICAgICB0aGlzLm1hcEJhc2UueCArPSB0aGlzLmRlbHRhWDtcbiAgICAgICAgdGhpcy5tYXBCYXNlLnkgKz0gdGhpcy5kZWx0YVk7XG5cbiAgICAgICAgaWYgKHRoaXMuYmVsdCkge1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCAzOyB5KyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IDM7IHgrKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbSA9IHRoaXMubWFwW3hdW3ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3ggPSBNYXRoLmZsb29yKCh0aGlzLm1hcEJhc2UueCArIG0ueCkvdGhpcy5tYXAud2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ggPiAgMCkgbS54IC09IHRoaXMubWFwLndpZHRoKjM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeCA8IC0yKSBtLnggKz0gdGhpcy5tYXAud2lkdGgqMztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN5ID0gTWF0aC5mbG9vcigodGhpcy5tYXBCYXNlLnkgKyBtLnkpL3RoaXMubWFwLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeSA+ICAwKSBtLnkgLT0gdGhpcy5tYXAuaGVpZ2h0KjM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzeSA8IC0yKSBtLnkgKz0gdGhpcy5tYXAuaGVpZ2h0KjM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIHNldHVwTWFwOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLmJlbHQpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT0gXCJpbWFnZVwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAgPSBwaGluYS5kaXNwbGF5LlNwcml0ZSh0aGlzLmFzc2V0KS5hZGRDaGlsZFRvKHRoaXMubWFwQmFzZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PSBcInRteFwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRteCA9IHBoaW5hLmFzc2V0LkFzc2V0TWFuYWdlci5nZXQoJ3RteCcsIHRoaXMuYXNzZXQpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFwID0gcGhpbmEuZGlzcGxheS5TcHJpdGUodG14LmltYWdlKS5hZGRDaGlsZFRvKHRoaXMubWFwQmFzZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdyA9IHRoaXMubWFwLndpZHRoO1xuICAgICAgICAgICAgdmFyIGggPSB0aGlzLm1hcC5oZWlnaHQ7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQb3NpdGlvbigwLCAwKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldE9yaWdpbigwLCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT0gXCJpbWFnZVwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgnaW1hZ2UnLCB0aGlzLmFzc2V0KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09IFwidG14XCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgdG14ID0gcGhpbmEuYXNzZXQuQXNzZXRNYW5hZ2VyLmdldCgndG14JywgdGhpcy5hc3NldCk7XG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gdG14LmltYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tYXAgPSBbXTtcbiAgICAgICAgICAgIHRoaXMubWFwLndpZHRoID0gaW1hZ2UuZG9tRWxlbWVudC53aWR0aDtcbiAgICAgICAgICAgIHRoaXMubWFwLmhlaWdodCA9IGltYWdlLmRvbUVsZW1lbnQuaGVpZ2h0O1xuICAgICAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCAzOyB4KyspIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcFt4XSA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgMzsgeSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBteCA9ICh4LTEpICogdGhpcy5tYXAud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIHZhciBteSA9ICh5LTEpICogdGhpcy5tYXAuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcFt4XVt5XSA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKGltYWdlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmFkZENoaWxkVG8odGhpcy5tYXBCYXNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKG14LCBteSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5zZXRPcmlnaW4oMCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwW3hdW3ldLm1hcFggPSBNYXRoLmZsb29yKG14IC8gdGhpcy5tYXAud2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcFt4XVt5XS5tYXBZID0gTWF0aC5mbG9vcihteSAvIHRoaXMubWFwLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcblxuICAgIGFkZExheWVyOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgfSxcblxuICAgIHNldERpcmVjdGlvbjogZnVuY3Rpb24oZGlyKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgc2V0U3BlZWQ6IGZ1bmN0aW9uKHNwZWVkKSB7XG4gICAgICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIHNldFBvc2l0aW9uOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHRoaXMubWFwQmFzZS54ID0geDtcbiAgICAgICAgdGhpcy5tYXBCYXNlLnkgPSB5O1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgX2FjY2Vzc29yOiB7XG4gICAgICAgIHg6IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5tYXBCYXNlLng7IH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih4KSB7IHRoaXMubWFwQmFzZS54ID0geDt9XG4gICAgICAgIH0sXG4gICAgICAgIHk6IHtcbiAgICAgICAgICAgIFwiZ2V0XCI6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5tYXBCYXNlLnk7IH0sXG4gICAgICAgICAgICBcInNldFwiOiBmdW5jdGlvbih5KSB7IHRoaXMubWFwQmFzZS54ID0geTt9XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2hhZG93WDoge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh0aGlzLmFsdGl0dWRlQmFzaWMgKiB0aGlzLmFsdGl0dWRlKSowLjU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24oeSkge31cbiAgICAgICAgfSxcbiAgICAgICAgc2hhZG93WToge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWx0aXR1ZGVCYXNpYyAqIHRoaXMuYWx0aXR1ZGU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24oeSkge31cbiAgICAgICAgfSxcbi8qXG4gICAgICAgIHNjYWxlWDoge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLm1hcEJhc2Uuc2NhbGVYOyB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24oeCkgeyB0aGlzLm1hcEJhc2Uuc2NhbGVYID0geDt9XG4gICAgICAgIH0sXG4gICAgICAgIHNjYWxlWToge1xuICAgICAgICAgICAgXCJnZXRcIjogZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzLm1hcEJhc2Uuc2NhbGVZOyB9LFxuICAgICAgICAgICAgXCJzZXRcIjogZnVuY3Rpb24oeSkgeyB0aGlzLm1hcEJhc2Uuc2NhbGVZID0geTt9XG4gICAgICAgIH0sXG4qL1xuICAgIH1cbn0pO1xuIiwiLypcbiAqICBTdGFnZURhdGEuanNcbiAqICAyMDE0LzA4LzA2XG4gKiAgQGF1dGhlciBtaW5pbW8gIFxuICogIFRoaXMgUHJvZ3JhbSBpcyBNSVQgbGljZW5zZS5cbiAqL1xuKGZ1bmN0aW9uKCkge1xuXG4vL+OCueODhuODvOOCuO+8kVxucGhpbmEuZGVmaW5lKFwiU3RhZ2UxXCIsIHtcbiAgICBzdXBlckNsYXNzOiBcIlN0YWdlQ29udHJvbGxlclwiLFxuXG4gICAgYWx0aXR1ZGVCYXNpYzogNDAsXG5cbiAgICBpbml0OiBmdW5jdGlvbihwYXJlbnQsIHBsYXllcikge1xuICAgICAgICB0aGlzLnN1cGVySW5pdChwYXJlbnQsIHBsYXllcik7XG5cbiAgICAgICAgLy/liJ3mnJ/ljJblh6bnkIZcbiAgICAgICAgdGhpcy5hZGQoMSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBhcHAucGxheUJHTShcInN0YWdlMVwiLCB0cnVlKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmlzQWZ0ZXJidXJuZXIgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGQoNjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6MS4wLCBzY2FsZVk6MS4wLCBzcGVlZDozLjB9LCAzMDAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5pc0FmdGVyYnVybmVyID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vU3RhZ2UgZGF0YVxuICAgICAgICB0aGlzLmFkZCggMTgwLCBcIkhvcm5ldDEtbGVmdFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJIb3JuZXQxLXJpZ2h0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIkhvcm5ldDEtY2VudGVyXCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiSG9ybmV0MS1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggICAxLCBcIkhvcm5ldDEtcmlnaHRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0MS1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJNdWREYXViZXItbGVmdFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJNdWREYXViZXItcmlnaHRcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoNjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6MS4wLCBzY2FsZVk6MS4wLCBzcGVlZDoxLjB9LCAzMDAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkKCAgOTAsIFwiSG9ybmV0MS1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDIwLCBcIkhvcm5ldDEtcmlnaHRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiSG9ybmV0MS1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJUb3lCb3gtcC1yaWdodFwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIkZyYWdhcmFjaC1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJIb3JuZXQxLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgIDEsIFwiSG9ybmV0MS1yaWdodFwiKTtcbiAgICAgICAgdGhpcy5hZGQoIDE4MCwgXCJIb3JuZXQxLWNlbnRlclwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIkZyYWdhcmFjaC1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIkZyYWdhcmFjaC1yaWdodFwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIkhvcm5ldDMtY2VudGVyXCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiRnJhZ2FyYWNoLWxlZnQyXCIpO1xuICAgICAgICB0aGlzLmFkZCggICAxLCBcIkZyYWdhcmFjaC1yaWdodDJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoNjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6MS4wLCBzY2FsZVk6MS4wLCBzcGVlZDozLjB9LCAzMDAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0MS1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIkhvcm5ldDEtcmlnaHRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0MS1jZW50ZXJcIik7XG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiSG9ybmV0My1jZW50ZXJcIik7XG5cbiAgICAgICAgLy/kuK3jg5zjgrlcbiAgICAgICAgdGhpcy5hZGQoIDM2MCwgXCJUaG9ySGFtbWVyXCIsIHtib3NzOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzcGVlZDoxMC4wfSwgMTgwLCBcImVhc2VJbk91dEN1YmljXCIpO1xuICAgICAgICAgICAgdGhpcy5wbGF5ZXIuaXNBZnRlcmJ1cm5lciA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZCggMTgwMCwgZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzcGVlZDo1LjB9LCAxODAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5pc0FmdGVyYnVybmVyID0gZmFsc2U7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxODAsIFwiSG9ybmV0MS1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggIDYwLCBcIkhvcm5ldDEtcmlnaHRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0MS1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJIb3JuZXQzLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgIDEsIFwiSG9ybmV0My1yaWdodFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJIb3JuZXQzLWNlbnRlclwiKTtcblxuICAgICAgICB0aGlzLmFkZCgxMjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6MC41LCBzY2FsZVk6MC41LCBzcGVlZDoyLjB9LCA2MDAsIFwiZWFzZUluT3V0U2luZVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hZGQoICAzMCwgXCJCaWdXaW5nLWxlZnRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAxODAsIFwiQmlnV2luZy1yaWdodFwiKTtcblxuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIkhvcm5ldDItbGVmdFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICAyMCwgXCJIb3JuZXQyLXJpZ2h0XCIpO1xuICAgICAgICB0aGlzLmFkZCggMTIwLCBcIkhvcm5ldDItY2VudGVyXCIpO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiSG9ybmV0My1sZWZ0XCIpO1xuICAgICAgICB0aGlzLmFkZCggICAxLCBcIkhvcm5ldDMtcmlnaHRcIik7XG4gICAgICAgIHRoaXMuYWRkKCAgNjAsIFwiSG9ybmV0My1jZW50ZXJcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJNdWREYXViZXItbGVmdFwiKTtcbiAgICAgICAgdGhpcy5hZGQoICA2MCwgXCJNdWREYXViZXItcmlnaHRcIik7XG5cbiAgICAgICAgdGhpcy5hZGQoIDEyMCwgXCJUb3lCb3gtcC1jZW50ZXJcIik7XG5cbiAgICAgICAgLy9XQVJOSU5HXG4gICAgICAgIHRoaXMuYWRkKCAzNjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5lbnRlcldhcm5pbmcoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy/jgrnjg4bjg7zjgrjjg5zjgrlcbiAgICAgICAgdGhpcy5hZGQoIDMwMCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NwZWVkOjAuMH0sIDE4MCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIFwiR29seWF0XCIsIHtib3NzOiB0cnVlfSk7XG4gICAgICAgIHRoaXMuYWRkKCAxMjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzcGVlZDotNy4wfSwgMTgwLCBcImVhc2VJbk91dEN1YmljXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGQoIDE4MDAsIGZ1bmN0aW9uKCkge30pO1xuXG5cbiAgICAgICAgLy/jgqTjg5njg7Pjg4jnmbvpjLJcbiAgICAgICAgdGhpcy5hZGRFdmVudChcInNjcm9sbF8xXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzY2FsZVg6MS4wLCBzY2FsZVk6MS4wLCBzcGVlZDoxLjB9LCAzMDAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZEV2ZW50KFwic2Nyb2xsXzJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDoxLjAsIHNjYWxlWToxLjAsIHNwZWVkOjMuMH0sIDMwMCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnQoXCJzY3JvbGxfM1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kLnR3ZWVuZXIuY2xlYXIoKS50byh7c3BlZWQ6MTAuMH0sIDE4MCwgXCJlYXNlSW5PdXRDdWJpY1wiKTtcbiAgICAgICAgICAgIHRoaXMucGxheWVyLmlzQWZ0ZXJidXJuZXIgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGRFdmVudChcInNjcm9sbF80XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ncm91bmQudHdlZW5lci5jbGVhcigpLnRvKHtzcGVlZDo1LjB9LCAxODAsIFwiZWFzZUluT3V0Q3ViaWNcIik7XG4gICAgICAgICAgICB0aGlzLnBsYXllci5pc0FmdGVyYnVybmVyID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmFkZEV2ZW50KFwic2Nyb2xsXzVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmdyb3VuZC50d2VlbmVyLmNsZWFyKCkudG8oe3NjYWxlWDowLjUsIHNjYWxlWTowLjUsIHNwZWVkOjIuMH0sIDYwMCwgXCJlYXNlSW5PdXRTaW5lXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGRFdmVudChcIndhcm5pbmdcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVudGVyV2FybmluZygpO1xuICAgICAgICB9KTtcblxuICAgIH0sXG59KTtcblxuLy/jgrnjg4bjg7zjgrjvvJHlnLDlvaLnrqHnkIZcbnBoaW5hLmRlZmluZShcIlN0YWdlMUdyb3VuZFwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJHcm91bmRcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBhc3NldDogXCJtYXAxZ1wiLFxuICAgICAgICAgICAgYmVsdDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHcgPSB0aGlzLm1hcC53aWR0aDtcbiAgICAgICAgdmFyIGggPSB0aGlzLm1hcC5oZWlnaHQ7XG4gICAgICAgIHRoaXMubWFwQmFzZS54ID0gLXcqMC41O1xuICAgICAgICB0aGlzLm1hcEJhc2UueSA9IC1oKjAuNTtcblxuICAgICAgICB0aGlzLnNldFNjYWxlKDAuMiwgMC4yKTtcbiAgICAgICAgdGhpcy5zcGVlZCA9IDEuMDtcbiAgICB9LFxufSk7XG5cbn0pKCk7XG4iLCIvKlxuICogIFN0YWdlMi5qc1xuICogIDIwMTYvMDgvMThcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbi8v44K544OG44O844K477yRXG5waGluYS5kZWZpbmUoXCJTdGFnZTJcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwiU3RhZ2VDb250cm9sbGVyXCIsXG5cbiAgICBhbHRpdHVkZUJhc2ljOiA0MCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCwgcGxheWVyKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHBhcmVudCwgcGxheWVyKTtcblxuICAgICAgICAvL+WIneacn+WMluWHpueQhlxuICAgICAgICB0aGlzLmFkZCgxLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kLnR3ZWVuZXIuY2xlYXIoKS50byh7c2NhbGVYOjAuNSwgc2NhbGVZOjAuNSwgc3BlZWQ6MS4wLCBhbHBoYToxfSwgMSwgXCJlYXNlSW5PdXRRdWFkXCIpO1xuICAgICAgICAgICAgYXBwLnBsYXlCR00oXCJzdGFnZTJcIiwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkKCAxODAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ldmVudFtcImJvc3Nfc2hhZG93XCJdLnZhbHVlLmNhbGwoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgLy9XQVJOSU5HXG4gICAgICAgIHRoaXMuYWRkKCAzNjAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5lbnRlcldhcm5pbmcoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYWRkKCAyNDAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5ldmVudFtcIkdhcnVkYVwiXS52YWx1ZS5jYWxsKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgLy/jgqzjg6vjg7zjg4DmqZ/lvbFcbiAgICAgICAgdGhpcy5hZGRFdmVudChcImJvc3Nfc2hhZG93XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4X2Jvc3MxQmxhY2tcIiwgMjk2LCA4MCk7XG4gICAgICAgICAgICBzaGFkb3cubGF5ZXIgPSBMQVlFUl9GT1JFR1JPVU5EO1xuICAgICAgICAgICAgc2hhZG93LmFscGhhID0gMC41O1xuICAgICAgICAgICAgc2hhZG93LmFkZENoaWxkVG8oYXBwLmN1cnJlbnRTY2VuZSlcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygxMjgsIDMyMCwgMjk2LCAxNjApXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyoxLjEsIFNDX0gqMS4yKVxuICAgICAgICAgICAgICAgIC5zZXRTY2FsZSgyLjApO1xuICAgICAgICAgICAgc2hhZG93LnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMueSAtPSAxO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnkgPCAtODApIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICAvL+ODnOOCueeZu+WgtOa8lOWHulxuICAgICAgICB0aGlzLmFkZEV2ZW50KFwiR2FydWRhXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNoYWRvdyA9IHBoaW5hLmRpc3BsYXkuU3ByaXRlKFwidGV4X2Jvc3MxQmxhY2tcIiwgMjk2LCA4MClcbiAgICAgICAgICAgICAgICAuc2V0RnJhbWVUcmltbWluZygxMjgsIDMyMCwgMjk2LCAxNjApXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lSW5kZXgoMClcbiAgICAgICAgICAgICAgICAuc2V0UG9zaXRpb24oU0NfVyowLjUsIFNDX0gqMC40KTtcbiAgICAgICAgICAgIHNoYWRvdy5sYXllciA9IExBWUVSX1NIQURPVztcbiAgICAgICAgICAgIHNoYWRvdy5hbHBoYSA9IDAuMDtcbiAgICAgICAgICAgIHNoYWRvdy50aW1lID0gMDtcbiAgICAgICAgICAgIHNoYWRvdy5hZGRDaGlsZFRvKGFwcC5jdXJyZW50U2NlbmUpO1xuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBzaGFkb3cudHdlZW5lci5zZXRVcGRhdGVUeXBlKCdmcHMnKS5jbGVhcigpXG4gICAgICAgICAgICAgICAgLnRvKHthbHBoYTogMC40LCB5OiBTQ19IKjAuMn0sIDMwMCwgXCJlYXNlT3V0U2luZVwiKVxuICAgICAgICAgICAgICAgIC53YWl0KDEyMClcbiAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5wYXJlbnRTY2VuZS5lbnRlckVuZW15VW5pdChcIkdhcnVkYVwiKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC53YWl0KDEyMClcbiAgICAgICAgICAgICAgICAuY2FsbChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9LmJpbmQoc2hhZG93KSk7XG5cbiAgICAgICAgICAgIHNoYWRvdy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWUrKztcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lIDwgMzAwKSByZXR1cm47IFxuXG4gICAgICAgICAgICAgICAgLy/nhZnjgoLjgY/jgoLjgY/jg7xcbiAgICAgICAgICAgICAgICB2YXIgeDEgPSB0aGlzLng7XG4gICAgICAgICAgICAgICAgdmFyIHkxID0gdGhpcy55LTEwO1xuICAgICAgICAgICAgICAgIHZhciB4MiA9IHRoaXMueCsxNDg7XG4gICAgICAgICAgICAgICAgdmFyIHkyID0gdGhpcy55KzQwO1xuICAgICAgICAgICAgICAgIHZhciB2eSA9IHRoaXMucGFyZW50U2NlbmUuZ3JvdW5kLmRlbHRhWTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciByID0gMDsgciA8IDI7IHIrKykge1xuICAgICAgICAgICAgICAgICAgICBpZiAociA9PSAxKSB4MiA9IHRoaXMueC0xNDg7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcCA9IE1hdGgucmFuZGZsb2F0KDAsIDEuMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHggPSBNYXRoLmZsb29yKHgxKnAreDIqKDEtcCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB5ID0gTWF0aC5mbG9vcih5MSpwK3kyKigxLXApKS0zMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsYXllciA9IHRoaXMucGFyZW50U2NlbmUuZWZmZWN0TGF5ZXJVcHBlcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxheWVyLmVudGVyU21va2VMYXJnZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb246IHt4OiBweCwgeTogcHl9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZlbG9jaXR5OiB7eDogMCwgeTogdnkrTWF0aC5yYW5kaW50KDAsIDMpLCBkZWNheTogMS4wMX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsYXk6IHJhbmQoMCwgMilcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH0sXG59KTtcblxuLy/jgrnjg4bjg7zjgrjvvJHlnLDlvaLnrqHnkIZcbnBoaW5hLmRlZmluZShcIlN0YWdlMkdyb3VuZFwiLCB7XG4gICAgc3VwZXJDbGFzczogXCJHcm91bmRcIixcblxuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnN1cGVySW5pdCh7XG4gICAgICAgICAgICBhc3NldDogXCJtYXAxZ1wiLFxuICAgICAgICAgICAgYmVsdDogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIHcgPSB0aGlzLm1hcC53aWR0aDtcbiAgICAgICAgdmFyIGggPSB0aGlzLm1hcC5oZWlnaHQ7XG4gICAgICAgIHRoaXMubWFwQmFzZS54ID0gLXcqMC41O1xuICAgICAgICB0aGlzLm1hcEJhc2UueSA9IC1oKjAuNTtcbiAgICB9LFxufSk7XG5cbn0pKCk7XG4iLCIvKlxuICogIFN0YWdlRGF0YS5qc1xuICogIDIwMTQvMDgvMDZcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbi8v44OG44K544OI55So44K544OG44O844K4XG5waGluYS5kZWZpbmUoXCJTdGFnZTlcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwiU3RhZ2VDb250cm9sbGVyXCIsXG5cbiAgICBhbHRpdHVkZUJhc2ljOiA0MCxcblxuICAgIGluaXQ6IGZ1bmN0aW9uKHBhcmVudCwgcGxheWVyKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KHBhcmVudCwgcGxheWVyKTtcblxuICAgICAgICAvL+WIneacn+WMluWHpueQhlxuICAgICAgICB0aGlzLmFkZCgxLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGFwcC5wbGF5QkdNKFwic3RhZ2U5XCIsIHRydWUpO1xuICAgICAgICB9KTtcblxuLy8gICAgICAgIHRoaXMuYWRkKCAxODAsIFwiUmF2ZW5cIik7XG4gICAgICAgIHRoaXMuYWRkKCAxODAsIGZ1bmN0aW9uKCkge1xuLy8gICAgICAgICAgICB0aGlzLmV2ZW50W1wiYm9zc19zaGFkb3dcIl0udmFsdWUuY2FsbCgpO1xuICAgICAgICAgICB0aGlzLmV2ZW50W1wiR2FydWRhXCJdLnZhbHVlLmNhbGwoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuXG4gICAgICAgIC8v44Ks44Or44O844OA5qmf5b2xXG4gICAgICAgIHRoaXMuYWRkRXZlbnQoXCJib3NzX3NoYWRvd1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzaGFkb3cgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMUJsYWNrXCIsIDI5NiwgODApO1xuICAgICAgICAgICAgc2hhZG93LmxheWVyID0gTEFZRVJfRk9SRUdST1VORDtcbiAgICAgICAgICAgIHNoYWRvdy5hbHBoYSA9IDAuNTtcbiAgICAgICAgICAgIHNoYWRvdy5hZGRDaGlsZFRvKGFwcC5jdXJyZW50U2NlbmUpXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMTI4LCAzMjAsIDI5NiwgMTYwKVxuICAgICAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMS4xLCBTQ19IKjEuMilcbiAgICAgICAgICAgICAgICAuc2V0U2NhbGUoMi4wKTtcbiAgICAgICAgICAgIHNoYWRvdy51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnkgLT0gMTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy55IDwgLTgwKSB0aGlzLnJlbW92ZSgpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy/jg5zjgrnnmbvloLTmvJTlh7pcbiAgICAgICAgdGhpcy5hZGRFdmVudChcIkdhcnVkYVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzaGFkb3cgPSBwaGluYS5kaXNwbGF5LlNwcml0ZShcInRleF9ib3NzMUJsYWNrXCIsIDI5NiwgODApXG4gICAgICAgICAgICAgICAgLnNldEZyYW1lVHJpbW1pbmcoMTI4LCAzMjAsIDI5NiwgMTYwKVxuICAgICAgICAgICAgICAgIC5zZXRGcmFtZUluZGV4KDApXG4gICAgICAgICAgICAgICAgLnNldFBvc2l0aW9uKFNDX1cqMC41LCBTQ19IKjAuNCk7XG4gICAgICAgICAgICBzaGFkb3cubGF5ZXIgPSBMQVlFUl9TSEFET1c7XG4gICAgICAgICAgICBzaGFkb3cuYWxwaGEgPSAwLjA7XG4gICAgICAgICAgICBzaGFkb3cudGltZSA9IDA7XG4gICAgICAgICAgICBzaGFkb3cuYWRkQ2hpbGRUbyhhcHAuY3VycmVudFNjZW5lKTtcblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgc2hhZG93LnR3ZWVuZXIuc2V0VXBkYXRlVHlwZSgnZnBzJykuY2xlYXIoKVxuICAgICAgICAgICAgICAgIC50byh7YWxwaGE6IDAuNCwgeTogU0NfSCowLjJ9LCAzMDAsIFwiZWFzZU91dFNpbmVcIilcbiAgICAgICAgICAgICAgICAud2FpdCgxMjApXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucGFyZW50U2NlbmUuZW50ZXJFbmVteVVuaXQoXCJHYXJ1ZGFcIik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAud2FpdCgxMjApXG4gICAgICAgICAgICAgICAgLmNhbGwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHNoYWRvdykpO1xuXG4gICAgICAgICAgICBzaGFkb3cudXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lKys7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZSA8IDMwMCkgcmV0dXJuOyBcblxuICAgICAgICAgICAgICAgIC8v54WZ44KC44GP44KC44GP44O8XG4gICAgICAgICAgICAgICAgdmFyIHgxID0gdGhpcy54O1xuICAgICAgICAgICAgICAgIHZhciB5MSA9IHRoaXMueS0xMDtcbiAgICAgICAgICAgICAgICB2YXIgeDIgPSB0aGlzLngrMTQ4O1xuICAgICAgICAgICAgICAgIHZhciB5MiA9IHRoaXMueSs0MDtcbiAgICAgICAgICAgICAgICB2YXIgdnkgPSB0aGlzLnBhcmVudFNjZW5lLmdyb3VuZC5kZWx0YVk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCAyOyByKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIgPT0gMSkgeDIgPSB0aGlzLngtMTQ4O1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHAgPSBNYXRoLnJhbmRmbG9hdCgwLCAxLjApO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB4ID0gTWF0aC5mbG9vcih4MSpwK3gyKigxLXApKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBweSA9IE1hdGguZmxvb3IoeTEqcCt5MiooMS1wKSktMzI7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzLnBhcmVudFNjZW5lLmVmZmVjdExheWVyVXBwZXI7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXllci5lbnRlclNtb2tlTGFyZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB7eDogcHgsIHk6IHB5fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZWxvY2l0eToge3g6IDAsIHk6IHZ5K01hdGgucmFuZGludCgwLCAzKSwgZGVjYXk6IDEuMDF9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGF5OiByYW5kKDAsIDIpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAvL1dBUk5JTkdcbiAgICAgICAgdGhpcy5hZGRFdmVudChcIndhcm5pbmdcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmVudGVyV2FybmluZygpO1xuICAgICAgICB9KTtcbiAgICB9LFxufSk7XG5cbi8v44K544OG44O844K477yR5Zyw5b2i566h55CGXG5waGluYS5kZWZpbmUoXCJTdGFnZTlHcm91bmRcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwiR3JvdW5kXCIsXG5cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5zdXBlckluaXQoe1xuICAgICAgICAgICAgYXNzZXQ6IFwibWFwMVwiLFxuICAgICAgICAgICAgdHlwZTogXCJ0bXhcIixcbiAgICAgICAgICAgIGJlbHQ6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciB3ID0gdGhpcy5tYXAud2lkdGg7XG4gICAgICAgIHZhciBoID0gdGhpcy5tYXAuaGVpZ2h0O1xuLy8gICAgICAgIHRoaXMubWFwQmFzZS54ID0gLXcqMC41O1xuLy8gICAgICAgIHRoaXMubWFwQmFzZS55ID0gLWgqMC41O1xuICAgICAgICB0aGlzLm1hcEJhc2UueCA9IDA7XG4gICAgICAgIHRoaXMubWFwQmFzZS55ID0gLTIwMDAqMzIrU0NfSDtcbiAgICB9LFxufSk7XG5cbn0pKCk7XG4iLCIvKlxuICogIFN0YWdlQ29udHJvbGxlci5qc1xuICogIDIwMTQvMDgvMDZcbiAqICBAYXV0aGVyIG1pbmltbyAgXG4gKiAgVGhpcyBQcm9ncmFtIGlzIE1JVCBsaWNlbnNlLlxuICovXG4oZnVuY3Rpb24oKSB7XG5cbi8v44K544OG44O844K45Yi25b6hXG5waGluYS5kZWZpbmUoXCJTdGFnZUNvbnRyb2xsZXJcIiwge1xuICAgIHN1cGVyQ2xhc3M6IFwicGhpbmEuYXBwLk9iamVjdDJEXCIsXG5cbiAgICBwYXJlbnRTY2VuZTogbnVsbCxcbiAgICBwbGF5ZXI6IG51bGwsXG4gICAgdGltZTogMCxcblxuICAgIC8v57WM6YGO5pmC6ZaT44OI44Oq44Ks44Kk44OZ44Oz44OIXG4gICAgc2VxOiBudWxsLFxuICAgIGluZGV4OiAwLFxuXG4gICAgLy/jg57jg4Pjg5fjg4jjg6rjgqzjgqTjg5njg7Pjg4hcbiAgICBldmVudDogbnVsbCxcblxuICAgIGFsdGl0dWRlOiAxMDAsXG5cbiAgICBpbml0OiBmdW5jdGlvbihzY2VuZSwgcGxheWVyLCB0bXgsIGxheWVyKSB7XG4gICAgICAgIHRoaXMuc3VwZXJJbml0KCk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnRTY2VuZSA9IHNjZW5lO1xuICAgICAgICB0aGlzLnNlcSA9IFtdO1xuXG4gICAgICAgIHRoaXMuZXZlbnQgPSBbXTtcblxuICAgICAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcbiAgICB9LFxuXG4gICAgLy/mmYLplpPjgqTjg5njg7Pjg4jov73liqBcbiAgICBhZGQ6IGZ1bmN0aW9uKHRpbWUsIHZhbHVlLCBvcHRpb24pIHtcbiAgICAgICAgdGhpcy5pbmRleCArPSB0aW1lO1xuICAgICAgICB0aGlzLnNlcVt0aGlzLmluZGV4XSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIG9wdGlvbjogb3B0aW9uLFxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICAvL+aZgumWk+OCpOODmeODs+ODiOWPluW+l1xuICAgIGdldDogZnVuY3Rpb24odGltZSkge1xuICAgICAgICB2YXIgZGF0YSA9IHRoaXMuc2VxW3RpbWVdO1xuICAgICAgICBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbDtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfSxcblxuICAgIC8v44Oe44OD44OX44Kk44OZ44Oz44OI6L+95YqgXG4gICAgYWRkRXZlbnQ6IGZ1bmN0aW9uKGlkLCB2YWx1ZSwgb3B0aW9uKSB7XG4gICAgICAgIHRoaXMuZXZlbnRbaWRdID0ge1xuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgb3B0aW9uOiBvcHRpb24sXG4gICAgICAgICAgICBleGVjdXRlZDogZmFsc2UsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIC8v44Oe44OD44OX44Kk44OZ44Oz44OI5Y+W5b6XXG4gICAgZ2V0RXZlbnQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5ldmVudFtpZF07XG4gICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHJldHVybiBudWxsO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9LFxuXG4gICAgLy/mrKHjgavjgqTjg5njg7Pjg4jjgYznmbrnlJ/jgZnjgovmmYLplpPjgpLlj5blvpdcbiAgICBnZXROZXh0RXZlbnRUaW1lOiBmdW5jdGlvbih0aW1lKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5zZXFbdGltZV07XG4gICAgICAgIGlmIChkYXRhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZhciB0ID0gdGltZSsxO1xuICAgICAgICAgICAgdmFyIHJ0ID0gLTE7XG4gICAgICAgICAgICB0aGlzLnNlcS5zb21lKGZ1bmN0aW9uKHZhbCwgaW5kZXgpe1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA+IHQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnQgPSBpbmRleDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSx0aGlzLnNlcSk7XG4gICAgICAgICAgICByZXR1cm4gcnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGltZTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2VxID0gW107XG4gICAgICAgIHRoaXMuaW5kZXggPSAwO1xuICAgIH0sXG59KTtcblxufSkoKTtcbiJdfQ==
