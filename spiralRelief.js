importScripts('helpers.js', 'external/stackblur.min.js')

postMessage(['sliders', defaultControls.concat([
  {label: 'Displacement', value: 15, min: 1, max: 50, step: 1},
  {label: 'Spacing', value: 0.7, min: 0.5, max: 5, step: 0.1},
  {label: 'Smoothing', value: 3, min: 1, max: 5, step: 0.1},
])]);

onmessage = function(e) {
  const [ config, pixData ] = e.data;

  const spacing = parseFloat(config.Spacing);
  const displacement = parseFloat(config.Displacement);

  StackBlur.imageDataRGB(pixData, 0,0,config.width,config.height, Math.floor(config.Smoothing));

  const getPixel = pixelProcessor(config, pixData)
  const cx = config.width/2;
  const cy = config.height/2;
  let points = [];
  
  let x = cx, y = cy;
  let radius = 1;
  let theta = 0;
  
  while ( x>0 && y>0 && x<config.width && y<config.height ) {

    z = getPixel( x , y );

    let tempradius = radius + (128 - z) / 255 * displacement;
    points.push([
      cx + tempradius*Math.sin(theta) ,
      cy + tempradius*Math.cos(theta)
     ])

    let incr = Math.asin(1/radius);
    radius +=incr*spacing;
    theta +=incr;

    x = Math.floor( cx + radius*Math.sin(theta));
    y = Math.floor( cy + radius*Math.cos(theta));

  }


  postLines(points);
}


