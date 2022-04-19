import * as React from "react";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";

import styles from "~/styles/app.css";
import supabase from "~/utils/supabase";

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

// NOTE: this is how Remix includes 3rd party css on the page
export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

export const loader = () => {
  return {
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_KEY: process.env.SUPABASE_KEY,
    },
  };
};

export default function App() {
  const { env } = useLoaderData();
  const { submit } = useFetcher();

  React.useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.access_token) {
        submit(
          {
            accessToken: session?.access_token,
          },
          {
            method: "post",
            action: "/auth/login",
          }
        );
      }
      // TODO: figure out why this is not triggering on logout
      // if (event === "SIGNED_OUT") {
      //   fetcher.submit(null, {
      //     method: "post",
      //     action: "/auth/logout",
      //   });
      // }
    });
  }, [submit]);

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.env = ${JSON.stringify(env)}`,
          }}
        />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
