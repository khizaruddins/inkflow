import { Extension, wrappingInputRule } from '@tiptap/core';
import OrderedList from '@tiptap/extension-ordered-list';

export const CustomOrderedList = OrderedList.extend({
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^(\d+)[.)]\s$/,
        type: this.type,
        getAttributes: (match) => ({ start: +match[1] }),
        joinPredicate: (match, node) => node.childCount + node.attrs.start === +match[1],
      }),
    ];
  },
});

export const SmartListExtension = Extension.create({
  name: 'smartLists',

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;
        if (!empty) return false;

        // If inside a list item
        if (this.editor.isActive('listItem')) {
          if ($from.parent.content.size === 0) {
            return this.editor.commands.liftListItem('listItem');
          }
          return this.editor.commands.splitListItem('listItem');
        }

        const currentParagraph = $from.parent;
        if (currentParagraph.type.name !== 'paragraph') return false;

        const text = currentParagraph.textContent;

        // If paragraph is just "1." or "1)" or "1"
        if (/^(\d+)[.)]?$/.test(text.trim())) {
          const start = $from.start();
          const end = $from.end();
          return this.editor
            .chain()
            .command(({ tr }) => {
              tr.delete(start, end);
              return true;
            })
            .toggleOrderedList()
            .run();
        }

        // If paragraph is just "-", "*", or "+"
        if (/^[-*+]$/.test(text.trim())) {
          const start = $from.start();
          const end = $from.end();
          return this.editor
            .chain()
            .command(({ tr }) => {
              tr.delete(start, end);
              return true;
            })
            .toggleBulletList()
            .run();
        }

        // If paragraph starts with "1. Some text" or "1) Some text" and cursor is at the end
        const matchOrdered = text.match(/^(\d+)[.)]\s+(.+)$/);
        if (matchOrdered && $from.parentOffset === text.length) {
          const itemText = matchOrdered[2];
          const prefixLength = text.length - itemText.length;
          const start = $from.start();
          return this.editor
            .chain()
            .command(({ tr }) => {
              tr.delete(start, start + prefixLength);
              return true;
            })
            .toggleOrderedList()
            .splitListItem('listItem')
            .run();
        }

        // If paragraph starts with "- Some text" and cursor is at end
        const matchBullet = text.match(/^[-*+]\s+(.+)$/);
        if (matchBullet && $from.parentOffset === text.length) {
          const itemText = matchBullet[1];
          const prefixLength = text.length - itemText.length;
          const start = $from.start();
          return this.editor
            .chain()
            .command(({ tr }) => {
              tr.delete(start, start + prefixLength);
              return true;
            })
            .toggleBulletList()
            .splitListItem('listItem')
            .run();
        }

        return false;
      },

      Backspace: () => {
        const { state } = this.editor;
        const { selection } = state;
        const { $from, empty } = selection;
        if (!empty) return false;

        if (this.editor.isActive('listItem') && $from.parent.content.size === 0) {
          return this.editor.commands.liftListItem('listItem');
        }
        return false;
      },

      Tab: () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.sinkListItem('listItem');
        }
        return false;
      },

      'Shift-Tab': () => {
        if (this.editor.isActive('listItem')) {
          return this.editor.commands.liftListItem('listItem');
        }
        return false;
      },
    };
  },
});
