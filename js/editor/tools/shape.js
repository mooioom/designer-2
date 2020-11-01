Editor.Tools.shape = {

    name: 'shape',

    icon: 'brush',

    mousedown: function(e) {

        this.drag = true;

        this.sx = e.canvasX;
        this.sy = e.canvasY;

        this.point = {
            x: e.canvasX,
            y: e.canvasY,
            c1x: null,
            c1y: null,
            c2x: null,
            c2y: null,
        }

        if (!this.shape) {
            this.shape = _e.layer.Shape({
                fill: 'rgba(0,0,0,0.2)',
                lineWidth : 1,
                points: []
            });
        }

        this.shape.points.push(this.point);

        shape = this.shape;

        _e.selecteds = [shape];

        //console.log('down',this.shape.points);

    },

    mousemove: function(e) {

        if (!this.point) return;

        var x = e.canvasX - this.sx;
        var y = e.canvasY - this.sy;

        if (this.drag) {
            this.point.c1x = e.canvasX - 2 * x;
            this.point.c1y = e.canvasY - 2 * y;
            this.point.c2x = e.canvasX;
            this.point.c2y = e.canvasY;
            return;
        }

        _e.render();

    },

    mouseup: function(e) {

        delete this.drag;

        // point in radius
        if (this.shape && this.shape.points.length > 1 && this.shape.points[0].x == e.canvasX && this.shape.points[0].y == e.canvasY) {
            delete this.shape;
            delete this.point;
            return;
        }

        //console.log(this.shape.points);

    }
}