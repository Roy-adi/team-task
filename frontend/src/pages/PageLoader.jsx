import React from "react";
import { useThemeStore } from "../store/useTheme";
import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
  const { theme } = useThemeStore();
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      data-theme={theme}
    >
      <LoaderIcon className="animate-spin size-10 text-primary" />
    </div>
  );
};

export default PageLoader;
