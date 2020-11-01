Editor.Tools.line = {

    name: 'line',

    icon: 'line',

    mousedown: function(e) {
        this.drag = true;
        this.sx = e.offsetX;
        this.sy = e.offsetY;
        this.line = _e.layer.Line({
            x1: e.canvasX,
            y1: e.canvasY,
            x2: e.canvasX,
            y2: e.canvasY
        });
        _e.selecteds = [this.line];
    },
    
    mousemove: function(e) {
        if (!this.drag) return;
        this.line.x2 = e.canvasX;
        this.line.y2 = e.canvasY;
        _e.render();
    },

    mouseup: function(e) {
        delete this.drag;
    }

}