window.Form = function( s ){

    var _f = this;

    var DEFAULTS = {

        data : {},

        inputs : {},

        element : document.createElement('div'),

        titles : true,

        zoom : 1,

        columns : null

        //onchange : function( data ){ console.log(data); }

    }

    var s = s || {};

    var settings = {};

    for(var x in s) if( typeof DEFAULTS[x] == 'undefined' ) DEFAULTS[x] = s[x];

    for(var x in DEFAULTS) settings[x] = typeof s[x] == 'undefined' ? DEFAULTS[x] : s[x];

    this.settings = settings;

    this.data = this.settings.data;

    this.$element = settings.element;
    this.$element.classList.add('form');

    this.$element.style.zoom = this.settings.zoom;

    var $el = function(a,b,c,d){
        var $el = document.createElement(a);
        if(b) $el.className = b;
        return $el;
    }

    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

    this.inputs = {};

    // type / format
    // date            "yyyy-MM-dd"
    // datetime-local  "2019-03-14T11:00"

    function rgb2hex(rgb){
        return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[0],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) : rgb;
    }

    var getColor = function(color){
        var c = $el('canvas');
        var t = c.getContext('2d');
        c.width=1;c.height=1;
        t.fillStyle=color;
        t.fillRect(0, 0, 1, 1);
        var d = t.getImageData(0, 0, 1, 1).data;
        return rgb2hex(d);
    }

    var inputElement = function( input ){

        var $input = $el('input');
        $input.type = input.type;

        $input.disabled = input.settings.disabled;

        if(input.settings.placeholder) $input.placeholder = input.settings.placeholder;

        var changeEvent = 'keyup';

        if( input.type == 'select' ){

            var select = true;

            var $input = $el('select');
            changeEvent = 'change';

            if( input.settings.multiple ){
                $input.multiple = input.settings.multiple;
                $input.size = input.settings.options.length;
            }

            for(var i=0;i<input.settings.options.length;i++){

                var o = input.settings.options[i];
                var $option = $el('option');
                $option.innerHTML = o.title;
                $option.value = o.value;
                $input.appendChild($option);

            }

        }

        if(input.type == 'checkbox') changeEvent = 'click';

        if(
            input.type == 'date' ||
            input.type == 'time' ||
            input.type == 'datetime-local' ||
            input.type == 'color'
        ) changeEvent = 'change';

        $input.getValue = function(){

            if(this.type == 'checkbox') return this.checked;

            if(select && input.settings.multiple) 
                return [].map.call(this.selectedOptions,  function(elm){ return elm.value } );

            return this.value;

        }

        $input.setValue = function( value ){
            this.value = value;
            if(this.type == 'color') return this.value = getColor(value);
            if(this.type == 'checkbox') return this.checked = value;
            if(select && input.settings.multiple && typeof value == 'object' ){
                value.forEach(function(v){
                    for(var i=0;i<this.options.length;i++){
                        var o = this.options[i];
                        if( o.value == v ) o.selected = true;
                    }
                }.bind(this));
            }
        }

        $input.addEventListener(changeEvent,function(){
            _f.onchange();
        })

        return $input;

    }

    var Input = function( property, settings ){

        var s = settings || {};

        if( typeof settings == 'text' ) s.type = settings;

        this.settings = s;

        this.property = property;
        this.title    = s.title || property;

        this.visibility = s.visibility;
        this.validation = s.validation;

        if(s.required) this.validation = function(v){ 
            if(!v || typeof v == 'undefined') return 'This is Required'; 
        }

        var value = _f.data[property];

        this.type = s.type || 'text';

        this.$element = $el('tr');

        this.$title = $el('td','form-input-title');
        this.$value = $el('td','form-input-value');

        this.$title.innerHTML = this.title;
        if( _f.settings.titles ) this.$element.appendChild(this.$title);

        if(s.description){
            this.$description = $el('div','form-input-description');
            this.$description.innerHTML = s.description;
            this.$value.appendChild(this.$description);
        }

        this.$input = inputElement(this);
        this.$value.appendChild(this.$input);

        this.$element.appendChild(this.$value);

        this.getValue = function(){
            return this.$input.getValue();
        }

        this.setValue = function( value ){
            this.$input.setValue( value );
        }

        this.setValue( value );

        if(this.validation){
            this.$validationHolder = $el('div','form-input-validation-holder');
            this.$validation = $el('div','form-input-validation');
            this.$validationHolder.appendChild(this.$validation);
            this.$value.appendChild(this.$validationHolder);
        }

    }

    var eachInputs = function( callback ){
        for(var p in this.inputs) callback( this.inputs[p], p );
    }.bind(this);

    this.getData = function( preventValidation ){

        var data = {};

        eachInputs(function(i,p){
            data[p] = i.getValue();
        });

        if( !preventValidation ) this.validate(data);

        return data;

    }

    this.validate = function( data ){

        var validation = {};
        var isValid = true;

        data = data || this.data;

        eachInputs(function(i,p){

            if( i.visibility ){

                var f = true;

                if( typeof i.visibility == 'function' ){

                    f = i.visibility(data);

                }else{

                    for(var x in i.visibility){
                        if( typeof i.visibility[x] == 'function' ) f = i.visibility[x]( data[x], data );
                        else if( data[x] != i.visibility[x] ) f = false;
                    }

                }

                i.$element.classList[ f ? 'remove' : 'add' ]('form-hidden');

                if(!f) delete data[p];

            } 

            if( i.validation ){
                i.$validationHolder.hidden = true;
                v = i.validation(data[p],data);
                i.$validationHolder.hidden = (v === undefined);
                if( v !== undefined ) {
                    i.$validation.innerHTML = v;
                    validation[p] = v;
                    isValid = false;
                }
            }

        });

        return !isValid ? validation : undefined;

    }

    this.onchange = function(){

        var data = this.getData(true);

        var validation = this.validate(data);

        if( this.settings.onchange ) this.settings.onchange( data, validation );

    }

    // init

    for( var p in this.settings.inputs ){
        var input = new Input( p, this.settings.inputs[p] );
        this.inputs[p] = input;
    }

    var $table = function(){

        var $table = $el('table','form-table');
        var $form  = $el('tbody');

        $table.appendChild($form);

        $table.$form = $form;

        return $table;

    }.bind(this);

    if( !this.settings.columns ){

        this.$table = $table();
        for(var x in this.inputs) this.$table.$form.appendChild( this.inputs[x].$element );

        this.$element.appendChild(this.$table);

    }else{

        this.$columns = {};

        for(var x in this.settings.columns ){

            var column = this.settings.columns[x];

            this.$columns[x] = $table();

            for(var i in this.inputs) {
                if( column.properties.indexOf(i) != -1 )
                    this.$columns[x].$form.appendChild( this.inputs[i].$element );
            }

            this.$element.appendChild(this.$columns[x]);

        }

    }

    this.validate();

}