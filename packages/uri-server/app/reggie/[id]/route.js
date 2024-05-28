import sharp from 'sharp';
import { parse, stringify } from 'svgson';

import { promises as fs } from 'fs';
import { createSVGWindow } from 'svgdom'
import { SVG, registerWindow } from '@svgdotjs/svg.js'

export async function GET(request, { params }) {

  // returns a window with a document and an svg root node
  const window = createSVGWindow()
  const document = window.document

  // register window and document
  registerWindow(window, document)

  // create canvas
  const svgCanvas = SVG(document.documentElement)

  // load svg
  const svgString = await fs.readFile(process.cwd() + '/svgs/reggie.svg');

  // add svg to canvas
  svgCanvas.svg(svgString);

  // retrieve mouth path
  const mouth = SVG("#mouth path");

  // change stroke color
  mouth.stroke("#FF8800");

  // rotate mouth
  mouth.transform({ rotate: 180 });

  // increase scale
  mouth.scale(1.5);

  // console.log(SVG("#mouth").children()[0].attr({
  //   "stroke": "#FF8800"
  //   }
  // ));

  // SVG("#mouth").stroke("#FF8800")

  // parse with svgson
  // const obj = await parse(file);

  // change fill
  // obj.children[0].children[0].children[0].children[1].attributes.fill = '#FF8800';
  
  // const updatedSvg = stringify(obj);
  // const imgBuffer = Buffer.from(updatedSvg);

  // const newReggie = 
  //   await sharp(imgBuffer)     
  //     .resize(640, 640)
  //     .png().toBuffer();
 
  return new Response(svgCanvas.svg(), { headers: { 'content-type': 'image/svg+xml' } });
}