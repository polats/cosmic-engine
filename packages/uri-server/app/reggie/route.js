export async function GET(request, { params }) {
    // we will use params to access the data passed to the dynamic route
    return new Response(`reggie route`);
  }