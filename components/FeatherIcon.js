// components/FeatherIcon.jsx
"use client";
import { useState, useEffect } from "react";

const iconCache = {};

export default function FeatherIcon({
  name,
  size = 24,
  color = "currentColor",
  className = "",
  ...props
}) {
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    if (iconCache[name]) {
      setSvgContent(iconCache[name]);
      return;
    }

    fetch(`/icons/feather/${name}.svg`)
      .then((res) => {
        if (!res.ok) throw new Error("Icon not found");
        return res.text();
      })
      .then((svg) => {
        iconCache[name] = svg;
        setSvgContent(svg);
      })
      .catch((error) => {
        console.error("Error loading icon:", error);
      });
  }, [name]);

  if (!svgContent) {
    return (
      <div
        className={`animate-pulse bg-gray-200 rounded ${className}`}
        style={{ width: size, height: size }}
        {...props}
      />
    );
  }

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
