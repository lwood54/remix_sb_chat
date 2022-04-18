export type Channel = {
  title: string;
  id: string;
  messages: Message[];
};

export type Message = {
  content: string;
  id: string;
  channel_id: string;
};
