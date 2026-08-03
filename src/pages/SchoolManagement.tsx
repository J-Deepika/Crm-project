import { useState , useEffect } from "react";
import SchoolTable from "../components/SchoolTable";
import type { Subject, School, GradeBooks } from "../types.ts";


export default function SchoolManagement() {


  // ================= Books =================

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

const [subjects,setSubjects] = useState<Subject[]>(()=>{

 const savedSubjects = localStorage.getItem("subjects");

 return savedSubjects
 ? JSON.parse(savedSubjects)
 : defaultSubjects;

});
useEffect(()=>{

 localStorage.setItem(
   "subjects",
   JSON.stringify(subjects)
 );

},[subjects]);



  // ================= Create Grade Books =================

  const createGradeBooks = (
    subjectList: Subject[]
  ): GradeBooks => {


    const books: GradeBooks = {};



    subjectList.forEach((subject)=>{


      books[subject.name] = {};



      subject.mediums.forEach((medium)=>{


        books[subject.name][medium.name] =

          medium.books.map(()=>({

            date:"",
            qty:""

          }));


      });


    });


    return books;

  };

const [schools, setSchools] = useState<School[]>(() => {
  const savedSchools = localStorage.getItem("schools");

  if (savedSchools) {
    return JSON.parse(savedSchools);
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
    },
  ];
});

useEffect(() => {
  localStorage.setItem(
    "subjects",
    JSON.stringify(subjects)
  );
}, [subjects]);





  const handleInputChange = (

    schoolId:number,

    grade:string,

    subjectName:string,

    mediumName:string,

    bookIndex:number,

    field:"date"|"qty",

    value:string


  )=>{


    setSchools((prevSchools)=>


      prevSchools.map((school)=>{


        if(school.id !== schoolId){

          return school;

        }




        const currentBooks =

          school.books?.[grade]?.[subjectName]?.[mediumName];



        if(!currentBooks){

          return school;

        }




        const updatedBooks = [

          ...currentBooks

        ];





        updatedBooks[bookIndex] = {


          ...updatedBooks[bookIndex],


          [field]:value


        };







        return {


          ...school,


          books:{


            ...school.books,



            [grade]:{


              ...school.books[grade],



              [subjectName]:{


                ...school.books[grade][subjectName],



                [mediumName]:updatedBooks


              }


            }


          }


        };



      })

    );


  };







  // ================= UI =================


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