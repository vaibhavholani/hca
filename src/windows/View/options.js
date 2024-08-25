export const viewOptions = [
  {
    value: "Supplier",
    table: "supplier",
    filters: [{ name: "name", type: "str" }],
    delete: true,
    update: true,
  },
  {
    value: "Party",
    table: "party",
    filters: [{ name: "name", type: "str" }],
    delete: true,
    update: true,
  },
  {
    value: "Bank",
    table: "bank",
    filters: [{ name: "name", type: "str" }],
    delete: true,
    update: true,
  },
  {
    value: "Transport",
    table: "transport",
    filters: [{ name: "name", type: "str" }],
    delete: true,
    update: true,
  },
  {
    value: "Register Entry",
    table: "register_entry",
    supplier_party_filter: true,
    filters: [
      { name: "bill_number", type: "text" },
      { name: "register_date", type: "date" },
    ],
    delete: true,
    update: true,
  },
  {
    value: "Memo Entry",
    table: "memo_entry",
    supplier_party_filter: true,
    filters: [
      { name: "memo_number", type: "text" },
      { name: "register_date", type: "date" },
    ],
    delete: true,
    update: false,
  },
  {
    value: "Order Form",
    table: "order_form",
    supplier_party_filter: true,
    filters: [
      { name: "order_form_number", type: "text" },
      { name: "register_date", type: "date" },
    ],
    delete: true,
    update: true,
  },
];
