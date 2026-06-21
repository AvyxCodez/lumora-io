import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API — Lumora",
  description: "Upload to Lumora straight from your terminal or app.",
};

const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 200;

function Code({ children }: { children: string }) {
  return (
    <pre className="glass overflow-x-auto rounded-2xl p-4 text-sm leading-relaxed text-zinc-200">
      <code>{children}</code>
    </pre>
  );
}

export default function DevelopersPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-12">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        the <span className="text-gradient">api</span>
      </h1>
      <p className="mt-3 text-zinc-400">
        no keys, no SDK. just POST a file and get a link back. 🛸
      </p>

      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-lg font-medium text-white">Upload a file</h2>
          <p className="mt-1 mb-3 text-sm text-zinc-400">
            Send a <code className="text-aura-300">multipart/form-data</code> POST to{" "}
            <code className="text-aura-300">/api/upload</code> with a{" "}
            <code className="text-aura-300">file</code> field. Optionally add{" "}
            <code className="text-aura-300">expires</code> ={" "}
            <code className="text-aura-300">1h</code> ·{" "}
            <code className="text-aura-300">12h</code> ·{" "}
            <code className="text-aura-300">24h</code> ·{" "}
            <code className="text-aura-300">72h</code> for a temporary upload.
          </p>
          <Code>{`curl -F "file=@cat.png" https://lumora.io/api/upload`}</Code>
        </section>

        <section>
          <h2 className="text-lg font-medium text-white">Temporary upload</h2>
          <Code>{`curl -F "file=@clip.mp4" -F "expires=24h" \\
  https://lumora.io/api/upload`}</Code>
        </section>

        <section>
          <h2 className="text-lg font-medium text-white">Response</h2>
          <p className="mt-1 mb-3 text-sm text-zinc-400">
            You get JSON back. Your link is{" "}
            <code className="text-aura-300">/f/&lt;name&gt;</code>.
          </p>
          <Code>{`{
  "files": [
    {
      "id": "a1B2c3",
      "name": "a1B2c3.png",
      "originalName": "cat.png",
      "type": "image/png",
      "size": 20381,
      "uploadedAt": 1718900000000,
      "expiresAt": null,
      "deleteToken": "kf3p…"
    }
  ]
}`}</Code>
        </section>

        <section>
          <h2 className="text-lg font-medium text-white">Delete a file</h2>
          <p className="mt-1 mb-3 text-sm text-zinc-400">
            POST the <code className="text-aura-300">id</code> and{" "}
            <code className="text-aura-300">deleteToken</code> you got back. Or
            just open{" "}
            <code className="text-aura-300">/d/&lt;id&gt;/&lt;token&gt;</code> in
            a browser.
          </p>
          <Code>{`curl -X POST https://lumora.io/api/files/delete \\
  -H "Content-Type: application/json" \\
  -d '{"id":"a1B2c3","token":"kf3p…"}'`}</Code>
        </section>

        <section>
          <h2 className="text-lg font-medium text-white">Good to know</h2>
          <ul className="mt-2 space-y-1.5 text-sm text-zinc-400">
            <li>• Up to {MAX_MB} MB per file. Send several{" "}
              <code className="text-aura-300">file</code> fields to upload a batch.</li>
            <li>• Blocked types: <code className="text-aura-300">.exe .scr .cpl .jar .doc*</code></li>
            <li>• Append <code className="text-aura-300">?download</code> to any link to force a download.</li>
            <li>• Links are permanent unless you set an expiry.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
