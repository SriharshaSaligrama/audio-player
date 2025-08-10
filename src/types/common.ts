import type { ObjectId } from 'mongodb';

export type Option = { value: string; label: string };

// Intended semantics: form initial values are the entity shape T,
// plus an _id in edit mode, and no _id in create mode.
export type CreateInitial<T> = { _id?: never } & T;
export type EditInitial<T> = { _id: string | ObjectId } & T;
