import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Clock, X } from 'lucide-react';
import { BASE_URL } from '../config';
import styles from './HistoryContextMenu.module.css';

export default function HistoryContextMenu({ collection, documentId, fieldName, position, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${BASE_URL}/history/${collection}/${documentId}/${fieldName}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(`collection : ${collection},\n documentId : ${documentId},\n fieldName : ${fieldName}`)
        console.log(response.data.data);
        setHistory(response.data.data);
      } catch (err) {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    
    if (collection && documentId && fieldName) {
      fetchHistory();
    }
  }, [collection, documentId, fieldName]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!position) return null;

  let left = position.x;
  let top = position.y;
  
  // The context menu has a width of 300px based on CSS
  if (left + 300 > window.innerWidth) {
    left = window.innerWidth - 320; // Keep it on screen with a small margin
  }
  
  // The context menu has a max height of 400px based on CSS
  if (top + 400 > window.innerHeight) {
    top = window.innerHeight - 420;
  }

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{ top, left }}
    >
      <div className={styles.header}>
        <h4><Clock size={16} className={styles.icon}/> Edit History</h4>
        <button onClick={onClose} className={styles.closeBtn}><X size={16} /></button>
      </div>
      <div className={styles.content}>
        {loading ? (
          <p className={styles.loading}>Loading history...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : history.length === 0 ? (
          <p className={styles.empty}>No edits found for this field.</p>
        ) : (
          <ul className={styles.timeline}>
            {history.map((item, idx) => (
              <li key={idx} className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineContent}>
                  <p className={styles.editedBy}><strong>{item.edited_by}</strong></p>
                  <p className={styles.changeText}>
                    Changed to <span className={styles.newValue}>"{
                      (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(String(item.new_value)) || /^\d{4}-\d{2}-\d{2}$/.test(String(item.new_value))) && !isNaN(new Date(String(item.new_value)).getTime()) 
                        ? format(new Date(String(item.new_value)), "dd-MM-yyyy") 
                        : String(item.new_value)
                    }"</span>
                    {item.old_value !== undefined && item.old_value !== null && (
                       <span> <br />(was <span className={styles.oldValue}>"{
                         (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(String(item.old_value)) || /^\d{4}-\d{2}-\d{2}$/.test(String(item.old_value))) && !isNaN(new Date(String(item.old_value)).getTime()) 
                           ? format(new Date(String(item.old_value)), "dd-MM-yyyy") 
                           : String(item.old_value)
                       }"</span>)</span>
                    )}
                  </p>
                  <p className={styles.time}>
                    {format(
                      new Date(
                        item.edited_at.includes('Z') || item.edited_at.includes('+')
                          ? item.edited_at
                          : item.edited_at.replace(' ', 'T') + 'Z'
                      ), 
                      "dd-MM-yyyy hh:mm a"
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
