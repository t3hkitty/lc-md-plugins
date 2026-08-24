/**
 * Kawaii ASCII Storyboard Plugin
 * 
 * Intercepts text nodes across LC-MD and generates live, animated ASCII art 
 * acting out the prose. Separated into a core plugin so it can be invoked 
 * across telemetry, input logs, and story drafting.
 */

export interface AsciiActor {
  id: string;
  ascii: string;
  dialogueState?: string;
}

export class AsciiStoryboardPlugin {
  id = 'ascii-storyboard';
  name = 'Kawaii ASCII Animator';
  description = 'Generates live ASCII art animations from text blocks across the ecosystem.';
  version = '1.0.0';

  private defaultActors: Record<string, string> = {
    hero: `   ( -_-)\n  /|   |\\\n   /   \\`,
    goblin: `    /\\_/\\\n   ( o.o )\n    > ^ <`,
    cat: `  /\\_/\\\n ( ^.^ )\n  > " <`
  };

  /**
   * Analyzes a block of text and returns a rendered ASCII frame
   */
  public generateFrame(text: string, leftSpeaker?: string, rightSpeaker?: string): string {
    // Basic heuristic NLP for matching actors (simulated local AI)
    let leftActor = this.defaultActors['hero'];
    let rightActor = this.defaultActors['goblin'];
    
    // Fallback to cat if it detects high kawaii needs
    if (text.toLowerCase().includes('meow') || text.toLowerCase().includes('cat')) {
        rightActor = this.defaultActors['cat'];
    }

    return `
${rightActor}     (${rightSpeaker || '...'})
   [Target]

${leftActor}     (${leftSpeaker || '...'})
   [Hero]
    `;
  }
  
  /**
   * Hooks into the global markdown renderer
   */
  public onMarkdownRender(markdown: string): string {
    // Injects a floating ASCII board if the markdown contains the trigger tag
    if (markdown.includes('#ascii')) {
      const asciiArt = this.generateFrame(markdown);
      return markdown + `\n\n\`\`\`ascii-animation\n${asciiArt}\n\`\`\``;
    }
    return markdown;
  }
}
