import type React from "react";



export interface Book {
  id: number;
  name: string;
}



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
// DATE + QTY ENTRY
//
// One book can have multiple entries
//
// Example:
// [
//   { date: "12/06/26", qty: "10" },
//   { date: "13/06/26", qty: "20" }
// ]
// =====================================================

export interface BookEntry {
  date: string;
  qty: string;
}



export interface MediumBooks {
  [mediumName: string]: BookEntry[][];
}



export interface GradeBooks {
  [subjectName: string]: MediumBooks;
}


export interface School {
  id: number;

  // School Code
  code?: string;

  // School Name
  schoolName: string;


 remarks?: {
    "11"?: string;
    "12"?: string;
  };




  books: {
    [grade: string]: GradeBooks;
  };
}



export interface SchoolTableProps {
  // Subjects
  subjects: Subject[];

  // Schools
  schools: School[];

  // Update Schools
  setSchools: React.Dispatch<
    React.SetStateAction<School[]>
  >;

  // Update Subjects
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