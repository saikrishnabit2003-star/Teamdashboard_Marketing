import Style from './UserPage.module.css'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import amounticon from "../assets/amounticon.png";
import amounticon2 from "../assets/amount2.png";
import customericon from "../assets/customer_icon.png";
import customericon1 from "../assets/client_icon2.png";
import ordericon1 from "../assets/order_icon2.png";
import ordericon2 from "../assets/order_icon.png";
import pendingicon1 from "../assets/pendind_icon1.png";
import pendingicon2 from "../assets/pending_icon2.png";
import rejecticon1 from "../assets/reject_icon1.png";
import rejecticon2 from "../assets/reject_icon2.png"
import { BASE_URL } from '../config';

export function UserPage({ searchTerm }) {
    const navigate = useNavigate();

    const [totalamount, settotalamount] = useState(0)
    const [totalUsdAmount, setTotalUsdAmount] = useState(0)
    const [totalclient, settotalclient] = useState(0)
    const [totalOrders, setTotalOrders] = useState(0)
    const [totalOrdold, setTotalOrdold] = useState(0)
    const [pendingcount, setpendingcount] = useState(0)
    const [rejcount, settrejcount] = useState(0)
    const [table, settable] = useState([])
    const [ordersData, setOrdersData] = useState([])

    // percentage states
    const [amountPct, setAmountPct] = useState(0)
    const [clientPct, setClientPct] = useState(0)
    const [pendingPct, setPendingPct] = useState(0)
    const [rejPct, setRejPct] = useState(0)

    // per-client aggregated payment stats (Monthly - Row 2)
    const [monthAmount, setMonthAmount] = useState(0)
    const [monthClients, setMonthClients] = useState(0)
    const [monthOrders, setMonthOrders] = useState(0)
    const [monthOrdersOld, setMonthOrdersOld] = useState(0)
    const [monthPending, setMonthPending] = useState(0)
    const [monthRej, setMonthRej] = useState(0)

    // monthly percentage states
    const [monthAmountPct, setMonthAmountPct] = useState(0)
    const [monthClientPct, setMonthClientPct] = useState(0)
    const [monthPendingPct, setMonthPendingPct] = useState(0)
    const [monthRejPct, setMonthRejPct] = useState(0)

    // user info
    const [userInfo, setUserInfo] = useState({ full_name: '', role: '' })

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}--${year}`;
        } catch (error) {
            return 'N/A';
        }
    };

    // rawData is now driven from API (country_split); kept as state
    const [rawData, setRawData] = useState([]);

    // const COLORS = ['#f14337', '#7300b5', '#a5224e', '#3ac982', '#0964da', '#076c79', '#6591e4', '#a89a15', '#074279', '#66468f', '#a8157c', '#074279', '#0c9287'];
    const COLORS = [
        '#FF6B6B', // red
        '#4ECDC4', // teal
        '#45B7D1', // blue
        '#FFA726', // orange
        '#AB47BC', // purple
        '#66BB6A', // green
        '#EF5350', // soft red
        '#29B6F6', // light blue
        '#FFCA28', // yellow
        '#7E57C2', // violet
        '#26A69A', // aqua
        '#EC407A', // pink
        '#5C6BC0', // indigo
        '#8D6E63', // brown
        '#26C6DA', // cyan
        '#9CCC65', // lime green
        '#FF7043', // deep orange
        '#D4E157', // lime
        '#42A5F5', // bright blue
        '#EC7063', // salmon
        '#AF7AC5', // lavender
        '#48C9B0', // mint
        '#F5B041', // amber
        '#5DADE2', // sky blue
        '#58D68D', // emerald
        '#F1948A', // rose
        '#BB8FCE', // soft purple
        '#73C6B6', // sea green
        '#F7DC6F', // gold
        '#85929E'  // gray
    ];
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [pieData, setPieData] = useState([]);
    const [isDateFilterActive, setIsDateFilterActive] = useState(false);

    const onChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    // Function to aggregate paid amount by country from client list
    const aggregateFromClients = (clientsList) => {
        const countryAmount = {}; // country -> sum of paid_amount

        clientsList.forEach(c => {
            const country = c.country || c.client_country || 'Unknown';
            const paidAmount = Number(c.paid_amount) || 0;

            if (!countryAmount[country]) {
                countryAmount[country] = 0;
            }
            countryAmount[country] += paidAmount;
        });

        return Object.keys(countryAmount)
            .map(name => ({
                name,
                value: Math.round(countryAmount[name] * 100) / 100
            }))
            .filter(item => item.value > 0);
    };

    // Fetch GET method
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${BASE_URL}/users/me/details`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data)
                    if (data.status_code === 401) {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user_role');
                        window.location.reload();
                        return;
                    }
                    const d = data?.data;
                    if (!d) return;

                    // user info
                    setUserInfo({ full_name: d.full_name || '', role: d.role || '' });
                    if (d.role) {
                        localStorage.setItem('user_role', d.role);
                    }

                    // clients table (Source of truth for reactive stats)
                    const clients = d.country_based_details || [];
                    settable(clients);
                    console.log("clients", clients)
                    const clientdetail = d.order_status_details || [];
                    setOrdersData(clientdetail);
                    // Overall analysis can be calculated here or reactively. 
                    // Let's keep it here for simplicity since it's "static" overall data.
                    const overallAmt = clientdetail.reduce((s, c) => s + (c.paid_amount || 0), 0);
                    const totalClt = new Set(clientdetail.map(c => c.client_id)).size;
                    const totalOrd = clientdetail.filter(c => c.is_new_order.toLowerCase() === "yes").length;
                    const totalOrdold = clientdetail.filter(c => c.is_new_order.toLowerCase() === "no").length;
                    const pendingClt = clientdetail.filter(c => {
                        const status = (c.payment_status || "").toLowerCase();
                        //  return status === "pending" || status === "partial paid" || status === "not yet" && (c.paid_amount < c.total_amount) && c.order_status.toLowerCase() !== "inactive";
                        return status === "pending" && (c.paid_amount <= c.total_amount) && c.order_status.toLowerCase() !== "inactive";
                    }).length;
                    const partialClt = clientdetail.filter(c => {
                        const status = (c.order_status || "").toLowerCase();
                        return status === "inactive";
                    }).length;

                    settotalamount(overallAmt);
                    settotalclient(totalClt);
                    setTotalOrders(totalOrd);
                    setTotalOrdold(totalOrdold);
                    setpendingcount(pendingClt);
                    settrejcount(partialClt);

                    const pPct = totalOrd > 0 ? (pendingClt / totalOrd) * 100 : 0;
                    const rPct = totalOrd > 0 ? (partialClt / totalOrd) * 100 : 0;

                    setAmountPct(100);
                    setClientPct(100);
                    setPendingPct(pPct.toFixed(1));
                    setRejPct(rPct.toFixed(1));

                    // Store raw country data from API for default pie view
                    const countrySplit = d.country_split || {};
                    const countryData = Object.entries(countrySplit).map(([name, value]) => ({ name, value }));
                    setRawData(countryData);

                    // // Convert all country_split amounts to USD and set total
                    // const usdTotal = convertCountrySplitToUSD(countrySplit);
                    // setTotalUsdAmount(usdTotal);
                })
                .catch(error => console.error(error));
        }
    }, []);

    // Reactive filtering logic for specialized analysis and Pie Chart
    useEffect(() => {
        let filteredList = [];

        if (isDateFilterActive && startDate && endDate) {
            // Filter by selected range
            const startOfDay = new Date(startDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);

            filteredList = ordersData.filter(c => {
                const dateStr = c.created_at;
                if (!dateStr) return false;
                const itemDate = new Date(dateStr);
                return itemDate >= startOfDay && itemDate <= endOfDay;
            });

            // Update Pie Chart from filtered items
            setPieData(aggregateFromClients(filteredList));
        } else {
            // Default: Filter by current month
            const now = new Date();
            const curMonth = now.getMonth();
            const curYear = now.getFullYear();

            filteredList = ordersData.filter(c => {
                const dateStr =  c.created_at;
                if (!dateStr) return false;
                const d = new Date(dateStr);
                return d.getMonth() === curMonth && d.getFullYear() === curYear;
            });

            // Pie Chart default: Use aggregated orders (Overall) to ensure unique client counts match totalclient
            setPieData(aggregateFromClients(ordersData));
        }

        // Calculate stats for the filtered list
        const mAmount = filteredList.reduce((s, c) => s + (c.paid_amount || 0), 0);
        const mTotal = new Set(filteredList.map(c => c.client_id)).size;
        const mTotalOrders = filteredList.filter(c => c.is_new_order.toLowerCase() === "yes").length;
        const mTotalOrdersOld = filteredList.filter(c => c.is_new_order.toLowerCase() === "no").length;
        const mPendingCount = filteredList.filter(c => {
            const status = (c.payment_status || "").toLowerCase();
            // return status === "pending" || status === "partial paid" || status === "not yet" && (c.paid_amount < c.total_amount) && c.order_status.toLowerCase() !== "inactive";
              return status === "pending" && (c.paid_amount <= c.total_amount) && c.order_status.toLowerCase() !== "inactive";
        }).length;
        const mRejCount = filteredList.filter(c => {
            const status = (c.order_status || "").toLowerCase();
            return status === "inactive";
        }).length;

        setMonthAmount(mAmount);
        setMonthClients(mTotal);
        setMonthOrders(mTotalOrders);
        setMonthOrdersOld(mTotalOrdersOld);
        setMonthPending(mPendingCount);
        setMonthRej(mRejCount);

        const mPPct = mTotalOrders > 0 ? (mPendingCount / mTotalOrders) * 100 : 0;
        const mRPct = mTotalOrders > 0 ? (mRejCount / mTotalOrders) * 100 : 0;

        setMonthAmountPct(100);
        setMonthClientPct(100);
        setMonthPendingPct(mPPct.toFixed(1));
        setMonthRejPct(mRPct.toFixed(1));

    }, [ordersData, isDateFilterActive, startDate, endDate, rawData]);

    return (
        <div className={Style.contentpage}>

            {/* analysis data */}
            <div className={Style.analysiscontainer}>
                {userInfo.role === 'admin' && (
                    <div id={Style.overalldetails}>
                        <p className={Style.overalldetailstitle}>overall analysis</p>
                        <div className={Style.container2}>

                            <div id={Style.amountcontainer} onDoubleClick={() => navigate('/history')} style={{ cursor: 'pointer' }}>
                                <div id={Style.analaysisimg1}>
                                    <img src={amounticon} alt="" />
                                </div>
                                <div id={Style.analaysistext}>
                                    {/* <p title=" Converted from country_split values to USD\>${totalUsdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p> */}
                                    <p>$ {Math.round(totalamount * 100) / 100}</p>
                                    <p>overall paid amount</p>
                                </div>
                            </div>

                            <div id={Style.amountcontainer}>
                                <div id={Style.analaysisimg2}>
                                    {/* <h1>{clientPct}%</h1> */}
                                    <img src={customericon} alt="" />
                                </div>
                                <div id={Style.analaysistext}>
                                    <p>{totalclient}</p>
                                    <p>overall Clients</p>
                                </div>
                            </div>
                            <div id={Style.amountcontainer}>
                                <div id={Style.analaysisimg5}>
                                    {/* <h1>{clientPct}%</h1> */}
                                    <img src={ordericon1} alt="" />
                                </div>
                                <div id={Style.analaysistext2}>
                                    <p><span id={Style.analaysisspan}>new:</span>{totalOrders}</p>
                                    <p><span id={Style.analaysisspan}>old:</span>{totalOrdold}</p>
                                    <p id={Style.analaysistotal}><span id={Style.analaysisspan}>ord:</span>{totalOrders + totalOrdold}</p>
                                </div>
                            </div>

                            <div id={Style.amountcontainer} onDoubleClick={() => navigate('/amounttable')} style={{ cursor: 'pointer' }}>
                                <div id={Style.analaysisimg3}>
                                    <img src={pendingicon1} alt="" />
                                </div>
                                <div id={Style.analaysistext}>
                                    <p>{pendingcount}</p>
                                    <p>Payment Pending count</p>
                                </div>
                            </div>

                            <div id={Style.amountcontainer}>
                                <div id={Style.analaysisimg4}>
                                    <img src={rejecticon1} alt="" />
                                </div>
                                <div id={Style.analaysistext}>
                                    <p>{rejcount}</p>
                                    <p>Clients Rejected count</p>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                <div id={Style.overalldetails}>
                    <p className={Style.overalldetailstitle}>{isDateFilterActive ? 'analysis (selected range)' : 'analysis (current month)'}</p>
                    <div className={Style.container2}>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg12}>
                                <img src={amounticon2} alt="" />
                            </div>
                            <div id={Style.analaysistext}>
                                <p>$ {Math.round(monthAmount * 100) / 100}</p>
                                <p>total paid amount</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg22}>
                                {/* <h1>{monthClientPct}%</h1> */}
                                <img src={customericon1} alt="" />
                            </div>
                            <div id={Style.analaysistext}>
                                <p>{monthClients}</p>
                                <p>Total Clients</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg25}>
                                {/* <h1>{monthClientPct}%</h1> */}
                                <img src={ordericon2} alt="" />
                            </div>
                            <div id={Style.analaysistext2}>
                                <p><span id={Style.analaysisspan}>new:</span>{monthOrders}</p>
                                <p><span id={Style.analaysisspan}>old:</span>{monthOrdersOld}</p>
                                <p id={Style.analaysistotal}><span id={Style.analaysisspan}>ord:</span>{monthOrders + monthOrdersOld}</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg32}>
                                <img src={pendingicon2} alt="" />
                            </div>
                            <div id={Style.analaysistext}>
                                <p>{monthPending}</p>
                                <p>Payment Pending count</p>
                            </div>
                        </div>

                        <div id={Style.amountcontainer}>
                            <div id={Style.analaysisimg42}>
                                <img src={rejecticon2} alt="" />
                            </div>
                            <div id={Style.analaysistext}>
                                <p>{monthRej}</p>
                                <p>Clients Rejected count</p>
                            </div>
                        </div>

                    </div>
                </div>

                <div className={Style.container3}>
                    {/* box 1 */}
                    <div id={Style.box1}>
                        <h3>Select Date Range
                            <input
                                type="checkbox"
                                className={Style.calendercheckbox}
                                checked={isDateFilterActive}
                                onChange={(e) => setIsDateFilterActive(e.target.checked)}
                            />
                        </h3>
                        <DatePicker
                            selected={startDate}
                            onChange={onChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                            className={Style.fullCalendar}
                        />
                        {/* {startDate && endDate && (
                            <p>Selected Range: {formatDate(startDate)} - {formatDate(endDate)}</p>
                        )} */}
                    </div>

                    {/* box 2 */}
                    <div id={Style.box2}>

                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart style={{ outline: 'none' }}>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={110}
                                    outerRadius={160}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={0}
                                    animationDuration={1500}
                                    label={({ name, percent }) => percent > 0 ? `${name} (${(percent * 100).toFixed(1)}%)` : ''}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))', outline: 'none' }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: 'none',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                        padding: '12px 16px',
                                        fontSize: '14px',
                                        fontWeight: '600'
                                    }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: '500' }}
                                />
                                {/* Center Label */}
                                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '24px', fontWeight: '700', fill: 'var(--navy)' }}>
                                    {isDateFilterActive ? monthClients : totalclient}
                                </text>
                                <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '12px', fontWeight: '500', fill: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {isDateFilterActive ? 'Filtered Clients' : 'Total Clients'}
                                </text>
                            </PieChart>
                        </ResponsiveContainer>

                    </div>
                </div>

                {/* container 5 */}
                <div className={Style.tablecontainer}>
                    <div id={Style.tableheader}><p>Country-Wise Status Report</p></div>
                    <div className={Style.tablecontainerdata}>
                        <table className={Style.tabledata}>
                            <thead>
                                <tr>
                                    <th>S.no</th>
                                    <th>Country</th>
                                    <th>Total Clients</th>
                                    <th>Total Orders</th>
                                    <th>Paid count</th>
                                    <th>Pending count</th>
                                    <th>Rejected count</th>
                                    {/* <th>Paid amount</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {table
                                    .filter(item => {
                                        if (!searchTerm) return true;
                                        return Object.values(item).some(val =>
                                            String(val).toLowerCase().includes(searchTerm.toLowerCase())
                                        );
                                    })
                                    .map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.country_name}</td>
                                            <td>{item.client_count}</td>
                                            <td>{item.order_count}</td>
                                            <td>{item.paid_count}</td>
                                            <td>{item.pending_count}</td>
                                            <td>{item.reject_count}</td>
                                            {/* <td>{item.paid_amount}</td> */}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

