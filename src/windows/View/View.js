import React, { useState, useEffect } from "react";
import Editor from "./Editor";
import Home from "../home/Home";
import "./View.css";
import { loadOptions, loadIndividuals } from "../../api_calls/loadData.js";
import { SelectTableFilter, SelectInstanceFilter } from "./Filter";
import { viewOptions } from "./options.js";
import Notification from "../Custom/Notification";

export default function View() {

  const [selectedTable, setSelectedTable] = useState({});
  const [selectedTableFilters, setSelectedTableFilters] = useState({});
  const [tableData, setTableData] = useState([]);

  const [entity, setEntity] = useState({});
  const [editorOpen, setEditorOpen] = useState(false);

  const [supplierNames, setSupplierNames] = useState([]);
  const [partyNames, setPartyNames] = useState([]);

  const [status, setStatus] = useState({
    status: "okay",
    message: "Deleted Successfully",
  });
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [initialRender, setInitialRender] = useState(true); // Add initialRender flag

  const reset = () => {
    setTableData([]);
    setEntity({});
    setEditorOpen(false);
  };

  const handleTableSelectionClick = () => {
    loadOptions(selectedTableFilters, setTableData);
  };

  const handleEntitySelectionClick = () => {
    // At this point entity has been selected, now creating deletion technique
    // if len entity is not empty then open editor

    if (Object.keys(entity).length !== 0) {
      setEditorOpen(true);
    }
  };

  useEffect(() => {
    loadIndividuals("Supplier", setSupplierNames);
    loadIndividuals("Party", setPartyNames);
  }, []);

  useEffect(() => {
    reset();
  }, [selectedTable, selectedTableFilters]);


  useEffect(()=> {
    if (Object.keys(entity).length === 0) {
      setEditorOpen(false);
    }
  }, [entity])

  return (
    <>
      <Home />
      <div class="entry_content">
        <div class="heading-box">
          <h2 style={{ all: "none" }}> View Menu</h2>
        </div>
        <div className="view-content">
          <div class="form-box">
            <SelectTableFilter
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              setSelectedTableFilters={setSelectedTableFilters}
              supplierNames={supplierNames}
              partyNames={partyNames}
              handleTableSelectionClick={handleTableSelectionClick}
              viewOptions={viewOptions}
            />
            {tableData.length > 0 && (
              <SelectInstanceFilter
                selectedTable={selectedTable}
                entity={entity}
                setEntity={setEntity}
                tableData={tableData}
                handleEntitySelectionClick={handleEntitySelectionClick}
              />
            )}
          </div>

          {editorOpen && (
            <div className="form-box">
              <Editor
                entity={entity}
                setEntity={setEntity}
                setEditorOpen={setEditorOpen}
                supplierNames={supplierNames}
                partyNames={partyNames}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                setStatus={setStatus}
              />
            </div>
          )}

        <Notification
                status={status}
                notificationOpen={notificationOpen}
                setNotificationOpen={setNotificationOpen}
                initialRender={initialRender}
                setInitialRender={setInitialRender}
                reset={reset}
              />
        </div>
      </div>
    </>
  );
}
