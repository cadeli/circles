var startTime = null;
function animate(starpath) {
	if (!startTime) startTime = new Date();
	var currentTime = new Date();
	var progress = currentTime.getTime() - startTime.getTime();
	starpath.render(progress);
	requestAnimationFrame(function(progress){
		animate( starpath);
	} );
}

//------------------------------------------------------------------------------
Starpath = function (starFieldDiv) {
	this.starFieldDiv = starFieldDiv;
	this.rect = starFieldDiv.getBoundingClientRect();
	this.sprites = [];
}

Starpath.prototype = {
	addSprite : function (sprite) {
		this.starFieldDiv.appendChild(sprite.div);
		this.sprites.push(sprite);
		return this;
	},

	render : function (time) {
		for (var index = 0, len = this.sprites.length; index < len; index++) {
			var sprite = this.sprites[index];
 
			var x = sprite.computePosXFromTime(time);
			var y = sprite.computePosYFromTime(time);
			var ampX = this.rect.width /2 ;
			var ampY = this.rect.height/2 ;
			sprite.moveTo(
				x*ampX + (this.rect.width  - sprite.div.offsetWidth )/2 
				+ this.rect.left, 
				y*ampY + (this.rect.height - sprite.div.offsetHeight)/2 
				+ this.rect.top
			);

			sprite.zoomTo(
				sprite.computeZoomXFromTime(time),
				sprite.computeZoomYFromTime(time)
			);
		}
	},
}

//------------------------------------------------------------------------------
Sprite = function () {
	this.div = document.createElement('div');
	this.div.style.position = "absolute";
	/*default values */
	this.centerX = 0;
	this.centerY = 0;
	this.speed = 1;
	this.phase = 0;
	this.zoomX = 1;
	this.zoomY = 1;

	this.amplitudeMinX   = 1;
	this.amplitudeMinY   = 1;
	this.amplitudeMaxX   = 1;
	this.amplitudeMaxY   = 1;
	this.amplitudeSpeedX = 1;
	this.amplitudeSpeedY = 1;
	this.amplitudePhaseX = 0;
	this.amplitudePhaseY = 0;

	this.zoomMaxX   = 1;
	this.zoomMaxY   = 1;
	this.zoomMinX   = 1;
	this.zoomMinY   = 1;
	this.zoomSpeedX = 1;
	this.zoomSpeedY = 1;
	this.zoomPhaseX = 0;
	this.zoomPhaseY = 0;

	return this;
}

Sprite.prototype = {

	setSprite : function (imageUrl) {
		var image = new Image();
		image.src=imageUrl;
		this.div.appendChild(image);
		this.width  = this.div.childNodes[0].width;
		this.height = this.div.childNodes[0].height;
		//this.div.style.border = 'thick solid #909090'; 
		return this;
	},

	setCenter: function (x,y) {
		this.centerX = x;
		this.centerY = y;
		return this;
	},

	setSpeed: function (value) {
		this.speed = value;
		return this;
	},

	setPhase: function (value) {
		this.phase = value;
		return this;
	},

	setZoom : function (zoomX, zoomY) {
		this.zoomMaxX = zoomX;
		this.zoomMaxY = zoomY;
		this.zoomMinX = zoomX;
		this.zoomMinY = zoomY;
		return this;
	},

	setZoomExt: function (maxX, maxY, minX, minY, speedX, speedY, phaseX, phaseY) {
		this.zoomMaxX   = maxX;
		this.zoomMaxY   = maxY;
		this.zoomMinX   = minX;
		this.zoomMinY   = minY;
		this.zoomSpeedX = speedX;
		this.zoomSpeedY = speedY;
		this.zoomPhaseX = phaseX;
		this.zoomPhaseY = phaseY;
		return this;
	},

	setAmplitude: function (maxX, maxY) {
		this.amplitudeMaxX   = maxX;
		this.amplitudeMaxY   = maxY;
		this.amplitudeMinX   = maxX;
		this.amplitudeMinY   = maxY;
		return this;
	},

	setAmplitudeExt: function (maxX, maxY, minX, minY, speedX, speedY, phaseX, phaseY) {
		this.amplitudeMaxX   = maxX;
		this.amplitudeMaxY   = maxY;
		this.amplitudeMinX   = minX;
		this.amplitudeMinY   = minY;
		this.amplitudeSpeedX = speedX;
		this.amplitudeSpeedY = speedY;
		this.amplitudePhaseX = phaseX;
		this.amplitudePhaseY = phaseY;
		return this;
	},

	computePosXFromTime: function (time) {
		return this.centerX
			+ Math.sin(this._computeOscillatorValue(time))
			*this._computeAmplitudeX(time);
	},

	computePosYFromTime: function (time) {
		return this.centerY
			+ Math.cos(this._computeOscillatorValue(time))
			*this._computeAmplitudeY(time);
	},

	moveTo(x,y) {
		this.div.style.left = x+'px';
		this.div.style.top  = y+'px';
	},

	_computeOscillatorValue: function(time) {
		var nPhase = this.phase*(2*Math.PI) *1000;
		return (-1)*this.speed*((time *2*Math.PI+ nPhase/this.speed)/1000 );
	},

	_computeAmplitudeX: function(time) {
		var nPhase = this.amplitudePhaseX*(4*Math.PI) *1000;
		var freq=this.amplitudeSpeedX*(time*2*Math.PI + nPhase )/1000;
		var sin=Math.sin(freq);
		var ampl = (this.amplitudeMaxX - this.amplitudeMinX);
		var ret = sin*ampl + this.amplitudeMinX;
		return ret;
	},

	_computeAmplitudeY: function(time) {
		var nPhase = this.amplitudePhaseY*(4*Math.PI) *1000;
		var freq=this.amplitudeSpeedY*(time*2*Math.PI+ nPhase)/1000;
		var sin=Math.sin(freq);
		var ampl = (this.amplitudeMaxY - this.amplitudeMinY);
		var ret = sin*ampl + this.amplitudeMinY;
		return ret;
	},

	zoomTo(zoomX,zoomY) {
		if (image = this.div.childNodes[0]) {
			image.style.width  = this.width *zoomX +'px';
			image.style.height = this.height*zoomY +'px';
	 	} else {
	 		console.error("Sprite:setZoom  : You must create image before zoom");
	 	}
	},
	
	computeZoomXFromTime: function(time) {
		var nPhase = this.zoomPhaseX*(4*Math.PI) *1000;
		var freq=this.zoomSpeedX*(time*2*Math.PI + nPhase )/1000;
		var sin=Math.sin(freq);
		var ampl = (this.zoomMaxX - this.zoomMinX);
		var ret = Math.abs(sin*ampl) + this.zoomMinX;
		return ret;
	},

	computeZoomYFromTime: function(time) {
		var nPhase = this.zoomPhaseY*(4*Math.PI) *1000;
		var freq=this.zoomSpeedY*(time*2*Math.PI+ nPhase)/1000;
		var sin=Math.sin(freq);
		var ampl = (this.zoomMaxY - this.zoomMinY);
		var ret = Math.abs(sin*ampl) + this.zoomMinY;
		return ret;
	},
}