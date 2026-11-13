import { TableComponentProps } from '@/types/table_props.type';
import { DataGrid } from '@mui/x-data-grid';
import { Alert, Button, Snackbar } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { exportCsv } from '@/utils/exportCsv';

const TableComponent = ({
  columns,
  data,
  currentPage,
  setCurrentPage,
  totalItems,
  isLoading,
  pageSize,
  onPageChange,
  exportEntity,
  exportQuery,
}: TableComponentProps) => {
  const [exporting, setExporting] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({
    open: false,
    msg: '',
    severity: 'success',
  });

  const handleExport = async () => {
    if (!exportEntity) return;
    setExporting(true);
    try {
      await exportCsv(exportEntity, exportQuery);
      setSnack({ open: true, msg: 'CSV downloaded', severity: 'success' });
    } catch (e: any) {
      setSnack({ open: true, msg: e?.message || 'Export failed', severity: 'error' });
    } finally {
      setExporting(false);
    }
  };
  const [columnVisibility, setColumnVisibility] = useState(
    columns.reduce((acc, column) => {
      acc[column.field] = true;
      return acc;
    }, {} as { [key: string]: boolean })
  );

  const paginationModel = {
    page: currentPage - 1,
    pageSize: pageSize,
  };

  const handleColumnVisibilityChange = (newVisibility: { [key: string]: boolean }) => {
    const visibleColumns = Object.values(newVisibility).filter(Boolean).length;
    if (visibleColumns === 0) {
      newVisibility[columns[0].field] = true;
    }
    setColumnVisibility(newVisibility);
  };

  const handlePaginationChange = (newModel: any) => {
    const newPage = newModel.page + 1;
    setCurrentPage(newPage);
    onPageChange(newPage, newModel.pageSize);
  };

  return (
    <div style={{ width: '100%' }}>
      {exportEntity && (
        <div className="flex justify-end mb-2">
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadIcon />}
            disabled={exporting}
            onClick={handleExport}
          >
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>
      )}
      <DataGrid
        rows={data}
        columns={columns}
        pagination
        paginationMode="server"
        pageSizeOptions={[5, 10, 25]}
        loading={isLoading}
        paginationModel={paginationModel}
        rowCount={totalItems}
        // getRowHeight={() => "auto"}
        onPaginationModelChange={handlePaginationChange}
        getRowId={(row) => row.id || row.userId}
        columnVisibilityModel={columnVisibility}
        onColumnVisibilityModelChange={handleColumnVisibilityChange}
      />
      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </div>
  );
};

TableComponent.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  currentPage: PropTypes.number.isRequired,
  setCurrentPage: PropTypes.func.isRequired,
  totalItems: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  isLoading: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  exportEntity: PropTypes.string,
  exportQuery: PropTypes.object,
};

export default TableComponent;
