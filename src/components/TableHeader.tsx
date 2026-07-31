import React from "react";
import { FiTrash2 } from "react-icons/fi";
import type { Subject, Book } from "../types";

interface TableHeaderProps {
  subjects: Subject[];
  selectedGrade: string;

  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;

  deleteSubject: (subjectName: string) => void;

  deleteMedium: (
    subjectName: string,
    mediumName: string
  ) => void;

  deleteBook: (
    subjectName: string,
    mediumName: string,
    bookId: number
  ) => void;
}


export default function TableHeader({

  subjects,
  selectedGrade,
  setSubjects,
  deleteSubject,
  deleteMedium,
  deleteBook,

}: TableHeaderProps) {



const updateSubjectName = (
  oldName:string,
  value:string
)=>{

 setSubjects(prev=>

  prev.map(subject=>

   subject.name === oldName
   ?
   {
    ...subject,
    name:value
   }
   :
   subject

  )

 );

};



const updateMediumName = (
 subjectName:string,
 oldMedium:string,
 value:string
)=>{


setSubjects(prev=>

prev.map(subject=>{


if(subject.name !== subjectName)
return subject;


return {

...subject,

mediums:subject.mediums.map(medium=>

medium.name===oldMedium

?
{
...medium,
name:value
}

:
medium

)

};


})

);


};





const updateBookName = (

subjectName:string,
mediumName:string,
bookId:number,
value:string

)=>{


setSubjects(prev=>

prev.map(subject=>{


if(subject.name!==subjectName)
return subject;



return {


...subject,


mediums:subject.mediums.map(medium=>{


if(medium.name!==mediumName)
return medium;



return {


...medium,


books:medium.books.map(book=>

book.id===bookId

?
{
...book,
name:value
}

:
book

)


};


})


};


})


);



};





return (

<thead className="bg-gray-100">


<tr>


<th rowSpan={4} className="border p-2">
S.No
</th>


<th rowSpan={4} className="border p-2">
School Code
</th>


<th
  rowSpan={4}
  className="sticky left-0 z-30 bg-gray-100 border p-2 min-w-[250px]"
>
  School Name
</th>


<th rowSpan={4} className="border p-2 min-w-[80px]">
  Class
</th>



{subjects.map(subject=>(

<th

key={subject.id}

colSpan={
subject.mediums.reduce(
(total,medium)=>
total + medium.books.length*2,
0
)
}

className="border p-2"

>


<div className="flex items-center justify-center gap-2">


<input

value={subject.name}

onChange={(e)=>
updateSubjectName(
subject.name,
e.target.value
)
}

className="w-24 text-center bg-transparent outline-none"

/>


<button
onClick={()=>deleteSubject(subject.name)}
>

<FiTrash2 className="text-red-600"/>

</button>


</div>


</th>

))}


</tr>





<tr>


{subjects.map(subject=>

subject.mediums.map(medium=>(


<th

key={medium.id}

colSpan={medium.books.length*2}

className="border p-2"

>


<div className="flex justify-center gap-2">


<input

value={medium.name}

onChange={(e)=>

updateMediumName(

subject.name,

medium.name,

e.target.value

)

}

className="w-32 text-center bg-transparent outline-none"

/>



<button

onClick={()=>deleteMedium(
subject.name,
medium.name
)}

>

<FiTrash2 className="text-red-500"/>

</button>


</div>


</th>


))

)}


</tr>






<tr>


{subjects.map(subject=>

subject.mediums.map(medium=>

medium.books.map((book:Book)=>(


<th

key={book.id}

colSpan={2}

className="border p-2"

>


<div className="flex justify-center gap-2">


<input

value={book.name}

onChange={(e)=>

updateBookName(

subject.name,

medium.name,

book.id,

e.target.value

)

}

className="w-24 text-center bg-transparent outline-none"

/>



<button

onClick={()=>deleteBook(

subject.name,

medium.name,

book.id

)}

>

<FiTrash2 className="text-red-500"/>

</button>



</div>


</th>


))

)

)}



</tr>






<tr>


{subjects.map(subject=>

subject.mediums.map(medium=>

medium.books.map(book=>(


<React.Fragment

key={`${subject.id}-${medium.id}-${book.id}`}

>


<th className="border p-2">
Date
</th>


<th className="border p-2">
Qty
</th>


</React.Fragment>


))

)

)}


</tr>



</thead>


)

}