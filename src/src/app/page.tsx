"use client";
/* eslint-disable @next/next/no-img-element */

import { FormEvent, useMemo, useState } from "react";

type FaceApiAttributes = {
  age?: number;
  emotion?: Record<string, number>;
  smile?: number;
  facialHair?: {
    moustache: number;
    beard: number;
    sideburns: number;
  };
  glasses?: string;
};

type FaceApiResponse = {
  faceId: string;
  faceRectangle: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  faceAttributes?: FaceApiAttributes;
}[];

const exampleImage =
  "https://raw.githubusercontent.com/Azure-Samples/cognitive-services-sample-data-files/master/ComputerVision/Images/faces.jpg";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string>(exampleImage);
  const [faces, setFaces] = useState<FaceApiResponse>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const hasResults = faces.length > 0;

  const formattedFaces = useMemo(() => {
    return faces.map((face) => {
      const details: string[] = [];

      if (face.faceAttributes?.age !== undefined) {
        details.push(`Estimated age: ${face.faceAttributes.age}`);
      }

      if (face.faceAttributes?.smile !== undefined) {
        details.push(`Smile score: ${(face.faceAttributes.smile * 100).toFixed(1)}%`);
      }

      if (face.faceAttributes?.glasses) {
        details.push(`Glasses: ${face.faceAttributes.glasses}`);
      }

      if (face.faceAttributes?.facialHair) {
        const { moustache, beard, sideburns } = face.faceAttributes.facialHair;
        details.push(
          `Facial hair (moustache/beard/sideburns): ${[moustache, beard, sideburns]
            .map((value) => `${Math.round(value * 100)}%`)
            .join(" / ")}`,
        );
      }

      if (face.faceAttributes?.emotion) {
        const topEmotion = Object.entries(face.faceAttributes.emotion).sort(([, a], [, b]) => b - a)[0];
        if (topEmotion) {
          const [emotion, confidence] = topEmotion;
          details.push(`Top emotion: ${emotion} (${(confidence * 100).toFixed(1)}%)`);
        }
      }

      return {
        id: face.faceId,
        rectangle: face.faceRectangle,
        summary: details,
      };
    });
  }, [faces]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!imageUrl.trim()) {
      setError("Please provide an image URL.");
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
      const details =
        caughtError instanceof Error && "cause" in caughtError && caughtError.cause
          ? String(caughtError.cause)
          : undefined;

      setError(details ? `${message}. ${details}` : message);
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
              {isLoading && <p className="text-sm text-slate-400">Calling Azure Face API…</p>}
              {error && <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
              {!isLoading && !error && !hasResults && (
                <p className="text-sm text-slate-400">
                  Submit an image to see detected faces, bounding box coordinates, and selected attributes.
                </p>
              )}
              <ul className="flex flex-col gap-3 text-sm text-slate-200">
                {formattedFaces.map((face) => (
                  <li key={face.id} className="rounded-lg border border-slate-800 bg-slate-950 p-3">
                    <p className="font-mono text-xs text-slate-400">ID: {face.id}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Rectangle — top: {face.rectangle.top}, left: {face.rectangle.left}, width: {face.rectangle.width}, height:
                      {face.rectangle.height}
                    </p>
                    {face.summary.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-200">
                        {face.summary.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
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

function safeParseJson(payload: string) {
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
}
