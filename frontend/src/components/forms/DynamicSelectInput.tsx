import { useQuery } from '@tanstack/react-query'
import type { ComponentProps } from 'react'

import { SelectInput } from '@/components/forms/SelectInput'
import { get } from '@/services/api-client'
import type { FormFieldConfig, SelectOptionConfig } from '@/types/configuration.types'

const inferredEndpoints: Record<string, string> = {
  station_id: '/stations',
  station_type_id: '/stations/station-types',
  station_group_id: '/stations/station-groups',
  oil_marketing_company_id: '/accounts/oil-marketing-companies',
  product_id: '/fuel-operations/fuel-products',
  country_id: '/administration/countries',
  province_id: '/administration/provinces',
  district_id: '/administration/districts',
}

interface ListEnvelope { data: { items: Record<string, unknown>[] } }

export function DynamicSelectInput({ field, ...props }: { field: FormFieldConfig } & Omit<ComponentProps<typeof SelectInput>, 'options'>) {
  const endpoint = field.options_endpoint ?? (field.options?.length ? undefined : inferredEndpoints[field.name])
  const query = useQuery({
    queryKey: ['select-options', endpoint],
    queryFn: () => get<ListEnvelope>(endpoint!, { params: { pageSize: 100, sortBy: field.option_label ?? 'name', sortDirection: 'asc' } }),
    enabled: Boolean(endpoint),
    staleTime: 60_000,
  })
  const labelKey = field.option_label ?? 'name'
  const valueKey = field.option_value ?? 'id'
  const remoteOptions: SelectOptionConfig[] = query.data?.data.items.map((item) => ({ label: String(item[labelKey] ?? item.name ?? item.code ?? item[valueKey]), value: String(item[valueKey] ?? '') })) ?? []
  return <SelectInput {...props} placeholder={query.isError ? 'Unable to load options' : props.placeholder} disabled={props.disabled || query.isLoading || query.isError} options={endpoint ? remoteOptions : (field.options ?? [])} />
}
