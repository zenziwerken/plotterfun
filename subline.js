importScripts('helpers.js', 'external/stackblur.min.js')

postMessage(['sliders', defaultControls.concat([
  {label: 'Direction', type:'select', options:['Horizontal', 'Vertical', 'Spiral cw', 'Spiral ccw']},
  {label: 'Line Count', value: 50, min: 10, max: 200},
  {label: 'Sublines', value: 3, min: 1, max: 10},
  {label: 'Amplitude', value: 1, min: 0.1, max: 5, step: 0.1},
  {label: 'Smoothing', value: 5, min: 1, max: 5, step: 0.1},
  {label: 'Cutoff', value: 0, min: 0, max: 255, step: 1},
])]);


onmessage = function(e) {
  const [ config, pixData ] = e.data;

  // Blurring the image will give less distorted results
  StackBlur.imageDataRGB(pixData, 0,0,config.width,config.height, Math.floor(config.Smoothing));
  const getPixel = pixelProcessor(config, pixData);

  const height = config.height - 1;
  const width  = config.width;

  const lineCount = config['Line Count'];
  const sublines  = config['Sublines'];
  const direction = config.Direction;
  const cutoff = config.Cutoff;
  const amplitude = config.Amplitude / sublines / lineCount;
  const precision = 6 - config.Smoothing;

  let squiggleData = [];
  let squiggleData2 = [];

  switch (direction) {

    case 'Spiral cw':
    case 'Spiral ccw': {
      const cx = config.width / 2;
      const cy = config.height / 2;
      const spacing = width / 5 / config['Line Count'];
      

      for (let j = 0; j <= sublines; j++) {
        let radius = 5;
        let theta = 0;
        let x = cx, y = cy;
        let line  = [];
        let line2 = [];
        while ((x > 0 && y > 0) && (x < width && y < height)) {
            z = getPixel(x,y);
            let sin = Math.sin(theta);
            let cos = Math.cos(theta);
            if (z < cutoff && line.length > 0) {
              line.push([ cx + radius * sin,cy + radius * cos]);
              line2.push([cx + radius * sin,cy + radius * cos]);
              squiggleData.push(line);
              if (j > 0) squiggleData2.push(line2);
              line  = []; line2 = [];
            }
            if (z >= cutoff) {
              if (line.length < 1) {
                line.push([ cx + radius * sin,cy + radius * cos]);
                line2.push([cx + radius * sin,cy + radius * cos]);
              }
              let displacement = z * amplitude * 2 * j;
              line.push([cx + (radius + displacement) * sin, cy + (radius + displacement) * cos ]);
              if (j > 0)  // The centerline does not need to be doubled
                line2.push([cx + (radius - displacement) * sin, cy + (radius - displacement) * cos]);
            }
          let incr = Math.asin(1/radius);
          radius += incr * spacing;
          switch (direction) {
            case 'Spiral cw':  theta  -= incr; break;
            case 'Spiral ccw': theta  += incr;
          }
          x = Math.floor( cx + radius * sin);
          y = Math.floor( cy + radius * cos);
        }
        if (line.length > 0)
          squiggleData.push(line);
        if (j > 0 && line2.length > 0) squiggleData2.push(line2);
      }
      squiggleData = squiggleData.concat(squiggleData2)
    } break;

    case 'Vertical': {
      const incr_x    = Math.floor(height / lineCount);
      const incr_y    = config.Smoothing;
      for (let x = 0; x <= width; x += incr_x) {
        for (let j = 0; j <= sublines; j++) {
          let line  = [];
          let line2 = [];
          let lastr = -1;
          let r
          for (let y = 0; y <= height; y += incr_y) {
            let z = getPixel(x, y)
            r = amplitude * j * z;
            if (z < cutoff && line.length > 0) {
              line.push( [x, y]);
              line2.push([x, y]);
              squiggleData.push(line);
              if (j > 0) squiggleData2.push(line2.reverse());
              line  = []; line2 = [];
            }
            if (z >= cutoff) {
              if (line.length < 1) {
                line.push( [x, y]);
                line2.push([x, y]);
              }
              if (r.toFixed(precision) != lastr.toFixed(precision) ) {
                line.push( [x + r, y]);
                line2.push([x - r, y]);
                lastr = r;
              }
            }
          }
          line.push( [x + r, height]);
          line2.push([x - r, height]);
          if (line.length > 0)
            squiggleData.push(line);
          if (line2.length > 0)
            squiggleData2.push(line2.reverse()); 
        }
      }
      squiggleData = squiggleData.concat(squiggleData2)
    } break;

    default: // Horizontal
    const incr_x    = config.Smoothing;
    const incr_y    = Math.floor(width / lineCount);
    for (let y = 0; y <= height; y += incr_y) {
      for (let j = 0; j <= sublines; j++) {
        let line  = [];
        let line2 = [];
        let lastr = -1;
        let r
        for (let x = 0; x <= width; x += incr_x) {
          let z = getPixel(x, y)
          r = amplitude * j * z;
          if (z < cutoff && line.length > 0) {
            line.push( [x, y]);
            line2.push([x, y]);
            squiggleData.push(line);
            if (j > 0) squiggleData2.push(line2.reverse());
            line  = []; line2 = [];
          }
          if (z >= cutoff) {
            if (line.length < 1) {
              line.push( [x, y]);
              line2.push([x, y]);
            }
            if (r.toFixed(precision) != lastr.toFixed(precision) ) {
              line.push( [x, y + r]);
              line2.push([x, y - r]);
              lastr = r;
            }
          }
        }
        line.push( [width, y + r]);
        line2.push([width, y + r]);
        squiggleData.push(line);
        squiggleData2.push(line2.reverse()); 
      }
    }
    squiggleData = squiggleData.concat(squiggleData2)
  }
  if (squiggleData.length > 0)
    postLines(squiggleData);
}

