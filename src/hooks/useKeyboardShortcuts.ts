import { useEffect } from 'react';

type KeyCombo = {
    key: string;
    ctrl?: boolean;
    meta?: boolean; // Command key on Mac
    shift?: boolean;
    alt?: boolean;
};

type ShortcutHandler = (e: KeyboardEvent) => void;

interface ShortcutConfig {
    combo: KeyCombo;
    handler: ShortcutHandler;
    description?: string;
    global?: boolean; // If true, works even if input is focused (use with caution)
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            shortcuts.forEach(({ combo, handler, global }) => {
                // Check if key matches
                if (event.key.toLowerCase() !== combo.key.toLowerCase()) return;

                // Check modifiers
                if (!!combo.ctrl !== (event.ctrlKey)) return;
                if (!!combo.meta !== (event.metaKey)) return;
                if (!!combo.shift !== (event.shiftKey)) return;
                if (!!combo.alt !== (event.altKey)) return;

                // Check if input is focused (unless global)
                if (!global) {
                    const target = event.target as HTMLElement;
                    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                        return;
                    }
                }

                event.preventDefault();
                handler(event);
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [shortcuts]);
}
