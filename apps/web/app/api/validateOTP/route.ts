import crypto from "crypto";
import { promises as fs } from "fs";
import { CONTENT } from "@/constants";

export async function POST(request: Request, response: Response) {
  try {
    const { aadhar, OTP } = await request.json();

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

    // If OTP is correct, return a "success" response code and return the content except the OTP
    const { otp: verifyOTP, ...content } = contentEntry;

    if (verifyOTP === OTP) {
      const uuid = crypto.randomUUID();

      const file = await fs.readFile(
        process.cwd() + "/constants/zk.json",
        "utf8"
      );
      const data = JSON.parse(file);

      const existing = data.find(
        (x: any) => x.uuid === uuid || x.aadhar === aadhar
      );
      if (existing) {
        return new Response(
          JSON.stringify({
            uuid: existing.uuid,
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
            },
          }
        );
      }
      // Loading time to simulate a ZK creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      data.push({ uuid, zk: "placeholder", aadhar });
      await fs.writeFile(
        process.cwd() + "/constants/zk.json",
        JSON.stringify(data),
        "utf8"
      );

      return new Response(
        JSON.stringify({
          uuid,
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: "OTP was invalid or missing" }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
