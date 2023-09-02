import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";

import DeleteIcon from "@material-ui/icons/Delete";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextInput from "../Custom/TextInput";
import "./DataEntry.css";
import {
  setKeyBindsForInputElements,
  focusElementById,
} from "../../hooks/keybind.js";

export default function ItemEntry({
  entity,
  items,
  itemDialogBoxOpen,
  setItemDialogBoxOpen,
  addItemBackend,
  addItemEntryBackend,
  deleteItemEntry,
  rows,
  newRow,
  setNewRow,
  newItem,
  setNewItem,
  setStatus
}) {

  
  const updateNewRow = (field, value) => {
    setNewRow((prevState) => ({ ...prevState, [field]: value }));
  };

  const addNewRow = () => {
    const quantityInt = parseFloat(newRow.quantity);
    const rateInt = parseFloat(newRow.rate);
  
    if (
      newRow.item.id &&
      Number.isInteger(quantityInt) &&
      Number.isInteger(rateInt)
    ) {
      const newEntry = {
        register_entry_id: entity.id,
        item_id: newRow.item.id,
        quantity: newRow.quantity,
        rate: newRow.rate,
      };
      addItemEntryBackend(newEntry);
      focusElementById("item_selector");
    } else {
      setStatus({"status": "error", "message": "Quantity and Rate must be integers"});
    }
  };



  const deleteRow = (index) => {
    deleteItemEntry(rows[index]);
  };

  const handleNewItemChange = (field, value) => {
    setNewItem((prevState) => ({ ...prevState, [field]: value }));
  };

  const addItem = () => {
    if (newItem.name && newItem.color) {
      addItemBackend(newItem);
    }
  };

  useEffect(() => {
    if (itemDialogBoxOpen) {
      focusElementById("name");
    }
  }, [itemDialogBoxOpen]);

  useEffect(() => {
    setKeyBindsForInputElements();
    focusElementById("item_selector");
  }, []);

  return (
    <div class="form-box">
      <h2 style={{ all: "none" }}>
        {" "}
        Item Entry for Bill: {entity.bill_number}
      </h2>
      {/* Add Row Section */}
      <div>
        <div class="item-box">
          <Autocomplete
            style={{ width: 300 }}
            autoHighlight
            id="item_selector"
            options={items}
            getOptionLabel={(option) => option.name || ""}
            value={newRow.item}
            onChange={(event, newValue) => updateNewRow("item", newValue)} // store the entire item object
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                focusElementById("quantity");
              }
            }}
            renderInput={(params) => (
              <TextInput label={`Item`} props={params} />
            )}
          />
          <button class="button" onClick={() => setItemDialogBoxOpen(true)}>
            {" "}
            Add Item
          </button>
        </div>

        <TextInput
          label="Quantity"
          id="quantity"
          value={newRow.quantity}
          onChange={(e) => updateNewRow("quantity", e.target.value)}
        />
        <TextInput
          label="Rate"
          value={newRow.rate}
          onChange={(e) => updateNewRow("rate", e.target.value)}
          onKeyDown={
            (e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addNewRow();
              }
            }
          }
        />
        <button onClick={addNewRow} class="button">
          Add to Table
        </button>
      </div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            // Find the item name using the item_id
            const matchedItem = items.find((item) => item.id === row.item_id);
            const itemName = matchedItem ? matchedItem.name : "";
            return (
              <TableRow key={index}>
                <TableCell>{itemName}</TableCell>{" "}
                {/* display the matched item name */}
                <TableCell>{row.quantity}</TableCell>
                <TableCell>{row.rate}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => deleteRow(index)}
                    color="secondary"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Item itemDialogBoxOpen Box */}
      <Dialog
        open={itemDialogBoxOpen}
        onClose={() => setItemDialogBoxOpen(false)}
      >
        <DialogTitle>Add New Item</DialogTitle>
        <DialogContent>
          <TextInput
            label="Name"
            id="name"
            value={newItem.name}
            onChange={(e) => handleNewItemChange("name", e.target.value)}
            onKeyDown={
              (e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  focusElementById("color");
                }
              }
            }
          />
          <TextInput
            label="Color"
            id="color"
            value={newItem.color}
            onChange={(e) => handleNewItemChange("color", e.target.value)}
            onKeyDown={
              (e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addItem();
                }
              }
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={addItem} color="primary">
            Add
          </Button>
          <Button onClick={() => setItemDialogBoxOpen(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
