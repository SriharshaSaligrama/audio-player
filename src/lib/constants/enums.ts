import { Collections } from "@/lib/constants/collections";

// 1. Single source of truth for reasons
export const TAKEDOWN_REASONS = [
    'copyright_infringement',
    'trademark_violation',
    'license_expired',
    'contract_termination',
    'duplicate',
    'explicit_content_violation',
    'community_guidelines',
    'privacy_violation',
    'legal_order',
    'malware_or_spam',
    'unauthorized_use',
    'other',
] as const;

export type TakedownReason = typeof TAKEDOWN_REASONS[number];

// 2. Define the allowed entities
export const ENTITIES = [Collections.TRACKS, Collections.ALBUMS, Collections.ARTISTS, Collections.PLAYLISTS] as const;
export type EntityType = typeof ENTITIES[number];

// 3. Define excluded reasons with full type safety
const EXCLUDED_REASONS: { [K in EntityType]: TakedownReason[] } = {
    [Collections.TRACKS]: [],
    [Collections.ALBUMS]: [],
    [Collections.ARTISTS]: ['explicit_content_violation', 'malware_or_spam'],
    [Collections.PLAYLISTS]: ['license_expired', 'contract_termination'],
};

// 4. Auto-generate reasons per entity
export const REASONS_BY_ENTITY: { [K in EntityType]: TakedownReason[] } =
    Object.fromEntries(
        ENTITIES.map((entity) => [
            entity,
            TAKEDOWN_REASONS.filter((reason) => !EXCLUDED_REASONS[entity].includes(reason)),
        ])
    ) as { [K in EntityType]: TakedownReason[] };

// ✅ Now everything is type-checked.
// If you add/remove a reason from TAKEDOWN_REASONS, TypeScript forces updates everywhere.
