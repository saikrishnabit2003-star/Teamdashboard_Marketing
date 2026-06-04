import React, { useState, useEffect } from 'react';
import styles from './Lookup.module.css';
import { BASE_URL } from '../config';

// Initial structure to guarantee keys exist before fetch completes
const initialData = {
    order_type: [],
    index: [],
    rank: [],
    bank_account: [],
    payment_method:[]
};

export function Lookup() {
    const [data, setData] = useState(initialData);
    const [activeTab, setActiveTab] = useState('order_type');
    const [editingIndex, setEditingIndex] = useState(null);
    const [editValue, setEditValue] = useState("");
    const [showAddForm, setShowAddForm] = useState(false);
    const [newValue, setNewValue] = useState("");
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('user_role');
    const canEdit = userRole === 'admin' || userRole === 'manager';

    const fetchSettings = async () => {
        try {
            const response = await fetch(`${BASE_URL}/settings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.status === 'success' && result.data) {
                const filteredData = {};
                Object.keys(initialData).forEach(key => {
                    filteredData[key] = result.data[key] || [];
                });
                setData(filteredData);
            }
        } catch (error) {
            console.error("Failed to fetch settings", error);
            showNotification("Failed to load settings", "error");
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setEditingIndex(null);
        setShowAddForm(false);
        setNewValue(tab === 'bank_account' ? { bank_name: '', account_number: '', ifsc_code: '', handler_name: '' } : "");
    };

    const handleEdit = (index, value) => {
        setEditingIndex(index);
        setEditValue(activeTab === 'bank_account' && typeof value === 'object' ? { ...value } : value);
    };

    const handleSave = async (index) => {
        const oldOpt = data[activeTab][index];
        let newOpt;

        if (activeTab === 'bank_account') {
            newOpt = { ...editValue };
            if (!newOpt.bank_name || !newOpt.account_number) {
                showNotification("Bank Name and Account Number are required", "error");
                return;
            }
        } else {
            newOpt = editValue.trim();
            if (!newOpt) {
                showNotification("Value cannot be empty", "error");
                return;
            }
        }
        
        try {
            const res = await fetch(`${BASE_URL}/settings/${activeTab}/update`, {
                method: "PUT",
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ old_option: oldOpt, new_option: newOpt })
            });
            const result = await res.json();
            if (res.ok) {
                showNotification("Option updated successfully", "success");
                setEditingIndex(null);
                fetchSettings();
            } else {
                showNotification(result.detail || "Failed to update option", "error");
            }
        } catch (error) {
            showNotification("Server error", "error");
        }
    };

    const handleDelete = async (index) => {
        if (window.confirm("Are you sure you want to delete this option?")) {
            const optionToDelete = data[activeTab][index];
            try {
                const res = await fetch(`${BASE_URL}/settings/${activeTab}/remove`, {
                    method: "DELETE",
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ option: optionToDelete })
                });
                const result = await res.json();
                if (res.ok) {
                    showNotification("Option deleted successfully", "success");
                    fetchSettings();
                } else {
                    showNotification(result.detail || "Failed to delete option", "error");
                }
            } catch (error) {
                showNotification("Server error", "error");
            }
        }
    };

    const handleAdd = async () => {
        let newOpt;

        if (activeTab === 'bank_account') {
            newOpt = { ...newValue };
            if (!newOpt.bank_name || !newOpt.account_number) {
                showNotification("Bank Name and Account Number are required", "error");
                return;
            }
        } else {
            newOpt = newValue.trim();
            if (!newOpt) {
                showNotification("Value cannot be empty", "error");
                return;
            }
        }

        const currentList = data[activeTab] || [];
        if (typeof newOpt === 'string' && currentList.some(item => typeof item === 'string' && item.toLowerCase() === newOpt.toLowerCase())) {
            showNotification("This option already exists", "error");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/settings/${activeTab}/add`, {
                method: "POST",
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ option: newOpt })
            });
            const result = await res.json();
            if (res.ok) {
                showNotification("Option added successfully", "success");
                setNewValue(activeTab === 'bank_account' ? { bank_name: '', account_number: '', ifsc_code: '', handler_name: '' } : "");
                setShowAddForm(false);
                fetchSettings();
            } else {
                showNotification(result.detail || "Failed to add option", "error");
            }
        } catch (error) {
            showNotification("Server error", "error");
        }
    };

    const formatLabel = (key) => {
        return key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    return (
        <div className={styles.page}>
            {notification.visible && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    <p>{notification.message}</p>
                </div>
            )}

            <div className={styles.header}>
                <h2>Lookup Configuration</h2>
            </div>

            <div className={styles.layout}>
                <div className={styles.sidebar}>
                    {Object.keys(data).map((key) => (
                        <button
                            key={key}
                            className={`${styles.tab} ${activeTab === key ? styles.activeTab : ''}`}
                            onClick={() => handleTabChange(key)}
                        >
                            {formatLabel(key)}
                        </button>
                    ))}
                </div>

                <div className={styles.content}>
                    <div className={styles.contentHeader}>
                        <h3>{formatLabel(activeTab)} Options</h3>
                        {canEdit && (
                            <button 
                                className={styles.addBtn}
                                onClick={() => {
                                    setShowAddForm(!showAddForm);
                                    setNewValue(activeTab === 'bank_account' ? { bank_name: '', account_number: '', ifsc_code: '', handler_name: '' } : "");
                                }}
                            >
                                {showAddForm ? 'Cancel' : '+ Add New Option'}
                            </button>
                        )}
                    </div>

                    {canEdit && showAddForm && (
                        <div className={styles.addForm}>
                            {activeTab === 'bank_account' ? (
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', width: '100%' }}>
                                    <input type="text" className={styles.addInput} style={{ flex: '1 1 200px' }} placeholder="Bank Name" value={newValue.bank_name || ''} onChange={(e) => setNewValue({...newValue, bank_name: e.target.value})} />
                                    <input type="text" className={styles.addInput} style={{ flex: '1 1 200px' }} placeholder="Account Number" value={newValue.account_number || ''} onChange={(e) => setNewValue({...newValue, account_number: e.target.value})} />
                                    <input type="text" className={styles.addInput} style={{ flex: '1 1 200px' }} placeholder="IFSC Code" value={newValue.ifsc_code || ''} onChange={(e) => setNewValue({...newValue, ifsc_code: e.target.value})} />
                                    <input type="text" className={styles.addInput} style={{ flex: '1 1 200px' }} placeholder="Handler Name" value={newValue.handler_name || ''} onChange={(e) => setNewValue({...newValue, handler_name: e.target.value})} />
                                </div>
                            ) : (
                                <input 
                                    type="text"
                                    className={styles.addInput}
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder="Enter new option value..."
                                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                    autoFocus
                                />
                            )}
                            <button className={styles.saveBtn} onClick={handleAdd}>Save</button>
                        </div>
                    )}

                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>S.No</th>
                                    <th>Option Value</th>
                                    {canEdit && <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {data[activeTab].length === 0 ? (
                                    <tr>
                                        <td colSpan={canEdit ? 3 : 2} style={{ textAlign: 'center', padding: '24px' }}>No options found.</td>
                                    </tr>
                                ) : (
                                    data[activeTab].map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {editingIndex === index ? (
                                                    activeTab === 'bank_account' ? (
                                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                                                            <input type="text" className={styles.editInput} style={{ flex: '1 1 120px' }} placeholder="Bank Name" value={editValue.bank_name || ''} onChange={(e) => setEditValue({...editValue, bank_name: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(index); if (e.key === 'Escape') setEditingIndex(null); }} />
                                                            <input type="text" className={styles.editInput} style={{ flex: '1 1 120px' }} placeholder="Account Number" value={editValue.account_number || ''} onChange={(e) => setEditValue({...editValue, account_number: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(index); if (e.key === 'Escape') setEditingIndex(null); }} />
                                                            <input type="text" className={styles.editInput} style={{ flex: '1 1 120px' }} placeholder="IFSC Code" value={editValue.ifsc_code || ''} onChange={(e) => setEditValue({...editValue, ifsc_code: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(index); if (e.key === 'Escape') setEditingIndex(null); }} />
                                                            <input type="text" className={styles.editInput} style={{ flex: '1 1 120px' }} placeholder="Handler Name" value={editValue.handler_name || ''} onChange={(e) => setEditValue({...editValue, handler_name: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(index); if (e.key === 'Escape') setEditingIndex(null); }} />
                                                        </div>
                                                    ) : (
                                                        <input 
                                                            type="text"
                                                            className={styles.editInput}
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') handleSave(index);
                                                                if (e.key === 'Escape') setEditingIndex(null);
                                                            }}
                                                            autoFocus
                                                        />
                                                    )
                                                ) : typeof item === 'object' && item !== null ? (
                                                    <div style={{ lineHeight: '1.7', fontSize: '13px' }}>
                                                        {item.bank_name && <div><b>Bank Name:</b> {item.bank_name}</div>}
                                                        {item.account_number && <div><b>Account No:</b> {item.account_number}</div>}
                                                        {item.ifsc_code && <div><b>IFSC Code:</b> {item.ifsc_code}</div>}
                                                        {item.handler_name && <div><b>Handler:</b> {item.handler_name}</div>}
                                                    </div>
                                                ) : (
                                                    item
                                                )}
                                            </td>
                                            {canEdit && (
                                                <td>
                                                    <div className={styles.actions}>
                                                        {editingIndex === index ? (
                                                            <>
                                                                <button className={styles.saveBtn} onClick={() => handleSave(index)}>Save</button>
                                                                <button className={styles.cancelBtn} onClick={() => setEditingIndex(null)}>Cancel</button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button className={styles.editBtn} onClick={() => handleEdit(index, item)}>Edit</button>
                                                                <button className={styles.deleteBtn} onClick={() => handleDelete(index)}>Delete</button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
