import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';

const columnHelper = createColumnHelper();

export function MosqueListServer() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageCount, setPageCount] = useState(0);
    
    // Stato per paginazione e ordinamento server-side
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState([]);
    const [filtering, setFiltering] = useState([]);

    const columns = useMemo(() => [
        columnHelper.accessor('ageGroup', {
            header: 'Age Group',
            minSize: 100,
        }),
        columnHelper.accessor('yearCE', {
            header: 'Year CE',
            minSize: 100,
        }),
        columnHelper.accessor('country', {
            header: 'Country',
            minSize: 100,
        }),
        columnHelper.accessor('city', {
            header: 'City',
            minSize: 100,
        }),
        columnHelper.accessor('mosqueName', {
            header: 'Name',
            minSize: 100,
            cell: ({ getValue, row }) => {
                const name = getValue();
                const link = row.original.moreInfo;
                return link && link !== "#" ? (
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        {name}
                    </a>
                ) : (
                    name
                );
            }
        })
    ], []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        
        try {
            const sortedParam = JSON.stringify(sorting.map(sort => ({
                id: sort.id,
                desc: sort.desc
            })));
            
            const filteredParam = JSON.stringify(filtering);
            
            const url = `api/v1/mosque/pagedlist?pagesize=${pagination.pageSize}&page=${pagination.pageIndex}&sorted=${sortedParam}&filtered=${filteredParam}`;
            
            const response = await fetch(url, {
                method: "GET",
                mode: "cors",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            setData(result.rows || []);
            setPageCount(result.pages || 0);
        } catch (error) {
            console.error('Error fetching data:', error);
            setData([]);
            setPageCount(0);
        } finally {
            setLoading(false);
        }
    }, [pagination.pageIndex, pagination.pageSize, sorting, filtering]);

    // Effetto per fetch data quando cambian i parametri
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const table = useReactTable({
        data,
        columns,
        pageCount,
        state: {
            pagination,
            sorting,
            globalFilter: filtering,
        },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onGlobalFilterChange: setFiltering,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true, // Server-side pagination
        manualSorting: true,    // Server-side sorting
        manualFiltering: true,  // Server-side filtering
    });

    return (
        <div>
            <div className="table-container">
                {/* Loading overlay */}
                {loading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner">Loading...</div>
                    </div>
                )}
                
                <table className="mosque-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id} 
                                        style={{ minWidth: header.column.columnDef.minSize }}
                                        className={header.column.getCanSort() ? 'sortable' : ''}
                                    >
                                        <div
                                            {...{
                                                className: header.column.getCanSort()
                                                    ? 'cursor-pointer select-none'
                                                    : '',
                                                onClick: header.column.getToggleSortingHandler(),
                                            }}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            {{
                                                asc: ' 🔼',
                                                desc: ' 🔽',
                                            }[header.column.getIsSorted()] ?? null}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Server-side pagination controls */}
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing page {table.getState().pagination.pageIndex + 1} of{' '}
                        {table.getPageCount()} ({data.length} rows)
                    </div>
                    
                    <div className="pagination-controls">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage() || loading}
                            className="pagination-btn"
                            title="First page"
                        >
                            {'<<'}
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage() || loading}
                            className="pagination-btn"
                            title="Previous page"
                        >
                            {'<'}
                        </button>
                        
                        <span className="pagination-info">
                            <strong>
                                {table.getState().pagination.pageIndex + 1} of{' '}
                                {table.getPageCount()}
                            </strong>
                        </span>
                        
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage() || loading}
                            className="pagination-btn"
                            title="Next page"
                        >
                            {'>'}
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage() || loading}
                            className="pagination-btn"
                            title="Last page"
                        >
                            {'>>'}
                        </button>
                    </div>
                    
                    <div className="page-size-selector">
                        <span>Show </span>
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => {
                                table.setPageSize(Number(e.target.value));
                            }}
                            className="page-size-select"
                            disabled={loading}
                        >
                            {[10, 20, 30, 40, 50].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                        <span> entries</span>
                    </div>
                </div>
            </div>
        </div>
    );
}