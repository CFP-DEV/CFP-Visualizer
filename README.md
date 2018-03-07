# CFP-Visualizer
Learning JS, Web Audio API by creating this music visualizer.
I've tried to keep it as much customizable as I can.

## Instructions

```

// Example Configuration + Description
let options = {
	canvas: {
		// Canvas ID.  
		// Required. Default: null.
		ID: 'canvasID',
		// Container ID. It will automatically get size of it and apply to the canvas. 
		// Required. Default: null.
		containerID: 'containerID',
		// Background Color. Opacity is no supported at the moment.
		// Default: '#000000'.
		backgroundColor: '#111111',
	},

	audio: {
		// Audio ID
		// Required. Default: null.
		ID: 'audioID',
		// Audio autoplay
		// Default: none.
		autoplay: true,
		// Current Time container ID. It will use innerHTML to update value.
		// Required. Default: null.
		currentID: 'current-time',
		// Duration container ID. It will use innerHTML to update value.
		// Required. Default: null.
		currentID: 'current-time',
	},

	bars: {
		// Visualization types. Available: 'basic', 'circular'.
		// Default: 'basic'.
		type: 'basic',
		// Styles. Available for each type: 'solid', 'rounded', 'dashed'.
		// Default: 'solid',
		style: 'rounded',
		// Bars Color.
		// Default: '#FFFFFF'.
		color: '#00ACED',
		// Space between bars.
		// Default: 10.
		spacing: 3,
		// Bar width. If not set it will automatically calculate best width and apply it.
		// Default: 'auto'.
		width: 3,
		// Reverse. Default it's from bottom to top but it can be switched. Works only for basic type.
		// Default: false.
		reverse: true,
		// Radius. Works only for circular type.
		// Default: 150.
		radius: 50,
	},

	// Breakpoints. It works only if you go from the highest width to the lowest (as shown below).
	// Default: none.
	breakpoints: [
		{
			width: 800,
			barHeightMultiplier: 0.8,
			radiusMultiplier: 0.8,	
		},
		{
			width: 500,
			barHeightMultiplier: 0.5,
			radiusMultiplier: 0.5,	
		},
	],

	// FFT_SIZE. In human language -> number of bars. It has to be divided by 32 so.. 32, 64, 128... up to 2048.
	// Didn't tested for larger numbers.
	// Default: 1024.
	FFT_SIZE: 512,

	// Floor Level. If frequency has bins below that then it won't show at all.
	// Default: 0.
	floorLevel: 30,
}

const Visualizer = new CFPVisualizer(options);

// Init Visualizer
Visualizer.init();

// Play Audio
Visualizer.audioPlay();

// Stop Audio
Visualizer.audioStop();

// Pause Audio
Visualizer.audioPause();

```
