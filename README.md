# CFP-Visualizer
Learning JS, Web Audio API by creating this music visualizer. Work in progress.

## Instructions

```

// Basic Options
let options = {

	/*
	ID - string, required, default: null
	backgroundColor - string, default: #000000
	*/
	canvas: {
		ID: 'visualizer',
		backgroundColor: '#0f0d25',
	},
	
  	/*
	ID - string, required, default: null
	autoplay - boolean, default: true
	*/
	audio: {
		ID: 'audio',
		autoplay: false,
	},
  
  	/*
	type - string, default: 'basic'. Use: 'basic', 'circular'.
  	style - string, default: 'solid'. Use: 'solid', 'rounded', 'dashed', 'dashed-circular'.
	color - string, default: '#000000'.
  	width - integer, default: auto
  	radius: integer, default: 150
	*/
	bars: {
		type: 'circular',
		style: 'dashed',
		color: '#ee1848',
		width: 3,
		radius: 250,
	},
  
  	/*
	FFT_SIZE: integer, default: 2048. Use 512, 1024, 2048.
	*/
	FFT_SIZE: 2048,
}

// Create Visualizer
const Visualizer = new CFPVisualizer(options);

// Initialize Visualizer
Visualizer.init();

```
