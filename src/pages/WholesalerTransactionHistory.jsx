import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';

function WholesalerTransactionHistory() {
  // --- STOCK DATA ---
  const [history] = useState([
    { id: 1, date: '2025-11-20', retailer: 'City Supermarket', items: '50x Apple Crates', amount: 2250.00, status: 'Completed' },
    { id: 2, date: '2025-11-18', retailer: 'Fresh Mart', items: '10x Potato Sacks', amount: 300.00, status: 'Completed' },
    { id: 3, date: '2025-11-15', retailer: 'Corner Store', items: '5x Milk Pallets', amount: 1000.00, status: 'Completed' },
  ]);

  return (
    <>
      <Container fluid className="p-5 mb-5 text-center text-white shadow-lg" style={{ background: 'linear-gradient(45deg, hsla(136, 61%, 43%, 1) 0%, hsla(136, 61%, 51%, 1) 100%)' }}>
        <h1 className="display-3 fw-bold">Transaction History</h1>
        <p className="lead fs-4">Ledger of completed wholesale deals.</p>
      </Container>

      <Container className="my-5">
        <div className="shadow-sm rounded border-0 overflow-hidden">
            <Table striped hover responsive className="mb-0 bg-white">
            <thead className="bg-dark text-white">
                <tr>
                <th className="py-3 ps-4">Date</th>
                <th className="py-3">Retailer</th>
                <th className="py-3">Details</th>
                <th className="py-3">Total Amount</th>
                <th className="py-3">Status</th>
                </tr>
            </thead>
            <tbody>
                {history.map((tx) => (
                <tr key={tx.id}>
                    <td className="ps-4 align-middle">{tx.date}</td>
                    <td className="fw-bold align-middle">{tx.retailer}</td>
                    <td className="align-middle">{tx.items}</td>
                    <td className="align-middle text-success fw-bold">${tx.amount.toFixed(2)}</td>
                    <td className="align-middle"><span className="badge bg-success">{tx.status}</span></td>
                </tr>
                ))}
            </tbody>
            </Table>
        </div>
      </Container>
    </>
  );
}

export default WholesalerTransactionHistory;