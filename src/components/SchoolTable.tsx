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

const filteredSchools = schools.filter((school) =>
  (school.code ?? "").toLowerCase().includes(searchText) ||
  school.schoolName.toLowerCase().includes(searchText)
);
const indexOfLast = currentPage * itemsPerPage;
const indexOfFirst = indexOfLast - itemsPerPage;

const currentSchools = filteredSchools.slice(
  indexOfFirst,
  indexOfLast
);


 const addSchool = () => {
  const code = prompt("Enter School Code");
  if (!code) return;

  const schoolName = prompt("Enter School Name");
  if (!schoolName) return;

  const grade = prompt("Enter Grade");
  if (!grade) return;

const books = {} as School["books"];

["11","12"].forEach((grade)=>{

  books[grade] = {};

  subjects.forEach((subject)=>{

  books[grade][subject.name] = {} as MediumBooks;

    subject.mediums.forEach((medium)=>{

      books[grade][subject.name][medium.name] =
        medium.books.map(()=>({
          date:"",
          qty:""
        }));

    });

  });

});

  const newSchool: School = {
    id: Date.now(),
    code,
    schoolName,
    grade,
    books,
  };

  setSchools((prev) => [...prev, newSchool]);
};

const addSubject = () => {
  const subjectName = prompt("Enter Subject Name");
  if (!subjectName) return;

const mediumNames = [
  "English Medium",
  "Hindi Medium",
];

  const books: Book[] = [];

  while (true) {
    const bookName = prompt("Enter Book Name");

    if (bookName) {
      books.push({
        id: Date.now() + books.length,
        name: bookName,
      });
    }

    if (!window.confirm("Add another book?")) break;
  }

  const existingSubject = subjects.find(
    (s) => s.name.toLowerCase() === subjectName.toLowerCase()
  );

  if (existingSubject) {
    // Subject already exists
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.name !== existingSubject.name) return subject;

        const updatedMediums = [...subject.mediums];

        mediumNames.forEach((mediumName) => {
          const index = updatedMediums.findIndex(
            (m) => m.name.toLowerCase() === mediumName.toLowerCase()
          );

          if (index >= 0) {
            updatedMediums[index] = {
              ...updatedMediums[index],
              books: [...updatedMediums[index].books, ...books],
            };
          } else {
            updatedMediums.push({
              id: Date.now() + Math.random(),
              name: mediumName,
              books: [...books],
            });
          }
        });

        return {
          ...subject,
          mediums: updatedMediums,
        };
      })
    );

    setSchools((prev) =>
      prev.map((school) => {
        const updatedBooks = { ...school.books };

       (["11", "12"] as const).forEach((grade) => {
          if (!updatedBooks[grade][subjectName]) {
            updatedBooks[grade][subjectName] = {} as MediumBooks;
          }

          mediumNames.forEach((mediumName) => {
            const old =
              updatedBooks[grade][subjectName][mediumName] || [];

            updatedBooks[grade][subjectName][mediumName] = [
              ...old,
              ...books.map(() => ({
                date: "",
                qty: "",
              })),
            ];
          });
        });

        return {
          ...school,
          books: updatedBooks,
        };
      })
    );
  } else {
    // New Subject
    const newSubject: Subject = {
      id: Date.now(),
      name: subjectName,
      mediums: mediumNames.map((medium, index) => ({
        id: Date.now() + index,
        name: medium,
        books: [...books],
      })),
    };

    setSubjects((prev) => [...prev, newSubject]);

    setSchools((prev) =>
      prev.map((school) => {
        const updatedBooks = { ...school.books };

        (["11", "12"] as const).forEach((grade) => {
          mediumNames.forEach((mediumName) => {
            updatedBooks[grade][subjectName][mediumName] =
              books.map(() => ({
                date: "",
                qty: "",
              }));
          });
        });

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
              className="sticky left-0 z-20 border bg-white p-2 min-w-[250px]"
            >
              <div className="flex items-center justify-between">
                <span>{school.schoolName}</span>

                <button onClick={() => deleteSchool(school.id)}>
                  <FiTrash2 className="text-red-600" />
                </button>
              </div>
            </td>
          )}

          {/* Class */}
          <td className="border p-2 text-center">
            {grade}
          </td>

          {/* Subject Data */}
          {visibleSubjects.map((subject) =>
            subject.mediums.map((medium) =>
              medium.books.map((book, bookIndex) => {
                const bookData =
                  school.books?.[grade]?.[subject.name]?.[
                    medium.name
                  ]?.[bookIndex] || {
                    date: "",
                    qty: "",
                  };

                return (
                  <React.Fragment
                    key={`${school.id}-${grade}-${subject.id}-${medium.id}-${book.id}`}
                  >
                    <td className="border p-1">
                      <input
                        type="date"
                        value={bookData.date}
                        onChange={(e) =>
                          handleInputChange(
                            school.id,
                            grade,
                            subject.name,
                            medium.name,
                            bookIndex,
                            "date",
                            e.target.value
                          )
                        }
                        className="w-full bg-transparent outline-none"
                      />
                    </td>

                    <td className="border p-1">
                      <input
                        type="number"
                        value={bookData.qty}
                        onChange={(e) =>
                          handleInputChange(
                            school.id,
                            grade,
                            subject.name,
                            medium.name,
                            bookIndex,
                            "qty",
                            e.target.value
                          )
                        }
                        className="w-16 text-center bg-transparent outline-none"
                      />
                    </td>
                  </React.Fragment>
                );
              })
            )
          )}
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