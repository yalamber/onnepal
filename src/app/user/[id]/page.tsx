import { redirect } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getD1Database } from '@/lib/cloudflare';
import { getUserById } from '@/lib/db/queries/users';

export default async function UserRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const db = getDb(getD1Database());
    const user = await getUserById(db, id);
    if (user) {
      redirect(`/profile/${user.username}`);
    }
  } catch {}
  redirect('/');
}
