Editor.Tools = function( _e, $tools ){

    this.$tools = $tools;

    Editor.Tool = function(s){

        for (var x in s) this[x] = s[x];

        this.name = s.name;

        this.$element = document.createElement('div');
        this.$element.classList.add('tool');
        this.$element.classList.add('icon-' + s.icon);

        $tools.appendChild(this.$element);

        this.select = function() {
            _e.tools.forEach(function(t) { t.unselect(); })
            this.$element.classList.add('tool-selected');
            _e.tool = this;
            _e.render();
            _e.events.emit('toolchange',_e.tool);
        }

        this.unselect = function() {
            this.$element.classList.remove('tool-selected');
        }

        this.$element.onclick = function() {
            this.select();
        }.bind(this)

    }

    this.items = [
        Editor.Tools.select,
        Editor.Tools.move,
        Editor.Tools.text,
        Editor.Tools.line,
        Editor.Tools.box,
        Editor.Tools.circle,
        Editor.Tools.shape,
        Editor.Tools.eyedropper
    ]; 

    for (var i in this.items){
        var t = this.items[i];
        var tool = new Editor.Tool(t);
        this[t.name] = tool;
        this[i] = tool;
    }

    this.forEach = function( fn ){
        for (var i in this.items){
            var t = this.items[i];
            fn(this[t.name])
        }
    }

}