import React, { useState, useEffect } from "react";
import TextInput from "../Custom/TextInput";
import "./Editor.css";
import { selector_auto } from "./util";
import { base } from "../../proxy_url";
import MemoBill from "../MemoBill/MemoBill";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";
import CreditCardIcon from "@material-ui/icons/CreditCard";

const disabled = {
  order_form: ["id"],
  register_entry: ["id", "partial_amount", "gr_amount", "deduction", "status"],
  memo_entry: [
    "id",
    "supplier_id",
    "party_id",
    "amount",
    "gr_amount",
    "deduction",
  ],
};

export default function Editor({
  entity,
  setEntity,
  supplierNames,
  partyNames,
  selectedTable,
  setSelectedTable,
  setStatus,
}) {
  const handleDeleteEntity = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entity),
    };
    fetch(base + `/delete/${selectedTable.table}`, requestOptions)
      .then((response) => response.json())
      .then((data) => {
        setStatus(data);
      });
  };

  const handleUpdateEntity = () => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entity),
    };

    fetch(base + `/update/${selectedTable.table}`, requestOptions)
      .then((response) => response.json())
      .then((entity) => setStatus(entity));
  };

  return (
    <div>
      {Object.keys(entity).map((key) => {
        if (key === "supplier_id") {
          return selector_auto(
            supplierNames,
            entity,
            setEntity,
            key,
            selectedTable
          );
        }
        if (key === "party_id") {
          return selector_auto(
            partyNames,
            entity,
            setEntity,
            key,
            selectedTable
          );
        }

        if (key === "memo_bills") {
          return (
            <div className="bill_transactions">
              <MemoBill memo_bills={entity.memo_bills} />
            </div>
          );
        }

        // Handling the "payment" key
        if (
          key === "payment" &&
          Array.isArray(entity[key]) &&
          entity[key].length > 0
        ) {
          return (
            <div className="payment_info">
              <h4 style={{ marginBottom: "5px" }}>Payment Information:</h4>
              {entity[key].map((payment, idx) => (
                <div key={idx} class="bank_info">
                  <p>
                    <AccountBalanceIcon />
                    <b>Bank Name:</b> {payment.bank_name}
                  </p>
                  <p>
                    <CreditCardIcon />
                    <b>Cheque Number:</b> {payment.cheque_number}
                  </p>
                </div>
              ))}
            </div>
          );
        }

        return (
          <TextInput
            label={key.toUpperCase()}
            value={entity[key]}
            type={key === "register_date" ? "date" : null}
            disabled={
              Object.keys(disabled).includes(selectedTable.table) &&
              disabled[selectedTable.table].includes(key)
            }
            onChange={(e) => {
              const { value } = e.target;
              setEntity((old) => {
                return { ...old, [key]: value };
              });
            }}
          />
        );
      })}

      <div className="editor-buttons">
        {selectedTable.delete && (
          <button
            class="button"
            onClick={() => {
              handleDeleteEntity();
            }}
          >
            Delete
          </button>
        )}

        {selectedTable.update && (
          <button
            class="button"
            onClick={() => {
              handleUpdateEntity();
            }}
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
}
