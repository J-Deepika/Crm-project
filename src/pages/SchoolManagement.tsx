import { useEffect, useState } from "react";
import SchoolTable from "../components/SchoolTable";
import type { Subject, School } from "../types.ts";

export default function SchoolManagement() {
  // =====================================================
  // DEFAULT SUBJECTS
  // =====================================================

  const defaultSubjects: Subject[] = [
    {
      id: 1,
      name: "Science",
      mediums: [
        {
          id: 1,
          name: "English Medium",
          books: [
            { id: 1, name: "Physics" },
            { id: 2, name: "Chemistry" },
            { id: 3, name: "Biology" },
            { id: 4, name: "Mathematics" },
          ],
        },
        {
          id: 2,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "Physics" },
            { id: 2, name: "Chemistry" },
            { id: 3, name: "Biology" },
            { id: 4, name: "Mathematics" },
          ],
        },
      ],
    },

    {
      id: 2,
      name: "Commerce",
      mediums: [
        {
          id: 1,
          name: "English Medium",
          books: [
            { id: 1, name: "Business Studies" },
            { id: 2, name: "Accountancy" },
            { id: 3, name: "Economics" },
            { id: 4, name: "Bookkeeping" },
          ],
        },
        {
          id: 2,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "Business Studies" },
            { id: 2, name: "Accountancy" },
            { id: 3, name: "Economics" },
            { id: 4, name: "Bookkeeping" },
          ],
        },
      ],
    },

    {
      id: 3,
      name: "Arts",
      mediums: [
        {
          id: 1,
          name: "English Medium",
          books: [
            { id: 1, name: "Political Science" },
            { id: 2, name: "Geography" },
            { id: 3, name: "History" },
            { id: 4, name: "Economics" },
            { id: 5, name: "Sociology" },
          ],
        },
        {
          id: 2,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "Political Science" },
            { id: 2, name: "Geography" },
            { id: 3, name: "History" },
            { id: 4, name: "Economics" },
            { id: 5, name: "Sociology" },
          ],
        },
      ],
    },

    {
      id: 4,
      name: "Agriculture",
      mediums: [
        {
          id: 1,
          name: "English Medium",
          books: [
            { id: 1, name: "Horticulture" },
            { id: 2, name: "Animal Husbandry" },
            { id: 3, name: "Crop Production" },
          ],
        },
        {
          id: 2,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "Horticulture" },
            { id: 2, name: "Animal Husbandry" },
            { id: 3, name: "Crop Production" },
          ],
        },
      ],
    },

    {
      id: 5,
      name: "Bharati",
      mediums: [
        {
          id: 1,
          name: "English Medium",
          books: [
            { id: 1, name: "Hindi" },
            { id: 2, name: "English" },
            { id: 3, name: "Sanskrit" },
          ],
        },
        {
          id: 2,
          name: "Hindi Medium",
          books: [
            { id: 1, name: "Hindi" },
            { id: 2, name: "English" },
            { id: 3, name: "Sanskrit" },
          ],
        },
      ],
    },
  ];

  // =====================================================
  // SUBJECTS
  // =====================================================

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const savedSubjects = localStorage.getItem("subjects");

    if (savedSubjects) {
      try {
        return JSON.parse(savedSubjects);
      } catch {
        return defaultSubjects;
      }
    }

    return defaultSubjects;
  });

  // Save subjects
  useEffect(() => {
    localStorage.setItem(
      "subjects",
      JSON.stringify(subjects)
    );
  }, [subjects]);

  

  const createGradeBooks = (subjectList: Subject[]) => {
    const books: any = {};

    subjectList.forEach((subject) => {
      books[subject.name] = {};

      subject.mediums.forEach((medium) => {
        /*
          Each book gets an ARRAY of entries.
        */

        books[subject.name][medium.name] =
          medium.books.map(() => [
            {
              date: "",
              qty: "",
            },
          ]);
      });
    });

    return books;
  };

  // =====================================================
  // SCHOOLS
  // =====================================================

  const [schools, setSchools] = useState<School[]>(() => {
    const savedSchools = localStorage.getItem("schools");

    if (savedSchools) {
      try {
        return JSON.parse(savedSchools);
      } catch {
        // If localStorage data is corrupted,
        // create default school.
      }
    }

    return [
      {
        id: 1,
        code: "SC001",
        schoolName: "ABC Public School",
        grade: "11",

        books: {
          "11": createGradeBooks(subjects),
          "12": createGradeBooks(subjects),
        },
      } as School,
    ];
  });

  // =====================================================
  // SAVE SCHOOLS
  // =====================================================

  useEffect(() => {
    localStorage.setItem(
      "schools",
      JSON.stringify(schools)
    );
  }, [schools]);

  // =====================================================
  // HANDLE DATE + QTY CHANGE
  // =====================================================

 const handleInputChange = (
  schoolId: number,
  grade: string,
  subjectName: string,
  mediumName: string,
  bookIndex: number,
  entryIndex: number,
  field: "date" | "qty",
  value: string
) => {
  setSchools((prevSchools) =>
    prevSchools.map((school) => {
      if (school.id !== schoolId) {
        return school;
      }

      const updatedBooks: any = structuredClone(
        school.books || {}
      );

      // Grade
      if (!updatedBooks[grade]) {
        updatedBooks[grade] = {};
      }

      // Subject
      if (!updatedBooks[grade][subjectName]) {
        updatedBooks[grade][subjectName] = {};
      }

      // Medium
      if (!updatedBooks[grade][subjectName][mediumName]) {
        updatedBooks[grade][subjectName][mediumName] = [];
      }

      const books =
        updatedBooks[grade][subjectName][mediumName];

      // Book
      if (!books[bookIndex]) {
        books[bookIndex] = [];
      }

      // Entry
      if (!books[bookIndex][entryIndex]) {
        books[bookIndex][entryIndex] = {
          date: "",
          qty: "",
        };
      }

      // Date / Qty update
      books[bookIndex][entryIndex] = {
        ...books[bookIndex][entryIndex],
        [field]: value,
      };

      return {
        ...school,
        books: updatedBooks,
      };
    })
  );
};

  // =====================================================
  // UI
  // =====================================================

  return (
    <SchoolTable
      subjects={subjects}
      setSubjects={setSubjects}
      schools={schools}
      setSchools={setSchools}
      handleInputChange={handleInputChange}
    />
  );
}