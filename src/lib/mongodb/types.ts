export type JsonSchemaValidator = {
    $jsonSchema: {
        bsonType: string;
        required?: string[];
        properties: {
            [key: string]: {
                bsonType: string;
                items?: {
                    bsonType: string;
                };
                enum?: string[];
                description?: string;
                minimum?: number;
                properties?: {
                    [key: string]: unknown;
                };
            };
        };
    };
}
