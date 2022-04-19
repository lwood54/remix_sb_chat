import { Link } from "@remix-run/react";

export default function Index() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-800 text-white gap-2">
      <h1 className="text-2xl">Welcome to the chate!</h1>
      <Link to="/channels">
        Go to the <span className="underline">channels</span> 👉
      </Link>
    </div>
  );
}
