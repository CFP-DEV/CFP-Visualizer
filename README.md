# CFP-Visualizer
Learning JS, Web Audio API by creating this music visualizer. Work in progress.

## Instructions

```

// Basic Options
let options = {
	/**
	 * ID - required, default: none
	 * backgroundColor - default: #000000
	 */
	canvas: {
		ID: 'visualizer',
		backgroundColor: '#0f0d25',
	},
	audio: {
		ID: 'audio',
		autoplay: false,
	},
	bars: {
		type: 'circular',
		style: 'dashed',
		color: '#ee1848',
		width: 3,
		radius: 250,
	},
	FFT_SIZE: 2048,
}

// Create Visualizer
const Visualizer = new CFPVisualizer(options);

// Initialize Visualizer
Visualizer.init();

```
