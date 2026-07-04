import { api } from './axios'

export type ReportType = 'completed' | 'pending' | 'employee-wise'
export type ReportFormat = 'csv' | 'excel'

const getFilename = (
  disposition: string | undefined,
  type: ReportType,
  format: ReportFormat,
) => {
  const match = disposition?.match(/filename="?(?<filename>[^"]+)"?/)
  return (
    match?.groups?.filename ??
    `${type}-report.${format === 'excel' ? 'xlsx' : 'csv'}`
  )
}

export const reportApi = {
  downloadReport: async (
    type: ReportType,
    format: ReportFormat,
  ): Promise<{ blob: Blob; filename: string }> => {
    const response = await api.get<Blob>('/reports', {
      params: { type, format },
      responseType: 'blob',
    })

    return {
      blob: response.data,
      filename: getFilename(
        response.headers['content-disposition'],
        type,
        format,
      ),
    }
  },
}
