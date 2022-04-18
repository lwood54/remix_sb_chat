import { useLoaderData, Link, Outlet } from "@remix-run/react";
import type { Channel } from "~/types/chat";
import supabase from "~/utils/supabase";

export const loader = async () => {
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

  console.log(supabase.auth.user());

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
        <Outlet />
      </div>
    </div>
  );
};
