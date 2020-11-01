Editor.Layers = function( _e, $element ){

    this.$element = $element;
    this.$body = this.$element.querySelector('.layers');

    this.get = function(){
        var layers = [];
        _e.layer.iterate(function(l){ layers.push(l); },true,true);
        layers.reverse();
        return layers;
    }

    this.render = function(){

        if(!_e.layer) return;

        var layers = this.get();

        this.$body.innerHTML = '';

        for(var i=0;i<layers.length;i++){

            var layer = layers[i];
            var $layer = _e.templates.layer();

            $layer.$title.innerHTML = layer.title || layer.name;

            this.$body.appendChild($layer);

            $layer.style.display = 'table';

            if( _e.selecteds.indexOf(layer) != -1 ) $layer.classList.add('layer-selected');

            $layer.onmousedown = function(o){
                if( _e.keyboard.ctrl ){
                    if( _e.selecteds.indexOf(o) == -1 ) _e.selecteds.push(o);
                    else _e.selecteds.splice( _e.selecteds.indexOf(o), 1 );
                }
                else _e.selecteds = [o];
                _e.render();
                this.render();
                _e.events.emit('change');
            }.bind(this,layer);

        }

    }.bind(this);

    _e.events.on('mouseup',this.render);
    //_e.events.on('mousemove',this.render);
    _e.events.on('init',this.render);
    _e.events.on('add',this.render);
    _e.events.on('remove',this.render);
    _e.events.on('groupempty',this.render);
    _e.events.on('change',this.render);

}