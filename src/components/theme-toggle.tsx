"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { LampDeskIcon, Moon, PaletteIcon, Sun } from "lucide-react" // Assuming you use lucide-react for icons
import { SidebarMenuButton } from "./ui/sidebar";
import { Button } from "./ui/button";
import { DialogContent, DialogHeader, DialogTitle, Dialog, DialogDescription, DialogFooter } from "./ui/dialog";

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
      {theme === "dark" ? (
        <Moon className="size-4 text-white" />
      ) : (
        <Sun className="size-4 text-black" />
      )}

      <span className="truncate">Toggle Theme</span>

    </SidebarMenuButton>
  )
}

function ChangeDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const change = (variableName: string, value: string) => {
    const fullVariableName = variableName.startsWith('--') ? variableName : `--${variableName}`;
    document.documentElement.style.setProperty(fullVariableName, value);
  }
  const bgcolors = [
    'oklch(0.488 0.243 264.376)',
    'oklch(0.6397 0.172 36.4421)',
    'oklch(0.205 0 0)',
    'oklch(0.577 0.245 27.325)',
    'oklch(0.586 0.253 17.585)',
    'oklch(0.541 0.281 293.009)',
    'oklch(0.852 0.199 91.936)'
]
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Color</DialogTitle>
          <DialogDescription>
            Select a color to change the theme.
          </DialogDescription>
        </DialogHeader>
        <Button className="w-full bg-primary">
          Preview
        </Button>
        <div className="flex items-center justify-between">
          {bgcolors.map((color, index) => (
            <Button
              key={index}
              style={{ backgroundColor: color }}
              className="w-8 h-8 rounded-full"
              onClick={() => change('--primary', color)}
            />
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">Ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ChangeColor() {
  const [open, setOpen] = React.useState(false)
  
  return (
    <>
      <SidebarMenuButton
        onClick={() => setOpen(true)}
        className="gap-x-4 h-10 px-4"
        tooltip="Toggle Theme">
        <PaletteIcon className="size-4" />
        <span className="truncate">Change Color</span>
      </SidebarMenuButton>
      <ChangeDialog open={open} setOpen={setOpen} />
    </>
  )
}
