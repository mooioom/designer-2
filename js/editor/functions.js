Editor.Functions = function( _e ){

    this.eachObjects = function(fn){
        return _e.stage.canvas.eachObjects(fn)
    }

    this.getObjects = function() {

        var objects = [];

        _e.stage.canvas.eachObjects(function(o){
            if( o.$guide ) return;
            objects.push(o)
        });

        return objects;
    }

    // maybe better in canvas
    this.align = function( toStage, horizontal, vertical ){
        _e.selecteds.forEach(function(o){
            o.alignTo( toStage ? _e.stage.canvas : _e.selecteds[0], horizontal, vertical );
        });
        _e.events.emit('change');
    }

    this.group = function(){
        var g = _e.layer.Group({name:'new group'});
        g.elements = _e.selecteds.reverse();
        _e.fn.select(g);
        _e.events.emit('change');
    }

    this.selectAll = function() {
        _e.selecteds = this.getObjects();
        _e.events.emit('change');
    }

    this.select = function( element ) {
        _e.selecteds = Array.isArray(element) ? element : [element];
        _e.events.emit('change');
    }

    this.selectAll = function(){
        console.log(1);
    }

    this.delete = function(){
        _e.history.save();
        _e.selecteds.forEach(function(e){e.remove()});
        _e.selecteds = [];
        _e.events.emit('change');
    }

    this.clone = function(){
        _e.selecteds = _e.selecteds.map(function(o){ return o.clone() }); // todo
        _e.events.emit('change');
    }

    this.move = function( ox, oy ){
        _e.history.save();
        _e.selecteds.forEach(function(e){e.move(ox,oy)});
        _e.events.emit('change');
    }

}