import jsonObject from "/app/data.json" assert { type: "json" };

export async function GET(request, { params }) {

  let metadata = {...jsonObject.base_metadata}

  metadata.name = jsonObject.name + " #" + params.id
  metadata.image = jsonObject.base_metadata.image + "/" + params.id
  // metadata.animation_url = jsonObject.base_metadata.animation_url + "/" + params.id

  return new Response(JSON.stringify(metadata));
  }