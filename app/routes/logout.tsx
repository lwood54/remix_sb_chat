import * as React from "react";
import supabase from "~/utils/supabase";

export default () => {
  React.useEffect(() => {
    supabase.auth.signOut();
  }, []);

  return <p>Logging out...</p>;
};
