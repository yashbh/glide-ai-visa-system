interface ChatPageProps {
  country: string;
}

export function ChatPage({ country }: ChatPageProps) {
  return (
    <div className="flex-1 grid place-items-center">
      <p className="text-slate-400">Chat for {country} — loading...</p>
    </div>
  );
}
