import React, { useState, useEffect } from "react";
import ItemEntry from "./ItemEntry";
import BillSelector from "./BillSelector";
import Notification from "../Custom/Notification";
import Home from "../home/Home";
import "./DataEntry.css";
import { loadOptions } from "../../api_calls/loadData.js";
import { addData } from "../../api_calls/addData.js";
import {deleteData} from "../../api_calls/deleteData.js";


const itemTemplate = {
  name: "",
  color: "N/A",
}

const itemEntryTemplate = {
  item: {},
  quantity: "",
  rate: "",
}


export default function DataEntry() {
  const [entity, setEntity] = useState({});
  const [items, setItems] = useState([]);
  const [itemEntryOpen, setItemEntryOpen] = useState(false);
  const [itemDialogBoxOpen, setItemDialogBoxOpen] = useState(false);

  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState(itemEntryTemplate);
  const [newItem, setNewItem] = useState(itemTemplate);


  const [status, setStatus] = useState({
    status: "okay",
    message: "Item Added",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true);

  const handleEntitySelectionClick = () => {
    // At this point entity has been selected, now creating deletion technique
    // if len entity is not empty then open editor
    if (Object.keys(entity).length !== 0) {
      setItemEntryOpen(true);
    }
  };

  const loadItems = () => {
    const itemFilters = {
      table_name: "item",
      supplier_id: entity.supplier_id,
    };
    loadOptions(itemFilters, setItems);
  };
  
  const loadItemEntries = () => {
    const itemEntryFilters = {
      table_name: "item_entry",
      register_entry_id: entity.id,
    };
    loadOptions(itemEntryFilters, setRows);
  };

  const deleteItemEntry = (itemEntry) => {
    deleteData(itemEntry, "item_entry", setStatus);
  };


  useEffect(() => {
    if (Object.keys(entity).length === 0) {
      setItemEntryOpen(false);
    } else {
      loadItems();
      loadItemEntries();
    }
  }, [entity]);

  const addItemBackend = (item) => {
    const requestData = {
      entity: "item",
      name: item.name,
      color: item.color,
      supplier_id: entity.supplier_id,
    };
    addData(requestData, setStatus);
  };

  const addItemEntryBackend = (itemEntry) => {
    const requestData = {
      entity: "item_entry",
      ...itemEntry,}
    addData(requestData, setStatus);
  };

  const reset_func = () => {
    loadItems();
    loadItemEntries();
    setNewItem(itemTemplate);
    setNewRow(itemEntryTemplate);
    setItemDialogBoxOpen(false);
  }

  return (
    <>
      <Home />
    <div class="entry_content">
      <div class="heading-box">
        <h2 style={{ all: "none" }}> Data Entry Menu</h2>
      </div>
      <div class="data-entry">
        <BillSelector
          entity={entity}
          setEntity={setEntity}
          handleEntitySelectionClick={handleEntitySelectionClick}
        />
        {itemEntryOpen && (
          <ItemEntry
            entity={entity}
            items={items}
            setItems={setItems}
            itemDialogBoxOpen={itemDialogBoxOpen}
            setItemDialogBoxOpen={setItemDialogBoxOpen}
            
            addItemBackend={addItemBackend}
            addItemEntryBackend={addItemEntryBackend}
            deleteItemEntry={deleteItemEntry}

            rows={rows}
            setRows={setRows}
            newRow={newRow}
            setNewRow={setNewRow}
            newItem={newItem}
            setNewItem={setNewItem}
          />
        )}
      </div>

      <Notification
        status={status}
        notificationOpen={notificationOpen}
        setNotificationOpen={setNotificationOpen}
        initialRender={initialRender}
        setInitialRender={setInitialRender}
        reset={reset_func}
      />
    </div>
    </>
  );
}
