/**
 * Based on linescan by Algorithm by j-waal
 */

importScripts('helpers.js')

postMessage(['sliders', defaultControls.concat([
    { label: 'Minlength', value: 2, min: 0, max: 32, step: 1 },

    { label: 'Spacing horizontal',   value:  12, min: 1, max:  20, step: 1 },
    { label: 'Threshold horizontal', value:  60, min: 0, max: 255, step: 1 },

    { label: 'Spacing down',   value:  9, min: 1, max:  20, step: 1 },
    { label: 'Threshold down', value:  120, min: 0, max: 255, step: 1 },

    { label: 'Spacing up',     value:   5, min: 1, max:  20, step: 1 },
    { label: 'Threshold up',   value: 200, min: 0, max: 255, step: 1 },
])]);



onmessage = function (e) {
    const [config, pixData] = e.data;
    const getPixel = pixelProcessor(config, pixData)

    // User variables
    const minlength = config.Minlength // dont output short line segments

    const spacing_h   = config['Spacing horizontal']
    const spacing_d   = config['Spacing down']
    const spacing_u   = config['Spacing up']

    const threshold_h = config['Threshold horizontal']
    const threshold_d = config['Threshold down']
    const threshold_u = config['Threshold up']

    const w = config.width
    const h = config.height
    
    function inside(x,y){ return (x>=0 && y>=0 && x<w && y<h) }
    
    let points = [];

    for (let y = 0; y <= h; y += spacing_h) {
        let mode = false
        let thisline = []
        let storex, storey
        for (let x = 0; x <= w; x++) {
            if (inside(x,y)) {
                pixelval = getPixel(x,y);
                if (pixelval > threshold_h && mode == false) {
                    mode = true
                    storex = x, storey = y;
                }
                if (pixelval < threshold_h && mode == true ) {
                    if (x - storex > minlength) {
                        thisline.push([[storex,storey], [x,y]]);
                    }
                    mode = false
                }
            }
        }
        if (mode == true) {
            thisline.push([[storex,storey], [w ,y]]);
        }
        points = points.concat(thisline)
    }

    for (let y = -(w + h); y <= (w + h); y += spacing_d) {
        let mode = false
        let thisline = []
        let storex, storey
        let yy
        for (let x = 0; x <= (2 * w); x++) {
            yy = y + x
            if (inside(x,yy)) {
                pixelval = getPixel(x,yy);
                if (pixelval > threshold_d && mode == false) {
                    mode = true
                    storex = x, storey = yy;
                }
                if (pixelval < threshold_d && mode == true ) {
                    if (yy - storey > minlength / 2) {
                        thisline.push([[storex,storey], [x,yy]]);
                    }
                    mode = false
                }
            }
        }
        if (mode == true) {
            thisline.push([[storex,storey], [h - y ,h]]);
        }
        points = points.concat(thisline)
    }

    for (let y = (w + h); y >= -(w + h); y -= spacing_u) {
        let mode = false
        let thisline = []
        let storex, storey
        let yy
        for (let x = w; x >= -w; x--) {
            yy = y - x
            if (inside(x,yy)) {
                pixelval = getPixel(x,yy);
                if (pixelval > threshold_u && mode == false) {
                    mode = true
                    storex = x, storey = yy;
                }
                if (pixelval < threshold_u && mode == true ) {
                    if (yy - storey > minlength / 2) {
                        thisline.push([[storex,storey], [x,yy]]);
                    }
                    mode = false
                }
            }
        }
        if (mode == true) {
            thisline.push([[storex,storey], [0 ,y]]);
        }
        points = points.concat(thisline)
    }

    if (points.length > 0)
        postLines(points);
        

}
