importScripts('../helpers.js', '../external/stackblur.min.js')

postMessage(['sliders', defaultControls.concat([
  {label: 'Direction', type:'select', options:['Horizontal', 'Vertical', 'Spiral cw', 'Spiral ccw']},
  {label: 'Line Count', value: 50, min: 10, max: 200},
  {label: 'Sublines', value: 3, min: 2, max: 10},
  {label: 'Amplitude', value: 1, min: 0.1, max: 5, step: 0.1},
  {label: 'Sampling', value: 5, min: 0.5, max: 5, step: 0.1},
])]);


onmessage = function(e) {
  const [ config, pixData ] = e.data;

  // Blurring the image will give less distorted results
  StackBlur.imageDataRGB(pixData, 0,0,config.width,config.height, Math.floor(config.Sampling));
  const getPixel = pixelProcessor(config, pixData);

  const height = config.height - 1;
  const width  = config.width;

  const lineCount = config['Line Count'];
  const sublines  = config['Sublines'];
  const direction = config.Direction;
  const amplitude = config.Amplitude / sublines / lineCount;
  const precision = 6 - config.Sampling;

  let squiggleData = [];
  let lastr = -1;

  switch (direction) {

    case 'Spiral cw':
    case 'Spiral ccw': {
      const cx = config.width / 2;
      const cy = config.height / 2;
      const spacing = width / 5 / config['Line Count'];
      let squiggleData2 = [];

      for (let j = 0; j < sublines; j++) {
        let radius = 5;
        let theta = 0;
        let x = cx, y = cy;
        let line  = [];
        let line2 = [];
        while ((x > 0 && y > 0) && (x < width && y < height)) {
            z = getPixel( x , y );
            let displacement = z * amplitude * 2 * j;
            line.push([
              cx + (radius + displacement) * Math.sin(theta) ,
              cy + (radius + displacement) * Math.cos(theta)
            ])
            if (j > 0) { // The centerline does not need to be doubled
              line2.push([
              cx + (radius - displacement) * Math.sin(theta) ,
              cy + (radius - displacement) * Math.cos(theta)
              ])
            }
          let incr = Math.asin(1/radius);
          radius += incr * spacing;
          switch (direction) {
            case 'Spiral cw':  theta  -= incr; break;
            case 'Spiral ccw': theta  += incr;
          }
          x = Math.floor( cx + radius * Math.sin(theta));
          y = Math.floor( cy + radius * Math.cos(theta));
        }
        squiggleData.push(line);
        if (j > 0) squiggleData2.push(line2);
      }
      squiggleData = squiggleData.concat(squiggleData2)
    } break;

    case 'Vertical': {
    const incr_x    = Math.floor(height / lineCount);
    const incr_y    = config.Sampling;
    for (let x = 0; x <= width; x += incr_x) {
      let r_sum = 0;
      for (let j = 0; j < sublines; j++) {
        let line = [];
        let z = getPixel(x, 0)
        let r = amplitude * j * z;
        line.push([x + r,0]);
        for (let y = 0; y <= height; y += incr_y) {
          z = getPixel(x, y)
          r = amplitude * j * z;
          if (r.toFixed(precision) != lastr.toFixed(precision) ) {
            line.push([x + r, y]);
            lastr = r;
          }
          r_sum += r;
        } 
        z = getPixel(x, height)
        r = amplitude * j * z;
        line.push([x + r, height]);
        if (r_sum > 10) { // The centerline does not need to be doubled
          line.push([x - r, height])
          for (let y = height; y > 0 ; y -= incr_y) {
            let z = getPixel(x, y)
            let r = amplitude * j * z;
            if (r.toFixed(precision) != lastr.toFixed(precision)) {
              line.push([x - r, y]);
              lastr = r;
            }
          }
          z = getPixel(x, 0)
          r = amplitude * j * z;
          line.push([x - r,0])
        }
        squiggleData.push(line)
      }
    }
  } break;

  default: // Horizontal
    const incr_x    = config.Sampling;
    const incr_y    = Math.floor(width / lineCount);
    for (let y = 0; y <= height; y += incr_y) {
      let r_sum = 0;
      for (let j = 0; j < sublines; j++) {
        let line = [];
        line.push([0, y + (amplitude * j * getPixel(0, y))])
        for (let x = 0; x < width; x += incr_x) {
          let z = getPixel(x, y)
          let r = amplitude * j * z;
          if (r.toFixed(precision) != lastr.toFixed(precision)) {
            line.push([x, y + r]);
            lastr = r;
          }
          r_sum += r;
        } 
        line.push([width, y + (amplitude * j * getPixel(width, y))]);
        if (r_sum > 10) { // The centerline does not need to be doubled
          line.push([width, y - (amplitude * j * getPixel(width, y))])
          for (let x = width; x >=0 ; x -= incr_x) {
            let z = getPixel(x, y)
            let r = amplitude * j * z;
            if (r.toFixed(precision) != lastr.toFixed(precision)) {
              line.push([x, y - r]);
              lastr = r;
            }
          } 
          line.push([0, y - (amplitude * j * getPixel(0, y))])
        }
        squiggleData.push(line)
      }
    }
  }
  if (squiggleData.length > 0)
    postLines(squiggleData);
}

