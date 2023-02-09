postMessage(['sliders', defaultControls.concat([
  { label: 'Threshold',  value: 100, min: 0, max: 255, step: 1 },
  { label: 'Threshold 2',value: 200, min: 0, max: 255, step: 1 },
  { label: 'Spacing', value: 1, min: 0.5, max: 5, step: 0.1},
  { label: 'X', value: 50, min: 1, max: 100, step: 1},
  { label: 'Y', value: 50, min: 1, max: 100, step: 1},
])]);



onmessage = function(e) {
  const [ config, pixData ] = e.data;

  const spacing    = parseFloat(config.Spacing);
  const threshold  = config.Threshold;
  const threshold2 = config['Threshold 2']

  const getPixel = pixelProcessor(config, pixData)
  
  const cx = config.width / (100 / config.X);
  const cy = config.height / (100 / config.Y);

  let lines = [];
  let lines2 = [];

  let x = cx, y = cy;
  let radius = 1;
  let theta = 0;
  let storex = x,  storey = y
  let storex2 = x, storey2 = y;

  while ( (x>0 && y>0) || (x<config.width && y<config.height) ) {

    let incr = Math.asin(1/radius);
    radius +=incr*spacing;
    theta +=incr;
    x = Math.floor( cx + radius*Math.sin(theta));
    y = Math.floor( cy + radius*Math.cos(theta));

    if (getPixel(x,y) > threshold) {
      lines.push([[storex,storey], [x,y]]);
    }
    storex = x, storey = y;
    
    x = Math.floor( cx + (radius + (spacing * 3)) * Math.sin(theta));
    y = Math.floor( cy + (radius + (spacing * 3)) * Math.cos(theta));

    if (getPixel(x,y) > threshold2) {
      lines2.push([[storex2,storey2], [x,y]]);
    }
    storex2 = x, storey2 = y;
  }

  lines = lines.concat(lines2)
  if (lines.length > 0)
    postLines(lines);
}


