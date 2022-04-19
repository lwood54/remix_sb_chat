import * as React from "react";
import { useLoaderData, Link, Outlet, useLocation } from "@remix-run/react";
import type { Channel } from "~/types/chat";
import supabase from "~/utils/supabase";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import checkAndSetAuth from "~/utils/checkAndSetAuth";

export const loader: LoaderFunction = async (context) => {
  const { user } = await checkAndSetAuth(context);
  if (!user) {
    return redirect("/login");
  }

  const { data: channels, error } = await supabase
    .from("channels")
    .select("id, title");

  if (error) {
    console.log(error.message);
  }
  return {
    channels,
  };
};

export default () => {
  const { channels } = useLoaderData();
  const { pathname } = useLocation();
  const isChannePage = pathname === "/channels" || pathname === "/channels/";

  return (
    <div className="h-screen flex">
      <div className="bg-gray-800 text-white w-52 p-8">
        {channels.map((channel: Channel) => (
          <p key={channel.id} className="">
            <Link to={`/channels/${channel.id}`}>
              <span className="text-gray-400 mr-1">#</span>
              {channel.title}
            </Link>
          </p>
        ))}
      </div>
      <div className="flex-1 p-8 flex flex-col">
        {isChannePage && (
          <div className="flex-1 flex items-center justify-center text-center">
            <span className="mr-4">👈</span> Choose a channel!
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
};
