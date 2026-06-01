import { useState, useEffect } from "react";
import styles from "./Accounts.module.css";
import { ImagePlus } from "lucide-react";
import { BASE_URL } from "../config";

export function ClientForm({ formValues, handleChange, profile_names, client_handlers }) {
    const [errorMsg, setErrorMsg] = useState("");
    const [fileName, setFileName] = useState("");
    const [settingsOptions, setSettingsOptions] = useState({
        order_type: [],
        index: [],
        rank: [],
        bank_account: []
    });

    useEffect(() => {
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
                .catch(err => console.error("Error loading settings in ClientForm:", err));
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "image/jpeg" && file.type !== "image/jpg") {
                setErrorMsg("Only JPG format is allowed.");
                e.target.value = ""; // Reset input
                return;
            }
            setErrorMsg("");
            setErrorMsg("");
            setFileName(file.name);
            handleChange(e);
        } else {
            setFileName("");
            setErrorMsg("");
            handleChange(e);
        }
    };

    return (
        <div className={styles.formcontainer1}>
            <div className={styles.formContainer}>

                {/* Client Name */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Name</legend>
                    <input
                        name="client_name"
                        value={formValues.client_name}
                        onChange={handleChange}
                        placeholder="Enter Name"
                    />
                </fieldset>

                {/* Client ID */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client ID</legend>
                    <input
                        name="client_id"
                        value={formValues.client_id}
                        onChange={handleChange}
                        placeholder="Ex: 101"
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>order date</legend>
                    <input
                        name="order_date"
                        value={formValues.order_date}
                        onChange={handleChange}
                        placeholder="select date"
                        type="date"
                    />
                </fieldset>
                
                {/* reference id */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Reference ID</legend>
                    <input
                        name="reference_id"
                        value={formValues.reference_id}
                        onChange={handleChange}
                        placeholder="Ex: 101"
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Ref no</legend>
                    <input
                        name="client_ref_no"
                        value={formValues.client_ref_no}
                        onChange={handleChange}
                        placeholder="EX: REF-001"
                    />
                </fieldset>

                {/* Location */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Country</legend>
                    <input
                        name="location"
                        value={formValues.location}
                        onChange={handleChange}
                        placeholder="Country"
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Handler</legend>
                    <select
                        name="client_handler"
                        value={formValues.client_handler}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Assigned To</option>
                        {client_handlers && client_handlers.map((handler, index) => (
                            <option key={index} value={handler}>{handler}</option>
                        ))}
                    </select>
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>profile name</legend>
                    <select
                        name="profile_name"
                        value={formValues.profile_name}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Select a Client</option>
                        {profile_names && profile_names.map((name, index) => (
                            <option key={index} value={name}>{name}</option>
                        ))}
                    </select>
                </fieldset>

                
            </div>

            <div className={styles.formContainer}>
                {/* Email */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Email</legend>
                    <input
                        name="email"
                        value={formValues.email}
                        onChange={handleChange}
                        placeholder="example@gmail.com"
                    />
                </fieldset>

                {/* Whatsapp */}
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Whatsapp</legend>
                    <input
                        name="whatsapp"
                        value={formValues.whatsapp}
                        onChange={handleChange}
                        placeholder="+91..."
                    />
                </fieldset>  

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Title</legend>
                    <input
                        name="title"
                        value={formValues.title}
                        onChange={handleChange}
                        placeholder="EX: AI......"
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Journal</legend>
                    <textarea
                        name="journal"
                        value={formValues.journal}
                        className={styles.textAreaInput}
                        onChange={handleChange}
                        placeholder="Enter full journal name..."

                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Index</legend>
                    <select
                        name="index_option"
                        value={formValues.index_option}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Select Indexing</option>
                        {settingsOptions.index.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                        ))}
                    </select>
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Rank</legend>
                    <select
                        name="cli_rank"
                        value={formValues.cli_rank}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Choose Rank</option>
                        {settingsOptions.rank.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                        ))}
                    </select>
                </fieldset>





                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Writing Start Date</legend>
                    <input
                        name="writing_start_date"
                        value={formValues.writing_start_date}
                        onChange={handleChange}
                        type="date"
                    />
                </fieldset>
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>publish Start Date</legend>
                    <input
                        name="publish_start_date"
                        value={formValues.publish_start_date}
                        onChange={handleChange}
                        type="date"
                    />
                </fieldset>

                
                
            </div>

            <div className={styles.formContainer}>
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Drive </legend>
                    <input
                        name="client_drive_link"
                        value={formValues.client_drive_link}
                        onChange={handleChange}
                        placeholder="paste your link"
                        type="url"
                    />
                </fieldset>
                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Order Type</legend>
                    <select
                        name="order_type"
                        value={formValues.order_type}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Select an option</option>
                        {settingsOptions.order_type.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                        ))}
                    </select>
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>client details</legend>
                    <input
                        name="client_details"
                        value={formValues.client_details}
                        onChange={handleChange}
                        placeholder="Drive link..."
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Curreny</legend>
                    <select
                        name="currency"
                        value={formValues.currency}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Choose curreny</option>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="CNY">CNY</option>
                        <option value="SAR">SAR</option>
                        <option value="AED">AED</option>
                        {/* <option value="CHINA">CHINA</option> */}
                    </select>
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Client Bank account</legend>
                    {/* <select
                        name="bank_account"
                        value={formValues.bank_account}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Choose bank account</option>
                        {settingsOptions.bank_account.map((opt, idx) => (
                            <option key={idx} value={opt}>{opt}</option>
                        ))}
                    </select> */}
                    <input
                        name="client_bank_account"
                        value={formValues.bank_account}
                        onChange={handleChange}
                        placeholder="Enter client bank account"
                    />
                </fieldset>

                <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Payment Status</legend>
                    <select
                        name="payment_status"
                        value={formValues.payment_status}
                        onChange={handleChange}
                        className={styles.selectInput}
                    >
                        <option value="">Choose status</option>
                        <option value="Not yet">Not yet</option>
                        <option value="partial">Partial</option>
                        <option value="paid">Paid</option>
                    </select>
                </fieldset>

                {/* <fieldset className={styles.inputFieldset}>
                    <legend className={styles.inputLegend}>Orders</legend>
                    <input 
                        name="orders" 
                        value={formValues.orders} 
                        onChange={handleChange} 
                        placeholder="EX: 10" 
                    />
                </fieldset> */}
                <fieldset className={styles.inputFieldset} style={{ border: errorMsg ? '1px solid #ef4444' : '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <legend className={styles.inputLegend} style={{ color: errorMsg ? '#ef4444' : '#64748b' }}>Photo (JPG)</legend>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '40px', padding: '0 12px', cursor: 'pointer' }}>
                        <input
                            name="photo"
                            type="file"
                            accept="image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            style={{ opacity: 0, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', pointerEvents: 'none' }}>
                            <ImagePlus size={20} />
                            <span style={{ fontSize: '14px', fontWeight: '500', color: fileName ? '#334155' : '#94a3b8' }}>
                                {fileName || "Click to upload a profile photo"}
                            </span>
                        </div>
                    </div>
                    {errorMsg && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 12px 8px', position: 'absolute', bottom: '-24px' }}>{errorMsg}</p>}
                </fieldset>

            </div>

        </div>
    );
}
