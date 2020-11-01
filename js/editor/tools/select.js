Editor.Tools.select = {

    name: 'select',

    icon: 'direction',

    mousedown: function(e) {

        var selectbox = _e.stage.selectbox;

        var x = e.canvasX;
        var y = e.canvasY;

        var $f = false;

        _e.eachObjects(function(o) {
            if( o.$guide ) return true;
            if (o.isPointInBounds(e._x, e._y)){
                if( _e.keyboard.ctrl ){
                    if( _e.selecteds.indexOf(o) == -1 ) _e.selecteds.push(o);
                    else _e.selecteds.splice( _e.selecteds.indexOf(o), 1 );
                }
                else _e.selecteds = [o];
                $f = true;
                return true;
            }
        });

        if (!$f) _e.selecteds = [];

        this.drag = true;

        this.sx = e.offsetX;
        this.sy = e.offsetY;

        selectbox.hidden = false;

        selectbox.x = this.sx;
        selectbox.y = this.sy;

        selectbox.w = 0;
        selectbox.h = 0;

    },

    mousemove: function(e){

        if (!this.drag) return;

        if( this.sx == e.offsetX && this.sy == e.offsetY ) return;

        var selectbox = _e.stage.selectbox;

        _e.selecteds = [];

        _e.eachObjects(function(o) {

            if( o.$guide ) return;

            var r1 = o.getBounds();

            r1.x1 = r1.x1 + _e.stage.offsetX;
            r1.x2 = r1.x2 + _e.stage.offsetX;
            r1.y1 = r1.y1 + _e.stage.offsetY;
            r1.y2 = r1.y2 + _e.stage.offsetY;

            var r2 = selectbox.getBounds();

            if (r2.w < 0) {
                r2.x1 = r2.x1 + r2.w;
                r2.x2 = r2.x2 - r2.w;
            }
            if (r2.h < 0) {
                r2.y1 = r2.y1 + r2.h;
                r2.y2 = r2.y2 - r2.h;
            }

            if ( Canvas.Utils.rectanglesIntersect(r1, r2) && _e.selecteds.indexOf(o) == -1 ){
                _e.selecteds.push(o);
            }

        });


        var x = e.offsetX - this.sx;
        var y = e.offsetY - this.sy;

        selectbox.w = x;
        selectbox.h = y;

        _e.render();
    },

    mouseup: function( e ) {
        _e.stage.selectbox.hidden = true;
        delete this.drag;
    },

    inspector : function( _e, inspector ){

        inspector.title('Select');

    }

}