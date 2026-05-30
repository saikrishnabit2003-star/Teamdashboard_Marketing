import { useState } from "react";
import styles from "./Accounts.module.css";
import { ImagePlus } from "lucide-react";

export function EmployeeForm({ formValues, handleChange }) {
    const [errorMsg, setErrorMsg] = useState("");
    const [fileName, setFileName] = useState("");
    const [testphoto, setTestPhoto] = useState("");
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
        <div className={styles.formcontainer2col}>
            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Name</legend>
                <input 
                    name="name" 
                    value={formValues.name} 
                    onChange={handleChange} 
                    placeholder="EX: Hari" 
                />
            </fieldset>

            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Email</legend>
                <input 
                    name="email" 
                    type="email"
                    value={formValues.email} 
                    onChange={handleChange} 
                    placeholder="example@gmail.com" 
                />
            </fieldset>

            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Password</legend>
                <input 
                    name="password" 
                    value={formValues.password} 
                    onChange={handleChange} 
                    placeholder="xxxxxx" 
                />
            </fieldset>

            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Whatsapp No</legend>
                <input 
                    name="whatsapp" 
                    type="number"
                    value={formValues.whatsapp} 
                    onChange={handleChange} 
                    placeholder="+91..." 
                />
            </fieldset>

            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Branch</legend>
                <select 
                    name="branch" 
                    value={formValues.branch} 
                    onChange={handleChange}
                    className={styles.selectInput}
                >
                    <option value="">select branch</option>
                    <option value="vellore">vellore</option>
                    <option value="chennai">chennai</option>
                    <option value="coimbatore">coimbatore</option>
                    <option value="trichy">trichy</option>
                    <option value="marthandam">marthandam</option>
                    <option value="nagarcoil-1">nagarcoil-1</option>
                    <option value="nagarcoil-2">nagarcoil-2</option>
                </select>
            </fieldset>

            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Profile Holder</legend>
                <input 
                    name="profile_name" 
                    value={formValues.profile_name} 
                    onChange={handleChange} 
                    placeholder="Enter the Profile Name" 
                />
            </fieldset>

             <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Personal numbers</legend>
                <input 
                    name="personal_numbers" 
                    value={formValues.personal_numbers} 
                    onChange={handleChange} 
                    type="number"
                    placeholder="Enter the Personal Numbers" 
                />
            </fieldset>

             <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>Personal Email</legend>
                <input 
                    name="personal_email" 
                    value={formValues.personal_email} 
                    onChange={handleChange} 
                    type="email"
                    placeholder="Enter the Personal Email" 
                />
            </fieldset>
            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>start range</legend>
                <input 
                    name="start_range" 
                    type="number"
                    value={formValues.start_range} 
                    onChange={handleChange}
                    
                    placeholder="Enter the start range" 
                />
            </fieldset>
            <fieldset className={styles.inputFieldset}>
                <legend className={styles.inputLegend}>end range</legend>
                <input 
                    name="end_range" 
                    type="number"
                    value={formValues.end_range} 
                    onChange={handleChange}
                    placeholder="Enter the end range" 
                />
            </fieldset>
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
    );
}
