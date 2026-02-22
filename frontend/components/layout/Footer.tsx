import { formatDate } from "@/lib/utils";

interface Props {
  generatedAt: string;
}

export default function Footer({ generatedAt }: Props) {
  return (
    <footer className="mt-16 border-t border-gray-200 py-8 text-center text-xs text-gray-400">
      <p>
        Data updated nightly via GitHub Actions &middot; Last run:{" "}
        {formatDate(generatedAt)}
      </p>
      <p className="mt-1">
        Sources: GitHub &middot; Hacker News &middot; Product Hunt &middot;
        YCombinator
      </p>
    </footer>
  );
}
