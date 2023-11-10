import supabase from "@/utils/supabase";

export async function GET(
  request: Request,
  { params }: { params: { uuid: string } },
  response: Response
) {
  try {
    const uuid = params.uuid;
    // simulate delay for POC
    await new Promise(resolve => setTimeout(resolve, 5000));
    let { data, error } = await supabase.from("zk").select("*");

    // placeholder for POC, replace with zk verifier
    const existing = data?.find((x: any) => x.uuid === uuid);
    if (!existing) {
      return new Response(JSON.stringify({ error: "uuid not found" }), {
        status: 404,
        headers: {
          "content-type": "application/json",
        },
      });
    }
    if (existing.zk === "placeholder") {
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
