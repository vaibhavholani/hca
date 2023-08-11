export const view_options = [
  {
    value: "Supplier",
    table: "supplier",
    filters: [{ name: "name", type: "str" }],
  },
  { value: "Party", table: "party", filters: [{ name: "name", type: "str" }] },
  { value: "Bank", table: "bank", filters: [{ name: "name", type: "str" }] },
  {
    value: "Transport",
    table: "transport",
    filters: [{ name: "name", type: "str" }],
  },
  {
    value: "Register Entry",
    table: "register_entry",
    supplier_party_filter: true,
    filters: [
      { name: "bill_number", type: "text" },
      { name: "register_date", type: "date" },
    ],
  },
  {
    value: "Memo Entry",
    table: "memo_entry",
    supplier_party_filter: true,
    filters: [
      { name: "memo_number", type: "text" },
      { name: "register_date", type: "date" },
    ],
  },
];
