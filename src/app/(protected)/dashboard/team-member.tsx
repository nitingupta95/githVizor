"use client"
import useProject from '@/hooks/use-project';
import { api } from '@/trpc/react';
import React from 'react'

const TeamMember = () => {
    const {projectId}= useProject();
    const {data:members}= api.project.getTeamMembers.useQuery({projectId: projectId ?? ""});
  return (
    <div className='flex items-center gap-2'>
        {members?.map((member)=>(
            <img key={member.id} src={member.User.imageUrl ?? ""} alt={member.User.firstName ?? ""} height={30} width={30} className='w-8 h-8 rounded-full'/>
             
        ))}
        
    </div>
  )
}

export default TeamMember