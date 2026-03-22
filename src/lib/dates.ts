import { format, parse, isSameDay as fnsIsSameDay, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns'

export function getTodayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function formatDisplay(iso: string): string {
  const date = parse(iso, 'yyyy-MM-dd', new Date())
  return format(date, "EEEE '·' MMMM d, yyyy")
}

export function formatShort(iso: string): string {
  const date = parse(iso, 'yyyy-MM-dd', new Date())
  return format(date, 'MMM d')
}

export function getDaysInMonth(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return eachDayOfInterval({ start, end })
}

export function isSameDay(a: string, b: string): boolean {
  const dateA = parse(a, 'yyyy-MM-dd', new Date())
  const dateB = parse(b, 'yyyy-MM-dd', new Date())
  return fnsIsSameDay(dateA, dateB)
}
