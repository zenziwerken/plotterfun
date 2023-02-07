importScripts('helpers.js')

postMessage(['sliders', defaultControls.concat([
  { label: 'Threshold', value:  70, min: 0, max: 255, step: 1 },
  { label: 'Threshold 2',   value: 150, min: 0, max: 255, step: 1 },
  { label: 'Spacing', value: 5, min: 0.5, max: 5, step: 0.1},
  { label: 'X', value: 50, min: 1, max: 100, step: 1},
  { label: 'Y', value: 50, min: 1, max: 100, step: 1},
])]);



onmessage = function(e) {
  const [ config, pixData ] = e.data;

  const spacing   = parseFloat(config.Spacing);
  const threshold = parseFloat(config.Threshold);
  const threshold2 = config['Threshold 2']

  const getPixel = pixelProcessor(config, pixData)
  
  const cx = config.width / (100 / config.X);
  const cy = config.height / (100 / config.Y);
  let points = [];
  let lines = [];

  let x = cx, y = cy;
  let radius = 1;
  let theta = 0;
  let storex, storey;
  let lastpixelval = 0;

  while ( (x>0 && y>0) || (x<config.width && y<config.height) ) {

    let incr = Math.asin(1/radius);
    radius +=incr*spacing;
    theta +=incr;
    x = Math.floor( cx + radius*Math.sin(theta));
    y = Math.floor( cy + radius*Math.cos(theta));
    pixelval = getPixel(x,y);

    if (pixelval > threshold) {
      lines.push([[storex,storey], [x,y]]);
    }
    lastpixelval = pixelval;
    storex = x, storey = y;
  }

  points = lines;
  lines = [];
  radius = 1;
  theta = 0;
  lastpixelval = 0;
  storex = cx, storey = cx;
  x = cx, y = cy;
  while ( (x>0 && y>0) || (x<config.width && y<config.height) ) {

    let incr = Math.asin(1/radius);
    radius +=incr*spacing;
    theta +=incr;
    x = Math.floor( cx + (radius + (spacing * 3)) * Math.sin(theta));
    y = Math.floor( cy + (radius + (spacing * 3)) * Math.cos(theta));
    pixelval = getPixel(x,y);

    if (pixelval > threshold2) {
      lines.push([[storex,storey], [x,y]]);
    }
    lastpixelval = pixelval;
    storex = x, storey = y;
  }
  points = points.concat(lines)
  if (points.length > 0)
    postLines( points);
}


