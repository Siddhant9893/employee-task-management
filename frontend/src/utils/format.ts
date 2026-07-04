import dayjs from 'dayjs'

export const formatDate = (value?: string | Date | null) => {
  if (!value) {
    return '-'
  }

  return dayjs(value).format('DD MMM YYYY')
}

export const toApiDate = (value: dayjs.Dayjs) => value.startOf('day').toISOString()

export const labelize = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
