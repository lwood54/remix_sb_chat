export type Channel = {
  description: string;
  id: string;
  messages: Message[];
  title: string;
};

export type Profile = {
  email: string;
  id: string;
  username: string;
};

export type Message = {
  content: string;
  id: string;
  likes: number;
  profiles: Profile;
};
