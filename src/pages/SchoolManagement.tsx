import { useState , useEffect } from "react";
import SchoolTable from "../components/SchoolTable";
import type { Subject, School, GradeBooks } from "../types.ts";


export default function SchoolManagement() {


  // ================= Books =================

  const createBooks = () => [
    {
      id: 1,
      name: "Book 1"
    },
    {
      id: 2,
      name: "Book 2"
    },
    {
      id: 3,
      name: "Book 3"
    },
    {
      id: 4,
      name: "Book 4"
    },
  ];



  // ================= Medium =================

  const createMediums = () => [
    {
      id: 1,
      name: "English Medium",
      books: createBooks()
    },

    {
      id: 2,
      name: "Hindi Medium",
      books: createBooks()
    }
  ];




  // ================= Subjects =================

const defaultSubjects: Subject[] = [
  {
    id:1,
    name:"Science",
    mediums:createMediums()
  },
  {
    id:2,
    name:"Commerce",
    mediums:createMediums()
  },
  {
    id:3,
    name:"Arts",
    mediums:createMediums()
  },
  {
    id:4,
    name:"Agriculture",
    mediums:createMediums()
  },
  {
    id:5,
    name:"Bharti",
    mediums:createMediums()
  }
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

useEffect(() => {
  localStorage.setItem(
    "schools",
    JSON.stringify(schools)
  );
}, [schools]);







  // ================= Input Change =================


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