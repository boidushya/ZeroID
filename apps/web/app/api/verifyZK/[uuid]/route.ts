export async function GET(request: Request, response: Response) {
  try {
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
