import React, { useState, useEffect, useMemo } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    flexRender,
    createColumnHelper
} from '@tanstack/react-table';
import "../../assets/css/Table.css";

const columnHelper = createColumnHelper();

export function MosqueList() {
    const [mosques, setMosques] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('api/v1/mosque/list', {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => response.json())
            .then(data => {
                setMosques(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching mosques:', error);
                setLoading(false);
            });
    }, []);

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

    const table = useReactTable({
        data: mosques,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    if (loading) {
        return (
            <div>
                <h1>Mosques</h1>
                <p><em>Loading...</em></p>
            </div>
        );
    }

    return (
        <div>
            <h1>Mosques</h1>
            <div className="table-container">
                <table className="mosque-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} style={{ minWidth: header.column.columnDef.minSize }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
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
                
                {/* Paginazione personalizzata */}
                <div className="pagination-container">
                    <div className="pagination-info">
                        Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                        {Math.min(
                            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                            table.getFilteredRowModel().rows.length
                        )}{' '}
                        of {table.getFilteredRowModel().rows.length} entries
                    </div>
                    
                    <div className="pagination-controls">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                            className="pagination-btn"
                        >
                            {'<<'}
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="pagination-btn"
                        >
                            {'<'}
                        </button>
                        
                        <span className="pagination-info">
                            Page{' '}
                            <strong>
                                {table.getState().pagination.pageIndex + 1} of{' '}
                                {table.getPageCount()}
                            </strong>
                        </span>
                        
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="pagination-btn"
                        >
                            {'>'}
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                            className="pagination-btn"
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