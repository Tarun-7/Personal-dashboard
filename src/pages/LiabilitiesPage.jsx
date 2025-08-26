import React, { useState } from "react";
import { IndianRupee, DollarSign, Euro, Download, Upload } from 'lucide-react';

const KPI_CARD_STYLE = {
  background: "#20232a",
  borderRadius: "12px",
  padding: "18px 32px",
  minWidth: "220px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};
const BUTTON_OUTLINE = {
  border: "1.5px solid #bfc0c2",
  background: "transparent",
  color: "#bfc0c2",
  borderRadius: "6px",
  padding: "8px 16px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 500,
  cursor: "pointer",
};

function LiabilitiesPage({
  currentBalance = 183934,
  initialBalance = 200000,
  loanStartDate = "1 Jan 2023",
  repaidAmount = 16066,
  balances = [],
  setBalances,
}) {
  const [activeTab, setActiveTab] = useState("Balances");

  // Currency switcher state for total liabilities display
  const [liabilityCurrency, setLiabilityCurrency] = useState("INR");

  // Form inputs for new balance
  const [inputDate, setInputDate] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [inputCurrency, setInputCurrency] = useState("USD");
  const [inputNote, setInputNote] = useState("");

  // Add new balance entry
  const handleAddBalance = () => {
    if (!inputDate || !inputValue) return;
    setBalances([
      {
        id: Date.now(),
        date: inputDate,
        value: parseFloat(inputValue),
        currency: inputCurrency,
        note: inputNote,
      },
      ...balances,
    ]);
    setInputDate("");
    setInputValue("");
    setInputCurrency("USD");
    setInputNote("");
  };

  // Delete balance entry
  const handleDelete = (id) => setBalances(balances.filter((b) => b.id !== id));

  // Format date to "dd MMM yyyy"
  const formatDate = (d) =>
    typeof d === "string"
      ? new Date(d).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "";

  return (
    <div
      style={{
        padding: 40,
        minHeight: "100vh",
        color: "#f4f4f6",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Total Debt Header */}
      <div
        style={{
          fontSize: "2rem",
          color: "#fc5858",
          margin: "24px 0 8px",
          fontWeight: 500,
          userSelect: "text",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        Debt: <span>${currentBalance.toLocaleString()}</span>

        {/* Currency Switcher & Icon */}
        <div className="flex items-center space-x-2 ml-4">
            <button
            onClick={() => setLiabilityCurrency(prev =>
                prev === 'INR' ? 'EUR' : prev === 'USD' ? 'INR' : 'USD'
            )}
            className="p-2 rounded-full hover:bg-gray-700"
            aria-label="Previous currency"
            >
            <span className="text-xl">{'‹'}</span>
            </button>
            <div
            className={`w-12 h-12 rounded-full flex items-center justify-center
                bg-gradient-to-br
                ${
                liabilityCurrency === 'INR'
                    ? 'from-blue-500 to-blue-600 ring-4 ring-blue-400'
                    : liabilityCurrency === 'USD'
                    ? 'from-yellow-400 to-yellow-500 ring-4 ring-yellow-300'
                    : 'from-green-400 to-green-600 ring-4 ring-green-300'
                }`}
            style={{ transition: 'background 0.3s' }}
            title={`Show in ${liabilityCurrency}`}
            >
            {liabilityCurrency === 'INR' && <IndianRupee className="w-8 h-8 text-white" />}
            {liabilityCurrency === 'USD' && <DollarSign className="w-8 h-8 text-white" />}
            {liabilityCurrency === 'EUR' && <Euro className="w-8 h-8 text-white" />}
            </div>
            <button
            onClick={() => setLiabilityCurrency(prev =>
                prev === 'INR' ? 'USD' : prev === 'USD' ? 'EUR' : 'INR'
            )}
            className="p-2 rounded-full hover:bg-gray-700"
            aria-label="Next currency"
            >
            <span className="text-xl">{'›'}</span>
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "flex", gap: 24, marginBottom: 22 }}>
        <div style={{ ...KPI_CARD_STYLE, borderLeft: "4px solid #fc5858" }}>
          <div style={{ color: "#bfc0c2" }}>Current balance</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#fc5858",
              userSelect: "text",
            }}
          >
            ${currentBalance.toLocaleString()}
          </div>
        </div>
        <div style={{ ...KPI_CARD_STYLE, borderLeft: "4px solid #fc5858" }}>
          <div style={{ color: "#bfc0c2" }}>Initial balance</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#fc5858",
              userSelect: "text",
            }}
          >
            ${initialBalance.toLocaleString()}
          </div>
        </div>
        <div style={KPI_CARD_STYLE}>
          <div style={{ color: "#bfc0c2" }}>Loan start date</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{loanStartDate}</div>
        </div>
        <div style={{ ...KPI_CARD_STYLE, borderLeft: "4px solid #33ec99" }}>
          <div style={{ color: "#bfc0c2" }}>Repaid amount</div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: "#33ec99",
              userSelect: "text",
            }}
          >
            ${repaidAmount.toLocaleString()}
          </div>
        </div>
      </div>


      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 36,
          borderBottom: "2px solid #323233",
          marginBottom: 18,
        }}
      >
        {["Overview", "Balances", "Documents"].map((tab) => (
          <div
            key={tab}
            style={{
              color: activeTab === tab ? "#1de9b6" : "#bfc0c2",
              borderBottom: activeTab === tab ? "3px solid #1de9b6" : "none",
              fontWeight: activeTab === tab ? 600 : 500,
              paddingBottom: 10,
              fontSize: "1rem",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* File Upload/Download Buttons (Balances tab) */}
      {activeTab === "Balances" && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 16,
            marginBottom: 8,
          }}
        >
          <button style={BUTTON_OUTLINE}>
            <Download size={16} />
            Download File
          </button>
          <button style={BUTTON_OUTLINE}>
            <Upload size={16} />
            Upload File
          </button>
        </div>
      )}

      {/* Tab contents */}
      {activeTab === "Balances" && (
        <div
          style={{
            background: "#20232a",
            borderRadius: 12,
            padding: "24px 0",
            marginTop: 8,
          }}
        >
          <table
            style={{
              width: "100%",
              color: "#f4f4f6",
              fontSize: "1rem",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ color: "#c1c3c7", borderBottom: "1px solid #2c3039" }}>
                <th style={{ padding: "14px 12px" }}></th>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Date</th>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Value</th>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Currency</th>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Note</th>
                <th style={{ padding: "14px 16px", textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Input row */}
              <tr
                style={{
                  backgroundColor: "#1b1c22",
                  borderBottom: "1px solid #2c3039",
                }}
              >
                <td style={{ padding: 12 }}>
                  <input type="checkbox" disabled />
                </td>
                <td style={{ padding: 16 }}>
                  <input
                    type="date"
                    value={inputDate}
                    onChange={(e) => setInputDate(e.target.value)}
                    style={{
                      background: "#131417",
                      border: "1px solid #2c3039",
                      borderRadius: 6,
                      color: "#f4f4f6",
                      padding: "8px 12px",
                      outline: "none",
                      width: "100%",
                    }}
                  />
                </td>
                <td style={{ padding: 16 }}>
                  <input
                    type="number"
                    placeholder="Value"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    style={{
                      background: "#131417",
                      border: "1px solid #2c3039",
                      borderRadius: 6,
                      color: "#f4f4f6",
                      padding: "8px 12px",
                      width: "100%",
                    }}
                  />
                </td>
                <td style={{ padding: 16 }}>
                  <select
                    value={inputCurrency}
                    onChange={(e) => setInputCurrency(e.target.value)}
                    style={{
                      background: "#131417",
                      border: "1px solid #2c3039",
                      borderRadius: 6,
                      color: "#f4f4f6",
                      padding: "8px 12px",
                      width: "100%",
                      cursor: "pointer",
                    }}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                  </select>
                </td>
                <td style={{ padding: 16 }}>
                  <input
                    placeholder="Note"
                    value={inputNote}
                    onChange={(e) => setInputNote(e.target.value)}
                    style={{
                      background: "#131417",
                      border: "1px solid #2c3039",
                      borderRadius: 6,
                      color: "#f4f4f6",
                      padding: "8px 12px",
                      width: "100%",
                    }}
                  />
                </td>
                <td style={{ padding: 16 }}>
                  <button
                    onClick={handleAddBalance}
                    style={{
                      background: "#354ff4",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 22px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    ENTER
                  </button>
                </td>
              </tr>

              {/* Existing balance rows */}
              {balances.map((b) => (
                <tr key={b.id} style={{ borderBottom: "1px solid #2c3039" }}>
                  <td style={{ padding: 12 }}>
                    <input type="checkbox" />
                  </td>
                  <td style={{ padding: 16, color: "#fff" }}>{formatDate(b.date)}</td>
                  <td style={{ padding: 16, color: "#fc5858" }}>
                    {b.currency}{" "}
                    {b.value.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td style={{ padding: 16, color: "#f4f4f6" }}>{b.currency}</td>
                  <td style={{ padding: 16, color: "#c1c3c7" }}>{b.note}</td>
                  <td
                    style={{
                      padding: 16,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <button
                      style={{
                        background: "#24273b",
                        border: "none",
                        borderRadius: "50%",
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                      title="Edit (not implemented)"
                    >
                      <span
                        role="img"
                        aria-label="edit"
                        style={{ color: "#32baf0", fontSize: 18 }}
                      >
                        ✏️
                      </span>
                    </button>
                    <button
                      style={{
                        background: "#24273b",
                        border: "none",
                        borderRadius: "50%",
                        width: 30,
                        height: 30,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        marginLeft: 4,
                      }}
                      onClick={() => handleDelete(b.id)}
                      title="Delete"
                    >
                      <span
                        role="img"
                        aria-label="delete"
                        style={{ color: "#fc5858", fontSize: 18 }}
                      >
                        🗑️
                      </span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === "Overview" && (
        <div
          style={{ padding: 38, color: "#a3a5a7", userSelect: "none" }}
          aria-label="performance chart area"
        >
          {/* Placeholder for chart */}
          <div
            style={{
              background:
                "linear-gradient(to top, #fc5858 40%, #20232a 100%)",
              borderRadius: 16,
              height: 300,
              margin: "0 0 20px 0",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                bottom: 20,
                left: 30,
                color: "#fff",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              Performance
            </span>
            {/* Add actual chart here */}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === "Documents" && (
        <div style={{ padding: 40, color: "#c1c3c7" }}>
          <span>Document management features coming soon.</span>
        </div>
      )}
    </div>
  );
}

export default LiabilitiesPage;
