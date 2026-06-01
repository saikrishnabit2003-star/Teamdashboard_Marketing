import { useState, useEffect } from "react";
import styles from "./Accounts.module.css";
import { ClientForm } from "./ClientForm";
import { EmployeeForm } from "./EmployeeForm";
import { AdminForm } from "./AdminForm";
import { BASE_URL } from '../config';
import { CloudCog } from "lucide-react";
import imageCompression from 'browser-image-compression';
import HistoryContextMenu from './HistoryContextMenu';

export function Accounts({ searchTerm }) {
    const [contextMenu, setContextMenu] = useState(null);

    const handleRightClick = (e, client, fieldName) => {
        e.preventDefault();
        setContextMenu({
            collection: 'clients',
            documentId: client.client_id,
            fieldName: fieldName,
            position: { x: e.clientX, y: e.clientY }
        });
    };

    const [testphoto, setTestPhoto] = useState("");
    const [activeTab, setActiveTab] = useState("client");
    const [selectedImage, setSelectedImage] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupType, setPopupType] = useState("client");
    const [showRangePopup, setShowRangePopup] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [idRangeStart, setIdRangeStart] = useState("");
    const [idRangeEnd, setIdRangeEnd] = useState("");
    const [permissionLoading, setPermissionLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        order_date: "",
        client_id: "",
        reference_id: "",
        client_name: "",
        profile_name: "",
        location: "",
        email: "",
        whatsapp: "",
        client_handler: "",
        title: "",
        client_ref_no: "",
        client_details: "",
        order_type: "",
        index_option: "",
        cli_rank: "",
        journal: "",
        writing_start_date: "",
        publish_start_date: "",
        client_drive_link: "",
        currency: "",
        payment_status: "",
        bank_account: "",
        orders: "",
        name: "",
        password: "",
        branch: "",
        profile_name: "",
        personal_numbers: "",
        personal_email: "",
        start_range: "",
        end_range: "",
    });

    const [editingClientCell, setEditingClientCell] = useState(null);
    const [editClientValue, setEditClientValue] = useState('');
    const [sampleData, setSampleData] = useState([]);
    const [client_handlers, setclient_handlers] = useState([]);
    const [profile_names, setprofile_names] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const handleClientDoubleClick = (client, fieldName, currentValue) => {
        setEditingClientCell({ id: client._id || client.client_id, fieldName });
        setEditClientValue(currentValue || '');
    };

    const handleClientBlur = () => {
        saveClientChanges();
    };

    const handleClientKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveClientChanges();
        } else if (e.key === 'Escape') {
            setEditingClientCell(null);
        }
    };

    const saveClientChanges = async () => {
        if (!editingClientCell) return;
        const { id, fieldName } = editingClientCell;
        const clientIndex = sampleData.findIndex(c => (c._id || c.client_id) === id);
        if (clientIndex === -1) return;

        const clientToUpdate = sampleData[clientIndex];
        const order_db_id = clientToUpdate.order_id_db && clientToUpdate.order_id_db[0] ? clientToUpdate.order_id_db[0] : id;

        const originalValue = clientToUpdate[fieldName];
        if (editClientValue === originalValue) {
            setEditingClientCell(null);
            return;
        }

        const updatedData = [...sampleData];
        updatedData[clientIndex] = { ...updatedData[clientIndex], [fieldName]: editClientValue };
        setSampleData(updatedData);
        setEditingClientCell(null);

        const token = localStorage.getItem('token');

        // Map frontend fields to backend order fields so it matches Tablepage API expectations
        const payload = {};
        if (fieldName === 'client_id') {
            payload.client_id = editClientValue;
        }
        if (fieldName === 'name') {
            payload.client_name = editClientValue;
            payload.name = editClientValue;
        }
        if (fieldName === 'country') {
            payload.client_country = editClientValue;
            payload.country = editClientValue;
        }
        if (fieldName === 'email') {
            payload.client_Email = editClientValue;
            payload.client_email = editClientValue;
            payload.email = editClientValue;
        }
        if (fieldName === 'whatsapp_no') {
            payload.client_whatsapp_number = editClientValue;
            payload.client_whatsapp_no = editClientValue;
            payload.whatsapp_no = editClientValue;
        }
        if (fieldName === 'client_handler_name') {
            payload.client_handler_name = editClientValue;
            payload.client_handler = editClientValue;
        }
        if (fieldName === 'client_ref_no') {
            payload.ref_no = editClientValue;
            payload.client_ref_no = editClientValue;
        }
        if (fieldName === 'bank_account') {
            payload.bank_account = editClientValue;
            payload.client_bank_account = editClientValue;
        }

        try {
            const response = await fetch(`${BASE_URL}/dashboard/orders/${order_db_id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            console.log(payload);
            console.log(response);
            if (response.ok) {
                showNotification(`Client ${fieldName.replace(/_/g, ' ')} updated successfully`, "success");
            } else {
                showNotification("Failed to update client", "error");
                fetchClients();
            }
        } catch (error) {
            console.error('Error updating backend:', error);
            showNotification("Error connecting to server", "error");
            fetchClients();
        }
    };

    const renderClientCell = (client, fieldName, displayValue) => {
        const id = client._id || client.client_id;
        const isEditing = editingClientCell?.id === id && editingClientCell?.fieldName === fieldName;
        const value = displayValue !== undefined ? displayValue : client[fieldName];

        if (isEditing) {
            if (fieldName === 'client_handler_name') {
                return (
                    <td style={{ padding: '0' }}>
                        <select
                            autoFocus
                            value={editClientValue}
                            onChange={(e) => setEditClientValue(e.target.value)}
                            onBlur={handleClientBlur}
                            onKeyDown={handleClientKeyDown}
                            className={styles.editInput}
                        >
                            <option value="">Select Handler</option>
                            {client_handlers.map(handler => (
                                <option key={handler} value={handler}>{handler}</option>
                            ))}
                        </select>
                    </td>
                );
            }
            return (
                <td style={{ padding: '0' }}>
                    <input
                        autoFocus
                        type="text"
                        value={editClientValue}
                        onChange={(e) => setEditClientValue(e.target.value)}
                        onBlur={handleClientBlur}
                        onKeyDown={handleClientKeyDown}
                        className={styles.editInput}
                    />
                </td>
            );
        }

        return (
            <td onDoubleClick={() => handleClientDoubleClick(client, fieldName, client[fieldName])} 
                onContextMenu={(e) => handleRightClick(e, client, fieldName)}
                style={{ cursor: 'pointer' }}>
                {value}
            </td>
        );
    };

    const fetchClients = () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoading(true);
        fetch(`${BASE_URL}/clients`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log('Clients response:', data);
                if (data.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }
                // API may return array directly or nested under data/clients
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                        : Array.isArray(data?.clients) ? data.clients
                            : [];
                setSampleData(list);
                setclient_handlers(data?.details?.employee_names || data?.detail?.employee_names || []);
                setprofile_names(data?.details?.profile_names || data?.detail?.profile_names || []);
            })
            .catch(err => console.error("Failed to fetch clients:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const handleClientPhotoUpload = async (clientId, file) => {
        if (!file) return;

        let formData = new FormData();
        try {
            const options = {
                maxSizeMB: 0.1,
                maxWidthOrHeight: 512,
                useWebWorker: true
            };
            const compressedFile = await imageCompression(file, options);
            formData.append("file", compressedFile);
        } catch (error) {
            console.error("Compression error:", error);
            formData.append("file", file);
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/clients/${clientId}/photo`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (response.ok) {
                showNotification("Client photo updated successfully", "success");
                fetchClients();
            } else {
                const err = await response.json();
                showNotification(err.detail || "Failed to update photo", "error");
            }
        } catch (error) {
            console.error("Error updating client photo:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const handleClientPhotoDelete = async (clientId) => {
        if (!window.confirm("Are you sure you want to remove this client's photo?")) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/clients/${clientId}/photo`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                showNotification("Client photo removed successfully", "success");
                fetchClients();
            } else {
                const err = await response.json();
                showNotification(err.detail || "Failed to remove photo", "error");
            }
        } catch (error) {
            console.error("Error removing client photo:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const handleEmployeePhotoUpload = async (email, file) => {
        if (!file) return;
        let formData = new FormData();
        try {
            const options = { maxSizeMB: 0.1, maxWidthOrHeight: 512, useWebWorker: true };
            const compressedFile = await imageCompression(file, options);
            formData.append("file", compressedFile);
        } catch (error) {
            console.error("Compression error:", error);
            formData.append("file", file);
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/${email}/photo`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (response.ok) {
                showNotification("Employee photo updated successfully", "success");
                fetchEmployees();
            } else {
                const err = await response.json();
                showNotification(err.detail || "Failed to update employee photo", "error");
            }
        } catch (error) {
            console.error("Error updating employee photo:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const handleEmployeePhotoDelete = async (email) => {
        if (!window.confirm("Are you sure you want to remove this employee's photo?")) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/${email}/photo`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                showNotification("Employee photo removed successfully", "success");
                fetchEmployees();
            } else {
                const err = await response.json();
                showNotification(err.detail || "Failed to remove employee photo", "error");
            }
        } catch (error) {
            console.error("Error removing employee photo:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const [empData, setEmpData] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);

    const fetchEmployees = () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setEmpLoading(true);
        fetch(`${BASE_URL}/users`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if (data.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }
                // API may return array directly or nested under data/users
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                        : Array.isArray(data?.data?.users) ? data.data.users
                            : [];
                setEmpData(list);
            })
            .catch(err => console.error("Failed to fetch employees:", err))
            .finally(() => setEmpLoading(false));
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const [adminData, setAdminData] = useState([]);
    const [adminLoading, setAdminLoading] = useState(false);

    const fetchAdmins = () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setAdminLoading(true);
        fetch(`${BASE_URL}/admins`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log('Admins response:', data);
                if (data.status_code === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user_role');
                    window.location.reload();
                    return;
                }
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                        : Array.isArray(data?.data?.admins) ? data.data.admins
                            : [];
                setAdminData(list);
            })
            .catch(err => console.error("Failed to fetch admins:", err))
            .finally(() => setAdminLoading(false));
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const openAddPopup = (type) => {
        setPopupType(type);
        setShowPopup(true);
        setFormValues({
            order_date: "",
            client_id: "",
            reference_id: "",
            client_name: "",
            profile_name: "",
            location: "",
            email: "",
            whatsapp: "",
            client_handler: "",
            title: "",
            client_ref_no: "",
            client_details: "",
            order_type: "",
            index_option: "",
            cli_rank: "",
            journal: "",
            writing_start_date: "",
            publish_start_date: "",
            client_drive_link: "",
            currency: "",
            payment_status: "",
            bank_account: "",
            orders: "",
            name: "",
            password: "",
            branch: "",
            profile_name: "",
            personal_numbers: "",
            personal_email: "",
            start_range: "",
            end_range: "",
            payment: true
        });
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const openRangePopup = (employee) => {
        setSelectedEmployee(employee);
        setIdRangeStart(employee.id_range_start || "");
        setIdRangeEnd(employee.id_range_end || "");
        setShowRangePopup(true);
    };

    const handleRangeUpdate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('No authentication token found.', 'error');
            return;
        }

        const start = parseFloat(idRangeStart);
        const end = parseFloat(idRangeEnd);

        if (isNaN(start) || isNaN(end)) {
            showNotification('Please enter valid numbers for the range.', 'error');
            return;
        }

        if (start >= end) {
            showNotification('Start range must be less than end range.', 'error');
            return;
        }

        setPermissionLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/users/permissions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    email: selectedEmployee.email,
                    id_range_start: start,
                    id_range_end: end
                }),
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Permissions range updated successfully!', 'success');
                setShowRangePopup(false);
                fetchEmployees(); // Refresh the employee list
            } else {
                showNotification(data.message || 'Failed to update permissions.', 'error');
            }
        } catch (error) {
            console.error('Error updating permissions:', error);
            showNotification('Error updating permissions. Please try again.', 'error');
        } finally {
            setPermissionLoading(false);
        }
    };

    const handleChange = async (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            const file = files[0];
            if (file) {
                let fileToSave = file;
                try {
                    const options = { maxSizeMB: 0.1, maxWidthOrHeight: 512, useWebWorker: true };
                    fileToSave = await imageCompression(file, options);
                } catch (err) {
                    console.error("Compression error", err);
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    setFormValues((prev) => ({ ...prev, [name]: reader.result, [`${name}File`]: fileToSave }));
                };
                reader.readAsDataURL(fileToSave);
            } else {
                setFormValues((prev) => ({ ...prev, [name]: "", [`${name}File`]: null }));
            }
        } else {
            setFormValues((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!token) {
            showNotification('No authentication token found. Please login first.', 'error');
            return;
        }

        let endpoint = '';
        let payload = {};
        let isFormData = false;

        if (popupType === 'client') {
            if (!formValues.client_name || formValues.client_name.trim() === "") {
                showNotification("Client Name is required!", "error");
                return;
            }
            if (!formValues.profile_name || formValues.profile_name.trim() === "") {
                showNotification("Profile Name is required!", "error");
                return;
            }

            endpoint = `${BASE_URL}/unified/create`;
            isFormData = true;
            payload = new FormData();

            const requestPayload = {};

            // Safely add optional fields only if they have a truthy value
            const addIfPresent = (key, value) => {
                if (value && String(value).trim() !== "") {
                    requestPayload[key] = value;
                }
            };

            addIfPresent("client_id", formValues.client_id?.toUpperCase());
            addIfPresent("client_name", formValues.client_name.trim().toUpperCase());
            addIfPresent("profile_name", formValues.profile_name);
            addIfPresent("client_country", formValues.location?.toUpperCase());
            addIfPresent("client_email", formValues.email);
            addIfPresent("client_whatsapp_no", formValues.whatsapp);
            addIfPresent("client_ref_no", formValues.client_ref_no?.toUpperCase());
            addIfPresent("clients_details", formValues.client_details);
            addIfPresent("client_drive_link", formValues.client_drive_link);
            addIfPresent("reference_id", formValues.reference_id?.toUpperCase());
            addIfPresent("title", formValues.title);
            addIfPresent("order_type", formValues.order_type);
            addIfPresent("index", formValues.index_option);
            addIfPresent("rank", formValues.cli_rank);
            addIfPresent("journal_name", formValues.journal);
            addIfPresent("write_start_date", formValues.writing_start_date);
            addIfPresent("profile_start_date", formValues.publish_start_date);
            addIfPresent("currency", formValues.currency);
            addIfPresent("payment_status", formValues.payment_status);
            addIfPresent("order_date", formValues.order_date);
            addIfPresent("client_handler", formValues.client_handler);
            addIfPresent("client_bank_account", formValues.bank_account);
            addIfPresent("order_status", "Active");

            // FastAPI expects the JSON payload in a form field named 'request'
            payload.append("request", JSON.stringify(requestPayload));

            if (formValues.photoFile) {
                payload.append("client_photo", formValues.photoFile);
            }
        } else if (popupType === 'employee') {
            const start = parseFloat(formValues.start_range);
            const end = parseFloat(formValues.end_range);

            if (isNaN(start) || isNaN(end)) {
                showNotification('Please enter valid numbers for range', 'error');
                return;
            }

            if (start >= end) {
                showNotification('Start range must be less than end range', 'error');
                return;
            }

            endpoint = `${BASE_URL}/users`;
            payload = {
                full_name: formValues.name.toUpperCase(),
                email: formValues.email,
                password: formValues.password,
                phone_number: formValues.whatsapp,
                branch: formValues.branch.toUpperCase(),
                personal_number: formValues.personal_numbers,
                personal_email: formValues.personal_email,
                id_range_start: formValues.start_range,
                id_range_end: formValues.end_range,
                profile_names: formValues.profile_name ? formValues.profile_name.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "") : [],
                role: "employee",
                photo: formValues.photo || ""
            };
        } else if (popupType === 'manager' || popupType === 'admin') {
            endpoint = `${BASE_URL}/users`;
            payload = {
                full_name: formValues.name.toUpperCase(),
                email: formValues.email,
                password: formValues.password,
                phone_number: formValues.whatsapp,
                branch: formValues.branch.toUpperCase(),
                role: formValues.role
            };
        }

        try {
            const fetchOptions = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: isFormData ? payload : JSON.stringify(payload),
            };

            if (!isFormData) {
                fetchOptions.headers['Content-Type'] = 'application/json';
            }

            const response = await fetch(endpoint, fetchOptions);
            console.log(isFormData ? Object.fromEntries(payload.entries()) : payload);
            const data = await response.json();

            if (response.ok) {
                console.log('Success:', data);

                // Upload photo if present
                if (popupType === 'employee' && formValues.photoFile) {
                    try {
                        const formData = new FormData();
                        formData.append("file", formValues.photoFile);

                        let photoUrl = `${BASE_URL}/users/${formValues.email}/photo`;

                        const photoResponse = await fetch(photoUrl, {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${token}`
                            },
                            body: formData
                        });

                        if (!photoResponse.ok) {
                            console.error(`Failed to upload ${popupType} photo`, await photoResponse.text());
                            showNotification(`${popupType.charAt(0).toUpperCase() + popupType.slice(1)} added, but failed to upload photo`, "error");
                        } else {
                            showNotification(`${popupType.charAt(0).toUpperCase() + popupType.slice(1)} added successfully!`, 'success');
                        }
                    } catch (photoError) {
                        console.error(`Error uploading ${popupType} photo:`, photoError);
                        showNotification(`${popupType.charAt(0).toUpperCase() + popupType.slice(1)} added, but error uploading photo`, "error");
                    }
                } else {
                    showNotification(`${popupType.charAt(0).toUpperCase() + popupType.slice(1)} added successfully!`, 'success');
                }

                closePopup();
                // Refresh list after successful add
                if (popupType === 'client') {
                    fetchClients();
                } else if (popupType === 'employee') {
                    fetchEmployees();
                } else if (popupType === 'admin') {
                    fetchAdmins();
                }
            } else {
                console.error('Error:', data);
                showNotification(data.message || `Failed to add ${popupType}`, 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            showNotification('Error submitting form. Please try again.', 'error');
        }
    };

    const userRole = localStorage.getItem('user_role') || '';

    return (
        <div className={styles.page}>
            {notification.visible && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    <div className={styles.notificationIcon}>
                        {notification.type === 'success' ? '✓' : '✕'}
                    </div>
                    <p>{notification.message}</p>
                </div>
            )}

            <div className={styles.head}>
                {activeTab === "client" && <div id={styles.subcontainer1}>
                    <p>Client</p>
                    <button type="button" onClick={() => openAddPopup('client')}>Add Client</button>
                </div>}
                {(activeTab === "employee" && (userRole === 'admin' || userRole === 'manager')) && <div id={styles.subcontainer1}>
                    <p>Employee</p>
                    <button type="button" onClick={() => openAddPopup('employee')}>Add Employee</button>
                </div>}
                {activeTab === "admin" && userRole === 'admin' && <div id={styles.subcontainer1}>
                    <p>Admin</p>
                    <button type="button" onClick={() => openAddPopup('admin')}>Add Admin</button>
                </div>}
                <div>
                    <p>{activeTab} Details</p>
                </div>
                <div className={styles.headers}>
                    <button type="button" onClick={() => setActiveTab("client")}>client</button>
                    {(userRole === 'admin' || userRole === 'manager') && (
                        <button type="button" onClick={() => setActiveTab("employee")}>Employee</button>
                    )}
                    {userRole === 'admin' && (
                        <button type="button" onClick={() => setActiveTab("admin")}>admin</button>
                    )}
                </div>
            </div>

            {/* <div className={styles.headers}>
                <button type="button" onClick={() => setActiveTab("client")}>client</button>
                {(userRole === 'admin' || userRole === 'manager') && (
                    <button type="button" onClick={() => setActiveTab("employee")}>Employee</button>
                )}
                {userRole === 'admin' && (
                    <button type="button" onClick={() => setActiveTab("admin")}>admin</button>
                )}
            </div> */}
            {showPopup && (
                <div className={styles.popupcontainer}>
                    <div className={`${styles.mainpopupbox} ${popupType !== 'client' ? styles.smallPopup : ''}`}>
                        <div className={styles.header}>
                            <h3 style={{ margin: 0, textTransform: 'capitalize' }}>{popupType} add</h3>
                            <button type="button" onClick={closePopup} style={{ border: 'none', background: 'transparent', color: 'red', fontSize: '28px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleSubmit} className={styles.popupform}>
                            {popupType === 'client' && <ClientForm formValues={formValues} handleChange={handleChange} profile_names={profile_names} client_handlers={client_handlers} />}
                            {popupType === 'employee' && <EmployeeForm formValues={formValues} handleChange={handleChange} />}
                            {popupType === 'admin' && <AdminForm formValues={formValues} handleChange={handleChange} profile_names={profile_names} />}
                            <div className={styles.footerpopup}>
                                <button type="button" onClick={closePopup} id={styles.cancelbtn} >Cancel</button>
                                <button type="submit" id={styles.submitbtn} >Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRangePopup && selectedEmployee && (
                <div className={styles.popupcontainer}>
                    <div className={`${styles.mainpopupbox} ${styles.smallPopup}`}>
                        <div className={styles.header}>
                            <h3 style={{ margin: 0, textTransform: 'capitalize' }}>Update Range Permissions</h3>
                            <button type="button" onClick={() => setShowRangePopup(false)} style={{ border: 'none', background: 'transparent', color: 'red', fontSize: '28px', cursor: 'pointer' }}>×</button>
                        </div>
                        <form onSubmit={handleRangeUpdate} className={styles.popupform}>
                            <div className={styles.formContainer}>
                                <fieldset className={styles.inputFieldset} style={{ background: '#f8fafc', borderColor: '#e2e8f0' }}>
                                    <legend className={styles.inputLegend} style={{ color: '#64748b' }}>Employee Email</legend>
                                    <input type="text" value={selectedEmployee.email} readOnly style={{ color: '#64748b', cursor: 'not-allowed' }} />
                                </fieldset>
                            </div>
                            <div className={styles.formcontainer2col}>
                                <div className={styles.formContainer}>
                                    <fieldset className={styles.inputFieldset}>
                                        <legend className={styles.inputLegend}>ID Range Start</legend>
                                        <input
                                            type="number"
                                            value={idRangeStart}
                                            onChange={(e) => setIdRangeStart(e.target.value)}
                                            required
                                        />
                                    </fieldset>
                                </div>
                                <div className={styles.formContainer}>
                                    <fieldset className={styles.inputFieldset}>
                                        <legend className={styles.inputLegend}>ID Range End</legend>
                                        <input
                                            type="number"
                                            value={idRangeEnd}
                                            onChange={(e) => setIdRangeEnd(e.target.value)}
                                            required
                                        />
                                    </fieldset>
                                </div>
                            </div>
                            <div className={styles.footerpopup}>
                                <button type="button" onClick={() => setShowRangePopup(false)} id={styles.cancelbtn}>Cancel</button>
                                <button type="submit" id={styles.submitbtn} disabled={permissionLoading}>
                                    {permissionLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {activeTab === "client" && (
                <div className={styles.container}>
                    {/* <div id={styles.subcontainer1}>
                        <p>Client</p>
                        <button type="button" onClick={() => openAddPopup('client')}>Add Client</button>
                    </div> */}
                    <div className={styles.subcontainer2}>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Client ID</th>
                                    <th>Client Name</th>
                                    <th>Location</th>
                                    <th>Email</th>
                                    <th>Whatsapp</th>
                                    <th>Client Handler</th>
                                    {/* <th>Client Ref no</th> */}
                                    {/* <th>Link</th> */}
                                    <th>Bank account</th>
                                    {/* <th>Order type</th> */}
                                    <th>Orders</th>
                                    <th>photo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '16px' }}>Loading...</td></tr>
                                ) : sampleData.filter(client => {
                                    if (!searchTerm) return true;
                                    return Object.values(client).some(val =>
                                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }).length === 0 ? (
                                    <tr><td colSpan={10} style={{ textAlign: 'center', padding: '16px' }}>No clients found.</td></tr>
                                ) : sampleData
                                    .filter(client => {
                                        if (!searchTerm) return true;
                                        return Object.values(client).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((client, index) => (
                                        <tr key={client._id || client.client_id}>
                                            <td>{index + 1}</td>
                                            {renderClientCell(client, 'client_id', <span className={styles.clientIdBadge}>{client.client_id}</span>)}
                                            {renderClientCell(client, 'name', <span className={styles.clientNameCell}>{client.name}</span>)}
                                            {renderClientCell(client, 'country', client.country ? <span className={styles.locationBadge}>{client.country}</span> : '—')}
                                            {renderClientCell(client, 'email', <span className={styles.emailCell}>{client.email}</span>)}
                                            {renderClientCell(client, 'whatsapp_no')}
                                            {renderClientCell(client, 'client_handler_name', client.client_handler_name ? <span className={styles.handlerBadge}>{client.client_handler_name}</span> : '—')}
                                            {/* {renderClientCell(client, 'client_ref_no', client.client_ref_no ? <span className={styles.refBadge}>{client.client_ref_no}</span> : '—')} */}
                                            {renderClientCell(client, 'bank_account')}
                                            {/* <td>
                                                <div className={styles.scrollableCell}>
                                                    {client.order_type
                                                        ? String(client.order_type).split(',').map(s => s.trim()).filter(Boolean).map((type, idx) => (
                                                            <div key={idx} style={{ whiteSpace: 'nowrap' }}>{type}</div>
                                                        ))
                                                        : ''}
                                                </div>
                                            </td> */}
                                            <td>
                                                <div className={styles.tooltipContainer}>
                                                    <span className={styles.ordersBadge}>{client.total_orders}</span>
                                                    <div className={styles.tooltipContent}>
                                                        {(() => {
                                                            if (!client.order_type) return "No Orders";
                                                            const items = String(client.order_type).split(',').map(s => s.trim()).filter(Boolean);
                                                            const totalOrders = Number(client.total_orders) || items.length;
                                                            // If only one unique order type, use total_orders as the count
                                                            const uniqueTypes = [...new Set(items)];
                                                            if (uniqueTypes.length === 1) {
                                                                return totalOrders > 1
                                                                    ? `1. ${uniqueTypes[0]} - ${totalOrders}`
                                                                    : `1. ${uniqueTypes[0]}`;
                                                            }
                                                            // Multiple different order types — count occurrences from comma list
                                                            const counts = {};
                                                            items.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
                                                            return Object.entries(counts)
                                                                .map(([val, count], i) => count > 1 ? `${i + 1}. ${val} - ${count}` : `${i + 1}. ${val}`)
                                                                .join('\n');
                                                        })()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    {client.photo_url ? (
                                                        <img
                                                            src={`${BASE_URL}/${client.photo_url}`}
                                                            alt="Profile"
                                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                                            title="Double click to view full size"
                                                            onDoubleClick={() => setSelectedImage(`${BASE_URL}/${client.photo_url}`)}
                                                        />
                                                    ) : (
                                                        <span>—</span>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <label style={{ fontSize: '10px', cursor: 'pointer', padding: '2px 4px', background: '#e2e8f0', borderRadius: '4px' }} title="Update Photo">
                                                            <CloudCog size={12} />
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg, image/jpg"
                                                                style={{ display: 'none' }}
                                                                onChange={(e) => handleClientPhotoUpload(client.client_id, e.target.files[0])}
                                                            />
                                                        </label>
                                                        {client.photo_url && (
                                                            <button
                                                                onClick={() => handleClientPhotoDelete(client.client_id)}
                                                                style={{ fontSize: '10px', cursor: 'pointer', padding: '2px 4px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px' }}
                                                                title="Remove Photo"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "employee" && (userRole === 'admin' || userRole === 'manager') && (
                <div className={styles.container}>
                    {/* <div id={styles.subcontainer1}>
                        <p>Employee</p>
                        <button type="button" onClick={() => openAddPopup('employee')}>Add Employee</button>
                    </div> */}
                    <div className={styles.tablecontainer2}>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                    <th>Whatsapp</th>
                                    <th>Personal Email</th>
                                    <th>Personal Phone</th>
                                    <th>Profile Holder</th>
                                    <th>Branch</th>
                                    <th>Range</th>
                                    <th>Photo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {empLoading ? (
                                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: '16px' }}>Loading...</td></tr>
                                ) : empData.filter(e => {
                                    if (!searchTerm) return true;
                                    return Object.values(e).some(val =>
                                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }).length === 0 ? (
                                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: '16px' }}>No employees found.</td></tr>
                                ) : empData
                                    .filter(e => {
                                        if (!searchTerm) return true;
                                        return Object.values(e).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((e, index) => (
                                        <tr key={e._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{e.full_name}</td>
                                            <td>{e.email}</td>
                                            <td>{e.password}</td>
                                            <td>{e.phone_number}</td>
                                            <td>{e.personal_email}</td>
                                            <td>{e.personal_number}</td>
                                            <td>
                                                <div className={styles.scrollableCell}>
                                                    {e.profile_names
                                                        ? String(e.profile_names).split(',').map(s => s.trim()).filter(Boolean).map((name, idx) => (
                                                            <div key={idx} style={{ whiteSpace: 'nowrap' }}>{name}</div>
                                                        ))
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td>{e.branch}</td>
                                            <td
                                                className={styles.rangeCell}
                                                onDoubleClick={() => openRangePopup(e)}
                                                title="Click to update range permissions"
                                                style={{
                                                    cursor: 'pointer',
                                                    color: 'hsla(0, 0%, 0%, 1.00)',
                                                    fontWeight: 700,
                                                    textDecoration: 'none',

                                                }}
                                            >
                                                {e.id_range_start} - {e.id_range_end}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                    {e.photo_url || e.photo ? (
                                                        <img
                                                            src={`${BASE_URL}/${e.photo_url}`}
                                                            alt="Profile"
                                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                                                            title="Double click to view full size"
                                                            onDoubleClick={() => setSelectedImage(`${BASE_URL}/${e.photo_url}`)}
                                                        />
                                                    ) : (
                                                        <span>—</span>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        <label style={{ fontSize: '10px', cursor: 'pointer', padding: '2px 4px', background: '#e2e8f0', borderRadius: '4px' }} title="Update Photo">
                                                            <CloudCog size={12} />
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg, image/jpg"
                                                                style={{ display: 'none' }}
                                                                onChange={(ev) => handleEmployeePhotoUpload(e.email, ev.target.files[0])}
                                                            />
                                                        </label>
                                                        {(e.photo_url || e.photo) && (
                                                            <button
                                                                onClick={() => handleEmployeePhotoDelete(e.email)}
                                                                style={{ fontSize: '10px', cursor: 'pointer', padding: '2px 4px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px' }}
                                                                title="Remove Photo"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}

            {activeTab === "admin" && userRole === 'admin' && (
                <div className={styles.container}>
                    {/* <div id={styles.subcontainer1}>
                        <p>Admin</p>
                        <button type="button" onClick={() => openAddPopup('admin')}>Add Admin</button>
                    </div> */}
                    <div className={styles.tablecontainer2}>
                        <table>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Password</th>
                                    <th>Whatsapp</th>
                                    <th>Branch</th>
                                </tr>
                            </thead>
                            <tbody>
                                {adminLoading ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>Loading...</td></tr>
                                ) : adminData.filter(e => {
                                    if (!searchTerm) return true;
                                    return Object.values(e).some(val =>
                                        String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                    );
                                }).length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>No admins found.</td></tr>
                                ) : adminData
                                    .filter(e => {
                                        if (!searchTerm) return true;
                                        return Object.values(e).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((e, index) => (
                                        <tr key={e._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{e.full_name || e.name}</td>
                                            <td>{e.email}</td>
                                            <td>{e.password}</td>
                                            <td>{e.phone_number}</td>
                                            <td>{e.branch}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}

            {selectedImage && (
                <div onClick={() => setSelectedImage(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
                    <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
                        <img src={selectedImage} alt="Full Size Preview" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} />
                        <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#ef4444', color: 'white', border: 'none', width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>✕</button>
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