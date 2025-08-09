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

// Field definition type
export type JsonSchemaDefinition = {
    bsonType: MongoDBBsonType | MongoDBBsonType[];
    description?: string;
    enum?: unknown[];
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
