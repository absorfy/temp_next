import { NextRequest, NextResponse } from "next/server";

const endpoint = process.env.AZURE_FACE_ENDPOINT;
const apiKey = process.env.AZURE_FACE_KEY;

export async function POST(request: NextRequest) {
  if (!endpoint || !apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing Azure Face API credentials. Set AZURE_FACE_ENDPOINT and AZURE_FACE_KEY in your environment.",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || !("imageUrl" in body)) {
    return NextResponse.json({ error: "Request must include an imageUrl field" }, { status: 400 });
  }

  const { imageUrl } = body as { imageUrl: unknown };

  if (typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
    return NextResponse.json({ error: "imageUrl must be a non-empty string" }, { status: 400 });
  }

  const trimmedEndpoint = endpoint.replace(/\/$/, "");
  const detectUrl =
    `${trimmedEndpoint}/face/v1.0/detect` +
    "?returnFaceId=true" +
    "&recognitionModel=recognition_04" +
    "&returnFaceAttributes=age,emotion,smile,facialHair,glasses";

  try {
    const azureResponse = await fetch(detectUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
      body: JSON.stringify({ url: imageUrl }),
    });

    const text = await azureResponse.text();

    const parsedBody = safeParseJson(text) ?? text;

    if (!azureResponse.ok) {
      const isAuthError = azureResponse.status === 401 || azureResponse.status === 403;
      const message = isAuthError
        ? "Azure rejected the request. Double-check that your Face API resource is approved for use and that the endpoint and key belong to the same resource."
        : "Azure Face API request failed";

      console.error("Azure Face API error", {
        status: azureResponse.status,
        body: parsedBody,
      });

      return NextResponse.json(
        {
          error: message,
          details: parsedBody,
        },
        { status: azureResponse.status },
      );
    }

    return NextResponse.json(parsedBody);
  } catch (error) {
    console.error("Unexpected error calling Azure Face API", error);
    return NextResponse.json(
      {
        error: "Unexpected error calling Azure Face API",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
