import * as am5 from '@amcharts/amcharts5'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import * as am5percent from '@amcharts/amcharts5/percent'
import * as am5xy from '@amcharts/amcharts5/xy'
import { useLayoutEffect, useRef } from 'react'

export interface ChartPoint { label: string; value: number }

const colors = [0x06b6d4, 0xf59e0b, 0xf43f5e, 0x10b981, 0x8b5cf6, 0x3b82f6, 0x64748b]

function useChartRoot(build: (root: am5.Root) => void, data: ChartPoint[]) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (!ref.current || data.length === 0) return
    const root = am5.Root.new(ref.current)
    root.setThemes([am5themes_Animated.new(root)])
    build(root)
    return () => root.dispose()
  }, [data, build])
  return ref
}

function EmptyChart() { return <div className="grid h-64 place-items-center text-sm text-slate-400">No activity recorded yet</div> }

export function ActivityLineChart({ data }: { data: ChartPoint[] }) {
  const build = (root: am5.Root) => {
    const chart = root.container.children.push(am5xy.XYChart.new(root, { panX: false, panY: false, paddingLeft: 0 }))
    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
    xRenderer.grid.template.setAll({ strokeOpacity: 0 })
    const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, { categoryField: 'label', renderer: xRenderer }))
    const yRenderer = am5xy.AxisRendererY.new(root, {})
    yRenderer.grid.template.setAll({ strokeOpacity: 0.12, strokeDasharray: [3, 3] })
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { min: 0, extraMax: 0.15, renderer: yRenderer }))
    const series = chart.series.push(am5xy.LineSeries.new(root, { name: 'Records', xAxis, yAxis, categoryXField: 'label', valueYField: 'value', stroke: am5.color(colors[0]), fill: am5.color(colors[0]), tooltip: am5.Tooltip.new(root, { labelText: '{categoryX}: {valueY} records' }) }))
    series.strokes.template.setAll({ strokeWidth: 3 })
    series.fills.template.setAll({ visible: true, fillOpacity: 0.12 })
    series.bullets.push(() => am5.Bullet.new(root, { sprite: am5.Circle.new(root, { radius: 4, fill: am5.color(colors[0]), stroke: root.interfaceColors.get('background'), strokeWidth: 2 }) }))
    xAxis.data.setAll(data); series.data.setAll(data); series.appear(700); chart.appear(700, 80)
  }
  const ref = useChartRoot(build, data)
  return data.length ? <div ref={ref} className="h-64 w-full" role="img" aria-label="Six month operational activity chart" /> : <EmptyChart />
}

export function ModuleBarChart({ data, ariaLabel = 'Activity by module chart' }: { data: ChartPoint[]; ariaLabel?: string }) {
  const build = (root: am5.Root) => {
    const chart = root.container.children.push(am5xy.XYChart.new(root, { panX: false, panY: false, layout: root.verticalLayout, paddingLeft: 0 }))
    const yRenderer = am5xy.AxisRendererY.new(root, { inversed: true, minGridDistance: 18 })
    yRenderer.grid.template.setAll({ strokeOpacity: 0 })
    const yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, { categoryField: 'label', renderer: yRenderer }))
    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 35 })
    xRenderer.grid.template.setAll({ strokeOpacity: 0.1 })
    const xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { min: 0, extraMax: 0.12, renderer: xRenderer }))
    const series = chart.series.push(am5xy.ColumnSeries.new(root, { xAxis, yAxis, categoryYField: 'label', valueXField: 'value', tooltip: am5.Tooltip.new(root, { labelText: '{categoryY}: {valueX}' }) }))
    series.columns.template.setAll({ height: am5.percent(62), cornerRadiusTR: 4, cornerRadiusBR: 4, strokeOpacity: 0 })
    series.columns.template.adapters.add('fill', (_fill, target) => am5.color(colors[series.columns.indexOf(target) % colors.length]))
    series.columns.template.adapters.add('stroke', (_stroke, target) => am5.color(colors[series.columns.indexOf(target) % colors.length]))
    yAxis.data.setAll(data); series.data.setAll(data); series.appear(700); chart.appear(700, 80)
  }
  const ref = useChartRoot(build, data)
  return data.length ? <div ref={ref} className="h-64 w-full" role="img" aria-label={ariaLabel} /> : <EmptyChart />
}

export function DistributionChart({ data, ariaLabel = 'Record status distribution chart' }: { data: ChartPoint[]; ariaLabel?: string }) {
  const build = (root: am5.Root) => {
    const chart = root.container.children.push(am5percent.PieChart.new(root, { layout: root.horizontalLayout, innerRadius: am5.percent(62) }))
    const series = chart.series.push(am5percent.PieSeries.new(root, { valueField: 'value', categoryField: 'label', alignLabels: false, legendLabelText: '{category}', legendValueText: '{valuePercentTotal.formatNumber("0.0")}%'}))
    series.get('colors')?.set('colors', colors.map((color) => am5.color(color)))
    series.labels.template.set('forceHidden', true); series.ticks.template.set('forceHidden', true)
    series.slices.template.setAll({ strokeWidth: 2, tooltipText: '{category}: {value} ({valuePercentTotal.formatNumber("0.0")}%)' })
    const legend = chart.children.push(am5.Legend.new(root, { centerY: am5.percent(50), y: am5.percent(50), layout: root.verticalLayout }))
    legend.data.setAll(series.dataItems); series.data.setAll(data); legend.data.setAll(series.dataItems); series.appear(700, 80)
  }
  const ref = useChartRoot(build, data)
  return data.length ? <div ref={ref} className="h-64 w-full" role="img" aria-label={ariaLabel} /> : <EmptyChart />
}
