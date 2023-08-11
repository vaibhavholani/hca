import React, { useState, useEffect } from "react";
import AutoComplete from "@material-ui/lab/Autocomplete";
import TextInput from "../Custom/TextInput";
import { view_options } from "./options.js";
import { getDate } from "../Date/Report_Date";

export function SelectTableFilter({
  selectedTable,
  setSelectedTable,
  setSelectedTableFilters,
  supplierNames,
  partyNames,
  handleTableSelectionClick,
}) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);

  const reset = () => {
    setSelectedSupplier(null);
    setSelectedParty(null);
  };

  useEffect(() => {
    reset();
  }, [selectedTable]);

  return (
    <>
      <AutoComplete
        id={"select_entity"}
        className="autocomplete"
        options={view_options}
        style={{ width: 300 }}
        getOptionLabel={(options) => options.value}
        onChange={(event, value) => {
          if (value === null) {
            setSelectedTable({});
          } else {
            setSelectedTable(value);
            setSelectedTableFilters({ table_name: value.table });
          }
        }}
        autoHighlight
        renderInput={(params) => (
          <TextInput label={`Select Entity`} props={params} />
        )}
      />
      {selectedTable.supplier_party_filter ? (
        <>
          <AutoComplete
            id={"select_supplier"}
            className="autocomplete"
            value={selectedSupplier || {}}
            options={supplierNames}
            style={{ width: 300 }}
            getOptionLabel={(options) => (options.name ? options.name : "")}
            onChange={(event, value) => {
              setSelectedSupplier(value);
              setSelectedTableFilters((old) => {
                if (value === null) {
                  const newFilters = { ...old };
                  delete newFilters.supplier_id;
                  return newFilters;
                } else {
                  return { ...old, supplier_id: value.id };
                }
              });
            }}
            renderInput={(params) => (
              <TextInput label={`Select Supplier`} props={params} />
            )}
          />
          <AutoComplete
            id={"select_party"}
            className="autocomplete"
            value={selectedParty || {}}
            options={partyNames}
            style={{ width: 300 }}
            getOptionLabel={(options) => (options.name ? options.name : "")}
            onChange={(event, value) => {
              setSelectedParty(value);
              setSelectedTableFilters((old) => {
                if (value === null) {
                  const newFilters = { ...old };
                  delete newFilters.party_id;
                  return newFilters;
                } else {
                  return { ...old, party_id: value.id };
                }
              });
            }}
            renderInput={(params) => (
              <TextInput label={`Select Party`} props={params} />
            )}
          />
        </>
      ) : null}
      <button class="button" onClick={handleTableSelectionClick}>
        {" "}
        Select{" "}
      </button>
    </>
  );
}

export function SelectInstanceFilter({
  selectedTable,
  tableData,
  entity,
  setEntity,
  handleEntitySelectionClick,
}) {
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  // Used to compare dates with YYYY-MM-DD to DD/MM/YYYY format
  const convertDate = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };
  
  const convertToDisplayFormat = (str) => {
    if (str === "register_date") {
      return "Date"
    }
    return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  };
  
  const reset = () => {
    setEntity({});
  };
  useEffect(() => {
    reset();
  }, [filters]);
  // connect it to getting complete entry from the backend
  // setup backend such that it sends a proper
  // error message when something is not editable and why
  // and there you go, that's your View feature Fully Upgraded and ready to go

  useEffect(() => {
    if (selectedTable && selectedTable.filters) {
      const newFilters = {};
      selectedTable.filters.forEach((filter) => {
        newFilters[filter.name] = "";
      });
      setFilters(newFilters);
    }
  }, [selectedTable]);

  useEffect(() => {
    let newData = [...tableData];
    for (const [key, value] of Object.entries(filters)) {
      newData = newData.filter((data) => {
        if (value === "") return true;
        switch (typeof data[key]) {
          case "string":
            if (key === "register_date") {
              return data[key] === value;
            }
            return data[key].toLowerCase().includes(value.toLowerCase());
          case "number":
            return data[key].toString().includes(value);
          default:
            return true;
        }
      });
    }
    setFilteredData(newData);
  }, [filters, tableData]);

  return (
    <div>
      {selectedTable &&
        selectedTable.filters &&
        selectedTable.filters.map((filter) => (
          <TextInput
            label={convertToDisplayFormat(filter.name)}
            type={filter.type}
            value={filters[filter.name]}
            onChange={(e) =>
              setFilters({ ...filters, [filter.name]: e.target.value })
            }
          />
        ))}
      <AutoComplete
        options={filteredData}
        getOptionLabel={(option) => {
          if (option.name) return option.name;
          if (option.bill_number)
            return `Bill No.: ${option.bill_number} | Date: ${convertDate(option.register_date)}`;
          if (option.memo_number)
            return `Memo No.: ${option.memo_number} | Date: ${convertDate(option.register_date)}`;
          return "No Selection";
        }}
        value={entity}
        onChange={(event, value) => {
          if (value === null) {
            setEntity({});
          } else {

            setEntity(value);
          }
        }}
        style={{ width: 300 }}
        renderInput={(params) => (
          <TextInput label={`Select Instance`} props={params} />
        )}
      />
      <button class="button" onClick={handleEntitySelectionClick}>
        {" "}
        Select{" "}
      </button>
    </div>
  );
}
