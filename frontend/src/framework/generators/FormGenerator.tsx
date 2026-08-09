import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useForm, type DefaultValues, type Resolver } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { DateInput } from '@/components/forms/DateInput'
import { FormField } from '@/components/forms/FormField'
import { SelectInput } from '@/components/forms/SelectInput'
import { TextareaInput } from '@/components/forms/TextareaInput'
import { TextInput } from '@/components/forms/TextInput'
import type { FormConfig, FormFieldConfig } from '@/types/configuration.types'

export type FormValues = Record<string, unknown>

export interface FormGeneratorProps {
  formConfig: FormConfig
  mode: 'create' | 'edit'
  initialData?: FormValues
  onSubmit: (values: FormValues) => void | Promise<void>
  isSubmitting: boolean
  serverErrors?: Record<string, string>
  serverError?: string
}

const spans: Record<number, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
  5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
  9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
}

export function buildFormSchema(formConfig: FormConfig) {
  const shape: Record<string, z.ZodTypeAny> = {}
  formConfig.fields.forEach((field) => {
    if (field.type === 'checkbox') { shape[field.name] = field.required ? z.literal(true, { errorMap: () => ({ message: `${field.label} is required` }) }) : z.boolean().optional(); return }
    if (field.type === 'file') {
      const schema = z.any().refine((value) => !field.required || (value instanceof FileList && value.length > 0), `${field.label} is required`)
      shape[field.name] = schema
      return
    }
    let schema = z.string({ required_error: `${field.label} is required` })
    if (field.required) schema = schema.min(1, field.validation?.message ?? `${field.label} is required`)
    const minimum = field.validation?.min_length ?? field.validation?.min
    const maximum = field.validation?.max_length ?? field.validation?.max
    if (minimum !== undefined) schema = schema.min(minimum, field.validation?.message ?? `${field.label} must be at least ${minimum} characters`)
    if (maximum !== undefined) schema = schema.max(maximum, field.validation?.message ?? `${field.label} must be at most ${maximum} characters`)
    if (field.type === 'email') schema = schema.email(field.validation?.message ?? 'Enter a valid email address')
    if (field.type === 'url') schema = schema.url(field.validation?.message ?? 'Enter a valid URL')
    if (field.validation?.pattern) schema = schema.regex(new RegExp(field.validation.pattern), field.validation.message ?? `${field.label} has an invalid format`)
    shape[field.name] = field.required ? schema : schema.optional().or(z.literal(''))
  })
  return z.object(shape).strict()
}

function defaults(formConfig: FormConfig, initialData?: FormValues): FormValues {
  return Object.fromEntries(formConfig.fields.map((field) => [field.name, initialData?.[field.name] ?? field.default_value ?? field.defaultValue ?? (field.type === 'checkbox' ? false : '')]))
}

export function FormGenerator({ formConfig, mode, initialData, onSubmit, isSubmitting, serverErrors, serverError }: FormGeneratorProps) {
  const navigate = useNavigate()
  const schema = useMemo(() => buildFormSchema(formConfig), [formConfig])
  const defaultValues = useMemo(() => defaults(formConfig, initialData), [formConfig, initialData])
  const { register, handleSubmit, formState: { errors }, reset, setError } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: defaultValues as DefaultValues<FormValues>,
  })

  useEffect(() => reset(defaultValues), [defaultValues, reset])
  useEffect(() => { Object.entries(serverErrors ?? {}).forEach(([name, message]) => setError(name, { type: 'server', message })) }, [serverErrors, setError])
  const sections = useMemo(() => {
    const grouped = new Map<string, FormFieldConfig[]>()
    formConfig.fields.forEach((field) => grouped.set(field.section ?? 'General', [...(grouped.get(field.section ?? 'General') ?? []), field]))
    return [...grouped]
  }, [formConfig.fields])
  const layoutColumns = formConfig.layout?.type === 'columns' ? formConfig.layout.columns : 1
  const defaultSpan = 12 / layoutColumns

  const renderField = (field: FormFieldConfig) => {
    const registration = register(field.name)
    if (field.type === 'hidden') return <input key={field.name} type="hidden" {...registration} />
    const message = (errors[field.name] as { message?: string } | undefined)?.message ?? serverErrors?.[field.name]
    const common = { id: field.name, placeholder: field.placeholder, disabled: field.disabled || isSubmitting, ...registration }
    let input
    if (field.type === 'textarea') input = <TextareaInput {...common} rows={field.rows ?? 4} />
    else if (field.type === 'select' || field.type === 'radio') input = <SelectInput {...common} options={field.options ?? []} />
    else if (field.type === 'date') input = <DateInput {...common} />
    else if (field.type === 'checkbox') input = <input id={field.name} type="checkbox" disabled={field.disabled || isSubmitting} {...registration} />
    else input = <TextInput {...common} type={field.type === 'datetime' ? 'datetime-local' : field.type === 'currency' ? 'number' : field.type} />
    const fieldSpan = field.grid?.columns ?? defaultSpan
    return <div key={field.name} data-grid-columns={fieldSpan} className={`col-span-12 ${spans[fieldSpan]}`}><FormField name={field.name} label={field.label} required={field.required} error={message} description={field.description}>{input}</FormField></div>
  }

  return <form data-mode={mode} noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">{serverError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{serverError}</div>}{sections.map(([section, fields]) => <fieldset key={section} className="space-y-4">{(sections.length > 1 || section !== 'General') && <legend className="text-base font-semibold">{section}</legend>}<div className="grid grid-cols-12 gap-4">{fields.map(renderField)}</div></fieldset>)}<div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-gray-700">{formConfig.cancelEnabled !== false && <button type="button" onClick={() => formConfig.cancelPath ? navigate(formConfig.cancelPath) : navigate(-1)} disabled={isSubmitting} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{formConfig.cancelLabel ?? 'Cancel'}</button>}{formConfig.resetEnabled && <button type="button" onClick={() => reset(defaultValues)} disabled={isSubmitting} className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700">{formConfig.resetLabel ?? 'Reset'}</button>}<button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:from-blue-700 hover:to-indigo-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting && <LoaderCircle size={16} className="animate-spin" />}{formConfig.submitLabel ?? (mode === 'create' ? 'Create' : 'Save changes')}</button></div></form>
}
