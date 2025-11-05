import { useState } from "react";
import { SocialIcon } from "react-social-icons";
interface HoverSocialIconProps {
  network: string;
  url: string;
  color: string;
}
export function HoverSocialIcon({ network, url, color }: HoverSocialIconProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <SocialIcon
      network={network}
      url={url}
      target="_blank"
      style={{
        marginRight: "5px",
        width: 40,
        height: 40,
        borderRadius: "50%",
      }}
      bgColor={hovered ? color : "transparent"}
      fgColor={hovered ? "#fff" : color}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
}