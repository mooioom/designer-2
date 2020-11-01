Editor.Events = function( _e ){

    var _event = function( e ) {

        var c = _e.stage.canvas.$canvas.getBoundingClientRect();

        var x = e.clientX - c.left;
        var y = e.clientY - c.top;

        e.canvasX = (_e.keyboard.shift || !_e.stage.settings.snap ) ? x : Math.round( x / _e.stage.grid.size ) * _e.stage.grid.size;
        e.canvasY = (_e.keyboard.shift || !_e.stage.settings.snap ) ? y : Math.round( y / _e.stage.grid.size ) * _e.stage.grid.size;

        e._x = x;
        e._y = y;

    }.bind(_e);

    var events = ['mousedown', 'mousemove', 'mouseup'];

    events.forEach(function(ev) {
        _e.$stage['on' + ev] = function(ev, e) {
            _event(e);
            if (_e.tool && _e.tool[ev]) _e.tool[ev].call(_e.tool, e);
            _e.render();
            _e.events.emit(ev);
        }.bind(_e, ev);
    }.bind(_e));
    

}