// import './App.css';
import { jsPDF } from "jspdf";
import ghtBlackLogo from "./ght_black.png";
import { autoTable } from "jspdf-autotable";

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
      return keywords.some((keyword) =>
        lowercaseEntry.includes(keyword.toLowerCase())
      );
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
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  };
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

  // Create an array to store the page numbers for each heading and subheading
  const headingPageNumbers = [];
  const subheadingPageNumbers = [];

  jsPDF.autoTableSetDefaults({
    headStyles: {
      fontStyle: "bold",
      textColor: "black",
      fillColor: [255, 255, 255],
      lineWidth: 0.1,
    },
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

    // Add GHT Branding
    doc.addImage(ghtBlackLogo, "PNG", 2, 1, 13, 13);
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

    // Adding page number to headingPageNumbers array
    headingPageNumbers.push(doc.internal.getNumberOfPages());

    // Traversing through each subheading
    const noOfSubheadings = reportData.headings[i].subheadings.length;

    for (let j = 0; j < noOfSubheadings; j++) {
      const currentTable = currentSection.subheadings[j];

      // Subheading/table name
      yCoord += 4;

      doc.setFontSize(10);
      if (currentTable.title !== "") {
        doc.text(currentTable.title, 105, yCoord, "center");
        yCoord += 4;
      }
      doc.setFontSize(8);

      // Extracting maxKeysArr from dataRows
      const dataRows = currentTable.dataRows;
      const maxKeysArr = extractMaxKeysArr(dataRows);

      // Preparing body rows for the table
      const noOfDataRows = dataRows.length;
      const bodyRows = generateBodyRows(dataRows, maxKeysArr);

      // Processing special rows
      const noOfSpecRows = currentTable.specialRows
        ? currentTable.specialRows.length
        : 0;
      let k = 0;

      // running this till all special rows are processed
      while (k < noOfSpecRows) {
        const currValArr = [];

        // pushing nulls into an array for in the space of all columns
        for (let l = 0; l < maxKeysArr.length; l++) {
          currValArr.push(null);
        }
        // try to process all special rows here when we are looping through at each iteration we wanna look through all the special rows
        while (k < noOfSpecRows) {
          // going for first special row
          const colName = currentTable.specialRows[k]["column"];
          // finding where at which column
          const colIndex = maxKeysArr.indexOf(colName);

          if (colIndex === -1) {
            // skip the element
            k++;
            break;
          }

          if (colIndex === 0) {
            if (currValArr[colIndex] !== null) {
              break;
            }
          } else {
            if (
              currValArr[colIndex] !== null ||
              currValArr[colIndex - 1] !== null
            ) {
              break;
            }
          }

          if (colIndex === 0) {
            currValArr[
              colIndex
            ] = `${currentTable.specialRows[k]["name"]}: ${currentTable.specialRows[k]["value"]}`;
          } else {
            currValArr[colIndex - 1] = currentTable.specialRows[k]["name"];
            currValArr[colIndex] = currentTable.specialRows[k]["value"];
          }

          k++;
        }

        bodyRows.push(currValArr);
      }

      // Creating custom column styles
      const columnStyles = filterAndGenerateFillColors(
        maxKeysArr,
        ["memo", "chk", "part"],
        [242, 242, 242]
      );

      // Creating table
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
          const colName = maxKeysArr[data.column.index];
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
          } else if (cellText === "PR") {
            data.cell.text = "PART";
            data.cell.styles.fillColor = [102, 179, 255];
          } else if (cellText === "N") {
            data.cell.text = "NULL";
            data.cell.styles.fillColor = [255, 128, 128];
          }

          if (colName === "days") {
            const days = parseInt(cellText);
            if (isNaN(days) == false) {
              if (days < 60) {
                data.cell.styles.fillColor = [133, 224, 133];
              } else if (days > 60 && days < 120) {
                data.cell.styles.fillColor = [255, 255, 0];
              } else if (days > 120) {
                data.cell.styles.fillColor = [255, 128, 128];
              }
            }
          }
        },
      });

      // Adding page number to subheadingPageNumbers array
      const startPageNumber = doc.lastAutoTable.startPageNumber;
      subheadingPageNumbers.push(doc.lastAutoTable.startPageNumber);
      // Updating yCoord to end of created table
      yCoord = doc.lastAutoTable.finalY;

      // Handling partRows
      const partRows = currentTable.partRows;

      if (partRows && partRows.length > 0) {
        const partMaxKeysArr = extractMaxKeysArr(partRows);
        const partBodyRows = generateBodyRows(partRows, partMaxKeysArr);

        const partColumnStyles = filterAndGenerateFillColors(
          partMaxKeysArr,
          ["memo", "chk"],
          [242, 242, 242]
        );

        yCoord += 2;

        // Calculate the required width and height of the partRows table based on the content
        const partTableWidth = Math.min(
          doc.internal.pageSize.width - 30,
          doc.getStringUnitWidth(partMaxKeysArr.join("")) * 8 + 20
        );
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
          },
        });

        yCoord = doc.lastAutoTable.finalY;
      }
    }

    // Adding Cumulative value if present
    if (currentSection.cumulative) {
      // Heading top line
      yCoord += 2;
      doc.line(15, yCoord, 195, yCoord);

      // Heading
      yCoord += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const indexText = `${currentSection.cumulative.name}: ${reportData.headings[i].cumulative.value}`;
      doc.text(indexText, 105, yCoord, "center");

      // Heading bottom line
      yCoord += 2;
      doc.line(15, yCoord, 195, yCoord);
    }
  }

  yCoord = doc.lastAutoTable.finalY + 15;

  // Adding footers
  function addFooters() {
    const pageCount = doc.internal.getNumberOfPages();
    for (var i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(String(i), 196, 285);
    }
  }

  addFooters();

  // Generate the index page
  doc.addPage();
  // get current page number
  let indexStartPageNumber = doc.internal.getNumberOfPages();

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(`${reportData.title} Index Page`, 105, 10, "center");

  // Add GHT Branding
  doc.addImage(ghtBlackLogo, "PNG", 2, 2, 15, 15);

  // Creating date and time stamp
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(getFormattedDateTime(), 195, 5, "right");
  doc.text(`From: ${reportData.from}`, 195, 9, "right");
  doc.text(`To: ${reportData.to}`, 195, 13, "right");

  const headingXCoord = 17;
  const subheadingXCoord = 37;
  const pageNumberHeadingXCoord = 157;
  const pageNumberXCoord = 177;

  // Adding Line to separate index data
  doc.line(15, 16, 195, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  let indexYCoord = 20;
  let subheadingIndex = 0;

  // Heading names and page numbers
  doc.text("Heading Names", headingXCoord, indexYCoord);
  doc.text("Page Numbers", pageNumberHeadingXCoord, indexYCoord);

  // Adding Line to separate index data
  doc.line(15, 22, 195, 22);

  for (let i = 0; i < noOfHeadings; i++) {
    const requiredHeadingSpace = 8;
    const remainingHeadingSpace = doc.internal.pageSize.height - indexYCoord;
    if (requiredHeadingSpace > remainingHeadingSpace) {
      doc.addPage();
      indexYCoord = 15;
    } else {
      indexYCoord += 8;
    }
    doc.setFont("helvetica", "bold");
    const indexHeadingText = reportData.headings[i].cumulative
      ? `${reportData.headings[i].title} | ${reportData.headings[i].cumulative.name}: ${reportData.headings[i].cumulative.value}`
      : reportData.headings[i].title;
    doc.text(indexHeadingText, headingXCoord, indexYCoord);

    doc.text(headingPageNumbers[i].toString(), pageNumberXCoord, indexYCoord);

    const noOfSubheadings = reportData.headings[i].subheadings.length;

    for (let j = 0; j < noOfSubheadings; j++) {
      if (reportData.headings[i].subheadings[j].displayOnIndex == true) {
        const requiredSpace = 4;
        const remainingSpace = doc.internal.pageSize.height - indexYCoord;

        if (requiredSpace > remainingSpace) {
          doc.addPage();
          indexYCoord = 15;
        } else {
          indexYCoord += requiredSpace;
        }

        const indexSubheadingText = reportData.headings[i].subheadings[j]
          .cumulative
          ? `${reportData.headings[i].subheadings[j].title} | ${reportData.headings[i].subheadings[j].cumulative.name}: ${reportData.headings[i].subheadings[j].cumulative.value}`
          : reportData.headings[i].subheadings[j].title;
        const subheadingYCoord = indexYCoord;
        doc.setFont("helvetica", "normal");
        doc.text(indexSubheadingText, subheadingXCoord, subheadingYCoord);
        doc.text(
          subheadingPageNumbers[subheadingIndex].toString(),
          pageNumberXCoord,
          subheadingYCoord
        );
      }
      subheadingIndex++;
    }
  }

  // finding index end page
  const indexEndPageNumber = doc.internal.getNumberOfPages();

  // total number of index pages
  const noOfIndexPages = indexEndPageNumber - indexStartPageNumber + 1;

  // Add the index pages to newDoc
  for (let i = 0; i < noOfIndexPages; i++) {
    doc.movePage(indexEndPageNumber, 1);
  }

  // Save or display the newDoc with the reordered pages
  doc.save(`${reportData.title}.pdf`);
}
