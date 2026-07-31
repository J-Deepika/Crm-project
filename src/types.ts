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

export interface Subject {
  id: number;
  name: string;
  mediums: Medium[];
}

export interface BookEntry {
  date: string;
  qty: string;
}

export interface MediumBooks {
  [mediumName: string]: BookEntry[];
}

export interface GradeBooks {
  [subjectName: string]: MediumBooks;
}

export interface School {
  id: number;
  code?: string;
  schoolName: string;

  // Selected grade (11 / 12)
  grade: string;

  // Grade -> Subject -> Medium -> BookEntry[]
  books: {
    [grade: string]: GradeBooks;
  };
}

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
    field: "date" | "qty",
    value: string
  ) => void;
}