window.Canvas = function( s ){

    var s = s || {};

    window.l = console.log;

    var $l = this;

    this.$element = s.$element;

    this.$canvas = document.createElement('canvas');
    this.ctx = this.$canvas.getContext('2d');

    //this.ctx.imageSmoothingEnabled = true;

    this.$canvas._canvas = this;

    this.$canvas.width  = s.width  || 500; 
    this.$canvas.height = s.height || 500;

    this.width  = this.$canvas.width;
    this.height = this.$canvas.height;

    this.center = {
        x : this.width / 2,
        y : this.height / 2
    }

    if(s.className) this.$canvas.className = s.className;

    if(this.$element) this.$element.appendChild( this.$canvas );

    if(s.color) this.$canvas.style.backgroundColor = s.color;

    this.selected = null;

    this.root = null;

    this.events = {};

    this.on = function( eventName, fn ){
        var events = this.events[eventName];
        if(events) events.push(fn);
        else this.events[eventName] = [fn];
    }

    this.emit = function( eventName ){
        var events = this.events[eventName] || [];
        var args = [].slice.call(arguments).slice(1);
        events.forEach(function(event){
            event.apply(null,args);
        });
    }

    this.render = function(){

        this.emit('beforerender',this);

        this.clear();

        this.root.elements.forEach(function(l){
            l._render(l);
        }.bind(this));

        this.emit('afterrender',this);

    }

    this.iterate = function( fn, flat ){
        this.root.iterate(fn,flat);
    }

    this.all = function(){
        var e = [];
        this.iterate(function(l){ e.push(l); });
        return e;
    }

    this.clear = function(){
        this.ctx.clearRect(0, 0, this.$canvas.width, this.$canvas.height);
    }

    this.empty = function(){
        this.root.empty();
    }

    this.export = function( jsObject ){
        return this.root.export(jsObject);
    }

    this.SVG_NS = "http://www.w3.org/2000/svg";

    this.toSVG = function( domObject ){

        // https://css-tricks.com/scale-svg/

        var svg = document.createElementNS( this.SVG_NS, "svg" );

        svg.setAttribute("width",  this.width);
        svg.setAttribute("height", this.height);

        var g = this.root.toSVG(true);

        svg.appendChild(g);

        return domObject ? svg : svg.outerHTML;

    }

    this.eachObjects = function( fn, includeGroups ){
        return this.root.eachObjects(fn,includeGroups);
    }

    this.create = function( _type, data ){
        return this.root.create(_type,data);
    }

    var types = ['Group','Line','Box','Circle','Text','Shape'];

    for(var i=0;i<types.length;i++){
        var t = types[i];
        this[t] = function( type, data, preventAppend ){
            return this.create(type,data);
        }.bind(this,t)
    }

    this.getObjects = function(){
        var objects = [];
        this.eachObjects(function (o) { objects.push(o) });
        return objects;
    }

    this.add = function( e ){
        this.root.add(e);
    }

    this.getPixelColor = function(x,y){
        var p = this.ctx.getImageData(x, y, 1, 1).data; 
        return "#" + ("000000" + Canvas.Utils.rgbToHex(p[0], p[1], p[2])).slice(-6);
    }

    this.toDataURL = function(){
        return this.$canvas.toDataURL("image/png");
    }

    this.getBounds = function(){
        return {
            x1 : 0,
            y1 : 0,
            x2 : this.width,
            y2 : this.height,
            w  : this.width,
            h  : this.height,
            c  : {
                x : this.width / 2,
                y : this.height / 2
            }
        }
    }

    this.blendingModes = ["source-over","source-in","source-out","source-atop","destination-over","destination-in","destination-out","destination-atop","lighter","copy","xor","multiply","screen","overlay","darken","lighten","color-dodge","color-burn","hard-light","soft-light","difference","exclusion","hue","saturation","color","luminosity"];

    var data = {};

    data.canvas = this;
    data.ctx = this.ctx;
    data.$root = true;
    data._type = 'Group';
    data.parent = null;

    this.root = new Canvas.Element(data);

}

Canvas.Element = function(s){

    var _Element = new Canvas[s._type](s);

    _Element.alpha     = _Element.alpha     || 1;
    _Element.blending  = _Element.blending  || null;
    _Element.rotation  = _Element.rotation  || 0;
    _Element.lineWidth = _Element.lineWidth || 0;
    _Element.stroke    = _Element.stroke    || 'black';

    _Element.shadow        = _Element.shadow        || false;
    _Element.shadowBlur    = _Element.shadowBlur    || 0;
    _Element.shadowColor   = _Element.shadowColor   || 'black';
    _Element.shadowOffsetX = _Element.shadowOffsetX || 0;
    _Element.shadowOffsetY = _Element.shadowOffsetY || 0;

    for (var x in s) _Element[x] = s[x];

    _Element.prerender = function(){

        var ctx = this.ctx;

        ctx.restore();
        ctx.save();

        ctx.globalCompositeOperation = this.blending || 'source-over';

        ctx.beginPath();

        ctx.globalAlpha = this.alpha     || 1;
        ctx.fillStyle   = this.fill      || 'transparent';
        ctx.lineWidth   = this.lineWidth || 0.0001;
        ctx.strokeStyle = this.stroke    || 'transparent';
        ctx.textAlign   = this.textAlign || "left";

        if( this.shadow ){
            ctx.shadowBlur     = this.shadowBlur    || 0;
            ctx.shadowColor    = this.shadowColor   || 'black';
            ctx.shadowOffsetX  = this.shadowOffsetX || 0;
            ctx.shadowOffsetY  = this.shadowOffsetY || 0;
        }

        if( this.getFont ) ctx.font = this.getFont(); 

        // var bounds = this.getBounds();

        // ctx.translate(bounds.c.x, bounds.c.y);
        // ctx.rotate(this.rotation * Math.PI / 180);
        // ctx.translate(-bounds.c.x, -bounds.c.y);

        if ( this.lineDash ) ctx.setLineDash( this.lineDash );
        
    }

    _Element._render = function(e){
        if( e._type == 'Group' && !e.elements.length ) return;
        if (e.hidden) return;
        this.prerender.call(e);
        e.render(this.ctx);
        this.postrender.call(e);
    };

    _Element.postrender = function(){
        var ctx = this.ctx;
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.setLineDash([]);
    }

    _Element.isPointInBounds = function(x,y){
        var bounds = this.getBounds();
        return Canvas.Utils.isPointInBounds(x,y,bounds);
    }

    _Element.savePosition = _Element.savePosition || function(){
        this.$position = this.getPosition();
    }

    _Element.remove = function(){
        this.parent.elements.splice( this.parent.elements.indexOf(this), 1 );
        this.canvas.emit('remove',this);
    }

    _Element.move = function( ox, oy ){
        this.savePosition();
        this.setPosition(ox,oy);
    }

    _Element.moveTo = function( x, y ){
        var c = this.getBounds().c;
        if( x == null || typeof x == 'undefined' ) x = c.x;
        if( y == null || typeof y == 'undefined' ) y = c.y;
        var ox = x - c.x;
        var oy = y - c.y;
        this.move( ox, oy );
    }

    _Element.alignTo = function( target, horizontal, vertical ){
        target = target || this.canvas;
        var c = target.getBounds().c;
        this.moveTo( horizontal ? c.x : null, vertical ? c.y : null );
    }

    _Element.stick = function( target, type, margin, align ){

        var tb = target.getBounds();
        var b  = this.getBounds();

        var oh = (tb.h / 2) + (b.h / 2) + (margin || 0);
        var ow = (tb.w / 2) + (b.w / 2) + (margin || 0);

        var ah = false;
        var av = false;

        if( type == 'bottom' ){ var oy = (tb.c.y + oh); this.moveTo(null,oy); ah = true; }
        if( type == 'top' ){    var oy = (tb.c.y - oh); this.moveTo(null,oy); ah = true; }
        if( type == 'right' ){  var ox = (tb.c.x + ow); this.moveTo(ox,null); av = true; }
        if( type == 'left' ){   var ox = (tb.c.x - ow); this.moveTo(ox,null); av = true; }

        if(align) this.alignTo( target, ah, av );

    }

    _Element.resize = function( percent ){
        this.resizer(percent);
        this.resizeProperties(percent);
    }

    _Element.resizeProperties = function( percent ){

        var props = ['lineWidth', 'tl', 'bl', 'tr', 'br', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'];

        var l = props.length;

        while(l--){
            var p = props[l];
            if(typeof this[p] != 'undefined' && this[p]) this[p] = this[p] + (this[p] * percent / 100);
        }
    }

    _Element.resizeTo = function( target, toHeight, offset ){

        // default resizing to targets width
        var d = toHeight ? 'h' : 'w';

        var tb = target.getBounds();
        var ts = tb[ d ];

        var b = this.getBounds();
        var s = b[ d ];

        var o = ( ts - s ) / ( s / 100 ) + (offset || 0) ;

        //if(target == this.canvas) {
            // if(!window.el) window.el = [];
            // window.el.push({el:this,o:o,b:b,target:target});
            // console.log(o,this.getBounds().w);
        //}

        this.resize( o );

        //debugger;

    }

    _Element.clone = function(){

        var data = this.export();
        data.parent = this.parent;
        return this.canvas.create(data._type,data);

    }

    _Element.cleanExportObject = function(e){

        delete e.canvas;
        delete e.parent;
        delete e.$position;

        if( !e.shadow ){
            delete e.shadow;
            delete e.shadowBlur;    
            delete e.shadowColor; 
            delete e.shadowOffsetX;
            delete e.shadowOffsetY;
        }

        if(!e.alpha)      delete e.alpha;
        if(!e.blending)   delete e.blending;
        if(!e.rotation)   delete e.rotation;
        if(!e.lineWidth)  delete e.lineWidth;
        if(!e.stroke)     delete e.stroke;
        if(!e.bold)       delete e.bold;
        if(!e.italic)     delete e.italic;
        if(!e.strokeText) delete e.strokeText;

        if(!e.tl) delete e.tl;
        if(!e.bl) delete e.bl;
        if(!e.tr) delete e.tr;
        if(!e.br) delete e.br;

    }

    _Element.export = _Element.export || function( jsObject ){

        var e = Canvas.Utils.clone(this); 

        this.cleanExportObject(e);

        return jsObject ? e : JSON.stringify(e);

    }

    _Element.import = _Element.import || function( o ){

        if( typeof o == 'string' ){
            try{
                o = JSON.parse(o);
            }catch(e){
                o = {};
            }
        }

        for(var x in o) this[x] = o[x];

    }

    _Element.prepareSVG = function( $svg ){

        $svg.setAttribute('fill',this.fill);
        $svg.setAttribute('stroke',this.stroke);
        $svg.setAttribute('stroke-width',this.lineWidth);

    }

    _Element.toSVG = _Element.toSVG || function( domObject ){

        var $svg = this.svg( domObject );

        this.prepareSVG($svg);

        return $svg;

    }

    s.canvas.emit('create',_Element);

    return _Element;
}

Canvas.Group = function( s ){

    this.elements = [];

    this.add = function( o ){
        this.elements.push(o);
        o.parent = this;
        this.canvas.emit('add',o);
    }

    this.empty = function(){
        this.elements = [];
        this.canvas.emit('groupempty',this);
    }

    this.render = function(){
        this.elements.forEach( this._render.bind(this) );
    }

    this.iterate = function( fn, flat, ignoreSelf ){
        if(!this.$root && !ignoreSelf) fn(this);
        this.elements.forEach(function(l){
            if( l.elements && !flat ) l.iterate(fn);
            else fn(l);
        });
    }

    this.eachObjects = function( fn ){

        var l = this.elements.length;

        while(l--){
            var e = this.elements[l];
            if( e instanceof Canvas.Group ) e.eachObjects(fn);
            else{
                var v = fn(e);
                if( v ) {
                    return v;
                    break;
                };
            };
        }

    }

    this.getBounds = function(){

        var ab = this.elements.map(function(e){
            return e.getBounds();
        });

        if( !ab || !ab.length ) return null;

        var x1 = ab.map(function(e){return e.x1});
        var y1 = ab.map(function(e){return e.y1});
        var x2 = ab.map(function(e){return e.x2});
        var y2 = ab.map(function(e){return e.y2});

        var b = {
            x1 : Math.min.apply(this, x1),
            y1 : Math.min.apply(this, y1),
            x2 : Math.max.apply(this, x2),
            y2 : Math.max.apply(this, y2)
        }

        b.w = b.x2 - b.x1;
        b.h = b.y2 - b.y1;

        b.c = Canvas.Utils.middle({x:b.x1,y:b.y1},{x:b.x2,y:b.y2});

        return b;

    }

    this.getPosition = function(){

        return this.elements.map(function(e){
            return e.getPosition();
        });

    }

    this.savePosition = function(){

        return this.elements.map(function(e){
            if(e._type == 'Group') return e.savePosition();
            e.$position = e.getPosition();
        })

    }

    this.setPosition = function( ox, oy ){

        return this.elements.map(function(e){
            e.setPosition(ox,oy);
        })

    }

    this.resizer = function( percent ){
        var c = this.getBounds().c;
        return this.elements.map(function(e){
            var ec = e.getBounds().c;
            var ox = c.x - ec.x;
            var oy = c.y - ec.y;
            ox = ox + (ox * percent / 100);
            oy = oy + (oy * percent / 100);
            e.resize(percent);
            e.moveTo(c.x-ox,c.y-oy);
        })
    }

    this.export = function( jsObject ){
        var e = Canvas.Utils.clone(this);
        this.cleanExportObject(e);
        e.elements = this.elements.map(function(r){ return r.export( true ) });
        return jsObject ? e : JSON.stringify(e);
    }

    this.import = function( o ){

        if( typeof o == 'string' ){
            try{
                o = JSON.parse(o);
            }catch(e){
                o = {};
            }
        }

        for(var x in o){
            var d = o[x];
            if(x == 'elements'){
                for(var i=0;i<d.length;i++){
                    var el = d[i];
                    var obj = this[el._type].call(this,el);
                }
            }
            else this[x] = d;
        }

    }

    this.toSVG = function( domObject ){

        var g = document.createElementNS( this.canvas.SVG_NS, "g" );

        if(this.name) g.setAttribute('name',this.name);

        this.elements.forEach(function(l){
            if(l.$guide) return;
            var e = l.toSVG(true);
            g.appendChild(e);
        }.bind(this));

        return domObject ? g : g.outerHTML;

    }

    this.create = function( _type, data, preventAdd ){

        var data = data || {};

        data.canvas = this.canvas;
        data.ctx    = this.ctx;
        data._type  = _type;
        data.parent = data.parent || this.root || this;
        data.title  = data.title || _type;

        var element = new Canvas.Element(data);

        if(!preventAdd) data.parent.add(element);

        if( data.name ) this.canvas['_'+data.name] = element;

        return element;
    }

    var types = ['Group','Line','Box','Circle','Text','Shape'];

    for(var i=0;i<types.length;i++){
        var t = types[i];
        this[t] = function( type, data, preventAdd ){
            var data = data || {};
            data.parent = this;
            var o = this.create(type,data,preventAdd);
            return o;
        }.bind(this,t)
    }

}

Canvas.Circle = function(){

    this.cx = 0;
    this.cy = 0;
    this.r  = 0;

    this.fill = '#333';

    this.render = function(ctx){

        if(this.r < 0) return console.warn('Circle Radius Lower Than Zero');

        ctx.arc(this.cx, this.cy, this.r, 0, 2 * Math.PI);

    }

    this.getBounds = function(){
        var b = {
            x1: this.cx - this.r,
            y1: this.cy - this.r,
            x2: this.cx + this.r,
            y2: this.cy + this.r
        };
        b.w = b.x2 - b.x1;
        b.h = b.y2 - b.y1;
        b.c = Canvas.Utils.middle({x:b.x1,y:b.y1},{x:b.x2,y:b.y2});
        return b;
    }

    this.getPosition = function(){
        return {
            cx : this.cx,
            cy : this.cy
        }
    }

    this.setPosition = function( ox, oy ){
        this.cx = this.$position.cx + ox;
        this.cy = this.$position.cy + oy;
    }

    this.resizer = function( percent ){
        this.r = this.r + (this.r * percent / 100);
    }

    this.svg = function(){

        var e = document.createElementNS( this.canvas.SVG_NS, "circle" );

        e.setAttribute('cx',this.cx);
        e.setAttribute('cy',this.cy);
        e.setAttribute('r',this.r);

        return e;

    }

}

Canvas.Box = function( s ){

    this.x = 0;
    this.y = 0;
    this.w = 0;
    this.h = 0;

    this.tl = 0;
    this.bl = 0;
    this.tr = 0;
    this.br = 0;

    this.render = function(ctx) {

        with(this){
            ctx.moveTo(x + tl, y);
            ctx.lineTo(x + w - tr, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
            ctx.lineTo(x + w, y + h - br);
            ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
            ctx.lineTo(x + bl, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
            ctx.lineTo(x, y + tl);
            ctx.quadraticCurveTo(x, y, x + tl, y);
        }

    }

    this.getBounds = function(){

        var b = {
            x1: this.x,
            y1: this.y,
            x2: this.x + this.w,
            y2: this.y + this.h
        }

        b.w = b.x2 - b.x1;
        b.h = b.y2 - b.y1;

        b.c = Canvas.Utils.middle({x:b.x1,y:b.y1},{x:b.x2,y:b.y2});

        return b;
    }

    this.getPosition = function(){
        return {
            x: this.x,
            y: this.y
        }
    }

    this.setPosition = function (ox, oy) {
        this.x = this.$position.x + ox;
        this.y = this.$position.y + oy;
    }

    this.resizer = function( percent ){
        var c = this.getBounds().c;
        this.w = this.w + (this.w * percent / 100);
        this.h = this.h + (this.h * percent / 100);
        this.moveTo(c.x,c.y);
    }

    this.svg = function(){

        var e = document.createElementNS( this.canvas.SVG_NS, "rect" );

        //<rect x="60" y="10" rx="10" ry="10" width="30" height="30" fill stroke stroke-width/>
        e.setAttribute('x',this.x);
        e.setAttribute('y',this.y);
        e.setAttribute('width',this.w);
        e.setAttribute('height',this.h);

        return e;

    }

}

Canvas.Line = function(){

    this.x1 = 0;
    this.y1 = 0;
    this.x2 = 0;
    this.y2 = 0;

    this.stroke = '#333';
    this.lineWidth = 1;

    this.render = function(ctx) {
        ctx.moveTo(this.x1 + 0.5, this.y1 + 0.5);
        ctx.lineTo(this.x2 + 0.5, this.y2 + 0.5);
    }

    this.getBounds = function(){

        var b = {
            x1: Math.min(this.x1, this.x2),
            y1: Math.min(this.y1, this.y2),
            x2: Math.max(this.x1, this.x2),
            y2: Math.max(this.y1, this.y2)
        }

        b.w = b.x2 - b.x1;
        b.h = b.y2 - b.y1;

        b.c = Canvas.Utils.middle({x:b.x1,y:b.y1},{x:b.x2,y:b.y2});

        return b;

    }

    this.getPosition = function(){
        return {
            x1: this.x1,
            y1: this.y1,
            x2: this.x2,
            y2: this.y2
        }
    }

    this.setPosition = function (ox, oy) {
        this.x1 = this.$position.x1 + ox;
        this.y1 = this.$position.y1 + oy;
        this.x2 = this.$position.x2 + ox;
        this.y2 = this.$position.y2 + oy;
    }

    this.resizer = function( percent ){
        var c = this.getBounds().c;
        var s = (percent / 100);
        this.x1 += this.x1 * s;
        this.y1 += this.y1 * s;
        this.x2 += this.x2 * s;
        this.y2 += this.y2 * s;
        this.moveTo(c.x,c.y);
    }

    this.svg = function(){

        var e = document.createElementNS( this.canvas.SVG_NS, "line" );

        //<line x1="10" x2="50" y1="110" y2="150"/>
        e.setAttribute('x1',this.x1);
        e.setAttribute('y1',this.y1);
        e.setAttribute('x2',this.x2);
        e.setAttribute('y2',this.y2);

        return e;

    }

}

Canvas.Shape = function(){

    this.points = [];

    this.stroke = '#333';
    this.fill   = 'rgba(255,255,255,0.5)';

    this.render = function (ctx) {

        if(!this.points.length) return;

        for(var i=0;i<this.points.length;i++){
            var p = this.points[i];
            if(!i) ctx.moveTo(p.x,p.y);
            else {
                if( p.c1x != null && p.c2x == null ){
                    ctx.quadraticCurveTo(p.c1x, p.c1y, p.x, p.y);
                }
                if (p.c1x != null && p.c2x != null) {
                    ctx.bezierCurveTo(p.c1x, p.c1y, p.c2x, p.c2y, p.x, p.y);
                }
                else ctx.lineTo(p.x,p.y);
            }
            
        }

    }

    this.getBounds = function(){

        var xs = this.points.map(function (p){ return p.x});
        var ys = this.points.map(function (p) { return p.y });

        var mix = Math.min.apply(this, xs);
        var miy = Math.min.apply(this, ys);
        var mx = Math.max.apply(this, xs);
        var my = Math.max.apply(this, ys);

        var b = {
            x1: mix,
            y1: miy,
            x2: mx,
            y2: my
        }

        b.w = b.x2 - b.x1;
        b.h = b.y2 - b.y1;

        b.c = Canvas.Utils.middle({x:b.x1,y:b.y1},{x:b.x2,y:b.y2});

        return b;

    }

    this.getPosition = function(){
        return JSON.parse(JSON.stringify(this.points));
    }

    this.setPosition = function(ox,oy){

        this.points = JSON.parse(JSON.stringify(this.$position));

        this.points.forEach(function(p){
            if(p.x) p.x = p.x + ox;
            if(p.y) p.y = p.y + oy;
            if(p.c1x) p.c1x = p.c1x + ox;
            if(p.c1y) p.c1y = p.c1y + oy;
            if(p.c2x) p.c2x = p.c2x + ox;
            if(p.c2y) p.c2y = p.c2y + oy;
        });

    }

    this.resizer = function( percent ){
        var c = this.getBounds().c;
        var s = (percent / 100);
        this.points.forEach(function(p){
            p.x += p.x * s;
            p.y += p.y * s;
            if(p.c1x != null){
                p.c1x += p.c1x * s;
                p.c1y += p.c1y * s;
            }
            if(p.c2x != null){
                p.c2x += p.c2x * s;
                p.c2y += p.c2y * s;
            }
        });
        this.moveTo(c.x,c.y);
    }

    this.svg = function(){

        var e = document.createElementNS( this.canvas.SVG_NS, "path" );

        //<path d="M20,230 Q40,205 50,230 T90,230" fill="none" stroke="blue" stroke-width="5"/>

        return e;

    }

}

Canvas.Text = function(){

    this.x = 0;
    this.y = 0;

    this.fill         = '#333';
    this.bold         = false;
    this.italic       = false;
    this.strokeText   = false;
    this.size         = 30;
    this.font         = 'Arial';
    this.text         = 'Hello World';

    this.render = function(ctx) {
        ctx.textBaseline = this.textBaseline || 'top';
        ctx.fillText( this.text, this.x, this.y - 5 );
        if(this.strokeText) ctx.strokeText( this.text, this.x, this.y - 5 );
    }

    this.getFont = function(){
        return (this.bold ? 'bold' : '') + ' ' + (this.italic ? 'italic' : '') + ' ' + this.size + 'px ' + this.font
    }

    this.measure = function(){
        this.ctx.font = this.getFont();
        return {
            w : this.ctx.measureText(this.text).width,
            h : Canvas.Utils.fontHeight(this.getFont(),this.text)
        };
    }

    this.getBounds = function(){

        var m = this.measure();

        var b = {
            x1 : this.x,
            y1 : this.y,
            x2 : this.x + m.w,
            y2 : this.y + m.h
        }

        b.w = b.x2 - b.x1;
        b.h = b.y2 - b.y1;

        b.c = Canvas.Utils.middle({x:b.x1,y:b.y1},{x:b.x2,y:b.y2});

        return b;
    }

    this.getPosition = function(){
        return {
            x : this.x,
            y : this.y
        }
    }

    this.setPosition = function (ox, oy) {
        this.x = this.$position.x + ox;
        this.y = this.$position.y + oy;
    }

    this.resizer = function( percent ){
        var c = this.getBounds().c;
        this.size = this.size + (this.size * percent / 100);
        this.moveTo(c.x,c.y);
    }

    this.svg = function(){

        var e = document.createElementNS( this.canvas.SVG_NS, "text" );

        //<text x="20" y="35">My</text>
        // <textPath xlink:href="#curve">
        //     Curves Ahead
        // </textPath>

        e.setAttribute('x',this.x);
        e.setAttribute('y',this.y);

        e.setAttribute('font-size',this.size);
        e.setAttribute('font-family',this.font);
        e.setAttribute('dominant-baseline',this.textBaseline||'hanging');

        if(this.bold) e.setAttribute('font-weight','bold');
        if(this.italic) e.setAttribute('font-style','italic');

        e.innerHTML = this.text;

        if(this.style) e.innerHTML += '<style>'+this.style+'</style>';

        return e;

    }

}

Canvas.Utils = {

    distance : function (v1, v2) { return Math.sqrt(Math.pow((v1.x - v2.x), 2) + Math.pow((v1.y - v2.y), 2)) },

    middle   : function (v1, v2) { return { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 }},

    isPointInBounds : function(x,y,bounds){
        return x > bounds.x1 && x < bounds.x2 && y > bounds.y1 && y < bounds.y2;
    },

    rectanglesIntersect : function(r1, r2) {
        return !(r2.x1 > r1.x2 || r2.x2 < r1.x1 || r2.y1 > r1.y2 || r2.y2 < r1.y1);
    },

    rgbToHex : function(r,g,b){
        if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    },

    clone : function( o ){

        var cache = [];

        var d = JSON.parse(JSON.stringify(o, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) return;
                cache.push(value);
            }
            return value;
        }));

        cache = null; // Enable garbage collection

        return d;

    },

    getHexColor : function(c) {
        var a = document.createElement('div');
        a.style.color = c;
        var colors = window.getComputedStyle( document.body.appendChild(a) ).color.match(/\d+/g).map(function(a){ return parseInt(a,10); });
        document.body.removeChild(a);
        return (colors.length >= 3) ? '#' + (((1 << 24) + (colors[0] << 16) + (colors[1] << 8) + colors[2]).toString(16).substr(1)) : false;
    },

    getRandomHSL : function( h, s, l ){
        color = 'hsl(' + ( h || Math.random() * 360) + ', '+(s||100)+'%, '+(l||50)+'%)';
        return color;
    },

    fontHeight : function( fontStyle, text ) {

        this.heightCache = this.heightCache || {};

        var result = this.heightCache[fontStyle];

        if (!result) 
        {
            var fontDraw = document.createElement("canvas");
            var ctx = fontDraw.getContext('2d');
            fontDraw.width = 1000;
            fontDraw.height = 1000;
            ctx.fillRect(0, 0, fontDraw.width, fontDraw.height);
            ctx.textBaseline = 'top';
            ctx.fillStyle = 'white';
            ctx.font = fontStyle;
            ctx.fillText(text, 0, 0);
            var pixels = ctx.getImageData(0, 0, fontDraw.width, fontDraw.height).data;
            var start = -1;
            var end = -1;
            for (var row = 0; row < fontDraw.height; row++) 
            {
            for (var column = 0; column < fontDraw.width; column++) 
            {
                var index = (row * fontDraw.width + column) * 4;
                if (pixels[index] === 0) {
                if (column === fontDraw.width - 1 && start !== -1) {
                    end = row;
                    row = fontDraw.height;
                    break;
                }
                continue;
                }
                else 
                {
                if (start === -1) 
                {
                    start = row;
                }
                break;
                }
            }
            }
            result = end - start;
            this.heightCache[fontStyle] = result;
        }
        return result;
    }

}
