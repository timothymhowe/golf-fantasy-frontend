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
