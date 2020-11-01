Editor.Utils = function( _e ){

    this.grid = function( grid, size, width, color) {

        grid.empty();

        var color = color || '#ccc';

        var w = width / 2;

        var elements = [];

        for (var i = 0; i <= width; i += size) {

            var lineX = grid.Line({
                x1     : i,
                y1     : 0,
                x2     : i,
                y2     : width,
                stroke : color,
                $guide : true
            });

            var lineY = grid.Line({
                x1     : 0,
                y1     : i,
                x2     : width,
                y2     : i,
                stroke : color,
                $guide : true
            });

        }

    }

}