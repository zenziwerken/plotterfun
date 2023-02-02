/**
 * Based on linescan by Algorithm by j-waal
 */

importScripts('helpers.js')

postMessage(['sliders', [
    { label: 'Spacing', value: 5, min: 1, max: 20, step: 1 },
    { label: 'Threshold', value: 128, min: 0, max: 255, step: 1 },
    { label: 'Minlength', value: 1, min: 0, max: 32, step: 1 },
    { label: 'Angle', value: 0, min: 0, max: 360},
]]);



onmessage = function (e) {
    const [config, pixData] = e.data;
    const getPixel = pixelProcessor(config, pixData)

    // User variables
    const spacing = config.Spacing // spacing between lines
	  const threshold = config.Threshold
	  const minlength = config.Minlength // dont output short line segments
  
    const pi=Math.PI
    const cos = Math.cos(config.Angle/180*pi) 
    const sin = Math.sin(config.Angle/180*pi) 

    postLines(points);
}
