import styles from "./Accounts.module.css";

export function AdminForm({ formValues, handleChange, profile_names }) {
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
                    value={formValues.whatsapp} 
                    onChange={handleChange} 
                    placeholder="+91..." 
                    type="number"
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
                <legend className={styles.inputLegend}>Role</legend>
                <select 
                    name="role" 
                    value={formValues.role} 
                    onChange={handleChange}
                    className={styles.selectInput}
                >
                    <option value="">select role</option>
                    {/* <option value="accounts">accounts</option> */}
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                    {/* <option value="emp">emp</option> */}
                </select>
            </fieldset>
        </div>
    );
}
