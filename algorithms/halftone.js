importScripts('helpers.js', '../external/stackblur.min.js')

postMessage(['sliders', defaultControls.concat([
  { label: 'Divisions', value: 25, min: 10, max: 100 },
  { label: 'Factor', value: 100, min: 10, max: 400 },
  { label: 'Cutoff', value: 1, min: 1, max: 254 },
  { label: 'Interlaced', type: 'checkbox' },
  { label: 'Filled', type: 'checkbox' },
  { label: 'Type', type:'select', options:['Circles', 'Diamond', 'Squares']},
])]);


onmessage = function (e) {
  const [config, pixData] = e.data;

  const major = (config.width + config.height) / config.Divisions / 2;
  const interlaced = config.Interlaced;
  const filled = config.Filled;
  const factor = config.Factor;
  const type = config.Type;

  StackBlur.imageDataRGB(pixData, 0, 0, config.width, config.height, Math.round(major / 2))
  const getPixel = pixelProcessor(config, pixData)

  let hm = major / 2
  let tog = false
  let circles  = []
  let lines    = []
  let polygons = []

  for (let y = hm; y < config.height; y += major) {
    tog = !tog;
    let xOff = (interlaced && tog) ? major / 2 : 0;
    for (let x = hm + xOff; x < config.width; x += major) {
      //circles in the pixel center
      let z = getPixel(x, y);
      if (z < config.Cutoff) continue;
      let radius = z * hm / 255 * factor / 100;

      switch (type) {

        case 'Squares': {
          let r_end = (filled) ? 0 : radius;
          for (r = radius; r >= r_end; r--) {
            let cube = [ [x - r,y - r], [x + r,y - r], [x + r, y + r], [x - r, y + r] ];
            polygons.push(cube);
          }
        } break;

        case 'Diamond': {
          let r = radius;
          let r_end = (filled) ? 0 : radius;
          for (r = radius; r >= r_end; r--) {
            let diamond = [ [x,y + r], [x + r,y], [x, y - r], [x - r,y] ];
            polygons.push(diamond);
          }
        } break;

        default: { //Circles
          if (filled) {
            // adapted from stipple.js
            let theta = 0, spiral = []
            if (radius >= 0.2) {
              while (radius >= 0.1) {
                spiral.push( [(x - hm / 2) + radius * Math.cos(theta), (y - hm / 2) + radius * Math.sin(theta)] )
                theta += 0.5
                if (theta > 6.3) radius -= 0.1 //do one full loop before spiraling in
              }
            }
            if (spiral.length > 0)
              lines.push(spiral);
          } else {
            circles.push({ x: x - hm / 2, y: y - hm / 2, r: radius });
          }
        }
      }
    }
  }

  if (circles.length > 0)
    postCircles(circles);

  if (lines.length > 0)
    postLines(lines);

  if (polygons.length > 0)
    postPolygons(polygons);
}

