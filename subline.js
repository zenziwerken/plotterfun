importScripts('helpers.js')

postMessage(['sliders', defaultControls.concat([
  {label: 'Line Count', value: 50, min: 10, max: 200},
  {label: 'Sublines', value: 3, min: 1, max: 10},
  {label: 'Amplitude', value: 1, min: 0.1, max: 5, step: 0.1},
  {label: 'Sampling', value: 1, min: 0.5, max: 5, step: 0.1},
  { label: 'Direction', type:'select', options:['Horizontal', 'Vertical']},
])]);


onmessage = function(e) {
  const [ config, pixData ] = e.data;
  const getPixel = pixelProcessor(config, pixData)

  const height = config.height - 1;

  const lineCount = config['Line Count'];
  const sublines  = config['Sublines'];
  const direction = config.Direction;
  const amplitude = config.Amplitude / sublines / lineCount;
  

  const precision = 6 - config.Sampling;

  let squiggleData = [];

  let lastr = -1;
  
  if (direction == 'Vertical') {

    const incr_x    = Math.floor(height / lineCount);
    const incr_y    = config.Sampling;
    for (let x = 0; x <= config.width; x += incr_x) {
      for (let j = 0; j < sublines; j++) {
        let line = [];
        let r_sum = 0;
  
        line.push([x + (amplitude * j * getPixel(x,0)),0])
  
        for (let y = 0; y <= height; y += incr_y) {
          let z = getPixel(x, y)
          let r = amplitude * j * z;
          if (r.toFixed(precision) != lastr.toFixed(precision)) {
            line.push([x + r, y]);
            lastr = r;
          }
          r_sum += r;
        } 
        line.push([x + (amplitude * j * getPixel(x, height)), height]);
  
        if (r_sum > 1) {
          line.push([x - (amplitude * j * getPixel(height, x)), height])
          for (let y = height; y >=0 ; y -= incr_y) {
            let z = getPixel(x, y)
            let r = amplitude * j * z;
            if (r.toFixed(precision) != lastr.toFixed(precision)) {
              line.push([x - r, y]);
              lastr = r;
            }
          } 
          line.push([x - (amplitude * j * getPixel(x,0)),0])
        }
        
        squiggleData.push(line)
      }
    }
  } else {
    const incr_x    = config.Sampling;
    const incr_y    = Math.floor(config.width / lineCount);

    for (let y = 0; y <= height; y += incr_y) {
      for (let j = 0; j < sublines; j++) {
        let line = [];
        let r_sum = 0;
  
        line.push([0, y + (amplitude * j * getPixel(0, y))])
        for (let x = 0; x < config.width; x += incr_x) {
          let z = getPixel(x, y)
          let r = amplitude * j * z;
          if (r.toFixed(precision) != lastr.toFixed(precision)) {
            line.push([x, y + r]);
            lastr = r;
          }
          r_sum += r;
        } 
        line.push([config.width, y + (amplitude * j * getPixel(config.width, y))]);
  
        if (r_sum > 1) {
          line.push([config.width, y - (amplitude * j * getPixel(config.width, y))])
          for (let x = config.width; x >=0 ; x -= incr_x) {
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
//if (squiggleData > 0) 
postLines(squiggleData);
}

