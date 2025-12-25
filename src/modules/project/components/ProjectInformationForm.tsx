import { useForm, Controller, useWatch } from 'react-hook-form';
import { Lock } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Textarea, Select } from '@components/ui';
import { projectSchema, projectStatusOptions, type ProjectFormData } from '../schema';

interface Props {
    defaultValues?: Partial<ProjectFormData>;
    onSubmit: (data: ProjectFormData) => void;
    onCancel: () => void;
    isLoading?: boolean;
    submitText?: string;
    cancelText?: string;
}

export function ProjectInformationForm({
    defaultValues,
    onSubmit,
    onCancel,
    isLoading,
    submitText = 'Lưu',
    cancelText = 'Hủy'
}: Props) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ProjectFormData>({
        resolver: zodResolver(projectSchema),
        defaultValues,
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Left Column: Basic Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 border-b pb-2 mb-4">Project Details</h3>

                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Project Name"
                                    placeholder="Enter project name"
                                    required
                                    disabled={isLoading}
                                    error={errors.name?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label="Project Code"
                                    placeholder="Ex: PRJ-001"
                                    required
                                    helperText="Short code to identify the project"
                                    disabled={isLoading}
                                    error={errors.code?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Status"
                                    options={projectStatusOptions}
                                    required
                                    disabled={isLoading}
                                    error={errors.status?.message}
                                    {...field}
                                />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    label="Description"
                                    placeholder="Detailed project description"
                                    disabled={isLoading}
                                    error={errors.description?.message}
                                    className="min-h-[100px]"
                                    {...field}
                                    value={field.value || ''}
                                />
                            )}
                        />

                    </div>

                    {/* Time line Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 border-b pb-2 mb-4">Time line</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="date"
                                        label="Start date"
                                        required
                                        disabled={isLoading}
                                        error={errors.startDate?.message}
                                        {...field}
                                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                )}
                            />

                            <Controller
                                name="endDate"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="date"
                                        label="End date"
                                        required
                                        disabled={isLoading}
                                        error={errors.endDate?.message}
                                        {...field}
                                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                                        onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                                    />
                                )}
                            />

                            <div className="relative">
                                <DurationField control={control} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: AI Prompts */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-neutral-900 border-b pb-2 mb-4">AI Context & Planning</h3>

                        <div className="space-y-4 p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                            <Controller
                                name="projectContext"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        label="Project Context"
                                        placeholder="Detailed context about the project environment, background..."
                                        disabled={isLoading}
                                        error={errors.projectContext?.message}
                                        className="min-h-[100px] text-sm font-mono"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />

                            <Controller
                                name="objective"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        label="Objective"
                                        placeholder="Clear, measurable objectives..."
                                        disabled={isLoading}
                                        error={errors.objective?.message}
                                        className="min-h-[80px] text-sm font-mono"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />

                            <Controller
                                name="scope"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        label="Scope"
                                        placeholder="In-scope and out-of-scope items..."
                                        disabled={isLoading}
                                        error={errors.scope?.message}
                                        className="min-h-[80px] text-sm font-mono"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />

                            <Controller
                                name="planning"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        label="Planning"
                                        placeholder="Strategic planning details..."
                                        disabled={isLoading}
                                        error={errors.planning?.message}
                                        className="min-h-[80px] text-sm font-mono"
                                        {...field}
                                        value={field.value || ''}
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-3 rounded-b-lg">
                <Button variant="secondary" onClick={onCancel} type="button" disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    {submitText}
                </Button>
            </div>
        </form>
    );
}

// Helper component to watch values and calculate duration
function DurationField({ control }: { control: any }) {
    const startDate = useWatch({
        control,
        name: 'startDate',
    });
    const endDate = useWatch({
        control,
        name: 'endDate',
    });

    let displayDuration = '';

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            displayDuration = diffDays.toFixed(2);
        }
    }

    return (
        <Input
            label="Duration"
            disabled={true}
            readOnly
            value={displayDuration}
            className="bg-neutral-50"
            leftIcon={<Lock className="w-4 h-4 text-neutral-400" />}
        />
    );
}
