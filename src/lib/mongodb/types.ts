// MongoDB allowed BSON types
type MongoDBBsonType =
    | "double"
    | "string"
    | "object"
    | "array"
    | "binData"
    | "undefined"
    | "objectId"
    | "bool"
    | "date"
    | "null"
    | "regex"
    | "dbPointer"
    | "javascript"
    | "symbol"
    | "javascriptWithScope"
    | "int"
    | "timestamp"
    | "long"
    | "decimal"
    | "minKey"
    | "maxKey";

// MongoDB enum values
export type MongoEnumValue =
    | string
    | number
    | boolean
    | null
    | Date
    | { [key: string]: unknown }
    | unknown[]
    | { _bsontype: 'ObjectId'; id?: Uint8Array } // ObjectId placeholder
    | { _bsontype: 'Decimal128'; bytes?: Uint8Array } // Decimal128 placeholder
    | { _bsontype: 'Binary'; buffer?: Uint8Array } // Binary placeholder
    | { _bsontype: 'Long'; low?: number; high?: number } // Long placeholder
    | { _bsontype: 'Int32'; value?: number } // Int32 placeholder;

// Field definition type
export type JsonSchemaDefinition = {
    bsonType: MongoDBBsonType | MongoDBBsonType[];
    description?: string;
    enum?: readonly MongoEnumValue[];
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    properties?: Record<string, JsonSchemaDefinition>;
    required?: string[];
    items?: JsonSchemaDefinition;
    uniqueItems?: boolean;
    minItems?: number;
    maxItems?: number;
    additionalProperties?: boolean;
};

// Validator type
export type JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: "object";
        required?: string[];
        properties: Record<string, JsonSchemaDefinition>;
        additionalProperties?: boolean;
    };
};

// ---------- Base field builder ----------
const field = (
    bsonType: MongoDBBsonType | MongoDBBsonType[],
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description">
): JsonSchemaDefinition => ({
    bsonType,
    ...(description ? { description } : {}),
    ...extras,
});

// ---------- Primitive type helpers ----------
export const stringField = (
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description">
) => field("string", description, extras);

export const intField = (
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description">
) => field("int", description, extras);

export const boolField = (
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description">
) => field("bool", description, extras);

export const dateField = (
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description">
) => field("date", description, extras);

export const objectIdField = (
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description"> & { refCollection?: string }
) => field("objectId", description, extras);

// ---------- Complex type helpers ----------
export const arrayField = (
    items: JsonSchemaDefinition,
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description" | "items">
) => field("array", description, { items, ...extras });

export const objectField = (
    properties: Record<string, JsonSchemaDefinition>,
    description?: string,
    extras?: Omit<JsonSchemaDefinition, "bsonType" | "description" | "properties">
) => field("object", description, { properties, ...extras });
