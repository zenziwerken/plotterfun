/**
 * Algorithm implementation by j-waal
 * Inspiration from Tim Holman - Generative Art Speedrun
 * rectangleworld - Random Braids
 */

importScripts('helpers.js')

postMessage(['sliders', defaultControls.concat([
	{label: 'Frequency', value: 150, min: 5, max: 256},
	{label: 'Line Count', value: 8, min: 5, max: 200},
	{label: 'Cosine', type: 'checkbox' },
	{label: 'Random', type: 'checkbox' },
	{label: 'Power', type:'select', value:2, options:[1/2, 1, 2, 3]}
])]);


// Thanks to https://gist.github.com/tionkje/6ab66360dcfe9a9e2b5560742d259389
function createRandFunction(seedString) {
    for (var i = 0, h = 1779033703 ^ seedString.length; i < seedString.length; i++) {
        h = Math.imul(h ^ seedString.charCodeAt(i), 3432918353);
        h = h << 13 | h >>> 19;
    } return function () {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967295;
    }
}

onmessage = function(e) {
	const [ config, pixData ] = e.data;
	const getPixel = pixelProcessor(config, pixData)

	const lineCount = config['Line Count'];
	const frequency = config.Frequency;
	const incr_y = Math.floor(config.height / lineCount);
	const cosine = config.Cosine;
	const random = config.Random;
	const power = config.Power;
	let output = [];

	let order = Array.from(Array(lineCount).keys())
	// store an array with lines we can swap
	const dotRand = createRandFunction("");
	
	for (let x = 0; x < config.width; x += frequency) {
		output.push([...order])
		for (let l = 0; l<lineCount; l++){
			let z = getPixel(x, l*incr_y)
			// decide to swap two lines
			if ((!random && z > 100) || (random && Math.pow(z/255.0,power) > dotRand())){
				if (l!=lineCount-1 ){ // can not swap the last line
					[order[l], order[l+1]] = [order[l+1], order[l]] // swap lines
					l++ // skip next line. line can only be swapped once per column
				}
			}
		}
	}

	let lineMap = []
	// convert order of lines to the path a line has to take
	for (let x = 0; x < output.length; x++) {
		let map = []
		for (let l = 0; l<lineCount; l++){
			let v = output[x][l]
			map[v] = l
		}
		lineMap.push([...map])
	}

	//convert to image
	let lines = []
	for (let l = 0; l<lineCount; l++){
		let line = []
		line.push([0, l*incr_y])
		for (let x = 1; x < output.length; x++) {
			if (cosine && lineMap[x-1][l] != lineMap[x][l]){
				// nice cosine function to connect the two lines
				let h1 = lineMap[x-1][l]*incr_y
				let h2 = lineMap[x][l]*incr_y
				let d = h1-h2
				let a = (h1+h2)/2
				for (p=1; p<frequency; p++){
					let xp = (x-1)*frequency+p
					let yp = a+(d/2)*Math.cos(p*Math.PI/frequency)
					line.push([xp, yp])
				}
			}
			line.push([x*frequency, lineMap[x][l]*incr_y])
		}
		lines.push(line)
	}
	postLines(lines);
}
