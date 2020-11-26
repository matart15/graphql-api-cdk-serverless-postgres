import Post from './Post'
import { getDB, uuidv4 } from './db'

async function createPost(post: Post) {
  const db = await getDB()
  if (!post.id) post.id = uuidv4()
  try {
    return await db.post.create({ data: post })
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default createPost
