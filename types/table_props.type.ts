export interface TableComponentProps {
  columns: any[]
  data: any[]
  currentPage: number
  setCurrentPage: (currentPage: number) => void
  totalItems: number
  isLoading: boolean
  pageSize: number
  onPageChange: (page: number, pageSize: number) => void
}
