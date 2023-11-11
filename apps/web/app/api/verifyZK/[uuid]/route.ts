export async function GET(
  request: Request,
  { params }: { params: { uuid: string } },
  response: Response
) {
  try {
    const uuid = params.uuid;
    // simulate delay for POC
    // await new Promise(resolve => setTimeout(resolve, 5000));
    // let { data, error } = await supabase.from("zk").select("*");

    // placeholder for POC, replace with zk verifier
    const res: any = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/verify/${uuid}`
    );
    if (res.ok && res.verified === "true") {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        error: "ZK Proof not verified for uuid",
      }),
      {
        status: 400,
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
