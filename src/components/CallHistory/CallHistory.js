import React from 'react';
import {useTable} from 'react-table';
import './call-history.css';

function CallHistory({ calls }) {
    const data = React.useMemo(() => calls, [calls]);

    const columns = React.useMemo(
        () => [
            {
                Header: 'Call ID',
                accessor: 'id',
            },
            {
                Header: 'Start Date',
                accessor: 'startDate',
                Cell: ({ value }) => new Date(value).toLocaleString(),
            },
            {
                Header: 'End Date',
                accessor: 'endDate',
                Cell: ({ value }) => new Date(value).toLocaleString(),
            },
            {
                Header: 'Room ID',
                accessor: 'roomId',
            },
            {
                Header: 'Language',
                accessor: 'language',
            }
        ],
        []
    );

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({ columns, data });

    return (
        <table {...getTableProps()} className="call-history">
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map(row => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => (
                                <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            ))}
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}

export default CallHistory;
