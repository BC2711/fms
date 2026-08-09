export type EndpointParams = Record<string, string | number | boolean>

export function resolveEndpoint(template: string, params: EndpointParams = {}): string {
  const resolved = template.replace(/\{([^{}]+)\}/g, (placeholder, name: string) => {
    if (!Object.prototype.hasOwnProperty.call(params, name)) return placeholder
    return encodeURIComponent(String(params[name]))
  })

  const unresolved = [...resolved.matchAll(/\{([^{}]+)\}/g)].map((match) => match[1])
  if (unresolved.length) {
    throw new Error(`Unable to resolve endpoint "${template}": missing parameter(s) ${unresolved.join(', ')}`)
  }

  return resolved
}
