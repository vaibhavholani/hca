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
function filterAndGenerateFillColors(data, keyword, fillColor) {
    const filteredData = data
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => entry.toLowerCase().includes(keyword.toLowerCase()));
  
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

export function ReportGenerator(reportData) {

    //keep track of y coordinate to dynamically append elements to document | initialized by 22 for first page
    let yCoord = 12;

    jsPDF.autoTableSetDefaults(
        {
            headStyles: {fontStyle: "bold", textColor: "black", fillColor: [255, 255, 255], lineWidth: 0.1},
        }
    )

    //creating document
    const doc = new jsPDF();

    // creading date and time stamp

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(getFormattedDateTime(), 180, 10, "right");

    //adding document title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(reportData.title, 105, yCoord, "center");

    //traversing through each heading
    const noOfHeadings = reportData.headings.length;

    for (let i = 0; i < noOfHeadings; i++) {

        //break the page if not the first heading
        if (i !== 0) {

            doc.addPage();
            yCoord = 0;
        }

        const currentSection = reportData.headings[i];

        //heading top line
        yCoord += 2;
        doc.line(15, yCoord, 195, yCoord);

        //heading
        yCoord += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(currentSection.title, 105, yCoord, "center");

        //heading bottom line
        yCoord += 2;
        doc.line(15, yCoord, 195, yCoord);

        //traversing through each subheading
        const noOfSubheadings = reportData.headings[i].subheadings.length;

        for (let j = 0; j < noOfSubheadings; j++) {

            const currentTable = currentSection.subheadings[j];

            //subheading/table name
            yCoord += 4;
            doc.setFontSize(10);
            doc.text(currentTable.title, 105, yCoord, "center");
            doc.setFontSize(8);

            //pre processing json to extract data rows
            let maxKeys = 0;
            let maxKeysArr = [];
            
            const noOfDataRows = currentTable.dataRows.length;

            for (let k = 0; k < noOfDataRows; k++) {
            
                const currKeys = Object.keys(currentTable.dataRows[k]).length;
            
                if (currKeys > maxKeys) {
            
                    maxKeys = currKeys;
                    maxKeysArr = Object.keys(currentTable.dataRows[k]);
                }
            }
            
            const bodyRows = [];

            //traverse all data rows
            for (let k = 0; k < noOfDataRows; k++) {
            
                const currValArr = [];
            
                //search for each key's value
                    //append to row entry if found, else set to null
                for (let l = 0; l < maxKeysArr.length; l++) {
            
                    const key = maxKeysArr[l];
                    const val = currentTable.dataRows[k][key];
            
                    if (val === undefined) {
            
                        currValArr.push(null);
                    }
            
                    else {  
            
                        currValArr.push(val);
                    }
                }
                
                bodyRows.push(currValArr);
            }

            //processing special rows
            const noOfSpecRows = currentTable.specialRows ? currentTable.specialRows.length : 0;

            let k = 0;

            while (k < noOfSpecRows) {

                const currValArr = [];

                //initialize a special row with all nulls
                for (let l = 0; l < maxKeys; l++) {

                    currValArr.push(null);
                }
                
                while (k < noOfSpecRows) {

                    //get index of which column to enter the special value in
                    const colName = currentTable.specialRows[k]["column"];
                    const colIndex = maxKeysArr.indexOf(colName);

                    //if a special value already occupies the required column position, break and create a new row to accomodate it in same col position
                    if (colIndex === 0) {

                        if (currValArr[colIndex] !== null) {

                            break;
                        }
                    }

                    else {

                        if ((currValArr[colIndex] !== null) || (currValArr[colIndex-1] !== null)) {

                            break;
                        }
                    }

                    if (colIndex === 0) {

                        currValArr[colIndex] = `${currentTable.specialRows[k]["name"]}: ${currentTable.specialRows[k]["value"]}`;
                    }

                    else {

                        currValArr[colIndex-1] = currentTable.specialRows[k]["name"];
                        currValArr[colIndex] = currentTable.specialRows[k]["value"];
                    }

                    k++;
                }

                bodyRows.push(currValArr);
            }

            // creating custom column styles
            const columnStyles = filterAndGenerateFillColors(maxKeysArr, "memo", [242, 242, 242]);

            //creating table
            yCoord += 4;
            doc.autoTable(
                {
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
                        
                        // if (row === 0 && col === 3) {
                        //     data.cell.styles.fillColor = [242, 242, 242];
                        // }

                        if (row >= noOfDataRows) {

                            data.cell.styles.fillColor = [217, 217, 217];
                        }
                    }
                }
            )

            //setting yCoord to end of created table
            yCoord = doc.lastAutoTable.finalY;
        }
    }

    yCoord = doc.lastAutoTable.finalY + 15;
    

    doc.save(`${reportData.title}.pdf`);

}
