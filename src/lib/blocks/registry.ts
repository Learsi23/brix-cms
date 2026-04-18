// ====================================================================
// BLOCK REGISTRY - Brix CMS
// ====================================================================
// Equivalente TypeScript al BlockRegistry.cs de .NET
// Registra y descubre tipos de bloques disponibles en el sistema
// ====================================================================

import type { BlockDefinition } from './types';

const _registry = new Map<string, BlockDefinition>();

/** Registra un tipo de bloque en el sistema */
export function registerBlock(def: BlockDefinition): void {
  _registry.set(def.type, def);
}

/** Obtiene la definición de un tipo de bloque por su nombre */
export function getBlockDefinition(type: string): BlockDefinition | undefined {
  return _registry.get(type);
}

/** Devuelve todos los bloques registrados */
export function getAllBlockDefinitions(): BlockDefinition[] {
  return Array.from(_registry.values());
}

/** Devuelve los bloques agrupados por categoría */
export function getBlocksByCategory(): Record<string, BlockDefinition[]> {
  const result: Record<string, BlockDefinition[]> = {};
  for (const def of _registry.values()) {
    if (!result[def.category]) result[def.category] = [];
    result[def.category].push(def);
  }
  return result;
}

/** Comprueba si un tipo de bloque está registrado */
export function isBlockRegistered(type: string): boolean {
  return _registry.has(type);
}

/** Devuelve solo los nombres de los bloques registrados */
export function getRegisteredBlockTypes(): string[] {
  return Array.from(_registry.keys());
}
