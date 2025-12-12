import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/utils';

interface TabsContextType {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

interface TabsProps {
    defaultValue: string;
    children: ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, children, className }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultValue);

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab }}>
            <div className={cn('w-full', className)}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: ReactNode;
    className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div className={cn('flex items-center border-b border-gray-200 mb-4', className)}>
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const isActive = context.activeTab === value;

    return (
        <button
            className={cn(
                'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
                isActive
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                className
            )}
            onClick={() => context.setActiveTab(value)}
        >
            {children}
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const context = useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    if (context.activeTab !== value) return null;

    return (
        <div className={cn('animate-fade-in', className)}>
            {children}
        </div>
    );
}
