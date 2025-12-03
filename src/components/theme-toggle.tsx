"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { LampDeskIcon, Moon, Sun } from "lucide-react" // Assuming you use lucide-react for icons
import { SidebarMenuButton } from "./ui/sidebar";

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null // or a skeleton loader
  }

  return (
    <SidebarMenuButton
      className="gap-x-4 h-10 px-4 "
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      tooltip="Toggle Theme"
    >
      <LampDeskIcon className="size-4" />

      <span className="truncate">Toggle Theme</span>
      {theme === "dark" ? (
        <Moon className="size-4 text-white" />
      ) : (
        <Sun className="size-4 text-black" />
      )}
    </SidebarMenuButton>
  )
}