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













