import sharp from 'sharp';
import { promises as fs } from 'fs';
import { parse, stringify } from 'svgson';

export async function GET(request, { params }) {

  const file = await fs.readFile(process.cwd() + '/svgs/reggie.svg');

  const obj = await parse(file);

  // change fill
  obj.children[0].children[0].children[0].children[1].attributes.fill = '#FF8800';

  const updatedSvg = stringify(obj);
  const imgBuffer = Buffer.from(updatedSvg);

  const newReggie = 
    await sharp(imgBuffer)     
      .resize(640, 640)
      .png().toBuffer();
 
  return new Response(newReggie, { headers: { 'content-type': 'png' } });
}