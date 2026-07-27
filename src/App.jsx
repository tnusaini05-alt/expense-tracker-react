import { useState, useEffect } from "react";
import "./App.css";

import { Pie ,Bar} from "react-chartjs-2";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
   CategoryScale,
  LinearScale,
  BarElement
);

function App() {
  const [budget, setBudget] = useState("");
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const [transactions, setTransactions] = useState(() => {
    const savedData = localStorage.getItem("transactions");
    return savedData ? JSON.parse(savedData) : [];
  });

  useEffect(() => {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !title ||
      !amount ||
      !type ||
      !category ||
      !date
    ) {
      alert("Please fill all fields");
      return;
    }

    if (editId) {
      setTransactions(
        transactions.map((item) =>
          item.id === editId
            ? {
                ...item,
                title,
                amount: Number(amount),
                type,
                category,
                date,
              }
            : item
        )
      );

      setEditId(null);
    } else {
      const newTransaction = {
        id: Date.now(),
        title,
        amount: Number(amount),
        type,
        category,
        date,
      };

      setTransactions([
        ...transactions,
        newTransaction,
      ]);
    }

    setTitle("");
    setAmount("");
    setType("");
    setCategory("");
    setDate("");
  };

  const deleteTransaction = (id) => {
    setTransactions(
      transactions.filter(
        (item) => item.id !== id
      )
    );
  };

  const editTransaction = (item) => {
    setTitle(item.title);
    setAmount(item.amount);
    setCategory(item.category);
    setType(item.type);
    setDate(item.date);

    setEditId(item.id);
  };

  const clearAllTransactions = () => {
    if (
      window.confirm(
        "Delete all transactions?"
      )
    ) {
      setTransactions([]);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Title",
      "Amount",
      "Category",
      "Date",
      "Type",
    ];

    const rows = transactions.map(
      (item) => [
        item.title,
        item.amount,
        item.category,
        item.date,
        item.type,
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(
      [csvContent],
      { type: "text/csv" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;
    a.download = "transactions.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  const income = transactions
    .filter(
      (item) => item.type === "Income"
    )
    .reduce(
      (total, item) =>
        total + item.amount,
      0
    );

  const expense = transactions
    .filter(
      (item) => item.type === "Expense"
    )
    .reduce(
      (total, item) =>
        total + item.amount,
      0
    );

  const balance = income - expense;
  const budgetExceeded =
  budget && expense > Number(budget);
  const totalTransactions = transactions.length;

const thisMonth = new Date().getMonth();

const monthlyExpense = transactions
  .filter(
    (item) =>
      item.type === "Expense" &&
      new Date(item.date).getMonth() === thisMonth
  )
  .reduce(
    (total, item) => total + item.amount,
    0
  );

  const categoryData = {};

  transactions.forEach((item) => {
    if (item.type === "Expense") {
      categoryData[item.category] =
        (categoryData[item.category] || 0) +
        item.amount;
    }
  });

  const chartData = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: "Expenses",
        data: Object.values(categoryData),
      },
    ],
  };
  const barData = {
  labels: Object.keys(categoryData),
  datasets: [
    {
      label: "Expense Amount",
      data: Object.values(categoryData),
    },
  ],
};
    return (
    <div className={`container ${darkMode ? "dark" : ""}`}>
      <h1>💰 Expense Tracker</h1>

      <button
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode
          ? "☀️ Light Mode"
          : "🌙 Dark Mode"}
      </button>

      <p className="subtitle">
        React Expense Tracker Dashboard
      </p>
      <div className="card">
  <h3>Total Transactions</h3>
  <h2>{totalTransactions}</h2>
</div>

<div className="card">
  <h3>This Month Expense</h3>
  <h2>${monthlyExpense}</h2>
</div>

      <div className="dashboard">
        <div className="card">
          <h3>Balance</h3>
          <h2>${balance}</h2>
        </div>

        <div className="card">
          <h3>Income</h3>
          <h2>${income}</h2>
        </div>

        <div className="card">
          <h3>Expense</h3>
          <h2>${expense}</h2>
        </div>
      </div>

      <div className="form-section">
        <h2>Add Transaction</h2>
       
        <input
  type="number"
  placeholder="Set Monthly Budget"
  value={budget}
  onChange={(e) => setBudget(e.target.value)}
/>
{budgetExceeded && (
  <div
    style={{
      background: "#ffdddd",
      color: "red",
      padding: "10px",
      margin: "15px 0",
      borderRadius: "8px",
      fontWeight: "bold",
    }}
  >
    ⚠️ Budget Limit Exceeded!
  </div>
)}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Transaction Name"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
          >
            <option value="">
              Select Category
            </option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">
              Shopping
            </option>
            <option value="Bills">Bills</option>
            <option value="Education">
              Education
            </option>
            <option value="Other">Other</option>
          </select>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
          >
            <option value="">
              Select Type
            </option>
            <option value="Income">
              Income
            </option>
            <option value="Expense">
              Expense
            </option>
          </select>

          <button type="submit">
            {editId
              ? "Update Transaction"
              : "Add Transaction"}
          </button>
        </form>
      </div>

      <div className="form-section">
        <h2>Transactions</h2>

        <button onClick={clearAllTransactions}>
          Clear All
        </button>

        <button onClick={exportCSV}>
          Export CSV
        </button>

        <input
          type="text"
          placeholder="Search Transaction..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          transactions
            .filter((item) =>
              item.title
                .toLowerCase()
                .includes(
                  search.toLowerCase()
                )
            )
            .map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "12px",
                  margin: "10px 0",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                }}
              >
                <p>
                  <strong>
                    {item.title}
                  </strong>
                  {" - $"}
                  {item.amount}
                </p>

                <p>
                  {item.category} |{" "}
                  {item.date} |{" "}
                  {item.type}
                </p>

                <button
                  onClick={() =>
                    editTransaction(item)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteTransaction(
                      item.id
                    )
                  }
                >
                  Delete
                </button>
              </div>
            ))
        )}
      </div>

      <div className="form-section">
        <h2>Expense Analytics</h2>

        {Object.keys(categoryData)
          .length > 0 ? (
          <div
            style={{
              maxWidth: "400px",
              margin: "auto",
            }}
          >
            <Pie data={chartData} />
            <div
  style={{
    maxWidth: "600px",
    margin: "40px auto",
  }}
>
  <Bar data={barData} />
</div>
          </div>
        ) : (
          <p>
            Add expense transactions
            to view chart.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;