import { useEffect, useState } from 'react';
import Style from './Tablepage.module.css'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { BASE_URL } from '../config';
import HistoryContextMenu from './HistoryContextMenu';

const formatDate = (dateString) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid date
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    } catch (error) {
        return dateString;
    }
};
const defaultDraggableColumns = [
    { key: 'order_date', label: 'order date', isFilter: false },
    { key: 'reference_id', label: 'Reference Id', isFilter: false },
    { key: 'order_id', label: 'Order Id', isFilter: false },
    { key: 'is_new_order', label: 'New Order', isFilter: true },
    { key: 'ref_no', label: 'client ref id', isFilter: false },
    { key: 'manuscript_id', label: 'manuscript id', isFilter: false },
    { key: 'client_country', label: 'Country', isFilter: true },
    { key: 'client_handler', label: 'Handler Mail', isFilter: true },
    { key: 'client_handler_name', label: 'Handler Name', isFilter: true },
    { key: 'client_handler_phone_number', label: 'Handler Phone', isFilter: true },
    { key: 'profile_name', label: 'profile name', isFilter: false },
    { key: 'client_Email', label: 'client Email', isFilter: false },
    { key: 'client_whatsapp_number', label: 'whatsapp no', isFilter: false },
    { key: 'order_type', label: 'order type', isFilter: true },
    { key: 'we_chat', label: 'WeChat', isFilter: true },
    { key: 'title', label: 'Title', isFilter: false },
    { key: 'journal_name', label: 'Journal name', isFilter: false },
    { key: 'index', label: 'index', isFilter: true },
    { key: 'rank', label: 'rank', isFilter: true },
    { key: 'writing_amount', label: 'writing amount', isFilter: false },
    { key: 'modification_amount', label: 'modification amount', isFilter: false },
    { key: 'po_amount', label: 'po amount', isFilter: false },
    { key: 'implementation_amount', label: 'Implementation amount', isFilter: false },
    { key: 'currency', label: 'currency', isFilter: false },
    { key: 'total_amount', label: 'total amount', isFilter: false },
    { key: 'writing_start_date', label: 'writing start date', isFilter: false },
    { key: 'writing_end_date', label: 'writing end date', isFilter: false },
    { key: 'modification_start_date', label: 'modification start date', isFilter: false },
    { key: 'modification_end_date', label: 'modification end date', isFilter: false },
    { key: 'implementation_start_date', label: 'implementation start date', isFilter: false },
    { key: 'implementation_end_date', label: 'implementation end date', isFilter: false },
    { key: 'po_start_date', label: 'po start date', isFilter: false },
    { key: 'po_end_date', label: 'po end date', isFilter: false },
    { key: 'phase_1_payment', label: 'phase 1 payment', isFilter: false },
    { key: 'phase_1_payment_date', label: 'phase 1 payment date', isFilter: false },
    { key: 'phase_1_payment_details', label: 'phase 1 payment reason', isFilter: false },
    { key: 'phase_2_payment', label: 'phase 2 payment', isFilter: false },
    { key: 'phase_2_payment_date', label: 'phase 2 payment date', isFilter: false },
    { key: 'phase_2_payment_details', label: 'phase 2 payment reason', isFilter: false },
    { key: 'phase_3_payment', label: 'phase 3 payment', isFilter: false },
    { key: 'phase_3_payment_date', label: 'phase 3 payment date', isFilter: false },
    { key: 'phase_3_payment_details', label: 'phase 3 payment reason', isFilter: false },
    { key: 'paid_amount', label: 'Total Paid Amount', isFilter: false },
    { key: 'paid_amount_usd', label: 'Paid Amount In USD', isFilter: false },
    { key: 'payment_status', label: 'payment status', isFilter: true },
    { key: 'bank_account', label: 'Client account', isFilter: false },
    { key: 'receive_bank_account', label: 'received account', isFilter: false },
    { key: 'client_affiliations', label: 'client affiliations', isFilter: false },
    { key: 'remarks', label: 'remarks', isFilter: false },
    { key: 'client_drive_link', label: 'client drive link', isFilter: false },
    // { key: 'clients_details', label: 'Client Details', isFilter: false },
    { key: 'payment_drive_link', label: 'payment drive link', isFilter: false },
    { key: 'order_status', label: 'Record Status', isFilter: true }
];
// console.log(dropdownOptions.bank_account_options)
const ListEditor = ({ initialValue, onSave, onCancel }) => {
    const [items, setItems] = useState(() => {
        if (!initialValue) return [''];
        // Remove existing numeric prefixes (e.g., "1. ", "2) ") so they aren't duplicated in the editor
        return String(initialValue)
            .split('\n')
            .map(item => item.replace(/^\d+[\.\)]\s*/, ''));
    });

    const handleItemChange = (index, value) => {
        const newItems = [...items];
        newItems[index] = value;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, '']);
    };

    const removeItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        if (newItems.length === 0) newItems.push('');
        setItems(newItems);
    };

    const handleSave = () => {
        // Filter out completely empty items before saving for neatness
        const filteredItems = items.filter(item => item.trim() !== '');
        // Automatically add numeric prefixes (1., 2., etc.)
        const formattedItems = filteredItems.map((item, index) => `${index + 1}. ${item}`);
        const value = formattedItems.join('\n');
        onSave(value);
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Save on Enter as requested
            handleSave();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div style={{ padding: '8px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', minWidth: '300px', zIndex: 10 }}>
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => handleItemChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            style={{ flex: 1, padding: '6px', border: '1px solid #ddd', borderRadius: '4px' }}
                            autoFocus={index === items.length - 1}
                            placeholder="Enter item..."
                        />
                        <button onClick={() => removeItem(index)} style={{ padding: '6px 10px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                    </div>
                ))}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button
                    onClick={addItem}
                    style={{
                        padding: '6px 10px',
                        background: '#1890ff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    + Add Item
                </button>
                <div style={{ flex: 1 }}></div>
                <button onClick={handleSave} style={{ padding: '6px 12px', background: '#52c41a', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
                <button onClick={onCancel} style={{ padding: '6px 12px', background: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            </div>
        </div>
    );
};

export function Tablepage({ searchTerm }) {
    const [contextMenu, setContextMenu] = useState(null);

    const handleRightClick = (e, row, fieldName) => {
        e.preventDefault();
        setContextMenu({
            collection: 'orders',
            documentId: row.order_db_id,
            fieldName: fieldName,
            position: { x: e.clientX, y: e.clientY }
        });
    };

    const [tableData, setTableData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [editingCell, setEditingCell] = useState(null); // { rowIndex, fieldName }
    const [editValue, setEditValue] = useState('');
    const [phaseModal, setPhaseModal] = useState(null); // { phase, rowIndex, data: { payment, date, details } }
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });
    const [dropdownOptions, setDropdownOptions] = useState({ we_chats: [], employee_names: [], order_type_options: [], bank_account_options: [], payment_method_options: [] });
    const [settingsOptions, setSettingsOptions] = useState({
        order_type: [],
        index: [],
        rank: [],
        bank_account: []
    });
    const [filters, setFilters] = useState({
        payment_status: '',
        order_status: '',
        rank: '',
        index: '',
        client_country: '',
        client_handler_name: '',
        is_new_order: '',
        order_type: '',
        we_chat: ''
    });
    const [activeFilterField, setActiveFilterField] = useState(null); // Which filter dropdown is open
    const itemsPerPage = 15;

    const [columns, setColumns] = useState(() => {
        const saved = localStorage.getItem('tableColumnOrder');
        if (saved) {
            try {
                const savedKeys = JSON.parse(saved);
                const savedCols = savedKeys.map(key => defaultDraggableColumns.find(c => c.key === key)).filter(Boolean);
                const missingCols = defaultDraggableColumns.filter(c => !savedKeys.includes(c.key));
                return [...savedCols, ...missingCols];
            } catch (e) {
                return defaultDraggableColumns;
            }
        }
        return defaultDraggableColumns;
    });
    const [draggedColIndex, setDraggedColIndex] = useState(null);

    const handleDragStart = (e, index) => {
        setDraggedColIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.classList.add(Style.dragging), 0);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (draggedColIndex === null || draggedColIndex === index) return;

        const newColumns = [...columns];
        const draggedItem = newColumns[draggedColIndex];
        newColumns.splice(draggedColIndex, 1);
        newColumns.splice(index, 0, draggedItem);

        setDraggedColIndex(index);
        setColumns(newColumns);
        localStorage.setItem('tableColumnOrder', JSON.stringify(newColumns.map(c => c.key)));
    };

    const handleDragEnd = (e) => {
        setDraggedColIndex(null);
        e.target.classList.remove(Style.dragging);
    };

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const fetchTableData = () => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${BASE_URL}/dashboard/orders`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.status_code === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_role');
                        window.location.reload();
                        return;
                    }
                    if (data?.status_code === 200) {
                        setTableData(data.data || []);
                        if (data.detail) {
                            setDropdownOptions({
                                we_chats: data.detail.we_chats || [],
                                employee_names: data.detail.employee_names || [],
                                order_type_options: data.detail.order_type_options || [],
                                bank_account_options: data.detail.bank_account_options || [],
                                payment_method_options: data.detail.payment_method_options || []
                            });
                        }
                    }
                    // console.log(data.detail.bank_account_options[0].account_number);
                })
                .catch(error => console.error(error));
        }
    }

    const fetchSettings = () => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${BASE_URL}/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(result => {
                    if (result.status === 'success' && result.data) {
                        setSettingsOptions({
                            order_type: result.data.order_type || [],
                            index: result.data.index || [],
                            rank: result.data.rank || [],
                            bank_account: result.data.bank_account || []
                        });
                    }
                })
                .catch(err => console.error("Error loading settings:", err));
        }
    };

    useEffect(() => {
        fetchTableData();
        fetchSettings();
    }, []);

    // Handle clicking outside of filter dropdowns to close them
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeFilterField && !event.target.closest(`.${Style.filterTh}`)) {
                setActiveFilterField(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeFilterField]);

    const handleDoubleClick = (rowIndex, fieldName, currentValue) => {
        const phaseMatch = fieldName.match(/^phase_(\d)_payment(?:_date|_details)?$/);
        if (phaseMatch) {
            const phase = parseInt(phaseMatch[1]);
            const userRole = localStorage.getItem('user_role') || '';
            if (userRole === 'employee') {
                const currentPayment = tableData[rowIndex][`phase_${phase}_payment`];
                const hasValue = currentPayment !== undefined && currentPayment !== null && currentPayment !== '' && parseFloat(currentPayment) > 0;
                if (hasValue) {
                    showNotification(`${phase} cannot be updated again.`, "error");
                    return;
                }
            }
            setPhaseModal({
                phase,
                rowIndex,
                data: {
                    payment: tableData[rowIndex][`phase_${phase}_payment`] || '',
                    date: tableData[rowIndex][`phase_${phase}_payment_date`] || '',
                    details: tableData[rowIndex][`phase_${phase}_payment_details`] || '',
                    receive_bank_account: tableData[rowIndex][`phase_${phase}_receive_bank_account`] || '',
                    payment_method: tableData[rowIndex][`phase_${phase}_payment_method`] || ''
                }
            });
            return;
        }

        const dropdownFields = ['payment_status', 'index', 'rank', 'order_type', 'currency', 'order_status', 'is_new_order'];
        let initialValue = currentValue || '';

        if (fieldName === 'is_new_order' && typeof initialValue === 'string') {
            initialValue = initialValue.toUpperCase();
        }

        setEditingCell({ rowIndex, fieldName });
        setEditValue(initialValue === 'N/A' ? '' : initialValue);
    };

    const handlePhaseModalChange = (field, value) => {
        setPhaseModal(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [field]: value
            }
        }));
    };

    const submitPhaseModal = async (e) => {
        e.preventDefault();
        if (!phaseModal) return;
        const { rowIndex, phase, data } = phaseModal;

        const paymentField = `phase_${phase}_payment`;
        const dateField = `phase_${phase}_payment_date`;
        const detailsField = `phase_${phase}_payment_details`;
        const bankAccountField = `phase_${phase}_receive_bank_account`;

        let finalPayment = data.payment;
        if (finalPayment === '' || finalPayment === null) {
            finalPayment = 0;
        } else {
            finalPayment = parseFloat(finalPayment);
        }

        const paymentMethodField = `phase_${phase}_payment_method`;

        const payload = {
            [paymentField]: finalPayment,
            [dateField]: data.date || null,
            [detailsField]: data.details || ''
        };
        payload[bankAccountField] = data.receive_bank_account || '';
        payload.receive_bank_account = data.receive_bank_account || '';
        payload[paymentMethodField] = data.payment_method || '';

        const updatedTableData = [...tableData];
        updatedTableData[rowIndex][paymentField] = finalPayment;
        updatedTableData[rowIndex][dateField] = data.date;
        updatedTableData[rowIndex][detailsField] = data.details;
        updatedTableData[rowIndex][bankAccountField] = data.receive_bank_account;
        updatedTableData[rowIndex].receive_bank_account = data.receive_bank_account;
        updatedTableData[rowIndex][paymentMethodField] = data.payment_method;

        const row = updatedTableData[rowIndex];
        const phase1 = parseFloat(row.phase_1_payment) || 0;
        const phase2 = parseFloat(row.phase_2_payment) || 0;
        const phase3 = parseFloat(row.phase_3_payment) || 0;
        const newPaid = phase1 + phase2 + phase3;

        // Auto-set payment_status based on amount
        const totalAmt = parseFloat(row.total_amount) || 0;
        if (newPaid >= totalAmt && totalAmt > 0) {
            updatedTableData[rowIndex].payment_status = 'Paid';
            payload.payment_status = 'Paid';
        }

        updatedTableData[rowIndex].paid_amount = newPaid;
        payload.paid_amount = newPaid;

        setTableData(updatedTableData);
        setPhaseModal(null);

        const token = localStorage.getItem('token');
        const rowToUpdate = updatedTableData[rowIndex];

        try {
            const response = await fetch(`${BASE_URL}/dashboard/orders/${rowToUpdate.order_db_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            console.log("payload sent", payload);
            const result = await response.json();
            console.log("payload response", result);
            if (response.ok) {
                showNotification(`Phase ${phase} payment updated successfully`, "success");
            } else {
                showNotification("Failed to update phase payment", "error");
                fetchTableData();
            }
        } catch (error) {
            console.error('Error updating backend:', error);
            showNotification("Error connecting to server", "error");
            fetchTableData();
        }
    };

    const handleBlur = () => {
        saveChanges();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveChanges();
        } else if (e.key === 'Escape') {
            setEditingCell(null);
        }
    };

    const saveChanges = async (overrideValue) => {
        if (!editingCell) return;

        const { rowIndex, fieldName } = editingCell;
        const originalValue = tableData[rowIndex][fieldName];

        // Treat empty string as 0 for amount fields to avoid API errors
        const amountFields = ['writing_amount', 'modification_amount', 'po_amount', 'implementation_amount'];
        const phasePaymentFields = ['phase_1_payment', 'phase_2_payment', 'phase_3_payment'];

        let finalEditValue = overrideValue !== undefined ? overrideValue : editValue;

        if (
            (amountFields.includes(fieldName) || phasePaymentFields.includes(fieldName)) &&
            (editValue === '' || editValue === null)
        ) {
            finalEditValue = 0;
        }

        // Normalize country: uppercase + remove all spaces
        const upperCaseFields = ['client_country'];
        if (upperCaseFields.includes(fieldName) && typeof finalEditValue === 'string') {
            finalEditValue = finalEditValue.replace(/\s+/g, '').toUpperCase();
        }


        if (finalEditValue === originalValue) {
            setEditingCell(null);
            return;
        }

        const datePairs = [
            { start: 'writing_start_date', end: 'writing_end_date' },
            { start: 'modification_start_date', end: 'modification_end_date' },
            { start: 'implementation_start_date', end: 'implementation_end_date' },
            { start: 'po_start_date', end: 'po_end_date' }
        ];

        for (const pair of datePairs) {
            if (fieldName === pair.start || fieldName === pair.end) {
                const startDateStr = fieldName === pair.start ? finalEditValue : tableData[rowIndex][pair.start];
                const endDateStr = fieldName === pair.end ? finalEditValue : tableData[rowIndex][pair.end];

                if (startDateStr && endDateStr) {
                    const startDate = new Date(startDateStr);
                    const endDate = new Date(endDateStr);
                    if (!isNaN(startDate) && !isNaN(endDate)) {
                        startDate.setHours(0, 0, 0, 0);
                        endDate.setHours(0, 0, 0, 0);

                        if (startDate >= endDate) {
                            const formatName = (str) => str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                            showNotification(`${formatName(pair.start)} cannot be greater than or equal to ${formatName(pair.end)}`, "error");
                            setEditingCell(null);
                            return;
                        }
                    }
                }
            }
        }

        // Optimistic update
        const updatedTableData = [...tableData];
        updatedTableData[rowIndex][fieldName] = finalEditValue;

        // Recalculate total_amount if any sub-amount was changed
        let payload = { [fieldName]: finalEditValue };

        if (amountFields.includes(fieldName)) {
            const row = updatedTableData[rowIndex];
            const writing = parseFloat(row.writing_amount) || 0;
            const modification = parseFloat(row.modification_amount) || 0;
            const po = parseFloat(row.po_amount) || 0;
            const implementation = parseFloat(row.implementation_amount) || 0;
            const newTotal = writing + modification + po + implementation;

            updatedTableData[rowIndex].total_amount = newTotal;
            payload.total_amount = newTotal;
        }

        // Recalculate paid_amount and update payment_status
        const row = updatedTableData[rowIndex];
        const phase1 = parseFloat(row.phase_1_payment) || 0;
        const phase2 = parseFloat(row.phase_2_payment) || 0;
        const phase3 = parseFloat(row.phase_3_payment) || 0;
        const newPaid = phase1 + phase2 + phase3;

        updatedTableData[rowIndex].paid_amount = newPaid;
        payload.paid_amount = newPaid;

        const totalAmt = parseFloat(row.total_amount) || 0;
        if (newPaid >= totalAmt && totalAmt > 0) {
            updatedTableData[rowIndex].payment_status = 'Paid';
            payload.payment_status = 'Paid';
        }

        setTableData(updatedTableData);
        setEditingCell(null);

        // API Call to update backend
        const token = localStorage.getItem('token');
        const rowToUpdate = updatedTableData[rowIndex];

        try {
            const response = await fetch(`${BASE_URL}/dashboard/orders/${rowToUpdate.order_db_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            console.log(rowToUpdate.order_db_id);
            console.log(payload);
            const result = await response.json();
            if (response.ok) {
                console.log('Update successful:', result);
                showNotification("Dashboard order updated successfully", "success");
            } else {
                console.error('Update failed:', result);
                showNotification("Failed to update dashboard order", "error");
                // Revert changes
                fetchTableData();
            }
        } catch (error) {
            console.error('Error updating backend:', error);
            showNotification("Error connecting to server", "error");
            fetchTableData();
        }
    };

    // Filter data based on search term and individual column filters
    const filteredData = tableData.filter(row => {
        // Global search term
        const matchesSearch = !searchTerm || Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Individual column filters
        const matchesFilters = Object.entries(filters).every(([key, value]) => {
            if (!value) return true;
            return String(row[key] || '').trim().toLowerCase() === value.toLowerCase();
        });

        return matchesSearch && matchesFilters;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Reset pagination when search term or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters]);

    // Fields that should never be editable inline
    const userRole = localStorage.getItem('user_role');
    const readOnlyArray = ['total_amount', 'paid_amount', 'client_id', 'client_Email', 'client_country', 'client_whatsapp_number', 'ref_no', 'receive_bank_account', 'paid_amount_usd'];
    if (userRole !== 'admin' && userRole !== 'manager') {
        readOnlyArray.push('client_handler_name');
    }
    const READ_ONLY_FIELDS = new Set(readOnlyArray);

    const FilterHeader = ({ label, field, dragProps }) => {
        const uniqueValues = [...new Set(tableData.map(item => String(item[field] || '').trim().toUpperCase()))]
            .filter(val => val !== '')
            .sort();

        const isOpen = activeFilterField === field;

        return (
            <th className={Style.filterTh} {...dragProps}>
                <div className={Style.filterHeaderContent}>
                    <span>{label}</span>
                    <button
                        className={`${Style.filterIcon} ${filters[field] ? Style.activeFilter : ''}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveFilterField(isOpen ? null : field);
                        }}
                    >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
                        </svg>
                    </button>
                </div>
                {isOpen && (
                    <div className={Style.filterDropdown}>
                        <div
                            className={`${Style.filterOption} ${filters[field] === '' ? Style.selectedOption : ''}`}
                            onClick={() => {
                                setFilters(prev => ({ ...prev, [field]: '' }));
                                setActiveFilterField(null);
                            }}
                        >
                            All
                        </div>
                        {uniqueValues.map(val => (
                            <div
                                key={val}
                                className={`${Style.filterOption} ${filters[field] === val ? Style.selectedOption : ''}`}
                                onClick={() => {
                                    setFilters(prev => ({ ...prev, [field]: val }));
                                    setActiveFilterField(null);
                                }}
                            >
                                {val}
                            </div>
                        ))}
                    </div>
                )}
            </th>
        );
    };

    const renderCell = (row, rowIndex, fieldName, displayValue) => {
        // Helper: safely convert a value to a renderable string (handles objects)
        const safeDisplay = (val) => {
            if (val === null || val === undefined) return 'N/A';
            if (typeof val === 'object') return val.account_number || JSON.stringify(val);
            return val;
        };

        // Read-only: just show the value, no double-click editing
        if (READ_ONLY_FIELDS.has(fieldName)) {
            return (
                <td key={fieldName} style={{ cursor: 'default', userSelect: 'text' }} title="Read-only field" data-field={fieldName}
                    onContextMenu={(e) => handleRightClick(e, row, fieldName)}
                >
                    {safeDisplay(displayValue ?? row[fieldName])}
                </td>
            );
        }

        const isEditing = editingCell && editingCell.rowIndex === rowIndex && editingCell.fieldName === fieldName;
        const dateFields = [
            'order_date', 'writing_start_date', 'writing_end_date', 'modification_start_date',
            'modification_end_date', 'po_start_date', 'po_end_date', 'phase_1_payment_date',
            'phase_2_payment_date', 'phase_3_payment_date', 'implementation_start_date', 'implementation_end_date'
        ];

        const dropdownFields = {
            payment_status: ['Paid', 'Pending', 'Partial'],
            index: settingsOptions.index || [],
            rank: settingsOptions.rank || [],
            order_type: settingsOptions.order_type || [],
            currency: ['USD', 'INR', 'CNY', 'AED', 'SAR'],
            order_status: ['Active', 'Inactive'],
            is_new_order: ['YES', 'NO'],
            we_chat: dropdownOptions.we_chats || [],
            client_handler_name: dropdownOptions.employee_names || [],

        };

        const textareaFields = ['journal_name', 'client_affiliations', 'remarks'];
        const plainTextareaFields = ['title'];
        const linkFields = ['client_drive_link', 'payment_drive_link'];

        // --- Status Badge renderer ---
        const getOrderStatusBadge = (value) => {
            const v = (value || '').toLowerCase();
            const style = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                ...(v === 'active'
                    ? { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                    : v === 'inactive'
                        ? { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
                        : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' })
            };



            const dot = {
                width: '7px', height: '7px', borderRadius: '50%',
                background: v === 'active' ? '#16a34a' : v === 'inactive' ? '#dc2626' : '#94a3b8'
            };
            return <span style={style}><span style={dot}></span>{value || 'N/A'}</span>;
        };


        const getNewOrderBadge = (value) => {
            const v = (value || '').toLowerCase();
            const style = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                ...(v === 'yes'
                    ? { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                    : v === 'no'
                        ? { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
                        : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' })
            };



            const dot = {
                width: '7px', height: '7px', borderRadius: '50%',
                background: v === 'yes' ? '#16a34a' : v === 'no' ? '#dc2626' : '#94a3b8'
            };
            return <span style={style}><span style={dot}></span>{value || 'N/A'}</span>;
        }
        const getPaymentStatusBadge = (value) => {
            const v = (value || '').toLowerCase();
            const style = {
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                ...(v === 'paid'
                    ? { background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
                    : v === 'pending'
                        ? { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
                        : v === 'partial'
                            ? { background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }
                            : { background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0' })
            };
            const dot = {
                width: '7px', height: '7px', borderRadius: '50%',
                background: v === 'paid' ? '#16a34a' : v === 'pending' ? '#dc2626' : v === 'partial' ? '#ea580c' : '#94a3b8'
            };
            return <span style={style}><span style={dot}></span>{value || 'N/A'}</span>;
        };

        return (
            <td key={fieldName} 
                onDoubleClick={() => handleDoubleClick(rowIndex, fieldName, row[fieldName])} 
                onContextMenu={(e) => handleRightClick(e, row, fieldName)}
                data-field={fieldName}
            >
                {isEditing ? (
                    dateFields.includes(fieldName) ? (
                        <DatePicker
                            selected={editValue && !isNaN(new Date(editValue).getTime()) ? new Date(editValue) : null}
                            onChange={(date) => {
                                if (date) {
                                    setEditValue(date.toISOString());
                                }
                            }}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={Style.editInput}
                        />
                    ) : dropdownFields[fieldName] ? (
                        <select
                            value={editValue}
                            onChange={(e) => {
                                const val = e.target.value;
                                setEditValue(val);
                                saveChanges(val);
                            }}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={Style.editInput}
                        >
                            <option value="">Select option</option>
                            {dropdownFields[fieldName].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                    ) : textareaFields.includes(fieldName) ? (
                        <ListEditor
                            initialValue={editValue}
                            onSave={(newValue) => {
                                setEditValue(newValue);
                                saveChanges(newValue);
                            }}
                            onCancel={() => setEditingCell(null)}
                        />
                    ) : plainTextareaFields.includes(fieldName) ? (
                        <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    saveChanges();
                                } else if (e.key === 'Escape') {
                                    setEditingCell(null);
                                }
                            }}
                            autoFocus
                            className={Style.editInput}
                            style={{
                                width: '100%',
                                resize: 'none',
                                minHeight: '80px',
                                maxHeight: '160px',
                                overflowY: 'auto'
                            }}
                        />
                    ) : (
                        <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className={Style.editInput}
                        />
                    )
                ) : fieldName === 'order_status' ? (
                    getOrderStatusBadge(row[fieldName])
                ) : fieldName === 'is_new_order' ? (
                    getNewOrderBadge(row[fieldName])
                ) : fieldName === 'payment_status' ? (
                    getPaymentStatusBadge(row[fieldName])
                ) : textareaFields.includes(fieldName) ? (
                    <div className={Style.scrollableCellContent}>
                        {displayValue || row[fieldName] || 'N/A'}
                    </div>
                ) : plainTextareaFields.includes(fieldName) ? (
                    <div style={{ padding: '3px', whiteSpace: 'pre-wrap', lineHeight: '1.6', maxHeight: '110px', overflowY: 'auto' }}>
                        {row[fieldName]
                            ? row[fieldName].split('\n').map((line, i) => (
                                <div key={i}>{line || '\u00A0'}</div>
                            ))
                            : 'N/A'}
                    </div>
                ) : linkFields.includes(fieldName) ? (
                    row[fieldName] ? (
                        <a href={row[fieldName]} target="_blank" rel="noopener noreferrer" className={Style.viewLink}>view</a>
                    ) : ''
                ) : (
                    displayValue || row[fieldName] || 'N/A'
                )}
            </td>
        );
    };

    const handleExport = () => {
        if (!filteredData || filteredData.length === 0) {
            showNotification("No data to export", "error");
            return;
        }

        const data = filteredData.map((row, index) => ({
            "S.No": index + 1,
            "Client ID": String(row.client_id || ''),
            "Order Date": formatDate(row.order_date),
            "Reference ID": String(row.reference_id || ''),
            "Order ID": String(row.order_id || ''),
            "New Order": row.is_new_order || '',
            "Client Ref ID": String(row.ref_no || ''),
            "Manuscript ID": String(row.manuscript_id || ''),
            "Country": row.client_country || '',
            "Handler Mail": row.client_handler || '',
            "Handler Name": row.client_handler_name || '',
            "Handler Phone": String(row.client_handler_phone_number || ''),
            "Profile Name": row.profile_name || '',
            "Client Email": row.client_Email || '',
            "Whatsapp No": String(row.client_whatsapp_number || ''),
            "Order Type": row.order_type || '',
            "Title": row.title || '',
            "Journal Name": row.journal_name || '',
            "Index": row.index || '',
            "Rank": row.rank || '',
            "Writing Amount": row.writing_amount,
            "Modification Amount": row.modification_amount,
            "PO Amount": row.po_amount,
            "Implementation Amount": row.implementation_amount,
            "Currency": row.currency || '',
            "Total Amount": row.total_amount,
            "Writing Start Date": formatDate(row.writing_start_date),
            "Writing End Date": formatDate(row.writing_end_date),
            "Modification Start Date": formatDate(row.modification_start_date),
            "Modification End Date": formatDate(row.modification_end_date),
            "Implementation Start Date": formatDate(row.implementation_start_date),
            "Implementation End Date": formatDate(row.implementation_end_date),
            "PO Start Date": formatDate(row.po_start_date),
            "PO End Date": formatDate(row.po_end_date),
            "Phase 1 Payment": row.phase_1_payment,
            "Phase 1 Payment Date": formatDate(row.phase_1_payment_date),
            "Phase 1 Payment Reason": row.phase_1_payment_details || '',
            "Phase 2 Payment": row.phase_2_payment,
            "Phase 2 Payment Date": formatDate(row.phase_2_payment_date),
            "Phase 2 Payment Reason": row.phase_2_payment_details || '',
            "Phase 3 Payment": row.phase_3_payment,
            "Phase 3 Payment Date": formatDate(row.phase_3_payment_date),
            "Phase 3 Payment Reason": row.phase_3_payment_details || '',
            "Total Paid Amount": row.paid_amount,
            "Paid Amount In USD": row.paid_amount_usd,
            "Payment Status": row.payment_status || '',
            "Client Account": String(row.bank_account || ''),
            "Received Account": String(row.receive_bank_account || ''),
            "Client Affiliations": row.client_affiliations || '',
            "Remarks": row.remarks || '',
            "Client Drive": row.client_drive_link || '',
            "Client Details": row.clients_details || '',
            "Record Status": row.order_status || '',
            "WeChat": row.we_chat || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Define column widths for better structure in Excel
        const wscols = [
            { wch: 8 },  // S.No
            { wch: 15 }, // Client ID
            { wch: 12 }, // Order Date
            { wch: 15 }, // Reference ID
            { wch: 15 }, // Order ID
            { wch: 12 }, // New Order
            { wch: 15 }, // Client Ref ID
            { wch: 15 }, // Manuscript ID
            { wch: 15 }, // Country
            { wch: 28 }, // Handler Mail
            { wch: 20 }, // Handler Name
            { wch: 18 }, // Handler Phone
            { wch: 20 }, // Profile Name
            { wch: 28 }, // Client Email
            { wch: 18 }, // Whatsapp
            { wch: 15 }, // Order Type
            { wch: 50 }, // Title (wider)
            { wch: 40 }, // Journal Name (wider)
            { wch: 12 }, // Index
            { wch: 10 }, // Rank
            { wch: 14 }, // Writing Amount
            { wch: 18 }, // Mod Amount
            { wch: 12 }, // PO Amount
            { wch: 20 }, // Implementation Amount
            { wch: 10 }, // Currency
            { wch: 12 }, // Total Amount
            { wch: 15 }, // Writing Start
            { wch: 15 }, // Writing End
            { wch: 15 }, // Mod Start
            { wch: 15 }, // Mod End
            { wch: 20 }, // Implementation Start
            { wch: 20 }, // Implementation End
            { wch: 15 }, // PO Start
            { wch: 15 }, // PO End
            { wch: 15 }, // Phase 1
            { wch: 18 }, // Phase 1 Date
            { wch: 25 }, // Phase 1 Reason
            { wch: 15 }, // Phase 2
            { wch: 18 }, // Phase 2 Date
            { wch: 25 }, // Phase 2 Reason
            { wch: 15 }, // Phase 3
            { wch: 18 }, // Phase 3 Date
            { wch: 25 }, // Phase 3 Reason
            { wch: 16 }, // Total Paid
            { wch: 16 }, // Paid Amount In USD
            { wch: 15 }, // Payment Status
            { wch: 20 }, // Client Account
            { wch: 20 }, // Received Account
            { wch: 40 }, // Client Affiliations
            { wch: 40 }, // Remarks
            { wch: 30 }, // Client Drive
            { wch: 20 }, // Client Details
            { wch: 15 }, // Record Status
            { wch: 15 }  // WeChat
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Overall_Table");

        XLSX.writeFile(workbook, 'TableData.xlsx');
        showNotification("Export successful", "success");
    };

    return (
        <div className={Style.page}>
            {notification.visible && (
                <div className={`${Style.notification} ${Style[notification.type]}`}>
                    <div className={Style.notificationIcon}>
                        {notification.type === 'success' ? '✓' : '✕'}
                    </div>
                    <p>{notification.message}</p>
                </div>
            )}
            <div className={Style.tablecontainer}>
                {/* table header */}
                <div className={Style.tableheader}>
                    <h2>Overall Table</h2>
                    <p>displaying <span>{currentData.length}</span> of {filteredData.length} records</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {Object.values(filters).some(f => f !== '') && (
                            <button className={Style.clearFilterBtn} onClick={() => setFilters({
                                payment_status: '',
                                order_status: '',
                                rank: '',
                                index: '',
                                client_country: '',
                                client_handler_name: '',
                                is_new_order: '',
                                order_type: ''
                            })}>Clear Filters</button>
                        )}
                        <button className={Style.exportBtn} onClick={handleExport}>Export</button>
                    </div>
                </div>
                {/* table data */}
                <div className={Style.tablecontainerdata}>

                    <table className={Style.tabledata}>
                        <thead>
                            <tr>
                                <th>S.no</th>
                                <th data-field="client_id">client Id</th>
                                {columns.map((col, index) => {
                                    const dragProps = {
                                        draggable: true,
                                        onDragStart: (e) => handleDragStart(e, index),
                                        onDragOver: (e) => handleDragOver(e, index),
                                        onDragEnd: handleDragEnd,
                                        style: { cursor: 'grab' },
                                        'data-field': col.key
                                    };

                                    if (col.isFilter) {
                                        return <FilterHeader key={col.key} label={col.label} field={col.key} dragProps={dragProps} />;
                                    }

                                    return (
                                        <th key={col.key} {...dragProps}>
                                            {col.label}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((row, index) => {
                                // Find actual index in tableData for editing
                                const actualIndex = tableData.findIndex(item => item === row);
                                return (
                                    <tr key={startIndex + index}>
                                        <td>{startIndex + index + 1}</td>
                                        {renderCell(row, actualIndex, 'client_id')}

                                        {columns.map((col) => {
                                            if (col.key === 'paid_amount') {
                                                return (
                                                    <td key={col.key} data-field="paid_amount">
                                                        Paid Amount : {row.paid_amount}<br />
                                                        Pending Amount : {row.total_amount - row.paid_amount}
                                                    </td>
                                                );
                                            }

                                            const isDate = col.key.includes('date');
                                            const displayValue = isDate ? formatDate(row[col.key]) : undefined;
                                            return renderCell(row, actualIndex, col.key, displayValue);
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>

                    </table>
                </div>

                <div className={Style.tablefooter}>
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                    <h3>Page {currentPage} of {totalPages}</h3>
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
                </div>
            </div>

            {phaseModal && (
                <div className={Style.modalOverlay}>
                    <div className={Style.modalCard}>
                        <div className={Style.modalHeader}>
                            <h3>Update Phase {phaseModal.phase} Payment</h3>
                            <button className={Style.closeBtn} onClick={() => setPhaseModal(null)}>×</button>
                        </div>
                        <form className={Style.modalForm} onSubmit={submitPhaseModal}>
                            <div className={Style.modalInputGroup}>
                                <label>Payment Amount</label>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    value={phaseModal.data.payment}
                                    onChange={(e) => handlePhaseModalChange('payment', e.target.value)}
                                    placeholder={`Enter Phase ${phaseModal.phase} Amount`}
                                    required
                                />
                            </div>
                            <div className={Style.modalInputGroup}>
                                <label>Payment Date</label>
                                <DatePicker
                                    selected={phaseModal.data.date && !isNaN(new Date(phaseModal.data.date).getTime()) ? new Date(phaseModal.data.date) : null}
                                    onChange={(date) => {
                                        handlePhaseModalChange('date', date ? date.toISOString() : '');
                                    }}
                                    className={Style.editInput}
                                    wrapperClassName={Style.datePickerWrapper}
                                    required
                                />
                            </div>
                            <div className={Style.modalInputGroup}>
                                <label>Payment Reason</label>
                                <textarea
                                    value={phaseModal.data.details}
                                    onChange={(e) => handlePhaseModalChange('details', e.target.value)}
                                    placeholder="Enter payment reason / details..."
                                    required
                                />
                            </div>
                            <div className={Style.modalInputGroup}>
                                <label>Receiver Bank Account</label>
                                <select
                                    value={phaseModal.data.receive_bank_account}
                                    onChange={(e) => handlePhaseModalChange('receive_bank_account', e.target.value)}
                                    className={Style.editInput}
                                    required
                                >
                                    <option value="">Select Receiver Bank Account</option>
                                    {dropdownOptions.bank_account_options.map((acc, i) => {
                                        const displayStr = typeof acc === 'object' ? `${acc.bank_name || 'Bank'} - ${acc.account_number || 'N/A'}` : acc;
                                        return <option key={i} value={displayStr}>{displayStr}</option>;
                                    })}
                                </select>
                            </div>
                            <div className={Style.modalInputGroup}>
                                <label>Payment Method</label>
                                <select
                                    value={phaseModal.data.payment_method}
                                    onChange={(e) => handlePhaseModalChange('payment_method', e.target.value)}
                                    className={Style.editInput}
                                    required
                                >
                                    <option value="">Select Payment Method</option>
                                    {dropdownOptions.payment_method_options.map((method, i) => {
                                        const methodStr = typeof method === 'object' && method !== null ? JSON.stringify(method) : method;
                                        return <option key={i} value={methodStr}>{methodStr}</option>;
                                    })}
                                </select>
                            </div>
                            
                            <div className={Style.modalFooter}>
                                <button type="button" className={Style.cancelBtn} onClick={() => setPhaseModal(null)}>Cancel</button>
                                <button type="submit" className={Style.submitBtn}>Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {contextMenu && (
                <HistoryContextMenu
                    collection={contextMenu.collection}
                    documentId={contextMenu.documentId}
                    fieldName={contextMenu.fieldName}
                    position={contextMenu.position}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
}
