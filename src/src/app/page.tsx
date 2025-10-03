"use client";
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useState } from "react";

type DetectedFace = {
  faceId?: string;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  faceAttributes?: Record<string, unknown>;
};

type FaceApiResponse = DetectedFace[];

const exampleImage =
  "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-sample-data-files/master/ComputerVision/Images/faces.jpg";

type UiError = {
  message: string;
  details?: string;
};

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>(exampleImage);
  const [faces, setFaces] = useState<FaceApiResponse>([]);
  const [error, setError] = useState<UiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasResults = faces.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!imageUrl.trim()) {
      setError({ message: "Please provide an image URL." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setFaces([]);

    try {
      const response = await fetch("/api/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });

      const text = await response.text();
      const data = safeParseJson(text);

      if (!response.ok) {
        const details = typeof data === "object" && data !== null && "details" in data ? data.details : text;
        throw new Error(
          typeof data === "object" && data !== null && "error" in data
            ? String(data.error)
            : "Failed to call the Face API",
          { cause: details },
        );
      }

      setFaces(Array.isArray(data) ? (data as FaceApiResponse) : []);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "Unexpected error while contacting the Face API";
      const detailsRaw = caughtError instanceof Error && "cause" in caughtError ? caughtError.cause : undefined;
      const formattedDetails = formatErrorDetails(detailsRaw);

      setError({
        message,
        details: formattedDetails,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold sm:text-4xl">Azure Face API demo</h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Enter a publicly accessible image URL and the sample will forward it to your Azure Face API resource using a Next.js
            route handler.
          </p>
          <p className="text-sm text-slate-400">
            Before running locally, create a <code className="rounded bg-slate-800 px-1">.env.local</code> file with
            <code className="rounded bg-slate-800 px-1">AZURE_FACE_ENDPOINT</code> and
            <code className="rounded bg-slate-800 px-1">AZURE_FACE_KEY</code>. The endpoint should include the protocol, for
            example <code className="rounded bg-slate-800 px-1">https://your-resource.cognitiveservices.azure.com</code>.
          </p>
        </header>

        <section className="grid gap-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-slate-950/40">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200 sm:text-base">
              Image URL
              <input
                className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 shadow-inner shadow-black focus:border-sky-500 focus:outline-none"
                placeholder="https://example.com/photo.jpg"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                type="url"
                required
              />
            </label>
            <button
              className="flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Analyzing…" : "Analyze faces"}
            </button>
          </form>

          <div className="grid gap-4 sm:grid-cols-2 sm:items-start sm:gap-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-100">Image preview</h2>
              <p className="text-sm text-slate-400">
                The Face API requires the image to be publicly accessible. You can start with the prefilled sample image.
              </p>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
                <img src={imageUrl} alt="Preview" className="h-auto w-full" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-semibold text-slate-100">Detection results</h2>
              <p className="text-xs text-slate-500">
                Requests use detection model <code className="rounded bg-slate-800 px-1">detection_03</code> and only ask for
                allowed attributes (head pose, glasses, mask, occlusion, blur, exposure, and quality for recognition).
              </p>
              {isLoading && <p className="text-sm text-slate-400">Calling Azure Face API…</p>}
              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                  <p className="font-semibold">{error.message}</p>
                  {error.details && (
                    <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded bg-red-500/20 p-2 text-xs text-red-100">
                      {error.details}
                    </pre>
                  )}
                </div>
              )}
              {!isLoading && !error && !hasResults && (
                <p className="text-sm text-slate-400">
                  Submit an image to see detected faces, bounding box coordinates, and any additional metadata returned by
                  Azure.
                </p>
              )}
              <ul className="flex flex-col gap-3 text-sm text-slate-200">
                {faces.map((face, index) => {
                  const attributeKeys = face.faceAttributes ? Object.keys(face.faceAttributes) : [];
                  const hasAttributes = attributeKeys.length > 0;
                  const faceLabel = face.faceId ? `Face ${index + 1} (ID ${face.faceId})` : `Face ${index + 1}`;

                  return (
                    <li
                      key={face.faceId ?? `${index}-${face.faceRectangle.top}-${face.faceRectangle.left}`}
                      className="rounded-lg border border-slate-800 bg-slate-950 p-3"
                    >
                      <p className="font-semibold text-slate-100">{faceLabel}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        Rectangle — top: {face.faceRectangle.top}, left: {face.faceRectangle.left}, width:
                        {face.faceRectangle.width}, height: {face.faceRectangle.height}
                      </p>
                      {hasAttributes && (
                        <details className="mt-2 rounded border border-slate-800 bg-slate-900 p-2">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-100">
                            Face attributes ({attributeKeys.join(", ")})
                          </summary>
                          <pre className="mt-2 overflow-auto rounded bg-slate-950 p-2 text-xs text-slate-300">
                            {JSON.stringify(face.faceAttributes, null, 2)}
                          </pre>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ul>
              {hasResults && (
                <details className="rounded-lg border border-slate-800 bg-slate-950 p-3 text-sm text-slate-200">
                  <summary className="cursor-pointer font-semibold text-slate-100">View raw response</summary>
                  <pre className="mt-2 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-300">
                    {JSON.stringify(faces, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function formatErrorDetails(details: unknown) {
  if (details === undefined || details === null) {
    return undefined;
  }

  if (typeof details === "string") {
    return details;
  }

  try {
    return JSON.stringify(details, null, 2);
  } catch {
    return String(details);
  }
}

function safeParseJson(payload: string) {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
