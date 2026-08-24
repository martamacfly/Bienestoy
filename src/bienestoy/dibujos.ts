export const DIBUJOS = [
  "sentadilla",
  "zancada",
  "press",
  "plank",
  "flexion",
  "dominada",
  "remo",
  "peso",
  "core",
  "puente",
  "burpee",
  "cuerda",
  "estirar",
  "yoga",
  "correr",
  "caminar",
  "salto",
  "bici",
  "eliptica",
  "nadar",
  "kayak",
  "senderismo",
  "escalada",
  "patines",
  "boxeo",
  "baile",
  "futbol",
  "tenis",
  "basket",
  "otro",
] as const;

export type DibujoId = (typeof DIBUJOS)[number];

const ETIQUETAS: Record<DibujoId, string> = {
  sentadilla: "Sentadilla",
  zancada: "Zancada",
  press: "Press",
  plank: "Plank",
  flexion: "Flexión",
  dominada: "Dominada",
  remo: "Remo",
  peso: "Pesas",
  core: "Core",
  puente: "Puente",
  burpee: "Burpee",
  cuerda: "Cuerda",
  estirar: "Estirar",
  yoga: "Yoga",
  correr: "Correr",
  caminar: "Caminar",
  salto: "Salto",
  bici: "Bici",
  eliptica: "Elíptica",
  nadar: "Nadar",
  kayak: "Kayak",
  senderismo: "Senderismo",
  escalada: "Escalada",
  patines: "Patines",
  boxeo: "Boxeo",
  baile: "Baile",
  futbol: "Fútbol",
  tenis: "Tenis",
  basket: "Basket",
  otro: "Otro",
};

export function etiquetaDibujo(id: DibujoId): string {
  return ETIQUETAS[id];
}

export function esDibujoId(valor: unknown): valor is DibujoId {
  return typeof valor === "string" && (DIBUJOS as readonly string[]).includes(valor);
}

export function inferirDibujo(nombre: string): DibujoId {
  const n = nombre.toLowerCase();
  if (/zancad|lunge/.test(n)) return "zancada";
  if (/sentad|squat/.test(n)) return "sentadilla";
  if (/flexion|flexión|push.?up|fondos/.test(n)) return "flexion";
  if (/press|banca|hombro|militar/.test(n)) return "press";
  if (/plank|plancha|isometr/.test(n)) return "plank";
  if (/dominad|pull.?up/.test(n)) return "dominada";
  if (/remo/.test(n)) return "remo";
  if (/puente|hip.?thrust|gluteo/.test(n)) return "puente";
  if (/burpee/.test(n)) return "burpee";
  if (/cuerda|comba/.test(n)) return "cuerda";
  if (/peso|mancuern|kettle|peso muerto/.test(n)) return "peso";
  if (/abs|core|crunch|abdominal/.test(n)) return "core";
  if (/estir|stretch|movilidad/.test(n)) return "estirar";
  if (/yoga|pilates/.test(n)) return "yoga";
  if (/run|correr|running/.test(n)) return "correr";
  if (/camin|paseo|walk/.test(n)) return "caminar";
  if (/salt|jump/.test(n)) return "salto";
  if (/eliptic|elíptic/.test(n)) return "eliptica";
  if (/bici|ciclo/.test(n)) return "bici";
  if (/nad|swim/.test(n)) return "nadar";
  if (/kayak|piragua/.test(n)) return "kayak";
  if (/sender|trek|montañ/.test(n)) return "senderismo";
  if (/escalad|climb/.test(n)) return "escalada";
  if (/patin/.test(n)) return "patines";
  if (/box|golpe|saco/.test(n)) return "boxeo";
  if (/bail|dance|zumba/.test(n)) return "baile";
  if (/f[uú]tbol|soccer/.test(n)) return "futbol";
  if (/tenis|p[aá]del/.test(n)) return "tenis";
  if (/basket|baloncesto/.test(n)) return "basket";
  return "otro";
}
