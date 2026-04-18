import { describe, it, expect } from 'vitest';

// Load all block definitions into the registry
import '@/lib/blocks/index';

import {
  getAllBlockDefinitions,
  getBlockDefinition,
  getBlocksByCategory,
  getRegisteredBlockTypes,
  isBlockRegistered,
} from '@/lib/blocks/registry';
import { createDefaultData } from '@/lib/blocks/types';

// ── Registration count ────────────────────────────────────────────────────────
describe('Block registry — registration', () => {
  it('has at least 30 blocks registered', () => {
    expect(getAllBlockDefinitions().length).toBeGreaterThanOrEqual(30);
  });

  it('HeroBlock is registered', () => {
    expect(isBlockRegistered('HeroBlock')).toBe(true);
  });

  it('TextBlock is registered', () => {
    expect(isBlockRegistered('TextBlock')).toBe(true);
  });

  it('ColumnBlock is registered and flagged as a container (isGroup)', () => {
    const def = getBlockDefinition('ColumnBlock');
    expect(def).toBeDefined();
    expect(def?.isGroup).toBe(true);
  });

  it('SpacerBlock is registered', () => {
    expect(isBlockRegistered('SpacerBlock')).toBe(true);
  });

  it('CTABannerBlock is registered', () => {
    expect(isBlockRegistered('CTABannerBlock')).toBe(true);
  });

  it('returns undefined for an unknown block type', () => {
    expect(getBlockDefinition('NonExistentBlock')).toBeUndefined();
  });

  it('isBlockRegistered returns false for unknown block', () => {
    expect(isBlockRegistered('GhostBlock')).toBe(false);
  });
});

// ── getRegisteredBlockTypes ───────────────────────────────────────────────────
describe('getRegisteredBlockTypes', () => {
  it('returns an array of strings', () => {
    const types = getRegisteredBlockTypes();
    expect(Array.isArray(types)).toBe(true);
    expect(types.every(t => typeof t === 'string')).toBe(true);
  });

  it('contains expected block types', () => {
    const types = getRegisteredBlockTypes();
    const required = ['HeroBlock', 'TextBlock', 'ImageBlock', 'CTABannerBlock', 'SpacerBlock', 'ColumnBlock', 'StatsBlock'];
    for (const t of required) {
      expect(types).toContain(t);
    }
  });
});

// ── getBlocksByCategory ───────────────────────────────────────────────────────
describe('getBlocksByCategory', () => {
  it('groups blocks into category buckets', () => {
    const grouped = getBlocksByCategory();
    expect(typeof grouped).toBe('object');
    expect(Object.keys(grouped).length).toBeGreaterThan(0);
  });

  it('each category value is a non-empty array', () => {
    const grouped = getBlocksByCategory();
    for (const [, arr] of Object.entries(grouped)) {
      expect(Array.isArray(arr)).toBe(true);
      expect(arr.length).toBeGreaterThan(0);
    }
  });

  it('all blocks appear in exactly one category', () => {
    const all      = getAllBlockDefinitions().length;
    const grouped  = getBlocksByCategory();
    const total    = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
    expect(total).toBe(all);
  });
});

// ── Block definitions integrity ───────────────────────────────────────────────
describe('Block definitions — integrity', () => {
  it('every block has a non-empty type, name, category, and icon', () => {
    for (const def of getAllBlockDefinitions()) {
      expect(def.type.length).toBeGreaterThan(0);
      expect(def.name.length).toBeGreaterThan(0);
      expect(def.category.length).toBeGreaterThan(0);
      expect(def.icon.length).toBeGreaterThan(0);
    }
  });

  it('all field types are from the allowed set', () => {
    const allowed = new Set([
      'string', 'textarea', 'color', 'image', 'markdown',
      'select', 'bool', 'number', 'url', 'product-select', 'category-select',
    ]);
    for (const def of getAllBlockDefinitions()) {
      for (const [, field] of Object.entries(def.fields)) {
        expect(allowed.has(field.type)).toBe(true);
      }
    }
  });

  it('HeroBlock has required fields: Title, Background, ButtonText', () => {
    const def = getBlockDefinition('HeroBlock')!;
    expect(def.fields.Title).toBeDefined();
    expect(def.fields.Background).toBeDefined();
    expect(def.fields.ButtonText).toBeDefined();
  });
});

// ── createDefaultData ─────────────────────────────────────────────────────────
describe('createDefaultData', () => {
  it('fills all fields with Value key', () => {
    const def  = getBlockDefinition('HeroBlock')!;
    const data = createDefaultData(def);
    for (const key of Object.keys(def.fields)) {
      expect(data[key]).toHaveProperty('Value');
    }
  });

  it('uses defaultValue when provided', () => {
    const def  = getBlockDefinition('HeroBlock')!;
    const data = createDefaultData(def);
    // TitleColor has defaultValue '#ffffff'
    expect(data.TitleColor?.Value).toBe('#ffffff');
  });

  it('uses empty string when no defaultValue', () => {
    const def  = getBlockDefinition('HeroBlock')!;
    const data = createDefaultData(def);
    // Title has no defaultValue
    expect(data.Title?.Value).toBe('');
  });
});
