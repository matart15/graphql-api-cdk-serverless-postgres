import Post from './Post'
import { db, uuidv4 } from './db'

async function createPost(post: Post) {
  if (!post.id) post.id = uuidv4()
  try {
    return await db.post.create({ data: post })
  } catch (err) {
    console.log('Postgres error: ', err)
    return null
  }
}

export default createPost
