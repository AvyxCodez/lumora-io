import Link from "next/link";
import { getRecord } from "@/lib/storage";
import { Mascot } from "@/components/Mascot";
import { DeleteConfirm } from "@/components/DeleteConfirm";

export const dynamic = "force-dynamic";

export default async function DeletePage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;
  const record = await getRecord(id);

  const valid = record && record.deleteToken && record.deleteToken === token;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-20 text-center">
      <Mascot size={104} />
      <div className="glass mt-8 w-full rounded-3xl p-8">
        {valid ? (
          <DeleteConfirm id={record.id} token={token} name={record.originalName} />
        ) : (
          <div>
            <p className="text-lg font-medium text-white">Nothing to delete</p>
            <p className="mt-2 text-sm text-zinc-400">
              This file is already gone, or the delete link isn&apos;t valid.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-aura-500 to-aura-700 px-6 py-2.5 text-sm font-medium text-white shadow-glow-sm transition-transform hover:scale-[1.03]"
            >
              back home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
