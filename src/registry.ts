import { IconFamily, IconGear, IconHouse, IconPerson, IconPhone, IconStar } from "./vendor/icons";
import { AVATAR_SUBTABS } from "./assets/avatar";
import { CHARACTER_ASSETS } from "./assets/characters";
import { FURNITURE_ASSETS } from "./assets/furniture";
import { ICON_ASSETS } from "./assets/icons";
import { UI_ASSETS } from "./assets/ui";
import { SCREEN_ASSETS } from "./assets/screens";
import type { AssetDef, TabDef } from "./lib/types";

export const TABS: TabDef[] = [
  { id: "avatar", label: "AVATAR", accent: "#c77dff", Icon: IconPerson, subTabs: AVATAR_SUBTABS },
  { id: "characters", label: "CHARACTERS", accent: "#00ff88", Icon: IconFamily, assets: CHARACTER_ASSETS },
  { id: "furniture", label: "FURNITURE", accent: "#ff6b35", Icon: IconHouse, assets: FURNITURE_ASSETS },
  { id: "icons", label: "ICONS", accent: "#ffe66d", Icon: IconStar, assets: ICON_ASSETS },
  { id: "ui", label: "UI", accent: "#4ecdc4", Icon: IconGear, assets: UI_ASSETS },
  { id: "screens", label: "SCREENS", accent: "#ff2d55", Icon: IconPhone, assets: SCREEN_ASSETS },
];

export const ALL_ASSETS: AssetDef[] = TABS.flatMap((t) => t.assets ?? t.subTabs?.flatMap((s) => s.assets) ?? []);
