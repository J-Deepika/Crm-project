import React, { useState } from "react";
import TableHeader from "./TableHeader";
import ImportExcel, { ExportExcel } from "./Excel";
import type { Subject, School, MediumBooks, Book } from "../types";
import { FiTrash2 } from "react-icons/fi";
import Pagination from "./Pagination";
interface SchoolTableProps {
  subjects: Subject[];
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
handleInputChange: (
  schoolId: number,
  grade: string,
  subjectName: string,
  mediumName: string,
  bookIndex: number,
  entryIndex: number,
  field: "date" | "qty",
  value: string
) => void;
}

export default function SchoolTable({
  subjects,
  schools,
  setSchools,
  setSubjects,
  handleInputChange,
}: SchoolTableProps) {
const [search, setSearch] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 5;
const [selectedSubject, setSelectedSubject] = useState("All");


React.useEffect(() => {
  if (
    selectedSubject !== "All" &&
    subjects.length &&
    !subjects.find((s) => s.name === selectedSubject)
  ) {
    setSelectedSubject("All");
  }
}, [subjects]);

const visibleSubjects =
  selectedSubject === "All"
    ? subjects
    : subjects.filter(
        (subject) => subject.name === selectedSubject
      );

const searchText = search.trim().toLowerCase();

const filteredSchools = schools.filter((school) => {
  // School Code
  const code = (school.code ?? "").toLowerCase();

  // School Name
  const schoolName = (school.schoolName ?? "").toLowerCase();

  // Grade / Class
  const grade = (school.grade ?? "").toLowerCase();

  // Complete books data ko searchable text bana rahe hain
  const booksText = JSON.stringify(school.books ?? "").toLowerCase();

  return (
    code.includes(searchText) ||
    schoolName.includes(searchText) ||
    grade.includes(searchText) ||
    booksText.includes(searchText)
  );
});
const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;

const currentSchools = filteredSchools.slice(
  indexOfFirst,
  indexOfLast
);

const addSchool = () => {
  // =========================================
  // SCHOOL CODE - OPTIONAL
  // =========================================

  const codeInput = prompt("Enter School Code (Optional)");

  const code = codeInput?.trim() || "";

  // =========================================
  // SCHOOL NAME - REQUIRED
  // =========================================

  const schoolNameInput = prompt("Enter School Name");

  if (!schoolNameInput?.trim()) {
    return;
  }

  const schoolName = schoolNameInput.trim();

  // =========================================
  // CREATE BOOKS FOR CLASS 11 AND 12
  // =========================================

  const books = {} as School["books"];

  (["11", "12"] as const).forEach((grade) => {
    books[grade] = {};

    subjects.forEach((subject) => {
      books[grade][subject.name] = {} as MediumBooks;

      subject.mediums.forEach((medium) => {
        books[grade][subject.name][medium.name] =
          medium.books.map(() => [
            {
              date: "",
              qty: "",
            },
          ]);
      });
    });
  });

  // =========================================
  // CREATE NEW SCHOOL
  // =========================================

 const newSchool: School = {
  id: Date.now(),
  code,
  schoolName,
  grade: "11",

  remarks: {
    "11": "",
    "12": "",
  },

  books,
};

  // =========================================
  // ADD SCHOOL
  // =========================================

  setSchools((prev) => [
    ...prev,
    newSchool,
  ]);
};
const addSubject = () => {
  const subjectName = prompt("Enter Subject Name");
  if (!subjectName) return;

  const mediumNames = [
    "English Medium",
    "Hindi Medium",
  ];

  

  const bookInput = prompt(
    "Enter Book Names separated by comma"
  );

  if (!bookInput) return;

  // Comma se books separate hongi
  const bookNames = bookInput
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name !== "");

  if (bookNames.length === 0) return;

  const books: Book[] = bookNames.map((bookName, index) => ({
    id: Date.now() + index,
    name: bookName,
  }));

  // =====================================================
  // CHECK EXISTING SUBJECT
  // =====================================================

  const existingSubject = subjects.find(
    (s) =>
      s.name.toLowerCase() ===
      subjectName.toLowerCase()
  );

 

  if (existingSubject) {

    setSubjects((prev) =>
      prev.map((subject) => {

        if (
          subject.name !==
          existingSubject.name
        ) {
          return subject;
        }

        const updatedMediums = [
          ...subject.mediums,
        ];

        mediumNames.forEach(
          (mediumName) => {

            const index =
              updatedMediums.findIndex(
                (m) =>
                  m.name.toLowerCase() ===
                  mediumName.toLowerCase()
              );

            if (index >= 0) {

              updatedMediums[index] = {
                ...updatedMediums[index],

                books: [
                  ...updatedMediums[index].books,
                  ...books,
                ],
              };

            } else {

              updatedMediums.push({
                id: Date.now() + Math.random(),
                name: mediumName,
                books: [...books],
              });

            }
          }
        );

        return {
          ...subject,
          mediums: updatedMediums,
        };
      })
    );

    // ===================================================
    // UPDATE SCHOOL BOOK DATA
    // ===================================================

    setSchools((prev) =>
      prev.map((school) => {

        const updatedBooks = {
          ...school.books,
        };

        (["11", "12"] as const).forEach(
          (grade) => {

            // Grade create
            if (!updatedBooks[grade]) {
              updatedBooks[grade] = {} as any;
            }

            // Subject create
            if (
              !updatedBooks[grade][subjectName]
            ) {
              updatedBooks[grade][subjectName] =
                {} as MediumBooks;
            }

            mediumNames.forEach(
              (mediumName) => {

                const old =
                  updatedBooks[grade][subjectName][
                    mediumName
                  ] || [];

                updatedBooks[grade][subjectName][
                  mediumName
                ] = [
                  ...old,

                  ...books.map(() => [
                    {
                      date: "",
                      qty: "",
                    },
                  ]),
                ];
              }
            );
          }
        );

        return {
          ...school,
          books: updatedBooks,
        };
      })
    );

  } else {

    // ===================================================
    // NEW SUBJECT
    // ===================================================

    const newSubject: Subject = {
      id: Date.now(),

      name: subjectName,

      mediums: mediumNames.map(
        (medium, index) => ({
          id: Date.now() + index,

          name: medium,

          books: [...books],
        })
      ),
    };

    setSubjects((prev) => [
      ...prev,
      newSubject,
    ]);

    // ===================================================
    // UPDATE SCHOOL BOOK DATA
    // ===================================================

    setSchools((prev) =>
      prev.map((school) => {

        const updatedBooks = {
          ...school.books,
        };

        (["11", "12"] as const).forEach(
          (grade) => {

            // Grade create
            if (!updatedBooks[grade]) {
              updatedBooks[grade] = {} as any;
            }

            // Subject create
            if (
              !updatedBooks[grade][subjectName]
            ) {
              updatedBooks[grade][subjectName] =
                {} as MediumBooks;
            }

            mediumNames.forEach(
              (mediumName) => {

                updatedBooks[grade][subjectName][
                  mediumName
                ] = books.map(() => [
                  {
                    date: "",
                    qty: "",
                  },
                ]);

              }
            );
          }
        );

        return {
          ...school,
          books: updatedBooks,
        };
      })
    );
  }
};

const deleteBook = (
  subjectName: string,
  mediumName: string,
  bookId: number
) => {
  if (!window.confirm("Delete this book?")) return;

  // Find book index before removing
  const subject = subjects.find((s) => s.name === subjectName);
  const medium = subject?.mediums.find((m) => m.name === mediumName);
  const bookIndex =
    medium?.books.findIndex((b) => b.id === bookId) ?? -1;

  // Remove from subjects
  setSubjects((prev) =>
    prev.map((subject) => {
      if (subject.name !== subjectName) return subject;

      return {
        ...subject,
        mediums: subject.mediums.map((medium) => {
          if (medium.name !== mediumName) return medium;

          return {
            ...medium,
            books: medium.books.filter((book) => book.id !== bookId),
          };
        }),
      };
    })
  );

  // Remove from all schools
 if (bookIndex !== -1) {
  setSchools((prev) =>
    prev.map((school) => {
      const updatedBooks = { ...school.books };

      (["11", "12"] as const).forEach((grade) => {
        updatedBooks[grade][subjectName][mediumName] =
          updatedBooks[grade][subjectName][mediumName].filter(
            (_: any, index: number) => index !== bookIndex
          );
      });

      return {
        ...school,
        books: updatedBooks,
      };
    })
  );
}
};

const deleteSchool = (schoolId: number) => {
  if (!window.confirm("Delete this school?")) return;

  setSchools((prev) =>
    prev.filter((school) => school.id !== schoolId)
  );
};
const deleteSubject = (subjectName: string) => {
  if (!window.confirm("Delete this subject?")) return;

  setSubjects((prev) =>
    prev.filter((subject) => subject.name !== subjectName)
  );

  setSchools((prev) =>
    prev.map((school) => {
    const updatedBooks = { ...school.books };

(["11", "12"] as const).forEach((grade) => {
  delete updatedBooks[grade][subjectName];
});

      return {
        ...school,
        books: updatedBooks,
      };
    })
  );
};
const deleteMedium = (
  subjectName: string,
  mediumName: string
) => {
  if (!window.confirm("Delete this medium?")) return;

  setSubjects((prev) =>
    prev.map((subject) => {
      if (subject.name !== subjectName) return subject;

      return {
        ...subject,
        mediums: subject.mediums.filter(
          (medium) => medium.name !== mediumName
        ),
      };
    })
  );

  setSchools((prev) =>
    prev.map((school) => {
     const updatedBooks = { ...school.books };

(["11", "12"] as const).forEach((grade) => {
  delete updatedBooks[grade][subjectName][mediumName];
});

return {
  ...school,
  books: updatedBooks,
};
    })
  );
};
const handleTextareaChange = (
  schoolId: number,
  grade: string,
  subjectName: string,
  mediumName: string,
  bookIndex: number,
  field: "date" | "qty",
  value: string
) => {
  const values = value.split("\n");

  values.forEach((item, entryIndex) => {
    handleInputChange(
      schoolId,
      grade,
      subjectName,
      mediumName,
      bookIndex,
      entryIndex,
      field,
      item.trim()
    );
  });
};
   
  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <input
          type="text"
          placeholder="Search School Code / School Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-80"
        />
    <select
  value={selectedSubject}
  onChange={(e) => setSelectedSubject(e.target.value)}
  className="border rounded px-3 py-2 ml-3"
>
  <option value="All">All Subjects</option>

  {subjects.map((subject) => (
    <option key={subject.id} value={subject.name}>
      {subject.name}
    </option>
  ))}
</select>


        <div className="flex gap-3">
          <button
            onClick={addSchool}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            + Add School
          </button>

          <button
            onClick={addSubject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            + Add Subject
          </button>

          <ImportExcel
            setSchools={setSchools}
            subjects={subjects}
          />

 <ExportExcel
  schools={schools}
  subjects={subjects}
/>
        </div>
      </div>

     <div className="overflow-x-auto border rounded-lg relative">
        <table className="border-collapse w-full">
<TableHeader
 subjects={visibleSubjects}

 setSubjects={setSubjects}
 deleteSubject={deleteSubject}
 deleteMedium={deleteMedium}
 deleteBook={deleteBook}
/>
  <tbody>
  {currentSchools.map((school, index) => (
    <React.Fragment key={school.id}>
     {(["11", "12"] as const).map((grade, rowIndex) => (
        <tr key={`${school.id}-${grade}`}>
          {/* S.No */}
          {rowIndex === 0 && (
            <td rowSpan={2} className="border p-2 text-center">
              {indexOfFirst + index + 1}
            </td>
          )}

          {/* School Code */}
          {rowIndex === 0 && (
            <td rowSpan={2} className="border p-2">
              <input
                value={school.code || ""}
                onChange={(e) =>
                  setSchools((prev) =>
                    prev.map((s) =>
                      s.id === school.id
                        ? { ...s, code: e.target.value }
                        : s
                    )
                  )
                }
                className="w-24 bg-transparent outline-none"
              />
            </td>
          )}

          {/* School Name */}
        {rowIndex === 0 && (
  <td
    rowSpan={2}
    className="
      sticky
      left-0
      z-20
      border
      border-black
      border-r-2
      bg-white
      p-2
      min-w-[250px]
    "
  >
    <div className="flex items-center justify-between">
      <span>{school.schoolName}</span>

      <button
        type="button"
        onClick={() => deleteSchool(school.id)}
      >
        <FiTrash2 className="text-red-600" />
      </button>
    </div>
  </td>
)}
          {/* Class */}
          <td className="border p-2 text-center ">
            {grade}
          </td>

          {/* Subject Data */}
          {visibleSubjects.map((subject) =>
            subject.mediums.map((medium) =>
              medium.books.map((book, bookIndex) => {
             const rawBookEntries =
  school.books?.[grade]?.[subject.name]?.[
    medium.name
  ]?.[bookIndex];

const bookEntries = Array.isArray(rawBookEntries)
  ? rawBookEntries
  : rawBookEntries
    ? [rawBookEntries]
    : [
        {
          date: "",
          qty: "",
        },
      ];

                return (
                  <React.Fragment
                    key={`${school.id}-${grade}-${subject.id}-${medium.id}-${book.id}`}
                  >

                    


<td className="border p-1 align-top">
  <textarea
    value={bookEntries
      .map((entry: any) => entry?.date || "")
      .join("\n")}
    onChange={(e) => {
      handleTextareaChange(
        school.id,
        grade,
        subject.name,
        medium.name,
        bookIndex,
        "date",
        e.target.value
      );

      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    onFocus={(e) => {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    rows={1}
    className="
      w-full
      min-w-[120px]
      min-h-[24px]
      resize-none
      overflow-hidden
      bg-transparent
      outline-none
      text-center
      leading-6
      whitespace-pre-wrap
      block
    "
  />
</td>

{/* ================= QTY ================= */}
<td className="border p-1 align-top">
  <textarea
    value={bookEntries
      .map((entry: any) =>
        typeof entry === "object" && entry !== null
          ? entry.qty || ""
          : ""
      )
      .join("\n")}
    onChange={(e) => {
      handleTextareaChange(
        school.id,
        grade,
        subject.name,
        medium.name,
        bookIndex,
        "qty",
        e.target.value
      );

      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    onFocus={(e) => {
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    }}
    rows={1}
    className="
      w-20
      min-h-[24px]
      resize-none
      overflow-hidden
      bg-transparent
      outline-none
      text-center
      leading-6
      whitespace-pre-wrap
      block
    "
  />
</td>
                  </React.Fragment>
                );
              })
            )
          )}
    
{/* ================= REMARK ================= */}
<td className="border p-1 align-top min-w-[180px]">
  <textarea
    value={school.remarks?.[grade] ?? ""}
    onChange={(e) =>
      setSchools((prev) =>
        prev.map((s) =>
          s.id === school.id
            ? {
                ...s,
                remarks: {
                  ...s.remarks,
                  [grade]: e.target.value,
                },
              }
            : s
        )
      )
    }
    placeholder={`Remark for Class ${grade}`}
    rows={2}
    className="
      w-full
      min-h-[50px]
      resize-none
      overflow-hidden
      bg-transparent
      outline-none
      text-left
      leading-6
    "
  />
</td>
        </tr>
      ))}
    </React.Fragment>
  ))}
</tbody>
        </table>
        <Pagination
  currentPage={currentPage}
  totalItems={filteredSchools.length}
  itemsPerPage={itemsPerPage}
  onPageChange={setCurrentPage}
/>
      </div>
    </div>
  );
}