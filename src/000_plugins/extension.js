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

