import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import supabase from "~/utils/supabase";
import type { Channel } from "~/types/chat";
import * as React from "react";
import checkAndSetAuth from "~/utils/checkAndSetAuth";
import type { User } from "@supabase/supabase-js";

type LoaderData = {
  channel: Channel;
  user: User;
};

export const loader: LoaderFunction = async (context) => {
  const { user } = await checkAndSetAuth(context);
  if (!user) {
    return redirect("/login");
  }
  const { data: channel, error } = await supabase
    .from("channels")
    // NOTE: .select("*") <-- select all columns in channels table
    // NOTE: .select("*, messages(*)") // <-- selects all columsn, ALSO selects all messages associated with that channel (table)
    .select(
      "id, title, description, messages(id, content, likes, profiles(id, email, username))"
    ) // NOTE: <-- being even more specific in what data we are asking for
    .match({ id: context.params.id })
    .order("created_at", { foreignTable: "messages" })
    .single(); // instead of getting an array of one (in theory), we say just one item
  if (error) {
    console.log(error.message);
  }
  return {
    user,
    channel,
  };
};

export const action: ActionFunction = async (context) => {
  const { user } = await checkAndSetAuth(context);
  if (!user) {
    return redirect("/login");
  }
  const formData = await context.request.formData();
  const content = formData.get("content");
  const channel_id = formData.get("channelId");
  const { error } = await supabase
    .from("messages")
    .insert({ content, channel_id, user_id: user.id });
  if (error) {
    console.log(error.message);
  }

  return null;
};

export default () => {
  const { channel, user }: LoaderData = useLoaderData();
  const [messages, setMessages] = React.useState(channel.messages);
  const fetcher = useFetcher();
  const transition = useTransition();
  const formRef = React.useRef({} as HTMLFormElement);
  const messagesContainerRef = React.useRef({} as HTMLDivElement);

  React.useEffect(() => {
    if (transition.state !== "submitting") {
      formRef.current?.reset();
    }
  }, [transition.state]);

  React.useEffect(() => {
    messagesContainerRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

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
      setMessages([...fetcher.data.channel.messages]);
    }
  }, [fetcher.data]);

  React.useEffect(() => {
    setMessages([...channel.messages]);
  }, [channel.id, channel.messages]);

  const handleLike = (id: string) => async () => {
    const { error } = await supabase.rpc("increment_likes", {
      message_id: id,
    });

    if (error) {
      console.log(error.message);
    }
  };

  return (
    <>
      <div className="gap-4 flex flex-col border-b border-gray-300 pb-6 mb-6">
        <h1 className="text-2xl uppercase">{channel.title}</h1>
        <p className="text-gray-600">{channel.description}</p>
      </div>
      {/* <pre className="flex-1">{JSON.stringify(channel, null, 2)}</pre> */}
      <div className="flex flex-1 flex-col p-2 overflow-auto">
        <div className="mt-auto" ref={messagesContainerRef}>
          {messages.length > 0 ? (
            messages.map((message) => (
              <p
                key={message.id}
                className={`p-2 ${
                  user.id === message.profiles.id ? "text-right" : ""
                }`}
              >
                {message.content}
                <span className="block text-xs text-gray-500 px-2">
                  {message.profiles.username ?? message.profiles.email}
                </span>
                <span className="block text-xs text-gray-500 px-2">
                  {message.likes} likes{" "}
                  <button onClick={handleLike(message.id)}>👍</button>
                </span>
              </p>
            ))
          ) : (
            <p className="font-bold text-center">
              Be the first to send a message!
            </p>
          )}
        </div>
      </div>
      <Form method="post" ref={formRef} className="flex">
        <input name="content" className="border border-gray-200 px-2 flex-1" />
        <input type="hidden" value={channel.id} name="channelId" />
        <button type="submit" className="px-4 py-2 ml-4 bg-blue-200">
          Send!
        </button>
      </Form>
    </>
  );
};
