import { useEffect, useState } from 'react';
import Style from './Tablepage.module.css'
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from 'xlsx';
import { BASE_URL } from '../config';
import HistoryContextMenu from './HistoryContextMenu';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

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
    { key: 'phase_1_receipt', label: 'phase 1 receipt', isFilter: false },
    { key: 'phase_2_payment', label: 'phase 2 payment', isFilter: false },
    { key: 'phase_2_payment_date', label: 'phase 2 payment date', isFilter: false },
    { key: 'phase_2_payment_details', label: 'phase 2 payment reason', isFilter: false },
    { key: 'phase_2_receipt', label: 'phase 2 receipt', isFilter: false },
    { key: 'phase_3_payment', label: 'phase 3 payment', isFilter: false },
    { key: 'phase_3_payment_date', label: 'phase 3 payment date', isFilter: false },
    { key: 'phase_3_payment_details', label: 'phase 3 payment reason', isFilter: false },
    { key: 'phase_3_receipt', label: 'phase 3 receipt', isFilter: false },
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
        bank_account: [],
        payment_method: []
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

    // --- Bulk select & row actions ---
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'single'|'bulk', rowId, rowIndex }
    const [editRowModal, setEditRowModal] = useState(null); // { rowIndex, rowData }
    const [editRowData, setEditRowData] = useState({});

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
                            bank_account: result.data.bank_account || [],
                            payment_method: result.data.payment_method || []
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
        const phaseMatch = fieldName.match(/^phase_(\d)_(payment(?:_date|_details)?|receipt)$/);
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
                    payment_method: tableData[rowIndex][`phase_${phase}_payment_method`] || '',
                    receiptFile: null
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

        const isFormData = !!data.receiptFile;
        const fetchOptions = {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        };

        if (isFormData) {
            const formData = new FormData();
            for (const key in payload) {
                if (payload[key] !== null && payload[key] !== undefined) {
                    formData.append(key, payload[key]);
                }
            }
            formData.append(`phase_${phase}_receipt`, data.receiptFile);
            fetchOptions.body = formData;
        } else {
            fetchOptions.headers["Content-Type"] = "application/json";
            fetchOptions.body = JSON.stringify(payload);
        }

        try {
            const response = await fetch(`${BASE_URL}/dashboard/orders/${rowToUpdate.order_db_id}`, fetchOptions);
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

    // --- Row selection helpers ---
    const toggleSelectRow = (rowId) => {
        setSelectedRows(prev => {
            const next = new Set(prev);
            if (next.has(rowId)) next.delete(rowId);
            else next.add(rowId);
            return next;
        });
    };

    const isAllCurrentSelected = currentData.length > 0 && currentData.every(row => selectedRows.has(row.order_db_id));

    const toggleSelectAll = () => {
        if (isAllCurrentSelected) {
            setSelectedRows(prev => {
                const next = new Set(prev);
                currentData.forEach(row => next.delete(row.order_db_id));
                return next;
            });
        } else {
            setSelectedRows(prev => {
                const next = new Set(prev);
                currentData.forEach(row => next.add(row.order_db_id));
                return next;
            });
        }
    };

    // --- Delete single row ---
    const handleDeleteRow = async (row) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/dashboard/orders/${row.order_db_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setTableData(prev => prev.filter(r => r.order_db_id !== row.order_db_id));
                setSelectedRows(prev => { const n = new Set(prev); n.delete(row.order_db_id); return n; });
                showNotification('Row deleted successfully', 'success');
            } else {
                showNotification('Failed to delete row', 'error');
            }
        } catch (e) {
            showNotification('Error connecting to server', 'error');
        }
        setDeleteConfirm(null);
    };

    // --- Bulk delete ---
    const handleBulkDelete = async () => {
        const token = localStorage.getItem('token');
        const ids = [...selectedRows];
        let successCount = 0;
        for (const id of ids) {
            try {
                const res = await fetch(`${BASE_URL}/dashboard/orders/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) successCount++;
            } catch (e) {}
        }
        setTableData(prev => prev.filter(r => !selectedRows.has(r.order_db_id)));
        setSelectedRows(new Set());
        showNotification(`${successCount} row(s) deleted successfully`, 'success');
        setDeleteConfirm(null);
    };

    // --- Edit row modal ---
    const handleEditRowOpen = (row, actualIndex) => {
        setEditRowModal({ rowIndex: actualIndex, rowId: row.order_db_id });
        setEditRowData({ ...row });
    };

    const handleEditRowChange = (field, value) => {
        setEditRowData(prev => ({ ...prev, [field]: value }));
    };

    const submitEditRow = async (e) => {
        e.preventDefault();
        if (!editRowModal) return;
        const token = localStorage.getItem('token');
        const { rowIndex, rowId } = editRowModal;
        try {
            const response = await fetch(`${BASE_URL}/dashboard/orders/${rowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editRowData)
            });
            if (response.ok) {
                const updatedTableData = [...tableData];
                updatedTableData[rowIndex] = { ...updatedTableData[rowIndex], ...editRowData };
                setTableData(updatedTableData);
                showNotification('Row updated successfully', 'success');
            } else {
                showNotification('Failed to update row', 'error');
            }
        } catch (e) {
            showNotification('Error connecting to server', 'error');
        }
        setEditRowModal(null);
        setEditRowData({});
    };

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

        // Read-only: just show the value, no double-click editing and no edit history
        if (READ_ONLY_FIELDS.has(fieldName)) {
            return (
                <td key={fieldName} style={{ cursor: 'default', userSelect: 'text' }} title="Read-only field" data-field={fieldName}>
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
        const linkFields = ['client_drive_link', 'payment_drive_link', 'phase_1_receipt', 'phase_2_receipt', 'phase_3_receipt'];

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

        // Map each column key → { header label, value getter, preferred Excel width }
        const colConfig = {
            order_date:                   { label: 'Order Date',               get: r => formatDate(r.order_date),                    wch: 14 },
            reference_id:                 { label: 'Reference ID',             get: r => String(r.reference_id || ''),                 wch: 16 },
            order_id:                     { label: 'Order ID',                 get: r => String(r.order_id || ''),                     wch: 16 },
            is_new_order:                 { label: 'New Order',                get: r => r.is_new_order || '',                         wch: 12 },
            ref_no:                       { label: 'Client Ref ID',            get: r => String(r.ref_no || ''),                       wch: 15 },
            manuscript_id:                { label: 'Manuscript ID',            get: r => String(r.manuscript_id || ''),                wch: 15 },
            client_country:               { label: 'Country',                  get: r => r.client_country || '',                       wch: 14 },
            client_handler:               { label: 'Handler Mail',             get: r => r.client_handler || '',                       wch: 28 },
            client_handler_name:          { label: 'Handler Name',             get: r => r.client_handler_name || '',                  wch: 20 },
            client_handler_phone_number:  { label: 'Handler Phone',            get: r => String(r.client_handler_phone_number || ''), wch: 18 },
            profile_name:                 { label: 'Profile Name',             get: r => r.profile_name || '',                         wch: 20 },
            client_Email:                 { label: 'Client Email',             get: r => r.client_Email || '',                         wch: 28 },
            client_whatsapp_number:       { label: 'Whatsapp No',              get: r => String(r.client_whatsapp_number || ''),      wch: 18 },
            order_type:                   { label: 'Order Type',               get: r => r.order_type || '',                           wch: 15 },
            we_chat:                      { label: 'WeChat',                   get: r => r.we_chat || '',                              wch: 15 },
            title:                        { label: 'Title',                    get: r => r.title || '',                                wch: 50 },
            journal_name:                 { label: 'Journal Name',             get: r => r.journal_name || '',                         wch: 40 },
            index:                        { label: 'Index',                    get: r => r.index || '',                                wch: 14 },
            rank:                         { label: 'Rank',                     get: r => r.rank || '',                                 wch: 12 },
            writing_amount:               { label: 'Writing Amount',           get: r => r.writing_amount,                             wch: 15 },
            modification_amount:          { label: 'Modification Amount',      get: r => r.modification_amount,                        wch: 18 },
            po_amount:                    { label: 'PO Amount',                get: r => r.po_amount,                                  wch: 13 },
            implementation_amount:        { label: 'Implementation Amount',    get: r => r.implementation_amount,                      wch: 20 },
            currency:                     { label: 'Currency',                 get: r => r.currency || '',                             wch: 10 },
            total_amount:                 { label: 'Total Amount',             get: r => r.total_amount,                               wch: 14 },
            writing_start_date:           { label: 'Writing Start Date',       get: r => formatDate(r.writing_start_date),             wch: 16 },
            writing_end_date:             { label: 'Writing End Date',         get: r => formatDate(r.writing_end_date),               wch: 16 },
            modification_start_date:      { label: 'Modification Start Date',  get: r => formatDate(r.modification_start_date),        wch: 20 },
            modification_end_date:        { label: 'Modification End Date',    get: r => formatDate(r.modification_end_date),          wch: 20 },
            implementation_start_date:    { label: 'Impl. Start Date',         get: r => formatDate(r.implementation_start_date),      wch: 18 },
            implementation_end_date:      { label: 'Impl. End Date',           get: r => formatDate(r.implementation_end_date),        wch: 18 },
            po_start_date:                { label: 'PO Start Date',            get: r => formatDate(r.po_start_date),                  wch: 15 },
            po_end_date:                  { label: 'PO End Date',              get: r => formatDate(r.po_end_date),                    wch: 15 },
            phase_1_payment:              { label: 'Phase 1 Payment',          get: r => r.phase_1_payment,                            wch: 15 },
            phase_1_payment_date:         { label: 'Phase 1 Date',             get: r => formatDate(r.phase_1_payment_date),           wch: 16 },
            phase_1_payment_details:      { label: 'Phase 1 Reason',           get: r => r.phase_1_payment_details || '',              wch: 25 },
            phase_1_receipt:              { label: 'Phase 1 Receipt',          get: r => r.phase_1_receipt || '',                      wch: 30 },
            phase_2_payment:              { label: 'Phase 2 Payment',          get: r => r.phase_2_payment,                            wch: 15 },
            phase_2_payment_date:         { label: 'Phase 2 Date',             get: r => formatDate(r.phase_2_payment_date),           wch: 16 },
            phase_2_payment_details:      { label: 'Phase 2 Reason',           get: r => r.phase_2_payment_details || '',              wch: 25 },
            phase_2_receipt:              { label: 'Phase 2 Receipt',          get: r => r.phase_2_receipt || '',                      wch: 30 },
            phase_3_payment:              { label: 'Phase 3 Payment',          get: r => r.phase_3_payment,                            wch: 15 },
            phase_3_payment_date:         { label: 'Phase 3 Date',             get: r => formatDate(r.phase_3_payment_date),           wch: 16 },
            phase_3_payment_details:      { label: 'Phase 3 Reason',           get: r => r.phase_3_payment_details || '',              wch: 25 },
            phase_3_receipt:              { label: 'Phase 3 Receipt',          get: r => r.phase_3_receipt || '',                      wch: 30 },
            paid_amount:                  { label: 'Total Paid Amount',        get: r => r.paid_amount,                                wch: 16 },
            paid_amount_usd:              { label: 'Paid Amount (USD)',         get: r => r.paid_amount_usd,                            wch: 16 },
            payment_status:               { label: 'Payment Status',           get: r => r.payment_status || '',                       wch: 15 },
            bank_account:                 { label: 'Client Account',           get: r => String(r.bank_account || ''),                 wch: 22 },
            receive_bank_account:         { label: 'Received Account',         get: r => String(r.receive_bank_account || ''),         wch: 22 },
            client_affiliations:          { label: 'Client Affiliations',      get: r => r.client_affiliations || '',                  wch: 40 },
            remarks:                      { label: 'Remarks',                  get: r => r.remarks || '',                              wch: 40 },
            client_drive_link:            { label: 'Client Drive',             get: r => r.client_drive_link || '',                    wch: 30 },
            payment_drive_link:           { label: 'Payment Drive',            get: r => r.payment_drive_link || '',                   wch: 30 },
            order_status:                 { label: 'Record Status',            get: r => r.order_status || '',                         wch: 15 },
        };

        // Build rows dynamically following the current column drag order
        const data = filteredData.map((row, index) => {
            const obj = {};
            obj['S.No'] = index + 1;
            obj['Client ID'] = String(row.client_id || '');
            // Iterate columns in current drag order
            columns.forEach(col => {
                const cfg = colConfig[col.key];
                if (cfg) obj[cfg.label] = cfg.get(row);
            });
            return obj;
        });

        const worksheet = XLSX.utils.json_to_sheet(data);

        // Set column widths to match the dynamic order
        const wscols = [
            { wch: 8 },  // S.No
            { wch: 15 }, // Client ID
            ...columns.map(col => ({ wch: colConfig[col.key]?.wch || 15 }))
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
                    <h2>Overall Order & Client Summary</h2>
                    <p>displaying <span>{currentData.length}</span> of {filteredData.length} records</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {selectedRows.size > 0 && (
                            <button
                                className={Style.bulkDeleteBtn}
                                onClick={() => setDeleteConfirm({ type: 'bulk' })}
                            >
                                🗑 Delete Selected ({selectedRows.size})
                            </button>
                        )}
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
                                <th className={Style.checkboxTh}>
                                    <input
                                        type="checkbox"
                                        className={Style.rowCheckbox}
                                        checked={isAllCurrentSelected}
                                        onChange={toggleSelectAll}
                                        title="Select all on this page"
                                    />
                                </th>
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
                                <th className={Style.actionTh}>Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentData.map((row, index) => {
                                // Find actual index in tableData for editing
                                const actualIndex = tableData.findIndex(item => item === row);
                                const isSelected = selectedRows.has(row.order_db_id);
                                return (
                                    <tr key={startIndex + index} className={isSelected ? Style.selectedRow : ''}>
                                        <td className={Style.checkboxTd}>
                                            <input
                                                type="checkbox"
                                                className={Style.rowCheckbox}
                                                checked={isSelected}
                                                onChange={() => toggleSelectRow(row.order_db_id)}
                                            />
                                        </td>
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

                                        {/* Action Column */}
                                        <td className={Style.actionTd}>
                                            <div className={Style.actionBtns}>
                                                <button
                                                    className={Style.editRowBtn}
                                                    title="Edit Row"
                                                    onClick={() => handleEditRowOpen(row, actualIndex)}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className={Style.deleteRowBtn}
                                                    title="Delete Row"
                                                    onClick={() => setDeleteConfirm({ type: 'single', row })}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
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
                                    {settingsOptions.payment_method.map((method, i) => {
                                        const methodStr = typeof method === 'object' && method !== null ? JSON.stringify(method) : method;
                                        return <option key={i} value={methodStr}>{methodStr}</option>;
                                    })}
                                </select>
                            </div>
                            
                            <div className={Style.modalInputGroup}>
                                <label>Receipt Screenshot</label>
                                <label 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        padding: '12px 16px',
                                        border: '1.5px dashed',
                                        borderColor: phaseModal.data.receiptFile ? '#86efac' : '#cbd5e1',
                                        borderRadius: '8px',
                                        backgroundColor: phaseModal.data.receiptFile ? '#f0fdf4' : '#f8fafc',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        color: phaseModal.data.receiptFile ? '#16a34a' : '#64748b',
                                        fontWeight: 500,
                                        fontSize: '0.9rem',
                                        width: '100%',
                                        boxSizing: 'border-box'
                                    }}
                                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                                    onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = phaseModal.data.receiptFile ? '#86efac' : '#cbd5e1'; e.currentTarget.style.backgroundColor = phaseModal.data.receiptFile ? '#f0fdf4' : '#f8fafc'; }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.currentTarget.style.borderColor = '#86efac';
                                        e.currentTarget.style.backgroundColor = '#f0fdf4';
                                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                            handlePhaseModalChange('receiptFile', e.dataTransfer.files[0]);
                                        }
                                    }}
                                >
                                    {phaseModal.data.receiptFile ? <CheckCircle2 size={20} /> : <UploadCloud size={20} />}
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                                        {phaseModal.data.receiptFile ? phaseModal.data.receiptFile.name : 'Click or drag to upload receipt'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/jpg, image/png, application/pdf"
                                        onChange={(e) => handlePhaseModalChange('receiptFile', e.target.files[0])}
                                        style={{ display: 'none' }}
                                    />
                                </label>
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

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className={Style.modalOverlay}>
                    <div className={Style.modalCard} style={{ maxWidth: '420px' }}>
                        <div className={Style.modalHeader}>
                            <h3>Confirm Delete</h3>
                            <button className={Style.closeBtn} onClick={() => setDeleteConfirm(null)}>×</button>
                        </div>
                        <div style={{ padding: '20px 24px' }}>
                            <p style={{ color: '#374151', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                {deleteConfirm.type === 'bulk'
                                    ? `Are you sure you want to delete ${selectedRows.size} selected row(s)? This action cannot be undone.`
                                    : 'Are you sure you want to delete this row? This action cannot be undone.'}
                            </p>
                        </div>
                        <div className={Style.modalFooter}>
                            <button className={Style.cancelBtn} onClick={() => setDeleteConfirm(null)}>Cancel</button>
                            <button
                                className={Style.submitBtn}
                                style={{ background: '#dc2626' }}
                                onClick={() =>
                                    deleteConfirm.type === 'bulk'
                                        ? handleBulkDelete()
                                        : handleDeleteRow(deleteConfirm.row)
                                }
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Row Modal */}
            {editRowModal && (
                <div className={Style.modalOverlay}>
                    <div className={Style.modalCard} style={{ maxWidth: '680px', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div className={Style.modalHeader}>
                            <h3>Edit Row</h3>
                            <button className={Style.closeBtn} onClick={() => setEditRowModal(null)}>×</button>
                        </div>
                        <form className={Style.modalForm} onSubmit={submitEditRow}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '4px 0' }}>
                                {columns
                                    .filter(col => !['paid_amount', 'paid_amount_usd', 'total_amount', 'receive_bank_account'].includes(col.key))
                                    .map(col => (
                                        <div className={Style.modalInputGroup} key={col.key}>
                                            <label>{col.label}</label>
                                            {['payment_status', 'order_status', 'is_new_order', 'currency'].includes(col.key) ? (
                                                <select
                                                    value={editRowData[col.key] || ''}
                                                    onChange={e => handleEditRowChange(col.key, e.target.value)}
                                                    className={Style.editInput}
                                                >
                                                    <option value=''>Select</option>
                                                    {(col.key === 'payment_status' ? ['Paid', 'Pending', 'Partial']
                                                        : col.key === 'order_status' ? ['Active', 'Inactive']
                                                        : col.key === 'is_new_order' ? ['YES', 'NO']
                                                        : ['USD', 'INR', 'CNY', 'AED', 'SAR']
                                                    ).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                </select>
                                            ) : col.key.includes('date') ? (
                                                <input
                                                    type='date'
                                                    value={editRowData[col.key] ? editRowData[col.key].slice(0, 10) : ''}
                                                    onChange={e => handleEditRowChange(col.key, e.target.value)}
                                                    className={Style.editInput}
                                                />
                                            ) : ['remarks', 'client_affiliations', 'journal_name', 'title'].includes(col.key) ? (
                                                <textarea
                                                    value={editRowData[col.key] || ''}
                                                    onChange={e => handleEditRowChange(col.key, e.target.value)}
                                                    className={Style.editInput}
                                                    rows={2}
                                                    style={{ resize: 'vertical' }}
                                                />
                                            ) : (
                                                <input
                                                    type='text'
                                                    value={editRowData[col.key] !== undefined && editRowData[col.key] !== null ? editRowData[col.key] : ''}
                                                    onChange={e => handleEditRowChange(col.key, e.target.value)}
                                                    className={Style.editInput}
                                                />
                                            )}
                                        </div>
                                    ))
                                }
                            </div>
                            <div className={Style.modalFooter}>
                                <button type='button' className={Style.cancelBtn} onClick={() => setEditRowModal(null)}>Cancel</button>
                                <button type='submit' className={Style.submitBtn}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
