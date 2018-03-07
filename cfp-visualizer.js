class CFPVisualizer {
	constructor(options) {
		this._canvas = {
			ID:              options.canvas.ID              || null,
			containerID:     options.canvas.containerID     || null,
			backgroundColor: options.canvas.backgroundColor || '#000000',
		}

		this._audio = {
			ID:         options.audio.ID         || null,
			autoplay:   options.audio.autoplay,
			currentID:  options.audio.currentID  || null,
			durationID: options.audio.durationID || null,
			nameID:     options.audio.nameID     || null,
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
		this.isPlaying = false;

		// Bind
		this.updateVisualizer = this.updateVisualizer.bind(this);
		this.onWindowResize = this.onWindowResize.bind(this);
		this.audioPlay = this.audioPlay.bind(this);
		this.audioPause = this.audioPause.bind(this);
		this.audioStop = this.audioStop.bind(this);
		this.audioInfo = this.audioInfo.bind(this);
	}

	init () {
		if (!this._canvas.ID || !this._audio.ID || !this._canvas.containerID)
			throw '[CFP-Visualizer] You didn\' t provide canvasID, audioID or containerID.';	

		/*
		if (this._FFT_SIZE % 512 !== 0 || this._FFT_SIZE > 2048)
			throw '[CFP-Visualizer] Wrong FFT_SIZE. Allowed values: 512, 1024, 2048.';
		*/
		
		this.initCanvas();

		this.initAudio();

		if (this._audio.autoplay) {
			this.audioPlay();
		}

		window.addEventListener('resize', this.onWindowResize, false);
		this.audio.ontimeupdate = () => { this.audioInfo(); }

		this.calculate();

		this.updateVisualizer();
	}

	initCanvas () {
		// Canvas Container
		this.canvasContainer = document.getElementById(this._canvas.containerID);
		// Canvas Setup
		this.canvas = document.getElementById(this._canvas.ID);
		this.ctx = this.canvas.getContext('2d');

		// Canvas Height & Width
		this.canvas.height = this.canvasContainer.clientHeight;
		this.canvas.width  = this.canvasContainer.clientWidth;
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
		this.canvas.width  =this.canvasContainer.clientWidth;
		this.canvas.height = this.canvasContainer.clientHeight;

		// Recalculate
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
			if (this._bars.type === 'basic') {
				this.barWidth = (this.canvas.width - (this.bufferLength - 1) * this._bars.spacing) / this.bufferLength;	
			} else {
				this.barWidth = this.calculateCircumference(this._bars.radius * this.radiusMultiplier) / this.bufferLength;
			}
		} else {
			this.barWidth = this._bars.width;
		}
	}

	calculateCircumference(radius) {
		return radius * 2 * Math.PI;
	}

	drawBars () {
		// Clear
		this.rectangle(0, 0, this.canvas.width, this.canvas.height, this._canvas.backgroundColor);

		if (this._bars.type === 'basic') {
			let x = 0;

			for (let i = 0; i < this.bufferLength; i++) {
				let barHeight = this.dataArray[i] / 2;

				for (let j = 0; j < barHeight; j += this.barWidth / 2 + this._bars.spacing) {
					this.rectangle(x, this.canvas.height - j, this.barWidth, this.barWidth / 2, this._bars.color);	
				}
				
				x += this.barWidth + this._bars.spacing;
			}
		} else {
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
	}

	audioPlay () {
		this.audio.play();
		this.isPlaying = true;
	}

	audioPause () {
		this.audio.pause();
		this.isPlaying = false;
	}

	audioStop () {
		this.audio.pause();
		this.isPlaying = false;
		this.audio.currentTime = 0;
	}

	audioInfo () {
		if (this._audio.currentID) {
			let current = this.audio.currentTime;
			let seconds = Math.trunc(current % 60);
			document.getElementById(this._audio.currentID).innerHTML = `${Math.trunc(current / 60)}:${seconds < 10 ? '0' + seconds : seconds}`;
		}

		if (this._audio.durationID) {
			let duration = this.audio.duration;
			let seconds = Math.trunc(duration % 60);
			document.getElementById(this._audio.durationID).innerHTML = `${Math.trunc(duration / 60)}:${seconds < 10 ? '0' + seconds : seconds}`;
		}

		if (this._audio.nameID) {
			//document.getElementById(this._audio.nameID).innerHTML = ;
		}
	}

	rectangle(x, y, width, height, fillColor) {
		this.ctx.fillStyle = fillColor;
		this.ctx.fillRect(x, y, width, height);
	}
}