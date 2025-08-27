import { db } from "@/server/db";
import { Provider } from "@radix-ui/react-tooltip";
import {Octokit} from "octokit";
import axios from "axios";
import { aiSummariseCommit } from "./gemini";

export const octokit= new Octokit({
    auth: process.env.GITHUB_TOKEN
})



type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};


export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
  // Normalize URL (remove trailing slash + .git)
  let cleanUrl = githubUrl.trim();
  if (cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);
  if (cleanUrl.endsWith(".git")) cleanUrl = cleanUrl.replace(/\.git$/, "");

  const [owner, repo] = cleanUrl
    .replace("https://github.com/", "")
    .split("/");

  if (!owner || !repo) {
    throw new Error(`Invalid Github url: ${githubUrl}`);
  }

  const { data } = await octokit.rest.repos.listCommits({ owner, repo });

  const sortedCommits = data.sort(
    (a: any, b: any) =>
      new Date(b.commit.author.date).getTime() -
      new Date(a.commit.author.date).getTime()
  ) as any[];

  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit.message ?? "",
    commitAuthorName: commit.commit.author.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit.author.date ?? "",
  }));
};


 
export const pollCommits= async (projectId:string)=>{
    const {project, githubUrl}= await fetchProjectGithubUrl(projectId)
    const commitHashes= await getCommitHashes(githubUrl)
    const unpocessedCommits= await filterUnprocessedCommits(projectId, commitHashes);
    const summaryResponse= await Promise.allSettled(unpocessedCommits.map(commit=>{
        return summariseCommit(githubUrl, commit.commitHash)
    }))
    const summaries= summaryResponse.map((response)=>{
        if(response.status==='fulfilled'){
            return response.value as string
        }
        return ""
    })

    const commits= await db.commit.createMany({
        data:summaries.map((summary,index)=>{
            // console.log(`processing commit ${index}`)
            return {
                projectId:projectId,
                commitHash:unpocessedCommits[index]!.commitHash,
                commitMessage:unpocessedCommits[index]!.commitMessage,
                commitAuthorName:unpocessedCommits[index]!.commitAuthorName,
                commitAuthorAvatar :unpocessedCommits[index]!.commitAuthorAvatar,
                commitDate:unpocessedCommits[index]!.commitDate,
                summary
            }
        }
    )
    })
    // console.log(unpocessedCommits);
    return unpocessedCommits
}


async function summariseCommit(githubUrl: string, commitHash:string){
    const {data} = await axios.get(`${githubUrl}/commit/${commitHash}.diff`,{
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    })
    return await aiSummariseCommit(data) || ""
}




async function fetchProjectGithubUrl(projectId:string){
    
  console.log("DEBUG - Fetching githubUrl for:", projectId);
    const project= await db.project.findUnique({
        where: {
            id:projectId
        },
        select:{
            githubUrl:true
        }
    })
     console.log("DEBUG - Result from DB:", project);
    if(!project?.githubUrl){
        throw new Error("Project does not have a github url")
    }
    return {project,githubUrl:project?.githubUrl}
}

async function filterUnprocessedCommits(projectId:string, commitHashes:Response[]){
    const processedCommits= await db.commit.findMany({
        where:{
            projectId:projectId
        }
    })
    const unpocessedCommits= commitHashes.filter((commit)=> !processedCommits.some((processedCommit)=>processedCommit.commitHash===commit.commitHash))
    return unpocessedCommits
}

 