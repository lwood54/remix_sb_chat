import type { DataFunctionArgs } from "@remix-run/node";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSession } from "./cookie";
import supabase from "./supabase";

export default async (
  context: DataFunctionArgs
): Promise<{
  user: User | null;
  accessToken: string;
  supabase: SupabaseClient;
}> => {
  const session = await getSession(context.request.headers.get("Cookie"));
  const accessToken = session.get("accessToken");

  const { user } = await supabase.auth.api.getUser(accessToken);

  supabase.auth.setAuth(accessToken);

  return {
    user,
    accessToken,
    supabase,
  };
};
