window.TableBuilder = function( s ){

    var DEFAULTS = {
        width : '100%',
        height : '100%',
        cols : 2,
        rows : 2,
        borderWidth : '1px',
        borderType  : 'dashed',
        borderColor : 'grey',
        borderCollapse : 'collapse',
        tableLayout : 'fixed',
        borderSpacing : 0,
        initHTML : '',
        padding : 0,
        align : 'center',
        valign : 'middle',
    };

    this.settings = Defaults(DEFAULTS,s);

    var s = this.settings;

    this.$table = null;

    this.class = 'table1';

    this.cols = s.cols;
    this.rows = s.rows;

    this.height = s.height;
    this.width  = s.width;

    this.borderWidth = s.borderWidth
    this.borderType  = s.borderType 
    this.borderColor = s.borderColor

    this.borderCollapse = s.borderCollapse
    this.tableLayout = s.tableLayout
    this.borderSpacing = s.borderSpacing

    this.initHTML = s.initHTML
    this.padding  = s.padding

    this.align  = s.align
    this.valign = s.valign


    this.$element = DOM('.table-builder',{
        '/.table-builder-top' : { name : 'top' },
        '/.table-builder-selected' : { name : 'selected' },
        '/.table-builder-stage' : {
            name : 'stage'
        },
        '/.table-builder-buttons' : { name : 'buttons' },
    });

    var input = function(title,prop,type){

        var change = function(e){
            this[prop] = e.target.value;
            this.generate();
        }.bind(this);

        var $input = DOM('.table-builder-input',{
            '/.table-builder-input-title' : {
                innerHTML : title
            },
            '/input' : {
                name : 'input',
                value : this[prop],
                onkeyup : change,
                onchange : change
            }
        })

        if(type) $input.$input.type = type;

        return $input;

    }.bind(this)

    this.$element.$top.appendChild( input('Class','class') );
    this.$element.$top.appendChild( input('Cols','cols','number') );
    this.$element.$top.appendChild( input('Rows','rows','number') );
    this.$element.$top.appendChild( input('Width','width') );
    this.$element.$top.appendChild( input('Height','height') );
    this.$element.$top.appendChild( input('Border Width','borderWidth') );
    this.$element.$top.appendChild( input('Border Type','borderType') );
    this.$element.$top.appendChild( input('Border Color','borderColor'));
    this.$element.$top.appendChild( input('Initial HTML','initHTML'));
    this.$element.$top.appendChild( input('Padding','padding'));
    this.$element.$top.appendChild( input('Align','align'));
    this.$element.$top.appendChild( input('Vertical Align','valign'));
    this.$element.$top.appendChild( input('Table Layout','tableLayout'));

    this.$element.$buttons.appendChild(DOM('.table-builder-button',{
        innerHTML : 'Generate',
        onclick : function(){
            this.generate();
        }.bind(this)
    }));

    this.refresh = function(){

        this.$element.$selected.innerHTML = '';

        var $selected = DOM('table',{
            '/tr' : {
                '/td.table-builder-selected-part.part-tr' : {
                    '/div.selected-part-title' : {
                        innerHTML : 'TR'
                    },
                    '/.selected-part-options' : { name : 'selectedTR'}
                },
                '/td.table-builder-selected-part.part-td' : {
                    '/div.selected-part-title' : {
                        innerHTML : 'TD'
                    },
                    '/.selected-part-options' : { name : 'selectedTD'}
                }
            }
        });

        this.$element.$selected.appendChild($selected);

        var input = function( type, title, prop, isAttribute ){

            var value = this['$'+type].style[prop];

            if(isAttribute) value = this['$'+type].getAttribute(prop);

            return DOM('.table-builder-input',{
                '/.table-builder-input-title' : {
                    innerHTML : title
                },
                '/input' : {
                    value : value,
                    onkeyup : function(e){
                        if(isAttribute){
                            this['$'+type].setAttribute(prop,e.target.value);
                        }
                        else this['$'+type].style[prop] = e.target.value;
                    }.bind(this)
                }
            })

        }.bind(this);


        if(this.$tr) {
            
            this.$tr.classList.add('table-builder-selected-row');

            $selected.$selectedTR.appendChild( input('tr', 'Background', 'backgroundColor') );
            $selected.$selectedTR.appendChild( input('tr', 'Height', 'height') );

        }

        if(this.$td) {
            
            this.$td.classList.add('table-builder-selected-cell');

            $selected.$selectedTD.appendChild( input('td', 'Col Span', 'colspan', true) );
            $selected.$selectedTD.appendChild( input('td', 'Row Span', 'rowspan', true) );
            $selected.$selectedTD.appendChild( input('td', 'Background', 'backgroundColor') );
            $selected.$selectedTD.appendChild( input('td', 'Vertical Align', 'verticalAlign') );
            $selected.$selectedTD.appendChild( DOM('button',{
                innerHTML : 'Remove',
                onclick : function(){
                    this.$td.remove();
                }.bind(this)
            }) );

        }

    }

    this.generate = function(){

        this.$element.$stage.innerHTML = '';
        this.$table = DOM('table.'+this.class);

        for(var i=0;i<this.rows;i++){
            var $tr = DOM('tr');
            for(var ii=0;ii<this.cols;ii++){
                var $td = DOM('td',{
                    innerHTML : this.initHTML,
                    style : { 
                        border : this.borderWidth + ' ' + this.borderType + ' ' + this.borderColor ,
                        padding : this.padding + 'px',
                        textAlign : this.align,
                        verticalAlign : this.valign
                    },
                    onclick : function(e){
                        if(this.$tr) this.$tr.classList.remove('table-builder-selected-row');
                        if(this.$td) this.$td.classList.remove('table-builder-selected-cell');
                        this.$td = e.target;
                        this.$tr = e.target.parentElement;
                        this.refresh();
                    }.bind(this)
                });
                $tr.appendChild($td);
            }
            this.$table.appendChild($tr);
        }

        this.$table.style.width = this.width;
        this.$table.style.height = this.height;
        this.$table.style.borderCollapse = this.borderCollapse;
        this.$table.style.borderSpacing = this.borderSpacing;
        this.$table.style.tableLayout = this.tableLayout;

        this.$td = this.$table.querySelector('td');
        this.$tr = this.$table.querySelector('tr');

        this.refresh();

        this.$element.$stage.appendChild(this.$table);

    }.bind(this);

    this.generate();

    this.getTable = function(){

        var c = this.$table.cloneNode(true);
        var r = c.querySelector('.table-builder-selected-row');
        r && r.classList.remove('table-builder-selected-row');
        var r = c.querySelector('.table-builder-selected-cell');
        r && r.classList.remove('table-builder-selected-cell');
        return c;

    }

}