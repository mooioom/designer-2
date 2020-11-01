Editor.Tools.circle = {

    name: 'circle',

    icon: 'circle-thin',

    mousedown: function(e) {
        this.drag = true;
        this.sx = e.canvasX;
        this.sy = e.canvasY;
        this.circle = _e.layer.Circle({
            cx: e.canvasX,
            cy: e.canvasY
        });
        _e.selecteds = [this.circle];
    },

    mousemove: function(e) {
        if (!this.drag) return;
        var x = e.canvasX - this.sx;
        var y = e.canvasY - this.sy;
        this.circle.r = Math.abs(x);
        _e.render();
    },

    mouseup: function(e) {
        delete this.drag;
    }

}