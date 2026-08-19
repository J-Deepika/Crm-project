import type React from "react";

// =====================================================
// BOOK
// =====================================================

export interface Book {
  id: number;
  name: string;
}

// =====================================================
// MEDIUM
// =====================================================

export interface Medium {
  id: number;
  name: string;
  books: Book[];
}

// =====================================================
// SUBJECT
// =====================================================

export interface Subject {
  id: number;
  name: string;
  mediums: Medium[];
}

// =====================================================
// GRADE
// =====================================================

export type Grade = "11" | "12";

// =====================================================
// DATE + QTY ENTRY
// =====================================================

export interface BookEntry {
  date: string;
  qty: string;
}

// =====================================================
// MEDIUM BOOKS
//
// One medium can have multiple books.
// Each book has multiple date/qty entries.
//
// Example:
//
// {
//   "English Medium": [
//     [
//       { date: "12/06/26", qty: "10" },
//       { date: "13/06/26", qty: "20" }
//     ],
//     [
//       { date: "14/06/26", qty: "15" }
//     ]
//   ]
// }
//
// Outer array = books
// Inner array = entries of that book
// =====================================================

export interface MediumBooks {
  [mediumName: string]: BookEntry[][];
}

// =====================================================
// GRADE BOOKS
// =====================================================

export interface GradeBooks {
  [subjectName: string]: MediumBooks;
}

// =====================================================
// SCHOOL
// =====================================================

export interface School {
  id: number;

  // School Code
  code?: string;

  // School Name
  schoolName: string;

  // Grade
  grade?: Grade;

  // Remarks for Class 11 and 12
  remarks?: {
    "11"?: string;
    "12"?: string;
  };

  // Books
  books: {
    [grade: string]: GradeBooks;
  };
}

// =====================================================
// SCHOOL TABLE PROPS
// =====================================================

export interface SchoolTableProps {
  subjects: Subject[];

  schools: School[];

  setSchools: React.Dispatch<
    React.SetStateAction<School[]>
  >;

  setSubjects: React.Dispatch<
    React.SetStateAction<Subject[]>
  >;

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