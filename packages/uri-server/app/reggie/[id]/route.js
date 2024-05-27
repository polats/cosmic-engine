import sharp from 'sharp';
import { promises as fs } from 'fs';
import { parse, stringify } from 'svgson';

export async function GET(request, { params }) {

  const PUBLIC_FOLDER = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ?
    "https://" + process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL :
    "public";


  const file = await fs.readFile(PUBLIC_FOLDER + '/reggie.svg');

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