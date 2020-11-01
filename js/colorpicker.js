HTMLElement.prototype.colorpicker = function(s){

	var s = s || {};

	var size = s.size || 100;

	var el = function(type){return document.createElement(type);}

	HTMLElement.prototype.css = function(css){ 
		for(x in css) this.style[x] = css[x]; 
		return this;
	}

	this.holder = el('div');

	this.holder.style.padding = '10px';

	this.pickerHolder = el('div');

	this.pickerHolder.css({
		position : 'relative',
		float    : 'left'
	});

	this.picker = el('canvas');
	this.pickerCtx = this.picker.getContext('2d');

	this.picker.css({
		border : '1px solid #C9C9C9',
		width  : size+'px',
		height : size+'px',
		cursor : 'crosshair'
	});

	this.picker.setAttribute('width',size+'px');
	this.picker.setAttribute('height',size+'px');

	this.pickerTarget = el('div').css({
		position : 'absolute',
		cursor : 'crosshair'
	});

	this.colorHolder = el('div');
	this.colorHolder.css({
		position : 'relative',
		float    : 'left',
		marginLeft : '7px',
		cursor   : 'pointer'
	});

	this.color    = el('canvas');
	this.colorCtx = this.color.getContext('2d');

	var colorSize = (size / 10) + 5;

	this.color.css({
		float  	   : 'left',
		width  	   : colorSize+'px',
		height 	   : (size+2)+'px'
	});

	this.colorKnob = el('div').css({
		position 	 : 'absolute',
		width 		 : colorSize+'px',
		height 		 : '2px',
		top 		 : (size/2)+'px',
		border		 : '1px solid #000',
		borderRadius : '3px',
		right 		 : '-1px'
	});

	this.clearer = el('div').css({ clear : 'both' });
	

	this.alphaHolder = el('div').css({
		position : 'relative'
	});

	this.alpha = el('canvas').css({
		width  : size + 'px',
		height : (colorSize/1.5) + 'px',
		border : '1px solid #ccc'
	});

	this.alphaCtx = this.alpha.getContext('2d');

	this.alpha.setAttribute('width',size+'px');
	this.alpha.setAttribute('height',(colorSize/1.5)+'px');

	this.alphaKnob = el('div').css({
		position   : 'absolute',
		height     : (colorSize/1.5) + 'px',
		width      : '3px',
		border     : '1px solid #000',
		top        : '0px',
		background : '#000',
		left       : size+'px',
		cursor     : 'pointer'
	});

	this.colorName = el('input').css({
		marginTop  : '0px',
		width      : size+'px',
		background : 'none',
		border 	   : 'none',
		fontSize   : '10px'
	});

	this.colorName.setAttribute('readonly','readonly');

	this.pickerHolder.appendChild(this.picker);
	this.pickerHolder.appendChild(this.pickerTarget);

	this.colorHolder.appendChild(this.color);
	this.colorHolder.appendChild(this.colorKnob);

	if(s.rgba) {this.alphaHolder.appendChild(this.alpha);
	this.alphaHolder.appendChild(this.alphaKnob);}

	this.holder.appendChild(this.pickerHolder);
	this.holder.appendChild(this.colorHolder);
	this.holder.appendChild(this.clearer);
	this.holder.appendChild(this.alphaHolder);
	this.holder.appendChild(this.colorName);

	var su = 100;

	var alphaCtx = this.alphaCtx;

	function shadeRGBColor(color, percent) {
	    var f=color.split(","),t=percent<0?0:255,p=percent<0?percent*-1:percent,R=parseInt(f[0].slice(4)),G=parseInt(f[1]),B=parseInt(f[2]);
	    return "rgb("+(Math.round((t-R)*p)+R)+","+(Math.round((t-G)*p)+G)+","+(Math.round((t-B)*p)+B)+")";
	}

	function hslToRgb(h, s, l){
	    var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        var hue2rgb = function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }

	    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	function draw(ctx, hue){
		var s = size;
		var rgb = hslToRgb(hue/360 * 1,1,0.5);
		var c = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
		for(var i=0;i<s;i++){
			var p = i/s;
			var r = i/s * 255;
			grad = ctx.createLinearGradient(0, 0, 0, s);
	        grad.addColorStop(0, shadeRGBColor(c,1-p) );
	        grad.addColorStop(1, 'black');
	        ctx.fillStyle = grad;
	        ctx.fillRect(i, 0, i+1, size);
		}
	}

	function drawAlpha(ctx,r,g,b){
		var grad = ctx.createLinearGradient(0, 0, size,(size/1.5));
	        grad.addColorStop(0, 'rgba('+r+','+g+','+b+',0)');
	        grad.addColorStop(1, 'rgba('+r+','+g+','+b+',1)');
	        ctx.fillStyle=grad;
	        ctx.fillRect(0, 0, size,(size/1.5));
	}

	function line(dc,color,x1,y1,x2,y2)
	{
	  dc.strokeStyle = color;    // set the color
	  dc.beginPath();            // create the path
	  dc.moveTo(x1,y1);
	  dc.lineTo(x2,y2);
	  dc.stroke();               // stroke along the path
	}

	function hslColor(h,s,l)
	{
	  return 'hsl(' + h + ',' + s + '%,' + l + '%)';
	}

	var h = 150;
	var w = 500;

	for (var i = 0; i < h; ++i) {
	  var ratio = i/h;
	  var hue = Math.floor(360*ratio);
	  var sat = 300;
	  var lum = 50;
	  line(this.colorCtx, hslColor(hue,sat,lum), 0, 0+i, 0+w, i);
	}

	draw(this.pickerCtx,360/2);

	var pickerCtx = this.pickerCtx;
	var alphaKnob = this.alphaKnob;
	var colorPress = false;
	var alphaPress = false;
	var that = this;

	var currentAlpha = 1;

	var colorChoose = function(e,oy){
		var t = (e.offsetY-oy);
		if(t <= -3 ) return;
		if(t >= that.color.clientHeight) return;
		that.colorKnob.css({
			position     : 'absolute',
			width        : colorSize + 'px',
			height       : '1px',
			top          : t + 'px',
			border       : '1px solid #000',
			borderRadius : '3px',
			right        : '0px'
		});
		draw(pickerCtx,t/size*360);
	}


	function rgba2hex(r, g, b, a) {
	    if (r > 255 || g > 255 || b > 255 || a > 255)
	        throw "Invalid color component";
	    return (256 + r).toString(16).substr(1) +((1 << 24) + (g << 16) | (b << 8) | a).toString(16).substr(1);
	}

	function rgbToHsl(r, g, b){
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }
	    return [h, s, l];
	}

	var pickerChoose = function(l){
		var x,y;
		if(l){
			x = l.x;
			y = l.y;
			cx = x;
			cy = y;
		}else{
			x = cx;
			y = cy;
		}
		if(x<=0) x=0;
		if(y<=0) y=0;
		if(x>=size) x=size-1;
		if(y>=size) y=size-1;
		var pix = that.pickerCtx.getImageData(x, y, 1, 1).data;
		pix[3] = currentAlpha;
		var rgba = [pix[0],pix[1],pix[2],currentAlpha];
		var hex = '#'+rgba2hex.apply(null,rgba);
		hex = hex.substring(0,hex.length-2);
		drawAlpha(alphaCtx,rgba[0],rgba[1],rgba[2]);
		var rgbaString = 'rgba('+rgba[0]+','+rgba[1]+','+rgba[2]+','+rgba[3]+')';
		if(s.onPick && !init) s.onPick(rgba,hex,rgbaString);
		init = false;
		that.colorName.value = hex;
		//console.log(rgbToHsl(rgba[0],rgba[1],rgba[2]));
		if(s.rgba) that.colorName.value = rgbaString;
		that.pickerTarget.css({
			position     	: 'absolute',
			left 		 	: x+'px',
			top 		 	: y+'px',
			width 		 	: '2px',
			height 		 	: '2px',
			border 		 	: '1px solid #000',
			backgroundColor : '#000',
			borderRadius    : '10px'
		});
		return rgba;
	}

	// console.log('colorHolder',this.colorHolder);
	// console.log('color',this.color);
	// console.log('picker',this.picker);

	// events

	var pickerPress = false;

	function release(){
		colorPress  = false;
		pickerPress = false;
		alphaPress  = false;
	}

	this.holder.onmouseup = release;

	var move = function(e){

		if(colorPress) {
			if(e.target == that.colorKnob) return;
			var oy = that.color.getBoundingClientRect().y - e.target.getBoundingClientRect().y;
			colorChoose(e,oy);
			pickerChoose();
		}

		if(pickerPress){
			if(e.target == that.pickerTarget) return;
			var ox = that.picker.getBoundingClientRect().x - e.target.getBoundingClientRect().x;
			var oy = that.picker.getBoundingClientRect().y - e.target.getBoundingClientRect().y;
			pickerChoose({
				x : e.offsetX - ox,
				y : e.offsetY - oy
			});
		}

		if(alphaPress){
			if(e.target == that.alphaKnob) return;
			var ox = that.alpha.getBoundingClientRect().x - e.target.getBoundingClientRect().x;
			var x = e.offsetX - ox;
			if(x <= 0) return;
			if(x >= that.alpha.clientWidth+3) return;
			alphaKnob.css({
				position   : 'absolute',
				height     : (colorSize/1.5) + 'px',
				width      : '3px',
				border     : '1px solid #000',
				top        : '0px',
				background : '#000',
				left       : x + 'px',
				cursor     : 'pointer'
			});
			currentAlpha = x / size;
			if(currentAlpha > 0.95) currentAlpha = 1;
			if(currentAlpha < 0.05) currentAlpha = 0;
			pickerChoose();
		}

	}.bind(this);

	document.body.addEventListener('mousemove',move);
	document.body.addEventListener('mouseup',release);

	this.picker.onclick = function(e){
		pickerChoose({
			x : e.offsetX,
			y : e.offsetY
		});
	}

	this.picker.onmousedown = function(e){
		pickerPress = true;
	}

	this.color.onclick = colorChoose;

	this.colorHolder.onmousedown = function(e){
		colorPress = true;
	}

	this.alpha.onmousedown = function(){
		alphaPress = true;
	}

	this.alphaKnob.onmousedown = function(){
		alphaPress = true;
	}



	var cx = 0;
	var cy = 0;

	var init = true;

	var rgba = pickerChoose();

	drawAlpha(alphaCtx,rgba[0],rgba[1],rgba[2]);

	function set(h,s,l,a){
		alphaKnob.css({
			position   : 'absolute',
			height     : (colorSize/1.5) + 'px',
			width      : '3px',
			border     : '1px solid #000',
			top        : '0px',
			background : '#000',
			left       : a*size+'px',
			cursor     : 'pointer'
		});
		that.colorKnob.css({
			position     : 'absolute',
			width        : colorSize+'px',
			height       : '1px',
			top          : h*size+'px',
			border       : '1px solid #000',
			borderRadius : '3px',
			right        : '0px'
		});
		that.pickerTarget.css({
			position     	: 'absolute',
			left 		 	: (s*size)+'px',
			top 		 	: (l*size)+'px',
			width 		 	: '2px',
			height 		 	: '2px',
			border 		 	: '1px solid #000',
			backgroundColor : '#000',
			borderRadius    : '10px'
		});
		//console.log(s,l);
		draw(pickerCtx,360*h);
	}

	if(s.value){
		if(s.value.indexOf('rgba') == 0){
			var m = s.value.match(/rgba\((.+),(.+),(.+),(.+)\)/i);
			var r = Number(m[1]);
			var g = Number(m[2]);
			var b = Number(m[3]);
			var a = Number(m[4]);
			var hsl = rgbToHsl(r,g,b);
			set(hsl[0],hsl[1],hsl[2],a);
		}else if(s.value.indexOf('rgb') == 0){
			var m = s.value.match(/rgb\((.+),(.+),(.+)\)/i);
			var r = Number(m[1]);
			var g = Number(m[2]);
			var b = Number(m[3]);
			var hsl = rgbToHsl(r,g,b);
			set(hsl[0],hsl[1],hsl[2],1);
		}
	}
	

	this.appendChild(this.holder);

}