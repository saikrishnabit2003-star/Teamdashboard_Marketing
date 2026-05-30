import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Style from './AmountTable.module.css';
import { BASE_URL } from '../config';

const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (error) {
        return dateString;
    }
};

export function AmountTable({ searchTerm }) {
    const [tableData, setTableData] = useState([]);
    const [amountData, setAmountData] = useState(0);
    const [orderData, setOrderData] = useState(0);
    const [clientData, setClientData] = useState(0);
    useEffect(() => {
        const fetchTableData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const response = await axios.get(`${BASE_URL}/payments/pending-summary`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.data?.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }
                console.log(response.data.data);

                if (response.data.data.top_pending_clients) {
                    setTableData(response.data.data.top_pending_clients);
                    setAmountData(response.data.data.total_pending_amount);
                    setOrderData(response.data.data.pending_orders_count);
                    setClientData(response.data.data.pending_clients_count);
                } else if (Array.isArray(response.data.data.top_pending_clients)) {
                    setTableData(response.data.data.top_pending_clients);
                    setAmountData(response.data.data.total_pending_amount);
                    setOrderData(response.data.data.pending_orders_count);
                    setClientData(response.data.data.pending_clients_count);
                }
            } catch (error) {
                console.error("Error fetching amount table data:", error);
            }
        };

        fetchTableData();
    }, []);

    const filteredData = tableData.filter(row => {
        if (!searchTerm) return true;
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className={Style.page}>
            <div className={Style.tablecontainer}>
                <div className={Style.tableheader}>
                    <p>Pending Amount: $ <span>{amountData}</span></p>
                    <p>Pending Orders: <span>{orderData}</span></p>
                    <p>Pending Clients: <span>{clientData}</span></p>
                </div>
                <div className={Style.tablecontainerdata}>
                    <table className={Style.tabledata}>
                        <thead>
                            <tr>
                                <th>Client ID</th>
                                <th>Client Name</th>
                                <th>Total Orders</th>
                                <th>Pending Orders</th>
                                <th>Total Pending Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <tr key={index}>
                                        <td>{row.client_id || 'N/A'}</td>
                                        <td>{row.client_name || 'N/A'}</td>
                                        <td>{row.total_orders || 'N/A'}</td>
                                        <td>{row.pending_orders || 'N/A'}</td>
                                        <td>{Math.round(row.total_pending_amount * 100) / 100 || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}