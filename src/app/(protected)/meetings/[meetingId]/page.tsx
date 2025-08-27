import React from 'react'
import IssueList from './issue-list';
type Props={
    params: Promise<{meetingId: string}>
}



const MeetingDetailsPage = async({params}:Props) => {
    const {meetingId}= await params;
  return (
    <div >
         
        <IssueList meetingId={meetingId}/>
    </div>
  )
}

export default MeetingDetailsPage;