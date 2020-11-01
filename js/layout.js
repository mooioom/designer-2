window.Layout = function( s ){

    var $Layout = this;

    var s = s || {}

    var DEFAULTS = {

        window : document.body,
        canvas: DOM('div'),
        ignore : [],
        rtl : false,
        elementMenu : false

    };

    this.settings = Defaults(DEFAULTS,s);

    this.history = [];

    this.selected = null;
    this.hovered = null;

    this.$window = this.settings.window;
    this.$canvas = this.settings.canvas;

    //this.settings.canvas.appendChild(this.$canvas);

    this.$window.classList.add('layout-window');
    this.$canvas.classList.add('layout-canvas');

    this.$window.classList.add('layout');
    this.$canvas.classList.add('layout');

    var style = `
        body,html{
            font-family: Arial, Helvetica, sans-serif;
            width: 100%;
            height: 100%;  
            padding: 0px;
            margin: 0px;
        }
        body *{
            box-sizing:border-box;
        }
    `;

    style = '';

    this.$style = DOM('style',{innerHTML:style});

    this.$window.appendChild(this.$style);

    var getTarget = function(){
        return this.selected || this.hovered || null;
    }.bind(this);

    this.getTarget = getTarget;

    this.$bar = DOM('.layout-bar',{
        '/.layout-selection.layout-left' : {
            name : 'selection'
        },
        '/.layout-menu.layout-right' : {
            name : 'menu'
        },
        '/.layout-clear' : {}
    });

    this.settings.ignore.push(this.$bar);

    this.reset = function(){
        //this.$canvas.innerHTML = '';
        //this.$canvas.className = 'layout layout-canvas';
    }

    this.reset();

    var tags = {
        'div' : '<div>DIV</div>',
        'inline-block': '<div style="display:inline-block;">DIV</div>',
        'button' : '<button>Button</button>',
        'span' : '<span>Regular Text</span>',
        'p' : '<p>This is a paragraph</p>',
        'link' : '<a>Hyperlink</a>',
        'bold' : '<b>Bold</b>',
        'italic' : '<i>Italic</i>',
        'underline' : '<i>Underline</i>',
        'header 1' : '<h1>Header</h1>',
        'header 2' : '<h2>Header</h2>',
        'header 3' : '<h3>Header</h3>',
        'small' : '<small>Small</small>',
        'subscript' : '<sub>Subscript</sub>',
        'superscript' : '<sup>Superscripted</sup>',
        'list' : '<ul><li>List Item 1</li><li>List Item 2</li><li>List Item 3</li></ul>',
        'label' : '<label>This a label</label>',
        'table' : '<table><tr><td>TD1.1</td><td>TD1.2</td><td>TD1.3</td></tr><tr><td>TD2.1</td><td>TD2.2</td><td>TD2.3</td></tr></table>',
        'input' : '<input />',
        'password' : '<input type="password" />',
        'checkbox' : '<input type="checkbox" />',
        'radio' : '<input type="radio" />',
        'select' : '<select><option>Opt 1</option><option>Opt 2</option><option>Opt 3</option></select>',
        'textarea' : '<textarea>Text Area</textarea>',
        'image' : '<img />',
        'line' : '<hr />',
        'pre' : '<pre>Pre text</pre>',
        'code' : '<code>Code text</code>',
        'em' : '<em>Emphasis text</em>',
        'kbd' : '<kbd>Kbd text</kbd>',
        'mark' : '<mark>Marked text</mark>'
    }

    this.addTag = function( tag ){
        var t = getTarget();
        if(!t) return;
        t.innerHTML += tags[tag]
    }

    this.tagsPopup = function(){
        var opts = [];
        for(var tag in tags){
            opts.push({
                title : tag,
                onclick : function(tag,e){
                    this.addTag(tag);
                }.bind(this,tag)
            })
        }
        var $o = Popup.options(opts,'Tags...',{
            class : 'tags-popup'
        })
    }.bind(this);

    this.$bar.$menu.appendChild(DOM('.layout-button',{
        innerHTML : 'Tags',
        onclick : function(){
            this.tagsPopup();
        }.bind(this)
    }));

    // this.$bar.$menu.appendChild(DOM('.layout-button',{
    //     innerHTML : 'Canvas',
    //     onclick : function(){
    //         var $o = Popup.options([
    //             {
    //                 title : 'Fullscreen',
    //                 onclick : function(){
    //                     this.reset();
    //                 }.bind(this)
    //             },
    //             {
    //                 title : 'A4 Page',
    //                 onclick : function(){
    //                     this.reset();
    //                     this.$canvas.classList.add('layout-a4');
    //                 }.bind(this)
    //             }
    //         ],'New Layout...')
    //     }.bind(this)
    // }));

    this.$bar.$menu.appendChild(DOM('.layout-button', {
        innerHTML: 'Code',
        onclick: function () {

            var backup = this.$canvas.innerHTML;

            $body = DOM('.code-body',{
                style : { width : '700px', height : '600px' }
            });

            $p = new Popup({
                body : $body,
                title : 'Code',
                buttons : [
                    {
                        title: 'Cancel',
                        onclick: function () {
                            this.$canvas.innerHTML = backup;
                        }.bind(this),
                        remove : true
                    },
                    {
                        title : 'Close',
                        onclick : function(){
                            this.$canvas.innerHTML = $m.getValue();
                        }.bind(this),
                        remove : true
                    }
                ]
            });

            $m = new CodeMirror($body,{
                mode : 'htmlmixed',
                value: html_beautify(this.$canvas.innerHTML)
            });

            $m.on('change',function(a){
                this.$canvas.innerHTML = $m.getValue();
            }.bind(this));

        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button', {
        innerHTML: 'Onclick',
        onclick: function () {
            this.setOnclick();
        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button', {
        innerHTML: 'Attribute',
        onclick: function () {
            var t = getTarget();
            Popup.prompt('Attribute Name','',function(aname){
                Popup.prompt('Attribute Value', t.getAttribute(aname), function (avalue) {
                    t.setAttribute(aname,avalue);
                })
            })
        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button', {
        innerHTML: 'View',
        onclick: function () {
            var t = getTarget();
            Popup.prompt('View Name', '', function (name) {
                t.setAttribute('view', name);
                if (window.bindViews) window.bindViews(this.$canvas);
            }.bind(this))
        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button',{
        innerHTML : 'Preview',
        onclick : function(){
            this.preview();
        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button',{
        innerHTML : 'Save',
        onclick : function(){
            this.saveFile();
        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button',{
        innerHTML : 'Load',
        onclick : function(){
            this.loadFile();
        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button',{
        innerHTML : 'CSS',
        onclick : function(){
            this.editCSS();
        }.bind(this)
    }));

    this.$bar.$menu.appendChild(DOM('.layout-button',{
        innerHTML : 'Table / Layout',
        onclick : function(){
            var tb = new TableBuilder();
            var $p = new Popup({
                title : 'Table Builder',
                body  : tb.$element,
                buttons : [
                    {
                        title : 'Insert',
                        onclick : function(){
                            var t = getTarget();
                            if(!t) return;
                            t.appendChild( tb.getTable() );
                        }
                    }
                ]
            })
        }.bind(this)
    }));

    this.$window.appendChild(this.$bar);

    if( this.settings.menu ){

        var $menuBody = DOM('.layout-menu-body');

        for(var x in this.settings.menu){
            var item = this.settings.menu[x];
            $menuBody.appendChild(DOM('.layout-menu-body-button'+(item.class?'.'+item.class:''),{
                title : item.title,
                onclick : item.onclick
            }))
        }

        this.$menuPopup = new Popup({
            class : 'layout-menu-popup',
            closable : false,
            simpleHeader : true,
            title : '',
            body : $menuBody
        })

    }

    Element.prototype.reverseChildren = function(){
        var c = [].slice.call(this.children).reverse();
        this.innerHTML = '';
        c.forEach(function( child ){ this.appendChild(child) }.bind(this));
        return this;
    }

    this.createCrumb = function( title, element ){

        var crumb = DOM('.layout-crumb',{
            innerHTML : title,
            $element : element
        });

        crumb.onmouseenter = function(e){
            this.onmousemove(e.target.$element);
        }.bind(this);

        crumb.onclick = function(e){
            this.onclick(e.target.$element);
            this.render();
        }.bind(this);

        return crumb;

    }

    this.getCrumbs = function( element, crumbs ){

        if(!element) return;

        crumbs = crumbs || DOM('.layout-crumbs');

        if( element == this.$canvas ){
            var crumb = this.createCrumb('STAGE',element);
            crumbs.appendChild(crumb);
            return crumbs.reverseChildren();
        }

        var tag = element.tagName;
        var text = '';

        var c = element.cloneNode(true);
            c.classList.remove('layout-selected');
            c.classList.remove('layout-hovered');
            c.classList.remove('layout-table');

        if( c.id ) text = tag+'#'+element.id;
        else if( c.className ){
            text = tag+'.'+c.className.split(' ').join('.'); 
        }
        else text = c.tagName;

        var crumb = this.createCrumb( text, element );

        crumbs.appendChild(crumb);

        var sep = DOM('.layout-crumb-seperator',{
            innerHTML : '/'
        });

        crumbs.appendChild(sep);

        if(element.parentElement) return this.getCrumbs( element.parentElement, crumbs );

    }

    this.render = function(){

        this.$bar.$selection.innerHTML = '';
        var $crumbs = this.getCrumbs( this.selected || this.hovered );
        if($crumbs) this.$bar.$selection.appendChild( $crumbs );

    }

    // events

    this.isIgnored = function( element ){
        if(!element) return false;
        if( this.settings.ignore.indexOf(element) != -1 ) return true;
        var p = element.parentElement;
        while(p){
            if (this.settings.ignore.indexOf(p) != -1) return true;
            p = p.parentElement;
        }
        if(element.layoutElement) return true;
    }.bind(this);

    this.onclick = function( element, e ){

        if( this.isIgnored(element) ) return;

        if(this.hovered) this.hovered.classList.remove('layout-hovered');
        if(this.selected) {
            unselect();
            // this.selected.contentEditable = false;
        }

        this.selected = element;

        if(this.selected) {
            this.selected.classList.add('layout-selected');
            //this.selected.contentEditable = true;
        }

        var action = this.getModeAction(this.mode,'onclick');
        if(action) action.call(this,element,e);

    }

    var unhover = function(){
        var d = document.querySelectorAll('.layout-hovered');
        d.forEach(function(e){e.classList.remove('layout-hovered')});
    }

    var unselect = function(){
        var d = document.querySelectorAll('.layout-selected');
        d.forEach(function(e){e.classList.remove('layout-selected')});
    }

    this.$elementMenu = null;

    var elementMenu = function(){

        if( !this.settings.elementMenu ) return;

        if( this.$elementMenu ) this.$elementMenu.remove();

        this.$elementMenu = DOM('.layout-element-menu',{
            '/.layout-element-menu-button.icon-cancel' : {
                layoutElement : true,
                onclick : function(){
                    this.removeElement(this.hovered);
                }.bind(this)
            }
        });

        this.hovered.appendChild(this.$elementMenu);

    }.bind(this);

    this.onmousemove = function( element, e ){

        if (this.isIgnored(element)) return;

        unhover();

        this.hovered = element;

        if(this.hovered) {
            this.hovered.classList.add('layout-hovered');
            elementMenu();
        }

        var action = this.getModeAction(this.mode,'onmousemove');
        if(action) action.call(this,element,e);

    }

    this.onmouseleave = function( element, e ){
        if (this.isIgnored(element)) return;
        unhover();
    }

    this.getModeAction = function( mode, action ){
        if( this.modes[ mode ] && this.modes[ mode ][ action ] ) return this.modes[ mode ][ action ];
        return false;
    }

    this.bind = function(){

        this.$canvas.onmousemove = function(e){
            this.onmousemove( e.target, e );
            this.render();
        }.bind(this);
    
        this.$canvas.onmouseleave = function(e){
            this.onmouseleave( e.target, e );
            this.render();
        }.bind(this);
    
        this.$canvas.onclick = function(e){
            this.onclick( e.target, e );
            this.render();
        }.bind(this);

        this.$canvas.ondblclick = function (e) {
            this.setInnerHTML();
        }.bind(this);

        window.onbeforeunload = function (event) {
            // do stuff here
            return "you have unsaved changes. Are you sure you want to navigate away?";
        };

    }

    this.unbind = function(){
        this.$canvas.onmousemove = null;
        this.$canvas.onmouseleave = null;
        this.$canvas.onclick = null;
        this.$canvas.ondblclick = null;
        window.onbeforeunload = null;
    }

    this.destruct = function(){
        unhover();
        unselect();
        splitterRemove();
        this.unbind();
        this.$bar.remove();
    }

    this.bind();

    // modes

    this.$splitter = null;

    var splitter = function( type, element ){
        splitterRemove();
        this.$splitter = DOM('.layout-split-'+type);
        this.$splitter.style[ type == 'v' ? 'left' : 'top' ] = event[ 'offset' + (type == 'v' ? 'X' : 'Y') ] + 'px';
        element.appendChild(this.$splitter);
    }.bind(this);

    var splitterRemove = function(){
        if( this.$splitter ) this.$splitter.remove();
    }.bind(this);

    this.modes = {

        'split-vertical' : {
            onmousemove : function( element, event ){
                splitter('v',element);
            },
            onclick : function( element, event ){
                console.log('c');
                splitterRemove();
                
                var w = event.offsetX;
                var tw = element.getBoundingClientRect().width;
                var p = (w / tw) * 100;

                var div = DOM('div');
                div.style.width = (this.rtl ? 100-p : p ) + '%';
                div.style.height = '100%';
                div.style.backgroundColor = randomGrey();
                div.style.display = 'inline-block';
                div.style.verticalAlign = 'top';
                element.appendChild(div);

                var div = DOM('div');
                div.style.width = (this.rtl ? p : 100-p ) + '%';
                div.style.height = '100%';
                div.style.display = 'inline-block';
                div.style.verticalAlign = 'top';
                element.appendChild(div);

            },
            onmouseleave : function( element, event ){
                splitterRemove();
            }
        },

        'split-horizontal' : {
            onmousemove : function( element, event ){
                splitter('h',element);
            },
            onclick : function( element, event ){
                splitterRemove();
                var div = DOM('div');

                var h = event.offsetY;
                var th = element.getBoundingClientRect().height;

                div.style.height = h + 'px';
                div.style.backgroundColor = randomGrey();
                element.appendChild(div);

                var div = DOM('div');
                div.style.height = (th-h) + 'px';
                element.appendChild(div);

            },
            onmouseleave : function( element, event ){
                splitterRemove();
            }
        },

    }

    function randomGrey() {
        var v = (Math.random()*(256)|0).toString(16);//bitwise OR. Gives value in the range 0-255 which is then converted to base 16 (hex).
        return "#" + v + v + v;
    }

    Element.prototype.setGradient = function( from, mid, to, vertical ){
        this.style.background = 'linear-gradient(to '+(vertical ? 'top' : 'left')+', '+from+', '+mid+' 50%, '+to+' 100%)';
    }

    var cssEditor = function( sheet ){

        var $c = DOM('.css-editor',{
            '/.selector-select' : {
                '/select' : {
                    name : 'selector'
                }
            },
            '/.rule' : {
                name : 'rule'
            },
            '/.css-menu' : {
                name : 'menu'
            }
        });

        var rules = sheet.rules;

        for(var i=0;i<rules.length;i++){
            var rule = rules[i];
            var $option = DOM('option',{
                innerHTML : rule.selectorText,
                rule : rule
            });
            $c.$selector.appendChild($option);
        }

        function camelCaseToDash( myStr ) {
            return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
        }

        var renderRule = function( rule ){

            $c.$rule.innerHTML = '';
            
            var styles = rule.cssText.match(/{.+}/g)[0].replace('{','').replace('}','').split(';');
            for(var x in styles){
                var style = styles[x];
                var property = style.split(':')[0];
                var value = style.split(':')[1];

                if( !property.trim() ) continue;
                
                $c.$rule.appendChild(DOM('.style',{
                    '/.style-property' : {
                        innerHTML : property
                    },
                    '/.style-seperator' : {
                        innerHTML : ':'
                    },
                    '/.style-value' : {
                        innerHTML : value
                    },
                    '/.style-breaker' : {
                        innerHTML : ';'
                    }
                }))

            }

        }

        $c.onchange = function( e ){

            var rule = e.target.selectedOptions[0].rule;
            renderRule(rule);

        }.bind(this);

        if(rules.length) renderRule(rules[0]);

        return $c;

    }.bind(this);

    this.editCSS = function(){
        var $p = new Popup({
            title : 'CSS Editor',
            body : cssEditor( this.$style.sheet )
        });
    }

    this.keydowns = {
        v : function(){
            this.mode = 'split-vertical';
        },
        h : function(){
            this.mode = 'split-horizontal';
        },
        l : function(){ // class
            this.setClass();
        },
        'ctrl+l' : function(){
            this.editCSS();
        },
        y : function(){ // style attribute
            this.setStyle();
        },
        d : function(){ // duplicate
            this.duplicate();
        },
        c : function(){ // color
            this.setColors();
        },
        o : function(){ // simple div
            this.div();
        },
        'crtl+o': function () { // simple div
            this.setOnclick();
        },
        'shift+t' : function(){
            this.h1();
        },
        t : function(){ // tags
            this.tagsPopup();
        },
        s : function(){ // subtitle
            this.h2();
        },
        e : function(){ // ipsum
            this.ipsum();
        },
        i : function(){ // background image
            this.backgroundImage();
        },
        b : function(){
            this.toggleBold();
        },
        m : function(){ // middle box
            this.middleBox();
        },
        'shift+m' : function(){ // margin 0px auto div
            this.div(true);
        },
        n : function(){ 
        },
        p : function(){ // padding
            this.styleResize('padding',5,100);
        },
        r : function(){ // border radius
            this.styleResize('borderRadius',5,100);
        },
        f : function(){
            this.styleResize('fontSize',5,200);
        },
        'ctrl+f' : function(){
            this.googleFont();
        },
        g : function(){ // gradient background
            this.gradientEditor();
        },
        arrowright : function(){
            this.resize('width',10);
        },
        arrowleft : function(){
            this.resize('width',-10);
        },
        arrowup : function(){
            this.resize('height',10);
        },
        arrowdown : function(){
            this.resize('height',-10);
        },
        pageup : function(){
            this.resize('height',30);
        },
        pagedown : function(){
            this.resize('height',-30);
        },
        home : function(){
            this.resize('width',30);
        },
        end : function(){
            this.resize('width',-30);
        },
        delete : function(){
            this.removeElement();
        },
        a : function(){ // align
            this.toggleAlign();
        },
        'ctrl+c' : function(){
            this.copy();
        },
        'ctrl+v' : function(){
            this.paste();
        },
        'ctrl+p' : function(){
            this.preview();
        },
        'ctrl+z' : function(){
            this.undo();
        },
        '1' : function(){ this.table(1) },
        '2' : function(){ this.table(2) },
        '3' : function(){ this.table(3) }
    }

    this.keyups = {
        v : function(){
            this.mode = null;
            splitterRemove();
        },
        h : function(){
            this.mode = null;
            splitterRemove();
        }
    }

    this.removeElement = function( e ){
        var t = e || getTarget();
        if(!t || t == this.$canvas) return;
        this.saveHistory();
        var s = t.nextSibling;
        t && t.remove();
        this.onclick(s);
    }

    var createTable = function( cols, rows ){

        cols = cols || 1;
        rows = rows || 1;

        var table = DOM('table',{
            style : { width : '100%' },
            '/tr' : { name : 'tr' }
        });

        var td = DOM('td');

        for(var x=0;x<cols;x++){
            td.innerHTML = x;
            table.$tr.appendChild(td.cloneNode(true));
        }

        return table;

    }.bind(this);

    this.mode = null;

    var isActiveInput = function(){
        var a = document.activeElement;
        if( a ){
            var t = a.tagName;
            if(t == 'INPUT')    return true;
            if(t == 'SELECT')   return true;
            if(t == 'TEXTAREA') return true;
        }
    }

    this.pressedKeys = [];

    document.body.onkeydown = function( e ){

        if( isActiveInput() ) return;

        console.log(e);

        e.preventDefault();

        var k = e.key.toLowerCase();
        if(e.shiftKey) k = 'shift+'+k;
        if(e.ctrlKey) k = 'ctrl+'+k;
        var fn = this.keydowns[ k ];
        if(fn){
            fn.call(this,e);
        }

    }.bind(this)

    document.body.onkeyup = function( e ){

        if( isActiveInput() ) return;

        e.preventDefault();

        this.mode = null;
        var k = e.key.toLowerCase();
        if(e.shiftKey) k = 'shift+'+k;
        if(e.ctrlKey) k = 'ctrl+'+k;
        var fn = this.keyups[ k ];
        fn && fn.call(this,e);

    }.bind(this);

    this.preview = function(){
        var html = this.getHTML();
        var w = window.open();
        w.document.body.innerHTML = html;
    }

    // remove helper classes, contentEditable, etc
    this.cleanHTML = function( element ){
        var r = element.querySelectorAll('[class*="layout-selected"]');
        for(var i=0;i<r.length;i++){ r[i].classList.remove('layout-selected'); }
        var r = element.querySelectorAll('[class*="layout-hovered"]');
        for (var i = 0; i < r.length; i++) { r[i].classList.remove('layout-hovered'); }
        var r = element.querySelectorAll('[class*="layout-split-v"]');
        for (var i = 0; i < r.length; i++) { r[i].classList.remove('layout-split-v'); }
        var r = element.querySelectorAll('[class*="layout-split-h"]');
        for (var i = 0; i < r.length; i++) { r[i].classList.remove('layout-split-h'); }
        return element;
    }

    // gets the main canvas HTML
    this.getHTML = function( innerHTML ){
        var h = this.$canvas.cloneNode(true);
        h = this.cleanHTML(h);
        h.classList.remove('layout');
        h.classList.remove('layout-canvas');
        h.setAttribute('style',this.$canvas.getAttribute('style'));
        var html = innerHTML ? h.innerHTML : (h.outerHTML + this.$style.outerHTML);
        return html_beautify(html);
    }

    // sets the main canvas HTML
    this.setHTML = function( html ){
        var d = DOM('div');
        d.innerHTML = html;
        if(this.$style) this.$style.remove();
        var style = d.querySelector('style');
        if(style){
            this.$style = style.cloneNode(true);
            this.$window.appendChild(this.$style);
            style.remove();
        }
        this.$canvas.innerHTML = d.innerHTML;
    }

    this.saveFile = function(){
        Popup.prompt('Save File...','layout.html',function( fname ){
            var blob = new Blob([this.getHTML()], {type: "text/html;charset=utf-8"});
            saveAs(blob, fname||"layout.html");
        }.bind(this));
    }

    this.readFile = function( onload, readAsURL ){
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = function(e){ 
            var file = e.target.files[0]; 
            var reader = new FileReader();
            reader[ readAsURL ? 'readAsDataURL' : 'readAsText' ](file); // this is reading as data url
            reader.onload = function(readerEvent) {
                var content = readerEvent.target.result; // this is the content!
                onload(content);
            }.bind(this)
        }.bind(this)
        input.click();
    }

    this.loadFile = function(){
        this.readFile(function(html){
            this.$canvas.innerHTML = html;
        }.bind(this));
    }

    this.saveHistory = function(){
        this.history.push( this.getHTML() );
    }

    this.undo = function(){
        this.setHTML( this.history[this.history.length-1] );
        this.history.splice( this.history.length - 1 , 1);
    }

    this.redo = function(){

    }

    this.setInnerHTML = function(){
        var t = getTarget();
        if(!t) return;
        var html = prompt('Inner HTML', this.cleanHTML(t).innerHTML) ;
        t.innerHTML = html;
    }

    this.resize = function( prop, amount ){
        var t = getTarget();
        if(!t) return;
        var w = t.getBoundingClientRect()[prop] + amount;
        t.style[prop] = w+'px';
    }

    this.styleResize = function( prop, amount, max ){
        var t = getTarget();
        if(!t) return;
        if(!t[prop]) {
            t[prop] = amount;
            t.style[prop] = t[prop] + 'px';
        }else{
            t[prop] += amount;
            if(t[prop] == max) t[prop] = 0;
            t.style[prop] = t[prop] + 'px';
        }
    }

    this.toggleBold = function(){
        var t = getTarget();
        var w = t.style.fontWeight;
        t.style.fontWeight = (w == 'bold') ? 'normal' : 'bold';
    }

    this.toggleAlign = function(){
        var t = getTarget();
        var w = t.style.textAlign;
        if(!w) w = 'left';
        else if(w=='left') w='center';
        else if(w=='center') w='right';
        else if(w=='right') w='left';
        t.style.textAlign = w;
    }

    this.setClass = function(){
        var t = getTarget();
        t.className = prompt('class',
            t.className.replace('layout-hovered','').replace('layout-selected','')
        );
    }

    this.setStyle = function(){
        var t = getTarget();
        t.setAttribute('style',prompt('style=',t.getAttribute('style')));
    }

    this.duplicate = function(){
        var t = this.selected || this.hovered;
        if(!t) return;
        var d = t.cloneNode(true);
        t.parentElement.appendChild(d);
    }

    this.setColors = function(){
        var $table = new TableBuilder({cols:2,rows:1,tableLayout:'auto',align:'left'}).getTable();

        var p = new Popup({
            title : '<small>Colors</small>',
            body : $table
        });

        p.$body.style.padding = 0;

        $table.rows[0].cells[0].colorpicker({
            onPick : function(rgba){
                var t = getTarget();
                t.style.backgroundColor = 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')';
            },
            size : 200,
            rgba : true
        });

        $table.rows[0].cells[1].colorpicker({
            onPick : function(rgba){
                var t = getTarget();
                t.style.color = 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')';
            },
            size : 200,
            rgba : true
        });

        p.center();
        
    }

    this.div = function(middle){
        var t = getTarget();
        var div = DOM('div',{
            style : { 
                minHeight : '10px',
                margin : middle ? '0px auto' : 'auto',
                backgroundColor : randomGrey()
            }
        });
        t && t.appendChild(div);
    }

    this.h1 = function(){
        var t = getTarget();
        var h1 = DOM('h1.title',{
            innerHTML : 'Title Text'
        });
        t && t.appendChild(h1);
    }

    this.h2 = function(){
        var t = getTarget();
        var h1 = DOM('h2.subtitle',{
            innerHTML : 'SubTitle Text'
        });
        t && t.appendChild(h1);
    }

    this.ipsum = function(){
        var t = getTarget();
        var text = prompt("Text", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut egestas enim. Vivamus suscipit lectus ac turpis ultrices, efficitur aliquam libero cursus. Pellentesque tristique sit amet mi sit amet accumsan.");
        t.innerHTML = text;
        t && t.appendChild(h1);
    }

    this.backgroundImage = function(){
        var t = getTarget();
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = function(e){ 
            var file = e.target.files[0]; 
            var reader = new FileReader();
            reader.readAsDataURL(file); // this is reading as data url
            reader.onload = function(readerEvent) {
                var content = readerEvent.target.result; // this is the content!
                t.style.backgroundImage = 'url('+ content +')';
                t.style.backgroundSize = 'cover';
                t.style.backgroundRepeat = 'no-repeat';
            }.bind(this)
        }.bind(this)
        input.click();
    }

    this.middleBox = function(){
        var t = getTarget();
        var m = DOM('table',{
            '/tr' : {
                '/td' : {
                    style : {
                        textAlign : 'center'
                    },
                    '/div' : {
                        style : { display : 'inline-block' },
                        innerHTML : 'Middle Box'
                    }
                }
            }
        });
        m.style.height = '100%';
        m.style.width = '100%';
        t&&t.appendChild(m);
    }

    this.googleFont = function(){
        var p = new Popup.prompt('Google Fonts Family - fonts.google.com','',function(font){
            this.$style.innerHTML = "@import url('https://fonts.googleapis.com/css?family="+font.split(' ').join('+')+"');" + ' ' + this.$style.innerHTML;
            document.head.innerHTML += '<link href="https://fonts.googleapis.com/css?family='+font.split(' ').join('+')+'" rel="stylesheet">'
            var t = getTarget();
            t.style.fontFamily = font;
        }.bind(this));
    }

    this.gradientEditor = function(){
        var t = getTarget();
        var c1 = prompt('From Color','#333');
        var c2 = prompt('Middle Color','#111');
        var c3 = prompt('To Color','#333');
        t.setGradient(c1,c2,c3,true);
    }

    this.table = function(c,r){
        var t = getTarget(); var table = createTable(c,r); t.appendChild(table);
    }

    this.copy = function(){
        var t = getTarget();
        if(t) this.clipboard = t.cloneNode(true);
    }

    this.paste = function(){
        var t = getTarget();
        if(this.clipboard && t) t.appendChild( this.clipboard.cloneNode(true) );
    }

    this.setOnclick = function(){
        var t = getTarget();
        Popup.prompt('onclick=',t.getAttribute('onclick'),function(v){
            t.setAttribute('onclick',v);
        })
    }

    this.preview = function(){
        var html = this.getHTML();
        var w = window.open();
        w.document.body.innerHTML = html;
    }

}