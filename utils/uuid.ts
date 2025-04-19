/**
 * Utilidad para generación y manejo de UUIDs compatibles con la base de datos
 */

// Función para generar un UUID v4 estándar
export function generateUUID(): string {
  // Implementación RFC4122 versión 4 compliant
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Función para verificar si un string es un UUID válido
export function isValidUUID(id: string | null | undefined): boolean {
  if (!id) return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Convierte un ID numérico a un UUID predecible y consistente
 * La misma entrada siempre producirá la misma salida
 */
export function convertToUUID(input: any): string {
  // Si ya es un UUID válido, devolverlo sin cambios
  if (typeof input === "string" && isValidUUID(input)) {
    return input;
  }

  // Convertir la entrada a string, sin importar el tipo
  const inputStr = String(input).replace(/[^0-9a-z]/gi, "");

  // Si la entrada está vacía, generar un UUID aleatorio
  if (!inputStr) {
    return generateUUID();
  }

  // Generar una versión determinista del UUID basada en la entrada
  // Para asegurar que la misma entrada siempre da el mismo UUID
  let hash = 0;
  for (let i = 0; i < inputStr.length; i++) {
    hash = (hash << 5) - hash + inputStr.charCodeAt(i);
    hash |= 0; // Convertir a entero de 32 bits
  }

  // Crear partes del UUID usando el hash
  let hashStr = Math.abs(hash).toString(16).padStart(8, "0");

  // Si el string es muy corto, repetirlo
  while (hashStr.length < 32) {
    hashStr += hashStr;
  }

  // Formatear como UUID v4
  return [
    hashStr.substring(0, 8),
    hashStr.substring(8, 12),
    "4" + hashStr.substring(13, 16),
    "8" + hashStr.substring(17, 20),
    hashStr.substring(20, 32),
  ].join("-");
}

// Para proyectos que necesiten rastrear qué IDs se han convertido
const convertedIdCache = new Map<string, string>();

// Versión con caché para mejorar rendimiento en conversiones repetidas
export function getConsistentUUID(input: any): string {
  const inputKey = String(input);

  // Usar el valor en caché si existe
  if (convertedIdCache.has(inputKey)) {
    return convertedIdCache.get(inputKey)!;
  }

  // Si no, convertirlo y guardarlo en caché
  const uuid = convertToUUID(input);
  convertedIdCache.set(inputKey, uuid);
  return uuid;
}
