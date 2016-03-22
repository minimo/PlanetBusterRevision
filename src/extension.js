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
    var len = len = tempChildren.length;
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

//テクスチャのクローン
phina.asset.Texture.prototype.clone = function () {
    var image = this.domElement;
    var canvas = phina.graphics.Canvas().setSize(image.width, image.height);
    var t = phina.asset.Texture();
    canvas.context.drawImage(image, 0, 0);
    t.domElement = canvas.domElement;
    return t;
}

//テクスチャにフィルタを適用
phina.asset.Texture.prototype.filter = function (filters) {
    if (!filters) return this;

    if (!Array.isArray(filters)) filters = [filters];

    var image = this.domElement;
    var w = image.width;
    var h = image.height;
    var canvas = phina.graphics.Canvas().setSize(w, h);
    var imageData = null;

    canvas.context.drawImage(image, 0, 0);
    imageData = canvas.context.getImageData(0, 0, w, h);
    filters.forEach(function (fn) {
        if (typeof fn == 'function') {
            h.times(function (y) {
                w.times(function (x) {
                    var i = (y * w + x) * 4;
                    var pixel = imageData.data.slice(i, i + 4);
                    fn(pixel, i, x, y, imageData);
                });
            });
        }
    });
    canvas.context.putImageData(imageData, 0, 0);
    this.domElement = canvas.domElement;
    return this;
}
