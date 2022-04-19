import { useFetcher } from "@remix-run/react";
import * as React from "react";
import supabase from "~/utils/supabase";

export default () => {
  const { submit } = useFetcher();

  React.useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut();

      // NOTE: ideally should be in root to wath onAuthStateChange()
      submit(null, {
        method: "post",
        action: "/auth/logout",
      });
    };
    logout();
  }, [submit]);
  // NOTE: again, destructuring method from object, allows it to be passed to
  // dependency array without infinite rerenders

  return <p>Logging out...</p>;
};
