Editor.Stage = function( _e, $element ){

    this.settings = {

        color : 'orange',
        snap  : true

    }

    this.$element = $element;

    this.grid = { size : 25, color : '#efefef' };

    this.canvas = new Canvas({

        $element: this.$element,

        width  : 700,
        height : 500,

        color : '#fff', // should be layers

    });

    this.overlay = new Canvas({

        className: 'overlay',

        $element: this.$element,

        width  : this.$element.clientWidth,
        height : this.$element.clientHeight

    });

    // grid

    this.grid.canvas = this.canvas.Group({ name: 'grid', $guide : true }); // flatten the grid

    _e.utils.grid( this.grid.canvas, this.grid.size, this.canvas.width, this.grid.color );

    // overlay

    this.points    = this.overlay.Group({ name: 'control-points' });
    this.controls  = this.overlay.Group({ name: 'controls' });
    this.selection = this.overlay.Group({ name: 'selection' });

    this.selectbox = this.selection.Box({ hidden: true, stroke: '#333', lineDash: [5, 5], lineWidth : 1 });
    
    this.overlay.on('beforerender', function(a) {

        var $padding = 0;

        this.controls.empty();

        _e.selecteds.forEach(function(o) {

            var b = o.getBounds();

            //if(!b) return;

            var box = _e.stage.controls.Box({
                x           : b.x1 + _e.stage.offsetX - $padding,
                y           : b.y1 + _e.stage.offsetY - $padding,
                w           : b.w + $padding * 2,
                h           : b.h + $padding * 2,
                stroke      : this.settings.color,
                lineWidth   : 1,
                lineDash    : [2, 3]
            });

            var center = _e.stage.controls.Circle({
                cx          : b.c.x + _e.stage.offsetX,
                cy          : b.c.y + _e.stage.offsetY,
                r           : 5,
                fill        : this.settings.color
            });

        }.bind(this));

    }.bind(this));

    this.setSize = function(){

        this.canvas.bb  = this.canvas.$canvas.getBoundingClientRect();
        this.overlay.bb = this.overlay.$canvas.getBoundingClientRect();

        this.offsetX = this.canvas.bb.left - this.overlay.bb.left;
        this.offsetY = this.canvas.bb.top - this.overlay.bb.top;

    }

    this.setSize();

    this.render = function(){
        this.canvas.render();
        this.overlay.render();
    }.bind(this);

    _e.events.on('change',this.render);

    this.canvas.on('add',function( o ){ _e.events.emit('add',o); });
    this.canvas.on('remove',function( o ){ _e.events.emit('remove',o); });
    this.canvas.on('groupempty',function( o ){ _e.events.emit('groupempty',o); });

    _e.keyboard.on('Delete',function(){
        _e.fn.delete();
    });

    _e.keyboard.on('ArrowLeft',function(e){_e.fn.move( -_e.stage.grid.size, 0 );});
    _e.keyboard.on('ArrowRight',function(){_e.fn.move(_e.stage.grid.size, 0 );});
    _e.keyboard.on('ArrowUp',function(){_e.fn.move( 0, -_e.stage.grid.size );});
    _e.keyboard.on('ArrowDown',function(){_e.fn.move( 0, _e.stage.grid.size );});
    _e.keyboard.on('Control+ArrowLeft',function(e){_e.fn.move( -1, 0 );});
    _e.keyboard.on('Control+ArrowRight',function(){_e.fn.move(1, 0 );});
    _e.keyboard.on('Control+ArrowUp',function(){_e.fn.move( 0, -1 );});
    _e.keyboard.on('Control+ArrowDown',function(){_e.fn.move( 0, 1 );});

    _e.keyboard.on('Ctrl+A',function(){
        _e.fn.selectAll();
    });

    _e.keyboard.onkeyup.push(function(e){
        _e.events.emit('keyup',e);
    });

}