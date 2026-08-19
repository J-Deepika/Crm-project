import React from "react";
import * as XLSX from "xlsx";
import { FiUpload } from "react-icons/fi";
import type { School, Subject } from "../types.ts";


interface Props {
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  subjects: Subject[];
}

// ================= IMPORT =================

export default function ImportExcel({
  setSchools,
  subjects,
}: Props) {

  // Create Empty Books Structure
  const createBooksData = (): School["books"] => {

    const books: School["books"] = {};

    ["11", "12"].forEach((grade) => {

      books[grade] = {};

      subjects.forEach((subject) => {

        books[grade][subject.name] = {};

        subject.mediums.forEach((medium) => {

          books[grade][subject.name][medium.name] =
            medium.books.map(() => ({
              date: "",
              qty: "",
            }));

        });

      });

    });

    return books;
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {

      const data = new Uint8Array(
        event.target?.result as ArrayBuffer
      );

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const sheetName = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheetName];

      const rows: any[][] = XLSX.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
          defval: "",
        }
      );

      // Skip Header Rows
      const dataRows = rows.slice(4);

      const importedSchools: School[] = dataRows
        .filter((row) => row[1] || row[2])
        .map((row, index) => {

          const books = createBooksData();

          let col = 4;

          ["11", "12"].forEach((grade) => {

            subjects.forEach((subject) => {

              subject.mediums.forEach((medium) => {

                medium.books.forEach((_, bookIndex) => {

                  books[grade][subject.name][medium.name][bookIndex] = {
                    date: row[col] || "",
                    qty: row[col + 1] || "",
                  };

                  col += 2;

                });

              });

            });

          });

          return {

            id: Date.now() + index,

            code: row[1] || "",

            schoolName: row[2] || "",

            grade: row[3] || "11",

            books,

          };

        });

      setSchools(importedSchools);
    };

    reader.readAsArrayBuffer(file);
  };
  

  return (

    <label
      className="
      flex
      cursor-pointer
      items-center
      gap-2
      rounded-xl
      bg-emerald-600
      px-6
      py-3
      font-semibold
      text-white
      shadow-lg
      hover:bg-emerald-700
      "
    >

      <FiUpload size={20} />

      Import Excel

      <input
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileUpload}
      />

    </label>

  );
}

// ================= EXPORT =================



export function ExportExcel({
  schools,
  subjects,
  editingValues,
}: {
  schools: School[];
  subjects: Subject[];
  editingValues: Record<string, string>;
}) {

  // =====================================================
  // GET ALL BOOK ENTRIES SAFELY
  // =====================================================

  const getEntries = (data: any): any[] => {
    if (!data) {
      return [];
    }

    const result: any[] = [];

    const flatten = (value: any) => {

      if (
        value === null ||
        value === undefined
      ) {
        return;
      }

      // -------------------------------
      // OBJECT
      // -------------------------------

      if (
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        result.push(value);
        return;
      }

      // -------------------------------
      // ARRAY
      // -------------------------------

      if (Array.isArray(value)) {
        value.forEach((item) => {
          flatten(item);
        });
      }
    };

    flatten(data);

    return result;
  };


  // =====================================================
  // GET DATE / QTY VALUE
  // =====================================================

  const getFieldValue = (
    school: School,
    grade: string,
    subjectName: string,
    mediumName: string,
    bookIndex: number,
    field: "date" | "qty"
  ): string => {

    const key =
      `${school.id}-${grade}-${subjectName}-${mediumName}-${bookIndex}-${field}`;


    // ===================================================
    // FIRST PRIORITY
    // TEXTAREA CURRENT VALUE
    // ===================================================

    if (
      Object.prototype.hasOwnProperty.call(
        editingValues,
        key
      )
    ) {
      return editingValues[key] ?? "";
    }


    // ===================================================
    // GET BOOK DATA
    // ===================================================

    const data =
      school.books
        ?.[grade]
        ?.[subjectName]
        ?.[mediumName]
        ?.[bookIndex];


    // ===================================================
    // GET ENTRIES
    // ===================================================

    const entries = getEntries(data);


    // ===================================================
    // RETURN DATE / QTY
    // EACH ENTRY NEW LINE
    // ===================================================

    return entries
      .map((entry: any) =>
        String(
          entry?.[field] ?? ""
        ).trim()
      )
      .filter(
        (value) => value !== ""
      )
      .join("\n");
  };


  // =====================================================
  // GET REMARK
  // CLASS 11 / 12 SEPARATELY
  // =====================================================

  const getRemark = (
    school: School,
    grade: string
  ): string => {

    // -----------------------------------------------
    // Remark editing key
    // -----------------------------------------------

    const key =
      `${school.id}-${grade}-remark`;


    // -----------------------------------------------
    // FIRST PRIORITY
    // Current editing value
    // -----------------------------------------------

    if (
      Object.prototype.hasOwnProperty.call(
        editingValues,
        key
      )
    ) {
      return editingValues[key] ?? "";
    }


    // -----------------------------------------------
    // SECOND PRIORITY
    // School saved remark
    // -----------------------------------------------

    return (
      school.remarks?.[grade] ?? ""
    );
  };


  // =====================================================
  // EXPORT FUNCTION
  // =====================================================

  const handleExport = (
    type: "filled" | "empty"
  ) => {

    const rows: any[][] = [];


    // =====================================================
    // HEADER 1
    // SUBJECT
    // =====================================================

    const row1 = [
      "S.No",
      "Code",
      "School Name",
      "Grade",
    ];


    subjects.forEach((subject) => {

      row1.push(
        subject.name
      );


      let count = 0;


      subject.mediums.forEach(
        (medium) => {

          count +=
            medium.books.length * 2;

        }
      );


      for (
        let i = 1;
        i < count;
        i++
      ) {
        row1.push("");
      }

    });


    // =====================================================
    // REMARK LAST COLUMN
    // =====================================================

    row1.push("Remark");


    rows.push(row1);


    // =====================================================
    // HEADER 2
    // MEDIUM
    // =====================================================

    const row2 = [
      "",
      "",
      "",
      "",
    ];


    subjects.forEach((subject) => {

      subject.mediums.forEach(
        (medium) => {

          row2.push(
            medium.name
          );


          for (
            let i = 1;
            i <
            medium.books.length * 2;
            i++
          ) {
            row2.push("");
          }

        }
      );

    });


    // Remark column blank
    row2.push("");


    rows.push(row2);


    // =====================================================
    // HEADER 3
    // BOOK
    // =====================================================

    const row3 = [
      "",
      "",
      "",
      "",
    ];


    subjects.forEach((subject) => {

      subject.mediums.forEach(
        (medium) => {

          medium.books.forEach(
            (book) => {

              row3.push(
                book.name
              );

              row3.push("");

            }
          );

        }
      );

    });


    // Remark column blank
    row3.push("");


    rows.push(row3);


    // =====================================================
    // HEADER 4
    // DATE / QTY
    // =====================================================

    const row4 = [
      "",
      "",
      "",
      "",
    ];


    subjects.forEach((subject) => {

      subject.mediums.forEach(
        (medium) => {

          medium.books.forEach(() => {

            row4.push("Date");
            row4.push("Qty");

          });

        }
      );

    });


    // Remark column blank
    row4.push("");


    rows.push(row4);


    // =====================================================
    // DATA
    // =====================================================

    let serialNo = 1;


    schools.forEach((school) => {

      // ===================================================
      // CLASS 11 + 12
      // ===================================================

      (["11", "12"] as const).forEach(
        (grade) => {

          // =================================================
          // CHECK FILLED DATA
          // =================================================

          let hasFilledData = false;


          // -------------------------------------------------
          // CHECK DATE / QTY
          // -------------------------------------------------

          subjects.forEach((subject) => {

            subject.mediums.forEach(
              (medium) => {

                medium.books.forEach(
                  (_, bookIndex) => {

                    const date =
                      getFieldValue(
                        school,
                        grade,
                        subject.name,
                        medium.name,
                        bookIndex,
                        "date"
                      );


                    const qty =
                      getFieldValue(
                        school,
                        grade,
                        subject.name,
                        medium.name,
                        bookIndex,
                        "qty"
                      );


                    if (
                      date.trim() !== "" ||
                      qty.trim() !== ""
                    ) {
                      hasFilledData = true;
                    }

                  }
                );

              }
            );

          });


          // -------------------------------------------------
          // CHECK REMARK
          // -------------------------------------------------

          const remark =
            getRemark(
              school,
              grade
            );


          if (
            remark.trim() !== ""
          ) {
            hasFilledData = true;
          }


          // =================================================
          // FILLED FILTER
          // =================================================

          if (
            type === "filled" &&
            !hasFilledData
          ) {
            return;
          }


          // =================================================
          // EMPTY FILTER
          // =================================================

          if (
            type === "empty" &&
            hasFilledData
          ) {
            return;
          }


          // =================================================
          // CREATE SCHOOL ROW
          // =================================================

          const row: any[] = [

            serialNo++,

            school.code ?? "",

            school.schoolName ?? "",

            grade,

          ];


          // =================================================
          // SUBJECT DATA
          // =================================================

          subjects.forEach((subject) => {

            subject.mediums.forEach(
              (medium) => {

                medium.books.forEach(
                  (_, bookIndex) => {

                    // =====================================
                    // DATE
                    // =====================================

                    const date =
                      getFieldValue(
                        school,
                        grade,
                        subject.name,
                        medium.name,
                        bookIndex,
                        "date"
                      );


                    // =====================================
                    // QTY
                    // =====================================

                    const qty =
                      getFieldValue(
                        school,
                        grade,
                        subject.name,
                        medium.name,
                        bookIndex,
                        "qty"
                      );


                    // =====================================
                    // PUSH DATE
                    // =====================================

                    row.push(date);


                    // =====================================
                    // PUSH QTY
                    // =====================================

                    row.push(qty);

                  }
                );

              }
            );

          });


          // =================================================
          // REMARK LAST
          // =================================================

          row.push(
            remark
          );


          // =================================================
          // ADD ROW
          // =================================================

          rows.push(row);

        }
      );

    });


    // =====================================================
    // NO RECORD
    // =====================================================

    if (rows.length === 4) {

      alert(
        type === "filled"
          ? "No filled Date, Qty or Remark records were found."
          : "No empty records were found."
      );

      return;
    }


    // =====================================================
    // CREATE WORKSHEET
    // =====================================================

    const worksheet =
      XLSX.utils.aoa_to_sheet(
        rows
      );


    // =====================================================
    // MERGES
    // =====================================================

    const merges: any[] = [];


    let col = 4;


    subjects.forEach((subject) => {

      let subjectSize = 0;


      subject.mediums.forEach(
        (medium) => {

          subjectSize +=
            medium.books.length * 2;

        }
      );


      // ================================================
      // SUBJECT MERGE
      // ================================================

      if (subjectSize > 0) {

        merges.push({

          s: {
            r: 0,
            c: col,
          },

          e: {
            r: 0,
            c:
              col +
              subjectSize -
              1,
          },

        });

      }


      // ================================================
      // MEDIUM MERGE
      // ================================================

      let mediumCol = col;


      subject.mediums.forEach(
        (medium) => {

          const mediumSize =
            medium.books.length * 2;


          if (mediumSize > 0) {

            merges.push({

              s: {
                r: 1,
                c: mediumCol,
              },

              e: {
                r: 1,
                c:
                  mediumCol +
                  mediumSize -
                  1,
              },

            });

          }


          mediumCol +=
            mediumSize;

        }
      );


      col +=
        subjectSize;

    });


    // =====================================================
    // REMARK MERGE
    // =====================================================

    const remarkColumn = col;


    merges.push({

      s: {
        r: 0,
        c: remarkColumn,
      },

      e: {
        r: 3,
        c: remarkColumn,
      },

    });


    worksheet["!merges"] =
      merges;


    // =====================================================
    // TOTAL COLUMNS
    // =====================================================

    const totalBookColumns =
      subjects.reduce(
        (total, subject) => {

          return (
            total +
            subject.mediums.reduce(
              (
                mediumTotal,
                medium
              ) => {

                return (
                  mediumTotal +
                  medium.books.length * 2
                );

              },
              0
            )
          );

        },
        0
      );


    const totalColumns =
      4 +
      totalBookColumns +
      1; // Remark


    // =====================================================
    // COLUMN WIDTH
    // =====================================================

    const columnWidths: any[] = [

      // S.No
      {
        wch: 8,
      },

      // Code
      {
        wch: 15,
      },

      // School Name
      {
        wch: 30,
      },

      // Grade
      {
        wch: 10,
      },

    ];


    // -----------------------------------------------
    // Book columns
    // -----------------------------------------------

    for (
      let i = 4;
      i < totalColumns - 1;
      i++
    ) {

      columnWidths.push({
        wch: 18,
      });

    }


    // -----------------------------------------------
    // Remark width
    // -----------------------------------------------

    columnWidths.push({
      wch: 30,
    });


    worksheet["!cols"] =
      columnWidths;


    // =====================================================
    // ROW HEIGHT
    // =====================================================

    worksheet["!rows"] = [];


    for (
      let rowIndex = 4;
      rowIndex < rows.length;
      rowIndex++
    ) {

      const row =
        rows[rowIndex];


      let maxLines = 1;


      row.forEach((value) => {

        if (
          value !== null &&
          value !== undefined
        ) {

          const text =
            String(value);


          const lineCount =
            text.split("\n").length;


          if (
            lineCount > maxLines
          ) {
            maxLines =
              lineCount;
          }

        }

      });


      worksheet["!rows"][
        rowIndex
      ] = {

        hpt:
          Math.max(
            20,
            maxLines * 18
          ),

      };

    }


    // =====================================================
    // WORKBOOK
    // =====================================================

    const workbook =
      XLSX.utils.book_new();


    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "School Data"
    );


    // =====================================================
    // FILE NAME
    // =====================================================

    const fileName =
      type === "filled"
        ? "School_Filled_Report.xlsx"
        : "School_Empty_Report.xlsx";


    // =====================================================
    // DOWNLOAD
    // =====================================================

    XLSX.writeFile(
      workbook,
      fileName
    );

  };


  // =====================================================
  // BUTTONS
  // =====================================================

  return (

    <div className="flex gap-3">

      {/* ================================================
          EXPORT FILLED
      ================================================ */}

      <button
        type="button"
        onClick={() =>
          handleExport("filled")
        }
        className="
          rounded-xl
          bg-green-600
          px-6
          py-3
          font-semibold
          text-white
          shadow-lg
          hover:bg-green-700
        "
      >
        Export Filled
      </button>


      {/* ================================================
          EXPORT EMPTY
      ================================================ */}

      <button
        type="button"
        onClick={() =>
          handleExport("empty")
        }
        className="
          rounded-xl
          bg-yellow-500
          px-6
          py-3
          font-semibold
          text-white
          shadow-lg
          hover:bg-yellow-600
        "
      >
        Export Empty
      </button>

    </div>

  );
}