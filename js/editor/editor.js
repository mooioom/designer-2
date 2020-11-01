window.Editor = function( s ){

    for(var x in s) this[x] = s[x];

    this.stage   = null;
    this.overlay = null;
    
    this.tool = null;

    this.selecteds = [];

    this.webfonts = [];

    this.keyboard  = new Keyboard;
    this.events    = new Events;
    this.history   = new History;
    this.templates = new Templates;

    this.tools     = new Editor.Tools( this, this.$tools );
    this.menu      = new Editor.Menu( this, this.$menu );
    this.fn        = new Editor.Functions( this );
    this.utils     = new Editor.Utils( this );
    this.inspector = new Editor.Inspector( this, this.$inspector );
    this.layers    = new Editor.Layers( this, this.$layers );
    this.colors    = new Editor.Colors( this, this.$colors );
    this.bottom    = new Editor.Bottom( this, this.$bottom );

    this.stage = new Editor.Stage( this, this.$stage );

    Editor.Events(this);

    // shortcuts

    this.render      = this.stage.render;
    this.eachObjects = this.fn.eachObjects;

    this.refresh = function(){
        this.events.emit('change');
    }

    // start
    this.layer = this.stage.canvas.Group({ name : 'stage' });
    this.tools.select.select();
    this.events.emit('init');
    this.stage.setSize();
    this.render();

}