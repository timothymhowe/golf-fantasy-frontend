"use client"
import Head from 'next/head'
import PageLayout from '../components/hg-layout'
import '../globals.css'
import {redirect} from 'next/navigation'
import GuardedPage from '../components/guarded-page'

// import { auth } from 'firebase/auth';

export default function Home() {
  return (
    <GuardedPage>
    <PageLayout>
      
    </PageLayout>
    </GuardedPage>
  )
};


// import { getAuth } from "firebase/auth";
// import PageLayout from '../components/hg-layout'
// import '../globals.css'


// import { app } from "../../config/firebaseConfig";

// import { redirect, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";


// try{
//     var auth = getAuth(app);
// } catch (error) {
//     console.log("Error authenticating.")
//     console.log(error); 

// }

// export default function Home() {


//   const router = useRouter();
//   const [isUserValid, setIsUserValid] = useState(false);

//   useEffect(() => {
//     const checkAuth = () => {
//       auth.onAuthStateChanged((user) => {
//         if (user) {
//           setIsUserValid(true);
//           console.log("This is the logged in user", user);
//         } else {
//           console.log("no user found");
//           router.push("/login");
//         }
//       });
//     };

//     checkAuth();
//   }, []);

//   if (isUserValid) {
//     var email = auth.currentUser.email;
//     return (
//       <>
//       {email}
//       <PageLayout>
      
//       </PageLayout>
//       </>

//     );
 

  
// };
// }
