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

  return (
    <div>
      {channels.map((channel: Channel) => (
        <p key={channel.id} className="text-3xl">
          <Link to={`/channels/${channel.id}`}>{channel.title}</Link>
        </p>
      ))}
      <Outlet />
    </div>
  );
};
