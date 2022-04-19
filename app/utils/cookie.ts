import { createCookieSessionStorage } from "@remix-run/node";

const MAX_SESSION_AGE = 60 * 60 * 8;

// NOTE: good documentation: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies
const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "sb:token",
      maxAge: MAX_SESSION_AGE, // in seconds
      expires: new Date(Date.now() + MAX_SESSION_AGE * 1000),
      domain: "",
      path: "/",
      sameSite: "lax",
      httpOnly: true, // NOTE: only be available server side (loaders/actions)
      secure: true, // NOTE: only be available over https, no http other than localhost
      secrets: ["a kewl remix project"],
    },
  });

export { getSession, commitSession, destroySession };
