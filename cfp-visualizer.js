class CFPVisualizer {
	constructor(options) {
		this._canvas = {
			ID:              options.canvas.ID              || null,
			//height:          options.canvas.height          || window.innerHeight,
			//width:           options.canvas.width           || window.innerWidth,
			backgroundColor: options.canvas.backgroundColor || '#000000',
		}

		this._audio = {
			ID:       options.audio.ID       || null,
			autoplay: options.audio.autoplay || true,
		}

		this._bars = {
			type:    options.bars.type    || 'basic',
			style:   options.bars.style   || 'solid',
			color:   options.bars.color   || '#FFFFFF',
			spacing: options.bars.spacing || 10,
			width:   options.bars.width   || 'auto',
			reverse: options.bars.reverse || false,
			radius:  options.bars.radius  || 150,
		}

		this._breakpoints = options.breakpoints || null;
		this._FFT_SIZE    = options.FFT_SIZE    || 1024;
		this.floorLevel   = options.floorLevel  || 0;

		// Other
		this.barHeightMultiplier = 1;
		this.radiusMultiplier = 1;

		// Bind
		this.updateVisualizer = this.updateVisualizer.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
	}

	init () {
		if (!this._canvas.ID || !this._audio.ID)
			throw '[CFP-Visualizer] You didn\' t provide canvasID or audioID.';	

		if (this._FFT_SIZE % 512 !== 0 || this._FFT_SIZE > 2048)
			throw '[CFP-Visualizer] Wrong FFT_SIZE. Allowed values: 512, 1024, 2048.';
		
		this.initCanvas();

		this.initAudio();

		window.addEventListener('resize', this.onWindowResize, false);

		this.calculate();

		this.updateVisualizer();
	}

	initCanvas () {
		// Canvas Setup
		this.canvas = document.getElementById(this._canvas.ID);
		this.ctx = this.canvas.getContext('2d');

		// Canvas Height & Width
		this.ctx.canvas.height = window.innerHeight;
		this.ctx.canvas.width  = window.innerWidth;

		// Canvas Background
	}

	initAudio () {
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

	onWindowResize () {
		// Resize
		this.ctx.canvas.width  = window.innerWidth;
		this.ctx.canvas.height = window.innerHeight;

		// Canvas Background

		// Recalculate Bars Width / Height
		this.calculate();
	}

	updateVisualizer () {
		// Draw Bars
		this.drawBars();

		// Update Data
		this.analyser.getByteFrequencyData(this.dataArray);

		// Loop
		requestAnimationFrame(this.updateVisualizer);
	}

	calculate () {
		// Breakpoints
		if (this._breakpoints) {
			if (this._breakpoints[0].width < this.canvas.width) {
				this.barHeightMultiplier = 1;
				this.radiusMultiplier = 1;
			} else {
				for (let i = 0; i < this._breakpoints.length; i++) {
					let breakpoint = this._breakpoints[i];

					if (breakpoint.width >= this.canvas.width) {
						this.barHeightMultiplier = breakpoint.barHeightMultiplier;
						this.radiusMultiplier = breakpoint.radiusMultiplier;
					}
				};
			}
		}

		// Bar Width
		if (this._bars.width === 'auto') {
			// this.barWidth = this.canvas.width / this.bufferLength;
			this.barWidth = this.calculateCircumference(this._bars.radius * this.radiusMultiplier) / this.bufferLength;
		} else {
			this.barWidth = this._bars.width;
		}
	}

	calculateCircumference(radius) {
		return radius * 2 * Math.PI;
	}

	drawBars () {
		// Clear
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		let radius = this._bars.radius * this.radiusMultiplier;

		// Maximum Bars
		let barNum = Math.floor(this.calculateCircumference(radius) / (this.barWidth + this._bars.spacing));
		let freqJump = Math.floor(this.bufferLength / barNum);
		let x = 0;

		// Draw 
		for (let i = 0; i < barNum; i++) {
			//barHeight = this.dataArray[i * freqJump];
			let barHeight = Math.max(0, this.dataArray[i] - this.floorLevel) * this.barHeightMultiplier;
			let alfa = (i * 2 * Math.PI) / barNum;
			let beta = (3 * 45 - this.barWidth) * Math.PI / 180;

			this.ctx.save();
			this.ctx.translate(this.canvas.width / 2 + this._bars.spacing, this.canvas.height / 2 + this._bars.spacing);
			this.ctx.rotate(alfa - beta);

			for (let j = 0; j < barHeight; j += this.barWidth + this._bars.spacing / 2) {
				this.rectangle(0, radius + j, this.barWidth, this.barWidth, this._bars.color);
			}

			this.rectangle(0, radius, this.barWidth, 2, this._bars.color);	
			this.ctx.restore();
		}
	}

	audioPlay () {
		this.audio.play();
	}

	audioPause () {
		this.audio.pause();
	}

	audioStop () {
		this.audio.pause();
		this.audio.currentTime = 0;
	}

	rectangle(x, y, width, height, fillColor) {
		this.ctx.fillstyle = fillColor;
		this.ctx.fillRect(x, y, width, height);
	}
}