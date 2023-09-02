import React, {useEffect, useState} from "react";
import { SelectTableFilter, SelectInstanceFilter } from "../View/Filter";
import { loadOptions, loadIndividuals } from "../../api_calls/loadData.js";


const viewOptions = [
    {
        value: "Register Entry",
        table: "register_entry",
        supplier_party_filter: true,
        filters: [
          { name: "bill_number", type: "text" },
          { name: "register_date", type: "date" },
        ]
      },
]

export default function BillSelector({entity, setEntity, handleEntitySelectionClick}) {

  const [selectedTable, setSelectedTable] = useState(viewOptions[0]);
  const [selectedTableFilters, setSelectedTableFilters] = useState({ table_name: selectedTable.table });
  const [tableData, setTableData] = useState([]);

  const [supplierNames, setSupplierNames] = useState([]);
  const [partyNames, setPartyNames] = useState([]);

  useEffect(() => {
    loadIndividuals("Supplier", setSupplierNames);
    loadIndividuals("Party", setPartyNames);
  }, []);

   const handleTableSelectionClick = () => {
    loadOptions(selectedTableFilters, setTableData);
  };

  return (
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
    </div>
  );
}
