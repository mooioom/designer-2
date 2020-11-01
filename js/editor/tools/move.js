Editor.Tools.move = {

    name: 'move',

    icon: 'move',

    mousedown: function(e) {

        this.drag = true;

        this.sx = e.canvasX;
        this.sy = e.canvasY;

        if( _e.keyboard.alt ) {
            _e.fn.clone();
        }

        _e.selecteds.forEach(function(o) {
            o.savePosition();
        });

        _e.render();

    },

    mousemove: function(e) {

        if (!this.drag) return;

        if( this.sx == e.offsetX && this.sy == e.offsetY ) return;

        var x = e.canvasX - this.sx;
        var y = e.canvasY - this.sy;

        _e.selecteds.forEach(function(o) {
            o.setPosition(x, y);
        });

        _e.render();

    },

    mouseup: function(e) {
        delete this.drag;
    }

}