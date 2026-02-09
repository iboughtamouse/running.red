/**
 * Payload Lexical rich text serialization format.
 *
 * Lexical serializes rich text as a JSON tree with a root node.
 * This is a minimal type — enough to distinguish rich text from
 * plain strings. The full node types will be refined when we
 * build the rich text renderer in Phase 2/3.
 */
export interface RichText {
  root: {
    type: string;
    children: Record<string, unknown>[];
    [key: string]: unknown;
  };
}
