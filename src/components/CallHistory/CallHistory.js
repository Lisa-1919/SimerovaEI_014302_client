import React from 'react';
import {useTable} from 'react-table';
import './call-history.scss';
import { useTranslation } from "react-i18next";

function CallHistory({ calls }) {
    const data = React.useMemo(() => calls, [calls]);
    const { t } = useTranslation();

    const columns = React.useMemo(
        () => [
            {
                Header: t("start_date"),
                accessor: 'startDate',
                Cell: ({ value }) => new Date(value).toLocaleString(),
            },
            {
                Header: t("end_date"),
                accessor: 'endDate',
                Cell: ({ value }) => new Date(value).toLocaleString(),
            },
            {
                Header: t("room_id"),
                accessor: 'roomId',
            },
            {
                Header: t("language"),
                accessor: 'language',
            }
        ],
        [t]
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
            <tbody {...getTableBodyProps()} >
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
