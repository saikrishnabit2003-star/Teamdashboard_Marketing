import React, { useState, useEffect } from 'react';
import Style from './Loginpage2.module.css';
import closeeye from '../assets/closeeye.png'
import openeye from '../assets/openeye.png'
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';


const Loginpage2 = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpverify, setotpverify] = useState(false)
  const [otp, setOtp] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });

  const showNotification = (message, type) => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const requestdata = {
      email: email,
      password: password,
    }
    setLoginLoading(true);
    fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"

      },
      body: JSON.stringify(requestdata)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data?.status_code === 200) {
          setotpverify(data.data.otp_required);
          if (data.data.otp_required === false) {
            localStorage.setItem('token', data.data.access_token);
            showNotification("Login successful", "success");
            setTimeout(() => navigate('/dashboard'), 1000);
          } else {
            showNotification("OTP Sent to Email", "success");
          }
        } else {
          showNotification(data.message || "Login failed", "error");
        }
      })
      .catch(error => {
        console.error(error);
        showNotification("Connection error", "error");
      })
      .finally(() => setLoginLoading(false));
    console.log("request", requestdata);
  };

  const handleOtp = (e) => {
    e.preventDefault();
    const requestdata = {
      email: email,
      otp: otp,
    }
    setOtpLoading(true);
    // Add real auth logic here if needed
    fetch(`${BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestdata)
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        if (data?.status_code === 200) {
          setotpverify(data.data.otp_required);
          localStorage.setItem('token', data.data.access_token);
          showNotification("Verification successful", "success");
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          showNotification(data.message || "Invalid OTP", "error");
        }
      })
      .catch(error => {
        console.error(error);
        showNotification("Connection error", "error");
      })
      .finally(() => setOtpLoading(false));
    console.log("request", requestdata);
  };
  return (
    <div className={Style.loginPage}>
      {notification.visible && (
        <div className={`${Style.notification} ${Style[notification.type]}`}>
          <div className={Style.notificationIcon}>
            {notification.type === 'success' ? '✓' : '✕'}
          </div>
          <p>{notification.message}</p>
        </div>
      )}
      <div id={Style.logincontainer}>

        <div className={Style.gifcontainer}>
          <DotLottieReact
            src="https://lottie.host/7127a37d-ec22-4948-8d3b-6040673b3525/BD4Y7HI4A2.lottie"
            loop
            autoplay
          />
        </div>
        {otpverify ? (
          <div className={Style.loginCard}>

            <h2>OTP verification</h2>

            <form className={Style.form} onSubmit={handleOtp}>
              <div className={Style.inputGroup}>

                <input type="text" placeholder="Enter your OTP" onChange={(e) => setOtp(e.target.value)} />
              </div>

              <button type="submit" className={Style.loginBtn} disabled={otpLoading}>
                {otpLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{
                      width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                      borderTop: '2px solid #fff', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite'
                    }} />
                    Verifying...
                  </span>
                ) : 'Verify'}
              </button>
            </form>
          </div>
        ) : (
          <div className={Style.loginCard}>

            <h2>Login to dashboard</h2>

            <form className={Style.form} onSubmit={handleLogin}>
              <div className={Style.inputGroup}>
                <label htmlFor="Email Id"></label>
                <input type="text" placeholder="Email Id" onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className={Style.inputGroup}>
                <label htmlFor="password"></label>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="**********"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className={Style.toggleBtn}
                  onClick={() => setShowPassword(prev => !prev)}
                >
                  {showPassword ? <img src={closeeye} alt="Hide" /> : <img src={openeye} alt="Show" />}
                </button>
              </div>

              <button type="submit" className={Style.loginBtn} disabled={loginLoading}>
                {loginLoading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{
                      width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.4)',
                      borderTop: '2px solid #fff', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.7s linear infinite'
                    }} />
                    please wait....
                  </span>
                ) : 'sign in'}
              </button>
            </form>
          </div>
        )
        }
      </div>

      {/* gif conatiner */}

    </div>
  );
};

export default Loginpage2;