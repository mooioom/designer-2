window.FontLoader = function( settings ){

    var settings = settings || {};

    this.settings = settings;

    this.fonts = [];

    this.loaded = [];

    this.$style   = null;
    this.$virtual = null;

    this.setName = function( font ){
        font.name = font.file.replace('.ttf','');
    }

    this.random = function(){
        var font = this.fonts[Math.floor(Math.random()*this.fonts.length)];
        if(!font.name) this.setName(font);
        return font;
    }

    this.prepare = function( fonts, onready ){

        fonts.forEach(function( font ){

            this.$virtual.style.fontFamily = font.name;
            this.$virtual.innerHTML = '1';

        }.bind(this));

        if(onready) setTimeout( onready, 100 );

    }

    this.load = function( fonts, onload ){

        var loaded = [];

        fonts.forEach(function( font ){

            if(!font.name) this.setName(font);

            var s = '@font-face { font-family : "' + font.name + '"; src: url("fonts/' + font.file + '") format("truetype"); }';

            this.$style.innerHTML += s;

        }.bind(this));

        setTimeout(function(){

            this.prepare( fonts, onload );

        }.bind(this), 10 );

    }

    this.init = function(){

        this.$style = document.createElement('style');
        document.head.appendChild(this.$style);

        this.$virtual = document.createElement('span');
        this.$virtual.style.position = 'absolute';
        this.$virtual.style.left = -10000;
        this.$virtual.style.top  = -10000;

        document.body.appendChild(this.$virtual);

        call('json/fonts.json',function( fonts ){

            this.fonts = fonts;

            if( this.settings.oninit ) this.settings.oninit(this);
    
        }.bind(this),null,true,true);

    }

    this.init();

}