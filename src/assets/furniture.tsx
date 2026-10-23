import { FurnitureIcon } from "../vendor/furniture/FurnitureIcon";
import { LegacyShopFurnitureArt } from "../vendor/furniture/archive/LegacyShopFurnitureArt";
import { LegacyWallpaperSwatch } from "../vendor/furniture/archive/LegacyWallpaperSwatch";
import { asset, type AssetDef } from "../lib/types";
import { slug } from "../lib/svg";

// The shop art is static SVG (huawei-2026/public/furniture), loaded as text.
const SHOP_FILES = import.meta.glob<string>("../vendor/furniture/shop-svg/*.svg", { query: "?raw", import: "default", eager: true });

// Names and categories from huawei-2026/src/app/data/shopCatalogue.ts.
const SHOP_ITEMS: Array<[art: string, name: string, category: string]> = [
  ["01-mint-couch", "MINT COUCH", "basic"], ["02-starlight-bed", "STARLIGHT BED", "basic"],
  ["03-blush-chair", "BLUSH CHAIR", "basic"], ["04-coffee-table", "COFFEE TABLE", "basic"],
  ["05-crystal-chandelier", "CRYSTAL CHANDELIER", "lights"], ["06-wall-sconce", "WALL SCONCE", "lights"],
  ["07-reading-lamp", "READING LAMP", "lights"], ["08-city-window", "CITY WINDOW", "decor"],
  ["09-curtained-window", "CURTAINED WINDOW", "decor"], ["10-neon-panel-door", "NEON-PANEL DOOR", "decor"],
  ["11-woven-runner", "WOVEN RUNNER", "decor"], ["12-orbit-carpet", "ORBIT CARPET", "decor"],
  ["13-leafy-plant", "LEAFY PLANT", "decor"], ["14-flowering-cactus", "FLOWERING CACTUS", "decor"],
  ["15-hanging-planter", "HANGING PLANTER", "decor"], ["16-bookcase", "BOOKCASE", "storage"],
  ["17-drawer-cabinet", "DRAWER CABINET", "storage"], ["18-desktop-setup", "DESKTOP SETUP", "tech"],
  ["19-laptop", "LAPTOP", "tech"], ["20-movie-night-tv", "MOVIE-NIGHT TV", "tech"],
  ["21-basketball-hoop", "BASKETBALL HOOP", "sports"], ["22-dumbbell-rack", "DUMBBELL RACK", "sports"],
  ["23-skateboard", "SKATEBOARD", "sports"], ["24-acoustic-guitar", "ACOUSTIC GUITAR", "sports"],
  ["25-bean-bag", "BEAN BAG", "basic"], ["26-bedside-table", "BEDSIDE TABLE", "basic"],
  ["27-bar-stool", "BAR STOOL", "basic"], ["28-neon-sign", "NEON SIGN", "lights"],
  ["29-floor-lamp", "FLOOR LAMP", "lights"], ["30-zigzag-rug", "ZIGZAG RUG", "decor"],
  ["31-circle-mat", "CIRCLE MAT", "decor"], ["32-succulent-trio", "SUCCULENT TRIO", "decor"],
  ["33-palm-tree", "PALM TREE", "decor"], ["34-skylight", "SKYLIGHT", "decor"],
  ["35-arched-door", "ARCHED DOOR", "decor"], ["36-toy-chest", "TOY CHEST", "storage"],
  ["37-shoe-rack", "SHOE RACK", "storage"], ["38-gaming-console", "GAMING CONSOLE", "tech"],
  ["39-retro-radio", "RETRO RADIO", "tech"], ["40-vr-headset", "VR HEADSET", "tech"],
  ["41-yoga-mat", "YOGA MAT", "sports"], ["42-punching-bag", "PUNCHING BAG", "sports"],
  ["43-surfboard", "SURFBOARD", "sports"], ["44-bike", "BIKE", "sports"],
];

const CATEGORY_NAMES: Record<string, string> = {
  basic: "SHOP · BASIC", lights: "SHOP · LIGHTING", decor: "SHOP · DECOR",
  storage: "SHOP · STORAGE", tech: "SHOP · TECH", sports: "SHOP · SPORTS & HOBBIES",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_NAMES);

/** Renders a raw SVG file as a React element so it goes through the same pipeline. */
function RawSvg({ markup, width }: { markup: string; width: number }) {
  const viewBox = /viewBox="([^"]+)"/.exec(markup)?.[1] ?? "0 0 56 48";
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  const inner = markup.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return (
    <svg
      width={width}
      height={(width * vh) / vw}
      viewBox={viewBox}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
      dangerouslySetInnerHTML={{ __html: inner }}
    />
  );
}

const shop: AssetDef[] = SHOP_ITEMS
  .slice()
  .sort((a, b) => CATEGORY_ORDER.indexOf(a[2]) - CATEGORY_ORDER.indexOf(b[2]))
  .map(([art, name, category]) => {
    const markup = SHOP_FILES[`../vendor/furniture/shop-svg/${art}.svg`] ?? "";
    return asset({
      id: `shop-${art}`,
      name,
      group: CATEGORY_NAMES[category],
      defaults: { size: 56 },
      controls: [{ kind: "size", key: "size", label: "WIDTH", min: 14, max: 1120, step: 1, hint: "Native art is 56 × 48 px" }],
      render: (p) => <RawSvg markup={markup} width={p.size} />,
      filename: (p) => slug(art, p.size !== 56 && p.size),
    });
  });

const ROOM_ITEMS: Array<[id: string, name: string, member: string]> = [
  ["grandma-chair", "ARMCHAIR", "Grandma"], ["grandma-shelf", "BOOKSHELF", "Grandma"],
  ["grandma-lamp", "TABLE LAMP", "Grandma"], ["grandma-frame", "PICTURE FRAME", "Grandma"],
  ["mum-plant", "POT PLANT", "Mum"], ["mum-desk", "WORK DESK", "Mum"],
  ["mum-laptop", "LAPTOP", "Mum"], ["mum-phone", "PHONE", "Mum"],
  ["dad-tv", "TV SET", "Dad"], ["dad-couch", "COUCH", "Dad"], ["dad-cabinet", "CABINET", "Dad"],
  ["dad-door", "DOOR", "Dad"], ["dad-shower", "SHOWER", "Dad"],
  ["kid-bed", "BED", "Kid"], ["kid-toybox", "TOY BOX", "Kid"], ["kid-teddy", "TEDDY BEAR", "Kid"], ["kid-alarm", "ALARM CLOCK", "Kid"],
];

const room: AssetDef[] = ROOM_ITEMS.map(([id, name, member]) =>
  asset({
    id: `room-${id}`,
    name,
    group: `${member.toUpperCase()}'S ROOM`,
    defaults: { size: 36 },
    controls: [{ kind: "size", key: "size", min: 10, max: 720 }],
    render: (p) => <FurnitureIcon itemId={id} size={p.size} />,
    filename: (p) => slug(id, p.size),
  }),
);

const LEGACY_ART: Array<[art: string, name: string]> = [
  ["sofa", "SOFA"], ["lamp", "LAMP"], ["plant", "PLANT"], ["tv", "TV"],
  ["rug", "RUG"], ["bookshelf", "BOOKSHELF"], ["bed", "BED"], ["window", "WINDOW"],
];

const legacy: AssetDef[] = [
  ...LEGACY_ART.map(([art, name]) =>
    asset({
      id: `legacy-${art}`,
      name,
      group: "LEGACY SHOP ART",
      defaults: { size: 48 },
      controls: [{ kind: "size", key: "size", min: 12, max: 960 }],
      render: (p) => <LegacyShopFurnitureArt art={art} size={p.size} />,
      filename: (p) => slug("legacy", art, p.size),
    }),
  ),
  ...["wp1", "wp2"].map((id, i) =>
    asset({
      id: `legacy-${id}`,
      name: `WALLPAPER ${i + 1}`,
      group: "LEGACY SHOP ART",
      defaults: { size: 56 },
      controls: [{ kind: "size", key: "size", min: 14, max: 1120 }],
      render: (p) => (
        <svg width={p.size} height={p.size} viewBox="0 0 14 14" shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }}>
          <LegacyWallpaperSwatch id={id} />
        </svg>
      ),
      filename: (p) => slug("legacy-wallpaper", id, p.size),
    }),
  ),
];

export const FURNITURE_ASSETS: AssetDef[] = [...shop, ...room, ...legacy];
