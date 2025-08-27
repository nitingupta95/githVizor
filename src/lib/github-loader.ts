import {GithubRepoLoader} from "@langchain/community/document_loaders/web/github"
import { Document } from "node_modules/@langchain/core/dist/documents"
import { generateEmbedding, summariseCode } from "./gemini"
import { db } from "@/server/db"
import { Octokit } from "octokit"


const getFileCount= async(path:string, octokit:Octokit,githubOwner:string, githubRepo:string, acc:number)=>{
  const {data}= await octokit.rest.repos.getContent({
    owner: githubOwner,
    repo: githubRepo,
    path
  })
  if(!Array.isArray(data) && data.type==='file') return acc+1;
  if(Array.isArray(data)) {
    let fileCount=0;
    const directories:string[]=[];
    for(const item of data){
      if(item.type==='dir'){
        directories.push(item.path)
      }else{
        fileCount+=1
      }
    }
    if(directories.length > 0) {
      const directoriesCount= await Promise.all(directories.map(dir=>getFileCount(dir, octokit, githubOwner, githubRepo, 0)))
      fileCount+= directoriesCount.reduce((acc,count)=>acc+ count,0)
    }
    return acc+fileCount
  }
  return acc;
}


export const checkCredits= async(githubUrl:string, githubToken?:string)=>{

  const octokit= new Octokit({auth: githubToken})
  const githubOwner= githubUrl.split('/')[3]
  const githubRepo= githubUrl.split('/')[4]
  if(!githubOwner || !githubRepo) return 0;
  
  const fileCount= await getFileCount('', octokit, githubOwner, githubRepo, 0)
  return fileCount;


}


export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
  const loader = new GithubRepoLoader(githubUrl, {
    accessToken: githubToken || '',
    branch: 'main',
    ignoreFiles: ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'],
    recursive: true,
    unknown: 'warn',
    maxConcurrency: 5
  })

  const docs = await loader.load()
  return docs
}


export const indexGithubRepo = async (
  projectId: string,
  githubUrl: string,
  githubToken?: string
) => {
  // Load repo docs
  const docs = await loadGithubRepo(githubUrl, githubToken);

  // Generate embeddings
  const allEmbeddings = await generateEmbeddings(docs);

  // Process in parallel
  await Promise.allSettled(
    allEmbeddings.map(async (embedding, index) => {
      console.log(`processing ${index + 1} of ${allEmbeddings.length}`);
      if (!embedding) return;

      // Insert row first
      const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
        data: {
          summary: embedding.summary,
          sourceCode: embedding.sourceCode,
          fileName: embedding.fileName,
          projectId,
        },
      });

      // Update with embedding vector
      await db.$executeRaw`
      UPDATE "SourceCodeEmbedding"
      SET "summaryEmbedding" = ${embedding.embedding}::vector
      WHERE "id" = ${sourceCodeEmbedding.id}
    `;

    })
  );
};


const generateEmbeddings= async(docs:Document[])=>{
    return await Promise.all(docs.map(async doc=>{
        const summary =await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return {summary,embedding,
            sourceCode:JSON.parse(JSON.stringify(doc.pageContent)),
            fileName:doc.metadata.source,
        }
    }))
}

// console.log(await loadGithubRepo('https://github.com/nitingupta95/SPMS'))
