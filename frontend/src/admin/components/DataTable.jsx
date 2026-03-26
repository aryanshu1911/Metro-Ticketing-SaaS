import React from 'react';

const DataTable = ({ columns, data, onSearch, searchPlaceholder = "Search..." }) => {
    return (
        <div className="admin-table-container">
            {onSearch && (
                <div style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <input 
                        type="text" 
                        placeholder={searchPlaceholder} 
                        onChange={(e) => onSearch(e.target.value)}
                        style={searchInputStyle}
                    />
                </div>
            )}
            <table className="admin-table">
                <thead>
                    <tr>
                        {columns.map((col, i) => <th key={i}>{col.header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, i) => (
                            <tr key={i}>
                                {columns.map((col, j) => (
                                    <td key={j}>{col.cell(row)}</td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const searchInputStyle = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    width: '300px'
};

export default DataTable;
