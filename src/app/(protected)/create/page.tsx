"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react'; 
import { Info } from 'lucide-react';
import React from 'react'
import { useForm } from "react-hook-form";
import { toast } from 'sonner';

type FormInput = {
  repoUrl: string
  projectName: string
  githubToken?: string
}

const Createpage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createproject= api.project.createProject.useMutation();
  const checkcredits = api.project.checkCredits.useMutation();

  const refetch= useRefetch();


  const  onSubmit=async(data: FormInput)=> {
    // window.alert(JSON.stringify(data,null,2))
    if(!!checkcredits.data){
      await createproject.mutateAsync({
          githubUrl: data.repoUrl,
          name: data.projectName,
          githubToken: data.githubToken
      },{
          onSuccess: () => {
              toast.success('project created successfully')
              refetch();
              reset();
          },
          onError: () => {
              toast.error('Failed to create project')
          }
      })
    }else{
      checkcredits.mutate({
        githubUrl: data.repoUrl,
        githubToken: data.githubToken
      })
    } 
  }


  const hasEnoughCredits= checkcredits.data?.userCredits ? checkcredits.data.fileCount <= (checkcredits.data?.userCredits || 0) : true;


  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="flex flex-col md:flex-row items-center gap-16 w-full max-w-4xl">
        {/* Left Image */}
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAEIqjyhIaPZHr1gpjcIOAIhHWq86nTxDz3g&s" alt="Developer" className="w-64 h-auto" />

        {/* Right Form Section */}
        <div className="w-full md:w-1/2 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Link your GitHub Repository
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter the URL of your repository to link it to Dionysus
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('projectName', { required: true })}
              placeholder="Project Name"
              required
            />
            <Input
              {...register('repoUrl', { required: true })}
              placeholder="Github URL"
              type='url'
              required
            />
            <Input
              {...register('githubToken')}
              placeholder="Github Token (Optional)"
            />

            {checkcredits.data && (
              <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
                <div className='flex items-center gap-2'>
                  <Info className='size-4'></Info>
                  <p className='text-sm '>You will be charged <strong>{checkcredits.data?.fileCount}</strong> credits for this repository</p>
                </div>
                <p className='text-sm text-blue ml-6'>You have <strong>{checkcredits.data?.userCredits}</strong> credits remaining</p>
              </div>
            )}

            <Button type="submit" disabled={createproject.isPending || checkcredits.isPending || !hasEnoughCredits} className="w-full mt-4">
             {!!checkcredits.data ? 'Create Project' : 'Check Credits'}
            </Button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default Createpage;
