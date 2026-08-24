import type { Book } from '../types/resonance';
import type { BulkEditOperation } from '../types/readerPlugins';
import { parseYamlFrontmatter, stringifyYamlFrontmatter } from '../utils/yamlFrontmatterParser';

export function executeBulkEdits(books: Book[], operation: BulkEditOperation): Book[] {
  const targetSet = new Set(operation.targetBookIds);

  return books.map((book) => {
    if (!targetSet.has(book.id)) return book;

    const { metadata, body } = parseYamlFrontmatter(book.sidecarMarkdown);

    // 1. Tags update
    let currentTags = Array.isArray(metadata['tags']) ? (metadata['tags'] as string[]) : [];
    if (operation.addTags && operation.addTags.length > 0) {
      currentTags = Array.from(new Set([...currentTags, ...operation.addTags]));
    }
    if (operation.removeTags && operation.removeTags.length > 0) {
      const removeSet = new Set(operation.removeTags);
      currentTags = currentTags.filter(t => !removeSet.has(t));
    }
    metadata['tags'] = currentTags;

    // 2. Reading Status
    if (operation.setStatus) {
      metadata['reading_status'] = operation.setStatus;
    }

    // 3. Rating
    if (operation.setRating !== undefined) {
      metadata['rating'] = operation.setRating;
    }

    // 4. Relative Link Root
    if (operation.newRelLinkRoot) {
      metadata['rel_link_root'] = operation.newRelLinkRoot;
    }

    // 5. Custom YAML Key-Values
    if (operation.customYamlEdits) {
      Object.entries(operation.customYamlEdits).forEach(([k, v]) => {
        metadata[k] = v;
      });
    }

    metadata['updated_at'] = new Date().toISOString();

    // 6. Find & Replace in Markdown Body
    let updatedBody = body;
    if (operation.findText && operation.replaceText !== undefined) {
      updatedBody = updatedBody.split(operation.findText).join(operation.replaceText);
    }

    const updatedSidecar = stringifyYamlFrontmatter(metadata, updatedBody);

    return {
      ...book,
      sidecarMarkdown: updatedSidecar
    };
  });
}
