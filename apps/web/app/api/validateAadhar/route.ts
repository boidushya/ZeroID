import { CONTENT } from "@/constants";

export async function POST(request: Request, response: Response) {
  try {
    const { aadhar } = await request.json();

    if (!aadhar || /^\d{12}$/.test(aadhar) === false) {
      // Return a "bad request" response code for invalid/missing aadhar numbers
      return new Response(
        JSON.stringify({ error: "Aadhar number was invalid or missing" }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    // Fetch OTP for aadhar from "database"
    const contentEntry = CONTENT.find(entry => entry.aadhar === aadhar);
    if (!contentEntry) {
      // Return a "not found" response code for invalid aadhar numbers
      return new Response(
        JSON.stringify({ error: "Aadhar number was not found" }),
        {
          status: 404,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

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
