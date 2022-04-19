// take in access token
// create a cookie that stores access token
// sending back to client

import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/utils/cookie";

/*
  NOTE: any time we export just an action or just a loader from a file within our rotues directory,
  Remix turns them into serverless functions
*/

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const accessToken = formData.get("accessToken");
  const session = await getSession();
  session.set("accessToken", accessToken);
  const cookie = await commitSession(session);

  /*
    NOTE: the main idea here is that we want to apply this cookie when the user
    successfully logs in, and we want to redirect them after login. We then also
    send them through this serverless function in order to store the cookie, which
    is sent via additional headers in the redirect method
  */

  return redirect("/channels", {
    headers: {
      "Set-Cookie": cookie,
    },
  });
};
