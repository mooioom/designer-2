Editor.Tools.text = {

    name: 'text',

    icon: 'font',

    mousedown: function(e) {

        var text = _e.layer.Text({
            type: 'text',
            x: e.canvasX,
            y: e.canvasY,
            text: 'Hello'
        });

        _e.selecteds = [text];
        _e.render();

    }

}