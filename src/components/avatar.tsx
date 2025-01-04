import "./avatar.css";

export default function Avatar({
  url,
  fallback,
}: {
  url: string;
  fallback: string;
}) {
  return <img src={url} alt={fallback} className="avatar" />;
}
