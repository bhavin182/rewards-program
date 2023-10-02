import React, { useEffect, useState } from 'react';

function calculateRewards(transactions) {
  const rewardsByCustomer = {};

  transactions.forEach((transaction) => {
    const { customer_id, customer_name, amount } = transaction;
    const points = (amount > 100 ? 2 * (amount - 100) : 0) + (amount > 50 ? 1 * (Math.min(amount, 100) - 50) : 0);

    if (!rewardsByCustomer[customer_id]) {
      rewardsByCustomer[customer_id] = { customer_name, total: 0, monthly: {} };
    }

    const month = new Date(transaction.transaction_date).toLocaleString('en-us', { month: 'long' });
    rewardsByCustomer[customer_id].total += points;
    rewardsByCustomer[customer_id].monthly[month] = (rewardsByCustomer[customer_id].monthly[month] || 0) + points;
  });

  return rewardsByCustomer;
}

function RewardCalculator() {
  const [transactions, setTransactions] = useState([]);
  const [rewardData, setRewardData] = useState({});
  const [monthColumns, setMonthColumns] = useState([])

  useEffect(() => {
    const months = new Set(); // To collect unique months
    fetch('/transactions.json')
      .then((response) => response.json())
      .then((data) => {
        setTransactions(data);
        setRewardData(calculateRewards(data));

        // Collect unique months from data
        data.forEach((transaction) => {
          const month = new Date(transaction.transaction_date).toLocaleString('en-us', { month: 'long' });
          months.add(month);
          setMonthColumns(Array.from(months));
        });
      })
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  return (
    <div className='container'>
      <h1>Reward Points Calculator</h1>
      <table className="customer-table">
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Total Points</th>
            {monthColumns.map((month) => (
              <th key={month}>{month}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Object.values(rewardData).map((customer) => (
            <tr key={customer.customer_id}>
              <td>{customer.customer_name}</td>
              <td>{customer.total}</td>
              {monthColumns.map((month) => (
                <td key={month}>{customer.monthly[month] || 0}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default RewardCalculator;
