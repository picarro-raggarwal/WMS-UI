import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import * as React from "react";

import { cn } from "@/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "flex items-center space-x-1 bg-white dark:bg-neutral-950 p-1 border border-neutral-200 dark:border-neutral-800 rounded-md h-10",
      className
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center data-[state=open]:bg-neutral-100 focus:bg-neutral-100 dark:data-[state=open]:bg-neutral-800 dark:focus:bg-neutral-800 px-3 py-1.5 rounded-sm outline-none font-medium data-[state=open]:text-neutral-900 focus:text-neutral-900 dark:data-[state=open]:text-neutral-50 dark:focus:text-neutral-50 text-sm cursor-default select-none",
      className
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "flex items-center data-[state=open]:bg-neutral-100 focus:bg-neutral-100 dark:data-[state=open]:bg-neutral-800 dark:focus:bg-neutral-800 px-2 py-1.5 rounded-sm outline-none data-[state=open]:text-neutral-900 focus:text-neutral-900 dark:data-[state=open]:text-neutral-50 dark:focus:text-neutral-50 text-sm cursor-default select-none",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto w-4 h-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "data-[side=left]:slide-in-from-right-2 data-[side=top]:slide-in-from-bottom-2 z-50 bg-white dark:bg-neutral-950 data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2 p-1 border border-neutral-200 dark:border-neutral-800 rounded-md min-w-[8rem] overflow-hidden text-neutral-950 dark:text-neutral-50 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      className
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "data-[side=left]:slide-in-from-right-2 data-[side=top]:slide-in-from-bottom-2 z-50 bg-white dark:bg-neutral-950 data-[side=bottom]:slide-in-from-top-2 data-[side=right]:slide-in-from-left-2 shadow-md p-1 border border-neutral-200 dark:border-neutral-800 rounded-md min-w-[12rem] overflow-hidden text-neutral-950 dark:text-neutral-50 data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  )
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex items-center focus:bg-neutral-100 dark:focus:bg-neutral-800 data-[disabled]:opacity-50 px-2 py-1.5 rounded-sm outline-none focus:text-neutral-900 dark:focus:text-neutral-50 text-sm cursor-default data-[disabled]:pointer-events-none select-none",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "relative flex items-center focus:bg-neutral-100 dark:focus:bg-neutral-800 data-[disabled]:opacity-50 py-1.5 pr-2 pl-8 rounded-sm outline-none focus:text-neutral-900 dark:focus:text-neutral-50 text-sm cursor-default data-[disabled]:pointer-events-none select-none",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="left-2 absolute flex justify-center items-center w-3.5 h-3.5">
      <MenubarPrimitive.ItemIndicator>
        <Check className="w-4 h-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "relative flex items-center focus:bg-neutral-100 dark:focus:bg-neutral-800 data-[disabled]:opacity-50 py-1.5 pr-2 pl-8 rounded-sm outline-none focus:text-neutral-900 dark:focus:text-neutral-50 text-sm cursor-default data-[disabled]:pointer-events-none select-none",
      className
    )}
    {...props}
  >
    <span className="left-2 absolute flex justify-center items-center w-3.5 h-3.5">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="fill-current w-2 h-2" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 font-semibold text-sm",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn(
      "bg-neutral-100 dark:bg-neutral-800 -mx-1 my-1 h-px",
      className
    )}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-neutral-500 dark:text-neutral-400 text-xs tracking-widest",
        className
      )}
      {...props}
    />
  );
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarPortal,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger
};
