// Demo wallpaper data for the Wallpaper Engine Web Exporter
export interface DemoWallpaper {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export const demoWallpapers: DemoWallpaper[] = [
  {
    id: "1198839373",
    title: "Cabin",
    description: "Cabin on the lake in the woods with animated water and reflection effects.",
    imageUrl: "/demo/1198839373/preview.jpg"
  },
  {
    id: "1959836574",
    title: "In The Early Morning Forest",
    description: "Landscape scene with particle effects including fog, leaves, and fireflies.",
    imageUrl: "/demo/1959836574/preview.gif"
  },
  {
    id: "2911866381",
    title: "White Oak (Day/Night)",
    description: "Complex scene with day/night transition and customizable weather effects (rain/snow).",
    imageUrl: "/demo/2911866381/preview.gif"
  },
  {
    id: "2504353624",
    title: "Sealed",
    description: "Sci-fi landscape with parallax effects and day/night transition options.",
    imageUrl: "/demo/2504353624/preview.gif"
  },
  {
    id: "3252400200",
    title: "Peaceful Lake II | Minimal Landscape",
    description: "Minimal landscape with water ripple effects, stars, and boat animation.",
    imageUrl: "/demo/3252400200/preview.gif"
 }
];