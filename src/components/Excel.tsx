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
}: {
  schools: School[];
  subjects: Subject[];
}) {
    const handleExport = (
    type: "filled" | "empty"
  ) => {

    const rows: any[][] = [];

    // ================= FILTER =================

    const filteredSchools = schools.filter((school) => {

      let hasFilled = false;

      subjects.forEach((subject) => {

        subject.mediums.forEach((medium) => {

          medium.books.forEach((_, bookIndex) => {

            const data =
              school.books?.[school.grade]
                ?.[subject.name]
                ?.[medium.name]
                ?.[bookIndex];

            if (
              data &&
              (data.date.trim() !== "" ||
                data.qty.trim() !== "")
            ) {
              hasFilled = true;
            }

          });

        });

      });

      return type === "filled"
        ? hasFilled
        : !hasFilled;

    });

    // ================= HEADER 1 =================

    const row1 = [
      "S.No",
      "Code",
      "School Name",
      "Grade",
    ];

    subjects.forEach((subject) => {

      row1.push(subject.name);

      let count = 0;

      subject.mediums.forEach((medium) => {
        count += medium.books.length * 2;
      });

      for (let i = 1; i < count; i++) {
        row1.push("");
      }

    });

    rows.push(row1);

    // ================= HEADER 2 =================

    const row2 = [
      "",
      "",
      "",
      "",
    ];

    subjects.forEach((subject) => {

      subject.mediums.forEach((medium) => {

        row2.push(medium.name);

        for (
          let i = 1;
          i < medium.books.length * 2;
          i++
        ) {
          row2.push("");
        }

      });

    });

    rows.push(row2);

    // ================= HEADER 3 =================

    const row3 = [
      "",
      "",
      "",
      "",
    ];

    subjects.forEach((subject) => {

      subject.mediums.forEach((medium) => {

        medium.books.forEach((book) => {

          row3.push(book.name);
          row3.push("");

        });

      });

    });

    rows.push(row3);

    // ================= HEADER 4 =================

    const row4 = [
      "",
      "",
      "",
      "",
    ];

    subjects.forEach((subject) => {

      subject.mediums.forEach((medium) => {

        medium.books.forEach(() => {

          row4.push("Date");
          row4.push("Qty");

        });

      });

    });

    rows.push(row4);

    // ================= DATA =================

    filteredSchools.forEach((school, index) => {

      const row: any[] = [
        index + 1,
        school.code,
        school.schoolName,
        school.grade,
      ];

      subjects.forEach((subject) => {

        subject.mediums.forEach((medium) => {

          medium.books.forEach((_, bookIndex) => {

            const data =
              school.books?.[school.grade]
                ?.[subject.name]
                ?.[medium.name]
                ?.[bookIndex] || {
                  date: "",
                  qty: "",
                };

            row.push(data.date);
            row.push(data.qty);

          });

        });

      });

      rows.push(row);

    });
        // ================= MERGE CELLS =================

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    const merges: any[] = [];

    let col = 4;

    subjects.forEach((subject) => {

      let subjectSize = 0;

      subject.mediums.forEach((medium) => {
        subjectSize += medium.books.length * 2;
      });

      // Subject Merge
      merges.push({
        s: { r: 0, c: col },
        e: { r: 0, c: col + subjectSize - 1 },
      });

      let mediumCol = col;

      subject.mediums.forEach((medium) => {

        const mediumSize = medium.books.length * 2;

        // Medium Merge
        merges.push({
          s: { r: 1, c: mediumCol },
          e: { r: 1, c: mediumCol + mediumSize - 1 },
        });

        mediumCol += mediumSize;

      });

      col += subjectSize;

    });

    worksheet["!merges"] = merges;

    // ================= Workbook =================

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "School Data"
    );

    XLSX.writeFile(
      workbook,
      type === "filled"
        ? "School_Filled_Report.xlsx"
        : "School_Empty_Report.xlsx"
    );

  };

  return (

    <div className="flex gap-3">

      <button
        onClick={() => handleExport("filled")}
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

      <button
        onClick={() => handleExport("empty")}
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