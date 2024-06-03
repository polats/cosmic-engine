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
 
  const svgExample = 
  `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" viewBox="0 0 300 140">
  <text svgjs:data="{&quot;leading&quot;:&quot;1.3&quot;}">
    <textPath xlink:href="#SvgjsPath1000" svgjs:data="{&quot;leading&quot;:&quot;1.3&quot;}">
      <tspan svgjs:data="{&quot;leading&quot;:&quot;1.3&quot;}">Dragon----- - - - -&gt;</tspan>
    </textPath>
  </text>
  <defs>
    <path d="M10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" id="SvgjsPath1000"></path>
  </defs>
</svg>
  `
  
  svgCanvas.svg(svgExample);


  const textPath = SVG("textPath");

// retrieve mouth path
  const cap = SVG("#eyes");

  cap.animate().move(150, 150);

  console.log(svgCanvas.svg())


  return new Response(svgCanvas.svg(), { headers: { 'content-type': 'image/svg+xml' } });
}