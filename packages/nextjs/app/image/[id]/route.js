import makeBlockie from 'ethereum-blockies-base64';

export async function GET(request, { params }) {

  const seed = params.id;

  const img = makeBlockie(seed).toString().replace("data:image/png;base64,", "");
  const imgResp = new Buffer.from(img, 'base64');

  // we will use params to access the data passed to the dynamic route
  return new Response(imgResp, { headers: { 'content-type': 'image/png;base64' } });
}