Editor.Tools.box = {

    name: 'rectangle',

    icon: 'check-empty',

    mousedown: function(e) {
        this.drag = true;
        this.sx = e.canvasX;
        this.sy = e.canvasY;
        this.box = _e.layer.Box({
            x: e.canvasX,
            y: e.canvasY,
            fill : '#333',
        });
        _e.selecteds = [this.box];
    },

    mousemove: function(e) {
        if (!this.drag) return;
        var x = e.canvasX - this.sx;
        var y = e.canvasY - this.sy;
        this.box.w = x;
        this.box.h = y;
        _e.render();
    },

    mouseup: function(e) {
        delete this.drag;
    }

}