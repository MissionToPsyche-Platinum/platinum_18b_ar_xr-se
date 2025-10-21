export type AppletLink = {
  id: string;
  name: string;
  href: string;
  description?: string;
};

export const APPLETS: AppletLink[] = [
  { id: "asteroid_dodge", name: "Asteroid Dodge", href: "/asteroids/", description: "Dodge the asteroids!" },
  { id: "metal_activity", name: "Metal Activity", href: "/metalfacts/", description: "Learn about the metal composition of Psyche!" },
];
