/*
	modular js
	created by : eldad eliyahu levi
	version    : 1.4
	license    : mit
*/

modular = {

	settings : {

		modules : {

			extension : '.html',
			folder    : ''

		},

		post : {

			prefix : ''

		}

	},

	debug : {
		enabled : true,
		modules : []
	},

	global : {},

	modules : [],

	cache : [],

	events : [],

	dependencies : [],

	customAttributes : {},

	get : function( moduleName ){
		var r = false;
		for(var i=0;i<this.modules.length;i++) if( this.modules[i].$$system.name == moduleName ) r = this.modules[i];
		return r;
	},

	$ : function(q){
		return document.querySelector(q);
	},

	bootstrap : function( selector, fn ){
		if(!selector) selector = 'body';
		var el = modular.$(selector);
		return new this.Module({
			el : el,
			fn : fn
		});
	},

	Module : function( options ){

		var options = options || {};

		var el = options.el || document.createElement('module');

		el.isModule = true;

		if( options.html ) el.innerHTML = options.html;

		this.$$system = {

			modules : [],

			el   : el,
			url  : options.url  || el.getAttribute('url'),
			name : options.name || el.getAttribute('name'),

			fn : options.fn,

			isLoaded : false,
			onload   : options.onload || el.getAttribute('onload'),

			templates : {}

		}

		this.$$params = {}

		for(var i=0;i<el.attributes.length;i++){
			var attr = el.attributes[i];
			this.$$params[attr.name] = attr.value;
		}

		el.module = this;

		if( this.$$system.url )  el.setAttribute( 'url', this.$$system.url );
		if( this.$$system.name ) el.setAttribute( 'name', this.$$system.name );

		this.$$name = this.$$system.name;

		this.$el     = el;
		this.$data   = options.data || el.getAttribute('data');

		this.$parent = options.parent;
		this.$global = modular.global;

		if( el.getAttribute('data') ){
			var scope = options.parent || this;
			this.$data = modular.$eval( el.getAttribute('data'), scope, options.extra );
		}

		this.$render = function(){
			modular.$render.call(this);
		}

		this.$remove = function()
		{
			var i = this.$$system.modules.length;
			while(i--) this.$$system.modules[i].$remove();
			var p = this.$parent;
			this.$el.remove();
			while(p){
				p.$$system.modules.splice( p.$$system.modules.indexOf(this), 1); 
				p = p.parent;
			}
			modular.modules.splice( modular.modules.indexOf(this),1 );
		}

		this.$ = function( selector ){
			return this.$el.querySelector(selector);
		}

		this.$get = function( moduleName ){ return modular.get(moduleName); }

		this.$appendTo = function( el ){
			el.appendChild(this.$el);
		}

		this.$getTemplate = function( templateName, returnHTML ){
			var template = null;
			if( this.$$system.templates[templateName] && 
				this.$$system.templates[templateName].cloneNode )
				template = this.$$system.templates[templateName].cloneNode(true);
			if(template) template.removeAttribute('template');
			return returnHTML ? template.outerHTML : template;
		}

		modular.modules.push(this);

		if( this.$parent ){
			this.$parent.$$system.modules.push(this);
		}

		this.$$system.isLoading = true;

		if( el.innerHTML ){
			modular.processModule( this, el.innerHTML );
			return;
		}

		if(modular.debug.enabled) modular.debug.modules.push(this.$$name);

		modular.load(this);

		return this;

	},

	$eval : function( expression, module, extra ){
		var e = extra;
		if( e && e.length ){
			for(var i=0;i<e.length;i++){
				var item = e[i];
				if(module[item.name]!=undefined) item.old = module[item.name];
				module[item.name] = item.data;
			}
		}
		var $$$v = '';
		with(module){
			try{ $$$v = eval(expression); }
			catch(e){ $$$v = ''; }
		}
		if( e && e.length ) for(var i=0;i<e.length;i++){
			var item = e[i];
			if(item.old!=undefined) module[item.name] = item.old;
			else delete module[item.name];
		}
		return $$$v;
	},

	$render : function( el, module, extra ){

		var el     = el     || this.$el;
		var module = module || this;
		var extra  = extra  || [];

		module.$$params = {}

		for(var i=0;i<el.attributes.length;i++){
			var attr = el.attributes[i];
			module.$$params[attr.name] = attr.value;
		}

		if(module.$onrenderstart) module.$onrenderstart();

		replacer = function($$a,$$b,$$c){
			return modular.$eval($$b,module,extra);
		}

		replace = function( node ){
			node.textContent = node.textContent.replace(/{{\s*([^}]+)\s*}}/g,replacer);
		}

		replaceAttr = function( attr ){
			attr.value = attr.value.replace(/{{\s*([^}]+)\s*}}/g,replacer)
		}

		isActiveInput = function(){
			return ( document.activeElement && document.activeElement.tagName == 'INPUT' );
		}

		bindToggle = function( prop, node, module ){
			node.onclick = function(){
				var v = modular.$eval( prop, module, extra );
				var e = v ? 'false' : 'true';
				modular.$eval(prop+'='+e,module,extra);
				module.$render();
			}
		}

		bindEvent = function( attr, node, el, module ){
			var evt = attr.name.substring(1,attr.name.length);
			node[evt] = function(e){
				extra = extra || [];
				if(extra) extra.push({name:'$event',data:e});
				modular.$eval(attr.value,module,extra);
			};
		}

		getSelectionText = function() {
		    var t = '';
		    if (window.getSelection) t = window.getSelection().toString();
		    else if (document.selection && document.selection.type != "Control") t = document.selection.createRange().text;
		    return t;
		}

		bindModel = function( node, model, module, extra ){

			if( getSelectionText() && isActiveInput() ) {return;}

			var v = modular.$eval(model,module,extra);

			if(v!=node.value && node.isPressed) return;

			node.value = v||'';

			if(node.type=='checkbox') node.checked = v?true:false;

			if(node.isBound) return;

			node.isBound = true;

			if( node.tagName == 'INPUT' ){
				if(!node.okd && node.onkeydown) node.okd = node.onkeydown;
				if(!node.oku && node.onkeyup) node.oku = node.onkeyup;
				node.onkeydown = function(e){
					this.isPressed = true;
					if(node.okd) node.okd(e);
				}
				node.onkeyup = function(e){
					this.isPressed = false;
					modular.$eval(model+'="'+node.value+'"',module,extra)
					if(node.oku) node.oku(e);
					if(node.onchange) node.onchange(e);
					modular.$render.call(module);
				}
				if(node.type=='checkbox'){
					node.onchange = function(e){
						modular.$eval(model+'='+node.checked,module,extra);
						modular.$render.call(module);	
					}
				}
			}

			if( node.tagName == 'SELECT' ){
				window.$e = node;
				if(!node.oc && node.onchange) node.oc = node.onchange;
				node.onchange = function(e){
					modular.$eval(model+'="'+node.value+'"',module,extra);
					modular.$render.call(module);
					modular.$eval(model+'="'+node.value+'"',module,extra);
					if(node.oc) node.oc(e);
				}
			}
		}

		getFocusData = function( node ){

			// needs fixing
			if( node.contains( document.activeElement ) ){
				var p = document.activeElement.parentElement;
				while(!p.$data){
					p = p.parentElement;
				}
				return {
					node  : node,
					model : document.activeElement.getAttribute('model')
				}
			}

			return false;

		}

		repeater = function( node, repeat, module, extra ){

			//debugger;

			if( getSelectionText() && isActiveInput() ) {
				return true;
			}

			var $f = getFocusData(node);

			if( node.originalHTML ) node.innerHTML = node.originalHTML;
			else node.originalHTML = node.innerHTML;
			if( node.clones ){
				for(var i=0;i<node.clones.length;i++)
				{
					if(!$f) $f = getFocusData(node.clones[i]);
					node.clones[i].remove();
				}
				node.clones = [];
			}

			node.clones = [];
			
			var s = repeat.split(' ');
			var child = s[0];
			var group = s[2];

			var $$arr = null;

			node.style.display = '';

			with(module){ try{
				$$arr = modular.$eval(group,module,extra);
			} catch(e){ $$arr = ''; }; }

			if(!$$arr || ($$arr.constructor == Array.prototype.constructor) && !$$arr.length ){
				node.style.display = 'none';
				return;
			}

			var $$c = 0;

			for(var x in $$arr) $$c++;

			if(!$$c) return;

			var next = node;
			var all = [];

			node.removeAttribute('for');

			for(var i=0;i<node.attributes.length;i++){
				var attr = node.attributes[i];
				if(attr.originalValue) attr.value = attr.originalValue;
			}

			var idx = 0;

			for(var i in $$arr)
			{
				var o = $$arr[i];

				if(idx){
					var clone = node.cloneNode(true);
					clone.isClone = true;
					next.parentNode.insertBefore(clone, next.nextSibling);
					next = clone;	
					node.clones.push(clone);
				}

				next.$data = o;

				all.push({
					el : next,
					data : [{name:child,data:o},{name:'$index',data:i}]
				});

				idx++;

			}

			var $focus = null;
			var $extra = null;

			for(var i=0;i<all.length;i++){
				var item = all[i];
				if($f && $f.node.$data == item.data[0].data ) var $focus = i;
				if(extra) $extra = extra.concat(item.data);
				modular.$render.call(module,item.el,module,$extra);
				item.el.repeated = true;
				$extra = null;
			}

			if( $focus != null ){
				all[$focus].el.querySelector('[model="'+$f.model+'"]').focus();
			}

			return true;

		}

		isTrue = function( expression ){
			return modular.$eval(expression,module,extra);
		}

		saveTemplate = function( node ){
			module.$$system.templates[ node.getAttribute('template') ] = node.cloneNode(true) ;
			node.remove();
		}

		function eachChildNodes( childNodes, fn, module, extra ){

			for(var i=0;i<childNodes.length;i++){

				var node = childNodes[i];

				if( node.tagName == 'SCRIPT' ) continue;
				if( node.tagName == 'STYLE' )  continue;
				if( node.tagName == 'XMP')     continue;

				if( node.tagName == 'OPTION' && !node.repeated && node.isClone ) continue;

				if( node.isClone ) continue;

				fn( node, false, module, extra );

				if( node.tagName == 'OPTION' && node.repeat ){
					if(node.parentElement)
						bindModel(node.parentElement,node.parentElement.getAttribute('model'),module,extra);
				}

				if( node.tagName == 'MODULE' ){
					var m = node.module;
					if( m && (m.$$system.isLoaded || m.$$system.isLoading) ){
						m.$render(); // keep an eye on that
						continue;
					}else{
						var p = el;
						while(p.tagName!='MODULE'){
							if(p.parentElement) p = p.parentElement;
							else break;
						};
						var module = new modular.Module({
							el     : node, 
							parent : p.module, 
							extra  : extra
						});
						continue;
					}
				}

				if( node.untrue ) continue;
				if( node.repeat )  continue;
				if( node.isClone ) continue;

				if( node.getAttribute && node.getAttribute('template') ) continue;

				eachChildNodes( node.childNodes, fn, module, extra );

			}

		}

		parse = function( node, repeatEl, module, extra ){

			if( node.getAttribute && node.getAttribute('for') ) node.repeat = node.getAttribute('for');

			if( node.hasAttribute && node.hasAttribute('link') ) module[node.getAttribute('link')] = node;

			if( node.hasAttribute && node.hasAttribute('toggle') ) bindToggle( node.getAttribute('toggle'), node, module );

			for(var attr in modular.customAttributes){
				if( node.hasAttribute && node.hasAttribute(attr) ) modular.customAttributes[attr](node.getAttribute(attr), node, module);
			}

			if(!node.originalHTML) node.originalHTML = node.innerHTML;

			// if
			if( node.nodeType == 8 && node.If ){
				var comment = node;
				var bool = isTrue( comment.If );
				if( bool ){
					comment.parentElement.insertBefore(comment.oldNode,comment);
					comment.oldNode.innerHTML = comment.originalHTML;
					comment.oldNode.originalHTML = comment.originalHTML;
					comment.remove();
					var comment = comment.oldNode;
					eachChildNodes( comment.childNodes, parse, module, extra );
				}
				ignoreIf = true;
			}else{
				var If = node&&node.getAttribute&&node.getAttribute('if');
				if( If ){
					var bool = isTrue( If );
					if(!bool){
						if(node.originalHTML) node.innerHTML = node.originalHTML;
						var comment = document.createComment('if');
						comment.If = If;
						comment.oldNode = node.cloneNode(true);
						comment.originalHTML = node.originalHTML;
						node.parentElement.insertBefore(comment,node);
						node.remove();
						node.untrue = true;
						return;
					}
				}	
			}

			// attributes
			if( node.attributes && (!node.repeat||repeatEl) ) for(var i=0;i<node.attributes.length;i++){

				var attr = node.attributes[i];
				var name = attr.name;

				if(attr.originalValue) attr.value = attr.originalValue;
				else attr.originalValue = attr.value;
				var value = attr.value;

				if(value.indexOf('{{')!=-1) replaceAttr(attr,node);

				if(name[0]=='$') bindEvent(attr,node,el,module,extra);
				if(name == 'model') bindModel(node,value,module,extra);
				if(name == 'template' && value){
					saveTemplate(node);
					return;
				}

			}

			// repeaters
			if( !repeatEl && node.repeat && !node.isClone ){
				
				if(!repeater(node,node.repeat,module,extra)) node.innerHTML = '';
				return;
			}

			if( node.nodeType==3 ){
				if(node.originalText) node.textContent = node.originalText;
				else node.originalText = node.textContent;
				replace(node);
			}

		}

		if( extra.length ) parse(el,true,module,extra);

		eachChildNodes( el.childNodes, parse, module, extra );

		// autobind inner modules

		if( this.$$system && this.$$system.modules.length ){
			for(var i=0;i<this.$$system.modules.length;i++){
				var m = this.$$system.modules[i];
				if( m.data ){
					m.module.$data = modular.$eval(m.data,this.$$system.module)
				}
				//modular.$render.call(m.module);
			}
		}

		if(module.$onrender) module.$onrender();

	},

	attribute : function(name,fn){
		modular.customAttributes[name] = fn;
	},

	getFromCache : function( module ){
		for(var i=0;i<modular.cache.length;i++){
			var c = modular.cache[i];
			if(c.url == module.$$system.url) return c;
		}
		return false;
	},

	processModule : function( module, html ){

		module.$el.innerHTML = html;

		var links = module.$el.querySelectorAll('[link]');
		for(var i=0;i<links.length;i++){
			var o = links[i];
			module[o.getAttribute('link')] = o;
		}

	    var script = module.$el.querySelector('script');

	    if(script) script = script.innerHTML;

	    var fn = module.$$system.fn || new Function(script);

	    fn.call(module);

	    var d = this.getDependencies(module.$$system.name);

	    if(d){
	    	for(var i=0;i<d.queue.length;i++) d.queue[i].call(null,module);
	    }

	    module.$$system.isLoaded = true;
	    if(module.onready) module.onready();
	    module.$el.module = module;

	    delete module.$$system.isLoading;

	    modular.$render.call(module);

	    if(module.onload && module.$parent && module.$parent[module.onload] ){
	    	module.$parent[module.onload](module);
	    }

	},

	load : function( module ){

		var cached = modular.getFromCache(module);	

		if( cached ){
			setTimeout(function(){
				modular.processModule(module,cached.html);
			},1);
			return;
		}

		if( !module.$$system.url ){
			var html = module.$el.innerHTML;
			modular.processModule( module, html );
			modular.cache.push({
		    	html   : html,
		    	url    : module.$$system.url
		    });
			return;
		}

		var url = modular.settings.modules.folder + module.$$system.url + modular.settings.modules.extension;
		
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onreadystatechange= function() {
		    if (this.readyState!==4) return;

		    modular.processModule( module, this.responseText );

		    modular.cache.push({
		    	html   : this.responseText,
		    	url    : module.$$system.url
		    });

		};
		xhr.send();

	},

	getEvent : function( eventName ){
		for(var i=0;i<this.events.length;i++) if(this.events[i].name == eventName) return this.events[i];
	},

	on : function( eventName, callback ){
		var e = this.getEvent(eventName);
		if(e) e.listeners.push(callback);
		else this.events.push({
			name      : eventName,
			listeners : [callback]
		});
	},

	off : function( eventName ){
		var e = this.getEvent(eventName);
		if(e) this.events.splice(this.events.indexOf(e),1);
	},

	emit : function( eventName ){
		var e = this.getEvent(eventName);
		if(!e) return;
		for(var i=0;i<e.listeners.length;i++){
			var listener = e.listeners[i];
			var args = Array.prototype.slice.call(arguments);
			listener.apply(null,args.slice(1,args.length));
		}
	},

	getDependencies : function( moduleName ){
		for(var i=0;i<this.dependencies.length;i++) if(this.dependencies[i].moduleName == moduleName) return this.dependencies[i];
	},

	when : function( moduleName, callback ){
		var module = this.get(moduleName);
		if( module && module.$$system.isLoaded ) callback(module);
		else{
			var d = this.getDependencies(moduleName);
			if(d) d.queue.push(callback);
			else this.dependencies.push({
				moduleName : moduleName,
				queue : [callback]
			});
		}
	},

	ajax : {

		serialize : function(obj, prefix) {
			var str = [];
			for(var p in obj) {
				if (obj.hasOwnProperty(p)) {
				  var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
				  str.push(typeof v == "object" ?
				    this.serialize(v, k) :
				    encodeURIComponent(k) + "=" + encodeURIComponent(v));
				}
			}
			return str.join("&");
		},

		xhr : function () {
		    if (typeof XMLHttpRequest !== 'undefined') return new XMLHttpRequest();

		    var versions = [
		        "MSXML2.XmlHttp.6.0",
		        "MSXML2.XmlHttp.5.0",
		        "MSXML2.XmlHttp.4.0",
		        "MSXML2.XmlHttp.3.0",
		        "MSXML2.XmlHttp.2.0",
		        "Microsoft.XmlHttp"
		    ];

		    var xhr;

		    for (var i = 0; i < versions.length; i++) {
		        try {
		            xhr = new ActiveXObject(versions[i]);
		            break;
		        } catch (e){}
		    }
		    return xhr;
		},

		send : function (url, callback, data) {
		    var x = this.xhr();
		    x.open('post', url, true);
		    x.onreadystatechange = function () {
		        if (x.readyState == 4) {
		            callback(JSON.parse(x.responseText));
		        }
		    };
		    x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		    x.send(data)
		}
	},

	post : function( url, callback, data ){
	    this.ajax.send( modular.settings.post.prefix+url, callback, this.ajax.serialize(data))
	},

	extend : function(o, c){
	    if (o == null || typeof o != "object") return o; var oc = o.constructor;
	    if (oc != Object && oc != Array) return o;
	    if (oc == Date || oc == RegExp || oc == Function ||
	        oc == String || oc == Number || oc == Boolean)
	        return new o.constructor(o);
	    c = c || new o.constructor();
	    for (var name in o) c[name] = typeof c[name] == "undefined" ? this.extend(o[name], null) : c[name];
	    return c;
	},

	bind : function(fn,ctx){
		var a = [].splice.call(arguments,0); a.splice(0,2);
		return function(){
			var b = [].splice.call(arguments,0);
			fn.apply(ctx,b.concat(a));
		}
	}

}

Element.prototype.modular = function(fn){
	return new modular.Module({
		el: this,
		fn: fn
	});
}

var currentScript = document.currentScript || (function() {
	var scripts = document.getElementsByTagName('script');
	return scripts[scripts.length - 1];
})();

if(currentScript && currentScript.hasAttribute && currentScript.hasAttribute('autoload') ){
	var autoload = currentScript.getAttribute('autoload');
	document.addEventListener('DOMContentLoaded',function(){
		modular.bootstrap(autoload);
	})
}