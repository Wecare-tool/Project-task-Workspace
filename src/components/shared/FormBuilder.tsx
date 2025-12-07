import { useForm, Controller, type FieldValues, type DefaultValues, type Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';
import { Button, Input, Textarea, Select, Checkbox } from '@components/ui';
import type { FormField } from '@/types';

interface FormBuilderProps<T extends FieldValues> {
    fields: FormField[];
    schema: ZodSchema<T>;
    defaultValues?: DefaultValues<T>;
    onSubmit: (data: T) => void | Promise<void>;
    onCancel?: () => void;
    submitText?: string;
    cancelText?: string;
    isLoading?: boolean;
    className?: string;
}

export function FormBuilder<T extends FieldValues>({
    fields,
    schema,
    defaultValues,
    onSubmit,
    onCancel,
    submitText = 'Lưu',
    cancelText = 'Hủy',
    isLoading = false,
    className = '',
}: FormBuilderProps<T>) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<T>({
        resolver: zodResolver(schema),
        defaultValues,
    });

    const getErrorMessage = (name: string): string | undefined => {
        const error = errors[name as keyof typeof errors];
        return error?.message as string | undefined;
    };

    const renderField = (field: FormField) => {
        const error = getErrorMessage(field.name);

        return (
            <Controller
                key={field.name}
                name={field.name as Path<T>}
                control={control}
                render={({ field: controllerField }) => {
                    switch (field.type) {
                        case 'textarea':
                            return (
                                <Textarea
                                    {...controllerField}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    disabled={field.disabled || isLoading}
                                    error={error}
                                    helperText={field.helperText}
                                    value={controllerField.value || ''}
                                />
                            );

                        case 'select':
                            return (
                                <Select
                                    {...controllerField}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    disabled={field.disabled || isLoading}
                                    options={field.options || []}
                                    error={error}
                                    helperText={field.helperText}
                                    value={controllerField.value || ''}
                                />
                            );

                        case 'checkbox':
                            return (
                                <Checkbox
                                    {...controllerField}
                                    label={field.label}
                                    disabled={field.disabled || isLoading}
                                    error={error}
                                    checked={controllerField.value || false}
                                    onChange={(e) => controllerField.onChange(e.target.checked)}
                                />
                            );

                        case 'date':
                            return (
                                <Input
                                    {...controllerField}
                                    type="date"
                                    label={field.label}
                                    required={field.required}
                                    disabled={field.disabled || isLoading}
                                    error={error}
                                    helperText={field.helperText}
                                    value={controllerField.value ?
                                        new Date(controllerField.value).toISOString().split('T')[0] :
                                        ''
                                    }
                                    onChange={(e) => {
                                        const date = e.target.value ? new Date(e.target.value) : null;
                                        controllerField.onChange(date);
                                    }}
                                />
                            );

                        case 'datetime':
                            return (
                                <Input
                                    {...controllerField}
                                    type="datetime-local"
                                    label={field.label}
                                    required={field.required}
                                    disabled={field.disabled || isLoading}
                                    error={error}
                                    helperText={field.helperText}
                                    value={controllerField.value || ''}
                                />
                            );

                        case 'number':
                            return (
                                <Input
                                    {...controllerField}
                                    type="number"
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    disabled={field.disabled || isLoading}
                                    min={field.min}
                                    max={field.max}
                                    error={error}
                                    helperText={field.helperText}
                                    value={controllerField.value ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value === '' ? null : Number(e.target.value);
                                        controllerField.onChange(value);
                                    }}
                                />
                            );

                        case 'color':
                            return (
                                <div className="w-full">
                                    {field.label && (
                                        <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                            {field.label}
                                            {field.required && <span className="text-danger-500 ml-1">*</span>}
                                        </label>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            {...controllerField}
                                            className="w-12 h-10 rounded-lg border border-dark-200 cursor-pointer"
                                            disabled={field.disabled || isLoading}
                                        />
                                        <Input
                                            value={controllerField.value || '#000000'}
                                            onChange={(e) => controllerField.onChange(e.target.value)}
                                            disabled={field.disabled || isLoading}
                                            className="flex-1"
                                        />
                                    </div>
                                    {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
                                </div>
                            );

                        default:
                            return (
                                <Input
                                    {...controllerField}
                                    type={field.type}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    required={field.required}
                                    disabled={field.disabled || isLoading}
                                    minLength={field.minLength}
                                    maxLength={field.maxLength}
                                    pattern={field.pattern}
                                    error={error}
                                    helperText={field.helperText}
                                    value={controllerField.value || ''}
                                />
                            );
                    }
                }}
            />
        );
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className={`space-y-4 ${className}`}
            noValidate
        >
            {fields.map(renderField)}

            <div className="flex justify-end gap-3 pt-4">
                {onCancel && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </Button>
                )}
                <Button type="submit" isLoading={isLoading}>
                    {submitText}
                </Button>
            </div>
        </form>
    );
}
