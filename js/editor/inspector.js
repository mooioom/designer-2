Editor.Inspector = function( _e, $element ){

    this.$element = $element;

    var $box = function(){

        var $table = DOM('table.inspector-box',{
            '/tr' : {
                '/td' : {
                    name : 'box'
                }
            }
        });

        this.$element.appendChild( $table );

        var getTitle = function( title ){

            return DOM('.inspector-title',{
                innerHTML : title
            });

        }

        $table.$box._title = function( title ){

            var $title = getTitle(title);

            this.appendChild($title);

        }

        $table.$box.input = function( prop, title, text ){

            var $title = getTitle(title);

            var c = text ? 'inspector-input inspector-input-text' : 'inspector-input';

            var $input = DOM('input',{
                value : _e.selecteds[0][prop],
                className : c,
                number : !text,
                onkeyup : function(){
                    _e.selecteds[0][prop] = !this.number ? this.value : Number(this.value);
                    _e.render();
                    _e.layers.render();
                }
            });

            this.appendChild($title);
            this.appendChild($input);

        }

        $table.$box.boolean = function( prop, title ){

            var $title = getTitle(title);

            var c = 'inspector-input inspector-input-boolean';

            var $input = DOM('input',{
                type : 'checkbox',
                checked : _e.selecteds[0][prop],
                className : c,
                onchange : function(){
                    _e.selecteds[0][prop] = this.checked;
                    _e.render();
                    _e.layers.render();
                }
            });

            this.appendChild($title);
            this.appendChild($input);

        }

        $table.$box.color = function( prop, title, text ){

            var $title = getTitle(title);

            var $input = DOM('input.inspector-color',{
                type : 'color',
                value : Canvas.Utils.getHexColor( _e.selecteds[0][prop] ),
                onclick : function(e){
                    e.preventDefault();
                    Popup.colorpicker(function(rgba,hex,rgbaString){
                        e.target.value = hex;
                        _e.selecteds[0][prop] = rgbaString;
                        _e.render();
                    },title)
                },
                onchange : function(){
                    _e.selecteds[0][prop] = this.value;
                    _e.render();
                    _e.layers.render();
                }
            });

            this.appendChild($title);
            this.appendChild($input);

        }

        $table.$box.fonts = function(){

            var addFont = function( font )
            {
                if(!_e.$style){
                    _e.$style = document.createElement('style');
                    document.head.appendChild(_e.$style);    
                }
                var s = '@font-face {font-family: "'+font.name+'";src:  url("fonts/'+font.file+'") format("truetype");}';
                _e.selecteds[0].style = s;
                _e.$style.innerHTML += s;
                
            }

            var set = function(){

                var font = this.selectedOptions[0].font;
                addFont(font);
                setTimeout(function(){
                    _e.selecteds[0].font = font.name;
                    _e.stage.render();
                },250);
            }

            var $title = getTitle('Font');

            var $input = DOM('select.inspector-fonts',{
                value : '',
                onchange : set,
                onkeyup  : set
            });

            for(var i=0;i<_e.fonts.length;i++){
                var font = _e.fonts[i];
                var name = font.file.replace('.ttf',''); // parse
                font.name = name;
                var $option = DOM('option',{
                    innerHTML : name,
                    font : font
                });
                $input.appendChild($option);
            }

            this.appendChild($title);
            this.appendChild($input);

        }

        $table.$box.button = function( title, onclick ){

            var $button = DOM('.inspector-button',{
                innerHTML : title,
                onclick : function(){
                    onclick&&onclick();
                    _e.render();
                    _e.layers.render();
                }
            });

            this.appendChild($button);

        }

        return $table.$box;

    }.bind(this);

    this.$box = $box;

    this.title = function( title ){

        var $title = $box();

        $title.innerHTML = title;

    }

    this.render = function( tool ){

        this.$element.innerHTML = '';

        if(!_e.selecteds.length){

            if( _e.tool.inspector ) {
                _e.tool.inspector( _e, this );
            }

        }else if(_e.selecteds.length > 1){

            this.title('Multiple Elements Selected');

            var d = $box();

            d._title('Align To Stage');

            d.button('H',function(){_e.fn.align(1,1,0);});
            d.button('V',function(){_e.fn.align(1,0,1);});
            d.button('M',function(){_e.fn.align(1,1,1);});

            d._title('Align To Selection');

            d.button('H',function(){_e.fn.align(0,1,0);});
            d.button('V',function(){_e.fn.align(0,0,1);});
            d.button('M',function(){_e.fn.align(0,1,1);});

            d._title('Functions');

            d.button('Group',function(){
                _e.fn.group();
            });

        }else if(_e.selecteds.length == 1){

            var s = _e.selecteds[0];

            this.title(s._type);

            var d = $box();
            d.input('name','Name', true);

            switch (s._type) {

                case 'Text':

                    var d = $box();

                    d.input('x','X');
                    d.input('y','Y');

                    d.input('text','Text', true);

                    d.fonts();

                    d.input('size','Size');
                    d.boolean('bold','B');
                    d.boolean('italic','I');
                    d.boolean('strokeText','Stroke');
                    
                    break;

                case 'Line':

                    var d = $box();

                    d.input('x1','X1');
                    d.input('y1','Y1');
                    
                    d.input('x2','X2');
                    d.input('y2','Y2');
                    
                    break;

                case 'Circle':

                    var d = $box();

                    d.input('cx','X');
                    d.input('cy','Y');
                    d.input('r','R');
                    
                    break;
        
                case 'Box':

                    var d = $box();

                    d.input('x','X');
                    d.input('y','Y');
                    
                    d.input('w','W');
                    d.input('h','H');

                    var d = $box();

                    d._title('Radius');

                    d.input('tl','TL');
                    d.input('bl','BL');
                    d.input('tr','TR');
                    d.input('br','BR');
                    
                    break;
            
                default:

                    break;
            }

            var d = $box();
            d.input('rotation','°');

            var d = $box();
            d.color('fill','f');
            d.input('lineWidth','|');
            d.color('stroke','|');

            var d = $box();
            d.boolean('shadow','Shadow');
            d.input('shadowBlur','Blur');
            d.color('shadowColor','Color');
            d.input('shadowOffsetX','X');
            d.input('shadowOffsetY','Y');

            d.button('H',function(){_e.fn.align(1,1,0);});
            d.button('V',function(){_e.fn.align(1,0,1);});
            d.button('M',function(){_e.fn.align(1,1,1);});

        }
        
        
    }.bind(this);

    _e.events.on('toolchange',this.render);
    _e.events.on('mouseup',this.render);
    _e.events.on('change',this.render);

}