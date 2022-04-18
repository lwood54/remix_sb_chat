export type Channel = {
  description: string;
  id: string;
  messages: Message[];
  title: string;
};

export type Message = {
  channel_id: string;
  content: string;
  id: string;
};
