export const DIBUJOS = [
  "sentadilla",
  "zancada",
  "press",
  "plank",
  "flexion",
  "dominada",
  "remo",
  "peso",
  "muerto",
  "curl",
  "fondos",
  "jalon",
  "laterales",
  "gemelo",
  "core",
  "puente",
  "twist",
  "bird",
  "superhombre",
  "burpee",
  "climber",
  "jumpingjack",
  "step",
  "wallsit",
  "swing",
  "carry",
  "battle",
  "trineo",
  "cuerda",
  "estirar",
  "yoga",
  "pilates",
  "pino",
  "meditacion",
  "correr",
  "caminar",
  "salto",
  "bici",
  "eliptica",
  "escaleras",
  "nadar",
  "kayak",
  "paddle",
  "senderismo",
  "escalada",
  "patines",
  "skate",
  "esqui",
  "boxeo",
  "karate",
  "baile",
  "futbol",
  "tenis",
  "basket",
  "voleibol",
  "golf",
  "pingpong",
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
  muerto: "Peso muerto",
  curl: "Curl",
  fondos: "Fondos",
  jalon: "Jalón",
  laterales: "Laterales",
  gemelo: "Gemelo",
  core: "Core",
  puente: "Puente",
  twist: "Twist",
  bird: "Bird dog",
  superhombre: "Superman",
  burpee: "Burpee",
  climber: "Climber",
  jumpingjack: "Jumping jack",
  step: "Step",
  wallsit: "Wall sit",
  swing: "Swing",
  carry: "Carry",
  battle: "Cuerdas",
  trineo: "Trineo",
  cuerda: "Comba",
  estirar: "Estirar",
  yoga: "Yoga",
  pilates: "Pilates",
  pino: "Pino",
  meditacion: "Meditar",
  correr: "Correr",
  caminar: "Caminar",
  salto: "Salto",
  bici: "Bici",
  eliptica: "Elíptica",
  escaleras: "Escaleras",
  nadar: "Nadar",
  kayak: "Kayak",
  paddle: "Paddle",
  senderismo: "Senderismo",
  escalada: "Escalada",
  patines: "Patines",
  skate: "Skate",
  esqui: "Esquí",
  boxeo: "Boxeo",
  karate: "Karate",
  baile: "Baile",
  futbol: "Fútbol",
  tenis: "Tenis",
  basket: "Basket",
  voleibol: "Voleibol",
  golf: "Golf",
  pingpong: "Ping pong",
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
  if (/peso.?muerto|deadlift|muerto/.test(n)) return "muerto";
  if (/fondos|dips?/.test(n)) return "fondos";
  if (/flexion|flexión|push.?up/.test(n)) return "flexion";
  if (/press|banca|hombro|militar/.test(n)) return "press";
  if (/plank|plancha|isometr/.test(n)) return "plank";
  if (/dominad|pull.?up/.test(n)) return "dominada";
  if (/jal[oó]n|pulldown|dorsal/.test(n)) return "jalon";
  if (/remo/.test(n)) return "remo";
  if (/gemelo|pantorr|calf/.test(n)) return "gemelo";
  if (/lateral|elevaci[oó]n lateral/.test(n)) return "laterales";
  if (/puente|hip.?thrust|gluteo/.test(n)) return "puente";
  if (/twist|ruso/.test(n)) return "twist";
  if (/bird|perro.?p[aá]jaro/.test(n)) return "bird";
  if (/superman|superhombre/.test(n)) return "superhombre";
  if (/mountain|climber|escalador/.test(n)) return "climber";
  if (/jumping.?jack|tijera/.test(n)) return "jumpingjack";
  if (/wall.?sit|sentadilla isom/.test(n)) return "wallsit";
  if (/step/.test(n)) return "step";
  if (/swing|balanceo/.test(n)) return "swing";
  if (/farmer|carry|paseo.?del.?granjero/.test(n)) return "carry";
  if (/battle|cuerdas de batalla/.test(n)) return "battle";
  if (/trineo|sled/.test(n)) return "trineo";
  if (/burpee/.test(n)) return "burpee";
  if (/cuerda|comba/.test(n)) return "cuerda";
  if (/peso|mancuern|kettle/.test(n)) return "peso";
  if (/abs|core|crunch|abdominal/.test(n)) return "core";
  if (/estir|stretch|movilidad/.test(n)) return "estirar";
  if (/pino|handstand|invertid/.test(n)) return "pino";
  if (/medit|respir/.test(n)) return "meditacion";
  if (/pilates/.test(n)) return "pilates";
  if (/yoga/.test(n)) return "yoga";
  if (/run|correr|running/.test(n)) return "correr";
  if (/camin|paseo|walk/.test(n)) return "caminar";
  if (/salt|jump/.test(n)) return "salto";
  if (/escalera|stair/.test(n)) return "escaleras";
  if (/eliptic|elíptic/.test(n)) return "eliptica";
  if (/bici|ciclo/.test(n)) return "bici";
  if (/nad|swim/.test(n)) return "nadar";
  if (/kayak|piragua/.test(n)) return "kayak";
  if (/paddle|sup|surf/.test(n)) return "paddle";
  if (/sender|trek|montañ/.test(n)) return "senderismo";
  if (/escalad|climb/.test(n)) return "escalada";
  if (/skate/.test(n)) return "skate";
  if (/patin/.test(n)) return "patines";
  if (/esqui|esquí|ski/.test(n)) return "esqui";
  if (/karate|kick|patada|artes.?marcial/.test(n)) return "karate";
  if (/box|golpe|saco/.test(n)) return "boxeo";
  if (/bail|dance|zumba/.test(n)) return "baile";
  if (/voleibol|volleyball|v[oó]ley/.test(n)) return "voleibol";
  if (/f[uú]tbol|soccer/.test(n)) return "futbol";
  if (/ping.?pong|p[aá]del/.test(n)) return "pingpong";
  if (/tenis/.test(n)) return "tenis";
  if (/golf/.test(n)) return "golf";
  if (/basket|baloncesto/.test(n)) return "basket";
  return "otro";
}
