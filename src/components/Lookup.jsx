import React, { useState, useEffect } from 'react';
import styles from './Lookup.module.css';
import { BASE_URL } from '../config';

// Initial structure to guarantee keys exist before fetch completes
const initialData = {
    order_type: [],
    index: [],
    rank: [],
    bank_account: []
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
        setNewValue("");
    };

    const handleEdit = (index, value) => {
        setEditingIndex(index);
        setEditValue(value);
    };

    const handleSave = async (index) => {
        const newOpt = editValue.trim();
        const oldOpt = data[activeTab][index];
        if (!newOpt) {
            showNotification("Value cannot be empty", "error");
            return;
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
        const newOpt = newValue.trim();
        if (!newOpt) {
            showNotification("Value cannot be empty", "error");
            return;
        }

        const currentList = data[activeTab] || [];
        if (currentList.some(item => item.toLowerCase() === newOpt.toLowerCase())) {
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
                setNewValue("");
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
                        <button 
                            className={styles.addBtn}
                            onClick={() => {
                                setShowAddForm(!showAddForm);
                                setNewValue("");
                            }}
                        >
                            {showAddForm ? 'Cancel' : '+ Add New Option'}
                        </button>
                    </div>

                    {showAddForm && (
                        <div className={styles.addForm}>
                            <input 
                                type="text"
                                className={styles.addInput}
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                placeholder="Enter new option value..."
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                autoFocus
                            />
                            <button className={styles.saveBtn} onClick={handleAdd}>Save</button>
                        </div>
                    )}

                    <div className={styles.tableContainer}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '80px' }}>S.No</th>
                                    <th>Option Value</th>
                                    <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data[activeTab].length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>No options found.</td>
                                    </tr>
                                ) : (
                                    data[activeTab].map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {editingIndex === index ? (
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
                                                ) : (
                                                    item
                                                )}
                                            </td>
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
