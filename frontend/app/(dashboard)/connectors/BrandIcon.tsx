import { Plug } from "lucide-react";

export function BrandIcon({
  id,
  className,
}: {
  id: string;
  className?: string;
}) {
  // Map your internal connector IDs to the official full-color SVG URLs
  const iconUrls: Record<string, string> = {
    // Full-color original brand logos
    slack: "https://api.iconify.design/logos:slack-icon.svg",
    gmail: "https://api.iconify.design/logos:google-gmail.svg",
    googlecalendar: "https://api.iconify.design/logos:google-calendar.svg",
    googledrive: "https://api.iconify.design/logos:google-drive.svg",
    supabase: "https://api.iconify.design/logos:supabase-icon.svg",
    discord: "https://api.iconify.design/logos:discord-icon.svg",
    linear:
      "https://api.iconify.design/simple-icons:linear.svg?color=%235E6AD2",

    // These brands have black logos, so we fetch white versions for dark mode visibility
    github: "https://api.iconify.design/mdi:github.svg?color=white",
    notion: "https://api.iconify.design/simple-icons:notion.svg?color=white",
  };

  const url = iconUrls[id.toLowerCase()];

  if (!url) {
    return <Plug className={className} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`${id} brand logo`}
      className={className}
      loading="lazy"
    />
  );
}
