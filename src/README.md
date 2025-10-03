This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Azure Face API demo

This template includes a simple interface that forwards an image URL to the [Azure Face API](https://learn.microsoft.com/azure/ai-services/face/overview).

1. Create a `.env.local` file (or copy `.env.example`) and provide your resource details:

   ```bash
   AZURE_FACE_ENDPOINT="https://<your-resource-name>.cognitiveservices.azure.com"
   AZURE_FACE_KEY="<your-face-api-key>"
   ```

2. Start the development server with `npm run dev` and open [http://localhost:3000](http://localhost:3000).
3. Paste a publicly accessible image URL (for example, the prefilled sample) and submit the form. The API route defined in `app/api/face/route.ts` will call your Face API resource and return detection results.

### Feature restrictions

The sample keeps requests within the capabilities of unapproved Face API resources by:

- Using the `detection_03` model and disabling `returnFaceId` so the API only performs detection.
- Requesting a limited set of attributes that remain available without additional approval (`headPose`, `glasses`, `mask`, `occlusion`, `blur`, `exposure`, and `noise`).

If you need features such as `returnFaceId`, verification/identification, or the deprecated demographic attributes (age, gender, emotion, etc.), you must request access from Microsoft and use an approved resource.

### Troubleshooting authentication errors

- If you receive a 401 or 403 response, double-check that the endpoint and key come from the same Face API resource and that the key has not been regenerated since you configured your environment variables.
- New Face API resources require an approved application for responsible AI use. Make sure the Azure subscription you are using has been granted Face API access; otherwise every request will be rejected even with a valid key.
- When running in hosted environments or behind corporate proxies, outgoing requests to `*.cognitiveservices.azure.com` may be blocked. Confirm that your network allows outbound HTTPS traffic to the Azure Cognitive Services domain.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
