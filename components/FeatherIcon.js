"use client";
import { useState, useEffect } from "react";

export default function FeatherIcon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  ...props
}) {
  const [svgContent, setSvgContent] = useState(null);

  useEffect(() => {
    fetch(`/icons/feather/${name}.svg`)
      .then((res) => res.text())
      .then((svg) => setSvgContent(svg));
  }, [name]);

  if (!svgContent) return null;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        display: "inline-flex",
        color: color,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
}
