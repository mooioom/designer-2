/*

Popup

var p = new Popup({

    name      : <string> - name
    class     : <string> - custom added classes

    title     : <string> - title
    body      : <string> / <DOM Element> - inner body

    closable  : false - append remove button
    draggable : false - prevents default header dragging
    onclose   : <function> - on popup remove button click

    modal : <boolean> - create a modal overlay

    width  : <number> - popup width (px)
    height : <number> - popup height (px)

    left : <number> - left position value px
    top  : <number> - top position value px

    buttons : [
        {
            name    : <string> - OPTIONAL - add an api shortcut function
            title   : <string> - button title
            onclick : <function> - button onclick
            remove  : <boolean> - auto remove popup after click
        }
    ]

    oninit : <function> - when popup inits

})

*/

var DOM = function(a,b,c){var d,e=a.match(/^[a-zA-Z0-9]+/),f=b,g=document.createElement(e?e[0]:"div");if(a.split(/(?=\.)|(?=#)|(?=\[)/).forEach(function(a){"#"==a[0]&&(g.id=a.substr(1)),"."==a[0]&&g.classList.add(a.substr(1)),"["==a[0]&&(d=a.substr(1,a.length-2).split("="),g.setAttribute(d[0],d[1]))}),c&&(g.root=c,c[a]=g),f){if(f.style)for(var h in f.style)g.style[h]=f.style[h];delete f.style,f.name&&c&&(c["$"+f.name]=g)}for(var i in f)"/"==i[0]?(g.appendChild(DOM(i.substr(1),f[i],c||g)),f.innerHTML&&(g.innerHTML+=f.innerHTML),delete f.innerHTML):g[i]=f[i];return g.appendTo=function(a){a&&a.appendChild(g)},g};

window.Popup = function( s ){

    var s = s || {};

    this.name = s.name;

    var popup = {

        '/.popup-header' : {
            name : 'header',
            '/.popup-title.left' : { name : 'title' },
            '/.popup-top-buttons.right' : { name : 'topbuttons' },
            '/.clear' : { name : 'clear' }
        },
        '/.popup-body' : { name : 'body' },
        '/.popup-buttons' : { name : 'buttons', style : { display : 'none' } }

    }

    this.$element = DOM('.popup',popup);

    if(s.class) this.$element.className += ' ' + s.class;

    this.$header = this.$element.$header;

    this.$title      = this.$element.$title;
    this.$topbuttons = this.$element.$topbuttons;
    this.$buttons    = this.$element.$buttons;

    this.$body = this.$element.$body;

    if( s.body ){
        if( typeof s.body == 'string' ) this.$body.innerHTML = s.body;
        if( Popup.isElement(s.body) ) this.$body.appendChild(s.body);
    }else{
        this.$body.innerHTML = 'popup.body'
    }

    this.$title.innerHTML = s.title || (s.title == undefined ? 'popup.title' : '');

    var container = document.body;

    if(s.modal){
        this.$modal = DOM('.popup-modal',{});
        document.body.appendChild(this.$modal);
        this.$modal.appendChild(this.$element);
        s.draggable = false;
        container = this.$modal;
    }

    if(s.draggable !== false) {
        this.$element.classList.add('popup-draggable');
        Popup.drag( this.$element, {
            handle : this.$header 
        });
    }

    container.appendChild(this.$element);

    this.remove = function(){
        this.$element.remove();
        if(s.modal) this.$modal.remove();
        window.Popup.popups.splice( window.Popup.popups.indexOf(this), 1 );
    }

    this.$close = DOM('.popup-button.popup-close',{
        innerHTML : 'x',
        onclick : function(){
            this.remove();
            if(s.onclose) s.onclose();
        }.bind(this)
    });

    if(s.closable !== false) this.$topbuttons.appendChild(this.$close);

    if(s.simpleHeader) {
        this.$topbuttons.remove();
        this.$element.$clear.remove();
        this.$title.style.float = 'inherit';
    }

    this.b = this.$element.getBoundingClientRect(); 
    var b = this.b;

    var w = document.body.clientWidth;
    var h = document.body.clientHeight;

    this.$element.style.left = (s.left ? s.left : (w / 2) - (b.width / 2)  ) + 'px';
    this.$element.style.top  = (s.top  ? s.top  : (h / 2) - (b.height / 2) ) + 'px';

    this.center = function(){
        this.b = this.$element.getBoundingClientRect(); 
        var b = this.b;
        this.$element.style.left = (w / 2) - (b.width / 2)  + 'px';
        this.$element.style.top  = (h / 2) - (b.height / 2) + 'px';
    }

    if(s.width)  this.$element.style.width  = s.width  + 'px';
    if(s.height) this.$element.style.height = s.height + 'px';

    if(s.buttons){

        this.$buttons.style.display = 'block';

        for(var i=0;i<s.buttons.length;i++){
            var b = s.buttons[i];
            var onclick = function(b,e){
                if(e) e.stopPropagation();
                if(b.onclick) b.onclick();
                if(b.remove) this.remove();
            }.bind(this,b);
            if( b.name ) this[b.name] = onclick;
            var $button = DOM('.popup-button',{
                innerHTML : b.title,
                onclick : onclick
            });
            this.$buttons.appendChild($button);
        }

    }

    if(s.oninit) s.oninit(this);

    window.Popup.popups.push(this);

}

Popup.popups = [];

// shortcut Areyousure popup dialog
Popup.areyousure = function(s,ext){
    var ext = ext || {}; // used to extend the default 'areyousure' popup settings
    var s = s || {};
    var p = {
        title : s.title || 'Are You Sure?!',
        body  : s.body  || 'Are you sure you want to continue ?',
        modal : true,
        closable : false,
        buttons : [
            {
                title : s.noTitle || 'No',
                onclick : s.no,
                remove : true
            },
            {
                title : s.yesTitle || 'Yes',
                onclick : s.yes,
                remove : true
            }
        ]
    }
    for(var x in ext) p[x] = ext[x];
    return new Popup(p)
};

// a basic prompt feature
Popup.prompt = function( title, defaultValue, onsubmit, ext ){
    var ext = ext || {};
    onsubmit = onsubmit || function( value ){ console.log(value) }
    var $input = DOM('input.popup-input',{value:defaultValue||''});
    $input.onkeyup = function(e){e.stopPropagation();}
    $input.onkeydown = function(e){e.stopPropagation();}
    var p = {
        title : title || 'Enter Value',
        body : $input,
        modal : true,
        buttons : [
            {
                title : 'Cancel',
                remove : true
            },
            {
                title : 'Save',
                onclick : function(){
                    onsubmit && onsubmit($input.value)
                },
                remove : true
            }
        ]
    }
    for(var x in ext) p[x] = ext[x];
    return new Popup(p)
}

Popup.options = function( options, title, ext ){
    var ext = ext || {};
    var $options = DOM('.popup-options');
    var p = {
        title : title || 'Select...',
        body : $options,
        modal : true
    }
    for(var x in ext) p[x] = ext[x];
    var popup = new Popup(p)

    for(var i=0;i<options.length;i++){
        var o = options[i];
        var $option = DOM('.popup-option',{
            innerHTML : o.title || 'Option '+(i+1),
            onclick : function(o,e){
                e.stopPropagation();
                o.onclick && o.onclick();
                popup.remove();
            }.bind(this,o)
        });
        $options.appendChild($option);
    }

    popup.center();

    return popup;

}

if( HTMLElement.prototype.colorpicker ){ // requires colorpicker.js

    Popup.colorpicker = function( onpick, title, ext ){
        var ext = ext || {};
        var $colorpicker = DOM('.popup-colorpicker');
        $colorpicker.colorpicker({
            onPick : onpick,
            rgba : true,
            size : 200
        })
        var p = {
            title : title || 'Colorpicker',
            body : $colorpicker
        }
        var popup = new Popup(p);
        return popup;
    }

}

Popup.drag = function( element, setup ){

    var setup = setup || {};
    
    var mousemove = function(e){ // document mousemove
    
        element.style.left = ( e.clientX - element.dragStartX ) + 'px';
        element.style.top  = ( e.clientY - element.dragStartY ) + 'px';

        setup.ondrag && setup.ondrag(e);
    
    }.bind(element);
    
    var mouseup = function(e){ // document mouseup
    
        document.removeEventListener('mousemove',mousemove);
        document.removeEventListener('mouseup',mouseup);

        handle.classList.remove('dragging');

        setup.ondragend && setup.ondragend(e);
    
    }.bind(element);
    
    var handle = setup.handle || element;
    
    handle.addEventListener('mousedown',function(e){ // element mousedown
    
        element.dragStartX = e.offsetX;
        element.dragStartY = e.offsetY;
    
        document.addEventListener('mousemove',mousemove);
        document.addEventListener('mouseup',mouseup);

        handle.classList.add('dragging');

        setup.ondragstart && setup.ondragstart(e);
    
    }.bind(element)); 

    handle.classList.add('draggable');

    setup.ondraginit && setup.ondraginit(e);
    
}

Popup.isElement = function(obj) {
    try { return obj instanceof HTMLElement; }
    catch(e){
        return (typeof obj==="object") &&
        (obj.nodeType===1) && (typeof obj.style === "object") &&
        (typeof obj.ownerDocument ==="object");
    }
}