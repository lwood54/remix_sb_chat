import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import supabase from "~/utils/supabase";
import type { Channel } from "~/types/chat";
import * as React from "react";

type LoaderData = {
  channel: Channel;
};

export const loader: LoaderFunction = async ({ params: { id } }) => {
  const { data: channel, error } = await supabase
    .from("channels")
    // NOTE: .select("*") <-- select all columns in channels table
    // NOTE: .select("*, messages(*)") // <-- selects all columsn, ALSO selects all messages associated with that channel (table)
    .select("id, title, description, messages(id, content, channel_id)") // NOTE: <-- being even more specific in what data we are asking for
    .match({ id })
    .single(); // instead of getting an array of one (in theory), we say just one item
  if (error) {
    console.log(error.message);
  }
  return {
    channel,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const content = formData.get("content");
  const channel_id = formData.get("channelId");
  const { error } = await supabase
    .from("messages")
    .insert({ content, channel_id });
  if (error) {
    console.log(error.message);
  }

  return null;
};

export default () => {
  const { channel }: LoaderData = useLoaderData();
  const [messages, setMessages] = React.useState(channel.messages);
  const fetcher = useFetcher();

  React.useEffect(() => {
    supabase
      .from(`messages:channel_id=eq.${channel.id}`)
      .on("*", (payload) => {
        fetcher.load(`/channels/${channel.id}`);
      })
      .subscribe();
  }, [channel.id, fetcher]);

  React.useEffect(() => {
    if (fetcher.data) {
      console.log("fetcher.data", fetcher.data);
      setMessages([...fetcher.data.channel.messages]);
    }
  }, [fetcher.data]);

  React.useEffect(() => {
    setMessages([...channel.messages]);
  }, [channel.id, channel.messages]);

  return (
    <>
      <div className="gap-4 flex flex-col border-b border-gray-300 pb-6 mb-6">
        <h1 className="text-2xl uppercase">{channel.title}</h1>
        <p className="text-gray-600">{channel.description}</p>
      </div>
      {/* <pre className="flex-1">{JSON.stringify(channel, null, 2)}</pre> */}
      <div className="flex flex-1 flex-col p-2 overflow-auto">
        <div className="mt-auto">
          {messages.map((m) => (
            <p key={m.id} className="p-2">
              {m.content}
            </p>
          ))}
        </div>
      </div>
      <Form method="post" className="flex">
        <input name="content" className="border border-gray-200 px-2 flex-1" />
        <input type="hidden" value={channel.id} name="channelId" />
        <button type="submit" className="px-4 py-2 ml-4 bg-blue-200">
          Send!
        </button>
      </Form>
    </>
  );
};
