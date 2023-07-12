// import './App.css';
import { jsPDF } from "jspdf";
import { autoTable } from 'jspdf-autotable';

//notes for allowing certain special rows to be added before data rows too:
    //make use of the "beforeData" key in the special row entries
    //when processing special rows (line 286), store the entries with beforeData = true separately
    //the entries that go into the table (line 348) are in the bodyRows array
    //so, to render the certain special rows before, just append these rows the the start of the bodyRows,
    //followed by the data rows and then the remaining special rows


// helper function to generate differnt colors for certain columns
function filterAndGenerateFillColors(data, keywords, fillColor) {
    const filteredData = data
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => {
        const lowercaseEntry = entry.toLowerCase();
        return keywords.some(keyword => lowercaseEntry.includes(keyword.toLowerCase()));
      });
  
    const fillColors = {};
  
    filteredData.forEach(({ index }) => {
      fillColors[index] = { fillColor: fillColor };
    });
  
    return fillColors;
  }

// Function to get the current date and time in a formatted string
function getFormattedDateTime() {
    const date = new Date();
    const options = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    return date.toLocaleString("en-US", options);
  }

// function to find max possible column headers
function extractMaxKeysArr(dataRows) {
let maxKeys = 0;
let maxKeysArr = [];

const noOfDataRows = dataRows.length;

for (let k = 0; k < noOfDataRows; k++) {
    const currKeys = Object.keys(dataRows[k]).length;

    if (currKeys > maxKeys) {
    maxKeys = currKeys;
    maxKeysArr = Object.keys(dataRows[k]);
    }
}

return maxKeysArr;
}

// function to generate body rows for the table give a json of dataRows
function generateBodyRows(dataRows, maxKeysArr) {
    const bodyRows = [];
  
    for (let k = 0; k < dataRows.length; k++) {
      const rowData = dataRows[k];
      const currValArr = [];
  
      for (let l = 0; l < maxKeysArr.length; l++) {
        const key = maxKeysArr[l];
        const val = rowData[key] !== undefined ? rowData[key] : null;
        currValArr.push(val);
      }
  
      bodyRows.push(currValArr);
    }
  
    return bodyRows;
  }
  
export function ReportGenerator(reportData) {
// Keep track of y coordinate to dynamically append elements to document | initialized by 22 for first page
let yCoord = 12;

jsPDF.autoTableSetDefaults({
    headStyles: { fontStyle: "bold", textColor: "black", fillColor: [255, 255, 255], lineWidth: 0.1 },
});

// Creating document
const doc = new jsPDF();

// Creating date and time stamp
doc.setFontSize(10);
doc.setFont("helvetica", "bold");
doc.text(getFormattedDateTime(), 180, 5, "right");
doc.text(`From: ${reportData.from}`, 180, 9, "right");
doc.text(`To: ${reportData.to}`, 180, 13, "right");


// Adding document title
doc.setFontSize(20);
doc.setFont("helvetica", "bold");
doc.text(reportData.title, 105, yCoord, "center");

// Traversing through each heading
const noOfHeadings = reportData.headings.length;

for (let i = 0; i < noOfHeadings; i++) {
    // Break the page if not the first heading
    if (i !== 0) {
    doc.addPage();
    yCoord = 0;
    }

    const currentSection = reportData.headings[i];

    // Heading top line
    yCoord += 2;
    doc.line(15, yCoord, 195, yCoord);

    // Heading
    yCoord += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(currentSection.title, 105, yCoord, "center");

    // Heading bottom line
    yCoord += 2;
    doc.line(15, yCoord, 195, yCoord);

    // Traversing through each subheading
    const noOfSubheadings = reportData.headings[i].subheadings.length;

    for (let j = 0; j < noOfSubheadings; j++) {
    const currentTable = currentSection.subheadings[j];

    // Subheading/table name
    yCoord += 4;
    doc.setFontSize(10);
    doc.text(currentTable.title, 105, yCoord, "center");
    doc.setFontSize(8);

    // Extracting maxKeysArr from dataRows
    const dataRows = currentTable.dataRows;
    const maxKeysArr = extractMaxKeysArr(dataRows);

    // Preparing body rows for the table
    const noOfDataRows = dataRows.length;
    const bodyRows = generateBodyRows(dataRows, maxKeysArr);

    // Processing special rows
    const noOfSpecRows = currentTable.specialRows ? currentTable.specialRows.length : 0;
    let k = 0;

    while (k < noOfSpecRows) {
        const currValArr = [];

        for (let l = 0; l < maxKeysArr.length; l++) {
        currValArr.push(null);
        }

        while (k < noOfSpecRows) {
        const colName = currentTable.specialRows[k]["column"];
        const colIndex = maxKeysArr.indexOf(colName);

        if (colIndex === 0) {
            if (currValArr[colIndex] !== null) {
            break;
            }
        } else {
            if (currValArr[colIndex] !== null || currValArr[colIndex - 1] !== null) {
            break;
            }
        }

        if (colIndex === 0) {
            currValArr[colIndex] = `${currentTable.specialRows[k]["name"]}: ${currentTable.specialRows[k]["value"]}`;
        } else {
            currValArr[colIndex - 1] = currentTable.specialRows[k]["name"];
            currValArr[colIndex] = currentTable.specialRows[k]["value"];
        }

        k++;
        }

        bodyRows.push(currValArr);
    }

    // Creating custom column styles
    const columnStyles = filterAndGenerateFillColors(maxKeysArr, ["memo", "chk"], [242, 242, 242]);

    // Creating table
    yCoord += 4;
    doc.autoTable({
        startY: yCoord,
        head: [maxKeysArr],
        body: bodyRows,
        theme: "grid",
        styles: {
        halign: "center",
        valign: "middle",
        cellPadding: 0.5,
        },
        columnStyles: columnStyles,
        didParseCell: (data) => {
        const row = data.row.index;
        const col = data.column.index;
        const cellText = data.cell.raw;

        if (row >= noOfDataRows) {
            data.cell.styles.fillColor = [217, 217, 217];
        }
        
        if (cellText === "G") {
            data.cell.text = "GR";
            data.cell.styles.fillColor = [255, 128, 128];
          } else if (cellText === "D") {
            data.cell.text = "LESS";
            data.cell.styles.fillColor = [255, 128, 128];
          } else if (cellText === "F") {
            data.cell.text = "FULL";
            data.cell.styles.fillColor = [133, 224, 133];
          } 
          else if (cellText === "PR") {
            data.cell.text = "PART";
            data.cell.styles.fillColor = [102, 179, 255];
          } 
          else if (cellText === "N") {
            data.cell.text = "NULL";
            data.cell.styles.fillColor = [255, 128, 128];
          } 
        },
    });

    // Updating yCoord to end of created table
    yCoord = doc.lastAutoTable.finalY;

    // Handling partRows
    const partRows = currentTable.partRows;

    if (partRows && partRows.length > 0) {
    const partMaxKeysArr = extractMaxKeysArr(partRows);
    const partBodyRows = generateBodyRows(partRows, partMaxKeysArr);

    const partColumnStyles = filterAndGenerateFillColors(partMaxKeysArr, ["memo", "chk"], [242, 242, 242]);

    yCoord += 2;

    // Calculate the required width and height of the partRows table based on the content
    const partTableWidth = Math.min(doc.internal.pageSize.width - 30, doc.getStringUnitWidth(partMaxKeysArr.join("")) * 8 + 20);
    const partTableHeight = partBodyRows.length * 10 + 10;

    doc.autoTable({
        startY: yCoord,
        tableWidth: partTableWidth,
        tableHeight: partTableHeight,
        head: [partMaxKeysArr],
        body: partBodyRows,
        theme: "grid",
        styles: {
        halign: "center",
        valign: "middle",
        cellPadding: 0.5,
        },
        columnStyles: partColumnStyles,
        didParseCell: (data) => {
        const row = data.row.index;
        const col = data.column.index;
        

        if (row >= partRows.length) {
            data.cell.styles.fillColor = [217, 217, 217];
        }
    }
    });

    yCoord = doc.lastAutoTable.finalY; 
    }
    }
}

yCoord = doc.lastAutoTable.finalY + 15;

doc.save(`${reportData.title}.pdf`);
}

