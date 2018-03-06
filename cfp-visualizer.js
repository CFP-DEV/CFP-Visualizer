class CFPVisualizer {
	constructor(options) {
		// Canvas
		this._canvas = {
			ID:              options.canvas.ID              || null,
			height:          options.canvas.height          || window.innerHeight,
			width:           options.canvas.width           || window.innerWidth,
			backgroundColor: options.canvas.backgroundColor || '#000000',
		}

		// Audio
		this._audio = {
			ID:       options.audio.ID       || null,
			autoplay: options.audio.autoplay || true,
		}

		// Bars
		this._bars = {
			type:    options.bars.type    || 'basic',
			style:   options.bars.style   || 'solid',
			color:   options.bars.color   || '#FFFFFF',
			spacing: options.bars.spacing || 10,
			width:   options.bars.width   || 'auto',
			reverse: options.bars.reverse || false,
			radius:  options.bars.radius  || 150,
		}

		this._FFT_SIZE = options.FFT_SIZE || 1024;

		this.audioLoaded = false;

		// Binding
		this.renderFrame = this.renderFrame.bind(this);
	}

	/**
	 * @description
	 * Initialize Visualizer.
	 */
	init() {
		// Validate Basic Stuff
		if (!this._canvas.ID || !this._audio.ID)
			throw '[CFP-Visualizer] You didn\' t provide canvasID or audioID.';	

		if (this._FFT_SIZE % 512 !== 0 || this._FFT_SIZE > 2048)
			throw '[CFP-Visualizer] Wrong FFT_SIZE. Allowed values: 512, 1024, 2048.';

		this.setCanvas();
		this.setAudio();

		if (this._audio.autoplay) {
			this.audio.addEventListener('loadedmetadata', function() {
			    this.audioLoaded = true;
			    this.playAudio();
			}.bind(this));
		}

		//this.barWidth = (this._canvas.width - this.bufferLength * this._bars.spacing) / this.bufferLength;
		this.barWidth = this._canvas.width / this.bufferLength;
		

		this.renderFrame();
	}

	/**
	 * @description
	 * Render Frame
	 */
	renderFrame() {
		// Loop
		requestAnimationFrame(this.renderFrame);
		
		this.clearCanvas();

		this.analyser.getByteFrequencyData(this.dataArray);
		let x = 0;

		if (this._bars.type === 'basic') {
			for (let i = 0; i < this.bufferLength; i++) {
				this.barHeight = this.dataArray[i] / 2;
				let y;

				if (this._bars.style === 'solid' || this._bars.style === 'rounded') {
					y = this._bars.reverse ? 0 : this._canvas.height - this.barHeight;
					if (this._bars.style === 'solid') {
						this.drawRectangle({
			            	x: x,
			            	y: y,
			            	width: this.barWidth,
			            	height: this.barHeight,
			            	fillColor: this._bars.color,
			            });	
					} else {
						this.drawRRectangle({
			            	x: x,
			            	y: y,
			            	width: this.barWidth,
			            	height: this.barHeight,
			            	fillColor: this._bars.color,
			            	topLeft: this._bars.reverse ? 0 : this.barWidth / 2,
		        			topRight: this._bars.reverse ? 0 : this.barWidth / 2,
		        			bottomLeft: this._bars.reverse ? this.barWidth / 2 : 0,
		        			bottomRight: this._bars.reverse ? this.barWidth / 2 : 0,
			            });	
					}
				} else {
					for (let j = 0; j <= this.barHeight; j += this.barWidth + this._bars.spacing / 2) {
						y = this._bars.reverse ? j : this._canvas.height - j;

						if (this._bars.style === 'dashed') {
							this.drawRectangle({
				            	x: x,
				            	y: y,
				            	width: this.barWidth,
				            	height: this.barWidth,
				            	fillColor: this._bars.color,
				            });		
						} else {
							this.drawCircle({
				            	x: x,
				            	y: y,
				            	width: this.barWidth,
				            	height: this.barWidth,
				            	fillColor: this._bars.color,
				            });			
						}
					}
				}

				x += this.barWidth + this._bars.spacing;
			}	
		}


		if (this._bars.type === 'circular') {
			let barNum = Math.floor((this._bars.radius * 2 * Math.PI) / (this.barWidth + this._bars.spacing));
			let freqJump = Math.floor(this.dataArray.length / barNum);
			
			for (let i = 0; i < barNum; i++) {
				this.barHeight = this.dataArray[i] / 2;
				//let amplitude = this.dataArray[i * freqJump];
				let alfa = (i * 2 * Math.PI) / barNum;
				let beta = (3 * 45 - this.barWidth) * Math.PI / 180;

				this.ctx.save();
				this.ctx.translate(this._canvas.width / 2 + this._bars.spacing, this._canvas.height / 2 + this._bars.spacing);
				this.ctx.rotate(alfa - beta);

				if (this._bars.style === 'solid' || this._bars.style === 'rounded') {
					if (this._bars.style === 'solid') {
						this.drawRectangle({
			            	x: x,
			            	y: this._bars.radius,
			            	width: this.barWidth,
			            	height: this.barHeight,
			            	fillColor: this._bars.color,
			            });
					} else {
						this.drawRRectangle({
			            	x: x,
			            	y: this._bars.radius,
			            	width: this.barWidth,
			            	height: this.barHeight,
			            	fillColor: this._bars.color,
			            	topLeft: 0,
			            	topRight: 0,
			            	bottomLeft: this.barWidth / 2,
			            	bottomRight: this.barWidth / 2,
			            });
					}

					this.drawRectangle({
		            	x: x,
		            	y: this._bars.radius,
		            	width: this.barWidth,
		            	height: 2,
		            	fillColor: this._bars.color,
		            });
				} else {
					for (let j = 0; j <= this.barHeight; j += this.barWidth / 2 + this._bars.spacing / 2) {
						if (this._bars.style === 'dashed') {
							this.drawRectangle({
				            	x: x,
				            	y: this._bars.radius + j,
				            	width: this.barWidth,
				            	height: this.barWidth / 2,
				            	fillColor: this._bars.color,
				            });
						} else {
							this.drawCircle({
								x: x,
								y: this._bars.radius + j,
								width: this._bars.width,
								height: this._bars.width,
								fillColor: this._bars.color,
							});	
						}
					}
				}

				this.ctx.restore();
			}
		}
	}

	/**
	 * @description
	 * Set Audio.
	 *
	 * @return { object }
	 */
	setAudio() {
		this.audio = document.getElementById(this._audio.ID);
		let context = new AudioContext();
		let source = context.createMediaElementSource(this.audio);
		this.analyser = context.createAnalyser();

		source.connect(this.analyser);
		this.analyser.connect(context.destination);
		this.analyser.fftSize = this._FFT_SIZE;

		this.bufferLength = this.analyser.frequencyBinCount;
    	this.dataArray = new Uint8Array(this.bufferLength);
	}

	/**
	 * @description
	 * Play Audio.
	 */
	playAudio() {
		this.audio.play();
	}

	/**
	 * @description
	 * Pause Audio.
	 */
	pauseAudio() {
		this.audio.pause();
	}

	/**
	 * @description
	 * Stop Audio.
	 */
	stopAudio() {
		this.audio.pause();
		this.audio.currentTime = 0;
	}

	/**
	 * @description
	 * Set Canvas.
	 */
	setCanvas() {
		this.canvas = document.getElementById(this._canvas.ID);
		this.canvas.height = this._canvas.height;
		this.canvas.width = this._canvas.width;
		this.ctx = this.canvas.getContext('2d');
	}

	clearCanvas() {
		this.drawRectangle({x: 0, y: 0, width: this._canvas.width, height: this._canvas.height, fillColor: this._canvas.backgroundColor});
	}

	drawRectangle(drawOptions) {
		this.ctx.fillStyle = drawOptions.fillColor;
		this.ctx.fillRect(drawOptions.x, drawOptions.y, drawOptions.width, drawOptions.height);
	}

	drawRRectangle(drawOptions) {
		if (drawOptions.height !== 0) {
			this.ctx.fillStyle = drawOptions.fillColor;
			this.ctx.beginPath();

		    this.ctx.moveTo(drawOptions.x + drawOptions.topLeft, drawOptions.y);
		    this.ctx.lineTo(drawOptions.x + drawOptions.width - drawOptions.topRight, drawOptions.y);
		    this.ctx.quadraticCurveTo(drawOptions.x + drawOptions.width, drawOptions.y, drawOptions.x + drawOptions.width, drawOptions.y + drawOptions.topRight);

		    this.ctx.lineTo(drawOptions.x + drawOptions.width, drawOptions.y + drawOptions.height - drawOptions.bottomRight);
		    this.ctx.quadraticCurveTo(drawOptions.x + drawOptions.width, drawOptions.y + drawOptions.height, drawOptions.x + drawOptions.width - drawOptions.bottomRight, drawOptions.y + drawOptions.height);

		    this.ctx.lineTo(drawOptions.x + drawOptions.bottomLeft, drawOptions.y + drawOptions.height);
		    this.ctx.quadraticCurveTo(drawOptions.x, drawOptions.y + drawOptions.height, drawOptions.x, drawOptions.y + drawOptions.height - drawOptions.bottomLeft);

		    this.ctx.lineTo(drawOptions.x, drawOptions.y + drawOptions.topLeft);
		    this.ctx.quadraticCurveTo(drawOptions.x, drawOptions.y, drawOptions.x + drawOptions.topLeft, drawOptions.y);

		    this.ctx.closePath();
		   	this.ctx.fill();	
		}
	}

	drawCircle(drawOptions) {
		this.ctx.beginPath();
		this.ctx.fillStyle = drawOptions.fillColor;
		this.ctx.arc(drawOptions.x + drawOptions.width / 2, drawOptions.y + drawOptions.height / 2, drawOptions.width / 2, 0, 2 * Math.PI);
		this.ctx.fill();
	}
}