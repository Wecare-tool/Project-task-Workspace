import { generateId } from '@utils/index';

const STORAGE_PREFIX = 'pm2_';

/**
 * Generic storage service for CRUD operations with localStorage
 */
export class StorageService<T extends { id: string }> {
    private key: string;

    constructor(entityName: string) {
        this.key = `${STORAGE_PREFIX}${entityName}`;
    }

    private getStorage(): T[] {
        try {
            const data = localStorage.getItem(this.key);
            return data ? JSON.parse(data) : [];
        } catch {
            console.error(`Error reading from localStorage: ${this.key}`);
            return [];
        }
    }

    private setStorage(data: T[]): void {
        try {
            localStorage.setItem(this.key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error writing to localStorage: ${this.key}`, error);
        }
    }

    getAll(): T[] {
        return this.getStorage();
    }

    getById(id: string): T | undefined {
        return this.getStorage().find(item => item.id === id);
    }

    create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
        const now = new Date();
        const newItem = {
            ...item,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
        } as T;

        const data = this.getStorage();
        data.push(newItem);
        this.setStorage(data);

        return newItem;
    }

    update(id: string, updates: Partial<T>): T | undefined {
        const data = this.getStorage();
        const index = data.findIndex(item => item.id === id);

        if (index === -1) return undefined;

        const updatedItem = {
            ...data[index],
            ...updates,
            id, // Preserve original ID
            updatedAt: new Date(),
        };

        data[index] = updatedItem;
        this.setStorage(data);

        return updatedItem;
    }

    delete(id: string): boolean {
        const data = this.getStorage();
        const filtered = data.filter(item => item.id !== id);

        if (filtered.length === data.length) return false;

        this.setStorage(filtered);
        return true;
    }

    deleteMany(ids: string[]): number {
        const data = this.getStorage();
        const filtered = data.filter(item => !ids.includes(item.id));
        const deletedCount = data.length - filtered.length;

        this.setStorage(filtered);
        return deletedCount;
    }

    clear(): void {
        this.setStorage([]);
    }

    count(): number {
        return this.getStorage().length;
    }

    filter(predicate: (item: T) => boolean): T[] {
        return this.getStorage().filter(predicate);
    }

    find(predicate: (item: T) => boolean): T | undefined {
        return this.getStorage().find(predicate);
    }

    exists(id: string): boolean {
        return this.getStorage().some(item => item.id === id);
    }

    seed(data: T[]): void {
        if (this.count() === 0) {
            this.setStorage(data);
        }
    }
}

/**
 * Helper to create a storage service for an entity
 */
export function createStorage<T extends { id: string }>(entityName: string): StorageService<T> {
    return new StorageService<T>(entityName);
}
