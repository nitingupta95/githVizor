'use server'

import { streamText } from 'ai'
import { createStreamableValue } from '@ai-sdk/rsc'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateEmbedding } from '@/lib/gemini'
import { db } from '@/server/db'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

export async function askQuestion(question: string, projectId: string) {
  const stream = createStreamableValue()

  const queryVector = await generateEmbedding(question)
  const vectorQuery = `[${queryVector.join(',')}]`

  const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
      1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) AS similarity
    FROM "SourceCodeEmbedding"
    WHERE 1 - ("summaryEmbedding" <=> ${vectorQuery}::vector) > .2
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
  `as {fileName:string; sourceCode:string;summary:string}[]
console.log('DEBUG - Vector query result:', result);


  let context = ''
  for (const doc of result) {
    context += `source: ${doc.fileName}\ncode content: ${doc.sourceCode}\nsummary of file: ${doc.summary}\n\n`
  }

  ;(async () => {
    const { textStream } = await streamText({
      model: google('gemini-1.5-flash'),
      prompt: `
You are an AI code assistant who answers questions about the codebase. Your target audience is a technical intern who is learning.
AI assistant is a brand new, powerful, human-like artificial intelligence.
The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
AI is a well-behaved and well-mannered individual.
AI is always friendly, kind, and inspiring, and is eager to provide vivid and thoughtful responses to the user.
AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in the codebase.
If the question is asking about code or a specific file, AI will provide the detailed answer, giving step-by-step instructions.

START CONTEXT BLOCK
${context}
END OF CONTEXT BLOCK

START QUESTION
${question}
END OF QUESTION

AI assistant will take into account any CONTEXT BLOCK that is provided in a conversation.
If the context does not provide the answer to question, the AI assistant will say, "I'm sorry, but I don't know the answer."
AI assistant will not apologize for previous responses, but instead will indicate new information was gained.
AI assistant will not invent anything that is not drawn directly from the context.
Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when answering, make sure there is no ambiguity.
`,
    })

    for await (const delta of textStream) {
      stream.update(delta)
    }
    stream.done()
  })()

  return {
    output: stream.value, // This is a Proxy-like server object
    filesReferences: result,
  }
}



console.log(askQuestion('what model are there in the schema?','cmef33mvp0000uy7fnw0o2wzh'))



