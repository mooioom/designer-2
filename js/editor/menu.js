Editor.Menu = function( _e, $element ){

    this.$element = $element;

    this.getItems = function(){

        return [
            {
                title : 'File',
                items : [
                    {
                        title : 'Load',
                        onclick : function(){
                            console.log(1);
                        }
                    },
                    {
                        title : 'Test SVG',
                        onclick : function(){
                            var svg = _e.stage.canvas.toSVG();
                            var win = open('','test');
                            win.document.write(svg);
                        }
                    }
                ]
            },
            {
                title : 'Stage',
                items : [
                    {
                        title : 'Toggle Grid Snap',
                        onclick : function(){
                            _e.stage.settings.snap = !_e.stage.settings.snap;
                        }
                    }
                ]
            },
            {
                title : 'Edit',
                items : [
                    {
                        title : 'Align',
                        items : [
                            { title : 'Stage - Horizontal', onclick : function(){ _e.fn.align(1,1,0);}},
                            { title : 'Stage - Vertical', onclick : function(){ _e.fn.align(1,0,1);}},
                            { title : 'Stage - Middle', onclick : function(){ _e.fn.align(1,1,1);}},
                            { title : 'Selection - Horizontal', onclick : function(){ _e.fn.align(0,1,0);}},
                            { title : 'Selection - Vertical', onclick : function(){ _e.fn.align(0,0,1);}},
                            { title : 'Selection - Middle', onclick : function(){ _e.fn.align(0,1,1);}}
                        ]
                    },
                    {
                        title : 'Stick',
                        items : [
                            {
                                title : 'Left',
                                onclick : function(){
                                    _e.selecteds[1].stick( _e.selecteds[0], 'left' );
                                    _e.events.emit('change');
                                },        
                            },
                            {
                                title : 'Right',
                                onclick : function(){
                                    _e.selecteds[1].stick( _e.selecteds[0], 'right' );
                                    _e.events.emit('change');
                                },        
                            },
                            {
                                title : 'Top',
                                onclick : function(){
                                    _e.selecteds[1].stick( _e.selecteds[0], 'top' );
                                    _e.events.emit('change');
                                },        
                            },
                            {
                                title : 'Bottom',
                                onclick : function(){
                                    _e.selecteds[1].stick( _e.selecteds[0], 'bottom', 10, true );
                                    _e.events.emit('change');
                                },        
                            },
                        ]
                    },
                    {
                        title : 'Resize',
                        items : [
                            { title : '+10%', onclick : function(){ _e.selecteds.forEach(function(o){o.resize(10);}); _e.events.emit('change'); }},
                            { title : '-10%', onclick : function(){ _e.selecteds.forEach(function(o){o.resize(-10);}); _e.events.emit('change'); }},
                            { title : '100%', onclick : function(){ _e.selecteds.forEach(function(o){o.resize(100);}); _e.events.emit('change'); }},
                            { title : '-50%', onclick : function(){ _e.selecteds.forEach(function(o){o.resize(-50);}); _e.events.emit('change'); }},
                            { title : 'Match Selection Width', onclick : function(){ 
                                _e.selecteds.forEach(function(o){
                                    if(o == _e.selecteds[0]) return;
                                    o.resizeTo(_e.selecteds[0]);
                                }); 
                                _e.events.emit('change'); 
                            }},
                            { title : 'Match Selection Height', onclick : function(){ 
                                _e.selecteds.forEach(function(o){
                                    if(o == _e.selecteds[0]) return;
                                    o.resizeTo(_e.selecteds[0],true,20);
                                }); 
                                _e.events.emit('change'); 
                            }}
                        ]
                    },
                    {
                        title : 'Group Selection',
                        onclick : function(){
                            var g = _e.layer.Group({name:'new group'});
                            g.elements = _e.selecteds;
                            _e.fn.select(g);
                            _e.events.emit('change');
                        }
                    }
                ]
            }
        ]
    }

    this.render = function(){

        this.$element.innerHTML = '';

        this.menu = new Menu({
            $element : this.$element,
            items : this.getItems()
        });

    }.bind(this);

    this.render();

    //_e.events.on('change',this.render);

}