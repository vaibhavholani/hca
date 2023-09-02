import React, { useState, useEffect } from "react";
import AutoComplete from "@material-ui/lab/Autocomplete";
import TextInput from "../Custom/TextInput";
import {
  setKeyBindsForInputElements,
  focusElementById,
  focusFirstInputElement
} from "../../hooks/keybind.js";

export function SelectTableFilter({
  selectedTable,
  setSelectedTable,
  setSelectedTableFilters,
  supplierNames,
  partyNames,
  handleTableSelectionClick,
  viewOptions,
}) {
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);

  const reset = () => {
    setSelectedSupplier(null);
    setSelectedParty(null);
  };

  useEffect(() => {
    focusFirstInputElement();
    reset();
  }, [selectedTable]);

  return (
    <>
      {viewOptions.length > 1 && (
        <AutoComplete
          id={"select_entity"}
          className="autocomplete"
          options={viewOptions}
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
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (selectedTable.supplier_party_filter) {
                document.getElementById("select_supplier").focus();
              } else {
                handleTableSelectionClick();
              }
            }
          }}
        />
      )}

      {selectedTable.supplier_party_filter ? (
        <>
          <AutoComplete
            id={"select_supplier"}
            className="autocomplete"
            value={selectedSupplier || {}}
            options={supplierNames}
            autoHighlight
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("select_party").focus();
              }
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
            autoHighlight
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleTableSelectionClick();
              }
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
      return "Date";
    }
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const generateLabel = (option) => {
    if (option.name) return option.name;

    let label = "";
    for (const key in option) {
      if (key.endsWith("_number")) {
        // Convert the key to the desired format
        label = `${
          key.split("_")[0].charAt(0).toUpperCase() + key.split("_")[0].slice(1)
        } No.: ${option[key]}`;
      }
    }
    // Check if register_date is available and append it
    if (option.register_date) {
      label += ` | Date: ${convertDate(option.register_date)}`;
    }

    // Return the generated label or a default label
    return label || "No Selection";
  };

  const reset = () => {
    setEntity({});
  };
  useEffect(() => {
    reset();
  }, [filters]);

  useEffect(() => {
    if (selectedTable && selectedTable.filters) {
      const newFilters = {};
      selectedTable.filters.forEach((filter) => {
        newFilters[filter.name] = "";
      });
      setFilters(newFilters);
    }
    setKeyBindsForInputElements("select-instance-filters");
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

  useEffect(() => {
    focusElementById("instance-filter-1");
  }, []);

  return (
    <div className={"select-instance-filters"}>
      {selectedTable &&
        selectedTable.filters &&
        selectedTable.filters.map((filter, index) => (
          <TextInput
            id={`instance-filter-${index + 1}`} // Adding the id property here
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
          return generateLabel(option);
        }}
        value={entity}
        autoHighlight
        onChange={(event, value) => {
          if (value === null) {
            setEntity({});
          } else {
            setEntity(value);
          }
        }}
        style={{ width: 300 }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleEntitySelectionClick();
          }
        }}
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
