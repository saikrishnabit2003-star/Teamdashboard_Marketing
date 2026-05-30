import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Style from './History.module.css';
import { BASE_URL } from '../config';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

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

export function History({ searchTerm = '' }) {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clientFilter, setClientFilter] = useState('');
    const [appliedFilter, setAppliedFilter] = useState('');
    const [recordsInput, setRecordsInput] = useState('');
    const [numberOfRecords, setNumberOfRecords] = useState(20); 

    const [dateFilterMode, setDateFilterMode] = useState('all'); // 'all', 'lastWeek', 'lastMonth', 'custom'
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [selectedClient, setSelectedClient] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [clientLoading, setClientLoading] = useState(false);

    useEffect(() => {
        const fetchHistoryData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get(`${BASE_URL}/payments/history`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                console.log(response.data);
                if (response.data?.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }

                if (response.data?.data) {
                    setHistoryData(response.data.data);
                } else if (Array.isArray(response.data)) {
                    setHistoryData(response.data);
                }
            } catch (error) {
                console.error("Error fetching history data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistoryData();
    }, []);


    // Stage 1: apply global search term
    const searchFiltered = historyData.filter(row => {
        if (!searchTerm) return true;
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Stage 1.5: apply date filter
    const dateFiltered = searchFiltered.filter(row => {
        if (dateFilterMode === 'all') return true;
        
        const p1 = row.phase_1_payment_date ? new Date(row.phase_1_payment_date) : null;
        const p2 = row.phase_2_payment_date ? new Date(row.phase_2_payment_date) : null;
        const p3 = row.phase_3_payment_date ? new Date(row.phase_3_payment_date) : null;

        const isValid = (d) => d && !isNaN(d.getTime());
        const validDates = [p1, p2, p3].filter(isValid);

        // If none of the three phases have a valid date, do not show the record.
        if (validDates.length === 0) return false;

        const now = new Date();
        
        if (dateFilterMode === 'lastWeek') {
            const lastWeek = new Date();
            lastWeek.setDate(now.getDate() - 7);
            return validDates.some(d => d >= lastWeek && d <= now);
        }
        
        if (dateFilterMode === 'lastMonth') {
            const lastMonth = new Date();
            lastMonth.setDate(now.getDate() - 30); // Approximate last month as 30 days
            return validDates.some(d => d >= lastMonth && d <= now);
        }
        
        if (dateFilterMode === 'custom') {
            if (!startDate || !endDate) return true;
            const startOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            return validDates.some(d => d >= startOfDay && d <= endOfDay);
        }
        
        return true;
    });

    // Stage 2: apply client ID, ref ID, or order ID filter OR limit
    const displayData = appliedFilter
        ? dateFiltered.filter(row => {
            const filterStr = appliedFilter.toLowerCase();
            const clientId = String(row.client_id || '').toLowerCase();
            const refId = String(row.reference_id || row.ref_no || '').toLowerCase();
            const orderId = String(row.order_id || row.order_db_id || row.manuscript_id || '').toLowerCase();
            return clientId.includes(filterStr) || refId.includes(filterStr) || orderId.includes(filterStr);
        })
        : dateFiltered.slice(0, numberOfRecords);

    const handleApplyFilter = () => {
        setAppliedFilter(clientFilter.trim());
    };

    const handleClearFilter = () => {
        setClientFilter('');
        setAppliedFilter('');
    };

    const handleLoadRecords = () => {
        const num = parseInt(recordsInput);
        if (!num || num <= 0) {
            setNumberOfRecords(20);
        } else {
            setNumberOfRecords(num);
        }
        setAppliedFilter('');
    };

    const fetchClientDetails = async (clientId) => {
        if (!clientId || clientId === 'Unknown Client') return;
        setClientLoading(true);
        setIsPopupOpen(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${BASE_URL}/clients/${clientId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.data && response.data.status === 'success') {
                setSelectedClient(response.data.data);
            } else {
                setSelectedClient(null);
            }
        } catch (error) {
            console.error("Error fetching client details:", error);
            setSelectedClient(null);
        } finally {
            setClientLoading(false);
        }
    };

    const isDateInRange = (dateStr) => {
        if (dateFilterMode === 'all' || !dateStr) return false;
        
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return false;
        const now = new Date();

        if (dateFilterMode === 'lastWeek') {
            const lastWeek = new Date();
            lastWeek.setDate(now.getDate() - 7);
            return d >= lastWeek && d <= now;
        }
        
        if (dateFilterMode === 'lastMonth') {
            const lastMonth = new Date();
            lastMonth.setDate(now.getDate() - 30);
            return d >= lastMonth && d <= now;
        }
        
        if (dateFilterMode === 'custom') {
            if (!startDate || !endDate) return false;
            const startOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            return d >= startOfDay && d <= endOfDay;
        }
        
        return false;
    };

    return (
        <div className={Style.page}>
            <div className={Style.header}>
                <div>
                    <h2>Payment History</h2>
                    <p>
                        {appliedFilter
                            ? `Showing all ${displayData.length} records for "${appliedFilter}"`
                            : `Showing first ${displayData.length} of ${searchFiltered.length} records`
                        }
                    </p>
                </div>
                <div style={{display:"flex",gap:"10px",alignItems:"center"}}>
                    <input type="number" style={{width:"150px",height:"40px"}} className={Style.filterInput} placeholder="No. of records" value={recordsInput} onChange={(e) => setRecordsInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLoadRecords()} />
                    <button className={Style.filterBtn} onClick={handleLoadRecords} >Load</button>
                </div>
                <div className={Style.filterBar}>
                    <select 
                        className={Style.filterInput}
                        value={dateFilterMode}
                        onChange={(e) => setDateFilterMode(e.target.value)}
                        style={{ width: '150px' }}
                    >
                        <option value="all">All Dates</option>
                        <option value="lastWeek">Last 7 Days</option>
                        <option value="lastMonth">Last 30 Days</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {dateFilterMode === 'custom' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <DatePicker
                                selected={startDate}
                                onChange={(dates) => {
                                    const [start, end] = dates;
                                    setStartDate(start);
                                    setEndDate(end);
                                }}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                placeholderText="Select date range"
                                className={Style.filterInput}
                            />
                        </div>
                    )}
                    
                    <input
                        type="text"
                        className={Style.filterInput}
                        placeholder="Filter by ID..."
                        value={clientFilter}
                        onChange={(e) => setClientFilter(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyFilter()}
                    />
                    <button className={Style.filterBtn} onClick={handleApplyFilter}>
                        Search
                    </button>
                    {appliedFilter && (
                        <button className={Style.clearBtn} onClick={handleClearFilter}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading history...</div>
            ) : (
                <div className={Style.cardGrid}>
                    {displayData.length > 0 ? (
                        displayData.map((record, index) => (
                            <div key={index} className={Style.historyCard}>
                                <div className={Style.cardHeader}>
                                    <span 
                                        className={Style.clientBadge} 
                                        style={{ cursor: 'pointer' }}
                                        title="Double click to view client details"
                                        onDoubleClick={() => fetchClientDetails(record.client_id)}
                                    >
                                        {record.client_id || 'Unknown Client'}
                                    </span>
                                    <span className={Style.totalPaid}>
                                        Total: {record.paid_amount || 0}
                                    </span>
                                </div>
                                
                                <div className={Style.orderInfo}>
                                    <div>
                                        <span className={Style.infoLabel}>Ref ID</span>
                                        <span className={Style.infoValue}>{record.reference_id || record.ref_no || 'N/A'}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={Style.infoLabel}>Order ID</span>
                                        <span className={Style.infoValue}>{record.order_id || record.order_db_id || record.manuscript_id || 'N/A'}</span>
                                    </div>
                                </div>

                                <div className={Style.phasesContainer}>
                                    {/* Phase 1 */}
                                    <div className={Style.phaseBlock}>
                                        <div className={Style.phaseHeader}>
                                            <span className={Style.phaseTitle}>Phase 1</span>
                                            <span className={Style.phaseAmount}>{record.phase_1_payment || 0}</span>
                                        </div>
                                        <span 
                                            className={Style.phaseDate}
                                            style={isDateInRange(record.phase_1_payment_date) ? { backgroundColor: '#fef08a', padding: '2px 4px', borderRadius: '4px', color: '#000', fontWeight: '500' } : {}}
                                        >
                                            Date: {formatDate(record.phase_1_payment_date)}
                                        </span>
                                        <p className={Style.phaseReason}>
                                            {record.phase_1_payment_details || 'No details provided'}
                                        </p>
                                        <p className={Style.phaseReason} style={{ marginTop: '4px' }}>
                                            <strong>Account:</strong> {record.phase_1_receive_bank_account || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Phase 2 */}
                                    <div className={Style.phaseBlock}>
                                        <div className={Style.phaseHeader}>
                                            <span className={Style.phaseTitle}>Phase 2</span>
                                            <span className={Style.phaseAmount}>{record.phase_2_payment || 0}</span>
                                        </div>
                                        <span 
                                            className={Style.phaseDate}
                                            style={isDateInRange(record.phase_2_payment_date) ? { backgroundColor: '#fef08a', padding: '2px 4px', borderRadius: '4px', color: '#000', fontWeight: '500' } : {}}
                                        >
                                            Date: {formatDate(record.phase_2_payment_date)}
                                        </span>
                                        <p className={Style.phaseReason}>
                                            {record.phase_2_payment_details || 'No details provided'}
                                        </p>
                                        <p className={Style.phaseReason} style={{ marginTop: '4px' }}>
                                            <strong>Account:</strong> {record.phase_2_receive_bank_account || 'N/A'}
                                        </p>
                                    </div>

                                    {/* Phase 3 */}
                                    <div className={Style.phaseBlock}>
                                        <div className={Style.phaseHeader}>
                                            <span className={Style.phaseTitle}>Phase 3</span>
                                            <span className={Style.phaseAmount}>{record.phase_3_payment || 0}</span>
                                        </div>
                                        <span 
                                            className={Style.phaseDate}
                                            style={isDateInRange(record.phase_3_payment_date) ? { backgroundColor: '#fef08a', padding: '2px 4px', borderRadius: '4px', color: '#000', fontWeight: '500' } : {}}
                                        >
                                            Date: {formatDate(record.phase_3_payment_date)}
                                        </span>
                                        <p className={Style.phaseReason}>
                                            {record.phase_3_payment_details || 'No details provided'}
                                        </p>
                                        <p className={Style.phaseReason} style={{ marginTop: '4px' }}>
                                            <strong>Account:</strong> {record.phase_3_receive_bank_account || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={Style.noData}>
                                {appliedFilter
                                    ? `No records found for client "${appliedFilter}"`
                                    : 'No history records found'
                                }
                            </div>
                    )}
                </div>
            )}

            {isPopupOpen && (
                <div className={Style.popupOverlay} onClick={() => setIsPopupOpen(false)}>
                    <div className={Style.popupContent} onClick={(e) => e.stopPropagation()}>
                        <div className={Style.popupHeader}>
                            <h3>Client Details</h3>
                            <button className={Style.closeBtn} onClick={() => setIsPopupOpen(false)}>×</button>
                        </div>
                        <div className={Style.popupBody}>
                            {clientLoading ? (
                                <div style={{ textAlign: 'center', color: '#6b7280' }}>Loading client details...</div>
                            ) : selectedClient ? (
                                <>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>Client ID</span>
                                        <span className={Style.detailValue}>{selectedClient.client_id}</span>
                                    </div>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>Name</span>
                                        <span className={Style.detailValue}>{selectedClient.name}</span>
                                    </div>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>Email</span>
                                        <span className={Style.detailValue}>{selectedClient.email}</span>
                                    </div>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>Country</span>
                                        <span className={Style.detailValue}>{selectedClient.country}</span>
                                    </div>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>WhatsApp</span>
                                        <span className={Style.detailValue}>{selectedClient.whatsapp_no}</span>
                                    </div>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>Bank Account</span>
                                        <span className={Style.detailValue}>{selectedClient.bank_account || 'N/A'}</span>
                                    </div>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>Client Handler</span>
                                        <span className={Style.detailValue}>{selectedClient.client_handler_name}</span>
                                    </div>
                                    <div className={Style.detailRow}>
                                        <span className={Style.detailLabel}>Total Orders</span>
                                        <span className={Style.detailValue}>{selectedClient.total_orders}</span>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#ef4444' }}>Failed to load client details.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}