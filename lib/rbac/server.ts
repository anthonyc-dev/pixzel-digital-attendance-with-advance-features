import type { SupabaseClient, User } from "@supabase/supabase-js";

export type SessionEmployerRow = {
  id: number;
  employer_id: string;
};

/**
 * Employer row linked to the current Supabase user (`employer_registration.auth_user_id`).
 */
export async function getEmployerForAuthUser(
  supabase: SupabaseClient,
  user: User | null,
): Promise<SessionEmployerRow | null> {
  if (!user?.id) return null;
  const { data, error } = await supabase
    .from("employer_registration")
    .select("id, employer_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (error || !data) return null;
  return { id: Number(data.id), employer_id: String(data.employer_id) };
}
