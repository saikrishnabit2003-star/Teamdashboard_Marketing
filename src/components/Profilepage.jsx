import React, { useState, useEffect } from 'react';
import styles from './Profilepage.module.css';
import closeeye from '../assets/closeeye.png';
import openeye from '../assets/openeye.png';
import { BASE_URL } from '../config';
import imageCompression from 'browser-image-compression';


const Profilepage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({ new: '', confirm: '' });
    const [notification, setNotification] = useState({ message: '', type: '', visible: false });

    // New states for profile names
    const [newProfileName, setNewProfileName] = useState('');
    const [isAppending, setIsAppending] = useState(false);

    // New states for WhatsApp numbers
    const [newWhatsapp, setNewWhatsapp] = useState('');
    const [isAppendingWhatsapp, setIsAppendingWhatsapp] = useState(false);

    // New states for WeChat accounts
    const [newWeChat, setNewWeChat] = useState('');
    const [isAppendingWeChat, setIsAppendingWeChat] = useState(false);

    const showNotification = (message, type) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 5000);
    };

    const fetchUserDetails = () => {
        const token = localStorage.getItem('token');
        if (token) {
            setLoading(true);
            fetch(`${BASE_URL}/users/me/details`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    if (data?.data) {
                        setUserData(data.data);
                    }
                })
                .catch(error => console.error("Error fetching user details:", error))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const handleAppendProfile = async (e) => {
        e.preventDefault();
        if (!newProfileName.trim()) {
            showNotification("Please enter a profile name", "error");
            return;
        }

        const token = localStorage.getItem('token');
        setIsAppending(true);

        try {
            const response = await fetch(`${BASE_URL}/users/profiles/append`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userData.email,
                    profile_name: newProfileName.trim().toUpperCase()
                })
            });

            if (response.ok) {
                showNotification("Profile appended successfully", "success");
                setNewProfileName('');
                fetchUserDetails(); // Refresh dat
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to append profile", "error");
            }
        } catch (error) {
            console.error("Error appending profile:", error);
            showNotification("Error connecting to server", "error");
        } finally {
            setIsAppending(false);
        }
    };

    const handleDeleteProfile = async (profileToDelete) => {
        if (!window.confirm(`Are you sure you want to delete the profile "${profileToDelete}"?`)) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/profiles/${userData.email}/${profileToDelete}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotification("Profile deleted successfully", "success");
                fetchUserDetails();
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to delete profile", "error");
            }
        } catch (error) {
            console.error("Error deleting profile:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const handleAppendWhatsapp = async (e) => {
        e.preventDefault();
        if (!newWhatsapp.trim()) {
            showNotification("Please enter a WhatsApp number", "error");
            return;
        }

        const token = localStorage.getItem('token');
        setIsAppendingWhatsapp(true);

        try {
            const response = await fetch(`${BASE_URL}/users/whatsapp_numbers/append`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userData.email,
                    profile_name: newWhatsapp.trim()
                })
            });

            if (response.ok) {
                showNotification("WhatsApp number appended successfully", "success");
                setNewWhatsapp('');
                fetchUserDetails();
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to append WhatsApp number", "error");
            }
        } catch (error) {
            console.error("Error appending WhatsApp number:", error);
            showNotification("Error connecting to server", "error");
        } finally {
            setIsAppendingWhatsapp(false);
        }
    };

    const handleDeleteWhatsapp = async (whatsappToDelete) => {
        if (!window.confirm(`Are you sure you want to delete the WhatsApp number "${whatsappToDelete}"?`)) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/whatsapp_numbers/${userData.email}/${whatsappToDelete}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotification("WhatsApp number deleted successfully", "success");
                fetchUserDetails();
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to delete WhatsApp number", "error");
            }
        } catch (error) {
            console.error("Error deleting WhatsApp number:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const handleAppendWeChat = async (e) => {
        e.preventDefault();
        if (!newWeChat.trim()) {
            showNotification("Please enter a WeChat name", "error");
            return;
        }

        const token = localStorage.getItem('token');
        setIsAppendingWeChat(true);

        try {
            const response = await fetch(`${BASE_URL}/users/we_chats/append`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    email: userData.email,
                    profile_name: newWeChat.trim()
                })
            });

            if (response.ok) {
                showNotification("WeChat appended successfully", "success");
                setNewWeChat('');
                fetchUserDetails();
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to append WeChat", "error");
            }
        } catch (error) {
            console.error("Error appending WeChat:", error);
            showNotification("Error connecting to server", "error");
        } finally {
            setIsAppendingWeChat(false);
        }
    };

    const handleDeleteWeChat = async (weChatToDelete) => {
        if (!window.confirm(`Are you sure you want to delete the WeChat "${weChatToDelete}"?`)) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/we_chats/${userData.email}/${weChatToDelete}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotification("WeChat deleted successfully", "success");
                fetchUserDetails();
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to delete WeChat", "error");
            }
        } catch (error) {
            console.error("Error deleting WeChat:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            showNotification("New passwords do not match", "error");
            return;
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/me/password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_password: passwordData.new
                })
            });

            if (response.ok) {
                showNotification("Password updated successfully", "success");
                setIsModalOpen(false);
                setPasswordData({ new: '', confirm: '' });
            } else {
                const errorData = await response.json();
                showNotification(errorData.message || "Failed to update password", "error");
            }
        } catch (error) {
            console.error("Error updating password:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
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
            formData.append("file", file); // fallback to original file if compression fails
        }

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/${userData.email}/photo`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                showNotification("Photo updated successfully", "success");
                fetchUserDetails();
            } else {
                const errorData = await response.json();
                showNotification(errorData.detail || "Failed to update photo", "error");
            }
        } catch (error) {
            console.error("Error updating photo:", error);
            showNotification("Error connecting to server", "error");
        }
    };
    // console.log(isAppending);    
    const handlePhotoDelete = async () => {
        if (!window.confirm("Are you sure you want to remove your profile photo?")) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${BASE_URL}/users/${userData.email}/photo`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                showNotification("Photo removed successfully", "success");
                fetchUserDetails();
            } else {
                const errorData = await response.json();
                showNotification(errorData.detail || "Failed to remove photo", "error");
            }
        } catch (error) {
            console.error("Error removing photo:", error);
            showNotification("Error connecting to server", "error");
        }
    };

    // if (loading) {
    //     return (
    //         <div className={styles.profilePage}>
    //             <div className={styles.loading}>
    //                 <div className={styles.spinner}></div>
    //                 <p>Loading profile details...</p>
    //             </div>
    //         </div>
    //     );
    // }

    // if (!userData) {
    //     return (
    //         <div className={styles.profilePage}>
    //             <div className={styles.profileCard}>
    //                 <p>Failed to load profile data. Please try logging in again.</p>
    //             </div>
    //         </div>
    //     );
    // }

    const { full_name, email, role, phone_number, branch, profile_names, photo_url } = userData || {};
    const userPhoto = photo_url ? `${BASE_URL}/${photo_url}` : null;

    return (
        <div className={styles.profilePage}>
            {notification.visible && (
                <div className={`${styles.notification} ${styles[notification.type]}`}>
                    <div className={styles.notificationIcon}>
                        {notification.type === 'success' ? '✓' : '✕'}
                    </div>
                    <p>{notification.message}</p>
                </div>
            )}

            <div className={styles.profileContainer}>
                {/* Left Sidebar - Identity */}
                <div className={styles.sidebar}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            {userPhoto ? (
                                <img decoding="async" src={`${userPhoto}?q=50`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50px' }} />
                            ) : (
                                full_name ? full_name.charAt(0).toUpperCase() : 'U'
                            )}
                        </div>
                        <div className={styles.roleBadge}>{role || 'Employee'}</div>
                    </div>
                    <h2 className={styles.userName}>{full_name || 'User Name'}</h2>
                    <p className={styles.userSubtitle}>{email || 'email@example.com'}</p>

                    <div className={styles.sidebarActions}>
                        <button className={styles.updatePasswordBtn} onClick={() => setIsModalOpen(true)}>
                            Update Password
                        </button>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <label style={{
                                cursor: 'pointer', textAlign: 'center', flex: 1,
                                backgroundColor: '#6366f1', color: 'white',
                                padding: '10px 14px', borderRadius: '12px',
                                fontSize: '13px', fontWeight: '600',
                                transition: 'background-color 0.2s',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
                            }}>
                                Update Photo
                                <input type="file" accept="image/jpeg, image/jpg" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                            </label>
                            {userPhoto && (
                                <button onClick={handlePhotoDelete} style={{
                                    flex: 1, backgroundColor: '#ef4444', color: 'white',
                                    padding: '10px 14px', borderRadius: '12px',
                                    fontSize: '13px', fontWeight: '600', border: 'none',
                                    cursor: 'pointer', transition: 'background-color 0.2s',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                                }}>
                                    Remove Photo
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Content - Sections */}
                <div className={styles.mainContent}>
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Personal Information</h3>
                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <label>Full Name</label>
                                <p>{full_name || 'N/A'}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Email Address</label>
                                <p>{email || 'N/A'}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Phone Number</label>
                                <p>{phone_number || 'N/A'}</p>
                            </div>
                            <div className={styles.infoItem}>
                                <label>Branch</label>
                                <p>{branch || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Profile Management</h3>
                        <div className={styles.profilesWrapper}>
                            <label>Current Profiles</label>
                            <div className={styles.profileTags}>
                                {profile_names && profile_names.length > 0 ? (
                                    profile_names.map((profile, index) => (
                                        <span key={index} className={styles.profileTag}>
                                            {profile}
                                            <button
                                                className={styles.deleteTagBtn}
                                                onClick={() => handleDeleteProfile(profile)}
                                                title="Delete profile"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className={styles.noData}>No profiles associated.</p>
                                )}
                            </div>

                            <div className={styles.appendBox}>
                                <label>Add New Profile</label>
                                <form className={styles.appendForm} onSubmit={handleAppendProfile}>
                                    <input
                                        type="text"
                                        placeholder="Enter profile name..."
                                        value={newProfileName}
                                        onChange={(e) => setNewProfileName(e.target.value)}
                                        disabled={isAppending}
                                    />
                                    <button type="submit" disabled={isAppending || !newProfileName.trim()}>
                                        {isAppending ? '...' : 'Append'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>WhatsApp Number Management</h3>
                        <div className={styles.profilesWrapper}>
                            <label>Current WhatsApp Numbers</label>
                            <div className={styles.profileTags}>
                                {userData?.whatsapp_numbers && userData.whatsapp_numbers.length > 0 ? (
                                    userData.whatsapp_numbers.map((whatsapp, index) => (
                                        <span key={index} className={styles.profileTag} style={{ color: '#0ea5e9', borderColor: '#bae6fd' }}>
                                            {whatsapp}
                                            <button
                                                className={styles.deleteTagBtn}
                                                onClick={() => handleDeleteWhatsapp(whatsapp)}
                                                title="Delete WhatsApp number"
                                                style={{ color: '#0284c7' }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e0f2fe'; e.currentTarget.style.color = '#0369a1'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0284c7'; }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className={styles.noData}>No WhatsApp numbers associated.</p>
                                )}
                            </div>

                            <div className={styles.appendBox} style={{ background: '#f0f9ff', borderColor: '#e0f2fe' }}>
                                <label style={{ color: '#0369a1' }}>Add New WhatsApp Number</label>
                                <form className={styles.appendForm} onSubmit={handleAppendWhatsapp}>
                                    <input
                                        type="number"
                                        placeholder="Enter WhatsApp number..."
                                        value={newWhatsapp}
                                        onChange={(e) => setNewWhatsapp(e.target.value)}
                                        disabled={isAppendingWhatsapp}
                                        style={{ borderColor: '#e0f2fe' }}
                                    />
                                    <button type="submit" disabled={isAppendingWhatsapp || !newWhatsapp.trim()} style={{ background: '#0ea5e9' }}>
                                        {isAppendingWhatsapp ? '...' : 'Append'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>WeChat Management</h3>
                        <div className={styles.profilesWrapper}>
                            <label>Current WeChats</label>
                            <div className={styles.profileTags}>
                                {userData?.we_chats && userData.we_chats.length > 0 ? (
                                    userData.we_chats.map((wechat, index) => (
                                        <span key={index} className={styles.profileTag} style={{ color: '#10b981', borderColor: '#a7f3d0' }}>
                                            {wechat}
                                            <button 
                                                className={styles.deleteTagBtn} 
                                                onClick={() => handleDeleteWeChat(wechat)}
                                                title="Delete WeChat"
                                                style={{ color: '#10b981' }}
                                                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#d1fae5'; e.currentTarget.style.color = '#047857'; }}
                                                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))
                                ) : (
                                    <p className={styles.noData}>No WeChats associated.</p>
                                )}
                            </div>

                            <div className={styles.appendBox} style={{ background: '#ecfdf5', borderColor: '#d1fae5' }}>
                                <label style={{ color: '#047857' }}>Add New WeChat</label>
                                <form className={styles.appendForm} onSubmit={handleAppendWeChat}>
                                    <input
                                        type="text"
                                        placeholder="Enter WeChat..."
                                        value={newWeChat}
                                        onChange={(e) => setNewWeChat(e.target.value)}
                                        disabled={isAppendingWeChat}
                                        style={{ borderColor: '#d1fae5' }}
                                    />
                                    <button type="submit" disabled={isAppendingWeChat || !newWeChat.trim()} style={{ background: '#10b981' }}>
                                        {isAppendingWeChat ? '...' : 'Append'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Security</h3>
                        <div className={styles.securityBox}>
                            <div className={styles.passwordDisplay}>
                                <label>Current Password</label>
                                <div className={styles.passwordField}>
                                    <span>{showPassword ? (userData?.password || "••••••••") : "••••••••"}</span>
                                    <button
                                        className={styles.eyeBtn}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <img src={showPassword ? closeeye : openeye} alt="Toggle" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalCard}>
                        <div className={styles.modalHeader}>
                            <h3>Change Password</h3>
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <form className={styles.modalForm} onSubmit={handleChangePassword}>
                            <div className={styles.modalInputGroup}>
                                <label>New Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password"
                                    value={passwordData.new}
                                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.modalInputGroup}>
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter new password again"
                                    value={passwordData.confirm}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    required
                                />
                            </div>
                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className={styles.submitBtn}>Update Password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profilepage;
