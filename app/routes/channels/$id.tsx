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
      <pre>{JSON.stringify(channel, null, 2)}</pre>
      <div>
        Messages:
        {messages.map((m) => (
          <p key={m.id}>{m.content}</p>
        ))}
      </div>
      <Form method="post">
        <input name="content" />
        <input type="hidden" value={channel.id} name="channelId" />
        <button type="submit">Send!</button>
      </Form>
    </>
  );
};
