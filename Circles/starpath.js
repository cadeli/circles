/**
 * @private 
 * 
 */
var startTime = null;

/**
 * animation, this function call itself and has to be launched just one time 
 * @param  {Starpath} starpath class to animate
 */
function animate(starpath) {
	if (!startTime) startTime = new Date();
	var currentTime = new Date();
	var progress = currentTime.getTime() - startTime.getTime();
	starpath.render(progress);
	requestAnimationFrame(function(progress) {
		animate(starpath);
	});
}

/**
 * Represents  sprites with assigned path.
 * @constructor
 * @param {DIV} parentDiv - The div for bounding the sprite.
 */
Starpath = function(parentDiv) {
	this.parentDiv = parentDiv;
	this.rect = parentDiv.getBoundingClientRect();
	this.sprites = [];
}

Starpath.prototype = {

	/**
	 * @param {Sprite} sprite The sprite to add
	 * @return {Sprite} return this sprite, allow chaining
	 * @chainable
	 */
	addSprite: function(sprite) {
		this.parentDiv.appendChild(sprite.div);
		this.sprites.push(sprite);
		return this;
	},

	/**
	 * rendering all the sprites
	 * @param  {Number} time milliseconds time frome the start of the session
	 * @private
	 */
	render: function(time) {
		for (var index = 0, len = this.sprites.length; index < len; index++) {
			var sprite = this.sprites[index];

			var x = sprite.computePosXFromTime(time);
			var y = sprite.computePosYFromTime(time);
			var ampX = this.rect.width / 2;
			var ampY = this.rect.height / 2;
			sprite.moveTo(
				x * ampX + (this.rect.width - sprite.div.offsetWidth) / 2 + this.rect.left,
				y * ampY + (this.rect.height - sprite.div.offsetHeight) / 2 + this.rect.top
			);

			sprite.zoomTo(
				sprite.computeZoomXFromTime(time),
				sprite.computeZoomYFromTime(time)
			);
		}
	},
}

/**
 * Represents a sprite.
 * initialize default values
 * @constructor
 * @return {Sprite} return this sprite, allow chaining
 * @chainable
 */
Sprite = function() {
	this.div = document.createElement('div');
	this.div.style.position = "absolute";

	this.centerX = 0;
	this.centerY = 0;
	this.speed = 1;
	this.phase = 0;
	this.zoomX = 1;
	this.zoomY = 1;

	this.amplitudeMinX = 1;
	this.amplitudeMinY = 1;
	this.amplitudeMaxX = 1;
	this.amplitudeMaxY = 1;
	this.amplitudeSpeedX = 1;
	this.amplitudeSpeedY = 1;
	this.amplitudePhaseX = 0;
	this.amplitudePhaseY = 0;

	this.zoomMaxX = 1;
	this.zoomMaxY = 1;
	this.zoomMinX = 1;
	this.zoomMinY = 1;
	this.zoomSpeedX = 1;
	this.zoomSpeedY = 1;
	this.zoomPhaseX = 0;
	this.zoomPhaseY = 0;

	return this;
}

Sprite.prototype = {

	/**
	 * set the picture of the sprite
	 * @param {URL} imageUrl url of the image (can be relative to a PNG file)
	 * @return {Sprite} return this sprite, allow chaining
	 * @chainable
	 */
	setSprite: function(imageUrl) {
		var image = new Image();
		image.src = imageUrl;
		this.div.appendChild(image);
		this.width = this.div.childNodes[0].width;
		this.height = this.div.childNodes[0].height;
		//this.div.style.border = 'thick solid #909090'; 
		return this;
	},

	/**
	 * define the center of the path of the sprite
	 * @param {Number} x x coordonate
	 * @param {Number} y y coordonate
	 * @return {Sprite} return this sprite, allow chaining
	 * @chainable
	 */
	setCenter: function(x, y) {
		this.centerX = x;
		this.centerY = y;
		return this;
	},

	/**
	 * define the speed of the sprite
	 * @param {Number} value 1 = one circle per second
	 * @return {Sprite} return this sprite, allow chaining
	 * @chainable
	 */
	setSpeed: function(value) {
		this.speed = value;
		return this;
	},

	/**
	 * define the phase of the sprite ( 2pi = one turn)
	 * @param {Number} value of the phase
	 * @return {Sprite} return this sprite, allow chaining
	 * @chainable
	 */
	setPhase: function(value) {
		this.phase = value;
		return this;
	},

	/**
	 * define fixed zoom of the sprite
	 * @param {Number} zoomX zoom coeficient for width
	 * @param {Nimber} zoomY zoom coeficient for heigth
	 * @return {Sprite} return this sprite, allow chaining
	 * @chainable
	 */
	setZoom: function(zoomX, zoomY) {
		this.zoomMaxX = zoomX;
		this.zoomMaxY = zoomY;
		this.zoomMinX = zoomX;
		this.zoomMinY = zoomY;
		return this;
	},

	setZoomExt: function(maxX, maxY, minX, minY, speedX, speedY, phaseX, phaseY) {
		this.zoomMaxX = maxX;
		this.zoomMaxY = maxY;
		this.zoomMinX = minX;
		this.zoomMinY = minY;
		this.zoomSpeedX = speedX;
		this.zoomSpeedY = speedY;
		this.zoomPhaseX = phaseX;
		this.zoomPhaseY = phaseY;
		return this;
	},

	/**
	 * define the fixed amplitude of the path
	 * @param {Number} maxX amplitude for width 1 = all the width of the div
	 * @param {Number} maxY amplitude for height 1 = all the height of the div
	 * @return {Sprite} return this sprite, allow chaining
	 * @chainable
	 */
	setAmplitude: function(maxX, maxY) {
		this.amplitudeMaxX = maxX;
		this.amplitudeMaxY = maxY;
		this.amplitudeMinX = maxX;
		this.amplitudeMinY = maxY;
		return this;
	},

	setAmplitudeExt: function(maxX, maxY, minX, minY, speedX, speedY, phaseX, phaseY) {
		this.amplitudeMaxX = maxX;
		this.amplitudeMaxY = maxY;
		this.amplitudeMinX = minX;
		this.amplitudeMinY = minY;
		this.amplitudeSpeedX = speedX;
		this.amplitudeSpeedY = speedY;
		this.amplitudePhaseX = phaseX;
		this.amplitudePhaseY = phaseY;
		return this;
	},

	/**
	 * x position from time
	 * @param  {Number} time (milliseconds form start)
	 * @return {Number}  x pos in the div 
	 * @private
	 */
	computePosXFromTime: function(time) {
		return this.centerX + Math.sin(this._computeOscillatorValue(time)) * this._computeAmplitudeX(time);
	},

	/**
	 * y position from time
	 * @param  {Number} time (milliseconds form start)
	 * @return {Number}  y pos in the div 
	 * @private
	 */
	computePosYFromTime: function(time) {
		return this.centerY + Math.cos(this._computeOscillatorValue(time)) * this._computeAmplitudeY(time);
	},

	/**
	 * move the sprite to the x,y coordonates
	 * @param  {Number} x x position
	 * @param  {Number} y y position
	 */
	moveTo(x, y) {
		this.div.style.left = x + 'px';
		this.div.style.top = y + 'px';
	},

	/**
	 * @param  {Number} time in millisecond
	 * @return {Number} oscillatorValue
	 * @private
	 */
	_computeOscillatorValue: function(time) {
		var nPhase = this.phase * (2 * Math.PI) * 1000;
		return (-1) * this.speed * ((time * 2 * Math.PI + nPhase / this.speed) / 1000);
	},

	_computeAmplitudeX: function(time) {
		var nPhase = this.amplitudePhaseX * (4 * Math.PI) * 1000;
		var freq = this.amplitudeSpeedX * (time * 2 * Math.PI + nPhase) / 1000;
		var sin = Math.sin(freq);
		var ampl = (this.amplitudeMaxX - this.amplitudeMinX);
		var ret = sin * ampl + this.amplitudeMinX;
		return ret;
	},

	_computeAmplitudeY: function(time) {
		var nPhase = this.amplitudePhaseY * (4 * Math.PI) * 1000;
		var freq = this.amplitudeSpeedY * (time * 2 * Math.PI + nPhase) / 1000;
		var sin = Math.sin(freq);
		var ampl = (this.amplitudeMaxY - this.amplitudeMinY);
		var ret = sin * ampl + this.amplitudeMinY;
		return ret;
	},

	/**
	 * zoom the sprite to the zoomX,zoomY coeficients
	 * @param  {Number} zoomX zoom for width
	 * @param  {Number} zoomY zoom for height
	 */
	zoomTo(zoomX, zoomY) {
		if (image = this.div.childNodes[0]) {
			image.style.width = this.width * zoomX + 'px';
			image.style.height = this.height * zoomY + 'px';
		} else {
			console.error("Sprite:setZoom  : You must create image before zoom");
		}
	},

	computeZoomXFromTime: function(time) {
		var nPhase = this.zoomPhaseX * (4 * Math.PI) * 1000;
		var freq = this.zoomSpeedX * (time * 2 * Math.PI + nPhase) / 1000;
		var sin = Math.sin(freq);
		var ampl = (this.zoomMaxX - this.zoomMinX);
		var ret = Math.abs(sin * ampl) + this.zoomMinX;
		return ret;
	},

	computeZoomYFromTime: function(time) {
		var nPhase = this.zoomPhaseY * (4 * Math.PI) * 1000;
		var freq = this.zoomSpeedY * (time * 2 * Math.PI + nPhase) / 1000;
		var sin = Math.sin(freq);
		var ampl = (this.zoomMaxY - this.zoomMinY);
		var ret = Math.abs(sin * ampl) + this.zoomMinY;
		return ret;
	},
}